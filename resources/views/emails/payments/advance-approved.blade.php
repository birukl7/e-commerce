<p>Hello {{ $user->name }},</p>
<p>Your advance payment for Product Request #{{ $productRequest->id }} has been approved.</p>
<p>Amount: {{ $transaction->currency }} {{ number_format($transaction->amount, 2) }}</p>
<p>We will contact you with the next steps. You can view your request in your dashboard.</p>
<p>Thank you.</p>

