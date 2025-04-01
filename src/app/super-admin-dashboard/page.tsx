'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

// Define a type for the profile data
interface Profile {
    id: string;
    firstname: string;
    lastname: string;
    role: string;
    access_revoked: boolean;
}

export default function SuperAdminDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    useEffect(() => {
        const checkUserRoleAndFetchProfiles = async () => {
            try {
                // Check if the user is a super admin
                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    window.location.href = '/login'; // Redirect if not logged in
                    return;
                }

                // Fetch the super admin's profile to verify role
                const { data: profileData, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;

                if (profileData.role !== 'super-admin') {
                    window.location.href = '/login'; // Redirect if not a super admin
                    return;
                }

                setIsSuperAdmin(true);

                // Fetch all profiles (admins and super admins)
                const { data: allProfiles, error: fetchError } = await supabase
                    .from('profiles')
                    .select(`id, firstname, lastname, role, access_revoked`);

                if (fetchError) {
                    console.error('Fetch Error:', fetchError.message);
                    throw fetchError;
                }

                setProfiles(allProfiles || []);
            } catch (err: unknown) {
                console.error('Error:', (err as Error).message || 'An error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        checkUserRoleAndFetchProfiles();
    }, []);

    if (isLoading) return <p className="text-foreground">Loading...</p>;
    if (!isSuperAdmin) return <p className="text-destructive">Access Denied.</p>;

    // Function to revoke/unrevoke access
    const toggleAccess = async (profileId: string, revoke: boolean) => {
        try {
            // Update the access_revoked field in the profiles table
            const { error } = await supabase
                .from('profiles')
                .update({ access_revoked: revoke })
                .eq('id', profileId);

            if (error) throw error;

            // Update local state
            setProfiles((prevProfiles) =>
                prevProfiles.map((p) =>
                    p.id === profileId ? { ...p, access_revoked: revoke } : p
                )
            );

            // Broadcast a notification
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `Access ${revoke ? 'revoked' : 'restored'} for admin (ID: ${profileId}).`,
                        timestamp: new Date().toISOString(),
                        role: 'super-admin', // Target super admins
                    },
                });
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    // Function to delete an admin account
    const deleteAccount = async (profileId: string) => {
        try {
            if (!confirm('Are you sure you want to delete this account?')) return;

            // Delete from the profiles table
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', profileId);

            if (profileError) throw profileError;

            // Extract the user_id as a string
            const userId = profileId;

            // Delete from auth.users table
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) throw authError;

            // Update local state
            setProfiles((prevProfiles) => prevProfiles.filter((p) => p.id !== profileId));

            // Broadcast a notification
            await supabase
                .channel('custom-notifications')
                .send({
                    type: 'broadcast',
                    event: 'new_notification',
                    payload: {
                        message: `Admin account (ID: ${profileId}) has been deleted.`,
                        timestamp: new Date().toISOString(),
                        role: 'super-admin', // Target super admins
                    },
                });
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
        }
    };

    return (
        <div className="flex-grow p-8 transition-all duration-300 bg-background text-foreground">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Super Admin Dashboard</h1>

            {/* Profile Table */}
            {profiles.length === 0 ? (
                <p className="text-muted-foreground">No admins or super admins exist yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-card divide-y divide-border rounded-lg shadow-md">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    First Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Last Name
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-2 whitespace-nowrap">{profile.firstname}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{profile.lastname}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{profile.role}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {profile.role === 'admin' && (
                                            <>
                                                {/* Revoke/Unrevoke Access Button */}
                                                <button
                                                    className={`px-2 py-1 rounded ${
                                                        profile.access_revoked
                                                            ? 'bg-green-500 hover:bg-green-600'
                                                            : 'bg-yellow-500 hover:bg-yellow-600'
                                                    } text-white mr-2`}
                                                    onClick={() => toggleAccess(profile.id, !profile.access_revoked)}
                                                >
                                                    {profile.access_revoked ? 'Unrevoke' : 'Revoke'}
                                                </button>

                                                {/* Delete Account Button */}
                                                <button
                                                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    onClick={() => deleteAccount(profile.id)}
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}