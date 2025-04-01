'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/utils/supabase';

interface FormData {
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    sex: 'M' | 'F';
    drug_category: string;
    drug: string;
    purchase_date: string;
    days_until_next_dose: number;
}

interface PatientOnboardingFormProps {
    isOpen: boolean;
    onClose: () => void;
    editingPatient?: {
        id: string;
        firstname: string | null;
        lastname: string | null;
        email: string;
        phone_number: string;
        sex: 'M' | 'F';
        drug_category: string;
        drug: string;
        purchase_date: string;
        days_until_next_dose: number;
    };
}

export default function PatientOnboardingForm({
    isOpen,
    onClose,
    editingPatient,
}: PatientOnboardingFormProps) {
    const [drugCategories, setDrugCategories] = useState<{ id: string; name: string }[]>([]);
    const [drugs, setDrugs] = useState<{ id: string; name: string }[]>([]);

    const {
        register,
        handleSubmit,
        watch,
        setValue, // Used to set values dynamically
        formState: { errors },
    } = useForm<FormData>();

    const watchCategory = watch('drug_category');

    // Fetch drug categories and drugs
    useEffect(() => {
        const fetchDrugCategories = async () => {
            const { data, error } = await supabase.from('drug_categories').select('id, name');
            if (error) console.error(error.message);
            else setDrugCategories(data || []);
        };

        const fetchDrugs = async (category: string) => {
            const categoryId = drugCategories.find((cat) => cat.name === category)?.id;
            if (!categoryId) return;
            const { data, error } = await supabase
                .from('drugs')
                .select('id, name')
                .eq('drug_category_id', categoryId);
            if (error) console.error(error.message);
            else setDrugs(data || []);
        };

        fetchDrugCategories();
        if (watchCategory) fetchDrugs(watchCategory);
    }, [watchCategory, drugCategories]);

    // Pre-fill form fields if editingPatient is provided
    useEffect(() => {
        if (editingPatient) {
            setValue('firstname', editingPatient.firstname || '');
            setValue('lastname', editingPatient.lastname || '');
            setValue('email', editingPatient.email || '');
            setValue('phone_number', editingPatient.phone_number || '');
            setValue('sex', editingPatient.sex || '');
            setValue('drug_category', editingPatient.drug_category || '');
            setValue('drug', editingPatient.drug || '');
            setValue('purchase_date', editingPatient.purchase_date || '');
            setValue('days_until_next_dose', editingPatient.days_until_next_dose || 1);
        }
    }, [editingPatient, setValue]);

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        try {
            // Calculate next dose date
            const purchaseDate = new Date(data.purchase_date);
            const nextDoseDate = new Date(
                purchaseDate.setDate(purchaseDate.getDate() + data.days_until_next_dose)
            );

            if (editingPatient) {
                // Update existing patient
                const { error } = await supabase
                    .from('patients')
                    .update({
                        firstname: data.firstname,
                        lastname: data.lastname,
                        email: data.email,
                        phone_number: data.phone_number,
                        sex: data.sex,
                        drug_category: data.drug_category,
                        drug: data.drug,
                        purchase_date: data.purchase_date,
                        days_until_next_dose: data.days_until_next_dose,
                        next_dose_date: nextDoseDate.toISOString(),
                    })
                    .eq('id', editingPatient.id);
                if (error) throw error;
                alert('Patient updated successfully!');
            } else {
                // Insert new patient
                const { error } = await supabase.from('patients').insert({
                    firstname: data.firstname,
                    lastname: data.lastname,
                    email: data.email,
                    phone_number: data.phone_number,
                    sex: data.sex,
                    drug_category: data.drug_category,
                    drug: data.drug,
                    purchase_date: data.purchase_date,
                    days_until_next_dose: data.days_until_next_dose,
                    next_dose_date: nextDoseDate.toISOString(),
                });
                if (error) throw error;
                alert('Patient onboarded successfully!');
            }
            onClose(); // Close the modal
        } catch (err: unknown) {
            console.error((err as Error).message || 'An error occurred.');
            alert('Failed to save patient.');
        }
    };

    if (!isOpen) return null;

    return (
        <dialog open={isOpen} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-card p-8 rounded-lg shadow-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold mb-4">
                    {editingPatient ? 'Edit Patient' : 'Onboard Patient'}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* First Name */}
                        <input
                            type="text"
                            placeholder="First Name"
                            {...register('firstname', { required: 'First name is required.' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.firstname && <p className="text-red-500 text-xs">{errors.firstname.message}</p>}

                        {/* Last Name */}
                        <input
                            type="text"
                            placeholder="Last Name"
                            {...register('lastname', { required: 'Last name is required.' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.lastname && <p className="text-red-500 text-xs">{errors.lastname.message}</p>}

                        {/* Email */}
                        <input
                            type="email"
                            placeholder="Email"
                            {...register('email', { required: 'Email is required.' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}

                        {/* Phone Number */}
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            {...register('phone_number', { required: 'Phone number is required.' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs">{errors.phone_number.message}</p>}

                        {/* Sex */}
                        <select
                            {...register('sex', { required: 'Sex is required.' })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                        </select>
                        {errors.sex && <p className="text-red-500 text-xs">{errors.sex.message}</p>}

                        {/* Drug Category */}
                        <select
                            {...register('drug_category', { required: 'Drug category is required.' })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select</option>
                            {drugCategories.map((category) => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.drug_category && <p className="text-red-500 text-xs">{errors.drug_category.message}</p>}

                        {/* Drug */}
                        <select
                            {...register('drug', { required: 'Drug is required.' })}
                            className="w-full p-2 border rounded"
                        >
                            <option value="">Select</option>
                            {drugs.map((drug) => (
                                <option key={drug.id} value={drug.name}>
                                    {drug.name}
                                </option>
                            ))}
                        </select>
                        {errors.drug && <p className="text-red-500 text-xs">{errors.drug.message}</p>}

                        {/* Purchase Date */}
                        <input
                            type="date"
                            {...register('purchase_date', { required: 'Purchase date is required.' })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.purchase_date && <p className="text-red-500 text-xs">{errors.purchase_date.message}</p>}

                        {/* Days Until Next Dose */}
                        <input
                            type="number"
                            placeholder="Days Until Next Dose"
                            {...register('days_until_next_dose', {
                                required: 'Days until next dose is required.',
                                min: { value: 1, message: 'Minimum value is 1.' },
                            })}
                            className="w-full p-2 border rounded"
                        />
                        {errors.days_until_next_dose && (
                            <p className="text-red-500 text-xs">{errors.days_until_next_dose.message}</p>
                        )}

                        {/* Submit Button */}
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-green-600">
                            {editingPatient ? 'Update Patient' : 'Add Patient'}
                        </button>

                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}