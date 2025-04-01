'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { ModeToggle } from '@/components/ModeToggle'; // Import ModeToggle

export default function LoginPage() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const router = useRouter();

    const handleLogin = async () => {
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email: email.toLowerCase(), // Convert email to lowercase
                password,
            });

            if (authError) throw authError;

            // Fetch profile data to verify role
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', data.user?.id)
                .single();

            if (profileError) throw profileError;

            // Redirect based on role
            if (profileData.role === 'super-admin') {
                router.push('/super-admin-dashboard');
            } else if (profileData.role === 'admin') {
                router.push('/patient-management-dashboard'); // Replace with actual admin dashboard route
            } else {
                setError('You are not authorized to access this system.');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            {/* Mode Toggle Button */}
            <ModeToggle />

            <h1 className="text-4xl font-bold mb-8">Defepe Pharmacy</h1>
            <div className="bg-card p-8 rounded-lg shadow-xl w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        {showPassword ? (
                            <span role="img" aria-label="Hide password">
                                🐒
                            </span>
                        ) : (
                            <span role="img" aria-label="Show password">
                                👁️
                            </span>
                        )}
                    </button>
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-green-600 transition-colors"
                >
                    Login
                </button>
                {error && <p className="text-destructive mt-4">{error}</p>}
            </div>
        </div>
    );
}