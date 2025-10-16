<?php

namespace App\Notifications;

use App\Models\SupplierProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupplierRegistered extends Notification implements ShouldQueue
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
            ->subject('New Supplier Registration: ' . $this->supplierProfile->business_name)
            ->line('A new supplier has registered on the platform.')
            ->line('Business: ' . $this->supplierProfile->business_name)
            ->line('Email: ' . $this->supplierProfile->business_email)
            ->action('Review Supplier', route('admin.suppliers.show', $this->supplierProfile->id))
            ->line('Thank you for using our platform!');
    }

    public function toArray($notifiable)
    {
        return [
            'type' => 'supplier.registered',
            'supplier_id' => $this->supplierProfile->id,
            'business_name' => $this->supplierProfile->business_name,
            'message' => 'New supplier registered: ' . $this->supplierProfile->business_name,
            'link' => route('admin.suppliers.show', $this->supplierProfile->id),
        ];
    }
}
