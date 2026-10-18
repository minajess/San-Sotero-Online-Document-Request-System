<?php

use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Test',
        'middle_name' => 'Maria',
        'middle_name_na' => false,
        'surname' => 'User',
        'birthdate' => '1990-05-12',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
        'sex' => 'Female',
        'email' => 'test@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test Maria User',
        'first_name' => 'Test',
        'middle_name' => 'Maria',
        'surname' => 'User',
        'birthdate' => '1990-05-12',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
        'sex' => 'Female',
        'contact_number' => '09171234567',
        'phone_verified_at' => null,
    ]);
});

test('registration succeeds without sms configuration or a verification code', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Test',
        'middle_name' => null,
        'middle_name_na' => true,
        'surname' => 'User',
        'birthdate' => '1990-05-12',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
        'sex' => 'Female',
        'email' => 'test@example.com',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
});

test('registration requires valid personal information and zone', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => '',
        'middle_name_na' => false,
        'surname' => '',
        'birthdate' => now()->addDay()->toDateString(),
        'address' => '',
        'zone' => '',
        'sex' => 'invalid',
        'email' => 'missing-info@example.test',
        'contact_number' => '09171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors([
        'first_name',
        'middle_name',
        'surname',
        'birthdate',
        'address',
        'zone',
        'sex',
    ]);
    $this->assertDatabaseMissing('users', ['email' => 'missing-info@example.test']);
});
