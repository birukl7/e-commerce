<?php

namespace App\Notifications;

use App\Models\SupplierProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupplierApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public $supplierProfile;

    public function __construct(SupplierProfile $supplierProfile)
    {
        $this->supplierProfile = $supplierProfile;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Your Supplier Account Has Been Approved')
            ->greeting('Congratulations, ' . $notifiable->name . '!')
            ->line('Your supplier account has been approved. You can now start adding products to your store.')
            ->line('Business Name: ' . $this->supplierProfile->business_name)
            ->line('Commission Rate: ' . $this->supplierProfile->default_commission_rate . '%')
            ->action('Go to Your Dashboard', route('supplier.dashboard'))
            ->line('If you have any questions, please contact our support team.');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'supplier.approved',
            'supplier_id' => $this->supplierProfile->id,
            'business_name' => $this->supplierProfile->business_name,
            'message' => 'Your supplier account has been approved.',
            'link' => route('supplier.dashboard'),
        ];
    }
}
