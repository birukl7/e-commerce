<?php

namespace App\Events;

use App\Models\ProductRequest;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductRequestCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public ProductRequest $productRequest) {}
}

