<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation #{{ $order->order_number }}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            line-height: 1.6; 
            color: #1e293b; 
            background-color: #f1f5f9;
            margin: 0; 
            padding: 30px 10px; 
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 580px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
            border: 1px solid #e2e8f0;
        }
        .top-celebration {
            text-align: center;
            padding: 36px 24px 20px 24px;
            background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
        }
        .icon-circle {
            display: inline-block;
            font-size: 42px;
            line-height: 1;
            margin-bottom: 12px;
        }
        .title {
            margin: 0 0 6px 0;
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.02em;
        }
        .subtitle {
            margin: 0;
            font-size: 14px;
            color: #64748b;
        }
        .ticket-divider {
            position: relative;
            margin: 10px 0 20px 0;
            border-top: 2px dashed #cbd5e1;
        }
        .content { 
            padding: 0 28px 28px 28px;
        }
        .meta-grid {
            display: table;
            width: 100%;
            margin-bottom: 24px;
        }
        .meta-col {
            display: table-cell;
            vertical-align: top;
            width: 50%;
        }
        .meta-col-right {
            display: table-cell;
            vertical-align: top;
            width: 50%;
            text-align: right;
        }
        .meta-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #94a3b8;
            margin-bottom: 4px;
        }
        .meta-value {
            font-size: 15px;
            font-weight: 700;
            color: #0f172a;
        }
        .meta-amount {
            font-size: 20px;
            font-weight: 800;
            color: #059669;
        }
        .items-card {
            background-color: #f8fafc;
            border-radius: 16px;
            padding: 16px 20px;
            border: 1px solid #e2e8f0;
            margin-bottom: 24px;
        }
        .items-title {
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
        }
        .item-row {
            display: table;
            width: 100%;
            padding: 10px 0;
            border-bottom: 1px solid #edf2f7;
        }
        .item-row:last-child {
            border-bottom: none;
            padding-bottom: 2px;
        }
        .item-thumb-cell {
            display: table-cell;
            width: 56px;
            vertical-align: middle;
        }
        .item-img {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            object-fit: cover;
            border: 1px solid #e2e8f0;
            background-color: #ffffff;
            display: block;
        }
        .item-img-fallback {
            width: 48px;
            height: 48px;
            border-radius: 10px;
            background-color: #e2e8f0;
            color: #94a3b8;
            text-align: center;
            line-height: 48px;
            font-size: 20px;
            display: block;
        }
        .item-details-cell {
            display: table-cell;
            vertical-align: middle;
            padding-left: 12px;
        }
        .item-name {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 3px 0;
        }
        .item-qty-price {
            font-size: 12px;
            color: #64748b;
            margin: 0;
        }
        .item-total-cell {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 90px;
        }
        .item-total {
            font-size: 14px;
            font-weight: 700;
            color: #0f172a;
        }
        .summary-box {
            padding: 12px 4px;
            border-top: 1px solid #e2e8f0;
            margin-top: 8px;
        }
        .summary-row {
            display: table;
            width: 100%;
            margin-bottom: 6px;
        }
        .summary-label {
            display: table-cell;
            font-size: 13px;
            color: #64748b;
        }
        .summary-val {
            display: table-cell;
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
            text-align: right;
        }
        .summary-total-row {
            display: table;
            width: 100%;
            padding-top: 10px;
            margin-top: 6px;
            border-top: 2px dashed #cbd5e1;
        }
        .summary-total-label {
            display: table-cell;
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
        }
        .summary-total-val {
            display: table-cell;
            font-size: 18px;
            font-weight: 800;
            color: #059669;
            text-align: right;
        }
        .customer-pill {
            background-color: #f1f5f9;
            border-radius: 14px;
            padding: 12px 16px;
            margin-bottom: 24px;
            display: table;
            width: 100%;
            box-sizing: border-box;
        }
        .customer-avatar {
            display: table-cell;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            text-align: center;
            vertical-align: middle;
            line-height: 38px;
        }
        .customer-info {
            display: table-cell;
            vertical-align: middle;
            padding-left: 12px;
        }
        .customer-name {
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
        }
        .customer-sub {
            font-size: 11px;
            color: #64748b;
            margin: 0;
        }
        .action {
            text-align: center;
            margin: 20px 0 10px 0;
        }
        .btn-view {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff !important;
            font-size: 14px;
            font-weight: 600;
            padding: 13px 28px;
            border-radius: 9999px;
            text-decoration: none;
            letter-spacing: 0.01em;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }
        .footer { 
            text-align: center; 
            padding: 20px; 
            font-size: 11px; 
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            background-color: #ffffff;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Top Celebration Header -->
        <div class="top-celebration">
            <div class="icon-circle">🎉</div>
            <h1 class="title">Thank you!</h1>
            <p class="subtitle">Your order has been placed successfully</p>
        </div>

        <div class="ticket-divider"></div>

        <div class="content">
            <!-- Meta Details Grid -->
            <div class="meta-grid">
                <div class="meta-col">
                    <div class="meta-label">Order Number</div>
                    <div class="meta-value">#{{ $order->order_number }}</div>
                    <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">
                        {{ $order->created_at ? $order->created_at->format('d M Y • H:i') : '' }}
                    </div>
                </div>
                <div class="meta-col-right">
                    <div class="meta-label">Total Amount</div>
                    <div class="meta-amount">{{ number_format($order->total_amount ?? 0, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                    <div style="font-size: 11px; color: #059669; font-weight: 600; margin-top: 2px;">
                        {{ ucfirst(str_replace('_', ' ', $order->payment_status ?? 'pending')) }}
                    </div>
                </div>
            </div>

            <!-- Customer pill -->
            <div class="customer-pill">
                <div class="customer-avatar">
                    {{ strtoupper(substr($order->user->name ?? 'U', 0, 2)) }}
                </div>
                <div class="customer-info">
                    <div class="customer-name">{{ $order->user->name }}</div>
                    <div class="customer-sub">{{ $order->user->email }} • Payment: {{ ucfirst($order->payment_method ?? 'Offline') }}</div>
                </div>
            </div>

            <!-- Products Bought (Image, Quantity, Price, Total) -->
            <div class="items-card">
                <div class="items-title">Purchased Items ({{ $order->items->count() }})</div>

                @foreach($order->items as $item)
                    @php
                        // Snapshot fallback or direct product
                        $snapshot = is_string($item->product_snapshot) 
                            ? json_decode($item->product_snapshot, true) 
                            : $item->product_snapshot;
                        
                        $productName = $item->product->name ?? ($snapshot['name'] ?? 'Product Item');
                        
                        // Resolve image URL
                        $imageUrl = null;
                        if ($item->product && $item->product->images && $item->product->images->isNotEmpty()) {
                            $primary = $item->product->images->firstWhere('is_primary', true) ?? $item->product->images->first();
                            if ($primary && $primary->image_path) {
                                $imageUrl = \App\Services\ImageUrlService::formatImageUrl($primary->image_path);
                            }
                        } elseif (isset($snapshot['image']) && $snapshot['image']) {
                            $imageUrl = \App\Services\ImageUrlService::formatImageUrl($snapshot['image']);
                        }
                    @endphp
                    <div class="item-row">
                        <div class="item-thumb-cell">
                            @if($imageUrl)
                                @php
                                    $absoluteImg = str_starts_with($imageUrl, 'http') ? $imageUrl : url($imageUrl);
                                @endphp
                                <img src="{{ $absoluteImg }}" alt="{{ $productName }}" class="item-img" />
                            @else
                                <div class="item-img-fallback">🛍️</div>
                            @endif
                        </div>
                        <div class="item-details-cell">
                            <div class="item-name">{{ $productName }}</div>
                            <div class="item-qty-price">
                                Qty: <strong>{{ $item->quantity }}</strong> × {{ number_format($item->price, 2) }} {{ $order->currency ?? 'ETB' }}
                            </div>
                        </div>
                        <div class="item-total-cell">
                            <div class="item-total">
                                {{ number_format($item->total, 2) }} {{ $order->currency ?? 'ETB' }}
                            </div>
                        </div>
                    </div>
                @endforeach

                <!-- Summary inside card -->
                <div class="summary-box">
                    <div class="summary-row">
                        <div class="summary-label">Subtotal</div>
                        <div class="summary-val">{{ number_format($order->subtotal ?? 0, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                    </div>
                    @if($order->tax_amount > 0)
                        <div class="summary-row">
                            <div class="summary-label">Tax</div>
                            <div class="summary-val">{{ number_format($order->tax_amount, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                        </div>
                    @endif
                    @if($order->shipping_amount > 0)
                        <div class="summary-row">
                            <div class="summary-label">Delivery</div>
                            <div class="summary-val">{{ number_format($order->shipping_amount, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                        </div>
                    @endif
                    @if($order->discount_amount > 0)
                        <div class="summary-row">
                            <div class="summary-label">Discount</div>
                            <div class="summary-val" style="color: #059669;">-{{ number_format($order->discount_amount, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                        </div>
                    @endif
                    <div class="summary-total-row">
                        <div class="summary-total-label">Total</div>
                        <div class="summary-total-val">{{ number_format($order->total_amount ?? 0, 2) }} {{ $order->currency ?? 'ETB' }}</div>
                    </div>
                </div>
            </div>

            <!-- View Order CTA Button -->
            <div class="action">
                @php
                    $orderUrl = route('user.orders.show', $order->id);
                @endphp
                <a href="{{ $orderUrl }}" class="btn-view">
                    View Order Details
                </a>
            </div>
        </div>

        <div class="footer">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.<br>
            If you have questions, reply directly to this email.
        </div>
    </div>
</body>
</html>
