<?php

use App\Models\ActivityLog;
use App\Models\DocumentRequest;
use App\Models\DocumentType;
use App\Models\GcashPaymentSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
        'contact_number' => '+63 (917) 123-4567',
        'first_name' => 'Forged',
        'middle_name' => 'Incorrect',
        'middle_name_na' => false,
        'surname' => 'Identity',
        'birthdate' => '1990-05-12',
        'address' => '123 Main Street',
        'zone' => 'Zone 2',
        'sex' => 'Female',
    ];
}

function requestResident(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'role' => 'resident',
        'first_name' => 'Resident',
        'middle_name' => 'Maria',
        'surname' => 'Applicant',
        'birthdate' => '1990-05-12',
        'address' => 'Registered address',
        'zone' => 'Registered zone',
        'sex' => 'Female',
        'contact_number' => '09170000000',
    ], $attributes));
}

test('residents can submit a document request with a payment method', function () {
    Storage::fake('local');
    Storage::fake('public');

    $resident = requestResident();
    $documentType = DocumentType::query()->firstOrFail();
    GcashPaymentSetting::query()->create([
        'gcash_number' => '09171234567',
        'qr_code_path' => requestIdentityImage('gcash-qr.png')->store('gcash', 'public'),
    ]);

    $response = $this->actingAs($resident)->post(route('resident.requests.store'), [
        'contact_number' => '+63 (917) 123-4567',
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'payment_method' => 'gcash',
        'payment_receipt' => requestIdentityImage('gcash-receipt.png'),
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
        'payment_status' => 'unpaid',
        'identity_status' => 'pending',
        'contact_number' => '+63 (917) 123-4567',
        'first_name' => 'Resident',
        'middle_name' => 'Maria',
        'surname' => 'Applicant',
        'birthdate' => '1990-05-12',
        'address' => 'Registered address',
        'zone' => 'Registered zone',
        'sex' => 'Female',
    ]);
    $this->assertDatabaseHas('users', [
        'id' => $resident->id,
        'contact_number' => '09170000000',
        'first_name' => 'Resident',
        'middle_name' => 'Maria',
        'surname' => 'Applicant',
        'birthdate' => '1990-05-12',
        'address' => 'Registered address',
        'zone' => 'Registered zone',
        'sex' => 'Female',
    ]);

    $this->actingAs($resident)
        ->get(route('resident.request.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/request')
            ->where('resident.contact_number', '09170000000')
            ->missing('resident.first_name')
            ->missing('resident.address')
            ->where('gcashPayment.configured', true)
            ->where('gcashPayment.gcash_number', '09171234567'));

    $storedRequest = DocumentRequest::query()->firstOrFail();
    Storage::disk('local')->assertExists($storedRequest->id_document_front_path);
    Storage::disk('local')->assertExists($storedRequest->id_document_back_path);
    Storage::disk('local')->assertExists($storedRequest->payment_receipt_path);
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
            ->where('requests.0.first_name', 'Resident')
            ->where('requests.0.middle_name', 'Maria')
            ->where('requests.0.surname', 'Applicant')
            ->where('requests.0.zone', 'Registered zone')
            ->where('requests.0.payment_method', 'gcash'))
        ->assertDontSee('id_document_path')
        ->assertDontSee('identity_document_url');
});

test('request form only receives the resident contact number', function () {
    $resident = requestResident([
        'first_name' => 'Profile',
        'middle_name' => null,
        'surname' => 'Data',
        'birthdate' => '1990-01-01',
        'address' => 'Profile address',
        'zone' => 'Zone 9',
        'sex' => 'Female',
        'contact_number' => '09171234567',
    ]);

    $this->actingAs($resident)
        ->get(route('resident.request.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/request')
            ->where('resident.contact_number', '09171234567')
            ->missing('resident.first_name')
            ->missing('resident.middle_name')
            ->missing('resident.surname')
            ->missing('resident.birthdate')
            ->missing('resident.address')
            ->missing('resident.zone')
            ->missing('resident.sex'));
});

