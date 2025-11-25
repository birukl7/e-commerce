<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Force light mode: no dark class, no system preference script --}}
        <style>
            html {
                background-color: oklch(1 0 0); /* Light background */
            }
        </style>

        <title inertia>{{ config('app.name', 'Serdo') }}</title>

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
        
        {{-- Global OAuth message handler - must be set up before React loads --}}
        <script>
            (function() {
                let oauthHandled = false;
                
                function handleOAuthSuccess(redirectUrl) {
                    if (oauthHandled) return;
                    oauthHandled = true;
                    
                    console.log('[OAuth Global] Handling OAuth success, redirecting to:', redirectUrl);
                    
                    // Dispatch custom event for React components
                    window.dispatchEvent(new CustomEvent('oauth:success', { 
                        detail: { redirectUrl: redirectUrl } 
                    }));
                    
                    // Reload page to refresh auth state
                    setTimeout(function() {
                        window.location.href = redirectUrl;
                    }, 200);
                }
                
                // Method 1: Listen for postMessage
                window.addEventListener('message', function(event) {
                    // Only accept messages from the same origin
                    if (event.origin !== window.location.origin) {
                        return;
                    }

                    if (event.data && event.data.type === 'oauth-success') {
                        console.log('[OAuth Global] postMessage received');
                        handleOAuthSuccess(event.data.redirectUrl || '/');
                    }
                }, false);
                
                // Method 2: Poll localStorage for OAuth success flag
                setInterval(function() {
                    try {
                        const oauthData = localStorage.getItem('oauth_success');
                        if (oauthData) {
                            const data = JSON.parse(oauthData);
                            // Check if this is a recent notification (within last 5 seconds)
                            if (Date.now() - data.timestamp < 5000) {
                                console.log('[OAuth Global] localStorage flag detected');
                                localStorage.removeItem('oauth_success');
                                handleOAuthSuccess(data.redirectUrl || '/');
                            }
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                }, 300);
            })();
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
