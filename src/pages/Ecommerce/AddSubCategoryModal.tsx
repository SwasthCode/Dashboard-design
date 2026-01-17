import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addSubCategory, SubCategory } from "../../store/slices/subCategorySlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface AddSubCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddSubCategoryModal({ isOpen, onClose }: AddSubCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);

    const [formData, setFormData] = useState({
        name: "",
        parent: "",
        description: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newSubCategory: SubCategory = {
            name: formData.name,
            parent: formData.parent,
            description: formData.description,
            products: 0, // Initial count
        };

        dispatch(addSubCategory(newSubCategory));

        // Reset and close
        setFormData({
            name: "",
            parent: "",
            description: "",
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[550px] p-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Sub-Category</h3>
            </div>

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
                    <Label htmlFor="parent">Parent Category</Label>
                    <div className="relative">
                        <select
                            id="parent"
                            value={formData.parent}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none"
                        >
                            <option value="">Select Parent Category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category.name}>{category.name}</option>
                            ))}
                        </select>
                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
                            <svg
                                className="fill-current text-gray-500"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </span>
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
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
                    >
                        Add Sub-Category
                    </button>
                </div>
            </form>
        </Modal>
    );
}