test('request form uses the authenticated profile rather than an old request snapshot', function () {
    $resident = requestResident([
        'first_name' => 'Current',
        'middle_name' => 'Profile',
        'surname' => 'Values',
        'birthdate' => '2000-01-01',
        'address' => 'Current profile address',
        'zone' => 'Zone 5',
        'sex' => 'Male',
        'contact_number' => '09179999999',
    ]);
    $documentType = DocumentType::query()->firstOrFail();

    $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'First request',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'first_name' => 'First',
        'middle_name' => 'Request',
        'surname' => 'Details',
        'birthdate' => '1990-05-12',
        'address' => 'First request address',
        'zone' => 'Zone 2',
        'sex' => 'Female',
        'contact_number' => '09171111111',
    ]);
    $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Second request',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'first_name' => 'Second',
        'middle_name' => 'Request',
        'surname' => 'Details',
        'birthdate' => '2000-01-01',
        'address' => 'Second request address',
        'zone' => 'Zone 5',
        'sex' => 'Male',
        'contact_number' => '09172222222',
    ]);

    $this->actingAs($resident)
        ->get(route('resident.request.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/request')
            ->where('resident.contact_number', '09179999999')
            ->missing('resident.first_name')
            ->missing('resident.address'));
});

test('residents must upload a GCash receipt to submit a request', function () {
    Storage::fake('local');
    Storage::fake('public');
    GcashPaymentSetting::query()->create([
        'gcash_number' => '09171234567',
        'qr_code_path' => requestIdentityImage('gcash-qr.png')->store('gcash', 'public'),
    ]);
    $resident = requestResident();
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
        ->assertSessionHasErrors('payment_receipt');

    $this->assertDatabaseCount('document_requests', 0);
});

test('residents cannot select GCash until the admin configures payment details', function () {
    $resident = requestResident();
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->get(route('resident.request.create'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/request')
            ->where('gcashPayment.configured', false));

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
        ->assertSessionHasErrors('payment_method');

    $this->assertDatabaseCount('document_requests', 0);
});

test('admins can update the GCash payment number and QR code', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['role' => 'super_admin']);

    $this->actingAs($admin)
        ->patch(route('admin.settings.gcash-payment.update'), [
            'gcash_number' => '09171234567',
            'qr_code' => requestIdentityImage('gcash-qr.png'),
        ])
        ->assertRedirect(route('admin.settings'));

    $setting = GcashPaymentSetting::query()->firstOrFail();
    expect($setting->gcash_number)->toBe('09171234567');
    Storage::disk('public')->assertExists($setting->qr_code_path);

    $this->actingAs($admin)
        ->get(route('admin.settings'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/settings')
            ->where('gcashPayment.configured', true)
            ->where('gcashPayment.gcash_number', '09171234567')
            ->where('gcashPayment.qr_code_url', Storage::disk('public')->url($setting->qr_code_path)));
});

test('secretaries cannot verify a GCash payment without an uploaded receipt', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'identity_status' => 'verified',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
        ->assertSessionHasErrors('payment_status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'payment_status' => 'unpaid',
    ]);
});

test('secretaries cannot verify payment before the requester ID is verified', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'payment_receipt_path' => requestIdentityImage('gcash-receipt.png')
            ->store('payment-receipts', 'local'),
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
        ->assertSessionHasErrors('payment_status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'payment_status' => 'unpaid',
        'identity_status' => 'pending',
    ]);
});

test('secretaries can preview a GCash receipt but residents cannot access it', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $receiptPath = requestIdentityImage('gcash-receipt.png')
        ->store('payment-receipts', 'local');
    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'payment_receipt_path' => $receiptPath,
        'identity_status' => 'pending',
    ]);

    $this->actingAs($secretary)
        ->get(route('secretary.requests.payment-receipt', $documentRequest))
        ->assertOk()
        ->assertHeader('Content-Type', 'image/png')
        ->assertHeader('Content-Disposition', "inline; filename=\"gcash-receipt-request-{$documentRequest->id}.png\"");

    $this->actingAs($resident)
        ->get(route('secretary.requests.payment-receipt', $documentRequest))
        ->assertForbidden();

    $this->actingAs($secretary)
        ->get(route('secretary.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/requests')
            ->where('requests.0.payment_receipt_url', route('secretary.requests.payment-receipt', $documentRequest)));
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
    $resident = requestResident();
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

