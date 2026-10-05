<?php

use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('super admins can create secretary accounts', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->post(route('admin.staff.store'), [
            'first_name' => 'New',
            'middle_name' => null,
            'middle_name_na' => true,
            'surname' => 'Secretary',
            'birthdate' => '1985-02-14',
            'address' => '12 Government Road',
            'zone' => 'Zone 1',
            'sex' => 'Male',
            'email' => 'new.secretary@example.test',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])
        ->assertRedirect(route('admin.staff'));

    $secretary = User::query()
        ->where('email', 'new.secretary@example.test')
        ->firstOrFail();

    expect($secretary->role)->toBe('secretary')
        ->and($secretary->name)->toBe('New Secretary')
        ->and($secretary->first_name)->toBe('New')
        ->and($secretary->birthdate)->toBe('1985-02-14')
        ->and($secretary->zone)->toBe('Zone 1')
        ->and(Hash::check('secure-password', $secretary->password))->toBeTrue()
        ->and($secretary->contact_number)->toBeNull()
        ->and($secretary->phone_verified_at)->toBeNull();
    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $admin->id,
        'event' => 'staff.created',
        'subject_id' => (string) $secretary->id,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.staff'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/staff')
            ->where('staff.0.email', 'new.secretary@example.test'));
});

test('non-admins cannot create secretary accounts or document types', function () {
    $secretary = User::factory()->create(['role' => 'secretary']);

    $this->actingAs($secretary)
        ->post(route('admin.staff.store'), [
            'name' => 'Unauthorized Secretary',
            'email' => 'unauthorized@example.test',
            'password' => 'secure-password',
            'password_confirmation' => 'secure-password',
        ])
        ->assertForbidden();

    $this->actingAs($secretary)
        ->post(route('admin.document-types.store'), [
            'name' => 'Restricted Document',
            'description' => 'Not allowed.',
            'fee' => 10,
            'is_active' => true,
        ])
        ->assertForbidden();
});

test('super admins can add and update resident document types', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->post(route('admin.document-types.store'), [
            'name' => 'Business Permit Certification',
            'description' => 'For business permit applications.',
            'fee' => '75.50',
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.document-types'));

    $documentType = DocumentType::query()
        ->where('name', 'Business Permit Certification')
        ->firstOrFail();

    expect((float) $documentType->fee)->toBe(75.5)
        ->and($documentType->is_active)->toBeTrue();
    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $admin->id,
        'event' => 'document_type.created',
        'subject_id' => (string) $documentType->id,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.document-types.update', $documentType), [
            'name' => 'Business Permit Certificate',
            'description' => 'Updated description.',
            'fee' => '100.00',
            'is_active' => false,
        ])
        ->assertRedirect(route('admin.document-types'));

    $documentType->refresh();

    expect($documentType->name)->toBe('Business Permit Certificate')
        ->and($documentType->description)->toBe('Updated description.')
        ->and((float) $documentType->fee)->toBe(100.0)
        ->and($documentType->is_active)->toBeFalse();
    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $admin->id,
        'event' => 'document_type.updated',
        'subject_id' => (string) $documentType->id,
    ]);
});

test('document names must be unique and fees cannot be negative', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->post(route('admin.document-types.store'), [
            'name' => DocumentType::query()->firstOrFail()->name,
            'description' => 'Duplicate.',
            'fee' => 0,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('name');

    $this->actingAs($admin)
        ->post(route('admin.document-types.store'), [
            'name' => 'Invalid Fee Document',
            'description' => 'Invalid fee.',
            'fee' => -1,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('fee');
});
