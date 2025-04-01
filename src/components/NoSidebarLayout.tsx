'use client';

export default function NoSidebarLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="min-h-screen items-center justify-center p-8 bg-gray-100">
            {children}
        </main>
    );
}