<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

test('password recovery returns the same response for unknown emails', function () {
    Mail::fake();

    $response = $this->postJson(route('password-recovery.code'), [
        'email' => 'not-registered@example.com',
    ]);

    $response
        ->assertOk()
        ->assertExactJson([
            'message' => 'If an account exists for that email, a verification code has been sent.',
            'retry_after' => 60,
        ]);

    Mail::assertNothingOutgoing();
});

test('a valid one-time code resets the password and cannot be reused', function () {
    $user = User::factory()->create([
        'email' => 'resident@example.com',
        'password' => 'old-password',
    ]);
    $code = null;

    Mail::shouldReceive('raw')
        ->once()
        ->withArgs(function (string $body, callable $callback) use (&$code): bool {
            preg_match('/code is (\d{6})/', $body, $matches);
            $code = $matches[1] ?? null;

            return $code !== null;
        });

    $this->postJson(route('password-recovery.code'), [
        'email' => $user->email,
    ])
        ->assertOk()
        ->assertJsonPath(
            'message',
            'If an account exists for that email, a verification code has been sent.',
        );

    $recovery = DB::table('password_recovery_codes')
        ->where('email', $user->email)
        ->first();

    expect($code)->toBeString()
        ->and(Hash::check($code, $recovery->code_hash))->toBeTrue()
        ->and($recovery->code_hash)->not->toBe($code);

    $verification = $this->postJson(route('password-recovery.verify'), [
        'email' => $user->email,
        'code' => $code,
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Verification successful.');

    $resetToken = $verification->json('reset_token');

    $this->postJson(route('password-recovery.reset'), [
        'email' => $user->email,
        'reset_token' => $resetToken,
        'password' => 'new-secure-password',
        'password_confirmation' => 'new-secure-password',
    ])
        ->assertOk()
        ->assertJsonPath('message', 'Your password has been reset successfully.');

    $user->refresh();
    expect(Hash::check('new-secure-password', $user->password))->toBeTrue()
        ->and(Hash::check('old-password', $user->password))->toBeFalse();

    $this->postJson(route('password-recovery.verify'), [
        'email' => $user->email,
        'code' => $code,
    ])->assertUnprocessable();

    $this->postJson(route('password-recovery.reset'), [
        'email' => $user->email,
        'reset_token' => $resetToken,
        'password' => 'another-password',
        'password_confirmation' => 'another-password',
    ])->assertUnprocessable();
});

test('expired recovery codes are rejected', function () {
    $user = User::factory()->create();
    $code = '481516';

    DB::table('password_recovery_codes')->insert([
        'email' => $user->email,
        'code_hash' => Hash::make($code),
        'attempts' => 0,
        'expires_at' => now()->subMinute(),
        'created_at' => now()->subMinutes(11),
        'updated_at' => now()->subMinutes(11),
    ]);

    $this->postJson(route('password-recovery.verify'), [
        'email' => $user->email,
        'code' => $code,
    ])
        ->assertUnprocessable()
        ->assertJsonPath(
            'errors.code.0',
            'The verification code is invalid or expired. Request a new code and try again.',
        );
});

test('incorrect recovery codes are limited to five attempts', function () {
    $user = User::factory()->create();
    $code = '481516';

    DB::table('password_recovery_codes')->insert([
        'email' => $user->email,
        'code_hash' => Hash::make($code),
        'attempts' => 0,
        'expires_at' => now()->addMinutes(10),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    foreach (range(1, 5) as $attempt) {
        $this->postJson(route('password-recovery.verify'), [
            'email' => $user->email,
            'code' => '000000',
        ])->assertUnprocessable();
    }

    $this->postJson(route('password-recovery.verify'), [
        'email' => $user->email,
        'code' => $code,
    ])->assertUnprocessable();

    expect(
        DB::table('password_recovery_codes')->where('email', $user->email)->value('attempts'),
    )->toBe(5);
});