test('only the requester contact number is required from personal details', function () {
    $resident = requestResident();
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
            'id_document_front' => requestIdentityImage('front.png'),
            'id_document_back' => requestIdentityImage('back.png'),
        ])
        ->assertSessionHasErrors(['contact_number']);

    expect(DocumentRequest::query()->count())->toBe(0);
});

test('residents cannot submit an invalid request contact number', function () {
    $resident = requestResident();
    $documentType = DocumentType::query()->firstOrFail();

    $this->actingAs($resident)
        ->post(route('resident.requests.store'), [
            ...requestPersonalDetails(),
            'contact_number' => 'not a phone',
            'document_type_id' => $documentType->id,
            'purpose' => 'Employment requirement',
            'payment_method' => 'cash',
            'id_is_valid' => true,
            'id_document_front' => requestIdentityImage('front.png'),
            'id_document_back' => requestIdentityImage('back.png'),
        ])
        ->assertSessionHasErrors('contact_number');

    $this->assertDatabaseCount('document_requests', 0);
});

test('secretaries can view the saved requester details and view both ID sides inline', function () {
    Storage::fake('local');
    $resident = requestResident();
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
            ->where('requests.0.requester_details.contact_number', '+63 (917) 123-4567')
            ->where('requests.0.requester_details.first_name', 'Resident')
            ->where('requests.0.requester_details.middle_name', 'Maria')
            ->where('requests.0.requester_details.surname', 'Applicant')
            ->where('requests.0.requester_details.address', 'Registered address')
            ->where('requests.0.requester_details.zone', 'Registered zone')
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
    Storage::fake('local');

    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();
    $receiptPath = 'payment-receipts/receipt.png';
    Storage::disk('local')->put($receiptPath, 'receipt image');

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
        'payment_receipt_path' => $receiptPath,
    ]);

    $this->actingAs($secretary)
        ->get(route('secretary.processed-documents'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/processed-documents')
            ->where('summary.totalProcessed', 1)
            ->where('summary.processing', 1)
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $processed->id)
            ->where(
                'requests.data.0.payment_receipt_url',
                route('secretary.requests.payment-receipt', $processed),
            )
            ->where('requests.data.0.requester_details.contact_number', '09171234567'));

    $this->actingAs($secretary)
        ->get(route('secretary.processed-documents', ['search' => 'Resident Applicant']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/processed-documents')
            ->where('search', 'Resident Applicant')
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $processed->id));

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
        'id' => (string) Str::uuid(),
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
        $notificationIds[] = $id = (string) Str::uuid();
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

    $otherNotificationId = (string) Str::uuid();
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

test('secretaries can mark requests ready and notify the resident', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'processing',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'payment_receipt_path' => requestIdentityImage('gcash-receipt.png')
            ->store('payment-receipts', 'local'),
        'identity_status' => 'verified',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'ready',
            'payment_status' => 'unpaid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'processing',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
        ->assertRedirect();

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'ready',
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
        ->not->toContain(' on ')
        ->toContain('claim it in person');
});

