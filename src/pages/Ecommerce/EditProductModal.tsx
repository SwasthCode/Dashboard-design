import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProduct, Product, ProductImage } from "../../store/slices/productSlice";
import { fetchBrands } from "../../store/slices/brandSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { RootState, AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DotLoading from "../../components/common/DotLoading";
import { PRODUCT_UNITS } from "../../constants/constants";


interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export default function EditProductModal({ isOpen, onClose, product }: EditProductModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);
    const { brands } = useSelector((state: RootState) => state.brand);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        subcategory_id: "",
        brand_id: "",
        price: 0,
        mrp: 0,
        unit: "",
        stock: 0,
        description: "",
        isAvailable: true
    });

    const [variants, setVariants] = useState<{
        label: string;
        price: string;
        originalPrice: string;
        shelfLife: string;
        manufacturerName: string;
        manufacturerAddress: string;
        expiryDate: string;
        _id?: string;
    }[]>([]);

    const calculateDiscount = (price: string | number, mrp: string | number) => {
        const p = typeof price === 'string' ? parseFloat(price) : price;
        const m = typeof mrp === 'string' ? parseFloat(mrp) : mrp;
        if (p && m && m > p) {
            const discount = ((m - p) / m) * 100;
            return Math.round(discount) + "%";
        }
        return "0%";
    };

    const addVariant = () => {
        setVariants([{
            label: "",
            price: "",
            originalPrice: "",
            shelfLife: "",
            manufacturerName: "",
            manufacturerAddress: "",
            expiryDate: ""
        }, ...variants]);
        setExpandedIndex(0);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const cloneVariant = (index: number) => {
        const variantToClone = variants[index];
        const { _id, ...rest } = variantToClone;
        setVariants([{ ...rest }, ...variants]);
        setExpandedIndex(0);
    };

    const updateVariant = (index: number, field: string, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setVariants(updatedVariants);
    };

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                category_id: product.category_id || (typeof product.category === 'string' ? product.category : product.category?._id) || "",
                subcategory_id: product.subcategory_id || (typeof product.subcategory === 'string' ? product.subcategory : product.subcategory?._id) || "",
                brand_id: product.brand_id || (typeof product.brand === 'string' ? product.brand : product.brand?._id) || "",
                price: product.price || 0,
                mrp: product.mrp || 0,
                unit: product.unit?.toLowerCase() || "",
                stock: product.stock || 0,
                description: product.description || "",
                isAvailable: product.isAvailable !== undefined ? product.isAvailable : true
            });
            setExistingImages(product.images || []);
            setRemovedImageIds([]);
            setImages([]);
            setPreviews([]);
            setVariants(
                (product.variants || []).map((v) => ({
                    label: v.label,
                    price: v.price.toString(),
                    originalPrice: v.originalPrice.toString(),
                    shelfLife: v.shelfLife || "",
                    manufacturerName: v.manufacturer || v.manufacturerName || "",
                    manufacturerAddress: v.manufacturerAddress || "",
                    expiryDate: v.expiryDate || "",
                    _id: v._id,
                }))
            );
        }
    }, [product]);

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchBrands({}));
            dispatch(fetchCategories());
            dispatch(fetchSubCategories());
        }
    }, [isOpen, dispatch]);

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
        if (e.target.files && e.target.files.length > 0) {
            const selectedFiles = Array.from(e.target.files);

            // Update images state immediately
            setImages((prev) => [...prev, ...selectedFiles]);

            // Process previews in order
            Promise.all(selectedFiles.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                });
            })).then(newPreviews => {
                setPreviews((prev) => [...prev, ...newPreviews]);
            });

            // Reset input value to allow selecting the same file again
            e.target.value = "";
        }
    };

    const removeNewImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: string) => {
        setExistingImages((prev) => prev.filter((img) => img._id !== imageId));
        setRemovedImageIds((prev) => [...prev, imageId]);
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
            data.append("brand_id", formData.brand_id);
            data.append("price", formData.price.toString());
            data.append("mrp", formData.mrp.toString());
            data.append("unit", formData.unit);
            data.append("stock", formData.stock.toString());
            data.append("isAvailable", String(formData.isAvailable));
            data.append("description", formData.description);

            if (removedImageIds.length > 0) {
                // Remove duplicates if any
                const uniqueIds = [...new Set(removedImageIds)];
                data.append("removedImageIds", JSON.stringify(uniqueIds));
            }

            if (images.length > 0) {
                images.forEach((image) => {
                    data.append("images", image);
                });
            }

            if (variants.length > 0) {
                const formattedVariants = variants.map((v, index) => ({
                    id: `v${index + 1}`,
                    label: v.label,
                    price: parseFloat(v.price),
                    originalPrice: parseFloat(v.originalPrice),
                    discount: calculateDiscount(v.price, v.originalPrice),
                    shelfLife: v.shelfLife,
                    manufacturer: v.manufacturerName,
                    manufacturerAddress: v.manufacturerAddress,
                    expiryDate: v.expiryDate,
                    _id: v._id,
                }));
                data.append("variants", JSON.stringify(formattedVariants));
            }

            await dispatch(updateProduct({ id: product._id, product: data })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setImages([]);
            setPreviews([]);
            setRemovedImageIds([]);
            if (product) {
                setExistingImages(product.images || []);
            }
        }
    }, [isOpen, product]);

    const filteredSubCategories = subCategories.filter(s => {
        const parentId = typeof s.category_id === 'string'
            ? s.category_id
            : (s.category_id as any)?._id || s.category?._id;
        return parentId === formData.category_id;
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[1400px] w-full p-4 md:p-6 text-outfit mx-4 md:mx-auto mt-4 md:mt-0 mb-4 md:mb-0">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4 md:mb-6">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white">Edit Product</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-start">
                    {/* Left Column: Primary Details */}
                    <div className="space-y-4">
                        <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                <div className="md:col-span-6">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Enter product name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="category_id">Category</Label>
                                    <select
                                        id="category_id"
                                        value={formData.category_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-1 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="subcategory_id">Subcategory</Label>
                                    <select
                                        id="subcategory_id"
                                        value={formData.subcategory_id}
                                        onChange={handleInputChange}
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-1 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all"
                                        disabled={!formData.category_id}
                                    >
                                        <option value="">Select Subcategory</option>
                                        {filteredSubCategories.map((sub) => (
                                            <option key={sub._id} value={sub._id}>{sub.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="brand_id">Brand</Label>
                                    <select
                                        id="brand_id"
                                        value={formData.brand_id}
                                        onChange={handleInputChange}
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-1 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all"
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map((brand) => (
                                            <option key={brand._id} value={brand._id}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <Label htmlFor="unit">Unit (e.g. Kg, Pcs)</Label>
                                    <select
                                        id="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-1 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white appearance-none transition-all"
                                    >
                                        <option value="">Select Unit</option>
                                        {PRODUCT_UNITS.map((unit) => (
                                            <option key={unit.value} value={unit.value}>{unit.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-3">
                                    <Label htmlFor="stock">Base Stock Count</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        placeholder="0"
                                        value={formData.stock}
                                        onChange={handleInputChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="price">Base Price</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label htmlFor="mrp">Base MRP</Label>
                                    <Input
                                        id="mrp"
                                        type="number"
                                        placeholder="0"
                                        value={formData.mrp}
                                        onChange={handleInputChange}
                                        required
                                        className="h-10"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Discount</Label>
                                    <div className="h-10 flex items-center px-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-lg">
                                        <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                            {calculateDiscount(formData.price, formData.mrp)} OFF
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
                            <div>
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Product Description</Label>
                                <textarea
                                    rows={2}
                                    id="description"
                                    placeholder="Brief overview of the product..."
                                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-brand-50/30 dark:bg-brand-500/5 rounded-xl border border-brand-100 dark:border-brand-900/30">
                                <input
                                    type="checkbox"
                                    id="isAvailable"
                                    checked={formData.isAvailable}
                                    onChange={handleInputChange}
                                    className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500 transition-all cursor-pointer"
                                />
                                <Label htmlFor="isAvailable" className="mb-0 text-sm font-semibold text-brand-700 dark:text-brand-400 cursor-pointer">Available for Sale</Label>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Variants & Media */}
                    <div className="space-y-4">
                        <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Product Variants</h4>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white font-bold text-[10px] rounded-lg hover:bg-brand-600 transition-all shadow-sm active:scale-95"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                    <span>Add Variant</span>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {variants.map((variant, index) => (
                                    <div key={index} className={`bg-white dark:bg-gray-900 rounded-xl border ${expandedIndex === index ? 'border-brand-200 dark:border-brand-800 ring-1 ring-brand-500/5' : 'border-gray-100 dark:border-gray-800 shadow-sm'} overflow-hidden transition-all duration-300`}>
                                        <div
                                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                            className={`flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${expandedIndex === index ? 'bg-brand-50/30 dark:bg-brand-500/5 border-b border-gray-100 dark:border-gray-800' : ''}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1 rounded-md transition-transform duration-300 ${expandedIndex === index ? 'rotate-180 text-brand-500' : 'text-gray-400'}`}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M6 9l6 6 6-6" />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold ${expandedIndex === index ? 'text-brand-700 dark:text-brand-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                                        {variant.label || `Variant #${index + 1}`}
                                                    </span>
                                                    {variant.price && (
                                                        <span className="text-[10px] text-gray-500 font-medium tracking-tight">₹{variant.price}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    type="button"
                                                    onClick={() => cloneVariant(index)}
                                                    className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg transition-all"
                                                    title="Clone"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Remove"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`overflow-hidden transition-all duration-300 ${expandedIndex === index ? 'max-h-[500px] opacity-100 p-4 space-y-4' : 'max-h-0 opacity-0'}`}>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Label</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="500g"
                                                        value={variant.label}
                                                        onChange={(e) => updateVariant(index, "label", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Price</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={variant.price}
                                                        onChange={(e) => updateVariant(index, "price", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">MRP</Label>
                                                    <Input
                                                        type="number"
                                                        placeholder="0"
                                                        value={variant.originalPrice}
                                                        onChange={(e) => updateVariant(index, "originalPrice", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Shelf Life</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="6m"
                                                        value={variant.shelfLife}
                                                        onChange={(e) => updateVariant(index, "shelfLife", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Expiry Range (MM/YYYY)</Label>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="relative flex-1">
                                                            <Input
                                                                type="month"
                                                                value={variant.expiryDate?.split('-')[0] ? (() => {
                                                                    const [m, y] = variant.expiryDate.split('-')[0].split('/');
                                                                    return y && m ? `${y}-${m}` : '';
                                                                })() : ''}
                                                                onChange={(e) => {
                                                                    const [y, m] = e.target.value.split('-');
                                                                    const currentTo = variant.expiryDate?.split('-')[1] || '';
                                                                    updateVariant(index, "expiryDate", `${m}/${y}-${currentTo}`);
                                                                }}
                                                                className="h-9 text-[10px] px-2 pr-1"
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400">to</span>
                                                        <div className="relative flex-1">
                                                            <Input
                                                                type="month"
                                                                value={variant.expiryDate?.split('-')[1] ? (() => {
                                                                    const [m, y] = variant.expiryDate.split('-')[1].split('/');
                                                                    return y && m ? `${y}-${m}` : '';
                                                                })() : ''}
                                                                onChange={(e) => {
                                                                    const [y, m] = e.target.value.split('-');
                                                                    const currentFrom = variant.expiryDate?.split('-')[0] || '';
                                                                    updateVariant(index, "expiryDate", `${currentFrom}-${m}/${y}`);
                                                                }}
                                                                className="h-9 text-[10px] px-2 pr-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Manufacturer Name</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Name"
                                                        value={variant.manufacturerName}
                                                        onChange={(e) => updateVariant(index, "manufacturerName", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-[10px] uppercase text-gray-400 font-bold mb-1">Manufacturer Address</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="Address"
                                                        value={variant.manufacturerAddress}
                                                        onChange={(e) => updateVariant(index, "manufacturerAddress", e.target.value)}
                                                        className="h-9 text-xs"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {variants.length === 0 && (
                                <p className="text-center text-[10px] text-gray-400 py-6 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">Click "+ Add Variant" to create product variations</p>
                            )}
                        </div>

                        <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Product Media</h4>
                            <div className="relative block w-full cursor-pointer appearance-none rounded-xl border-2 border-dashed border-brand-200 bg-white py-6 px-4 dark:bg-gray-900/50 hover:border-brand-500 transition-colors group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                                    onChange={handleImageUpload}
                                />
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 group-hover:scale-110 transition-transform">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                                        </svg>
                                    </div>
                                    <p className="text-xs text-gray-800 dark:text-white font-bold">Upload Photos</p>
                                </div>
                            </div>

                            <div className="overflow-x-auto pb-1 custom-scrollbar">
                                <div className="flex gap-3 mt-4">
                                    {/* Existing Images */}
                                    {existingImages.map((img) => (
                                        <div key={img._id} className="relative group min-w-[100px] w-[100px] flex-shrink-0 aspect-square border rounded-xl overflow-hidden border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                                            <img src={img.url} alt="Current" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(img._id)}
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

                                    {/* New Previews */}
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative group min-w-[100px] w-[100px] flex-shrink-0 aspect-square border rounded-xl overflow-hidden border-brand-200 dark:border-brand-900 shadow-sm transition-all hover:shadow-md ring-2 ring-brand-500/20">
                                            <img src={src} alt="Preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewImage(index)}
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
                </div>

                <div className="flex gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-2.5 bg-brand-500 text-white font-bold text-sm rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
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
