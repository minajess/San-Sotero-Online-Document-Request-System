<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\DocumentType;
use App\Models\User;
use App\Support\PersonalInformation;
use App\Support\PhilippineMobileNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class AdminManagementController extends Controller
{
    public function staff(): Response
    {
        return Inertia::render('admin/staff', [
            'staff' => User::query()
                ->where('role', 'secretary')
                ->latest()
                ->get(['id', 'name', 'email', 'contact_number', 'phone_verified_at', 'created_at'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'contact_number' => $user->contact_number,
                    'phone_verified_at' => $user->phone_verified_at,
                    'created_at' => $user->created_at,
                ]),
        ]);
    }

    public function storeStaff(Request $request): RedirectResponse
    {
        $information = $request->validate([
            ...PersonalInformation::validationRules($request->all()),
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'contact_number' => [
                'nullable',
                'string',
                PhilippineMobileNumber::RULE,
                Rule::unique('users', 'contact_number')->whereNotNull('contact_number'),
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $middleNameNotApplicable = filter_var(
            $information['middle_name_na'],
            FILTER_VALIDATE_BOOLEAN,
        );

        $staff = User::create([
            'name' => PersonalInformation::fullName($information),
            'first_name' => trim($information['first_name']),
            'middle_name' => $middleNameNotApplicable
                ? null
                : trim($information['middle_name']),
            'surname' => trim($information['surname']),
            'birthdate' => $information['birthdate'],
            'address' => trim($information['address']),
            'zone' => trim($information['zone']),
            'sex' => $information['sex'],
            'email' => $information['email'],
            'contact_number' => isset($information['contact_number'])
                ? PhilippineMobileNumber::normalize($information['contact_number'])
                : null,
            'password' => $information['password'],
            'role' => 'secretary',
        ]);

        ActivityLog::record(
                $request->user(),
                'staff.created',
                "Added barangay secretary {$staff->name}.",
                $staff,
                ['email' => $staff->email],
        );

        return to_route('admin.staff')
            ->with('success', 'Barangay staff account created.');
    }

    public function documentTypes(): Response
    {
        return Inertia::render('admin/document-types', [
            'documents' => DocumentType::query()
                ->orderBy('name')
                ->get(['id', 'name', 'description', 'fee', 'is_active']),
        ]);
    }

    public function storeDocumentType(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:document_types,name'],
            'description' => ['nullable', 'string', 'max:2000'],
            'fee' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_active' => ['required', 'boolean'],
        ]);

        $documentType = DocumentType::create($validated);

        ActivityLog::record(
            $request->user(),
            'document_type.created',
            "Added document type {$documentType->name}.",
            $documentType,
            [
                'fee' => $documentType->fee,
                'is_active' => $documentType->is_active,
            ],
        );

        return to_route('admin.document-types')
            ->with('success', 'Document type added.');
    }

    public function updateDocumentType(Request $request, DocumentType $documentType): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('document_types', 'name')->ignore($documentType->id),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'fee' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_active' => ['required', 'boolean'],
        ]);

        $previous = [
            'name' => $documentType->name,
            'fee' => $documentType->fee,
            'is_active' => $documentType->is_active,
        ];
        $documentType->update($validated);

        ActivityLog::record(
            $request->user(),
            'document_type.updated',
            "Updated document type {$documentType->name}.",
            $documentType,
            [
                'before' => $previous,
                'after' => [
                    'name' => $documentType->name,
                    'fee' => $documentType->fee,
                    'is_active' => $documentType->is_active,
                ],
            ],
        );

        return to_route('admin.document-types')
            ->with('success', 'Document type updated.');
    }
}
