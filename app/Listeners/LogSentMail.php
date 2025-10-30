<?php

namespace App\Listeners;

use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Log;

class LogSentMail
{
    public function handle(MessageSent $event): void
    {
        $messageId = method_exists($event->message, 'getId') ? $event->message->getId() : null;
        $mailable = $event->data['__laravel_notification'] ?? ($event->data['mailable'] ?? null);

        $context = [
            'message_id' => $messageId,
            'subject' => $event->message->getSubject(),
        ];

        // Try to extract domain identifiers from common mailable properties
        foreach (['order', 'transaction', 'productRequest'] as $prop) {
            if (isset($event->data[$prop])) {
                $model = $event->data[$prop];
                $context[$prop . '_id'] = is_object($model) && isset($model->id) ? $model->id : null;
            }
        }

        Log::info('[Mail] Message sent', $context);
    }
}


