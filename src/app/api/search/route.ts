import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

// Define a Patient interface
interface Patient {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    drug_category: string;
    purchase_date: string;
    days_until_next_dose: number;
    next_dose_date: string;
}

// Helper function to calculate reminder dates
function calculateReminderDates(nextDoseDate: string): string[] {
    const reminders = [];
    const doseDate = new Date(nextDoseDate);

    // Calculate 3 days before the dose date
    const threeDaysBefore = new Date(doseDate);
    threeDaysBefore.setDate(doseDate.getDate() - 3);
    reminders.push(threeDaysBefore.toISOString().split('T')[0]);

    // Calculate 1 day before the dose date
    const oneDayBefore = new Date(doseDate);
    oneDayBefore.setDate(doseDate.getDate() - 1);
    reminders.push(oneDayBefore.toISOString().split('T')[0]);

    // Include the dose date itself
    reminders.push(doseDate.toISOString().split('T')[0]);

    return reminders;
}

export async function GET(request: Request) {
    try {
        // Extract the search query from the URL
        const url = new URL(request.url);
        const query = url.searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Search query is required.' }, { status: 400 });
        }

        // Split the query into parts (e.g., "Mark Kamau" -> ["Mark", "Kamau"])
        const queryParts = query.trim().split(/\s+/);

        // Build the Supabase query
        let supabaseQuery = supabase.from('patients').select('*').limit(10);

        if (queryParts.length === 2) {
            // Search by firstname and lastname
            supabaseQuery = supabaseQuery
                .ilike('firstname', `%${queryParts[0]}%`)
                .ilike('lastname', `%${queryParts[1]}%`);
        } else if (query.includes('@')) {
            // Search by email
            supabaseQuery = supabaseQuery.ilike('email', `%${query}%`);
        } else if (/^\+?\d+$/.test(query)) {
            // Search by phone number
            supabaseQuery = supabaseQuery.ilike('phone_number', `%${query}%`);
        } else {
            // Default: Search by firstname, lastname, or email
            supabaseQuery = supabaseQuery
                .ilike('firstname', `%${query}%`)
                .or(`lastname.ilike.%${query}%, email.ilike.%${query}%`);
        }

        // Execute the query
        const { data, error } = await supabaseQuery;

        if (error) throw error;

        // Add reminder dates to each patient
        const patientsWithReminders = data.map((patient: Patient) => ({
            ...patient,
            reminder_dates: calculateReminderDates(patient.next_dose_date),
        }));

        return NextResponse.json(patientsWithReminders, { status: 200 });
    } catch (err: unknown) {
        console.error((err as Error).message || 'An error occurred while searching for patients.');
        return NextResponse.json({ error: 'An error occurred while searching for patients.' }, { status: 500 });
    }
}