test('marking a ready cash request paid automatically records it as claimed for secretary and resident', function () {
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
        'identity_status_locked' => true,
        'first_name' => 'Maria',
        'surname' => 'Santos',
        'id_document_front_path' => UploadedFile::fake()
            ->createWithContent('resident-id-front.pdf', "%PDF-1.4\nfront\n%%EOF")
            ->store('resident-ids', 'local'),
        'id_document_back_path' => UploadedFile::fake()
            ->createWithContent('resident-id-back.pdf', "%PDF-1.4\nback\n%%EOF")
            ->store('resident-ids', 'local'),
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'ready',
            'payment_status' => 'unpaid',
            'identity_status' => 'verified',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'ready',
        'payment_status' => 'unpaid',
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'claimed',
        'payment_status' => 'paid',
        'claimed_by_name' => 'Maria Santos',
        'processed_by' => $secretary->id,
    ]);
    expect($documentRequest->fresh()->claimed_at)->not->toBeNull();

    $this->actingAs($secretary)
        ->get(route('secretary.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/requests')
            ->where('requests.0.status', 'claimed'));

    $this->actingAs($resident)
        ->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->where('requests.0.status', 'claimed')
            ->where('requests.0.claimed_by_name', 'Maria Santos')
            ->has('requests.0.claimed_at'));

    $this->actingAs($secretary)
        ->get(route('secretary.claimed-documents', ['search' => 'Maria Santos']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/claimed-documents')
            ->where('search', 'Maria Santos')
            ->has('requests.data', 1)
            ->where('requests.data.0.id', $documentRequest->id));
});

