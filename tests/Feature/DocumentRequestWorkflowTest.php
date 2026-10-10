<?php

use App\Models\ActivityLog;
use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function requestIdentityImage(string $name): UploadedFile
{
    return UploadedFile::fake()->createWithContent(
        $name,
        base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aXcAAAAASUVORK5CYII='),
    );
}

function requestPersonalDetails(): array
{
    return [
        'contact_number' => '09171234567',
        'first_name' => 'Resident',
        'middle_name' => 'Maria',
        'middle_name_na' => false,
        'surname' => 'Applicant',
        'birthdate' => '1990-05-12',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
        'sex' => 'Female',
    ];
}

test('residents can submit a document request with a payment method', function () {
    Storage::fake('local');

    $resident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $response = $this->actingAs($resident)->post(route('resident.requests.store'), [
        ...requestPersonalDetails(),
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'payment_method' => 'gcash',
        'payment_reference' => 'GCASH-123456',
        'id_is_valid' => true,
        'id_document_front' => requestIdentityImage('resident-id-front.png'),
        'id_document_back' => requestIdentityImage('resident-id-back.png'),
    ]);

    $response->assertRedirect(route('resident.requests'));
    $this->assertDatabaseHas('document_requests', [
        'user_id' => $resident->id,
        'document_type_id' => $documentType->id,
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'paid',
        'payment_reference' => 'GCASH-123456',
        'identity_status' => 'pending',
        'contact_number' => '09171234567',
        'first_name' => 'Resident',
        'middle_name' => 'Maria',
        'surname' => 'Applicant',
        'zone' => 'Zone 2',
    ]);
    $storedRequest = DocumentRequest::query()->firstOrFail();
    Storage::disk('local')->assertExists($storedRequest->id_document_front_path);
    Storage::disk('local')->assertExists($storedRequest->id_document_back_path);
    expect(ActivityLog::query()
        ->where('event', 'request.submitted')
        ->where('actor_id', $resident->id)
        ->exists())->toBeTrue();

    $this->actingAs($resident)
        ->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->has('requests', 1)
            ->where('requests.0.document_type.name', $documentType->name)
            ->where('requests.0.payment_method', 'gcash'))
        ->assertDontSee('id_document_path')
        ->assertDontSee('identity_document_url');
});

test('residents must provide a GCash reference number to submit a request', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            ...requestPersonalDetails(),
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'gcash',
            'id_is_valid' => true,
            'id_document_front' => requestIdentityImage('resident-id-front.png'),
            'id_document_back' => requestIdentityImage('resident-id-back.png'),
        ])
        ->assertSessionHasErrors('payment_reference');

    $this->assertDatabaseCount('document_requests', 0);
});

test('only residents can submit document requests', function () {
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($secretary)
        ->post(route('resident.requests.store'), [
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
        ])
        ->assertForbidden();
});

test('residents must upload front and back ID images when submitting a request', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            ...requestPersonalDetails(),
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
        ])
        ->assertSessionHasErrors(['id_document_front', 'id_document_back']);

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            ...requestPersonalDetails(),
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
            'id_document_front' => UploadedFile::fake()->create('resident-id.pdf', 10, 'application/pdf'),
            'id_document_back' => requestIdentityImage('resident-id-back.png'),
        ])
        ->assertSessionHasErrors('id_document_front');
});

test('requester contact and personal details are required and stored as a request snapshot', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
            'id_document_front' => requestIdentityImage('front.png'),
            'id_document_back' => requestIdentityImage('back.png'),
        ])
        ->assertSessionHasErrors([
            'contact_number',
            'first_name',
            'surname',
            'birthdate',
            'address',
            'zone',
            'sex',
        ]);

    expect(DocumentRequest::query()->count())->toBe(0);
});

