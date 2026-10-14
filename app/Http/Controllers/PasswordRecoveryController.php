<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class PasswordRecoveryController extends Controller
{
    private const CODE_TTL_MINUTES = 10;

    private const RESET_TTL_MINUTES = 10;

    private const MAX_CODE_ATTEMPTS = 5;

    private const RESEND_COOLDOWN_SECONDS = 60;

    public function sendCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
        ]);

        $email = Str::lower(trim($validated['email']));
        $rateLimitKey = 'password-recovery:'.hash('sha256', $email);

        if (! RateLimiter::attempt(
            $rateLimitKey,
            1,
            fn (): bool => true,
            self::RESEND_COOLDOWN_SECONDS,
        )) {
            return response()->json([
                'message' => 'Please wait before requesting another verification code.',
                'retry_after' => RateLimiter::availableIn($rateLimitKey),
            ], 429);
        }

        $user = User::query()
            ->whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($user !== null) {
            $code = (string) random_int(100000, 999999);
            $now = now();

            DB::table('password_recovery_codes')->updateOrInsert(
                ['email' => $email],
                [
                    'code_hash' => Hash::make($code),
                    'attempts' => 0,
                    'expires_at' => $now->copy()->addMinutes(self::CODE_TTL_MINUTES),
                    'verified_at' => null,
                    'reset_token_hash' => null,
                    'reset_expires_at' => null,
                    'sent_at' => $now,
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            );

            Mail::raw(
                "Your Barangay San Sotero password recovery verification code is {$code}. "
                .'It expires in '.self::CODE_TTL_MINUTES.' minutes. If you did not request this, '
                .'you can safely ignore this email.',
                function ($message) use ($email): void {
                    $message
                        ->to($email)
                        ->subject('Your password recovery code');
                },
            );
        }

        return response()->json([
            'message' => 'If an account exists for that email, a verification code has been sent.',
            'retry_after' => self::RESEND_COOLDOWN_SECONDS,
        ]);
    }

    public function verifyCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'code' => ['required', 'digits:6'],
        ]);

        $email = Str::lower(trim($validated['email']));
        $resetToken = Str::random(64);
        $result = DB::transaction(function () use ($email, $validated, $resetToken): string {
            $recovery = DB::table('password_recovery_codes')
                ->where('email', $email)
                ->lockForUpdate()
                ->first();

            if (
                $recovery === null
                || $recovery->code_hash === null
                || $recovery->expires_at === null
                || now()->greaterThan($recovery->expires_at)
                || $recovery->attempts >= self::MAX_CODE_ATTEMPTS
            ) {
                return 'invalid';
            }

            if (! Hash::check($validated['code'], $recovery->code_hash)) {
                DB::table('password_recovery_codes')
                    ->where('id', $recovery->id)
                    ->increment('attempts');

                return 'invalid';
            }

            DB::table('password_recovery_codes')
                ->where('id', $recovery->id)
                ->update([
                    'code_hash' => null,
                    'expires_at' => null,
                    'verified_at' => now(),
                    'attempts' => 0,
                    'reset_token_hash' => Hash::make($resetToken),
                    'reset_expires_at' => now()->addMinutes(self::RESET_TTL_MINUTES),
                    'updated_at' => now(),
                ]);

            return 'verified';
        });

        if ($result !== 'verified') {
            return response()->json([
                'errors' => [
                    'code' => ['The verification code is invalid or expired. Request a new code and try again.'],
                ],
            ], 422);
        }

        return response()->json([
            'message' => 'Verification successful.',
            'reset_token' => $resetToken,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'reset_token' => ['required', 'string', 'size:64'],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ]);

        $email = Str::lower(trim($validated['email']));
        $result = DB::transaction(function () use ($email, $validated): string {
            $recovery = DB::table('password_recovery_codes')
                ->where('email', $email)
                ->lockForUpdate()
                ->first();

            if (
                $recovery === null
                || $recovery->reset_token_hash === null
                || $recovery->reset_expires_at === null
                || now()->greaterThan($recovery->reset_expires_at)
                || ! Hash::check($validated['reset_token'], $recovery->reset_token_hash)
            ) {
                return 'invalid';
            }

            $user = User::query()
                ->whereRaw('LOWER(email) = ?', [$email])
                ->lockForUpdate()
                ->first();

            if ($user === null) {
                return 'invalid';
            }

            $user->forceFill(['password' => $validated['password']])->save();
            DB::table('password_recovery_codes')->where('id', $recovery->id)->delete();

            return 'reset';
        });

        if ($result !== 'reset') {
            return response()->json([
                'message' => 'This password reset session is invalid or expired. Request a new code.',
            ], 422);
        }

        return response()->json([
            'message' => 'Your password has been reset successfully.',
        ]);
    }
}
