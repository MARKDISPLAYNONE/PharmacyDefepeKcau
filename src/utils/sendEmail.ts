// src/utils/sendEmail.ts
import axios from 'axios';

const RESEND_API_KEY = process.env.RESEND_API_KEY; // Store your API key in an environment variable

export async function sendEmail(to: string, subject: string, body: string) {
    try {
        const response = await axios.post(
            'https://api.resend.com/emails',
            {
                from: 'Defepe Pharmacy <onboarding@resend.dev>', // Replace with your verified domain
                to,
                subject,
                html: `<p>${body}</p>`, // You can customize the HTML content here
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                },
            }
        );

        if (response.status === 200) {
            console.log(`Email sent successfully to ${to}`);
        } else {
            console.error('Failed to send email:', response.data);
        }
    } catch (err: unknown) {
        console.error('Error sending email:', (err as Error).message);
    }
}