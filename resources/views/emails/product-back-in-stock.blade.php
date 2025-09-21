<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Product Back in Stock - {{ $product->name }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .product-info {
            background-color: #fff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .product-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        .product-details {
            margin: 15px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px 0;
            border-bottom: 1px solid #f1f3f4;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .detail-value {
            color: #2c3e50;
        }
        .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .cta-button:hover {
            background-color: #0056b3;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
        }
        .stock-badge {
            background-color: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Great News!</h1>
        <p>The product you were waiting for is now back in stock!</p>
    </div>

    <div class="product-info">
        <div class="product-name">{{ $product->name }}</div>
        
        <div class="product-details">
            <div class="detail-row">
                <span class="detail-label">SKU:</span>
                <span class="detail-value">{{ $product->sku }}</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Stock Status:</span>
                <span class="detail-value">
                    <span class="stock-badge">{{ $product->stock_quantity }} units available</span>
                </span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Price:</span>
                <span class="detail-value">ETB {{ number_format($product->current_price, 2) }}</span>
            </div>
            
            @if($product->sale_price && $product->sale_price < $product->price)
            <div class="detail-row">
                <span class="detail-label">Sale Price:</span>
                <span class="detail-value" style="color: #dc3545; font-weight: bold;">ETB {{ number_format($product->sale_price, 2) }}</span>
            </div>
            @endif
        </div>

        <div style="text-align: center;">
            <a href="{{ route('products.show', $product->slug) }}" class="cta-button">
                View Product & Order Now
            </a>
        </div>

        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404;">
                <strong>⏰ Hurry up!</strong> Stock is limited and this product might sell out quickly. 
                Don't miss out on this opportunity!
            </p>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for your patience and for choosing our store!</p>
        <p>If you no longer wish to receive these notifications, you can unsubscribe by visiting the product page.</p>
    </div>
</body>
</html>
