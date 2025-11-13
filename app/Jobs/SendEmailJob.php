<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

/**
 * @deprecated This job is deprecated and no longer used.
 * Use specific mail jobs like SendAccountActivityEmail, SendOrderConfirmationEmail, etc.
 * This job will be removed in a future version.
 */
class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $to;
    protected $subject;
    protected $view;
    protected $data;

    public function __construct(string $to, string $subject, string $view, array $data = [])
    {
        $this->to = $to;
        $this->subject = $subject;
        $this->view = $view;
        $this->data = $data;
    }

    public function handle()
    {
        Mail::send($this->view, $this->data, function($message) {
            $message->to($this->to)
                    ->subject($this->subject);
        });
    }
}
