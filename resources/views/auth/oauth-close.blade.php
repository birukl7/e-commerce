<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Completing Sign In</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: #f8fafc;
            color: #0f172a;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
        }
        .card {
            background: #ffffff;
            padding: 32px;
            border-radius: 16px;
            box-shadow: 0 20px 45px -20px rgba(15, 23, 42, 0.25);
            text-align: center;
            max-width: 360px;
            width: 100%;
        }
        .card h1 {
            font-size: 1.25rem;
            margin-bottom: 12px;
        }
        .card p {
            font-size: 0.95rem;
            color: #475569;
        }
        .spinner {
            border: 3px solid #f3f4f6;
            border-top: 3px solid #0f172a;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>Sign in successful!</h1>
        <p>Closing this window...</p>
        <div class="spinner"></div>
    </div>

    @php(
        $oauthPayload = [
            'type' => 'oauth-success',
            'redirectUrl' => $redirectUrl,
            'next' => $next ?? null,
        ]
    )

    <script>
        (function() {
            const message = <?php echo json_encode($oauthPayload); ?>;
            const forcePopup = {{ (isset($forcePopup) && $forcePopup) ? 'true' : 'false' }};
            let closeAttempted = false;
            
            // Check if this is a popup window (has opener)
            const isPopup = window.opener && !window.opener.closed;
            
            // If not a popup and not forced, redirect immediately
            if (!isPopup && !forcePopup) {
                window.location.replace(message.redirectUrl);
                return;
            }
            
            // Function to notify parent using multiple methods
            function notifyParentAndClose() {
                if (closeAttempted) return;
                closeAttempted = true;
                
                if (isPopup) {
                    try {
                        const targetOrigin = window.location.origin;
                        const notificationId = 'oauth-success-' + Date.now();
                        
                        // Method 1: Set localStorage flag (most reliable)
                        try {
                            localStorage.setItem('oauth_success', JSON.stringify({
                                id: notificationId,
                                redirectUrl: message.redirectUrl,
                                timestamp: Date.now(),
                                type: 'oauth-success'
                            }));
                            console.log('[OAuth Popup] localStorage flag set');
                        } catch (e) {
                            console.warn('[OAuth Popup] localStorage failed:', e);
                        }
                        
                        // Method 2: postMessage (backup)
                        try {
                            window.opener.postMessage(message, targetOrigin);
                            console.log('[OAuth Popup] postMessage sent');
                        } catch (e) {
                            console.warn('[OAuth Popup] postMessage failed:', e);
                        }
                        
                        // Method 3: Try to reload parent window directly
                        try {
                            if (window.opener && !window.opener.closed) {
                                window.opener.location.reload();
                                console.log('[OAuth Popup] Parent reload triggered');
                            }
                        } catch (e) {
                            console.warn('[OAuth Popup] Parent reload failed (cross-origin):', e);
                        }
                        
                        // Close popup after a short delay
                        setTimeout(function() {
                            try {
                                window.close();
                            } catch (e) {
                                console.warn('[OAuth Popup] Window close blocked, redirecting');
                                window.location.replace(message.redirectUrl);
                            }
                        }, 300);
                    } catch (error) {
                        console.error('[OAuth Popup] Error:', error);
                        window.location.replace(message.redirectUrl);
                    }
                } else {
                    // Not a popup, just redirect
                    window.location.replace(message.redirectUrl);
                }
            }
            
            // Execute immediately
            notifyParentAndClose();
            
            // Also try on DOM ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', notifyParentAndClose);
            }
        })();
    </script>
</body>
</html>

