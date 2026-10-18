<?php

namespace App\Services;

use App\Exceptions\SemaphoreSmsDeliveryException;
use App\Models\User;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class SemaphoreSmsService
{
    public function sendVerificationCode(User $user): void
    {
        $apiKey = config('services.semaphore.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new SemaphoreSmsDeliveryException(
                'SMS verification is not configured. Set the Semaphore API key before sending verification codes.',
            );
        }

        if (! is_string($user->contact_number) || $user->contact_number === '') {
            throw new SemaphoreSmsDeliveryException(
                'A contact number is required before sending an SMS verification code.',
            );
        }

        $code = (string) random_int(100000, 999999);
        $user->forceFill([
            'phone_verification_code_hash' => Hash::make($code),
            'phone_verification_expires_at' => now()->addMinutes(
                (int) config('services.semaphore.otp_ttl', 10),
            ),
            'phone_verification_attempts' => 0,
        ])->save();

        $payload = [
            'apikey' => $apiKey,
            'number' => $user->contact_number,
            'message' => sprintf(
                'Your Barangay San Sotero verification code is %s. It expires in %d minutes.',
                $code,
                (int) config('services.semaphore.otp_ttl', 10),
            ),
        ];

        $senderName = config('services.semaphore.sender_name');

        if (is_string($senderName) && $senderName !== '') {
            $payload['sendername'] = $senderName;
        }

        try {
            $response = Http::asForm()
                ->timeout(10)
                ->post('https://api.semaphore.co/api/v4/messages', $payload)
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            $this->clearCode($user);

            throw new SemaphoreSmsDeliveryException(
                'Semaphore could not send the verification code. Please try again.',
                previous: $exception,
            );
        }

        $messages = $response->json();
        $accepted = is_array($messages)
            && isset($messages[0])
            && is_array($messages[0])
            && isset($messages[0]['message_id']);

        if (! $accepted) {
            $this->clearCode($user);

            throw new SemaphoreSmsDeliveryException(
                'Semaphore did not accept the verification message. Please check the SMS configuration and try again.',
            );
        }
    }

    private function clearCode(User $user): void
    {
        $user->forceFill([
            'phone_verification_code_hash' => null,
            'phone_verification_expires_at' => null,
            'phone_verification_attempts' => 0,
        ])->save();
    }
}
