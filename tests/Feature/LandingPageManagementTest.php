<?php

use App\Models\LandingPageSetting;
use App\Models\User;
use App\Support\LandingPageContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('public visitors see default landing page content', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('landingPage.site_name', 'Barangay San Sotero')
            ->where('landingPage.sections.hero.title', 'Your Barangay Documents,'));
});

test('super admins can update only the landing page logo and welcome message', function () {
    Storage::fake('public');

    $admin = User::factory()->create(['role' => 'super_admin']);
    $content = LandingPageContent::defaults();
    $content['site_name'] = 'Barangay Demo';
    $content['sections']['services']['items'] = [
        ['title' => 'Existing Service', 'description' => 'Keep this service unchanged.'],
    ];
    $content['section_order'] = ['services', 'hero', 'process', 'about', 'cta'];
    $setting = new LandingPageSetting;
    $setting->id = 1;
    $setting->content = $content;
    $setting->save();
    $logo = UploadedFile::fake()->createWithContent(
        'logo.png',
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aXcAAAAASUVORK5CYII='),
    );

    $this->actingAs($admin)
        ->put(route('admin.landing-page.update'), [
            'welcome_message' => 'Welcome to the updated barangay website.',
            'logo_image' => $logo,
            'content' => [
                'site_name' => 'Attempted unauthorized edit',
                'section_order' => ['cta', 'about', 'process', 'hero', 'services'],
            ],
        ])
        ->assertRedirect(route('admin.landing-page.edit'));

    $savedContent = LandingPageSetting::query()->findOrFail(1)->content;
    expect($savedContent['site_name'])->toBe('Barangay Demo')
        ->and($savedContent['section_order'])->toBe(['services', 'hero', 'process', 'about', 'cta'])
        ->and($savedContent['sections']['services']['items'][0]['title'])->toBe('Existing Service')
        ->and($savedContent['sections']['hero']['description'])
        ->toBe('Welcome to the updated barangay website.')
        ->and($savedContent['logo_image'])->toStartWith('landing-page/');
    Storage::disk('public')->assertExists($savedContent['logo_image']);

    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $admin->id,
        'event' => 'landing_page.updated',
    ]);

    $this->get(route('home'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('landingPage.site_name', 'Barangay Demo')
            ->where('landingPage.sections.hero.description', 'Welcome to the updated barangay website.')
            ->where('landingPage.sections.services.items.0.title', 'Existing Service'));
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

test('landing page welcome message is required and limited to 1000 characters', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->put(route('admin.landing-page.update'), ['welcome_message' => str_repeat('x', 1001)])
        ->assertSessionHasErrors('welcome_message');
});
