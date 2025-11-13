<?php

namespace App\Jobs;

use App\Mail\ProductRequestNotification;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendProductRequestSubmittedEmail extends BaseMailJob
{
    public function __construct(
        public ProductRequest $productRequest,
        public User $user
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'product_request_id' => $this->productRequest->id,
            'user_email' => $this->user->email,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new ProductRequestNotification(
                    $this->productRequest,
                    $this->user,
                    'submitted'
                ));
            
            $this->logJobComplete([
                'product_request_id' => $this->productRequest->id,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'product_request_id' => $this->productRequest->id ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}

