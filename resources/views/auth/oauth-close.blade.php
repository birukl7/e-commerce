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
            let messageSent = false;
            let closeAttempted = false;
            
            // Check if this is a popup window (has opener)
            const isPopup = window.opener && !window.opener.closed;
            
            // If not a popup and not forced, redirect immediately
            if (!isPopup && !forcePopup) {
                window.location.replace(message.redirectUrl);
                return;
            }
            
            // Function to send message to parent and close
            function notifyParentAndClose() {
                // Prevent multiple executions
                if (closeAttempted) return;
                closeAttempted = true;
                
                if (isPopup) {
                    try {
                        // Send message to parent window multiple times to ensure it's received
                        window.opener.postMessage(message, window.location.origin);
                        messageSent = true;
                        
                        // Send again after short delays as backup
                        setTimeout(function() {
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage(message, window.location.origin);
                            }
                        }, 50);
                        
                        setTimeout(function() {
                            if (window.opener && !window.opener.closed) {
                                window.opener.postMessage(message, window.location.origin);
                            }
                        }, 200);
                        
                        // Try to close immediately
                        setTimeout(function() {
                            try {
                                window.close();
                            } catch (e) {
                                console.warn('Window close blocked:', e);
                            }
                            
                            // Check if window is still open after a delay
                            setTimeout(function() {
                                if (!document.hidden) {
                                    try {
                                        window.close();
                                    } catch (e) {
                                        console.warn('Window could not be closed, redirecting');
                                        window.location.replace(message.redirectUrl);
                                    }
                                }
                            }, 300);
                        }, 200);
                    } catch (error) {
                        console.warn('Unable to notify opener', error);
                        window.location.replace(message.redirectUrl);
                    }
                } else {
                    // Not a popup, just redirect
                    window.location.replace(message.redirectUrl);
                }
            }
            
            // Execute immediately when script loads
            notifyParentAndClose();
            
            // Also try on DOM ready as backup
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', notifyParentAndClose);
            } else {
                setTimeout(notifyParentAndClose, 50);
            }
            
            // Final fallback - if window is still open after 1 second, force close
            setTimeout(function() {
                if (!document.hidden && isPopup) {
                    try {
                        window.close();
                    } catch (e) {
                        window.location.replace(message.redirectUrl);
                    }
                }
            }, 1000);
        })();
    </script>
</body>
</html>

