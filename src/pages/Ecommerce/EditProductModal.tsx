import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct, Product } from "../../store/slices/productSlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        subcategory_id: "",
        price: 0,
        mrp: 0,
        unit: "",
        stock: 0,
        description: "",
        isAvailable: true
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                category_id: product.category_id || "",
                subcategory_id: product.subcategory_id || "",
                price: product.price || 0,
                mrp: product.mrp || 0,
                unit: product.unit || "",
                stock: product.stock || 0,
                description: product.description || "",
                isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
            });
        }
    }, [product]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [id]: checked }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product?._id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("category_id", formData.category_id);
            data.append("subcategory_id", formData.subcategory_id);
            data.append("price", formData.price.toString());
            data.append("mrp", formData.mrp.toString());
            data.append("unit", formData.unit);
            data.append("stock", formData.stock.toString());
            data.append("isAvailable", String(formData.isAvailable));
            data.append("description", formData.description);

            if (images.length > 0) {
                images.forEach((image) => {
                    data.append("image", image);
                });
            }

            await dispatch(updateProduct({ id: product._id, product: data })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubCategories = subCategories.filter(s => s.category_id === formData.category_id);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-6 text-outfit">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Product</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="category_id">Category</Label>
                        <div className="relative">
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
                    </div>
                    <div>
                        <Label htmlFor="subcategory_id">Sub-Category</Label>
                        <div className="relative">
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
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="price">Price</Label>
                        <Input
                            type="number"
                            id="price"
                            placeholder="Enter price"
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
                            placeholder="Enter MRP"
                            value={formData.mrp}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="stock">Stock</Label>
                        <Input
                            type="number"
                            id="stock"
                            placeholder="Enter stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="unit">Unit (e.g. Kg, Pcs)</Label>
                        <Input
                            type="text"
                            id="unit"
                            placeholder="Enter unit"
                            value={formData.unit}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        rows={3}
                        id="description"
                        placeholder="Type product description"
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>

                <div>
                    <Label htmlFor="images">Product Images (Leave empty to keep current)</Label>
                    <input
                        type="file"
                        id="images"
                        accept="image/*"
                        multiple
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                        onChange={handleImageUpload}
                    />
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
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
