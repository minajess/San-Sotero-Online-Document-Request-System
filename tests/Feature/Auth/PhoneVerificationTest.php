<?php

use App\Models\User;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

function setupSemaphoreFake(): void
{
    config(['services.semaphore.api_key' => 'test-api-key']);
    Http::fake([
        'api.semaphore.co/api/v4/messages' => Http::response([
            ['message_id' => 123],
        ], 200),
    ]);
}

function codeFromSemaphoreRequest(): string
{
    /** @var ClientRequest $request */
    $request = Http::recorded()->first()[0];
    preg_match('/code is (\d{6})/', $request['message'], $matches);

    return $matches[1];
}

test('a pending resident can verify their phone and sign in', function () {
    setupSemaphoreFake();
    $user = User::factory()->create([
        'contact_number' => '09171234567',
        'phone_verified_at' => null,
    ]);

    $this->withSession(['phone_verification_user_id' => $user->id])
        ->post(route('phone.verification.send'))
        ->assertRedirect(route('phone.verification.show', absolute: false));

    $this->post(route('phone.verification.verify'), [
        'code' => codeFromSemaphoreRequest(),
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertAuthenticatedAs($user);
    expect($user->fresh()->phone_verified_at)->not->toBeNull();
    expect($user->fresh()->phone_verification_code_hash)->toBeNull();
});

test('a legacy pending account can add its phone number before requesting a code', function () {
    setupSemaphoreFake();
    $user = User::factory()->create([
        'contact_number' => null,
        'phone_verified_at' => null,
    ]);

    $this->withSession(['phone_verification_user_id' => $user->id])
        ->post(route('phone.verification.send'), [
            'contact_number' => '+639171234567',
        ])
        ->assertRedirect(route('phone.verification.show', absolute: false));

    expect($user->fresh()->contact_number)->toBe('09171234567');
    Http::assertSent(fn (ClientRequest $request) => $request['number'] === '09171234567');
});

test('expired verification codes cannot verify an account', function () {
    $user = User::factory()->create([
        'phone_verified_at' => null,
        'phone_verification_code_hash' => Hash::make('123456'),
        'phone_verification_expires_at' => now()->subMinute(),
    ]);

    $this->withSession(['phone_verification_user_id' => $user->id])
        ->post(route('phone.verification.verify'), ['code' => '123456'])
        ->assertSessionHasErrors('code');

    expect($user->fresh()->phone_verified_at)->toBeNull();
});

test('unverified residents can access the application without entering a verification flow', function () {
    $user = User::factory()->create(['phone_verified_at' => null]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();

    $this->assertAuthenticatedAs($user);
});
