<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Product Request Update' }} - {{ config('app.name') }}</title>
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
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 500;
            text-transform: capitalize;
        }
        .status-pending {
            background-color: #FEF3C7;
            color: #92400E;
        }
        .status-reviewed {
            background-color: #E0F2FE;
            color: #075985;
        }
        .status-approved {
            background-color: #D1FAE5;
            color: #065F46;
        }
        .status-rejected {
            background-color: #FEE2E2;
            color: #B91C1C;
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
            <h1>
                @if($type === 'submitted')
                    Product Request Submitted
                @else
                    Product Request {{ ucfirst($productRequest->status) }}
                @endif
            </h1>
        </div>
        
        <div class="content">
            <p>Hello {{ $productRequest->user->name }},</p>
            
            <div class="details">
                @if($type === 'submitted')
                    <p>Thank you for submitting your product request. We've received the following details:</p>
                @else
                    <p>Your product request has been updated with the following status:</p>
                    <p>
                        <strong>Status: </strong>
                        <span class="status status-{{ $productRequest->status }}">
                            {{ ucfirst($productRequest->status) }}
                        </span>
                    </p>
                    
                    @if($productRequest->admin_response)
                        <div style="margin-top: 15px; padding: 10px; background-color: #F3F4F6; border-radius: 6px;">
                            <strong>Admin Response:</strong>
                            <p style="margin: 5px 0 0 0;">{{ $productRequest->admin_response }}</p>
                        </div>
                    @endif
                @endif
                
                <div style="margin-top: 20px;">
                    <h3>Request Details</h3>
                    <p><strong>Title:</strong> {{ $productRequest->title }}</p>
                    @if($productRequest->description)
                        <p><strong>Description:</strong> {{ $productRequest->description }}</p>
                    @endif
                    <p><strong>Submitted On:</strong> {{ $productRequest->created_at->format('F j, Y \a\t H:i') }}</p>
                    @if($admin && $type === 'status_updated')
                        <p><strong>Updated By:</strong> {{ $admin->name }}</p>
                    @endif
                </div>
            </div>
            
            <div class="action">
                @php
                    $url = str_replace('http://localhost', 'http://localhost:8000', route('request.edit', $productRequest->id));
                @endphp
                <a href="{{ $url }}" class="button">View Request</a>
            </div>
            
            <p>If you have any questions about your request, please reply to this email or contact our support team.</p>
            
            <p>Thanks,<br>
            The {{ config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        </div>
    </div>
</body>
</html>
