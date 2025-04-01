'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

// Define a type for notifications
interface Notification {
    id: string;
    message: string;
    timestamp: string;
}

export default function SuperAdminDashboard() {
    const [notifications, setNotifications] = useState<Notification[]>([]); // State for notifications
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUserRoleAndSubscribe = async () => {
            try {
                // Check if the user is logged in
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    window.location.href = '/login'; // Redirect if not logged in
                    return;
                }

                // Fetch the super admin's profile to verify role
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;

                if (profileData.role !== 'super-admin') {
                    window.location.href = '/login'; // Redirect if not a super admin
                    return;
                }

                // Subscribe to real-time notifications
                const channel = supabase.channel('custom-notifications');

                channel.on('broadcast', { event: 'new_notification' }, (payload) => {
                    console.log('Received Notification:', payload); // Debugging log
                    if (payload.payload.role === 'super-admin') {
                        const newNotification: Notification = {
                            id: crypto.randomUUID(),
                            message: payload.payload.message,
                            timestamp: payload.payload.timestamp,
                        };
                        setNotifications((prev) => [newNotification, ...prev]);
                    }
                });

                channel.subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            } catch (err: unknown) {
                console.error('Error:', (err as Error).message || 'An error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRoleAndSubscribe();
    }, []);

    if (isLoading) return <p className="text-foreground">Loading...</p>;

    return (
        <div className="flex-grow p-8 transition-all duration-300 bg-background text-foreground">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

            {/* Real-Time Notifications Section */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Recent Notifications</h2>
                {notifications.length === 0 ? (
                    <p className="text-muted-foreground">No recent notifications.</p>
                ) : (
                    <ul className="space-y-2">
                        {notifications.map((notification) => (
                            <li
                                key={notification.id}
                                className="p-3 rounded-lg bg-card text-muted-foreground"
                            >
                                <p>{notification.message}</p>
                                <small className="text-xs text-muted-foreground">
                                    {new Date(notification.timestamp).toLocaleString()}
                                </small>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}