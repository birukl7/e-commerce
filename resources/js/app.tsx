import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import './lib/i18n';

const appName = import.meta.env.VITE_APP_NAME || 'Serdo';

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
        <App {...props} />
        );
    },
    progress: {
        color: '#4B5563',
    },
});



// This will set light / dark mode on load...
initializeTheme();

// Global OAuth success handler - ensures message is received even if LoginDialog isn't mounted
window.addEventListener('message', (event: MessageEvent) => {
    // Only accept messages from the same origin
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data?.type === 'oauth-success') {
        const redirectUrl: string = event.data.redirectUrl || '/';
        
        // Dispatch custom event to close any open auth modals
        window.dispatchEvent(new CustomEvent('oauth:success', { detail: { redirectUrl } }));
        
        // Force a full page reload to ensure auth state is refreshed
        setTimeout(() => {
            window.location.href = redirectUrl;
        }, 200);
    }
});
