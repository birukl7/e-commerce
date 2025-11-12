<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - Product Request #{{ $productRequest->id }}</title>
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
        .product-details {
            background-color: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #e5e7eb;
        }
        .product-details p {
            margin-bottom: 8px;
        }
        .product-name {
            font-size: 14px;
            font-weight: bold;
            color: #111827;
            margin-bottom: 10px;
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
        .status-processing {
            background-color: #fef3c7;
            color: #92400e;
        }
        .payment-type-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .payment-type-advance {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .payment-type-final {
            background-color: #fce7f3;
            color: #9f1239;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Payment Receipt</h1>
        <p>{{ ucfirst($paymentType) }} Payment for Product Request</p>
    </div>

    <div class="receipt-info">
        <div class="receipt-info-row">
            <div class="receipt-info-label">Product Request ID:</div>
            <div class="receipt-info-value">#{{ $productRequest->id }}</div>
        </div>
        @if($productRequest->order_id)
        <div class="receipt-info-row">
            <div class="receipt-info-label">Order ID:</div>
            <div class="receipt-info-value">{{ $productRequest->order_id }}</div>
        </div>
        @endif
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
            <div class="receipt-info-value">{{ ucfirst($paymentTransaction->payment_method ?? 'N/A') }}</div>
        </div>
        <div class="receipt-info-row">
            <div class="receipt-info-label">Payment Status:</div>
            <div class="receipt-info-value">
                @if($paymentType === 'advance')
                    @if($productRequest->advance_payment_status === 'paid')
                        <span class="status-badge status-paid">Paid</span>
                    @elseif($productRequest->advance_payment_status === 'processing')
                        <span class="status-badge status-processing">Pending Approval</span>
                    @else
                        {{ ucfirst($productRequest->advance_payment_status ?? 'N/A') }}
                    @endif
                @elseif($paymentType === 'final')
                    @if($productRequest->final_payment_status === 'paid')
                        <span class="status-badge status-paid">Paid</span>
                    @elseif($productRequest->final_payment_status === 'processing')
                        <span class="status-badge status-processing">Pending Approval</span>
                    @else
                        {{ ucfirst($productRequest->final_payment_status ?? 'N/A') }}
                    @endif
                @endif
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Product Information</div>
        <div class="product-details">
            <div class="product-name">{{ $productRequest->product_name }}</div>
            @if($productRequest->description)
            <p><strong>Description:</strong> {{ $productRequest->description }}</p>
            @endif
            @if($productRequest->brand)
            <p><strong>Brand:</strong> {{ $productRequest->brand }}</p>
            @endif
            @if($productRequest->model)
            <p><strong>Model:</strong> {{ $productRequest->model }}</p>
            @endif
            @if($productRequest->quantity)
            <p><strong>Quantity:</strong> {{ $productRequest->quantity }}</p>
            @endif
        </div>
    </div>

    <div class="section">
        <div class="section-title">Payment Details</div>
        <div class="totals">
            <div class="total-row">
                <div class="total-label">{{ ucfirst($paymentType) }} Amount:</div>
                <div class="total-value">{{ number_format($subtotal, 2) }} {{ $currency }}</div>
            </div>
            @if($taxAmount > 0)
            <div class="total-row">
                <div class="total-label">Tax:</div>
                <div class="total-value">{{ number_format($taxAmount, 2) }} {{ $currency }}</div>
            </div>
            @endif
            <div class="total-row grand-total">
                <div class="total-label">Total Paid:</div>
                <div class="total-value">{{ number_format($totalAmount, 2) }} {{ $currency }}</div>
            </div>
        </div>
    </div>

    @if($paymentType === 'advance' && $productRequest->final_amount)
    <div class="section">
        <div class="section-title">Remaining Payment</div>
        <p style="color: #6b7280; font-size: 11px;">
            Final payment amount: <strong>{{ number_format($productRequest->final_amount, 2) }} {{ $currency }}</strong>
        </p>
    </div>
    @endif

    <div class="footer">
        <p>This is an official receipt. Please keep this document for your records.</p>
        <p>For any questions, please contact our support team.</p>
        <p style="margin-top: 10px; font-size: 9px; color: #9ca3af;">
            Receipt generated on {{ now()->format('F d, Y \a\t g:i A') }}
        </p>
    </div>
</body>
</html>

