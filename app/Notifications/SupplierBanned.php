<?php

namespace App\Notifications;

use App\Models\SupplierProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupplierBanned extends Notification implements ShouldQueue
{
    use Queueable;

    public $supplierProfile;
    public $reason;

    public function __construct(SupplierProfile $supplierProfile, ?string $reason = null)
    {
        $this->supplierProfile = $supplierProfile;
        $this->reason = $reason;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $mail = (new MailMessage)
            ->subject('Your Supplier Account Has Been Banned')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line('We regret to inform you that your supplier account has been banned.');

        if ($this->reason) {
            $mail->line('Reason: ' . $this->reason);
        }

        $mail->line('If you believe this is a mistake, please contact our support team.');

        return $mail;
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'supplier.banned',
            'supplier_id' => $this->supplierProfile->id,
            'business_name' => $this->supplierProfile->business_name,
            'message' => 'Your supplier account has been banned' . ($this->reason ? ': ' . $this->reason : ''),
            'reason' => $this->reason,
        ];
    }
}
