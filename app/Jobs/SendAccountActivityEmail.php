<?php

namespace App\Jobs;

use App\Mail\AccountActivity;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendAccountActivityEmail extends BaseMailJob
{
    public function __construct(
        public User $user,
        public string $activityType,
        public array $activityData = []
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'user_id' => $this->user->id,
            'user_email' => $this->user->email,
            'activity_type' => $this->activityType,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new AccountActivity($this->user, $this->activityType, $this->activityData));
            
            $this->logJobComplete([
                'user_id' => $this->user->id,
                'activity_type' => $this->activityType,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'user_id' => $this->user->id ?? null,
                'user_email' => $this->user->email ?? null,
                'activity_type' => $this->activityType,
            ]);
        }
    }
}

