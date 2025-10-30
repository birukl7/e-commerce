<p>Hello {{ $user->name }},</p>
<p>We have received your advance payment for Product Request #{{ $productRequest->id }}.</p>
<p>Amount: {{ $transaction->currency }} {{ number_format($transaction->amount, 2) }}</p>
<p>We will notify you about next steps regarding fulfillment and order creation.</p>
<p>Thank you.</p>

