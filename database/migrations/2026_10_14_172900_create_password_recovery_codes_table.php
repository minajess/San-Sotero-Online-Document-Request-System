<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_recovery_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('code_hash')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('reset_token_hash')->nullable();
            $table->timestamp('reset_expires_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_recovery_codes');
    }
};
