<p>Hello {{ $user->name }},</p>
<p>Your order #{{ $order->id }} has been shipped.</p>
@if(!empty($trackingNumber))
<p>Tracking Number: {{ $trackingNumber }}</p>
@endif
<p>Thank you for shopping with us.</p>

