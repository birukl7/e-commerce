<p>Hello {{ $user->name }},</p>
<p>Your payment for Order #{{ $order->id }} has been approved.</p>
<p>Amount: {{ $transaction->currency }} {{ number_format($transaction->amount, 2) }}</p>
<p>You can view your order here: <a href="{{ url('/orders/' . $order->id) }}">Order #{{ $order->id }}</a></p>
<p>Thank you for your purchase.</p>

