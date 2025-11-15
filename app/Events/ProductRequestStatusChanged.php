<?php

namespace App\Events;

use App\Models\ProductRequest;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductRequestStatusChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public ProductRequest $productRequest,
        public string $oldStatus,
        public string $newStatus,
        public ?User $admin = null
    ) {}
}

