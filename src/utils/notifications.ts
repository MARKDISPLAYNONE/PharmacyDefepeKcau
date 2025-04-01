import { supabase } from './supabase';

// Function to create a notification for a super admin
export const createSuperAdminNotification = async (userId: string, message: string) => {
    const { error } = await supabase.from('superadminnotifications').insert({
        user_id: userId,
        message,
    });

    if (error) {
        console.error('Error creating super admin notification:', error.message);
    }
};