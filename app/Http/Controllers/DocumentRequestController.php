<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DocumentRequest as BarangayDocumentRequest;
use App\Models\DocumentType;
use App\Models\User;
use App\Notifications\DocumentReadyNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\RequestRejectedNotification;
use App\Support\PersonalInformation;
use App\Support\PhilippineMobileNumber;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentRequestController extends Controller
{
    public function residentDashboard(HttpRequest $request): Response
    {
        return Inertia::render('resident/dashboard', [
            ...$this->residentProps($request),
            'requests' => $this->residentQuery($request)
                ->latest()
                ->take(5)
                ->get(),
        ]);
    }

    public function residentRequests(HttpRequest $request): Response
    {
        return Inertia::render('resident/requests', [
            ...$this->residentProps($request),
            'requests' => $this->residentQuery($request)->latest()->get(),
        ]);
    }

    public function residentNotifications(HttpRequest $request): Response
    {
        return Inertia::render('resident/notifications', [
            'notifications' => $request->user()->notifications()
                ->latest()
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'title' => $notification->data['title'] ?? 'Update',
                    'message' => $notification->data['message'] ?? '',
                    'created_at' => $notification->created_at?->toIso8601String(),
                    'read_at' => $notification->read_at?->toIso8601String(),
                ]),
            'unreadNotificationsCount' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markNotificationAsRead(HttpRequest $request, string $notificationId): RedirectResponse
    {
        $notification = $request->user()->notifications()
            ->whereKey($notificationId)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return back();
    }

    public function create(HttpRequest $request): Response
    {
        return Inertia::render('resident/request', [
            'documentTypes' => DocumentType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'fee']),
            'resident' => $request->user()->only([
                'first_name',
                'middle_name',
                'surname',
                'birthdate',
                'address',
                'zone',
                'sex',
                'contact_number',
            ]),
        ]);
    }

    public function store(HttpRequest $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_type_id' => [
                'required',
                'integer',
                Rule::exists('document_types', 'id')->where('is_active', true),
            ],
            'purpose' => ['required', 'string', 'max:2000'],
            'payment_method' => ['required', Rule::in(['cash', 'gcash'])],
            'payment_reference' => ['required_if:payment_method,gcash', 'nullable', 'string', 'max:100'],
            ...PersonalInformation::validationRules($request->all()),
            'contact_number' => [
                'required',
                'string',
                PhilippineMobileNumber::RULE,
            ],
            'id_document_front' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'id_document_back' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'id_is_valid' => ['required', 'accepted'],
        ]);

        $frontPath = $validated['id_document_front']->store('resident-ids', 'local');
        $backPath = $validated['id_document_back']->store('resident-ids', 'local');

        if (! is_string($frontPath) || ! is_string($backPath)) {
            if (is_string($frontPath)) {
                Storage::disk('local')->delete($frontPath);
            }
            if (is_string($backPath)) {
                Storage::disk('local')->delete($backPath);
            }

            throw new \RuntimeException('The resident ID images could not be stored.');
        }

        $middleNameNotApplicable = filter_var(
            $validated['middle_name_na'],
            FILTER_VALIDATE_BOOLEAN,
        );

        $documentRequest = $request->user()->documentRequests()->create([
            'document_type_id' => $validated['document_type_id'],
            'purpose' => $validated['purpose'],
            'payment_method' => $validated['payment_method'],
            'payment_reference' => $validated['payment_reference'] ?? null,
            'contact_number' => PhilippineMobileNumber::normalize($validated['contact_number']),
            'first_name' => trim($validated['first_name']),
            'middle_name' => $middleNameNotApplicable
                ? null
                : trim($validated['middle_name']),
            'surname' => trim($validated['surname']),
            'birthdate' => $validated['birthdate'],
            'address' => trim($validated['address']),
            'zone' => trim($validated['zone']),
            'sex' => $validated['sex'],
            'status' => 'pending',
            'payment_status' => $validated['payment_method'] === 'gcash'
                ? 'paid'
                : 'unpaid',
            'identity_status' => 'pending',
            'id_document_front_path' => $frontPath,
            'id_document_back_path' => $backPath,
            'id_document_path' => $frontPath,
        ]);

        ActivityLog::record(
            $request->user(),
            'request.submitted',
            "Submitted a {$documentRequest->documentType->name} request.",
            $documentRequest,
            [
                'payment_method' => $documentRequest->payment_method,
                'identity_status' => $documentRequest->identity_status,
            ],
        );

        return to_route('resident.requests')
            ->with('success', 'Your document request has been submitted.');
    }

    public function secretaryDashboard(HttpRequest $request): Response
    {
        return Inertia::render('secretary/dashboard', [
            'statistics' => [
                'totalRequests' => BarangayDocumentRequest::count(),
                'pendingRequests' => BarangayDocumentRequest::where('status', 'pending')->count(),
                'processingRequests' => BarangayDocumentRequest::where('status', 'processing')->count(),
                'totalResidents' => User::where('role', 'resident')->count(),
            ],
            'requests' => $this->requestRows(8),
        ]);
    }

    public function secretaryRequests(): Response
    {
        return Inertia::render('secretary/requests', [
            'requests' => $this->requestRows(includeIdentityUrl: true),
        ]);
    }

    public function secretaryProcessedDocuments(): Response
    {
        $processedRequests = BarangayDocumentRequest::query()
            ->where('status', '!=', 'pending');

        $requests = (clone $processedRequests)
            ->with([
                'resident:id,name,email',
                'documentType:id,name,fee',
            ])
            ->latest()
            ->paginate(25)
            ->withQueryString();

        $requests->through(function (BarangayDocumentRequest $request): array {
            $row = $request->toArray();
            $row['identity_document_url'] = is_string($request->id_document_front_path)
                ? route('secretary.requests.identity', $request)
                : (is_string($request->id_document_path)
                    ? route('secretary.requests.identity', $request)
                    : null);
            $row['identity_document_back_url'] = is_string($request->id_document_back_path)
                ? route('secretary.requests.identity.back', $request)
                : null;
            $row['requester_details'] = [
                'first_name' => $request->first_name,
                'middle_name' => $request->middle_name,
                'surname' => $request->surname,
                'birthdate' => $request->birthdate,
                'address' => $request->address,
                'zone' => $request->zone,
                'sex' => $request->sex,
                'contact_number' => $request->contact_number,
            ];

            return $row;
        });

        return Inertia::render('secretary/processed-documents', [
            'summary' => [
                'totalProcessed' => (clone $processedRequests)->count(),
                'processing' => (clone $processedRequests)->where('status', 'processing')->count(),
                'readyToClaim' => (clone $processedRequests)->where('status', 'ready')->count(),
                'claimed' => (clone $processedRequests)->where('status', 'claimed')->count(),
                'rejected' => (clone $processedRequests)->where('status', 'rejected')->count(),
            ],
            'requests' => $requests,
        ]);
    }

    public function secretaryClaimedDocuments(): Response
    {
        $requests = BarangayDocumentRequest::query()
            ->where('status', 'claimed')
            ->with([
                'resident:id,name,email',
                'documentType:id,name,fee',
            ])
            ->latest('claimed_at')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('secretary/claimed-documents', [
            'requests' => $requests,
        ]);
    }

    public function previewIdentity(
        HttpRequest $request,
        BarangayDocumentRequest $documentRequest,
        string $side = 'front',
    ): HttpResponse {
        $path = $this->identityImagePath($documentRequest, $side);

        ActivityLog::record(
            $request->user(),
            'identity.document_viewed',
            "Viewed the resident ID for request #{$documentRequest->id}.",
            $documentRequest,
        );

        return response()->view('identity-preview', [
            'imageUrl' => route(
                $side === 'back'
                    ? 'secretary.requests.identity.image.back'
                    : 'secretary.requests.identity.image',
                $documentRequest,
            ),
            'title' => "Resident ID - Request #{$documentRequest->id}",
            'sideLabel' => $side === 'back' ? 'Back of ID' : 'Front of ID',
            'requestId' => $documentRequest->id,
        ])->header('Cache-Control', 'private, no-store');
    }

    public function showIdentityImage(
        BarangayDocumentRequest $documentRequest,
        string $side = 'front',
    ): StreamedResponse {
        $path = $this->identityImagePath($documentRequest, $side);
        $extension = pathinfo($path, PATHINFO_EXTENSION);
        $hasExplicitSideImage = $side === 'front'
            ? is_string($documentRequest->id_document_front_path)
            : is_string($documentRequest->id_document_back_path);
        $sideSuffix = $hasExplicitSideImage || $side === 'back'
            ? "-{$side}"
            : '';
        $filename = "resident-id-request-{$documentRequest->id}{$sideSuffix}.{$extension}";
        $stream = Storage::disk('local')->readStream($path);

        if (! is_resource($stream)) {
            throw new \RuntimeException('The resident ID image could not be opened.');
        }

        return response()->stream(function () use ($stream): void {
            fpassthru($stream);
            fclose($stream);
        }, 200, [
            'Content-Type' => Storage::disk('local')->mimeType($path) ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="'.$filename.'"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }

    public function adminRequests(): Response
    {
        return Inertia::render('admin/requests', [
            'requests' => $this->requestRows(),
        ]);
    }

    public function adminUsers(): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::query()
                ->withCount('documentRequests')
                ->latest()
                ->get(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    public function adminResidents(): Response
    {
        return Inertia::render('admin/residents', [
            'users' => User::query()
                ->where('role', 'resident')
                ->withCount('documentRequests')
                ->latest()
                ->get(['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }

    public function update(HttpRequest $request, BarangayDocumentRequest $documentRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'processing', 'ready', 'rejected', 'claimed'])],
            'ready_at' => [
                Rule::requiredIf($request->input('status') === 'ready'),
                'nullable',
                'date',
                'after_or_equal:now',
            ],
            'payment_status' => ['required', Rule::in(['unpaid', 'paid'])],
            'identity_status' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
        ]);

        DB::transaction(function () use ($request, $documentRequest, $validated): void {
            $record = BarangayDocumentRequest::query()
                ->lockForUpdate()
                ->findOrFail($documentRequest->id);

            if (in_array($record->status, ['claimed', 'rejected'], true)) {
                throw ValidationException::withMessages([
                    'status' => 'This request is finalized and its processing details are locked.',
                ]);
            }

            if ($record->payment_status === 'paid' && $validated['payment_status'] !== 'paid') {
                throw ValidationException::withMessages([
                    'payment_status' => 'Payment has already been marked as paid and cannot be changed.',
                ]);
            }

            if (
                $record->identity_status_locked
                && $validated['identity_status'] !== $record->identity_status
            ) {
                throw ValidationException::withMessages([
                    'identity_status' => 'ID verification has been saved and locked.',
                ]);
            }

            $allowedTransitions = [
                'pending' => ['pending', 'processing', 'rejected'],
                'processing' => ['processing', 'ready', 'rejected'],
                'ready' => ['ready'],
                'claimed' => ['claimed'],
                'rejected' => ['rejected'],
            ];

            if (! in_array($validated['status'], $allowedTransitions[$record->status] ?? [], true)) {
                throw ValidationException::withMessages([
                    'status' => 'This request cannot move from its current status to the selected status.',
                ]);
            }

            if (
                in_array($validated['status'], ['processing', 'ready', 'claimed'], true)
                && $validated['identity_status'] !== 'verified'
            ) {
                throw ValidationException::withMessages([
                    'identity_status' => 'Verify the resident ID before processing this document request.',
                ]);
            }

            if (
                $validated['identity_status'] === 'verified'
                && (
                    ! $this->hasRequiredIdentityImages($record)
                )
            ) {
                throw ValidationException::withMessages([
                    'identity_status' => 'Both front and back ID images must be available before identity can be verified.',
                ]);
            }

            $previousStatus = $record->status;
            $previousIdentityStatus = $record->identity_status;
            $previousIdentityStatusLocked = $record->identity_status_locked;
            $previousPaymentStatus = $record->payment_status;
            $previousReadyAt = $record->ready_at?->format('Y-m-d H:i:s');

            $record->update([
                'status' => $validated['status'],
                'ready_at' => $validated['status'] === 'ready'
                    ? Carbon::parse($validated['ready_at'], config('app.timezone'))
                    : $record->ready_at,
                'payment_status' => $validated['payment_status'],
                'identity_status' => $validated['identity_status'],
                'identity_status_locked' => true,
                'processed_by' => $request->user()->id,
            ]);

            $readyAtChanged = $previousReadyAt !== $record->ready_at?->format('Y-m-d H:i:s');

            if ($previousStatus !== $record->status) {
                ActivityLog::record(
                    $request->user(),
                    'request.status_changed',
                    "Changed request #{$record->id} from {$previousStatus} to {$record->status}.",
                    $record,
                    [
                        'from' => $previousStatus,
                        'to' => $record->status,
                    ],
                );
            }

            if ($previousIdentityStatus !== $record->identity_status) {
                ActivityLog::record(
                    $request->user(),
                    'identity.status_changed',
                    "Marked the ID for request #{$record->id} as {$record->identity_status}.",
                    $record,
                    [
                        'from' => $previousIdentityStatus,
                        'to' => $record->identity_status,
                    ],
                );
            }

            if (! $previousIdentityStatusLocked) {
                ActivityLog::record(
                    $request->user(),
                    'identity.status_locked',
                    "Saved and locked the ID verification status for request #{$record->id} as {$record->identity_status}.",
                    $record,
                    ['status' => $record->identity_status],
                );
            }

            if ($previousPaymentStatus !== $record->payment_status) {
                ActivityLog::record(
                    $request->user(),
                    'payment.status_changed',
                    "Marked payment for request #{$record->id} as {$record->payment_status}.",
                    $record,
                    [
                        'payment_method' => $record->payment_method,
                        'from' => $previousPaymentStatus,
                        'to' => $record->payment_status,
                    ],
                );

                if ($record->payment_status === 'paid') {
                    $record->load('documentType');
                    $record->resident->notify(new PaymentReceivedNotification($record));
                }
            }

            if ($readyAtChanged && $record->status === 'ready') {
                ActivityLog::record(
                    $request->user(),
                    'request.claim_time_set',
                    "Set the claim time for request #{$record->id} to {$record->ready_at?->format('M j, Y g:i A')}.",
                    $record,
                    ['ready_at' => $record->ready_at?->toIso8601String()],
                );
            }

            if ($record->status === 'ready' && ($previousStatus !== 'ready' || $readyAtChanged)) {
                $record->load('documentType');
                $record->resident->notify(new DocumentReadyNotification($record));
            }

            if ($previousStatus !== 'rejected' && $record->status === 'rejected') {
                $record->load('documentType');
                $record->resident->notify(new RequestRejectedNotification($record));
            }
        });

        return back()->with('success', 'The document request has been updated.');
    }

    public function claim(HttpRequest $request, BarangayDocumentRequest $documentRequest): RedirectResponse
    {
        DB::transaction(function () use ($request, $documentRequest): void {
            $record = BarangayDocumentRequest::query()
                ->lockForUpdate()
                ->findOrFail($documentRequest->id);

            if ($record->status !== 'ready') {
                throw ValidationException::withMessages([
                    'status' => 'Only ready documents can be marked as claimed.',
                ]);
            }

            if ($record->payment_status !== 'paid') {
                throw ValidationException::withMessages([
                    'payment_status' => 'Payment must be recorded before the document can be claimed.',
                ]);
            }

            if ($record->identity_status !== 'verified') {
                throw ValidationException::withMessages([
                    'identity_status' => 'The requester’s identity must be verified before claiming.',
                ]);
            }

            $claimantName = collect([
                $record->first_name,
                $record->middle_name,
                $record->surname,
            ])->filter(fn (?string $name): bool => is_string($name) && trim($name) !== '')
                ->map(fn (string $name): string => trim($name))
                ->implode(' ');

            if ($claimantName === '') {
                $claimantName = $record->resident->name;
            }

            $record->update([
                'status' => 'claimed',
                'claimed_at' => now(),
                'claimed_by_name' => $claimantName,
                'processed_by' => $request->user()->id,
            ]);

            ActivityLog::record(
                $request->user(),
                'request.claimed',
                "Recorded {$claimantName} as claiming request #{$record->id}.",
                $record,
                [
                    'claimed_by_name' => $claimantName,
                    'claimed_at' => $record->claimed_at?->toIso8601String(),
                ],
            );
        });

        return back()->with('success', 'The document claim has been recorded.');
    }

    /**
     * @return array<string, mixed>
     */
    private function residentProps(HttpRequest $request): array
    {
        $requests = $this->residentQuery($request);

        return [
            'user' => $request->user(),
            'statistics' => [
                'totalRequests' => (clone $requests)->count(),
                'pendingRequests' => (clone $requests)->where('status', 'pending')->count(),
                'processingRequests' => (clone $requests)->where('status', 'processing')->count(),
                'readyRequests' => (clone $requests)->where('status', 'ready')->count(),
            ],
            'documentTypes' => DocumentType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'fee']),
            'unreadNotificationsCount' => $request->user()->unreadNotifications()->count(),
        ];
    }

    /**
     * @return Builder<BarangayDocumentRequest>
     */
    private function residentQuery(HttpRequest $request): Builder
    {
        return BarangayDocumentRequest::query()
            ->where('user_id', $request->user()->id)
            ->with('documentType:id,name,fee');
    }

    /**
     * @return Builder<BarangayDocumentRequest>
     */
    private function allRequests(): Builder
    {
        return BarangayDocumentRequest::query()
            ->with([
                'resident:id,name,email',
                'documentType:id,name,fee',
            ])
            ->latest();
    }

    private function hasRequiredIdentityImages(BarangayDocumentRequest $request): bool
    {
        if ($request->id_document_front_path !== null || $request->id_document_back_path !== null) {
            return is_string($request->id_document_front_path)
                && Storage::disk('local')->exists($request->id_document_front_path)
                && is_string($request->id_document_back_path)
                && Storage::disk('local')->exists($request->id_document_back_path);
        }

        return is_string($request->id_document_path)
            && Storage::disk('local')->exists($request->id_document_path);
    }

    private function identityImagePath(BarangayDocumentRequest $documentRequest, string $side): string
    {
        abort_unless(in_array($side, ['front', 'back'], true), 404);

        if ($side === 'back') {
            $path = $documentRequest->id_document_back_path ?? $documentRequest->id_document_path ?? $documentRequest->id_document_front_path;
        } else {
            $path = $documentRequest->id_document_front_path ?? $documentRequest->id_document_path;
        }

        abort_unless(
            is_string($path)
                && Storage::disk('local')->exists($path),
            404,
            'The resident ID image could not be found.',
        );

        return $path;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function requestRows(?int $limit = null, bool $includeIdentityUrl = false): array
    {
        return $this->allRequests()
            ->when($limit, fn (Builder $query) => $query->take($limit))
            ->get()
            ->map(function (BarangayDocumentRequest $request) use ($includeIdentityUrl): array {
                $row = $request->toArray();
                $row['ready_at_input'] = $request->ready_at
                    ?->timezone(config('app.timezone'))
                    ->format('Y-m-d\TH:i');
                $row['identity_document_url'] = $includeIdentityUrl
                    && (
                        is_string($request->id_document_front_path)
                        || is_string($request->id_document_path)
                    )
                    ? route('secretary.requests.identity', $request)
                    : null;
                $row['identity_document_back_url'] = $includeIdentityUrl
                    && is_string($request->id_document_back_path)
                    ? route('secretary.requests.identity.back', $request)
                    : null;
                if ($includeIdentityUrl) {
                    $row['requester_details'] = [
                        'first_name' => $request->first_name,
                        'middle_name' => $request->middle_name,
                        'surname' => $request->surname,
                        'birthdate' => $request->birthdate,
                        'address' => $request->address,
                        'zone' => $request->zone,
                        'sex' => $request->sex,
                        'contact_number' => $request->contact_number,
                    ];
                }

                return $row;
            })
            ->all();
    }
}
