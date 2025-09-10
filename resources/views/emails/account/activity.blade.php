<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject }} - {{ config('app.name') }}</title>
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
        .details ul {
            margin: 0;
            padding-left: 20px;
        }
        .details li {
            margin-bottom: 8px;
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
            <h1>{{ $subject }}</h1>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            
            <div class="details">
                @switch($activityType)
                    @case('password_reset')
                        <p>You are receiving this email because we received a password reset request for your account.</p>
                        
                        <div class="action">
                            <a href="{{ $activityData['reset_url'] }}" class="button">Reset Password</a>
                        </div>
                        
                        <p>This password reset link will expire in {{ $activityData['expire'] ?? '60' }} minutes.</p>
                        
                        <p>If you did not request a password reset, no further action is required.</p>
                        @break
                        
                    @case('password_changed')
                        <p>Your password was changed successfully on {{ now()->format('F j, Y \a\t H:i') }}.</p>
                        
                        <p>If you did not change your password, please secure your account immediately by resetting your password.</p>
                        @break
                        
                    @case('new_device_login')
                        <h3>New Sign-In Detected</h3>
                        <p>We noticed a new sign-in to your account from a new device:</p>
                        
                        <ul>
                            <li><strong>Date/Time:</strong> {{ $activityData['login_time'] ?? now()->format('F j, Y H:i') }}</li>
                            <li><strong>IP Address:</strong> {{ $activityData['ip_address'] ?? 'Unknown' }}</li>
                            @if(!empty($activityData['location']))
                            <li><strong>Location:</strong> {{ $activityData['location'] }}</li>
                            @endif
                            @if(!empty($activityData['device']))
                            <li><strong>Device:</strong> {{ $activityData['device'] }}</li>
                            @endif
                        </ul>
                        
                        <p>If this was you, you can ignore this alert. If you suspect any unauthorized access to your account, please change your password immediately.</p>
                        @break
                        
                    @case('account_verified')
                        <h3>Account Verified Successfully!</h3>
                        <p>Thank you for verifying your email address. You now have full access to your account and can start shopping with us.</p>
                        
                        <div class="action">
                            <a href="{{ route('home') }}" class="button">Start Shopping</a>
                        </div>
                        @break
                        
                    @default
                        <p>{{ $message ?? 'There has been recent activity on your account that requires your attention.' }}</p>
                @endswitch
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            @if(!in_array($activityType, ['account_verified', 'password_changed']))
                <div class="action">
                    <a href="{{ route('account.security') }}" class="button">Review Account Security</a>
                </div>
            @endif
            
            <p>Thanks,<br>
            The {{ config('app.name') }} Team</p>
        </div>
        
        <div class="footer">
            &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.

    @slot('footer')
        @component('mail::footer')
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            
            @if(isset($activityData['unsubscribe_url']))
                [Unsubscribe]({{ $activityData['unsubscribe_url'] }}) | 
            @endif
            [Privacy Policy]({{ route('privacy') }}) | 
            [Contact Support]({{ route('contact') }})
        @endcomponent
    @endslot
@endcomponent
