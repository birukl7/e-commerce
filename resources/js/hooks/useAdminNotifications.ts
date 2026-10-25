import { useState, useEffect, useRef, useCallback } from 'react';

export interface AdminNotification {
    id: number;
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
    is_read: boolean;
}

interface UseAdminNotificationsReturn {
    notifications: AdminNotification[];
    unreadCount: number;
    loading: boolean;
    markRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    refetch: () => void;
}

const POLL_INTERVAL_MS = 30_000; // poll every 30 seconds

/**
 * useAdminNotifications
 *
 * Polls /api/admin/notifications every 30s to retrieve the latest admin
 * notifications. When new unread items arrive compared to the previous poll,
 * it automatically fires a browser push notification (if permission granted).
 *
 * Call `requestBrowserPermission()` early (e.g. on admin dashboard mount) to
 * ask the user for Notification permission.
 */
export function useAdminNotifications(): UseAdminNotificationsReturn {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Track the highest notification id we have already shown a browser notif for
    const lastSeenIdRef = useRef<number>(0);
    // Avoid multiple simultaneous requests
    const fetchingRef = useRef(false);

    const fetchNotifications = useCallback(async (isInitial = false) => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        try {
            const res = await fetch('/api/admin/notifications', {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (!res.ok) return;

            const json = await res.json();
            const incoming: AdminNotification[] = json.notifications ?? [];
            const count: number = json.unread_count ?? 0;

            setNotifications(incoming);
            setUnreadCount(count);

            // On first fetch, just set the baseline id; don't fire browser notifs.
            if (isInitial) {
                const maxId = incoming.reduce((max, n) => Math.max(max, n.id), 0);
                lastSeenIdRef.current = maxId;
                return;
            }

            // Fire browser notifications for any truly new items
            const newItems = incoming.filter(
                (n) => !n.is_read && n.id > lastSeenIdRef.current,
            );

            if (newItems.length > 0) {
                const maxNew = newItems.reduce((max, n) => Math.max(max, n.id), 0);
                lastSeenIdRef.current = maxNew;
                fireBrowserNotifications(newItems);
            }
        } catch {
            // silently fail — polling will retry next interval
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    }, []);

    // Initial fetch + interval
    useEffect(() => {
        fetchNotifications(true);

        const timer = setInterval(() => fetchNotifications(false), POLL_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [fetchNotifications]);

    const markRead = useCallback(async (id: number) => {
        try {
            await fetch(`/api/admin/notifications/${id}/mark-read`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString(), is_read: true } : n,
                ),
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // ignore
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await fetch('/api/admin/notifications/mark-all-read', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString(), is_read: true })),
            );
            setUnreadCount(0);
        } catch {
            // ignore
        }
    }, []);

    const refetch = useCallback(() => {
        fetchNotifications(false);
    }, [fetchNotifications]);

    return { notifications, unreadCount, loading, markRead, markAllRead, refetch };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Request browser notification permission.
 * Call this once on admin page load.
 */
export async function requestBrowserPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) return 'denied';
    if (Notification.permission === 'granted') return 'granted';
    if (Notification.permission === 'denied') return 'denied';
    return Notification.requestPermission();
}

function fireBrowserNotifications(items: AdminNotification[]) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Group: if more than 3 new items, show a summary instead
    if (items.length > 3) {
        new Notification('🛒 Serdo Admin', {
            body: `You have ${items.length} new notifications — including new payment submissions.`,
            icon: '/favicon.ico',
            tag: 'serdo-admin-bulk',
        });
        return;
    }

    items.forEach((n, i) => {
        // Slight delay so they don't all pop simultaneously
        setTimeout(() => {
            const notif = new Notification(`🔔 ${n.title}`, {
                body: n.message,
                icon: '/favicon.ico',
                tag: `serdo-admin-${n.id}`,
            });

            // Clicking the browser notification focuses the admin tab
            notif.onclick = () => {
                window.focus();
                if (n.data?.action_url && typeof n.data.action_url === 'string') {
                    window.location.href = n.data.action_url;
                }
                notif.close();
            };
        }, i * 600);
    });
}

function getCsrfToken(): string {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    return meta?.content ?? '';
}
