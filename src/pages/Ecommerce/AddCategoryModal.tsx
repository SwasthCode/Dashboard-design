import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addCategory, Category } from "../../store/slices/categorySlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddCategoryModal({ isOpen, onClose }: AddCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [images, setImages] = useState<File[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        status: "Active"
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id === "name") {
            setFormData((prev) => ({
                ...prev,
                name: value,
                slug: value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') // Auto-generate slug
            }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create a mock image URL or use a placeholder
        const imageUrl = images.length > 0
            ? URL.createObjectURL(images[0])
            : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&q=80";

        const newCategory: Category = {
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            status: formData.status,
            image: imageUrl,
        };

        dispatch(addCategory(newCategory));

        // Reset and close
        setFormData({
            name: "",
            slug: "",
            description: "",
            status: "Active"
        });
        setImages([]);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[550px] p-6">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Category</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                        type="text"
                        id="name"
                        placeholder="Enter category name"
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
                        placeholder="Type category description"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div className="mb-4">
                    <Label htmlFor="images">Category Image</Label>
                    <div className="relative block w-full cursor-pointer appearance-none rounded-lg border-2 border-dashed border-brand-500 bg-gray-50 py-4 px-4 dark:bg-gray-800/50 sm:py-6">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                            onChange={handleImageUpload}
                        />
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                                        fill="#3C50E0"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                                        fill="#3C50E0"
                                    />
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                                        fill="#3C50E0"
                                    />
                                </svg>
                            </span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                <span className="text-brand-500 font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF</p>
                        </div>
                    </div>
                    {images.length > 0 && <div className="mt-2 text-xs text-green-600 font-medium">{images.length} image(s) selected</div>}
                </div>

                <div className="mb-6">
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
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
                    >
                        Add Category
                    </button>
                </div>
            </form>
        </Modal>
    );
}
