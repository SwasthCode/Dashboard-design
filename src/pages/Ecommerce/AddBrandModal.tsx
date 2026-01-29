import React, { useState, useEffect } from "react";
import DotLoading from "../../components/common/DotLoading";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addBrand } from "../../store/slices/brandSlice";

interface AddBrandModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddBrandModal({ isOpen, onClose }: AddBrandModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { mainCategories } = useSelector((state: RootState) => state.mainCategory);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        main_category_id: "",
        status: "active" as "active" | "inactive",
        image: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Brand name is required");
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("main_category_id", formData.main_category_id);
            data.append("status", formData.status);
            if (formData.image) {
                data.append("image", formData.image);
            }

            await dispatch(addBrand(data)).unwrap();
            onClose();
            setFormData({ name: "", main_category_id: "", status: "active", image: null });
            setImagePreview(null);
        } catch (err: any) {
            setError(err || "Failed to add brand");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setFormData({ name: "", main_category_id: "", status: "active", image: null });
            setImagePreview(null);
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add New Brand</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Brand Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800/50 overflow-hidden relative group">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 space-y-1">
                                    <p className="font-medium text-gray-700 dark:text-gray-300">Upload logo</p>
                                    <p>SVG, PNG, JPG (max. 2MB)</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Brand Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all dark:text-white"
                                placeholder="e.g. Nike, Apple"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Main Category</label>
                            <select
                                value={formData.main_category_id}
                                onChange={(e) => setFormData({ ...formData, main_category_id: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all dark:text-white"
                            >
                                <option value="">Select Main Category</option>
                                {mainCategories.map((mc) => (
                                    <option key={mc._id} value={mc._id}>
                                        {mc.name}
                                    </option>
                                ))}
                            </select>
                        </div>



                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all dark:text-white"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
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
                            ) : (
                                "Add Brand"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
