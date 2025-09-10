<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AccountActivity extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $activityType;
    public $activityData;

    public function __construct(User $user, string $activityType, array $activityData = [])
    {
        $this->user = $user;
        $this->activityType = $activityType;
        $this->activityData = $activityData;
    }

    public function build()
    {
        $subject = $this->getActivitySubject();
        
        return $this->subject($subject)
                    ->view('emails.account.activity')
                    ->with([
                        'user' => $this->user,
                        'activityType' => $this->activityType,
                        'activityData' => $this->activityData,
                        'subject' => $subject
                    ]);
    }

    protected function getActivitySubject(): string
    {
        return match($this->activityType) {
            'password_reset' => 'Password Reset Request',
            'password_changed' => 'Your Password Has Been Changed',
            'new_device_login' => 'New Login Detected',
            'account_verified' => 'Account Successfully Verified',
            default => 'Account Notification',
        };
    }
}
