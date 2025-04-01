'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';

export default function SuperAdminProfile() {
    const [profile, setProfile] = useState<{ firstname: string; lastname: string; profile_photo: string | null } | null>(null);
    const [editedProfile, setEditedProfile] = useState<{ firstname: string; lastname: string }>({ firstname: '', lastname: '' });
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (user) {
                    // Fetch profile data
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('user_id', user.id)
                        .single();
                    if (profileError) throw profileError;
                    setProfile(profileData);
                    setEditedProfile({ firstname: profileData.firstname, lastname: profileData.lastname });
                    // Fetch email from auth.users
                    setEmail(user.email || '');
                }
            } catch (err: unknown) {
                console.error((err as Error).message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('profiles')
                    .update({
                        firstname: editedProfile.firstname,
                        lastname: editedProfile.lastname,
                    })
                    .eq('user_id', user.id);
                if (error) throw error;

                // Broadcast a notification for profile update
                await supabase
                    .channel('custom-notifications')
                    .send({
                        type: 'broadcast',
                        event: 'new_notification',
                        payload: {
                            message: `Profile updated successfully for super admin (ID: ${user.id}).`,
                            timestamp: new Date().toISOString(),
                            role: 'super-admin', // Target super admins
                        },
                    });

                alert('Profile updated successfully!');
                window.location.href = '/super-admin-dashboard'; // Redirect to dashboard
            }
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    const handleProfilePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const file = event.target.files?.[0];
            if (!file) return;

            // Convert file to base64
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64String = reader.result as string;
                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) throw new Error('User not found.');

                // Update profile_photo in profiles table
                const { error } = await supabase
                    .from('profiles')
                    .update({ profile_photo: base64String })
                    .eq('user_id', user.id);
                if (error) throw error;

                // Broadcast a notification for profile photo upload
                await supabase
                    .channel('custom-notifications')
                    .send({
                        type: 'broadcast',
                        event: 'new_notification',
                        payload: {
                            message: `Profile photo uploaded successfully for super admin (ID: ${user.id}).`,
                            timestamp: new Date().toISOString(),
                            role: 'super-admin', // Target super admins
                        },
                    });

                setProfile({ ...profile!, profile_photo: base64String });
                alert('Profile photo updated successfully!');
            };
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    const handleProfilePhotoRemove = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) throw new Error('User not found.');

            // Remove profile_photo from profiles table
            const { error } = await supabase
                .from('profiles')
                .update({ profile_photo: null })
                .eq('user_id', user.id);
            if (error) throw error;

            // Broadcast a notification for profile photo removal
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `Profile photo removed successfully for super admin (ID: ${user.id}).`,
                        timestamp: new Date().toISOString(),
                        role: 'super-admin', // Target super admins
                    },
                });

            setProfile({ ...profile!, profile_photo: null });
            alert('Profile photo removed successfully!');
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    if (loading) return <p className="text-foreground">Loading...</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Super Admin Profile</h1>
            {/* Form Container */}
            <div className="bg-card p-8 rounded-lg shadow-xl w-full sm:max-w-sm md:max-w-md lg:max-w-lg">
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">First Name</label>
                    <input
                        type="text"
                        value={editedProfile.firstname}
                        onChange={(e) => setEditedProfile({ ...editedProfile, firstname: e.target.value })}
                        className="w-full p-3 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Last Name</label>
                    <input
                        type="text"
                        value={editedProfile.lastname}
                        onChange={(e) => setEditedProfile({ ...editedProfile, lastname: e.target.value })}
                        className="w-full p-3 mb-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
                    <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full p-3 mb-2 border rounded bg-muted cursor-not-allowed"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Profile Photo</label>
                    {profile?.profile_photo ? (
                        <div>
                            <Image
                                src={profile.profile_photo}
                                alt="Profile"
                                width={96}
                                height={96}
                                className="w-24 h-24 rounded-full object-cover border border-border mb-2"
                            />
                            <button
                                onClick={handleProfilePhotoRemove}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-red-600"
                            >
                                Remove Photo
                            </button>
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                            No Photo
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePhotoUpload}
                        className="mt-2"
                    />
                </div>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded hover:bg-green-600 transition-colors"
                    >
                        Save Changes
                    </button>
                    <button
                        onClick={() => {
                            setEditedProfile({ firstname: profile!.firstname, lastname: profile!.lastname });
                            window.location.href = '/super-admin-dashboard'; // Redirect to dashboard
                        }}
                        className="px-6 py-3 bg-muted text-muted-foreground rounded hover:bg-gray-400 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            try {
                                const { error } = await supabase.auth.resetPasswordForEmail(email);
                                if (error) throw error;
                                alert('Password reset link sent to your email.');
                            } catch (err: unknown) {
                                console.error((err as Error).message || 'An error occurred.');
                            }
                        }}
                        className="px-6 py-3 bg-destructive text-destructive-foreground rounded hover:bg-red-600 transition-colors"
                    >
                        Reset Password
                    </button>
                    <button
                        onClick={() => window.location.href = '/reset-email'}
                        className="px-6 py-3 bg-accent text-accent-foreground rounded hover:bg-yellow-600 transition-colors"
                    >
                        Reset Email
                    </button>
                </div>
            </div>
        </div>
    );
}