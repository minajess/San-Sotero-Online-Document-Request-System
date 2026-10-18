<?php

use Inertia\Testing\AssertableInertia as Assert;

test('public visitors see default landing page content', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('landingPage.site_name', 'Barangay San Sotero')
            ->where('landingPage.sections.hero.title', 'Your Barangay Documents,'));
});
