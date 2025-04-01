'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import PatientOnboardingForm from '@/components/PatientOnboardingForm/PatientOnboardingForm'; // Ensure correct path

interface Patient {
    id: string;
    firstname: string | null; // Use Supabase column name
    lastname: string | null; // Use Supabase column name
    email: string;
    phone_number: string;
    sex: 'M' | 'F';
    drug_category: string;
    drug: string;
    purchase_date: string;
    days_until_next_dose: number;
    next_dose_date: string;
    deleted_at: string | null;
}

export default function PatientManagementDashboard() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [trashBin, setTrashBin] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

    // Fetch active patients and trash bin data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch active patients
                const { data: activePatients, error: activeError } = await supabase
                    .from('patients')
                    .select('*')
                    .is('deleted_at', null); // Only active patients

                if (activeError) throw activeError;

                setPatients(activePatients || []);

                // Fetch soft-deleted patients (trash bin)
                const { data: deletedPatients, error: deletedError } = await supabase
                    .from('patients')
                    .select('*')
                    .not('deleted_at', 'is', null); // Only soft-deleted patients

                if (deletedError) throw deletedError;

                setTrashBin(deletedPatients || []);
            } catch (err: unknown) {
                console.error((err as Error).message || 'An error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Soft delete a patient
    const handleSoftDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            setPatients((prevPatients) => prevPatients.filter((p) => p.id !== id));
            setTrashBin((prevTrash) => [...prevTrash, patients.find((p) => p.id === id)!]);
            alert('Patient moved to trash bin.');
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
            alert('Failed to delete patient.');
        }
    };

    // Restore a patient
    const handleRestore = async (id: string) => {
        try {
            const { error } = await supabase
                .from('patients')
                .update({ deleted_at: null })
                .eq('id', id);

            if (error) throw error;

            setTrashBin((prevTrash) => prevTrash.filter((p) => p.id !== id));
            alert('Patient restored successfully.');
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
            alert('Failed to restore patient.');
        }
    };

    // Handle opening the edit modal
    const handleEdit = (patient: Patient) => {
        setEditingPatient(patient);
        setIsEditModalOpen(true);
    };

    return (
        <div className="p-8 transition-all duration-300 bg-background text-foreground">
            {/* Header */}
            <h1 className="text-3xl font-bold mb-6">Patient Management Dashboard</h1>

            {/* Onboard Patients Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsOnboardingModalOpen(true)}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-green-600"
                >
                    Onboard Patients
                </button>
            </div>

            {/* Active Patients Table */}
            <h2 className="text-xl font-semibold mb-4">Active Patients</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-card divide-y divide-border rounded-lg shadow-md">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Phone</th>
                            <th className="px-4 py-2">Drug Category</th>
                            <th className="px-4 py-2">Drug</th>
                            <th className="px-4 py-2">Next Dose Date</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={7} className="text-center p-4">
                                    Loading...
                                </td>
                            </tr>
                        ) : patients.length > 0 ? (
                            patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {`${patient.firstname || 'N/A'} ${patient.lastname || ''}`.trim()}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.phone_number}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.drug_category}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.drug}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.next_dose_date}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <button
                                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                                            onClick={() => handleEdit(patient)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            onClick={() => handleSoftDelete(patient.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center p-4">
                                    No active patients found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Trash Bin Section */}
            <h2 className="text-xl font-semibold mt-8 mb-4">Trash Bin</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-card divide-y divide-border rounded-lg shadow-md">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Email</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trashBin.length > 0 ? (
                            trashBin.map((patient) => (
                                <tr key={patient.id}>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {`${patient.firstname || 'N/A'} ${patient.lastname || ''}`.trim()}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{patient.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <button
                                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                            onClick={() => handleRestore(patient.id)}
                                        >
                                            Restore
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center p-4">
                                    No patients in trash bin.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Onboarding Form Modal */}
            {isOnboardingModalOpen && (
                <PatientOnboardingForm
                    isOpen={isOnboardingModalOpen}
                    onClose={() => setIsOnboardingModalOpen(false)}
                />
            )}

            {/* Edit Patient Modal */}
            {isEditModalOpen && editingPatient && (
                <PatientOnboardingForm
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setEditingPatient(null); // Reset editing state
                    }}

                />
            )}
        </div>
    );
}