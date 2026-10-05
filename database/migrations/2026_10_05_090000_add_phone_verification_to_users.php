<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('contact_number')->nullable()->unique();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('phone_verification_code_hash')->nullable();
            $table->timestamp('phone_verification_expires_at')->nullable();
            $table->unsignedTinyInteger('phone_verification_attempts')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['contact_number']);
            $table->dropColumn([
                'contact_number',
                'phone_verified_at',
                'phone_verification_code_hash',
                'phone_verification_expires_at',
                'phone_verification_attempts',
            ]);
        });
    }
};
