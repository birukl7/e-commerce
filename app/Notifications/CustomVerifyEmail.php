<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class CustomVerifyEmail extends BaseVerifyEmail
{
    /**
     * Build the mail message.
     */
    public function toMail($notifiable)
    {
        // ✅ now works, because BaseVerifyEmail provides verificationUrl()
        $url = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verify Your Email - Serdo')
            ->view('emails.verify', [
                'url' => $url,
                'user' => $notifiable,
            ]);
    }
}