test('secretaries can view the saved requester details and view both ID sides inline', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)->post(route('resident.requests.store'), [
        ...requestPersonalDetails(),
        'document_type_id' => $documentType->id,
        'purpose' => 'Address verification',
        'payment_method' => 'cash',
        'id_is_valid' => true,
        'id_document_front' => requestIdentityImage('front.png'),
        'id_document_back' => requestIdentityImage('back.png'),
    ])->assertRedirect(route('resident.requests'));

    $storedRequest = DocumentRequest::query()->firstOrFail();
    $this->actingAs($secretary)
        ->get(route('secretary.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/requests')
            ->where('requests.0.requester_details.contact_number', '09171234567')
            ->where('requests.0.requester_details.address', '123 Main Street')
            ->where('requests.0.requester_details.zone', 'Zone 2')
            ->where('requests.0.identity_document_back_url', route('secretary.requests.identity.back', $storedRequest)));

    $this->get(route('secretary.requests.identity', $storedRequest))
        ->assertOk()
        ->assertSee('/brgyLogo.png?v=2')
        ->assertSee(route('secretary.requests.identity.image', $storedRequest), false)
        ->assertHeader('Cache-Control', 'no-store, private');
    $this->get(route('secretary.requests.identity.image', $storedRequest))
        ->assertOk()
        ->assertHeader(
            'Content-Disposition',
            "inline; filename=\"resident-id-request-{$storedRequest->id}-front.png\"",
        )
        ->assertHeader('Content-Type', 'image/png');
    $this->get(route('secretary.requests.identity.back', $storedRequest))
        ->assertOk()
        ->assertSee('/brgyLogo.png?v=2')
        ->assertSee(route('secretary.requests.identity.image.back', $storedRequest), false);
    $this->get(route('secretary.requests.identity.image.back', $storedRequest))
        ->assertOk()
        ->assertHeader(
            'Content-Disposition',
            "inline; filename=\"resident-id-request-{$storedRequest->id}-back.png\"",
        )
        ->assertHeader('Content-Type', 'image/png');
});

test('secretary processed document reports list non-pending requests only', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $pending = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Awaiting processing',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
    ]);
    $processed = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'In progress request',
        'status' => 'processing',
        'payment_method' => 'gcash',
        'payment_status' => 'paid',
        'contact_number' => '09171234567',
        'first_name' => 'Resident',
        'surname' => 'Applicant',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
    ]);

    $this->actingAs($secretary)
        ->get(route('secretary.processed-documents'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/processed-documents')
            ->where('summary.totalProcessed', 1)
            ->where('summary.processing', 1)
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $processed->id)
            ->where('requests.data.0.requester_details.contact_number', '09171234567'));

    expect($pending->fresh()->status)->toBe('pending');
});

test('residents can only see their own document requests', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $otherResident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $ownRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Personal request',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
    ]);
    $otherResident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Private request',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($resident)
        ->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->has('requests', 1)
            ->where('requests.0.id', $ownRequest->id));
});

test('resident dashboard shows unread count but notification content stays in its viewer', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $now = now();

    DB::table('notifications')->insert([
        'id' => (string) \Illuminate\Support\Str::uuid(),
        'type' => 'App\\Notifications\\DocumentReadyNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $resident->id,
        'data' => json_encode([
            'title' => 'Your Document is ready to claim at BRGY HALL',
            'message' => 'Your Barangay Clearance is ready to claim.',
        ]),
        'read_at' => null,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $this->actingAs($resident)
        ->get(route('resident.dashboard'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/dashboard')
            ->where('unreadNotificationsCount', 1)
            ->missing('notifications'));

    $this->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->where('unreadNotificationsCount', 1));
});

test('residents can view all notifications and open one to mark it as read', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $otherResident = User::factory()->create(['role' => 'resident']);
    $now = now();
    $notificationIds = [];

    foreach (range(1, 12) as $number) {
        $notificationIds[] = $id = (string) \Illuminate\Support\Str::uuid();
        DB::table('notifications')->insert([
            'id' => $id,
            'type' => 'App\\Notifications\\DocumentReadyNotification',
            'notifiable_type' => User::class,
            'notifiable_id' => $resident->id,
            'data' => json_encode([
                'title' => "Notification {$number}",
                'message' => "Details for notification {$number}",
            ]),
            'read_at' => null,
            'created_at' => $now->copy()->subMinutes($number),
            'updated_at' => $now->copy()->subMinutes($number),
        ]);
    }

    $otherNotificationId = (string) \Illuminate\Support\Str::uuid();
    DB::table('notifications')->insert([
        'id' => $otherNotificationId,
        'type' => 'App\\Notifications\\DocumentReadyNotification',
        'notifiable_type' => User::class,
        'notifiable_id' => $otherResident->id,
        'data' => json_encode(['title' => 'Private notification', 'message' => 'Private details']),
        'read_at' => null,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $this->actingAs($resident)
        ->get(route('resident.notifications'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/notifications')
            ->has('notifications', 12)
            ->where('unreadNotificationsCount', 12));

    $this->patch(route('resident.notifications.read', $notificationIds[0]))
        ->assertRedirect();

    $this->assertDatabaseHas('notifications', [
        'id' => $notificationIds[0],
        'notifiable_id' => $resident->id,
    ]);
    expect(DB::table('notifications')->where('id', $notificationIds[0])->value('read_at'))
        ->not->toBeNull();

    $this->patch(route('resident.notifications.read', $otherNotificationId))
        ->assertNotFound();
});

test('secretaries can mark requests ready and notify the resident of the claim schedule', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'processing',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'verified',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
    ]);
    $readyAt = now()->addDay()->startOfMinute();

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'ready',
            'ready_at' => $readyAt->format('Y-m-d\TH:i'),
            'payment_status' => 'paid',
            'identity_status' => 'verified',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'ready',
        'payment_status' => 'paid',
        'processed_by' => $secretary->id,
    ]);
    expect(ActivityLog::query()
        ->where('actor_id', $secretary->id)
        ->whereIn('event', [
            'request.status_changed',
            'request.claim_time_set',
            'payment.status_changed',
        ])
        ->count())->toBe(3);

    $databaseNotification = DB::table('notifications')
        ->where('notifiable_id', $resident->id)
        ->where('type', 'App\\Notifications\\DocumentReadyNotification')
        ->first();

    expect($databaseNotification)->not->toBeNull();

    $notificationData = json_decode($databaseNotification->data, true);

    expect($notificationData['title'])
        ->toBe('Your Document is ready to claim at BRGY HALL')
        ->and($notificationData['message'])
        ->toContain('BRGY HALL')
        ->toContain($readyAt->format('F j, Y \a\t g:i A'))
        ->toContain('claim it in person');
});

