'use client';

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { SidebarContext } from '@/context/SidebarContext';
import { ModeToggle } from '@/components/ModeToggle'; // Import ModeToggle

export default function Sidebar() {
    const { isSidebarOpen, toggleSidebar } = useContext(SidebarContext);
    const [profile, setProfile] = useState<{
        firstname: string;
        lastname: string;
        profile_photo: string | null;
        role: string; // Include role to distinguish between admin and super admin
    } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    window.location.href = '/login'; // Redirect if not logged in
                    return;
                }

                // Fetch profile data
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) throw profileError;

                setProfile(profileData);
            } catch (err: unknown) {
                console.error((err as Error).message || 'An error occurred.');
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        // Subscribe to real-time notifications
        const channel = supabase.channel('custom-notifications');

        channel.on('broadcast', { event: 'new_notification' }, () => {
            setUnreadCount((prev) => prev + 1); // Increment unread count
        });

        channel.subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div
            className={`fixed top-0 left-0 h-screen transition-all duration-300 bg-sidebar text-sidebar-foreground ${
                isSidebarOpen ? 'w-64' : 'w-16'
            } border-r-2 dark:border-white border-black`}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4">
                {/* Hamburger Icon */}
                <button
                    onClick={toggleSidebar}
                    className="text-sidebar-foreground focus:outline-none"
                >
                    ☰
                </button>

                {/* Mode Toggle Button (Hidden in Collapsed State) */}
                {isSidebarOpen && <ModeToggle />}
            </div>

            {/* Main Navigation */}
            <nav className="mt-4">
                <ul className="space-y-2">
                    {/* Conditional Links Based on Role */}
                    {profile?.role === 'super-admin' && (
                        <>
                            <li>
                                <Link
                                    href="/super-admin-dashboard"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    🏠 {isSidebarOpen && 'Dashboard'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/super-admin-profile"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    👤 {isSidebarOpen && 'Profile'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/super-admin-notifications"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded relative"
                                >
                                    🔔 {isSidebarOpen && 'Notifications'}
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        </>
                    )}
                    {['admin'].includes(profile?.role || '') && (
                        <>
                            <li>
                                <Link
                                    href="/patient-management-dashboard"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    🏥 {isSidebarOpen && 'Patient Management'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/admin-profile"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    👤 {isSidebarOpen && 'Profile'}
                                </Link>
                            </li>
                            {/* New Links for Admin */}
                            <li>
                                <Link
                                    href="/reminder"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    ⏰ {isSidebarOpen && 'Reminder Management'}
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/drugcategory"
                                    className="flex items-center px-4 py-2 hover:bg-opacity-20 hover:bg-black/10 dark:hover:bg-white/10 rounded"
                                >
                                    💊 {isSidebarOpen && 'Drug Categories'}
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Footer */}
            <div className="absolute bottom-0 w-full p-4 bg-sidebar-accent">
                <div className="flex items-center space-x-2 mb-2">
                    {/* Profile Photo */}
                    {profile?.profile_photo ? (
                        <Image
                            src={profile.profile_photo}
                            alt="Profile"
                            width={32}
                            height={32}
                            className="rounded-full border-2 border-white"
                        />
                    ) : (
                        <div className="w-8 h-8 bg-sidebar-accent-foreground rounded-full border-2 border-white"></div>
                    )}

                    {/* Profile Details (Hidden in Collapsed State) */}
                    {isSidebarOpen && (
                        <div>
                            <p className="text-sm">{profile?.firstname} {profile?.lastname}</p>
                            <p className="text-xs text-sidebar-accent-foreground">{profile?.role}</p>
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        await supabase.auth.signOut();
                        window.location.href = '/login';
                    }}
                    className="w-full py-2 bg-sidebar-primary text-sidebar-primary-foreground rounded hover:bg-red-600"
                >
                    {isSidebarOpen ? 'Logout' : '🚪'}
                </button>
            </div>
        </div>
    );
}