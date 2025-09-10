<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Confirmed - Order #{{ $order->order_number ?? 'N/A' }}</title>
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
        .details { 
            margin: 25px 0; 
            background: #f9fafb;
            border-radius: 6px;
            padding: 20px;
            border: 1px solid #e5e7eb;
        }
        .details h3 {
            margin-top: 0;
            color: #111827;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        .details table {
            width: 100%;
            border-collapse: collapse;
        }
        .details th, 
        .details td {
            padding: 8px 0;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        .details th {
            color: #4b5563;
            font-weight: 500;
            width: 40%;
        }
        .action {
            text-align: center;
            margin: 30px 0;
        }
        .receipt-link {
            display: inline-block;
            margin-top: 10px;
            color: #ef4e2a;
            text-decoration: none;
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
            <h1>Payment Confirmed</h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $order->user->name ?? 'Customer' }},</p>
            
            <p>We've received your payment for Order <strong>#{{ $order->order_number ?? 'N/A' }}</strong>. Thank you for your purchase!</p>
            
            <div class="details">
                <h3>Payment Details</h3>
                <table>
                    <tr>
                        <th>Transaction ID:</th>
                        <td>{{ $transaction->transaction_id ?? 'N/A' }}</td>
                    </tr>
                    <tr>
                        <th>Amount Paid:</th>
                        <td>{{ isset($transaction->amount) ? number_format($transaction->amount, 2) : '0.00' }} ETB</td>
                    </tr>
                    <tr>
                        <th>Payment Method:</th>
                        <td>{{ isset($transaction->payment_method) ? ucfirst($transaction->payment_method) : 'N/A' }}</td>
                    </tr>
                    <tr>
                        <th>Payment Date:</th>
                        <td>{{ isset($transaction->paid_at) ? $transaction->paid_at->format('F j, Y H:i') : now()->format('F j, Y H:i') }}</td>
                    </tr>
                    <tr>
                        <th>Order Total:</th>
                        <td>{{ isset($order->total) ? number_format($order->total, 2) : '0.00' }} ETB</td>
                    </tr>
                </table>
                
                @if(isset($transaction->receipt_url))
                    <a href="{{ $transaction->receipt_url }}" class="receipt-link">Download Receipt</a>
                @endif
            </div>
            
            <div class="details">
                <h3>Order Summary</h3>
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
                        <th>Items:</th>
                        <td>{{ $order->items->count() }} items</td>
                    </tr>
                </table>
            </div>
            
            <div class="action">
                <a href="{{ route('user.orders.show', $order->id) }}" class="button">View Order Details</a>
            </div>
            
            <p>We'll notify you once your order is on its way. You can track your order status anytime from your account.</p>
            
            <p>Thanks for shopping with us!</p>
            
            <p>Best regards,<br>
            The {{ config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
