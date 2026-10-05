<?php

namespace App\Notifications;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly DocumentRequest $documentRequest,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, string>
     */
    public function toDatabase(object $notifiable): array
    {
        $documentName = $this->documentRequest->documentType->name;

        return [
            'title' => 'Payment received',
            'message' => sprintf(
                'Payment for your %s request has been recorded as paid via %s.',
                $documentName,
                strtoupper($this->documentRequest->payment_method),
            ),
            'document_request_id' => (string) $this->documentRequest->id,
            'payment_method' => $this->documentRequest->payment_method,
        ];
    }
}
