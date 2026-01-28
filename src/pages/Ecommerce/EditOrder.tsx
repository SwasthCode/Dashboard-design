
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOrderById, updateOrder, OrderItem } from "../../store/slices/orderSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchCategories } from "../../store/slices/categorySlice";
import { fetchSubCategories } from "../../store/slices/subCategorySlice";
import { fetchBrands } from "../../store/slices/brandSlice";
import { fetchAddresses } from "../../store/slices/addressSlice";
import AddAddressModal from "./AddAddressModal";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DotLoading from "../../components/common/DotLoading";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function EditOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const { selectedOrder, loading: orderLoading } = useSelector((state: RootState) => state.order);
    const { products } = useSelector((state: RootState) => state.product);
    const { categories } = useSelector((state: RootState) => state.category);
    const { subCategories } = useSelector((state: RootState) => state.subCategory);
    const { brands } = useSelector((state: RootState) => state.brand);
    const { addresses } = useSelector((state: RootState) => state.address);

    // Local State
    const [isSaving, setIsSaving] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        customer_name: "",
        shipping_address: "",
        shipping_phone: "",
        status: "",
        createdAt: "",
        total_amount: 0
    });

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // Product Filter State
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubCategory, setSelectedSubCategory] = useState("");
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedProductToAdd, setSelectedProductToAdd] = useState("");
    const [addQuantity, setAddQuantity] = useState(1);

    // Initial Fetch
    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
        dispatch(fetchProducts({}));
        dispatch(fetchCategories({}));
        dispatch(fetchSubCategories({}));
        dispatch(fetchBrands({}));
    }, [dispatch, id]);

    // Populate Data
    useEffect(() => {
        if (selectedOrder) {
            setFormData({
                customer_name: selectedOrder.customer_name || (selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : "") || "",
                shipping_address: selectedOrder.shipping_address || (selectedOrder.address ? selectedOrder.address.address : "") || "",
                shipping_phone: selectedOrder.shipping_phone || (selectedOrder.address ? selectedOrder.address.shipping_phone : "") || "",
                status: selectedOrder.status,
                createdAt: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toISOString().split('T')[0] : "",
                total_amount: selectedOrder.total_amount
            });
            setOrderItems(selectedOrder.items || []);

            if (selectedOrder.user?._id) {
                dispatch(fetchAddresses({ filter: { user_id: selectedOrder.user._id } }));
            }
        }
    }, [selectedOrder, dispatch]);

    const handleAddressSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addressId = e.target.value;
        if (!addressId) return;

        const selectedAddr = addresses.find(a => a._id === addressId);
        if (selectedAddr) {
            const formattedAddress = `${selectedAddr.address}, ${selectedAddr.locality}, ${selectedAddr.city}, ${selectedAddr.state}, ${selectedAddr.pincode}`;
            setFormData(prev => ({
                ...prev,
                shipping_address: formattedAddress,
                shipping_phone: selectedAddr.shipping_phone || prev.shipping_phone
            }));
        }
    };

    // Filtered Products Calculation
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchCategory = selectedCategory ? (product.category_id === selectedCategory || product.category?._id === selectedCategory) : true;
            const matchSubCategory = selectedSubCategory ? (product.subcategory_id === selectedSubCategory || product.subcategory?._id === selectedSubCategory) : true;
            const matchBrand = selectedBrand ? (product.brand_id === selectedBrand || product.brand?._id === selectedBrand) : true;
            return matchCategory && matchSubCategory && matchBrand;
        });
    }, [products, selectedCategory, selectedSubCategory, selectedBrand]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddProduct = () => {
        if (!selectedProductToAdd) return;
        const product = products.find(p => p._id === selectedProductToAdd);
        if (product) {
            const existingIndex = orderItems.findIndex(item => (item.product_id === product._id) || ((item as any)._id === product._id));
            if (existingIndex >= 0) {
                const newItems = [...orderItems];
                newItems[existingIndex].quantity += addQuantity;
                setOrderItems(newItems);
            } else {
                setOrderItems(prev => [...prev, {
                    product_id: product._id!,
                    name: product.name,
                    product_name: product.name,
                    image: product.images?.[0]?.url,
                    price: product.price,
                    quantity: addQuantity,
                    brand_name: product.brand?.name
                }]);
            }
            setSelectedProductToAdd("");
            setAddQuantity(1);
        }
    };

    // Calculate Total Automatically
    const calculatedTotal = useMemo(() => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [orderItems]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSaving(true);
        setError(null);

        try {
            const sanitizedItems = orderItems.map(item => ({
                product_id: item.product_id || (item as any)._id,
                name: item.name || item.product_name,
                image: item.image || 'https://placehold.co/100', // Fallback for backend validation
                price: item.price,
                quantity: item.quantity,
                brand_name: item.brand_name
            }));

            await dispatch(updateOrder({
                id,
                data: {
                    status: formData.status,
                    customer_name: formData.customer_name,
                    shipping_address: formData.shipping_address,
                    shipping_phone: formData.shipping_phone,
                    // createdAt removed - not allowed in backend DTO
                    items: sanitizedItems,
                    total_amount: calculatedTotal // Using calculated total
                }
            })).unwrap();
            navigate('/orders');
        } catch (err: any) {
            setError(err?.message || "Failed to update order");
            setIsSaving(false);
        }
    };

    return (
        <div>
            <PageMeta title="Edit Order | Khana Fast" description="Edit order details" />
            <PageBreadcrumb pageTitle={`Edit Order #${id?.slice(-8)}`} />

            {(orderLoading && !selectedOrder) ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 flex justify-center min-h-[400px] items-center">
                    <DotLoading />
                </div>
            ) : (!selectedOrder && !orderLoading) ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center min-h-[200px] flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Order Not Found</h3>
                    <p className="text-gray-500 mb-4">The order you are looking for does not exist or has been removed.</p>
                    <button onClick={() => navigate('/orders')} className="text-brand-500 hover:text-brand-600 font-medium">
                        Back to Orders
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-6">

                    {/* Order Details Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="customer_name">Customer Name</Label>
                                <Input
                                    id="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter customer name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="shipping_phone">Phone Number</Label>
                                <Input
                                    id="shipping_phone"
                                    value={formData.shipping_phone}
                                    onChange={handleInputChange}
                                    placeholder="Phone number"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                    <Label htmlFor="address_select">Shipping Address</Label>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="text-xs text-brand-500 hover:text-brand-600 font-medium"
                                    >
                                        + Add New Address
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <select
                                        id="address_select"
                                        onChange={handleAddressSelect}
                                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white text-gray-900"
                                    >
                                        <option value="">Select an address to auto-fill...</option>
                                        {addresses.map(a => (
                                            <option key={a._id} value={a._id}>
                                                {a.type}: {a.address}, {a.city} {a.pincode}
                                            </option>
                                        ))}
                                    </select>
                                    <Input
                                        id="shipping_address"
                                        value={formData.shipping_address}
                                        onChange={handleInputChange}
                                        placeholder="Or type full address here"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="createdAt">Date (YYYY-MM-DD)</Label>
                                <Input
                                    id="createdAt"
                                    type="date"
                                    value={formData.createdAt}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white text-gray-900"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="hold">Hold</option>
                                    <option value="ready">Ready</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Order Items</h3>

                        {/* Add Product Controls */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-6">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Add New Product</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory(""); }}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <select
                                    value={selectedSubCategory}
                                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                >
                                    <option value="">All Sub-Categories</option>
                                    {subCategories
                                        .filter(s => !selectedCategory || s.category_id === selectedCategory || (s.category as any)?._id === selectedCategory)
                                        .map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                </select>
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                >
                                    <option value="">All Brands</option>
                                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={selectedProductToAdd}
                                    onChange={(e) => setSelectedProductToAdd(e.target.value)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white text-gray-900"
                                >
                                    <option value="">Select Product...</option>
                                    {filteredProducts.map(p => (
                                        <option key={p._id} value={p._id}>{p.name} - ₹{p.price} {p.brand ? `(${p.brand.name})` : ''}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    value={addQuantity}
                                    onChange={(e) => setAddQuantity(parseInt(e.target.value) || 1)}
                                    className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm bg-white dark:bg-gray-800 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddProduct}
                                    disabled={!selectedProductToAdd}
                                    className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 text-sm font-medium"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Price</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Qty</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Total</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {orderItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded object-cover border border-gray-100 dark:border-gray-700" />}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-800 dark:text-white">{item.name || item.product_name}</div>
                                                        {item.brand_name && <div className="text-xs text-gray-500">{item.brand_name}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">₹{item.price}</td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                                                    className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">₹{item.price * item.quantity}</td>
                                            <td className="px-4 py-3 text-right">
                                                <button type="button" onClick={() => handleRemoveItem(index)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orderItems.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No products added.</td></tr>}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300">Total Amount:</td>
                                        <td colSpan={2} className="px-4 py-3 text-lg font-bold text-brand-600 dark:text-brand-400">₹{calculatedTotal}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}

                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => navigate('/orders')}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || orderItems.length === 0}
                            className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 shadow-lg shadow-brand-500/20 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            <AddAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => {
                    setIsAddressModalOpen(false);
                    if (selectedOrder?.user?._id) {
                        dispatch(fetchAddresses({ filter: { user_id: selectedOrder.user._id } }));
                    }
                }}
                userId={selectedOrder?.user?._id}
            />
        </div>
    );
}
