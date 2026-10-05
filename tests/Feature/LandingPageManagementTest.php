<?php

use App\Models\LandingPageSetting;
use App\Models\User;
use App\Support\LandingPageContent;
use Inertia\Testing\AssertableInertia as Assert;

test('public visitors see default landing page content', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('landingPage.site_name', 'Barangay San Sotero')
            ->where('landingPage.sections.hero.title', 'Your Barangay Documents,'));
});

test('super admins can update landing page content and section order', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $content = LandingPageContent::defaults();
    $content['site_name'] = 'Barangay Demo';
    $content['sections']['services']['items'] = [
        ['title' => 'New Service', 'description' => 'A newly added service.'],
    ];
    $content['section_order'] = ['services', 'hero', 'process', 'about', 'cta'];

    $this->actingAs($admin)
        ->put(route('admin.landing-page.update'), ['content' => $content])
        ->assertRedirect(route('admin.landing-page.edit'));

    expect(LandingPageSetting::query()->findOrFail(1)->content['site_name'])->toBe('Barangay Demo');
    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $admin->id,
        'event' => 'landing_page.updated',
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('landingPage.site_name', 'Barangay Demo')
            ->where('landingPage.section_order.0', 'services')
            ->has('landingPage.sections.services.items', 1)
            ->where('landingPage.sections.services.items.0.title', 'New Service'));
});

test('only super admins can edit landing page content', function () {
    $secretary = User::factory()->create(['role' => 'secretary']);

    $this->actingAs($secretary)
        ->get(route('admin.landing-page.edit'))
        ->assertForbidden();

    $this->actingAs($secretary)
        ->put(route('admin.landing-page.update'), ['content' => LandingPageContent::defaults()])
        ->assertForbidden();
});

test('landing page links reject unsafe destinations and section orders reject unknown sections', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $content = LandingPageContent::defaults();
    $content['navigation'][0]['href'] = '//example.test';

    $this->actingAs($admin)
        ->put(route('admin.landing-page.update'), ['content' => $content])
        ->assertSessionHasErrors('content.navigation.0.href');

    $content = LandingPageContent::defaults();
    $content['section_order'][0] = 'unknown';
    $this->actingAs($admin)
        ->put(route('admin.landing-page.update'), ['content' => $content])
        ->assertSessionHasErrors('content.section_order.0');
});
