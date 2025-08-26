@php
    $appName = config('app.name', 'Serdo');
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $appName }} - Verify Email</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        background: 'oklch(1 0 0)',
                        foreground: 'oklch(0.145 0 0)',
                        card: 'oklch(1 0 0)',
                        'card-foreground': 'oklch(0.145 0 0)',
                        primary: '#ef4e2a',
                        'primary-foreground': 'oklch(0.985 0 0)',
                        'primary-600': 'oklch(57.7% 0.245 27.33)',
                        secondary: 'oklch(0.97 0 0)',
                        'secondary-foreground': 'oklch(0.205 0 0)',
                        muted: 'oklch(0.97 0 0)',
                        'muted-foreground': 'oklch(0.556 0 0)',
                        border: 'oklch(0.922 0 0)',
                        'sidebar-primary': 'oklch(0.205 0 0)',
                        'sidebar-primary-foreground': 'oklch(0.985 0 0)',
                    },
                    fontFamily: {
                        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                    },
                    borderRadius: {
                        'lg': '0.625rem',
                        'md': 'calc(0.625rem - 2px)',
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-background text-foreground font-sans min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
        <div class="bg-card border border-border rounded-lg shadow-lg p-8">
            <!-- App Logo -->
            <div class="text-center mb-8">
                <div class="flex items-center justify-center mb-4">
                    <div class="flex aspect-square items-center justify-center rounded-lg" 
                         style="width: 64px; height: 64px; background-color: transparent;">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#ef4e2a"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </div>
                </div>
                <h2 style="color: #1a1a1a; font-size: 24px; font-weight: 600; margin: 0;">{{ $appName }}</h2>
            </div>

            <!-- Content -->
            <div class="text-center">
                <h1 style="color: #1a1a1a; font-size: 28px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.2;">
                    Verify Your Email Address
                </h1>
                
                <p style="color: #6b7280; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                    Hello <strong style="color: #1a1a1a;">{{ $user->name }}</strong>,<br>
                    Please click the button below to verify your email address and complete your account setup.
                </p>

                <!-- Verify Button -->
                <div class="text-center mb-8">
                    <a href="{{ $url }}"
                       class="inline-block text-center"
                       style="background-color: #ef4e2a; 
                              color: white; 
                              text-decoration: none; 
                              padding: 16px 40px; 
                              border-radius: 12px; 
                              font-size: 16px; 
                              font-weight: 600; 
                              box-shadow: 0 4px 12px rgba(239, 78, 42, 0.3); 
                              transition: all 0.3s ease;
                              border: none;
                              display: inline-block;
                              min-width: 200px;">
                        ✉️ Verify Email Address
                    </a>
                </div>
                
                <div class="text-center mb-6">
                    <p style="color: #6b7280; font-size: 14px; margin: 0;">
                        Click the button above to verify your account
                    </p>
                </div>

                <!-- Alternative Link -->
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">
                        If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <div style="background-color: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                        <a href="{{ $url }}" 
                           style="color: #ef4e2a; font-size: 12px; word-break: break-all; text-decoration: none;">
                            {{ $url }}
                        </a>
                    </div>
                </div>

                <!-- Footer -->
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                        If you did not create an account with {{ $appName }}, no further action is required.<br>
                        This verification link will expire in 60 minutes for security reasons.
                    </p>
                </div>
            </div>
        </div>

        <!-- Bottom Branding -->
        <div class="text-center mt-6">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © {{ date('Y') }} {{ $appName }}. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>