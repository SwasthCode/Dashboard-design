import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOrderById, updateOrder } from "../../store/slices/orderSlice";
import { fetchUsers, fetchRoles, User } from "../../store/slices/userSlice";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DotLoading from "../../components/common/DotLoading";
import Label from "../../components/form/Label";
import { updateOrderStatus, OrderStatus } from "../../store/slices/orderSlice";
import { createInvoice } from "../../store/slices/invoiceSlice";
import { getStatusColor } from "../../utils/helper";

export default function ViewOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const { selectedOrder, loading: orderLoading, updating } = useSelector((state: RootState) => state.order);

    // Picker, Packer and Assignment State
    const [pickers, setPickers] = useState<User[]>([]);
    const [packers, setPackers] = useState<User[]>([]);
    const [selectedPickerId, setSelectedPickerId] = useState("");
    const [selectedPackerId, setSelectedPackerId] = useState("");
    const [pickerRemark, setPickerRemark] = useState("");
    const [packerRemark, setPackerRemark] = useState("");

    // Initial Fetch (Order)
    useEffect(() => {
        if (id) {
            dispatch(fetchOrderById(id));
        }
    }, [dispatch, id]);

    // Fetch Roles and Users (Pickers/Packers)
    useEffect(() => {
        dispatch(fetchRoles({})).unwrap().then((roles) => {
            const pickerRole = roles.find((r: any) => r.name.toLowerCase() === 'picker');
            const packerRole = roles.find((r: any) => r.name.toLowerCase() === 'packer');

            if (pickerRole) {
                dispatch(fetchUsers({ filter: { 'role.role_id': pickerRole.role_id }, limit: 1000 }))
                    .unwrap().then(res => setPickers(res));
            }
            if (packerRole) {
                dispatch(fetchUsers({ filter: { 'role.role_id': packerRole.role_id }, limit: 1000 }))
                    .unwrap().then(res => setPackers(res));
            }
        });
    }, [dispatch]);

    // Initialize selections from order
    useEffect(() => {
        if (selectedOrder) {
            setSelectedPickerId(selectedOrder.picker_obj?.user_id || "");
            setPickerRemark(selectedOrder.picker_obj?.remark_msg || "");
            setSelectedPackerId(selectedOrder.packer_obj?.user_id || "");
            setPackerRemark(selectedOrder.packer_obj?.remark_msg || "");
        }
    }, [selectedOrder]);

    const isAssignmentDirty = useMemo(() => {
        if (!selectedOrder) return false;
        return selectedPickerId !== (selectedOrder.picker_obj?.user_id || "") ||
            pickerRemark !== (selectedOrder.picker_obj?.remark_msg || "") ||
            selectedPackerId !== (selectedOrder.packer_obj?.user_id || "") ||
            packerRemark !== (selectedOrder.packer_obj?.remark_msg || "");
    }, [selectedOrder, selectedPickerId, pickerRemark, selectedPackerId, packerRemark]);

    const EDIT_ENABLED_STATUSES = ["pending", "hold", "cancelled"];
    const canEditAssignments = selectedOrder ? EDIT_ENABLED_STATUSES.includes(selectedOrder.status.toLowerCase()) : false;

    // Calculate Total Automatically
    const calculatedTotal = useMemo(() => {
        return selectedOrder?.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    }, [selectedOrder]);


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

    const handleSaveAssignments = async () => {
        if (!id) return;
        try {
            await dispatch(updateOrder({
                id,
                data: {
                    picker_obj: {
                        id: selectedPickerId,
                        remark: pickerRemark
                    },
                    packer_obj: {
                        id: selectedPackerId,
                        remark: packerRemark
                    }
                }
            })).unwrap();
            dispatch(fetchOrderById(id)); // Refresh data
        } catch (error) {
            console.error("Failed to save assignments:", error);
        }
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

    console.log('selectedOrder=============>', selectedOrder);

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
                <div className="space-y-6 pb-10">
                    {/* Top Header Card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 11-8 0 4 4 0 018 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">#{selectedOrder.order_id}</h2>
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {isAssignmentDirty && (
                                    <button
                                        onClick={handleSaveAssignments}
                                        disabled={updating}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                                    >
                                        {updating ? <DotLoading size="sm" className="text-white" /> : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                SAVE ASSIGNMENTS
                                            </>
                                        )}
                                    </button>
                                )}
                                {renderActionButtons()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Assignment Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Picker Information */}
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm group transition-all hover:border-brand-200 dark:hover:border-brand-900/30">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            Picker Info
                                        </h3>
                                        {selectedOrder.picker_obj?.status && (
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${selectedOrder.picker_obj.status === 'assigned' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {selectedOrder.picker_obj.status}
                                            </span>
                                        )}
                                    </div>
                                    {canEditAssignments ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="picker" className="text-[10px] mb-1">Select Picker</Label>
                                                <select
                                                    id="picker"
                                                    value={selectedPickerId}
                                                    onChange={(e) => setSelectedPickerId(e.target.value)}
                                                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {pickers.map((p) => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.first_name} {p.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label htmlFor="pickerRemark" className="text-[10px] mb-1">Picker Remark</Label>
                                                <textarea
                                                    id="pickerRemark"
                                                    rows={2}
                                                    value={pickerRemark}
                                                    onChange={(e) => setPickerRemark(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all"
                                                    placeholder="Add instructions..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    ) : selectedOrder.picker_obj ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 border border-gray-100 uppercase">
                                                    {selectedOrder.picker_obj.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.picker_obj.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{selectedOrder.picker_obj.phone}</p>
                                                </div>
                                            </div>
                                            {selectedOrder.picker_obj.remark_msg && (
                                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Picker Remark</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed">
                                                        "{selectedOrder.picker_obj.remark_msg}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center">
                                            <p className="text-sm text-gray-400 italic">No picker assigned yet</p>
                                        </div>
                                    )}
                                </div>

                                {/* Packer Information */}
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm group transition-all hover:border-brand-200 dark:hover:border-brand-900/30">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                            Packer Info
                                        </h3>
                                        {selectedOrder.packer_obj?.status && (
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${selectedOrder.packer_obj.status === 'assigned' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                                {selectedOrder.packer_obj.status}
                                            </span>
                                        )}
                                    </div>
                                    {canEditAssignments ? (
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="packer" className="text-[10px] mb-1">Select Packer</Label>
                                                <select
                                                    id="packer"
                                                    value={selectedPackerId}
                                                    onChange={(e) => setSelectedPackerId(e.target.value)}
                                                    className="w-full h-10 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                                                >
                                                    <option value="">Unassigned</option>
                                                    {packers.map((p) => (
                                                        <option key={p._id} value={p._id}>
                                                            {p.first_name} {p.last_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <Label htmlFor="packerRemark" className="text-[10px] mb-1">Packer Remark</Label>
                                                <textarea
                                                    id="packerRemark"
                                                    rows={2}
                                                    value={packerRemark}
                                                    onChange={(e) => setPackerRemark(e.target.value)}
                                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all"
                                                    placeholder="Add instructions..."
                                                ></textarea>
                                            </div>
                                        </div>
                                    ) : selectedOrder.packer_obj ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-bold text-gray-400 border border-gray-100 uppercase">
                                                    {selectedOrder.packer_obj.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.packer_obj.name}</p>
                                                    <p className="text-xs text-gray-500 font-medium">{selectedOrder.packer_obj.phone}</p>
                                                </div>
                                            </div>
                                            {selectedOrder.packer_obj.remark_msg && (
                                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Packer Remark</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic font-medium leading-relaxed">
                                                        "{selectedOrder.packer_obj.remark_msg}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-6 text-center">
                                            <p className="text-sm text-gray-400 italic">No packer assigned yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Detailed Card */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21a9.003 9.003 0 008.367-5.657l-2.51-3.213L9.367 15.343l-3 3z" /></svg>
                                        Payment Information
                                    </h3>
                                    <span className={`px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-full border shadow-xs ${selectedOrder.payment_details?.status === 'paid' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {selectedOrder.payment_details?.status || 'Pending'}
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Method</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.payment_details?.method || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gateway</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase">{selectedOrder.payment_details?.gateway || 'N/A'}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{selectedOrder.payment_details?.transaction_id || '---'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payable</p>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">₹{selectedOrder.payment_details?.payable_amount?.toLocaleString() || selectedOrder.total_amount.toLocaleString()}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</p>
                                            <p className="text-sm font-black text-green-600">₹{selectedOrder.payment_details?.paid_amount?.toLocaleString() || 0}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Time</p>
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {selectedOrder.payment_details?.payment_time ? new Date(selectedOrder.payment_details.payment_time).toLocaleString() : '---'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Table */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3" /></svg>
                                        Order Items
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rate</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {selectedOrder.items?.map((item: any, index: number) => (
                                                <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-6 py-5 whitespace-nowrap">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shadow-xs">
                                                                {item.images?.[0]?.url || item.image ? (
                                                                    <img src={item.images?.[0]?.url || item.image} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.name || item.product_name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.brand?.name || item.brand_name || 'Generic'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-center font-bold text-gray-600 dark:text-gray-400 tracking-tight">₹{item.price.toLocaleString()}</td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-center">
                                                        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white font-black text-xs">x{item.quantity}</span>
                                                    </td>
                                                    <td className="px-6 py-5 whitespace-nowrap text-sm text-right font-black text-gray-900 dark:text-white tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Summary Card */}
                            <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-500"></div>
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 pb-4 border-b border-white/5">Order Summary</h3>
                                <div className="space-y-5">
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                                        <span className="text-sm font-black text-white">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery</span>
                                            <span className="text-[10px] text-green-500/80 font-bold uppercase">Standard Shipping</span>
                                        </div>
                                        <span className="text-sm font-black text-green-500 uppercase">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-base font-black text-white uppercase tracking-widest">Total</span>
                                        <span className="text-3xl font-black text-brand-500 tracking-tighter">₹{calculatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Information Card */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Customer Details
                                </h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white uppercase truncate">{selectedOrder.customer_name || (selectedOrder.user ? `${selectedOrder.user.first_name} ${selectedOrder.user.last_name}` : "N/A")}</p>
                                            <p className="text-xs text-gray-500 font-medium truncate">{selectedOrder.user?.email || 'No email provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Shipping Address</p>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-relaxed line-clamp-3">
                                                {selectedOrder.shipping_address || (selectedOrder.address ? `${selectedOrder.address.address}, ${selectedOrder.address.locality || ''}, ${selectedOrder.address.city}, ${selectedOrder.address.state}, ${selectedOrder.address.pincode}` : "N/A")}
                                            </p>
                                            <p className="text-xs text-brand-600 font-bold mt-2 flex items-center gap-1 uppercase tracking-tighter">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                {selectedOrder.shipping_phone || (selectedOrder.address ? selectedOrder.address.shipping_phone : "N/A")}
                                            </p>
                                        </div>
                                    </div>
                                    {selectedOrder.order_remark && (
                                        <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/20">
                                            <div className="flex items-center gap-2 mb-2">
                                                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Internal Note</p>
                                            </div>
                                            <p className="text-xs text-amber-900/70 dark:text-amber-400 font-medium leading-relaxed italic">
                                                "{selectedOrder.order_remark}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full py-4 border border-gray-200 dark:border-gray-800 rounded-2xl text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-xs group"
                            >
                                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Return to List
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
