<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->string('contact_number', 20)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('address')->nullable();
            $table->string('zone', 100)->nullable();
            $table->string('sex', 20)->nullable();
            $table->string('id_document_front_path')->nullable();
            $table->string('id_document_back_path')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn([
                'contact_number',
                'first_name',
                'middle_name',
                'surname',
                'birthdate',
                'address',
                'zone',
                'sex',
                'id_document_front_path',
                'id_document_back_path',
            ]);
        });
    }
};
