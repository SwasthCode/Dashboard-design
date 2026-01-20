import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSubCategory, SubCategory } from "../../store/slices/subCategorySlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface EditSubCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    subCategory: SubCategory | null;
}

export default function EditSubCategoryModal({ isOpen, onClose, subCategory }: EditSubCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        description: "",
        image: "",
    });

    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name || "",
                category_id: subCategory.category_id || "",
                description: subCategory.description || "",
                image: subCategory.image || "",
            });
        }
    }, [subCategory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subCategory?._id) return;

        setLoading(true);
        setError(null);

        try {
            await dispatch(updateSubCategory({
                id: subCategory._id,
                subCategory: formData
            })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update sub-category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[550px] p-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Sub-Category</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <Label htmlFor="name">Sub-Category Name</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter sub-category name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="mb-4">
                    <Label htmlFor="category_id">Parent Category</Label>
                    <div className="relative">
                        <select
                            id="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none"
                        >
                            <option value="">Select Parent Category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category._id}>{category.name}</option>
                            ))}
                        </select>
                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
                            <svg className="fill-current text-gray-500" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="currentColor" />
                            </svg>
                        </span>
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="image">Sub-Category Image</Label>
                    <div className="mt-2 flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full w-full text-gray-400">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <Input
                            type="text"
                            id="image"
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={handleInputChange}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        rows={4}
                        id="description"
                        placeholder="Type sub-category description"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div className="flex gap-3 pt-4">
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
