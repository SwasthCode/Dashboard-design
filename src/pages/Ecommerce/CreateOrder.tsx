import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { AppDispatch, RootState } from "../../store";
import { fetchUsers, User, fetchUserById, fetchRoles } from "../../store/slices/userSlice";
import { fetchProductsSelect } from "../../store/slices/productSlice";
import { createOrder } from "../../store/slices/orderSlice";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import DotLoading from "../../components/common/DotLoading";
import { PAYMENT_METHODS } from "../../constants/constants";
import AddAddressModal from "./AddAddressModal";

interface NewOrderItem {
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
    stock: number;
}

export default function CreateOrder() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Redux State
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.user);
    const { products, loading: productsLoading } = useSelector((state: RootState) => state.product);
    const { loading: orderCreating } = useSelector((state: RootState) => state.order);

    // Local State
    const [selectedUserId, setSelectedUserId] = useState("");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [items, setItems] = useState<NewOrderItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState("cod");

    // Product Selection State
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);

    // Picker, Packer and Remark State
    const [pickers, setPickers] = useState<User[]>([]);
    const [packers, setPackers] = useState<User[]>([]);
    const [selectedPickerId, setSelectedPickerId] = useState("");
    const [selectedPackerId, setSelectedPackerId] = useState("");
    const [remark, setRemark] = useState("");
    const [pickerRemark, setPickerRemark] = useState("");
    const [packerRemark, setPackerRemark] = useState("");
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Initial Data Fetch
    useEffect(() => {
        dispatch(fetchRoles({})).unwrap().then((roles) => {
            const customerRole = roles.find((r: any) => r.name.toLowerCase() === 'customer');
            const pickerRole = roles.find((r: any) => r.name.toLowerCase() === 'picker');
            const packerRole = roles.find((r: any) => r.name.toLowerCase() === 'packer');

            if (customerRole) {
                dispatch(fetchUsers({
                    page: 1,
                    limit: 100,
                    filter: { 'role.role_id': customerRole.role_id }
                }));
            } else {
                dispatch(fetchUsers({ page: 1, limit: 100 }));
            }

            if (pickerRole) {
                dispatch(fetchUsers({ filter: { 'role.role_id': pickerRole.role_id }, limit: 1000 }))
                    .unwrap().then(res => setPickers(res));
            }
            if (packerRole) {
                dispatch(fetchUsers({ filter: { 'role.role_id': packerRole.role_id }, limit: 1000 }))
                    .unwrap().then(res => setPackers(res));
            }
        });
        dispatch(fetchProductsSelect({}));
    }, [dispatch]);

    // Handle User Selection
    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        const user = users.find(u => (u.id || u._id) === userId) || null;
        setSelectedUser(user);
        setSelectedAddressId(""); // Reset address

        // If needed, fetch full user details including addresses if not present in list
        if (userId) {
            dispatch(fetchUserById(userId)).unwrap().then((fetchedUser: User) => {
                setSelectedUser(fetchedUser);
                // Auto-select default address if available
                const defaultAddr = fetchedUser.addresses?.find((a: any) => a.isDefault);
                if (defaultAddr && defaultAddr._id) setSelectedAddressId(defaultAddr._id);
            });
        }
    };

    // Handle Adding Product
    const handleAddProduct = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p._id === selectedProductId);
        if (!product) return;

        if (items.some(item => item.product_id === product._id)) {
            alert("Product already added. Update quantity in the table.");
            return;
        }

        if (product.stock < quantity) {
            alert(`Insufficient stock. Only ${product.stock} available.`);
            return;
        }

        const newItem: NewOrderItem = {
            product_id: product._id!,
            product_name: product.name,
            quantity: quantity,
            price: product.price,
            total: product.price * quantity,
            stock: product.stock
        };

        setItems([...items, newItem]);
        setSelectedProductId("");
        setQuantity(1);
    };

    // Handle Quantity Update
    const updateItemQuantity = (index: number, newQty: number) => {
        if (newQty < 1) return;

        const updatedItems = [...items];
        const item = updatedItems[index];

        if (newQty > item.stock) {
            alert(`Cannot exceed available stock of ${item.stock}`);
            return;
        }

        item.quantity = newQty;
        item.total = item.price * newQty;
        setItems(updatedItems);
    };

    // Handle Item Removal
    const removeitem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    // Calculate Totals
    const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
    const totalAmount = subtotal; // Add tax/shipping logic here if needed

    // Submit Order
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId) {
            alert("Please select a customer");
            return;
        }
        if (items.length === 0) {
            alert("Please add at least one product");
            return;
        }

        // Determine payment method string and order status
        const isOnline = paymentMethod === "online";
        const paymentLabel = isOnline ? "online" : "cod";
        // const orderStatus = isOnline ? "pending" : "confirmed";

        // Construct Payload
        const payload = {
            user_id: selectedUserId,
            address_id: selectedAddressId || undefined,
            items: items.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            })),
            total_amount: totalAmount,
            picker_obj: {
                id: selectedPickerId,
                remark: pickerRemark
            },
            packer_obj: {
                id: selectedPackerId,
                remark: packerRemark
            },
            payment: {
                method: paymentLabel,
                // status: "pending",
                // transaction_id: null,
                // gateway: isOnline ? "razorpay" : null,
                // currency: "INR",
                // payable_amount: totalAmount,
                // paid_amount: 0,
                // payment_time: null,

            },
            // order_status: orderStatus,
            order_remark: remark || ''
        };

        if (!selectedAddressId && selectedUser?.addresses?.length) {
            const confirm = window.confirm("No address selected. Proceed without explicit address?");
            if (!confirm) return;
        }


        try {
            await dispatch(createOrder(payload)).unwrap();
            navigate("/orders");
        } catch (error) {
            console.error("Failed to create order:", error);
            alert("Failed to create order. Please try again.");
        }
    };

    return (
        <div>
            <PageMeta
                title="Create Order | Khana Fast"
                description="Create a new order manually"
            />
            <PageBreadcrumb pageTitle="Create Order" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">New Order Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Customer Selection Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="customer">Select Customer</Label>
                            <select
                                id="customer"
                                value={selectedUserId}
                                onChange={handleUserChange}
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                                required
                            >
                                <option value="">Select a customer...</option>
                                {users.map(user => (
                                    <option key={user.id || user._id} value={user.id || user._id}>
                                        {user.first_name} {user.last_name} ({user.phone_number})
                                    </option>
                                ))}
                            </select>
                            {usersLoading && <p className="text-xs text-gray-400 mt-1">Loading customers...</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label htmlFor="address" className="mb-0">Delivery Address</Label>
                                {selectedUserId && (
                                    <button
                                        type="button"
                                        onClick={() => setIsAddressModalOpen(true)}
                                        className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add New
                                    </button>
                                )}
                            </div>
                            <select
                                id="address"
                                value={selectedAddressId}
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!selectedUserId}
                            // required={!!selectedUser?.addresses?.length} // Required if addresses exist
                            >
                                <option value="">Select delivery address...</option>
                                {selectedUser?.addresses?.map((addr: any) => (
                                    <option key={addr._id} value={addr._id}>
                                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                                    </option>
                                ))}
                            </select>
                            {!selectedUserId && <p className="text-xs text-gray-400 mt-1">Select a customer first</p>}
                            {selectedUserId && (!selectedUser?.addresses || selectedUser.addresses.length === 0) && (
                                <p className="text-xs text-amber-500 mt-1">Customer has no saved addresses.</p>
                            )}
                        </div>
                    </div>

                    {/* Product Selection Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Add Products</h3>
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="flex-1 w-full">
                                <Label htmlFor="product">Select Product</Label>
                                <select
                                    id="product"
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-600 dark:text-white dark:bg-gray-800"
                                >
                                    <option value="">Choose a product...</option>
                                    {products.map(product => (
                                        <option key={product._id} value={product._id} disabled={!product.isAvailable || product.stock <= 0}>
                                            {product.name} (₹{product.price}) {product.stock <= 0 ? '- Out of Stock' : `- Stock: ${product.stock}`}
                                        </option>
                                    ))}
                                </select>
                                {productsLoading && <p className="text-xs text-gray-400 mt-1">Loading products...</p>}
                            </div>
                            <div className="w-full md:w-32">
                                <Label htmlFor="quantity">Quantity</Label>
                                <input
                                    type="number"
                                    id="quantity"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-600 dark:text-white dark:bg-gray-800"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                disabled={!selectedProductId}
                                className="h-11 px-6 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Order Items Table */}
                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase w-10">S.No</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center">Stock</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Price</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center w-24">Qty</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-center w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                                            No products added yet.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                                                {item.product_name}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500 text-center">
                                                {item.stock}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-right">
                                                ₹{item.price}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={item.stock}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-center focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-white text-right">
                                                ₹{item.total}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeitem(index)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Remove Item"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <tr>
                                    <td colSpan={5} className="px-4 py-3 text-right text-sm font-bold text-gray-600 dark:text-gray-300">
                                        Subtotal:
                                    </td>
                                    <td className="px-4 py-3 text-right text-lg font-bold text-brand-600 dark:text-white">
                                        ₹{subtotal}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Extra Details: Picker, Packer, and Remarks */}
                    <div className="space-y-6">
                        {/* Payment Method */}
                        <div className="max-w-xs">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <select
                                id="paymentMethod"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                            >
                                {PAYMENT_METHODS.map((method) => (
                                    <option key={method.value} value={method.value}>
                                        {method.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Picker Section */}
                            <div className="space-y-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">Picker Assignment</h4>
                                </div>

                                <div>
                                    <Label htmlFor="picker">Select Picker</Label>
                                    <select
                                        id="picker"
                                        value={selectedPickerId}
                                        onChange={(e) => setSelectedPickerId(e.target.value)}
                                        className="w-full h-11 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {pickers.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.first_name} {p.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPickerId && (
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-1">
                                        {(() => {
                                            const p = pickers.find(x => x._id === selectedPickerId);
                                            return p ? (
                                                <>
                                                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{p.first_name} {p.last_name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        {p.email}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {p.phone_number}
                                                    </p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                {selectedPickerId && (
                                    <div>
                                        <Label htmlFor="pickerRemark">Picker Remark</Label>
                                        <textarea
                                            id="pickerRemark"
                                            rows={2}
                                            value={pickerRemark}
                                            onChange={(e) => setPickerRemark(e.target.value)}
                                            placeholder="Specific instructions for the picker..."
                                            className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all"
                                        ></textarea>
                                    </div>
                                )}
                            </div>

                            {/* Packer Section */}
                            <div className="space-y-4 p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">Packer Assignment</h4>
                                </div>

                                <div>
                                    <Label htmlFor="packer">Select Packer</Label>
                                    <select
                                        id="packer"
                                        value={selectedPackerId}
                                        onChange={(e) => setSelectedPackerId(e.target.value)}
                                        className="w-full h-11 rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {packers.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.first_name} {p.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPackerId && (
                                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 space-y-1">
                                        {(() => {
                                            const p = packers.find(x => x._id === selectedPackerId);
                                            return p ? (
                                                <>
                                                    <p className="text-xs font-semibold text-gray-800 dark:text-white">{p.first_name} {p.last_name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                                        {p.email}
                                                    </p>
                                                    <p className="text-[10px] text-gray-500 uppercase flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                        {p.phone_number}
                                                    </p>
                                                </>
                                            ) : null;
                                        })()}
                                    </div>
                                )}

                                {selectedPackerId && (
                                    <div>
                                        <Label htmlFor="packerRemark">Packer Remark</Label>
                                        <textarea
                                            id="packerRemark"
                                            rows={2}
                                            value={packerRemark}
                                            onChange={(e) => setPackerRemark(e.target.value)}
                                            placeholder="Specific instructions for the packer..."
                                            className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-900 px-4 py-2 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all"
                                        ></textarea>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Overall Order Remark */}
                        <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <Label htmlFor="remark" className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                                Overall Order Remark (Internal)
                            </Label>
                            <textarea
                                id="remark"
                                rows={3}
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Add general internal notes for this order..."
                                className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900 transition-all"
                            ></textarea>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => navigate("/orders")}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={orderCreating || items.length === 0}
                            className="px-6 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all"
                        >
                            {orderCreating ? (
                                <>
                                    <DotLoading size="sm" className="text-white" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                "Create Order"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <AddAddressModal
                isOpen={isAddressModalOpen}
                onClose={() => {
                    setIsAddressModalOpen(false);
                    if (selectedUserId) {
                        dispatch(fetchUserById(selectedUserId)).unwrap().then((fetchedUser: User) => {
                            setSelectedUser(fetchedUser);
                        });
                    }
                }}
                userId={selectedUserId}
            />
        </div>
    );
}
