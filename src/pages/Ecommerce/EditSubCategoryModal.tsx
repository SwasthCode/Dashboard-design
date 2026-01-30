import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSubCategory, SubCategory } from "../../store/slices/subCategorySlice";
import { fetchBrands } from "../../store/slices/brandSlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DotLoading from "../../components/common/DotLoading";


interface EditSubCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    subCategory: SubCategory | null;
}

export default function EditSubCategoryModal({ isOpen, onClose, subCategory }: EditSubCategoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);
    const { brands } = useSelector((state: RootState) => state.brand);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        brand_id: "",
        description: "",
        status: "active"
    });
    const [images, setImages] = useState<File[]>([]);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && brands.length === 0) {
            dispatch(fetchBrands({}));
        }
    }, [isOpen, brands.length, dispatch]);

    useEffect(() => {
        if (subCategory) {
            setFormData({
                name: subCategory.name || "",
                category_id: subCategory.category_id || subCategory.category?._id || "",
                brand_id: subCategory.brand_id || subCategory.brand?._id || "",
                description: subCategory.description || "",
                status: (subCategory.status || "active").toLowerCase()
            });
            setPreview(subCategory.image || null);
        }
    }, [subCategory]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImages([file]);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subCategory?._id) return;

        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append("name", formData.name);
        data.append("category_id", formData.category_id);
        data.append("brand_id", formData.brand_id);
        data.append("description", formData.description);
        data.append("status", formData.status);

        if (images.length > 0) {
            data.append("image", images[0]);
        }

        try {
            await dispatch(updateSubCategory({
                id: subCategory._id,
                subCategory: data
            })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update sub-category");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setImages([]);
            if (subCategory) {
                setPreview(subCategory.image || null);
            }
        }
    }, [isOpen, subCategory]);

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

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Sub-Category Name */}
                    <div className="col-span-1">
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

                    {/* Status */}
                    <div className="col-span-1">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800 transition-all outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Parent Category */}
                    <div className="col-span-1">
                        <Label htmlFor="category_id">Parent Category</Label>
                        <div className="relative">
                            <select
                                id="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                required
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all outline-none"
                            >
                                <option value="">Select Parent Category</option>
                                {categories.map((category, index) => (
                                    <option key={index} value={category._id}>{category.name}</option>
                                ))}
                            </select>
                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="currentColor" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* Brand */}
                    <div className="col-span-1">
                        <Label htmlFor="brand_id">Brand</Label>
                        <div className="relative">
                            <select
                                id="brand_id"
                                value={formData.brand_id}
                                onChange={handleInputChange}
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all outline-none"
                            >
                                <option value="">Select Brand</option>
                                {brands.map((brand, index) => (
                                    <option key={index} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2 pointer-events-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z" fill="currentColor" />
                                </svg>
                            </span>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            rows={3}
                            id="description"
                            placeholder="Type sub-category description"
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                            value={formData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>

                    {/* Sub-Category Image */}
                    <div className="col-span-1 md:col-span-2">
                        <Label htmlFor="images">Sub-Category Image</Label>
                        <div className="relative group block w-full cursor-pointer appearance-none rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 hover:bg-gray-100/50 dark:bg-gray-800/30 dark:hover:bg-gray-800/50 py-5 px-4 transition-all duration-200">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                                onChange={handleImageUpload}
                            />
                            <div className="flex flex-col items-center justify-center space-y-2">
                                {preview ? (
                                    <div className="relative w-24 h-24 mb-2 shadow-md">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg border border-white dark:border-gray-700"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <p className="text-[10px] text-white font-medium">Change Image</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 group-hover:scale-110 transition-transform duration-200">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 3.33331V16.6666M3.33333 9.99998H16.6667" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{preview ? "Change image" : "Click to upload image"}</p>
                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </div>
                            </div>
                        </div>
                        {images.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-xs text-green-600 dark:text-green-500 border border-green-100 dark:border-green-500/20">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.3333 4L5.99999 11.3333L2.66666 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>New image: {images[0].name}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <DotLoading size="md" className="text-white" />
                                <span>Saving...</span>
                            </>
                        ) : "Update"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
