'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button'; // Import the Button component

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
    reminder_dates: string[]; // Add reminder dates
}

export default function ReminderPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]); // Store search results
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null); // Store selected patient

    // Fetch patient data based on search query
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search query.');
            return;
        }

        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error('Failed to fetch patient data.');

            const data: Patient[] = await response.json(); // Use the Patient type
            console.log('API Response:', data); // Log the response

            if (!Array.isArray(data)) {
                console.error('Invalid API response:', data);
                alert('An error occurred while fetching patient data.');
                return;
            }

            setPatients(data); // Update search results
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred while searching for patients.');
            alert('An error occurred while searching for patients.');
        }
    };

    // Select a patient from the search results
    const handleSelectPatient = (patient: Patient) => {
        setSelectedPatient(patient); // Update selected patient
        setPatients([]); // Clear search results
    };

    return (
        <div className="p-8 bg-background text-foreground min-h-screen">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Reminder Management</h1>

            {/* Search Bar */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Search for a Patient</h2>
                <div className="flex space-x-4">
                    <input
                        type="text"
                        placeholder="Enter patient name (e.g., Mark Kamau), email, or phone number"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 border rounded"
                    />
                    {/* Use the shadcn/ui Button component */}
                    <Button onClick={handleSearch} variant="default">
                        Search
                    </Button>
                </div>
            </div>

            {/* Display Search Results */}
            {patients.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Search Results</h2>
                    <ul className="space-y-2">
                        {patients.map((patient) => (
                            <li
                                key={patient.id}
                                className="bg-card p-4 rounded-lg shadow-sm cursor-pointer hover:bg-muted"
                                onClick={() => handleSelectPatient(patient)}
                            >
                                <p className="font-bold">{`${patient.firstname} ${patient.lastname}`}</p>
                                <p className="text-sm text-muted-foreground">{patient.email}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Display Selected Patient Details */}
            {selectedPatient && (
                <div>
                    <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
                    <div className="space-y-2">
                        <p><strong>Name:</strong> {`${selectedPatient.firstname} ${selectedPatient.lastname}`}</p>
                        <p><strong>Email:</strong> {selectedPatient.email}</p>
                        <p><strong>Phone Number:</strong> {selectedPatient.phone_number}</p>
                        <p><strong>Drug Category:</strong> {selectedPatient.drug_category}</p>
                        <p><strong>Purchase Date:</strong> {selectedPatient.purchase_date}</p>
                        <p><strong>Days Until Next Dose:</strong> {selectedPatient.days_until_next_dose}</p>
                        <p><strong>Next Dose Date:</strong> {selectedPatient.next_dose_date}</p>
                        <p><strong>Reminder Dates:</strong></p>
                        <ul className="pl-4">
                            {selectedPatient.reminder_dates.map((date, index) => (
                                <li key={index}>{date}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}