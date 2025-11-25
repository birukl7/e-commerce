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
                
                // Set up OAuth message listener immediately
                window.addEventListener('message', function(event) {
                    // Only accept messages from the same origin
                    if (event.origin !== window.location.origin) {
                        return;
                    }

                    if (event.data && event.data.type === 'oauth-success' && !oauthHandled) {
                        oauthHandled = true;
                        console.log('[OAuth Global] Success message received in HTML handler');
                        const redirectUrl = event.data.redirectUrl || '/';
                        
                        // Dispatch custom event for React components to close modals
                        window.dispatchEvent(new CustomEvent('oauth:success', { 
                            detail: { redirectUrl: redirectUrl } 
                        }));
                        
                        // Give React components time to close modals, then reload
                        setTimeout(function() {
                            console.log('[OAuth Global] Reloading to:', redirectUrl);
                            window.location.href = redirectUrl;
                        }, 300);
                    }
                }, false);
            })();
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
