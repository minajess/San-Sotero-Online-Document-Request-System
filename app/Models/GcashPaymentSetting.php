<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GcashPaymentSetting extends Model
{
    protected $fillable = [
        'gcash_number',
        'qr_code_path',
        'updated_by',
    ];
}
