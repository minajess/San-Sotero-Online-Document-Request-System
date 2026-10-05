<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->boolean('identity_status_locked')->default(false);
        });

        DB::table('document_requests')
            ->where('identity_status', '!=', 'pending')
            ->update(['identity_status_locked' => true]);
    }

    public function down(): void
    {
        Schema::table('document_requests', function (Blueprint $table) {
            $table->dropColumn('identity_status_locked');
        });
    }
};
