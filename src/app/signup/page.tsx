'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { ModeToggle } from '@/components/ModeToggle'; // Import ModeToggle

export default function SignupPage() {
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const router = useRouter();

    const handleSignup = async () => {
        try {
            // Validate password match
            if (password !== confirmPassword) {
                setError('Passwords do not match.');
                return;
            }

            // Validate password length
            if (password.length < 8) {
                setError('Password must be at least 8 characters long.');
                return;
            }

            // Sign up the user with Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email: email.toLowerCase(),
                password,
                options: {
                    data: {
                        firstName,
                        lastName,
                        role: 'admin', // Fixed role for admins
                    },
                },
            });

            if (authError) throw authError;

            // Insert profile data into the profiles table
            const { error: profileError } = await supabase.from('profiles').insert({
                user_id: data.user?.id,
                firstname: firstName,
                lastname: lastName,
                role: 'admin',
                access_revoked: false,
            });

            if (profileError) throw profileError;

            // Broadcast a notification for super admins
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `A new admin account (${email}) has been created.`,
                        timestamp: new Date().toISOString(),
                        role: 'super-admin', // Target super admins
                    },
                });

            // Optionally, broadcast a notification for the new admin
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `Welcome to Defepe Pharmacy, ${firstName}!`,
                        timestamp: new Date().toISOString(),
                        role: 'admin', // Target the new admin
                    },
                });

            // Redirect to login page with success message
            router.push('/login?message=Account created successfully. Please log in.');
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred while creating the account.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            {/* Mode Toggle Button */}
            <ModeToggle />

            <h1 className="text-4xl font-bold mb-8">Defepe Pharmacy</h1>
            <div className="bg-card p-8 rounded-lg shadow-xl w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
                <h2 className="text-2xl font-semibold mb-6 text-center">Create Admin Account</h2>
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
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
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                    onClick={handleSignup}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-green-600 transition-colors"
                >
                    Create Account
                </button>
                {error && <p className="text-destructive mt-4">{error}</p>}
            </div>
        </div>
    );
}