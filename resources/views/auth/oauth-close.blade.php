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
        .card a {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 24px;
            padding: 10px 20px;
            border-radius: 999px;
            background: #0f172a;
            color: #ffffff;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="card">
        <h1>All set!</h1>
        <p>You can close this window. We will take you back in a heartbeat.</p>
        <a href="{{ $redirectUrl }}" target="_self">Continue</a>
    </div>

    <script>
        (function() {
            const message = {
                type: 'oauth-success',
                redirectUrl: @json($redirectUrl),
            };

            if (window.opener && !window.opener.closed) {
                try {
                    window.opener.postMessage(message, window.location.origin);
                } catch (error) {
                    console.warn('Unable to notify opener', error);
                }
                window.close();
            } else {
                window.location.replace(message.redirectUrl);
            }
        })();
    </script>
</body>
</html>

