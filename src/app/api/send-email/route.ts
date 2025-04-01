import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { to, subject, body } = await request.json();

        // Validate input
        if (!to || !subject || !body) {
            return NextResponse.json(
                { error: 'Missing required fields: to, subject, or body.' },
                { status: 400 }
            );
        }

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Defepe Pharmacy <onboarding@resend.dev>', // Replace with your verified domain
            to,
            subject,
            html: `<p>${body}</p>`,
        });

        if (error) throw error;

        return NextResponse.json({ message: 'Email sent successfully', data }, { status: 200 });
    } catch (err: unknown) {
        console.error('Error sending email:', (err as Error).message);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}