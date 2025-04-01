'use client';

import { useContext } from 'react';
import { SidebarContext } from '@/context/SidebarContext';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen } = useContext(SidebarContext);

    return (
        <main
            className={`flex-grow transition-all duration-300 bg-background text-foreground ${
                isSidebarOpen ? 'ml-[16rem]' : 'ml-[4rem]'
            }`}
        >
            {children}
        </main>
    );
}