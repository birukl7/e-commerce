<?php

namespace App\Jobs;

use App\Mail\ProductRequestNotification;
use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class SendProductRequestAdminNotificationEmail extends BaseMailJob
{
    public function __construct(
        public ProductRequest $productRequest,
        public User $admin
    ) {}

    public function handle(): void
    {
        $this->logJobStart([
            'product_request_id' => $this->productRequest->id,
            'admin_email' => $this->admin->email,
        ]);

        try {
            Mail::to($this->admin->email)
                ->send(new ProductRequestNotification(
                    $this->productRequest,
                    $this->admin,
                    'admin_notification',
                    $this->admin
                ));
            
            $this->logJobComplete([
                'product_request_id' => $this->productRequest->id,
                'admin_email' => $this->admin->email,
            ]);
        } catch (\Throwable $e) {
            $this->handleError($e, [
                'product_request_id' => $this->productRequest->id ?? null,
                'admin_email' => $this->admin->email ?? null,
            ]);
        }
    }
}

