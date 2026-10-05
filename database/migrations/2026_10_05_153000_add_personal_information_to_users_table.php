<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->string('surname', 100)->nullable();
            $table->date('birthdate')->nullable();
            $table->string('address')->nullable();
            $table->string('zone', 100)->nullable();
            $table->string('sex', 20)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'middle_name',
                'surname',
                'birthdate',
                'address',
                'zone',
                'sex',
            ]);
        });
    }
};
