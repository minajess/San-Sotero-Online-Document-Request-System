<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LandingPageSetting;
use App\Support\LandingPageContent;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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
        $sectionKeys = ['hero', 'services', 'process', 'about', 'cta'];
        $validated = $request->validate([
            'content' => ['required', 'array'],
            'content.site_name' => ['required', 'string', 'max:120'],
            'content.navigation' => ['required', 'array', 'size:4'],
            'content.navigation.*.label' => ['required', 'string', 'max:40'],
            'content.navigation.*.href' => ['required', 'string', 'max:255', 'regex:/^(https?:\/\/|\/(?!\/)|#)/i'],
            'content.login_label' => ['required', 'string', 'max:40'],
            'content.dashboard_label' => ['required', 'string', 'max:40'],
            'content.footer_left' => ['required', 'string', 'max:255'],
            'content.footer_right' => ['required', 'string', 'max:255'],
            'content.section_order' => ['required', 'array', 'size:5'],
            'content.section_order.*' => ['required', 'string', Rule::in($sectionKeys), 'distinct'],
            'content.sections' => ['required', 'array'],
            'content.sections.hero.enabled' => ['required', 'boolean'],
            'content.sections.hero.badge' => ['required', 'string', 'max:120'],
            'content.sections.hero.title' => ['required', 'string', 'max:120'],
            'content.sections.hero.highlight' => ['required', 'string', 'max:120'],
            'content.sections.hero.description' => ['required', 'string', 'max:1000'],
            'content.sections.hero.primary_label' => ['required', 'string', 'max:60'],
            'content.sections.hero.primary_link' => ['nullable', 'string', 'max:255', 'regex:/^(https?:\/\/|\/(?!\/)|#)/i'],
            'content.sections.hero.secondary_label' => ['required', 'string', 'max:60'],
            'content.sections.hero.secondary_link' => ['required', 'string', 'max:255', 'regex:/^(https?:\/\/|\/(?!\/)|#)/i'],
            'content.sections.hero.highlights' => ['required', 'array', 'size:3'],
            'content.sections.hero.highlights.*' => ['required', 'string', 'max:60'],
            'content.sections.hero.panel_eyebrow' => ['required', 'string', 'max:60'],
            'content.sections.hero.panel_title' => ['required', 'string', 'max:120'],
            'content.sections.hero.panel_description' => ['required', 'string', 'max:160'],
            'content.sections.hero.panel_items' => ['required', 'array', 'size:2'],
            'content.sections.hero.panel_items.*' => ['required', 'string', 'max:60'],
            'content.sections.services.enabled' => ['required', 'boolean'],
            'content.sections.services.eyebrow' => ['required', 'string', 'max:80'],
            'content.sections.services.title' => ['required', 'string', 'max:120'],
            'content.sections.services.description' => ['required', 'string', 'max:500'],
            'content.sections.services.items' => ['required', 'array', 'min:1', 'max:6'],
            'content.sections.services.items.*.title' => ['required', 'string', 'max:120'],
            'content.sections.services.items.*.description' => ['required', 'string', 'max:500'],
            'content.sections.process.enabled' => ['required', 'boolean'],
            'content.sections.process.eyebrow' => ['required', 'string', 'max:80'],
            'content.sections.process.title' => ['required', 'string', 'max:120'],
            'content.sections.process.items' => ['required', 'array', 'min:1', 'max:6'],
            'content.sections.process.items.*.title' => ['required', 'string', 'max:120'],
            'content.sections.process.items.*.description' => ['required', 'string', 'max:500'],
            'content.sections.about.enabled' => ['required', 'boolean'],
            'content.sections.about.eyebrow' => ['required', 'string', 'max:80'],
            'content.sections.about.title' => ['required', 'string', 'max:160'],
            'content.sections.about.description' => ['required', 'string', 'max:1000'],
            'content.sections.about.features' => ['required', 'array', 'size:2'],
            'content.sections.about.features.*' => ['required', 'string', 'max:80'],
            'content.sections.cta.enabled' => ['required', 'boolean'],
            'content.sections.cta.title' => ['required', 'string', 'max:120'],
            'content.sections.cta.description' => ['required', 'string', 'max:500'],
            'content.sections.cta.button_label' => ['required', 'string', 'max:60'],
            'content.sections.cta.button_link' => ['required', 'string', 'max:255', 'regex:/^(https?:\/\/|\/(?!\/)|#)/i'],
            'logo_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'hero_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $content = $validated['content'];
        $existingContent = LandingPageSetting::query()->find(1)?->content
            ?? LandingPageContent::defaults();
        foreach (['logo_image', 'hero_image'] as $imageKey) {
            $content[$imageKey] = $existingContent[$imageKey]
                ?? LandingPageContent::defaults()[$imageKey];
        }

        if ($request->hasFile('logo_image')) {
            $content['logo_image'] = $request->file('logo_image')->store('landing-page', 'public');
        }
        if ($request->hasFile('hero_image')) {
            $content['hero_image'] = $request->file('hero_image')->store('landing-page', 'public');
        }

        $setting = LandingPageSetting::query()->find(1) ?? new LandingPageSetting;
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
