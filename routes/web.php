<?php

use App\Http\Controllers\ActivityReportController;
use App\Http\Controllers\AdminManagementController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentRequestController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\PhoneVerificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::get('/', [LandingPageController::class, 'show'])->name('home');

Route::get('/phone/verify', [
    PhoneVerificationController::class,
    'show',
])->name('phone.verification.show');

Route::post('/phone/verify/send', [
    PhoneVerificationController::class,
    'send',
])
    ->middleware('throttle:3,1')
    ->name('phone.verification.send');

Route::post('/phone/verify', [
    PhoneVerificationController::class,
    'verify',
])
    ->middleware('throttle:6,1')
    ->name('phone.verification.verify');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Generic Dashboard Redirect
    |--------------------------------------------------------------------------
    */

    Route::get('/dashboard', function (Request $request) {
        $documentRequestController = app(DocumentRequestController::class);

        return match ($request->user()->role) {
            'super_admin' => app(DashboardController::class)->admin($request),
            'secretary' => $documentRequestController->secretaryDashboard($request),
            'resident' => $documentRequestController->residentDashboard($request),

            default => redirect()->route('home'),
        };
    })->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | SUPER ADMIN
    |--------------------------------------------------------------------------
    */

    Route::prefix('admin')
        ->name('admin.')
        ->middleware('role:super_admin')
        ->group(function () {

            /*
            |--------------------------------------------------------------------------
            | Admin Dashboard
            |--------------------------------------------------------------------------
            */

            Route::get('/dashboard', [
                DashboardController::class,
                'admin',
            ])->name('dashboard');

            Route::get('/landing-page', [
                LandingPageController::class,
                'edit',
            ])->name('landing-page.edit');

            Route::put('/landing-page', [
                LandingPageController::class,
                'update',
            ])->name('landing-page.update');

            /*
            |--------------------------------------------------------------------------
            | User Management
            |--------------------------------------------------------------------------
            */

            Route::get('/users', function () {
                return app(DocumentRequestController::class)->adminUsers();
            })->name('users');

            /*
            |--------------------------------------------------------------------------
            | Residents
            |--------------------------------------------------------------------------
            */

            Route::get('/residents', function () {
                return app(DocumentRequestController::class)->adminResidents();
            })->name('residents');

            /*
            |--------------------------------------------------------------------------
            | Barangay Staff
            |--------------------------------------------------------------------------
            */

            Route::get('/staff', [
                AdminManagementController::class,
                'staff',
            ])->name('staff');

            Route::post('/staff', [
                AdminManagementController::class,
                'storeStaff',
            ])->name('staff.store');

            /*
            |--------------------------------------------------------------------------
            | Document Types
            |--------------------------------------------------------------------------
            */

            Route::get('/document-types', [
                AdminManagementController::class,
                'documentTypes',
            ])->name('document-types');

            Route::post('/document-types', [
                AdminManagementController::class,
                'storeDocumentType',
            ])->name('document-types.store');

            Route::patch('/document-types/{documentType}', [
                AdminManagementController::class,
                'updateDocumentType',
            ])->name('document-types.update');

            /*
            |--------------------------------------------------------------------------
            | Document Requests
            |--------------------------------------------------------------------------
            */

            Route::get('/requests', function () {
                return app(DocumentRequestController::class)->adminRequests();
            })->name('requests');

            /*
            |--------------------------------------------------------------------------
            | Reports
            |--------------------------------------------------------------------------
            */

            Route::get('/reports', [
                ActivityReportController::class,
                'admin',
            ])->name('reports');

            /*
            |--------------------------------------------------------------------------
            | System Settings
            |--------------------------------------------------------------------------
            */

            Route::get('/settings', function () {
                return Inertia::render('admin/settings');
            })->name('settings');
        });

    /*
    |--------------------------------------------------------------------------
    | BARANGAY SECRETARY
    |--------------------------------------------------------------------------
    */

    Route::get('/secretary/dashboard', [
        DocumentRequestController::class,
        'secretaryDashboard',
    ])
        ->middleware('role:secretary')
        ->name('secretary.dashboard');

    Route::get('/secretary/requests', [
        DocumentRequestController::class,
        'secretaryRequests',
    ])
        ->middleware('role:secretary')
        ->name('secretary.requests');

    Route::patch('/secretary/requests/{documentRequest}', [
        DocumentRequestController::class,
        'update',
    ])
        ->middleware('role:secretary')
        ->name('secretary.requests.update');

    Route::post('/secretary/requests/{documentRequest}/claim', [
        DocumentRequestController::class,
        'claim',
    ])
        ->middleware('role:secretary')
        ->name('secretary.requests.claim');

    Route::get('/secretary/requests/{documentRequest}/identity', [
        DocumentRequestController::class,
        'previewIdentity',
    ])
        ->middleware('role:secretary')
        ->name('secretary.requests.identity');

    Route::get('/secretary/requests/{documentRequest}/identity/image', [
        DocumentRequestController::class,
        'showIdentityImage',
    ])
        ->middleware('role:secretary')
        ->name('secretary.requests.identity.image');

    Route::get('/secretary/requests/{documentRequest}/identity/back', [
        DocumentRequestController::class,
        'previewIdentity',
    ])
        ->defaults('side', 'back')
        ->middleware('role:secretary')
        ->name('secretary.requests.identity.back');

    Route::get('/secretary/requests/{documentRequest}/identity/back/image', [
        DocumentRequestController::class,
        'showIdentityImage',
    ])
        ->defaults('side', 'back')
        ->middleware('role:secretary')
        ->name('secretary.requests.identity.image.back');

    Route::get('/secretary/processed-documents', [
        DocumentRequestController::class,
        'secretaryProcessedDocuments',
    ])
        ->middleware('role:secretary')
        ->name('secretary.processed-documents');

    Route::get('/secretary/claimed-documents', [
        DocumentRequestController::class,
        'secretaryClaimedDocuments',
    ])
        ->middleware('role:secretary')
        ->name('secretary.claimed-documents');

    /*
    |--------------------------------------------------------------------------
    | RESIDENT
    |--------------------------------------------------------------------------
    */

    Route::get('/resident/dashboard', [
        DocumentRequestController::class,
        'residentDashboard',
    ])
        ->middleware('role:resident')
        ->name('resident.dashboard');

    Route::get('/resident/notifications', [
        DocumentRequestController::class,
        'residentNotifications',
    ])
        ->middleware('role:resident')
        ->name('resident.notifications');

    Route::patch('/resident/notifications/{notificationId}/read', [
        DocumentRequestController::class,
        'markNotificationAsRead',
    ])
        ->middleware('role:resident')
        ->name('resident.notifications.read');

    Route::get('/resident/request', [
        DocumentRequestController::class,
        'create',
    ])
        ->middleware('role:resident')
        ->name('resident.request.create');

    Route::post('/resident/requests', [
        DocumentRequestController::class,
        'store',
    ])
        ->middleware('role:resident')
        ->name('resident.requests.store');

    Route::get('/resident/requests', [
        DocumentRequestController::class,
        'residentRequests',
    ])
        ->middleware('role:resident')
        ->name('resident.requests');
});

/*
|--------------------------------------------------------------------------
| Settings Routes
|--------------------------------------------------------------------------
*/

require __DIR__.'/settings.php';
