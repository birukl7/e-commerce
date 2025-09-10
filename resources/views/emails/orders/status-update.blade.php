<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Status Update - #{{ $order->order_number }}</title>
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
            <h1>Order Status Updated</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $order->user->name ?? 'Valued Customer' }},</p>
            
            @php
                $statusText = is_string($status) ? $status : (
                    is_object($status) && property_exists($status, 'name') 
                        ? $status->name 
                        : 'processed'
                );
                $statusText = ucfirst(strtolower($statusText));
            @endphp
            
            <p>The status of your order <strong>#{{ $order->order_number }}</strong> has been updated to: <strong>{{ $statusText }}</strong></p>
            
            @if(!empty($updateMessage))
                <div class="order-details">
                    <h3>Update Note:</h3>
                    <p>{{ $updateMessage }}</p>
                </div>
            @endif
            
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
                        <th>Current Status:</th>
                        <td>{{ $statusText }}</td>
                    </tr>
                    <tr>
                        <th>Total Amount:</th>
                        <td>{{ number_format($order->total, 2) }} ETB</td>
                    </tr>
                </table>
            </div>
            
            <div class="action">
                <a href="{{ route('user.orders.show', $order->id) }}" class="button" style="background-color: #ef4e2a; color: white !important; display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; text-align: center;">Track Your Order</a>
            </div>
            
            <p>If you have any questions about this update, please contact our support team.</p>
            
            <p>Thanks,<br>
            {{ config('app.name') }}</p>
        </div>
        
        <div class="footer">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
