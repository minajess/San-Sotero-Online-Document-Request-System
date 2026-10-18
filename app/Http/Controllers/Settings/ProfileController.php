<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\ActivityLog;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $avatar = $validated['avatar'] ?? null;
        unset($validated['avatar']);
        $user->fill($validated);
        $changedFields = array_keys($user->getDirty());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $newPhotoPath = $avatar?->store("profile-photos/{$user->id}", 'public');

        if ($avatar !== null && $newPhotoPath === false) {
            throw new \RuntimeException('The profile picture could not be saved.');
        }

        $oldPhotoPath = $user->profile_photo_path;

        if (is_string($newPhotoPath)) {
            $user->profile_photo_path = $newPhotoPath;
            $changedFields[] = 'profile_photo_path';
        }

        $user->save();

        if (is_string($oldPhotoPath) && is_string($newPhotoPath)) {
            Storage::disk('public')->delete($oldPhotoPath);
        }

        if ($changedFields !== []) {
            ActivityLog::record(
                $user,
                'account.profile_updated',
                'Updated account profile information.',
                $user,
                ['changed_fields' => $changedFields],
            );
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        return to_route('profile.edit');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        ActivityLog::record(
            $user,
            'account.deleted',
            'Deleted their account.',
            $user,
        );

        if (is_string($user->profile_photo_path)) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
