<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gcash_payment_settings', function (Blueprint $table) {
            $table->id();
            $table->string('gcash_number', 20)->nullable();
            $table->string('qr_code_path')->nullable();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gcash_payment_settings');
    }
};