test('secretary monthly claimed report groups records by type using claimed date', function () {
    $secretary = User::factory()->create(['role' => 'secretary']);
    $resident = User::factory()->create([
        'role' => 'resident',
        'name' => 'Maria Santos',
        'email' => 'maria@example.test',
    ]);
    $clearance = DocumentType::query()->where('name', 'Barangay Clearance')->firstOrFail();
    $residency = DocumentType::query()->where('name', 'Certificate of Residency')->firstOrFail();
    $indigency = DocumentType::query()->where('name', 'Certificate of Indigency')->firstOrFail();

    $resident->documentRequests()->create([
        'document_type_id' => $clearance->id,
        'purpose' => 'Selected period claim',
        'status' => 'claimed',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'contact_number' => '09998887777',
        'address' => 'Submitted request address',
        'zone' => 'Zone 2',
        'claimed_at' => '2026-05-12 10:00:00',
        'ready_at' => '2026-04-30 10:00:00',
    ]);
    $resident->documentRequests()->create([
        'document_type_id' => $clearance->id,
        'purpose' => 'Outside period claim',
        'status' => 'claimed',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'claimed_at' => '2026-04-30 10:00:00',
        'ready_at' => '2026-05-01 10:00:00',
    ]);
    $resident->documentRequests()->create([
        'document_type_id' => $residency->id,
        'purpose' => 'Second selected period claim',
        'status' => 'claimed',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'claimed_at' => '2026-05-20 14:00:00',
    ]);
    $resident->documentRequests()->create([
        'document_type_id' => $indigency->id,
        'purpose' => 'Not actually claimed',
        'status' => 'ready',
        'payment_method' => 'cash',
        'payment_status' => 'paid',
        'claimed_at' => '2026-05-21 14:00:00',
    ]);

    $this->actingAs($secretary)
        ->get(route('secretary.claimed-documents', ['month' => '2026-05']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/claimed-documents')
            ->where('report.month', '2026-05')
            ->where('report.month_label', 'May 2026')
            ->where('report.total', 2)
            ->has('report.categories', 2)
            ->where('report.categories.0.type', 'Barangay Clearance')
            ->where('report.categories.0.total', 1)
            ->where('report.categories.0.records.0.resident_name', 'Maria Santos')
            ->where('report.categories.0.records.0.contact_number', '09998887777')
            ->where('report.categories.0.records.0.email', 'maria@example.test')
            ->where('report.categories.0.records.0.address', 'Zone 2, Submitted request address')
            ->where('report.categories.0.records.0.payment', 'cash')
            ->where('report.categories.1.type', 'Certificate of Residency')
            ->where('report.categories.1.total', 1));
});

test('marking a request paid notifies the resident once', function () {
    Storage::fake('local');
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'gcash',
        'payment_status' => 'unpaid',
        'payment_receipt_path' => requestIdentityImage('gcash-receipt.png')
            ->store('payment-receipts', 'local'),
        'identity_status' => 'verified',
        'id_document_path' => UploadedFile::fake()->createWithContent(
            'resident-id.pdf',
            "%PDF-1.4\nresident identity document\n%%EOF",
        )->store('resident-ids', 'local'),
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.update', $documentRequest), [
            'status' => 'pending',
            'payment_status' => 'paid',
            'identity_status' => 'verified',
        ])
        ->assertSessionHasErrors('payment_status');

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
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

    $this->patch(route('secretary.requests.payment.paid', $documentRequest))
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
        'payment_receipt_path' => requestIdentityImage('gcash-receipt.png')
            ->store('payment-receipts', 'local'),
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

test('monthly claimed reports include only that month and group by requested document type', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $typeA = DocumentType::query()->create([
        'name' => 'Monthly Report Type A',
        'description' => 'First report category.',
        'fee' => 0,
        'is_active' => true,
    ]);
    $typeB = DocumentType::query()->create([
        'name' => 'Monthly Report Type B',
        'description' => 'Second report category.',
        'fee' => 0,
        'is_active' => true,
    ]);

    foreach ([
        [$typeA, '2026-09-01 00:00:00', 'September A'],
        [$typeB, '2026-09-30 23:59:59', 'September B'],
        [$typeB, '2026-10-01 00:00:00', 'October B'],
    ] as [$documentType, $claimedAt, $claimant]) {
        $resident->documentRequests()->create([
            'document_type_id' => $documentType->id,
            'purpose' => 'Monthly report test',
            'status' => 'claimed',
            'payment_method' => 'cash',
            'payment_status' => 'paid',
            'claimed_at' => $claimedAt,
            'claimed_by_name' => $claimant,
            'processed_by' => $secretary->id,
        ]);
    }

    $this->actingAs($secretary)
        ->get(route('secretary.claimed-documents', ['month' => '2026-09']))
        ->assertInertia(fn (Assert $page) => $page
            ->component('secretary/claimed-documents')
            ->where('report.month', '2026-09')
            ->where('report.total', 2)
            ->where('requests.total', 2)
            ->has('requests.data', 2)
            ->where('requests.data.0.document_type.name', 'Monthly Report Type B')
            ->where('requests.data.1.document_type.name', 'Monthly Report Type A')
            ->has('report.categories', 2)
            ->where('report.categories.0.type', 'Monthly Report Type A')
            ->where('report.categories.0.total', 1)
            ->where('report.categories.0.records.0.resident_name', 'September A')
            ->where('report.categories.1.type', 'Monthly Report Type B')
            ->where('report.categories.1.total', 1)
            ->where('report.categories.1.records.0.resident_name', 'September B'));
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

test('secretaries cannot mark payment paid after the requester ID is rejected', function () {
    $resident = User::factory()->create(['role' => 'resident']);
    $secretary = User::factory()->create(['role' => 'secretary']);
    $documentType = DocumentType::query()->firstOrFail();

    $documentRequest = $resident->documentRequests()->create([
        'document_type_id' => $documentType->id,
        'purpose' => 'Employment requirement',
        'status' => 'pending',
        'payment_method' => 'cash',
        'payment_status' => 'unpaid',
        'identity_status' => 'rejected',
        'identity_status_locked' => true,
    ]);

    $this->actingAs($secretary)
        ->patch(route('secretary.requests.payment.paid', $documentRequest))
        ->assertSessionHasErrors('payment_status');

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'payment_status' => 'unpaid',
        'identity_status' => 'rejected',
    ]);
});

test('rejecting a requester ID also rejects the request and notifies the resident', function () {
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
            'identity_status' => 'rejected',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('document_requests', [
        'id' => $documentRequest->id,
        'status' => 'rejected',
        'identity_status' => 'rejected',
        'identity_status_locked' => true,
    ]);

    $this->assertDatabaseHas('activity_logs', [
        'actor_id' => $secretary->id,
        'event' => 'request.status_changed',
        'subject_id' => (string) $documentRequest->id,
    ]);

    $this->assertDatabaseHas('notifications', [
        'notifiable_id' => $resident->id,
        'type' => 'App\\Notifications\\RequestRejectedNotification',
    ]);

    $this->actingAs($resident)
        ->get(route('resident.requests'))
        ->assertInertia(fn (Assert $page) => $page
            ->component('resident/requests')
            ->where('requests.0.status', 'rejected'));
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
