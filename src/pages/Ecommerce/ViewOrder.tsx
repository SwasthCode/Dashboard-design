import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOrderById } from "../../store/slices/orderSlice";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DotLoading from "../../components/common/DotLoading";
import Label from "../../components/form/Label";
import { updateOrderStatus, OrderStatus } from "../../store/slices/orderSlice";
import { createInvoice } from "../../store/slices/invoiceSlice";

export default function ViewOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const { selectedOrder, loading: orderLoading, updating } = useSelector((state: RootState) => state.order);

    // Initial Fetch
    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
    }, [dispatch, id]);

    // Calculate Total Automatically
    const calculatedTotal = useMemo(() => {
        return selectedOrder?.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    }, [selectedOrder]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-orange-100 text-orange-600";
            case "hold": return "bg-gray-100 text-gray-600";
            case "ready": return "bg-blue-100 text-blue-600";
            case "shipped": return "bg-purple-100 text-purple-600";
            case "delivered": return "bg-green-100 text-green-600";
            case "cancelled": return "bg-red-100 text-red-600";
            case "returned": return "bg-gray-100 text-gray-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const handleStatusChange = (newStatus: string) => {
        if (!id) return;
        dispatch(updateOrderStatus({ id, status: newStatus as OrderStatus }));
    };

    const handlePrintInvoice = async () => {
        if (!selectedOrder) return;
        try {
            dispatch(createInvoice({ order_id: selectedOrder._id }));
        } catch (error) {
            console.error("Background invoice creation failed", error);
        }
        printOrderData(selectedOrder);
    };

    const printOrderData = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Customer';
        const address = order.shipping_address || (order.address ? `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}` : 'Not available');
        const phone = order.shipping_phone || (order.address?.shipping_phone) || 'Not available';
        const invoiceId = order._id.slice(-8).toUpperCase();

        const itemsHtml = order.items?.map((item: any) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; font-size: 14px; color: #1f2937;">${item.name || item.product_name}</td>
                <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #1f2937;">${item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1f2937;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${invoiceId} | Khana Fast</title>
                    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Outfit', sans-serif; margin: 0; padding: 40px; color: #111827; }
                        .container { max-width: 800px; margin: 0 auto; }
                        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
                        .brand { display: flex; flex-direction: column; }
                        .logo-text { font-size: 28px; font-weight: 800; color: #f97316; letter-spacing: -0.5px; }
                        .logo-subtext { font-size: 12px; color: #059669; font-weight: 600; text-transform: uppercase; margin-top: -4px; }
                        .invoice-label { font-size: 40px; font-weight: 200; color: #9ca3af; text-align: right; }
                        .info-section { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 1px solid #f3f4f6; }
                        .section-title { font-size: 12px; font-weight: 700; color: #9ca3af; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.1em; }
                        .text-bold { font-weight: 600; color: #111827; margin-bottom: 4px; }
                        .text-small { font-size: 14px; color: #6b7280; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding-bottom: 12px; border-bottom: 2px solid #111827; font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; }
                        .footer { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; }
                        .notes-section { font-size: 13px; color: #9ca3af; }
                        .totals-grid { display: flex; flex-direction: column; gap: 12px; }
                        .total-row { display: flex; justify-content: space-between; font-size: 14px; }
                        .grand-total { border-top: 1px solid #f3f4f6; padding-top: 12px; margin-top: 4px; font-size: 20px; font-weight: 700; color: #111827; }
                        @media print { body { padding: 20px; } .container { width: 100%; } -webkit-print-color-adjust: exact; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="brand">
                                <div class="logo-text">KHANA FAST</div>
                                <div class="logo-subtext">Quick • Fresh • Reliable</div>
                            </div>
                            <div class="invoice-label">INVOICE</div>
                        </div>
                        <div class="info-section">
                            <div>
                                <div class="section-title">Billed To</div>
                                <div class="text-bold">${customerName}</div>
                                <div class="text-small">${address}</div>
                                <div class="text-small">Phone: ${phone}</div>
                            </div>
                            <div>
                                <div class="section-title">Invoice Details</div>
                                <div class="text-small"><span class="text-bold">Invoice #:</span> ${invoiceId}</div>
                                <div class="text-small"><span class="text-bold">Date:</span> ${date}</div>
                                <div class="text-small"><span class="text-bold">Status:</span> ${order.status.toUpperCase()}</div>
                            </div>
                        </div>
                        <table><thead><tr><th>Service/Product</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Rate</th><th style="text-align: right;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
                        <div class="footer">
                            <div class="notes-section">
                                <div class="section-title">Important Note</div>
                                <p>Thank you for choosing Khana Fast. If you have any questions about this invoice, please reach out to our support team.</p>
                                <p style="margin-top: 20px;">© 2026 Khana Fast. All rights reserved.</p>
                            </div>
                            <div class="totals-grid">
                                <div class="total-row"><div style="color: #9ca3af;">Subtotal</div><div class="text-bold">₹${order.total_amount.toLocaleString()}</div></div>
                                <div class="total-row grand-total"><div>Total</div><div>₹${order.total_amount.toLocaleString()}</div></div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const renderActionButtons = () => {
        if (!selectedOrder) return null;
        const status = selectedOrder.status.toLowerCase();
        let buttons = [];

        switch (status) {
            case "pending":
                buttons.push(
                    <button key="accept" disabled={updating} onClick={() => handleStatusChange("ready")} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-bold text-sm transition-all disabled:opacity-50">ACCEPT ORDER</button>,
                    <button key="hold" disabled={updating} onClick={() => handleStatusChange("hold")} className="px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 font-bold text-sm transition-all disabled:opacity-50">HOLD</button>,
                    <button key="cancel" disabled={updating} onClick={() => handleStatusChange("cancelled")} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-all disabled:opacity-50">CANCEL</button>
                );
                break;
            case "hold":
                buttons.push(
                    <button key="accept" disabled={updating} onClick={() => handleStatusChange("ready")} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 font-bold text-sm transition-all disabled:opacity-50">ACCEPT ORDER</button>,
                    <button key="cancel" disabled={updating} onClick={() => handleStatusChange("cancelled")} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-all disabled:opacity-50">CANCEL</button>
                );
                break;
            case "ready":
                buttons.push(
                    <button key="ship" disabled={updating} onClick={() => handleStatusChange("shipped")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-sm transition-all disabled:opacity-50">SHIP ORDER</button>,
                    <button key="cancel" disabled={updating} onClick={() => handleStatusChange("cancelled")} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-all disabled:opacity-50">CANCEL</button>
                );
                break;
            case "shipped":
                buttons.push(
                    <button key="deliver" disabled={updating} onClick={() => handleStatusChange("delivered")} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm transition-all disabled:opacity-50">MARK DELIVERED</button>
                );
                break;
            case "delivered":
                buttons.push(
                    <button key="return" disabled={updating} onClick={() => handleStatusChange("returned")} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 font-bold text-sm transition-all disabled:opacity-50">MARK RETURNED</button>
                );
                break;
        }

        const canPrintInvoice = ['pending', 'ready', 'ship', 'shipped', 'delivered'].includes(status);
        if (canPrintInvoice) {
            buttons.push(
                <button key="invoice" onClick={handlePrintInvoice} className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 font-bold text-sm transition-all flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    PRINT INVOICE
                </button>
            );
        }

        return buttons;
    };

    return (
        <div>
            <PageMeta title="View Order | Khana Fast" description="View order details" />
            <PageBreadcrumb pageTitle={`Order Details #${id?.slice(-8).toUpperCase()}`} />

            {(orderLoading && !selectedOrder) ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 flex justify-center min-h-[400px] items-center">
                    <DotLoading />
                </div>
            ) : !selectedOrder ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-10 text-center min-h-[200px] flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Order Not Found</h3>
                    <p className="text-gray-500 mb-4">The order you are looking for does not exist or has been removed.</p>
                    <button onClick={() => navigate('/orders')} className="text-brand-500 hover:text-brand-600 font-medium">
                        Back to Orders
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
                                <p className="text-sm text-gray-500">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-3 py-1 text-sm font-bold uppercase rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                {selectedOrder.status}
                            </span>
                            <span className={`px-3 py-1 text-sm font-bold uppercase rounded-full border ${selectedOrder.payment_status?.toLowerCase() === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                {selectedOrder.payment_status || 'Pending'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                            {renderActionButtons()}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Customer & Shipping Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Name</Label>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.customer_name || (selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : "N/A")}</p>
                                    </div>
                                    <div>
                                        <Label>Phone Number</Label>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{selectedOrder.shipping_phone || (selectedOrder.address ? selectedOrder.address.shipping_phone : "N/A")}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>Shipping Address</Label>
                                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                                            {selectedOrder.shipping_address || (selectedOrder.address ? `${selectedOrder.address.address}, ${selectedOrder.address.locality || ''}, ${selectedOrder.address.city}, ${selectedOrder.address.state}, ${selectedOrder.address.pincode}` : "N/A")}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3" /></svg>
                                        Order Items
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 dark:bg-gray-800">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Price</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Qty</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {selectedOrder.items?.map((item: any, index: number) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" />}
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-800 dark:text-white uppercase">{item.name || item.product_name}</div>
                                                                {item.brand_name && <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{item.brand_name}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">₹{item.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-800 dark:text-white font-medium">x{item.quantity}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800 dark:text-white font-bold">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Summary Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                                <h3 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Order Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal ({selectedOrder.items?.length} items)</span>
                                        <span className="text-gray-800 dark:text-white font-bold">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Shipping Fee</span>
                                        <span className="text-green-600 font-bold">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Tax</span>
                                        <span className="text-gray-800 dark:text-white font-bold">₹0</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                        <span className="text-base font-bold text-gray-800 dark:text-white uppercase">Total Amount</span>
                                        <span className="text-xl font-bold text-brand-600 dark:text-brand-400 tracking-tight">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-gray-400">Order Logs</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">Assigned Packer</p>
                                            <p className="text-xs text-gray-500">
                                                {typeof selectedOrder.packer_id === 'object' && selectedOrder.packer_id
                                                    ? `${selectedOrder.packer_id.first_name} ${selectedOrder.packer_id.last_name}`
                                                    : 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1.5 w-2 h-2 rounded-full bg-blue-500"></div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 dark:text-white">Assigned Picker</p>
                                            <p className="text-xs text-gray-500">
                                                {typeof selectedOrder.picker_id === 'object' && selectedOrder.picker_id
                                                    ? `${selectedOrder.picker_id.first_name} ${selectedOrder.picker_id.last_name}`
                                                    : 'Not assigned'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8">
                                    <button
                                        onClick={() => navigate('/orders')}
                                        className="w-full py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 font-bold text-sm uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                    >
                                        Back to Orders
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
