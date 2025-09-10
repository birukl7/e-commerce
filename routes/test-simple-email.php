<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;

Route::get('/test-simple-email', function () {
    try {
        $email = 'test@example.com'; // Change this to your test email
        
        Mail::send('emails.test', [], function($message) use ($email) {
            $message->to($email)
                   ->subject('Simple Test Email');
        });
        
        return "Simple test email sent to {$email}";
    } catch (\Exception $e) {
        return "Error: " . $e->getMessage();
    }
});
