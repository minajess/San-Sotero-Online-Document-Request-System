<?php

use App\Models\ActivityLog;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can view paginated system activity reports', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $resident = User::factory()->create(['role' => 'resident']);

    ActivityLog::record(
        $resident,
        'request.submitted',
        'Submitted a Barangay Clearance request.',
    );
    $this->actingAs($admin)
        ->get(route('admin.reports'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/reports')
            ->where('summary.totalActivities', 1)
            ->has('activities.data', 1)
            ->where('activities.data.0.description', 'Submitted a Barangay Clearance request.'));
});

test('residents cannot access admin reports or secretary processed document reports', function () {
    $resident = User::factory()->create(['role' => 'resident']);

    $this->actingAs($resident)
        ->get(route('admin.reports'))
        ->assertForbidden();

    $this->actingAs($resident)
        ->get(route('secretary.processed-documents'))
        ->assertForbidden();

    $this->actingAs($resident)
        ->get('/secretary/reports')
        ->assertNotFound();
});

test('successful sign-ins and sign-outs are included in the activity log', function () {
    $user = User::factory()->create(['role' => 'resident']);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard', absolute: false));

    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $user->id,
        'event' => 'auth.login',
    ]);

    $this->post(route('logout'))
        ->assertRedirect(route('home'));

    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $user->id,
        'actor_name' => $user->name,
        'actor_role' => 'resident',
        'event' => 'auth.logout',
    ]);
});
