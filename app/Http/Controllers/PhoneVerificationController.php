<?php

namespace App\Http\Controllers;

use App\Exceptions\SemaphoreSmsDeliveryException;
use App\Models\ActivityLog;
use App\Models\User;
use App\Services\SemaphoreSmsService;
use App\Support\PhilippineMobileNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PhoneVerificationController extends Controller
{
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        return Inertia::render('auth/phone-verification', [
            'maskedPhone' => $this->maskPhone($user->contact_number),
            'needsPhone' => $user->contact_number === null,
            'codeTtlMinutes' => (int) config('services.semaphore.otp_ttl', 10),
            'maxAttempts' => (int) config('services.semaphore.otp_max_attempts', 5),
            'status' => $request->session()->get('status'),
        ]);
    }

    public function send(Request $request, SemaphoreSmsService $sms): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        $validated = $request->validate([
            'contact_number' => [
                Rule::requiredIf($user->contact_number === null),
                'nullable',
                'string',
                PhilippineMobileNumber::RULE,
                Rule::unique('users', 'contact_number')->ignore($user->id),
            ],
        ]);

        if (isset($validated['contact_number'])) {
            $user->contact_number = PhilippineMobileNumber::normalize($validated['contact_number']);
            $user->save();
        }

        try {
            $sms->sendVerificationCode($user);
        } catch (SemaphoreSmsDeliveryException $exception) {
            throw ValidationException::withMessages([
                'contact_number' => $exception->getMessage(),
            ]);
        }

        ActivityLog::record(
            $user,
            'account.phone_verification_sent',
            'Sent a phone verification code by SMS.',
            $user,
        );

        return to_route('phone.verification.show')
            ->with('status', 'A verification code was sent to your phone.');
    }

    public function verify(Request $request): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if ($user === null) {
            return to_route('login');
        }

        $validated = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $result = DB::transaction(function () use ($user, $validated): string {
            $lockedUser = User::query()
                ->lockForUpdate()
                ->findOrFail($user->id);

            if ($lockedUser->phone_verified_at !== null) {
                return 'verified';
            }

            if (
                ! is_string($lockedUser->phone_verification_code_hash)
                || $lockedUser->phone_verification_expires_at === null
                || $lockedUser->phone_verification_expires_at->isPast()
            ) {
                return 'expired';
            }

            if (
                $lockedUser->phone_verification_attempts
                >= (int) config('services.semaphore.otp_max_attempts', 5)
            ) {
                return 'too_many_attempts';
            }

            if (! Hash::check($validated['code'], $lockedUser->phone_verification_code_hash)) {
                $lockedUser->increment('phone_verification_attempts');

                return 'invalid';
            }

            $lockedUser->forceFill([
                'phone_verified_at' => now(),
                'phone_verification_code_hash' => null,
                'phone_verification_expires_at' => null,
                'phone_verification_attempts' => 0,
            ])->save();

            return 'verified';
        });

        if ($result !== 'verified') {
            $message = match ($result) {
                'expired' => 'The verification code expired. Request a new code.',
                'too_many_attempts' => 'Too many incorrect codes. Request a new code to try again.',
                default => 'The verification code is incorrect.',
            };

            throw ValidationException::withMessages(['code' => $message]);
        }

        $user->refresh();
        Auth::login($user);
        $request->session()->forget('phone_verification_user_id');
        $request->session()->regenerate();

        ActivityLog::record(
            $user,
            'account.phone_verified',
            'Verified the account phone number.',
            $user,
        );

        return to_route('dashboard')->with('status', 'Your phone number is verified.');
    }

    private function pendingUser(Request $request): ?User
    {
        $userId = $request->session()->get('phone_verification_user_id');

        return is_numeric($userId)
            ? User::query()->find((int) $userId)
            : null;
    }

    private function maskPhone(?string $phone): string
    {
        if ($phone === null) {
            return '';
        }

        return substr($phone, 0, 4).str_repeat('*', max(strlen($phone) - 6, 0)).substr($phone, -2);
    }
}
