import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../../store/slices/productSlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddProductModal({ isOpen, onClose }: AddProductModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        subcategory_id: "",
        price: "",
        mrp: "",
        unit: "",
        quantity: "",
        description: "",
        isAvailable: true
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setImages((prev) => [...prev, ...selectedFiles]);

            selectedFiles.forEach((file) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews((prev) => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [id]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("category_id", formData.category_id);
            data.append("subcategory_id", formData.subcategory_id);
            data.append("price", formData.price);
            data.append("mrp", formData.mrp);
            data.append("unit", formData.unit);
            data.append("stock", formData.quantity);
            data.append("isAvailable", String(formData.isAvailable));
            data.append("description", formData.description);

            if (images.length > 0) {
                images.forEach((image) => {
                    data.append("image", image);
                });
            }

            await dispatch(addProduct(data)).unwrap();

            // Reset and close
            setFormData({
                name: "",
                category_id: "",
                subcategory_id: "",
                price: "",
                mrp: "",
                unit: "",
                quantity: "",
                description: "",
                isAvailable: true
            });
            setImages([]);
            onClose();
        } catch (err: any) {
            setError(err || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubCategories = subCategories.filter(s => s.category_id === formData.category_id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1000px] p-8 text-outfit">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Product</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            type="text"
                            id="name"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="quantity">Stock Quantity</Label>
                        <Input
                            type="number"
                            id="quantity"
                            placeholder="0"
                            value={formData.quantity}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                        <Label htmlFor="category_id">Category</Label>
                        <select
                            id="category_id"
                            value={formData.category_id}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="subcategory_id">Sub-Category</Label>
                        <select
                            id="subcategory_id"
                            value={formData.subcategory_id}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none"
                        >
                            <option value="">Select Sub-Category</option>
                            {filteredSubCategories.map((sub) => (
                                <option key={sub._id} value={sub._id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="price">Sale Price</Label>
                        <Input
                            type="number"
                            id="price"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="mrp">MRP</Label>
                        <Input
                            type="number"
                            id="mrp"
                            placeholder="0.00"
                            value={formData.mrp}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="unit">Unit (e.g. Kg, Pcs)</Label>
                            <select
                                id="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                required
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none"
                            >
                                <option value="">Select Unit</option>
                                <option value="Kg">Kg</option>
                                <option value="Pcs">Pcs</option>
                                <option value="Gm">Gm</option>
                                <option value="Ltr">Ltr</option>
                                <option value="Ml">Ml</option>
                                <option value="Packet">Packet</option>
                                <option value="Box">Box</option>
                            </select>
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                rows={6}
                                id="description"
                                placeholder="Type product description"
                                className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                                value={formData.description}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label htmlFor="images">Product Images</Label>
                        <div className="relative block w-full cursor-pointer appearance-none rounded-2xl border-2 border-dashed border-brand-500 bg-gray-50/50 py-8 px-4 dark:bg-gray-800/30">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                                onChange={handleImageUpload}
                            />
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z" fill="#3C50E0" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z" fill="#3C50E0" />
                                        <path fillRule="evenodd" clipRule="evenodd" d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z" fill="#3C50E0" />
                                    </svg>
                                </span>
                                <div className="text-center">
                                    <p className="text-sm text-gray-800 dark:text-white font-medium">Click to upload</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG or GIF</p>
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-4 gap-3">
                                {previews.map((src, index) => (
                                    <div key={index} className="relative group h-16 w-16 border rounded-xl overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                        <img src={src} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 focus:outline-none"
                                            title="Remove Image"
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                    />
                    <Label htmlFor="isAvailable" className="mb-0">Product is available for sale</Label>
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
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Adding..." : "Add Product"}
                    </button>
                </div>
            </form>
        </Modal >
    );
}