test('marking a request paid notifies the resident once', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'paid',
            'identity_status' => 'pending',
        ])
        ->assertRedirect();

    $paymentNotification = DB::table('notifications')
        ->where('notifiable_id', $resident->id)
        ->where('type', 'App\\Notifications\\PaymentReceivedNotification')
        ->first();

    expect($paymentNotification)->not->toBeNull();
    $notificationData = json_decode($paymentNotification->data, true);

    expect($notificationData['title'])
        ->toBe('Payment received')
        ->and($notificationData['message'])
        ->toContain($documentType->name)
        ->toContain('GCASH')
        ->and($notificationData['document_request_id'])
        ->toBe((string) $documentRequest->id);

    $this->patch(route('secretary.requests.update', $documentRequest), [
        'status' => 'pending',
        'payment_status' => 'paid',
        'identity_status' => 'pending',
    ])
        ->assertRedirect();

    expect(DB::table('notifications')
        ->where('notifiable_id', $resident->id)
        ->where('type', 'App\\Notifications\\PaymentReceivedNotification')
        ->count())->toBe(1);
});

test('rejecting a request notifies the resident to submit a new request with a valid ID', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'rejected',
            'payment_status' => 'unpaid',
            'identity_status' => 'pending',
        ])
        ->assertRedirect();

    $notification = DB::table('notifications')
        ->where('notifiable_id', $resident->id)
        ->where('type', 'App\\Notifications\\RequestRejectedNotification')
        ->first();

    expect($notification)->not->toBeNull();

    $data = json_decode($notification->data, true);
    expect($data['title'])
        ->toBe('Request rejected — please submit again')
        ->and($data['message'])
        ->toContain($documentType->name)
        ->toContain('valid government-issued ID')
        ->toContain('new document request')
        ->and($data['document_request_id'])
        ->toBe((string) $documentRequest->id);
});

test('requests cannot be marked claimed through the claim action until payment is recorded', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'ready',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'identity_status' => 'verified',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
        'ready_at' => now()->addDay(),
    ]);

    $this->actingAs($secretary)
        ->post(route('secretary.requests.claim', $documentRequest))
        ->assertSessionHasErrors('payment_status');
});

