<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\GcashPaymentSetting;
use App\Support\PhilippineMobileNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GcashPaymentSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = GcashPaymentSetting::query()->first();
        $hasQrCode = is_string($setting?->qr_code_path)
            && Storage::disk('public')->exists($setting->qr_code_path);

        return Inertia::render('admin/settings', [
            'gcashPayment' => [
                'gcash_number' => $setting?->gcash_number ?? '',
                'qr_code_url' => $hasQrCode
                    ? Storage::disk('public')->url($setting->qr_code_path)
                    : null,
                'configured' => filled($setting?->gcash_number) && $hasQrCode,
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $setting = GcashPaymentSetting::query()->first();
        $hasQrCode = is_string($setting?->qr_code_path)
            && Storage::disk('public')->exists($setting->qr_code_path);
        $validated = $request->validate([
            'gcash_number' => [
                'required',
                'string',
                'max:20',
                PhilippineMobileNumber::RULE,
            ],
            'qr_code' => [
                $hasQrCode ? 'nullable' : 'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],
        ]);

        $newQrCodePath = null;
        if ($request->hasFile('qr_code')) {
            $newQrCodePath = $request->file('qr_code')->store('gcash', 'public');
            if (! is_string($newQrCodePath)) {
                throw new \RuntimeException('The GCash QR code could not be stored.');
            }
        }

        $setting ??= new GcashPaymentSetting;
        $previousNumber = $setting->gcash_number;
        $previousQrCodePath = $setting->qr_code_path;

        $setting->gcash_number = $validated['gcash_number'];
        $setting->qr_code_path = $newQrCodePath ?? $previousQrCodePath;
        $setting->updated_by = $request->user()->id;
        $setting->save();

        if ($newQrCodePath && $previousQrCodePath) {
            Storage::disk('public')->delete($previousQrCodePath);
        }

        ActivityLog::record(
            $request->user(),
            'gcash_payment.updated',
            'Updated the GCash payment details.',
            $setting,
            [
                'gcash_number_changed' => $previousNumber !== $setting->gcash_number,
                'qr_code_updated' => $newQrCodePath !== null,
            ],
        );

        return to_route('admin.settings')
            ->with('success', 'GCash payment details updated.');
    }
}
