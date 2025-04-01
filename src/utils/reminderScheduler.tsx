import cron from 'node-cron';
import axios from 'axios';
import { supabase } from '@/utils/supabase';

// Define an interface for the Patient object
interface Patient {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    drug: string;
    drug_category: string;
    reminder_dates: string[]; // Array of dates when reminders are due
}

// Function to send email reminders
async function sendEmailReminder(patient: Patient, reminderDate: string) {
    const emailSubject = `Reminder: Your Next Dose is Due on ${reminderDate}`;
    const emailBody = `
        Hi ${patient.firstname} ${patient.lastname},
        
        This is a reminder that your next dose of ${patient.drug} (${patient.drug_category}) is due on ${reminderDate}.
        
        Please ensure you take your medication on time.
        
        Best regards,
        Defepe Pharmacy
    `;

    try {
        // Send email using the /api/send-email endpoint
        await axios.post('http://localhost:3000/api/send-email', {
            to: patient.email,
            subject: emailSubject,
            body: emailBody,
        });

        console.log(`Reminder email sent to ${patient.email} for ${reminderDate}`);
    } catch (err: unknown) {
        console.error(`Failed to send email to ${patient.email}:`, (err as Error).message);
    }
}

// Cron job to check for reminders
export function startReminderScheduler() {
    cron.schedule('0 0 * * *', async () => {
        // Run this job daily at midnight
        console.log('Checking for reminders...');

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Query Supabase for patients with reminders due today
        const { data: patients, error } = await supabase
            .from('patients')
            .select('*')
            .contains('reminder_dates', [today]);

        if (error) {
            console.error('Error fetching patients:', error.message);
            return;
        }

        // Send reminders for each patient
        if (patients && Array.isArray(patients)) {
            for (const patient of patients) {
                await sendEmailReminder(patient as Patient, today); // Cast the patient object to the Patient type
            }
        }
    });
}