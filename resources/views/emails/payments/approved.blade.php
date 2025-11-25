<p>Hello {{ $user->name }},</p>
<p>Your payment for Order #{{ $order->order_number ?? $order->id }} has been approved.</p>
<p>Amount: {{ $transaction->currency }} {{ number_format($transaction->amount, 2) }}</p>
<p>You can view your order status here: <a href="{{ route('user.orders.show', $order->id) }}">View Order Status</a></p>
<p>Thank you for your purchase.</p>

