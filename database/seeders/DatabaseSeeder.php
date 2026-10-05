<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\DocumentType;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        foreach ([
            [
                'name' => 'Barangay Clearance',
                'description' => 'For employment, business, and other requirements.',
            ],
            [
                'name' => 'Certificate of Residency',
                'description' => 'Proof of residence in Barangay San Sotero.',
            ],
            [
                'name' => 'Certificate of Indigency',
                'description' => 'Certification for qualified indigent residents.',
            ],
            [
                'name' => 'Barangay Certificate',
                'description' => 'General barangay certification.',
            ],
        ] as $documentType) {
            DocumentType::updateOrCreate(
                ['name' => $documentType['name']],
                [
                    'description' => $documentType['description'],
                    'fee' => 0,
                    'is_active' => true,
                ],
            );
        }

        User::updateOrCreate(
            [
                'email' => 'admin@sansotero.test',
            ],
            [
                'name' => 'Super Administrator',
                'password' => 'password123',
                'role' => 'super_admin',
                'contact_number' => '09000000001',
                'phone_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'secretary@sansotero.test',
            ],
            [
                'name' => 'Barangay Secretary',
                'password' => 'password123',
                'role' => 'secretary',
                'contact_number' => '09000000002',
                'phone_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            [
                'email' => 'resident@sansotero.test',
            ],
            [
                'name' => 'Sample Resident',
                'password' => 'password123',
                'role' => 'resident',
                'contact_number' => '09000000003',
                'phone_verified_at' => now(),
            ]
        );
    }
}