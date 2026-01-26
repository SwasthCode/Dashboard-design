import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { updateOrder, fetchOrderById, Order, OrderItem } from "../../store/slices/orderSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import DotLoading from "../../components/common/DotLoading";

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { products } = useSelector((state: RootState) => state.product);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // State for adding new product
    const [selectedProductId, setSelectedProductId] = useState("");
    const [newProductQuantity, setNewProductQuantity] = useState(1);

    // Order Details State
    const [customerName, setCustomerName] = useState("");
    const [shippingAddress, setShippingAddress] = useState("");
    const [shippingPhone, setShippingPhone] = useState("");

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchProducts({}));
            // Fetch full order details when modal opens
            if (order?._id) {
                dispatch(fetchOrderById(order._id));
            }
        }
    }, [isOpen, dispatch, order?._id]);

    // Use selectedOrder from Redux state if available, otherwise use the passed order prop
    const { selectedOrder } = useSelector((state: RootState) => state.order);
    const currentOrder = selectedOrder || order;

    useEffect(() => {
        if (currentOrder) {
            setOrderItems(currentOrder.items || []);
            
            // Set Customer Name
            if (currentOrder.customer_name) {
                setCustomerName(currentOrder.customer_name);
            } else if (currentOrder.user) {
                setCustomerName(`${currentOrder.user.first_name} ${currentOrder.user.last_name}`);
            }

            // Set Shipping Address
            if (currentOrder.shipping_address) {
                setShippingAddress(currentOrder.shipping_address);
            } else if (currentOrder.address) {
                const addr = currentOrder.address;
                const parts = [
                    addr.address, 
                    addr.locality, 
                    addr.landmark, 
                    addr.city, 
                    addr.state, 
                    addr.pincode
                ].filter(Boolean);
                setShippingAddress(parts.join(', '));
                
                // Set Phone if available in address
                if (!currentOrder.shipping_phone && addr.shipping_phone) {
                   setShippingPhone(addr.shipping_phone);
                }
            }

             // Set Phone (Assuming it might be on order or address?? Schema said shipping_phone on order)
            if (currentOrder.shipping_phone) {
                setShippingPhone(currentOrder.shipping_phone);
            }
        }
    }, [currentOrder]);

    const handleQuantityChange = (index: number, quantity: number) => {
        const newItems = [...orderItems];
        newItems[index] = { ...newItems[index], quantity: Math.max(1, quantity) };
        setOrderItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = orderItems.filter((_, i) => i !== index);
        setOrderItems(newItems);
    };

    const handleAddProduct = () => {
        if (!selectedProductId) return;

        const product = products.find(p => p._id === selectedProductId);
        if (product) {
            // Check if product already exists in order
            const existingItemIndex = orderItems.findIndex(item => item.product_id === product._id);

            if (existingItemIndex >= 0) {
                // Update quantity if exists
                const newItems = [...orderItems];
                newItems[existingItemIndex].quantity += newProductQuantity;
                setOrderItems(newItems);
            } else {
                // Add new item
                const newItem: OrderItem = {
                    product_id: product._id!,
                    name: product.name,
                    product_name: product.name,
                    quantity: newProductQuantity,
                    price: product.price,
                    image: product.images?.[0]?.url || 'https://placehold.co/100',
                    brand_name: typeof product.brand_id === 'object' ? (product.brand_id as any).name : undefined // simplistic check
                };
                setOrderItems([...orderItems, newItem]);
            }
            setSelectedProductId("");
            setNewProductQuantity(1);
        }
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!currentOrder?._id) return;
        if (orderItems.length === 0) {
            setError("Order must have at least one product");
            return;
        }

        setLoading(true);
        try {
            // Transform items to match backend DTO - only send required fields
            const sanitizedItems = orderItems.map(item => ({
                product_id: item.product_id || (item as any)._id,
                name: item.name || item.product_name,
                image: item.image || 'https://placehold.co/100',
                price: item.price,
                quantity: item.quantity,
                brand_name: item.brand_name
            }));

            await dispatch(updateOrder({
                id: currentOrder._id,
                data: {
                    items: sanitizedItems,
                    total_amount: calculateTotal(),
                    customer_name: customerName,
                    shipping_address: shippingAddress,
                    shipping_phone: shippingPhone
                }
            })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update order");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4 bg-black/10 ">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 rounded-t-2xl">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Edit Order Products</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-medium border border-red-100 dark:border-red-900/30">
                            {error}
                        </div>
                    )}

                    {/* Customer & Shipping Details */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">Customer & Shipping Details</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white"
                                    placeholder="Customer Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    value={shippingPhone}
                                    onChange={(e) => setShippingPhone(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white"
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Shipping Address</label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white min-h-[60px]"
                                    placeholder="Full Shipping Address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Add Product Section */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Add Product to Order</h4>
                        <div className="flex gap-2 flex-col sm:flex-row">
                            <div className="flex-1">
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => setSelectedProductId(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white"
                                >
                                    <option value="">Select a product...</option>
                                    {products.map(p => (
                                        <option key={p._id} value={p._id}>
                                            {p.name} - ₹{p.price}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <input
                                    type="number"
                                    min="1"
                                    value={newProductQuantity}
                                    onChange={(e) => setNewProductQuantity(parseInt(e.target.value) || 1)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none text-sm dark:text-white"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleAddProduct}
                                disabled={!selectedProductId}
                                className="px-4 py-2 bg-brand-500 text-white text-sm font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Order Items List */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Order Items</h4>
                        <div className="border rounded-xl overflow-hidden border-gray-200 dark:border-gray-700">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                    <tr>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Product</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">Price</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">Qty</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-24">Total</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {orderItems.map((item, index) => (
                                        <tr key={index} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <img src={item.image} alt="" className="w-8 h-8 rounded object-cover bg-gray-100" />
                                                    )}
                                                    <span className="text-sm font-medium text-gray-800 dark:text-white line-clamp-1">
                                                        {item.name || item.product_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                                ₹{item.price}
                                            </td>
                                            <td className="px-4 py-3">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                                                    className="w-16 px-2 py-1 text-sm border rounded hover:border-brand-500 focus:border-brand-500 outline-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white">
                                                ₹{item.price * item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {orderItems.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                                                No products in order
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Grand Total:
                                        </td>
                                        <td colSpan={2} className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">
                                            ₹{calculateTotal().toLocaleString()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || orderItems.length === 0}
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <DotLoading size="md" className="text-white" />
                                <span>Updating...</span>
                            </>
                        ) : "Update Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}
