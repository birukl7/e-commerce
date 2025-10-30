<?php

namespace App\Jobs;

use App\Mail\ShipmentCreated as ShipmentCreatedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendShipmentCreatedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public $order, public $user, public ?string $trackingNumber = null) {}

    public function handle(): void
    {
        Mail::to($this->user->email)->send(new ShipmentCreatedMail($this->order, $this->trackingNumber));
    }
}


