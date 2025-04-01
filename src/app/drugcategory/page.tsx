'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';

interface DrugCategory {
    id: string;
    name: string;
    drugs: { id: string; name: string }[];
}

export default function DrugCategoryManagementPage() {
    const [drugCategories, setDrugCategories] = useState<DrugCategory[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch drug categories and their associated drugs
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, error } = await supabase
                    .from('drug_categories')
                    .select(`
                        id,
                        name,
                        drugs (
                            id,
                            name
                        )
                    `);

                if (error) throw error;

                setDrugCategories(data || []);
            } catch (err: unknown) {
                console.error((err as Error).message || 'An error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle adding a new drug category
    const handleAddCategory = async (name: string) => {
        try {
            const { data, error } = await supabase
                .from('drug_categories')
                .insert({ name })
                .select();

            if (error) throw error;

            setDrugCategories((prev) => [...prev, { id: data[0].id, name, drugs: [] }]);
        } catch (err: unknown) {
            console.error((err as Error).message || 'Failed to add drug category.');
        }
    };

    // Handle deleting a drug category
    const handleDeleteCategory = async (categoryId: string) => {
        try {
            const { error } = await supabase
                .from('drug_categories')
                .delete()
                .eq('id', categoryId);

            if (error) throw error;

            setDrugCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
        } catch (err: unknown) {
            console.error((err as Error).message || 'Failed to delete drug category.');
        }
    };

    // Handle adding a new drug under a category
    const handleAddDrug = async (categoryId: string, name: string) => {
        try {
            const { data, error } = await supabase
                .from('drugs')
                .insert({ name, drug_category_id: categoryId })
                .select();

            if (error) throw error;

            setDrugCategories((prev) =>
                prev.map((cat) =>
                    cat.id === categoryId
                        ? { ...cat, drugs: [...cat.drugs, { id: data[0].id, name }] }
                        : cat
                )
            );
        } catch (err: unknown) {
            console.error((err as Error).message || 'Failed to add drug.');
        }
    };

    // Handle deleting a drug
    const handleDeleteDrug = async (drugId: string, categoryId: string) => {
        try {
            const { error } = await supabase
                .from('drugs')
                .delete()
                .eq('id', drugId);

            if (error) throw error;

            setDrugCategories((prev) =>
                prev.map((cat) =>
                    cat.id === categoryId
                        ? { ...cat, drugs: cat.drugs.filter((drug) => drug.id !== drugId) }
                        : cat
                )
            );
        } catch (err: unknown) {
            console.error((err as Error).message || 'Failed to delete drug.');
        }
    };

    if (loading) return <p className="text-foreground">Loading...</p>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground p-8">
            {/* Header */}
            <header className="bg-primary text-primary-foreground py-4 px-6 rounded-lg shadow-md mb-8">
                <h1 className="text-3xl font-bold">Drug Category Management</h1>
            </header>

            {/* Add New Drug Category */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Add New Drug Category</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const name = (e.target as HTMLFormElement).categoryName.value;
                        handleAddCategory(name);
                        (e.target as HTMLFormElement).reset();
                    }}
                    className="flex space-x-4"
                >
                    <input
                        type="text"
                        name="categoryName"
                        placeholder="Enter drug category name"
                        required
                        className="w-full p-2 border border-input rounded"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
                    >
                        Add Category
                    </button>
                </form>
            </div>

            {/* Display Drug Categories and Drugs */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Drug Categories</h2>
                {drugCategories.length > 0 ? (
                    drugCategories.map((category) => (
                        <div key={category.id} className="mb-6">
                            {/* Category Header */}
                            <div className="flex justify-between items-center bg-card text-card-foreground p-4 rounded-lg shadow-sm">
                                <h3 className="font-bold">{category.name}</h3>
                                <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                                >
                                    Delete Category
                                </button>
                            </div>

                            {/* Add New Drug */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const name = (e.target as HTMLFormElement).drugName.value;
                                    handleAddDrug(category.id, name);
                                    (e.target as HTMLFormElement).reset();
                                }}
                                className="mt-4 flex space-x-4"
                            >
                                <input
                                    type="text"
                                    name="drugName"
                                    placeholder="Enter drug name"
                                    required
                                    className="w-full p-2 border border-input rounded"
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/80 transition-colors"
                                >
                                    Add Drug
                                </button>
                            </form>

                            {/* Display Drugs */}
                            <table className="min-w-full mt-4 bg-card divide-y divide-border rounded-lg shadow-sm">
                                <thead className="bg-muted text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2">Drug Name</th>
                                        <th className="px-4 py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {category.drugs.length > 0 ? (
                                        category.drugs.map((drug) => (
                                            <tr key={drug.id}>
                                                <td className="px-4 py-2">{drug.name}</td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        onClick={() => handleDeleteDrug(drug.id, category.id)}
                                                        className="px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors"
                                                    >
                                                        Delete Drug
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={2} className="text-center p-4 text-muted-foreground">
                                                No drugs found for this category.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground">No drug categories found.</p>
                )}
            </div>
        </div>
    );
}