<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string|null $gcash_number
 * @property string|null $qr_code_path
 * @property int|null $updated_by
 */
class GcashPaymentSetting extends Model
{
    protected $fillable = [
        'gcash_number',
        'qr_code_path',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'updated_by' => 'integer',
        ];
    }
}
