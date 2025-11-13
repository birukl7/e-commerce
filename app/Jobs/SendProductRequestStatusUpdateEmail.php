<?php

namespace App\Jobs;

use App\Mail\ProductRequestNotification;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendProductRequestStatusUpdateEmail extends BaseMailJob
{
    public function __construct(
        public ProductRequest $productRequest,
        public User $user,
        public ?User $admin = null
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'product_request_id' => $this->productRequest->id,
            'status' => $this->productRequest->status,
            'user_email' => $this->user->email,
            'admin_id' => $this->admin?->id,
        ]);

        try {
            Mail::to($this->user->email)
                ->send(new ProductRequestNotification(
                    $this->productRequest,
                    $this->user,
                    'status_updated',
                    $this->admin
                ));
            
            $this->logJobComplete([
                'product_request_id' => $this->productRequest->id,
                'status' => $this->productRequest->status,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'product_request_id' => $this->productRequest->id ?? null,
                'status' => $this->productRequest->status ?? null,
                'user_email' => $this->user->email ?? null,
            ]);
        }
    }
}

