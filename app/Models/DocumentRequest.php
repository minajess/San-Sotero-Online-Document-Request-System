<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property int $document_type_id
 * @property string $purpose
 * @property string $status
 * @property string $payment_method
 * @property string $payment_status
 * @property string|null $payment_reference
 * @property string|null $payment_receipt_path
 * @property string|null $contact_number
 * @property string|null $first_name
 * @property string|null $middle_name
 * @property string|null $surname
 * @property string|null $birthdate
 * @property string|null $address
 * @property string|null $zone
 * @property string|null $sex
 * @property Carbon|null $claimed_at
 * @property string|null $claimed_by_name
 * @property string|null $id_document_path
 * @property string|null $id_document_front_path
 * @property string|null $id_document_back_path
 * @property string $identity_status
 * @property bool $identity_status_locked
 * @property Carbon|null $ready_at
 * @property int|null $processed_by
 */
#[Fillable([
    'user_id',
    'document_type_id',
    'purpose',
    'status',
    'payment_method',
    'payment_status',
    'payment_reference',
    'payment_receipt_path',
    'contact_number',
    'first_name',
    'middle_name',
    'surname',
    'birthdate',
    'address',
    'zone',
    'sex',
    'id_document_path',
    'id_document_front_path',
    'id_document_back_path',
    'identity_status',
    'identity_status_locked',
    'ready_at',
    'claimed_at',
    'claimed_by_name',
    'processed_by',
])]
#[Hidden([
    'id_document_path',
    'id_document_front_path',
    'id_document_back_path',
    'payment_receipt_path',
])]
class DocumentRequest extends Model
{
    protected function casts(): array
    {
        return [
            'ready_at' => 'datetime',
            'claimed_at' => 'datetime',
            'identity_status_locked' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * @return BelongsTo<DocumentType, $this>
     */
    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
