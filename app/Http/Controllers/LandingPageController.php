<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LandingPageSetting;
use App\Support\LandingPageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function show(): Response
    {
        return Inertia::render('welcome', [
            'landingPage' => LandingPageContent::current(),
        ]);
    }

    public function edit(): Response
    {
        return Inertia::render('admin/landing-page', [
            'landingPage' => LandingPageContent::current(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'welcome_message' => ['required', 'string', 'max:1000'],
            'logo_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $setting = LandingPageSetting::query()->find(1) ?? new LandingPageSetting;
        $content = array_replace_recursive(
            LandingPageContent::defaults(),
            $setting->content ?? [],
        );
        $content['sections']['hero']['description'] = $validated['welcome_message'];

        if ($request->hasFile('logo_image')) {
            $content['logo_image'] = $request->file('logo_image')->store('landing-page', 'public');
        }

        $setting->id = 1;
        $setting->content = $content;
        $setting->save();

        ActivityLog::record(
            $request->user(),
            'landing_page.updated',
            'Updated the public landing page.',
            $setting,
        );

        return to_route('admin.landing-page.edit')
            ->with('success', 'Landing page updated.');
    }
}
