<?php

namespace App\Notifications;

use App\Models\SupplierProfile;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SupplierWelcome extends Notification implements ShouldQueue
{
    use Queueable;

    public $supplierProfile;

    public function __construct(SupplierProfile $supplierProfile)
    {
        $this->supplierProfile = $supplierProfile;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Welcome to Our Supplier Program - Next Steps')
            ->greeting('Welcome, ' . $notifiable->name . '!')
            ->line('Thank you for registering as a supplier with ' . config('app.name') . '.')
            ->line('Your account is currently under review. You will receive an email once your account is approved.')
            ->line('Once approved, you can start adding products to your store.')
            ->line('Here are your business details:')
            ->line('Business Name: ' . $this->supplierProfile->business_name)
            ->line('Business Email: ' . $this->supplierProfile->business_email)
            ->line('Verification Status: ' . ucfirst($this->supplierProfile->verification_status))
            ->action('Visit Your Dashboard', route('supplier.dashboard'))
            ->line('If you have any questions, please contact our support team.')
            ->line('Thank you for joining our platform!');
    }
}
