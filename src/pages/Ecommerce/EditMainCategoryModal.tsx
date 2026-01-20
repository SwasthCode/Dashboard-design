import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateMainCategory, MainCategory } from "../../store/slices/mainCategorySlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface EditMainCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: MainCategory | null;
}

export default function EditMainCategoryModal({ isOpen, onClose, category }: EditMainCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "Active"
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                description: category.description || "",
                status: category.status || "Active"
            });
        }
    }, [category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category?._id) return;

        setLoading(true);
        setError(null);

        const updatedCategory: Partial<MainCategory> = {
            name: formData.name,
            description: formData.description,
            status: formData.status,
        };

        try {
            await dispatch(updateMainCategory({ id: category._id, mainCategory: updatedCategory })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update main category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[550px] p-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Main Category</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <Label htmlFor="name">Main Category Name</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter main category name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        rows={4}
                        id="description"
                        placeholder="Type main category description"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div className="mb-4">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
