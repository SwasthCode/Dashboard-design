import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import { useDispatch, useSelector } from "react-redux";
import { addProduct } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { useNavigate } from "react-router";
import { RootState, AppDispatch } from "../../store";

export default function AddProduct() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);

    const [images, setImages] = useState<File[]>([]);
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

    useEffect(() => {
        if (categories.length === 0) dispatch(fetchCategories());
        if (subCategories.length === 0) dispatch(fetchSubCategories());
    }, [dispatch, categories.length, subCategories.length]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
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
            navigate("/products");
        } catch (err: any) {
            setError(err || "Failed to add product");
        } finally {
            setLoading(false);
        }
    };

    const filteredSubCategories = subCategories.filter(s => s.category_id === formData.category_id);

    return (
        <div>
            <PageMeta
                title="Add Product | TailAdmin - React.js Admin Dashboard"
                description="Add a new product to your store"
            />
            <PageBreadcrumb pageTitle="Add Product" />

            <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
                <div className="flex flex-col gap-9">
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                            <h3 className="font-medium text-black dark:text-white">
                                Product Details
                            </h3>
                        </div>

                        {error && (
                            <div className="m-6.5 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="p-6.5">
                                <div className="mb-4.5">
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

                                <div className="grid grid-cols-2 gap-4 mb-4.5">
                                    <div>
                                        <Label htmlFor="category_id">Category</Label>
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                id="category_id"
                                                value={formData.category_id}
                                                onChange={handleInputChange}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                                                required
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
                                        <div className="relative z-20 bg-transparent dark:bg-form-input">
                                            <select
                                                id="subcategory_id"
                                                value={formData.subcategory_id}
                                                onChange={handleInputChange}
                                                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                                                required
                                            >
                                                <option value="">Select Sub-Category</option>
                                                {filteredSubCategories.map((sub) => (
                                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4.5">
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

                                <div className="grid grid-cols-2 gap-4 mb-4.5">
                                    <div>
                                        <Label htmlFor="quantity">Quantity (Stock)</Label>
                                        <Input
                                            type="number"
                                            id="quantity"
                                            placeholder="Enter quantity"
                                            value={formData.quantity}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="unit">Unit</Label>
                                        <Input
                                            type="text"
                                            id="unit"
                                            placeholder="Enter unit (e.g. Kg)"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        rows={4}
                                        id="description"
                                        placeholder="Type brand description"
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="mb-6">
                                    <Label htmlFor="images">Product Images</Label>
                                    <div
                                        id="FileUpload"
                                        className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                                            onChange={handleImageUpload}
                                        />
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
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
                                            <p>
                                                <span className="text-primary">Click to upload</span> or
                                                drag and drop
                                            </p>
                                            <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                                        </div>
                                    </div>
                                    {images.length > 0 && <div className="mt-2 text-sm text-green-600 font-medium">{images.length} image(s) selected</div>}
                                </div>

                                <div className="mb-6 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                    />
                                    <Label htmlFor="isAvailable" className="mb-0">Product is available for sale</Label>
                                </div>

                                <button type="submit" disabled={loading} className="flex w-full justify-center rounded bg-brand-500 p-3 font-medium text-gray hover:bg-opacity-90 text-white disabled:opacity-50">
                                    {loading ? "Adding..." : "Add Product"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
