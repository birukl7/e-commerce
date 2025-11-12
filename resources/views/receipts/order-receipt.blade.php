<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - {{ $order->order_number }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 12px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .header h1 {
            font-size: 24px;
            color: #059669;
            margin-bottom: 5px;
        }
        .header p {
            color: #6b7280;
            font-size: 11px;
        }
        .receipt-info {
            display: table;
            width: 100%;
            margin-bottom: 25px;
        }
        .receipt-info-row {
            display: table-row;
        }
        .receipt-info-label {
            display: table-cell;
            width: 40%;
            font-weight: bold;
            color: #4b5563;
            padding: 5px 0;
        }
        .receipt-info-value {
            display: table-cell;
            width: 60%;
            padding: 5px 0;
        }
        .section {
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #e5e7eb;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th {
            background-color: #f3f4f6;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 11px;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .totals {
            margin-top: 20px;
            margin-left: auto;
            width: 300px;
        }
        .total-row {
            display: table;
            width: 100%;
            margin-bottom: 5px;
        }
        .total-label {
            display: table-cell;
            width: 60%;
            font-weight: bold;
            text-align: right;
            padding-right: 10px;
        }
        .total-value {
            display: table-cell;
            width: 40%;
            text-align: right;
            font-weight: bold;
        }
        .grand-total {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 2px solid #059669;
        }
        .grand-total .total-label,
        .grand-total .total-value {
            font-size: 14px;
            color: #059669;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #6b7280;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
        }
        .status-paid {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payment Receipt</h1>
        <p>Thank you for your purchase!</p>
    </div>

    <div class="receipt-info">
        <div class="receipt-info-row">
            <div class="receipt-info-label">Order Number:</div>
            <div class="receipt-info-value">{{ $order->order_number }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Transaction ID:</div>
            <div class="receipt-info-value">{{ $paymentTransaction->tx_ref ?? 'N/A' }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Date:</div>
            <div class="receipt-info-value">{{ $date }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Customer:</div>
            <div class="receipt-info-value">{{ $customer->name ?? 'N/A' }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Email:</div>
            <div class="receipt-info-value">{{ $customer->email ?? 'N/A' }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Payment Method:</div>
            <div class="receipt-info-value">{{ ucfirst($order->payment_method ?? 'N/A') }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Payment Status:</div>
            <div class="receipt-info-value">
                @if($order->payment_status === 'paid')
                    <span class="status-badge status-paid">Paid</span>
                @elseif($order->payment_status === 'pending_approval' || $order->payment_status === 'pending')
                    <span class="status-badge status-pending">Pending Approval</span>
                @else
                    {{ ucfirst($order->payment_status ?? 'N/A') }}
                @endif
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Order Items</div>
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                @forelse($items as $item)
                    <tr>
                        <td>{{ $item->product->name ?? 'Product' }}</td>
                        <td class="text-center">{{ $item->quantity }}</td>
                        <td class="text-right">{{ number_format($item->price, 2) }} {{ $order->currency }}</td>
                        <td class="text-right">{{ number_format($item->total, 2) }} {{ $order->currency }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" class="text-center">No items found</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div class="totals">
        <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">{{ number_format($order->subtotal ?? 0, 2) }} {{ $order->currency }}</div>
        </div>
        @if($order->tax_amount > 0)
        <div class="total-row">
            <div class="total-label">Tax:</div>
            <div class="total-value">{{ number_format($order->tax_amount, 2) }} {{ $order->currency }}</div>
        </div>
        @endif
        @if($order->shipping_amount > 0)
        <div class="total-row">
            <div class="total-label">Shipping:</div>
            <div class="total-value">{{ number_format($order->shipping_amount, 2) }} {{ $order->currency }}</div>
        </div>
        @endif
        @if($order->discount_amount > 0)
        <div class="total-row">
            <div class="total-label">Discount:</div>
            <div class="total-value">-{{ number_format($order->discount_amount, 2) }} {{ $order->currency }}</div>
        </div>
        @endif
        <div class="total-row grand-total">
            <div class="total-label">Total Paid:</div>
            <div class="total-value">{{ number_format($order->total_amount, 2) }} {{ $order->currency }}</div>
        </div>
    </div>

    <div class="footer">
        <p>This is an official receipt. Please keep this document for your records.</p>
        <p>For any questions, please contact our support team.</p>
        <p style="margin-top: 10px; font-size: 9px; color: #9ca3af;">
            Receipt generated on {{ now()->format('F d, Y \a\t g:i A') }}
        </p>
    </div>
</body>
</html>

