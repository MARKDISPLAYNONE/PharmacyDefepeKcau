'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import NoSidebarLayout from './NoSidebarLayout';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Define routes where the sidebar should appear
    const sidebarRoutes = [
        '/super-admin-dashboard',
        '/super-admin-profile',
        '/super-admin-notifications',
        '/patient-management-dashboard'
    ];

    const noSidebarRoutes = ['/login', '/reset-email'];

    if (sidebarRoutes.includes(pathname)) {
        // Render Sidebar Layout
        return (
            <div className="flex min-h-screen">
                <Sidebar />
                <MainContent>{children}</MainContent>
            </div>
        );
    }

    if (noSidebarRoutes.includes(pathname)) {
        // Render No Sidebar Layout
        return <NoSidebarLayout>{children}</NoSidebarLayout>;
    }

    // Default Fallback Layout (Optional)
    return <NoSidebarLayout>{children}</NoSidebarLayout>;
}