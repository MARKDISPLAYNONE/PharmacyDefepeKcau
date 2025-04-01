'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { ModeToggle } from '@/components/ModeToggle'; // Import ModeToggle

export default function ResetEmailPage() {
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleResetEmail = async () => {
        try {
            // Update the user's email and confirm with password
            const { error: authError } = await supabase.auth.updateUser({
                email: newEmail.toLowerCase(), // Convert email to lowercase
                password,
            });

            if (authError) throw authError;

            // Fetch the current user's ID
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found.');

            // Broadcast a notification for email update
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `Email updated successfully for super admin (ID: ${user.id}). New email: ${newEmail}.`,
                        timestamp: new Date().toISOString(),
                        role: 'super-admin', // Target super admins
                    },
                });

            alert('Email updated successfully. Please check your inbox for confirmation.');
            router.push('/super-admin-profile');
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            {/* Mode Toggle Button */}
            <ModeToggle />

            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Reset Email</h1>

            {/* Form Container */}
            <div className="bg-card p-8 rounded-lg shadow-xl w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">New Email</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full p-3 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Confirm Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <button
                    onClick={handleResetEmail}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-green-600 transition-colors"
                >
                    Update Email
                </button>
            </div>
        </div>
    );
}