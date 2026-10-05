<?php

namespace App\Notifications;

use App\Models\DocumentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DocumentReadyNotification extends Notification
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
        $readyAt = $this->documentRequest->ready_at;
        $claimTime = $readyAt?->timezone(config('app.timezone'))
            ->format('F j, Y \a\t g:i A');

        return [
            'title' => 'Your Document is ready to claim at BRGY HALL',
            'message' => sprintf(
                'Your %s is ready to claim at BRGY HALL on %s. The document can only be released when you claim it in person.',
                $documentName,
                $claimTime,
            ),
            'document_request_id' => (string) $this->documentRequest->id,
            'ready_at' => $readyAt?->toIso8601String() ?? '',
        ];
    }
}
