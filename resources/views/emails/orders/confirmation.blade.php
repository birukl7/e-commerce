<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation #{{ $order->order_number }}</title>
    <style>
        body { 
            font-family: 'Poppins', Arial, sans-serif; 
            line-height: 1.6; 
            color: #1a1a1a; 
            background-color: #f9fafb;
            margin: 0; 
            padding: 0; 
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background-color: #ef4e2a;
            color: #ffffff;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content { 
            padding: 30px; 
            color: #4b5563;
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 12px; 
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            background-color: #f9fafb;
        }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #ef4e2a; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
            font-weight: 500;
            text-align: center;
        }
        .order-details { 
            margin: 25px 0; 
            background: #f9fafb;
            border-radius: 6px;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .order-details h3 {
            margin-top: 0;
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .order-details table {
            width: 100%;
            border-collapse: collapse;
        }
        .order-details th, 
        .order-details td {
            padding: 8px 0;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .order-details th {
            color: #4b5563;
            font-weight: 500;
            width: 40%;
        }
        .shipping-address {
            background: #f9fafb;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
            border: 1px solid #e5e7eb;
        }
        .shipping-address h3 {
            margin-top: 0;
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .shipping-address p {
            margin: 10px 0;
            line-height: 1.6;
        }
        .action {
            text-align: center;
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 20px 15px;
            }
            .header h1 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmation #{{ $order->order_number }}</h1>
        </div>
    
    <div class="content">
        <p>Hello {{ $order->user->name }},</p>
        
        <p>Thank you for your order! We've received it and are processing it now.</p>
        
        <div class="order-details">
            <h3>Order Details:</h3>
            <table>
                <tr>
                    <th>Order Number:</th>
                    <td>{{ $order->order_number }}</td>
                </tr>
                <tr>
                    <th>Order Date:</th>
                    <td>{{ $order->created_at->format('F j, Y') }}</td>
                </tr>
                <tr>
                    <th>Total Amount:</th>
                    <td>{{ number_format($order->total ?? 0, 2) }} ETB</td>
                </tr>
            </table>
        </div>
        
        <div class="shipping-address">
            <h3>Shipping Address:</h3>
            @if($order->shipping_address || $order->shipping_city || $order->shipping_country)
            <p>
                @if($order->shipping_address){{ $order->shipping_address }}<br>@endif
                @if($order->shipping_city && $order->shipping_country)
                    {{ $order->shipping_city }}, {{ $order->shipping_country }}
                @elseif($order->shipping_city)
                    {{ $order->shipping_city }}
                @elseif($order->shipping_country)
                    {{ $order->shipping_country }}
                @endif
            </p>
            @endif
            <p>
                @if($order->shipping_fullname)<strong>Contact:</strong> {{ $order->shipping_fullname }}<br>@endif
                @if($order->shipping_email)<strong>Email:</strong> {{ $order->shipping_email }}<br>@endif
                @if($order->shipping_phone)<strong>Phone:</strong> {{ $order->shipping_phone }}@endif
            </p>
        </div>
        
        <div class="action">
            @php
    $orderUrl = str_replace('http://localhost', 'http://localhost:8000', route('user.orders.show', $order->id));
@endphp
<a href="{{ $orderUrl }}" class="button" style="background-color: #ef4e2a; color: white !important; display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; text-align: center;">View Order Status</a>
        </div>
        
        <p>If you have any questions about your order, please contact our support team.</p>
        
            <p>Thanks,<br>
            {{ config('app.name') }}</p>
        </div>
        
        <div class="footer">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