test('secretaries record a paid ready claim separately with requester name and claim time', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'ready',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'identity_status' => 'verified',
        'first_name' => 'Maria',
        'middle_name' => 'Clara',
        'surname' => 'Santos',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
        'ready_at' => now()->addDay(),
    ]);

    $this->actingAs($secretary)
        ->post(route('secretary.requests.claim', $documentRequest))
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'claimed',
        'claimed_by_name' => 'Maria Clara Santos',
        'processed_by' => $secretary->id,
    ]);
    expect($documentRequest->fresh()->claimed_at)->not->toBeNull();
    $claimedAt = $documentRequest->fresh()->claimed_at;
    $readyAt = $documentRequest->fresh()->ready_at;

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'claimed',
            'ready_at' => now()->addDays(2)->format('Y-m-d\TH:i'),
            'payment_status' => 'paid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('status');

    expect($documentRequest->fresh()->claimed_at->toDateTimeString())
        ->toBe($claimedAt->toDateTimeString())
        ->and($documentRequest->fresh()->ready_at->toDateTimeString())
        ->toBe($readyAt->toDateTimeString());

    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $secretary->id,
        'event' => 'request.claimed',
        'subject_id' => (string) $documentRequest->id,
    ]);

    $this->get(route('secretary.claimed-documents'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/claimed-documents')
            ->has('requests.data', 1)
            ->where('requests.data.0.claimed_by_name', 'Maria Clara Santos')
            ->where('requests.data.0.id', $documentRequest->id));

    $this->actingAs($resident)
        ->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->where('requests.0.id', $documentRequest->id)
            ->where('requests.0.status', 'claimed')
            ->where('requests.0.claimed_by_name', 'Maria Clara Santos')
            ->has('requests.0.claimed_at'));
});

test('secretaries cannot claim an unpaid request or use general updates to mark it claimed', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'ready',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'verified',
    ]);

    $this->actingAs($secretary)
        ->post(route('secretary.requests.claim', $documentRequest))
        ->assertSessionHasErrors('payment_status');

    $this->patch(route('secretary.requests.update', $documentRequest), [
        'status' => 'claimed',
        'payment_status' => 'unpaid',
        'identity_status' => 'verified',
    ])
        ->assertSessionHasErrors('status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'ready',
        'claimed_at' => null,
    ]);
});

test('rejected requests cannot be updated after rejection', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'rejected',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'rejected',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'rejected',
            'payment_status' => 'paid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'rejected',
        'payment_status' => 'unpaid',
        'identity_status' => 'rejected',
    ]);
});

test('paid request payments cannot be changed back to unpaid', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'identity_status' => 'pending',
        ])
        ->assertSessionHasErrors('payment_status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'payment_status' => 'paid',
    ]);
});

test('secretaries cannot process an unverified request or verify without an uploaded ID', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'processing',
            'payment_status' => 'unpaid',
            'identity_status' => 'pending',
        ])
        ->assertSessionHasErrors('identity_status');

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('identity_status');
});

test('saving an ID verification status locks it against later changes', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'identity_status' => 'pending',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'identity_status' => 'pending',
        'identity_status_locked' => true,
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('identity_status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'identity_status' => 'pending',
        'identity_status_locked' => true,
    ]);
});

test('only secretaries can download a resident ID from private storage', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $idPath = UploadedFile::fake()->createWithContent(
        'resident-id.pdf',
        "%PDF-1.4\nresident identity document\n%%EOF",
    )->store('resident-ids', 'local');

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'id_document_path' => $idPath,
    ]);

    $this->actingAs($resident)
        ->get(route('secretary.requests.identity', $documentRequest))
        ->assertForbidden();
    $this->get(route('secretary.requests.identity.image', $documentRequest))
        ->assertForbidden();

    $this->actingAs($secretary)
        ->get(route('secretary.requests.identity', $documentRequest))
        ->assertOk()
        ->assertSee('/brgyLogo.png?v=2');
    $this->get(route('secretary.requests.identity.image', $documentRequest))
        ->assertOk()
        ->assertHeader(
            'Content-Disposition',
            "inline; filename=\"resident-id-request-{$documentRequest->id}.pdf\"",
        );
    $this->get(route('secretary.requests.identity.back', $documentRequest))
        ->assertOk()
        ->assertSee('/brgyLogo.png?v=2');
    $this->get(route('secretary.requests.identity.image.back', $documentRequest))
        ->assertOk()
        ->assertHeader(
            'Content-Disposition',
            "inline; filename=\"resident-id-request-{$documentRequest->id}-back.pdf\"",
        );
    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $secretary->id,
        'event' => 'identity.document_viewed',
        'subject_id' => (string) $documentRequest->id,
    ]);
});

test('super admins can monitor live users and requests', function () {
    $admin = User::factory()->create(['role' => 'super_admin']);
    $resident = User::factory()->create(['role' => 'resident']);
    $documentType = DocumentType::query()->firstOrFail();

    $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($admin)
        ->get(route('admin.users'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/users')
            ->has('users', 2));

    $this->actingAs($admin)
        ->get(route('admin.requests'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/requests')
            ->has('requests', 1)
            ->where('requests.0.resident.id', $resident->id));
});
