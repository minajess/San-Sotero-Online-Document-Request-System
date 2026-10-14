<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('document_requests')
            ->where('identity_status', 'rejected')
            ->whereNotIn('status', ['claimed', 'rejected'])
            ->update(['status' => 'rejected']);
    }

    public function down(): void {}
};
