<?php

namespace App\Notifications;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class RequestRejectedNotification extends Notification
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
            'title' => 'Request rejected — please submit again',
            'message' => sprintf(
                'Your %s request was rejected because the submitted ID was not valid. Please send a new document request with a valid government-issued ID.',
                $documentName,
            ),
            'document_request_id' => (string) $this->documentRequest->id,
        ];
    }
}
