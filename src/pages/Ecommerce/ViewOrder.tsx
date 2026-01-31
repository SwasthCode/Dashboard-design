import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchOrderById, updateOrder } from "../../store/slices/orderSlice";
import { fetchUsers, fetchRoles, User } from "../../store/slices/userSlice";
import { fetchProductsSelect } from "../../store/slices/productSlice";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import DotLoading from "../../components/common/DotLoading";
import Label from "../../components/form/Label";
import { updateOrderStatus, OrderStatus } from "../../store/slices/orderSlice";
import { createInvoice } from "../../store/slices/invoiceSlice";
import { getStatusColor } from "../../utils/helper";
import { ADJUSTMENT_STATUSES, DELIVERY_CHARGES_FEE, MAX_DELIVERY_CHARGES_CUT_OFF } from "../../constants/constants";

export default function ViewOrder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const { selectedOrder, loading: orderLoading, updating } = useSelector((state: RootState) => state.order);
    const { user } = useSelector((state: RootState) => state.auth);

    const isPicker = user?.role?.some((r: any) => (r === 4 || (typeof r === 'object' && r.role_id === 4))) || false;
    const isPacker = user?.role?.some((r: any) => (r === 3 || r === 5 || (typeof r === 'object' && (r.role_id === 3 || r.role_id === 5)))) || false;

    // Picker, Packer and Assignment State
    const [pickers, setPickers] = useState<User[]>([]);
    const [packers, setPackers] = useState<User[]>([]);
    const [selectedPickerId, setSelectedPickerId] = useState("");
    const [selectedPackerId, setSelectedPackerId] = useState("");
    const [pickerRemark, setPickerRemark] = useState("");
    const [packerRemark, setPackerRemark] = useState("");

    // Order Items and Product State
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [showAddRow, setShowAddRow] = useState(false);
    const [orderRemark, setOrderRemark] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
    const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
    const [assignmentRemark, setAssignmentRemark] = useState("");
    const [showRemarkInput, setShowRemarkInput] = useState(false);

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
        dispatch(fetchProductsSelect({})).unwrap().then(res => setProducts(res));
    }, [dispatch]);

    // Initialize selections from order
    useEffect(() => {
        if (selectedOrder) {
            setSelectedPickerId(selectedOrder.picker_obj?.user_id || "");
            setPickerRemark(selectedOrder.picker_obj?.remark_msg || "");
            setSelectedPackerId(selectedOrder.packer_obj?.user_id || "");
            setPackerRemark(selectedOrder.packer_obj?.remark_msg || "");
            setOrderItems(selectedOrder.items || []);
            setOrderRemark(selectedOrder.order_remark || "");
        }
    }, [selectedOrder]);

    const isOrderDirty = useMemo(() => {
        if (!selectedOrder) return false;
        return selectedPickerId !== (selectedOrder.picker_obj?.user_id || "") ||
            pickerRemark !== (selectedOrder.picker_obj?.remark_msg || "") ||
            selectedPackerId !== (selectedOrder.packer_obj?.user_id || "") ||
            packerRemark !== (selectedOrder.packer_obj?.remark_msg || "") ||
            orderRemark !== (selectedOrder.order_remark || "") ||
            JSON.stringify(orderItems) !== JSON.stringify(selectedOrder.items || []);
    }, [selectedOrder, selectedPickerId, pickerRemark, selectedPackerId, packerRemark, orderItems]);

    const EDIT_ENABLED_STATUSES = ["ready"];
    const isCancelled = selectedOrder?.status.toLowerCase() === "cancelled";
    const canEditAssignments = selectedOrder && !isCancelled ? EDIT_ENABLED_STATUSES.includes(selectedOrder.status.toLowerCase()) : false;

    // Calculate Total Automatically
    const subtotal = useMemo(() => {
        return orderItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    }, [orderItems]);

    const deliveryCharges = useMemo(() => {
        if (subtotal >= MAX_DELIVERY_CHARGES_CUT_OFF) return 0;
        return DELIVERY_CHARGES_FEE;
    }, [subtotal]);

    const differences = useMemo(() => {
        if (!selectedOrder) return [];
        const original = selectedOrder.items || [];
        const current = orderItems;

        const diffs: any[] = [];

        // Check for missing or changed quantities
        original.forEach((origItem: any) => {
            const currItem = current.find((c: any) => (c.product_id || c._id) === (origItem.product_id || origItem._id));
            if (!currItem) {
                diffs.push({ name: origItem.name || origItem.product_name, type: 'removed', originalQty: origItem.quantity, currentQty: 0 });
            } else if (currItem.quantity !== origItem.quantity) {
                diffs.push({ name: origItem.name || origItem.product_name, type: 'changed', originalQty: origItem.quantity, currentQty: currItem.quantity });
            }
        });

        // Check for new items
        current.forEach((currItem: any) => {
            const origItem = original.find((o: any) => (o.product_id || o._id) === (currItem.product_id || currItem._id));
            if (!origItem) {
                diffs.push({ name: currItem.name || currItem.product_name, type: 'added', originalQty: 0, currentQty: currItem.quantity });
            }
        });

        return diffs;
    }, [selectedOrder, orderItems]);

    const totalAmount = useMemo(() => subtotal + deliveryCharges, [subtotal, deliveryCharges]);
    const originalPayable = useMemo(() => {
        if (!selectedOrder) return 0;
        return selectedOrder.payment_details?.payable_amount || selectedOrder.total_amount || 0;
    }, [selectedOrder]);
    const balanceAdjustment = useMemo(() => totalAmount - originalPayable, [totalAmount, originalPayable]);


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

    const handleUpdateAssignmentStatus = async () => {
        if (!id || !selectedOrder) return;
        const newStatus = isPicker ? 'picked' : 'packed';
        try {
            await dispatch(updateOrder({
                id,
                data: {
                    [isPicker ? 'picker_obj' : 'packer_obj']: {
                        ...(selectedOrder[isPicker ? 'picker_obj' : 'packer_obj'] || {}),
                        status: newStatus,
                        remark_msg: assignmentRemark || selectedOrder[isPicker ? 'picker_obj' : 'packer_obj']?.remark_msg || ""
                    }
                }
            })).unwrap();
            setAssignmentRemark("");
            setShowRemarkInput(false);
            dispatch(fetchOrderById(id));
        } catch (error) {
            console.error(`Failed to update ${isPicker ? 'picker' : 'packer'} status:`, error);
        }
    };

    const handleSaveOrder = async () => {
        if (!id || !selectedOrder) return;
        try {
            await dispatch(updateOrder({
                id,
                data: {
                    picker_obj: {
                        user_id: selectedPickerId,
                        remark_msg: pickerRemark
                    },
                    packer_obj: {
                        user_id: selectedPackerId,
                        remark_msg: packerRemark
                    },
                    items: orderItems.map(item => ({
                        product_id: item.product_id || item._id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total_amount: totalAmount,
                    order_remark: orderRemark,
                    // delivery_charges: deliveryCharges,
                    payment_details: {
                        ...(selectedOrder.payment_details || {}),
                        adjustment: {
                            adjustment_type: balanceAdjustment > 0 ? ADJUSTMENT_STATUSES.find((s) => s.value === 'collect')?.value : balanceAdjustment < 0 ? ADJUSTMENT_STATUSES.find((s) => s.value === 'refund')?.value : ADJUSTMENT_STATUSES.find((s) => s.value === 'balance')?.value,
                            adjustment_balance: Math.abs(balanceAdjustment),
                            status: "pending",
                            adjustment_time: null,
                            adjustment_remark: "",
                            adjustment_by: ""
                        }
                    }
                }
            })).unwrap();
            dispatch(fetchOrderById(id)); // Refresh data
        } catch (error) {
            console.error("Failed to save order updates:", error);
        }
    };

    const handleAddProduct = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p._id === selectedProductId);
        if (!product) return;

        if (orderItems.some(item => (item.product_id || item._id) === product._id)) {
            alert("Product already added. Update quantity in the table.");
            return;
        }

        if (quantity > product.stock) {
            alert(`Only ${product.stock} units available in stock.`);
            return;
        }

        const newItem = {
            product_id: product._id,
            product_name: product.name,
            name: product.name,
            quantity: quantity,
            price: product.price,
            stock: product.stock,
            images: product.images
        };

        setOrderItems([...orderItems, newItem]);
        setSelectedProductId("");
        setQuantity(1);
    };

    const updateItemQuantity = (index: number, newQty: number) => {
        if (newQty < 1) return;
        const item = orderItems[index];
        if (newQty > item.stock) {
            alert(`Only ${item.stock} units available in stock.`);
            return;
        }
        const updatedItems = [...orderItems];
        updatedItems[index] = { ...updatedItems[index], quantity: newQty };
        setOrderItems(updatedItems);
    };

    const updateItemPrice = (index: number, newPrice: number) => {
        if (newPrice < 0) return;
        const updatedItems = [...orderItems];
        updatedItems[index] = { ...updatedItems[index], price: newPrice };
        setOrderItems(updatedItems);
    };

    const removeItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const printOrderData = (order: any) => {
        // Create a hidden iframe for printing
        let printIframe = document.getElementById('print-iframe') as HTMLIFrameElement;
        if (!printIframe) {
            printIframe = document.createElement('iframe');
            printIframe.id = 'print-iframe';
            printIframe.style.display = 'none';
            document.body.appendChild(printIframe);
        }

        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Customer';
        const address = order.shipping_address || (order.address ? `${order.address.address}, ${order.address.locality || ''}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}` : 'Not available');
        const phone = order.shipping_phone || (order.address?.shipping_phone) || 'Not available';
        const invoiceId = order._id.slice(-8).toUpperCase();

        const isPickerOrPacker = isPicker || isPacker;
        const itemsHtml = order.items?.map((item: any) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                ${isPickerOrPacker ? `
                <td style="padding: 12px 0; width: 30px;">
                    <div style="width: 16px; height: 16px; border: 1px solid #d1d5db; border-radius: 3px;"></div>
                </td>` : ''}
                <td style="padding: 12px 0; font-size: 14px; color: #1f2937;">${item.name || item.product_name}</td>
                <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #1f2937;">${item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1f2937;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') || '';

        const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
        if (!iframeDoc) return;

        iframeDoc.open();
        iframeDoc.write(`
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
                        .signature-remark-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 30px; margin-top: 50px; padding-top: 30px; border-top: 1px solid #f3f4f6; }
                        .box { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; height: 90px; }
                        .box-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; margin-bottom: 6px; }
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
                        <table><thead><tr>${isPickerOrPacker ? '<th style="width: 30px;"></th>' : ''}<th>Service/Product</th><th style="text-align: center;">Qty</th><th style="text-align: right;">Rate</th><th style="text-align: right;">Amount</th></tr></thead><tbody>${itemsHtml}</tbody></table>
                        
                        ${isPickerOrPacker ? `
                        <div class="signature-remark-grid">
                            <div class="box">
                                <div class="box-title">Signature</div>
                            </div>
                            <div class="box">
                                <div class="box-title">Remark / Internal Notes</div>
                            </div>
                        </div>` : ''}
                        <div class="footer">
                            <div class="notes-section">
                                <div class="section-title">Important Note</div>
                                <p>Thank you for choosing Khana Fast. If you have any questions about this invoice, please reach out to our support team.</p>
                                <p style="margin-top: 20px;">© 2026 Khana Fast. All rights reserved.</p>
                            </div>
                            <div class="totals-grid">
                                <div class="total-row"><div style="color: #9ca3af;">Subtotal</div><div class="text-bold">₹${subtotal.toLocaleString()}</div></div>
                                <div class="total-row"><div style="color: #9ca3af;">Delivery Charges</div><div class="text-bold">₹${deliveryCharges.toLocaleString()}</div></div>
                                <div class="total-row grand-total"><div>Total</div><div>₹${totalAmount.toLocaleString()}</div></div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);
        iframeDoc.close();

        // Use a timeout to ensure styles and fonts are loaded (as much as possible)
        setTimeout(() => {
            printIframe.contentWindow?.focus();
            printIframe.contentWindow?.print();
        }, 500);
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
                    (!isPicker && !isPacker) && <button key="ship" disabled={updating} onClick={() => handleStatusChange("shipped")} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold text-sm transition-all disabled:opacity-50">SHIP ORDER</button>,
                    (!isPicker && !isPacker) && <button key="cancel" disabled={updating} onClick={() => handleStatusChange("cancelled")} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm transition-all disabled:opacity-50">CANCEL</button>
                );
                break;
            case "shipped":
                if (!isPicker && !isPacker) {
                    buttons.push(
                        <button key="deliver" disabled={updating} onClick={() => handleStatusChange("delivered")} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold text-sm transition-all disabled:opacity-50">MARK DELIVERED</button>
                    );
                }
                break;
            case "delivered":
                if (!isPicker && !isPacker) {
                    buttons.push(
                        <button key="return" disabled={updating} onClick={() => handleStatusChange("returned")} className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 font-bold text-sm transition-all disabled:opacity-50">MARK RETURNED</button>
                    );
                }
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

        if (isPicker || isPacker) {
            buttons.push(
                <button
                    key="reverse"
                    disabled={updating || differences.length === 0}
                    onClick={() => setIsReverseModalOpen(true)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                    RAISE REVERSE
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
                                        <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm ${getStatusColor(
                                            isPicker ? (selectedOrder.picker_obj?.status || selectedOrder.status) :
                                                isPacker ? (selectedOrder.packer_obj?.status || selectedOrder.status) :
                                                    selectedOrder.status
                                        )}`}>
                                            {isPicker ? (selectedOrder.picker_obj?.status || selectedOrder.status) :
                                                isPacker ? (selectedOrder.packer_obj?.status || selectedOrder.status) :
                                                    selectedOrder.status}
                                        </span>
                                        {(isPicker || isPacker) && (
                                            <div className="flex items-center gap-2 ml-2 border-l border-gray-200 dark:border-gray-800 pl-3">
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Picker</p>
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md shadow-xs ${selectedOrder.picker_obj?.status === 'assigned' ? 'bg-blue-50 text-blue-600 border border-blue-100' : selectedOrder.picker_obj?.status === 'picked' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                                        {selectedOrder.picker_obj?.status || 'Unassigned'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Packer</p>
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md shadow-xs ${selectedOrder.packer_obj?.status === 'assigned' ? 'bg-blue-50 text-blue-600 border border-blue-100' : selectedOrder.packer_obj?.status === 'packed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                                                        {selectedOrder.packer_obj?.status || 'Unassigned'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })} at {new Date(selectedOrder.createdAt).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {isOrderDirty && !isCancelled && (
                                    <button
                                        onClick={handleSaveOrder}
                                        disabled={updating}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-green-500/20"
                                    >
                                        {updating ? <DotLoading size="sm" className="text-white" /> : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                SAVE ORDER
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
                            {(!isPicker && !isPacker) && (
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
                                        <div
                                            className={`space-y-4 transition-all duration-300 ${!canEditAssignments ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                            title={!canEditAssignments ? "Assignments can only be updated when order status is 'Ready'" : ""}
                                        >
                                            {!canEditAssignments && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                                    <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                                                        {isCancelled ? "Order is Cancelled" : "Assignments only in 'Ready' status"}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <Label htmlFor="picker" className="text-[10px] mb-1">Select Picker</Label>
                                                <select
                                                    id="picker"
                                                    value={selectedPickerId}
                                                    onChange={(e) => setSelectedPickerId(e.target.value)}
                                                    disabled={!canEditAssignments}
                                                    className={`w-full h-10 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
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
                                                <div>
                                                    <Label htmlFor="pickerRemark" className="text-[10px] mb-1">Picker Remark</Label>
                                                    <textarea
                                                        id="pickerRemark"
                                                        rows={2}
                                                        value={pickerRemark}
                                                        onChange={(e) => setPickerRemark(e.target.value)}
                                                        disabled={!canEditAssignments}
                                                        className={`w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
                                                        placeholder="Add instructions..."
                                                    ></textarea>
                                                </div>
                                            )}
                                            {!canEditAssignments && (selectedOrder.picker_obj?.name) && (
                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned To</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-[10px] font-bold text-brand-600 border border-brand-100 dark:border-brand-900/30 uppercase">
                                                            {selectedOrder.picker_obj.name.charAt(0)}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{selectedOrder.picker_obj.name}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
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
                                        <div
                                            className={`space-y-4 transition-all duration-300 ${!canEditAssignments ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                            title={!canEditAssignments ? "Assignments can only be updated when order status is 'Ready'" : ""}
                                        >
                                            {!canEditAssignments && (
                                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                                    <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                                                        {isCancelled ? "Order is Cancelled" : "Assignments only in 'Ready' status"}
                                                    </p>
                                                </div>
                                            )}
                                            <div>
                                                <Label htmlFor="packer" className="text-[10px] mb-1">Select Packer</Label>
                                                <select
                                                    id="packer"
                                                    value={selectedPackerId}
                                                    onChange={(e) => setSelectedPackerId(e.target.value)}
                                                    disabled={!canEditAssignments}
                                                    className={`w-full h-10 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
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
                                                <div>
                                                    <Label htmlFor="packerRemark" className="text-[10px] mb-1">Packer Remark</Label>
                                                    <textarea
                                                        id="packerRemark"
                                                        rows={2}
                                                        value={packerRemark}
                                                        onChange={(e) => setPackerRemark(e.target.value)}
                                                        disabled={!canEditAssignments}
                                                        className={`w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
                                                        placeholder="Add instructions..."
                                                    ></textarea>
                                                </div>
                                            )}
                                            {!canEditAssignments && (selectedOrder.packer_obj?.name) && (
                                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned To</p>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100 dark:border-blue-900/30 uppercase">
                                                            {selectedOrder.packer_obj.name.charAt(0)}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{selectedOrder.packer_obj.name}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Customer Information Card */}
                            {(!isPicker && !isPacker) && (
                                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        Customer Details
                                    </h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center flex-row justify-between">
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
                                        </div>
                                        <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/20 w-full relative group/note">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Internal Note</p>
                                                </div>
                                                {!isCancelled && (
                                                    <button
                                                        onClick={() => {
                                                            if (isEditingNote && orderRemark !== (selectedOrder.order_remark || "")) {
                                                                handleSaveOrder();
                                                            }
                                                            setIsEditingNote(!isEditingNote);
                                                        }}
                                                        className="p-1 rounded-md hover:bg-amber-500/20 text-amber-600 dark:text-amber-500 transition-colors"
                                                        title={isEditingNote ? "Save and Finish" : "Edit Note"}
                                                    >
                                                        {isEditingNote ? (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                        ) : (
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {isEditingNote ? (
                                                <textarea
                                                    rows={2}
                                                    autoFocus
                                                    value={orderRemark}
                                                    onChange={(e) => setOrderRemark(e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-xs text-amber-900/70 dark:text-amber-400 font-medium leading-relaxed italic placeholder:text-amber-300 focus:ring-0 resize-none"
                                                    placeholder="Add an internal note..."
                                                />
                                            ) : (
                                                <p className={`text-xs text-amber-900/70 dark:text-amber-400 font-medium leading-relaxed italic ${!orderRemark && 'text-amber-400/50'}`}>
                                                    {orderRemark || "No internal note added yet."}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Order Items Table */}
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 5v2a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h12a3 3 0 013 3" /></svg>
                                        Order Items
                                    </h3>
                                    {!isCancelled && (
                                        <button
                                            onClick={() => setShowAddRow(!showAddRow)}
                                            className={`p-2 rounded-lg transition-all ${showAddRow ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 hover:bg-brand-100'}`}
                                            title={showAddRow ? "Hide Add Row" : "Add New Product"}
                                        >
                                            {showAddRow ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            )}
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12 text-center">S.No</th>
                                                {(isPicker || isPacker) && (
                                                    <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-12 text-center">Done</th>
                                                )}
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-28">Rate</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-24">Qty</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right w-28">Total</th>
                                                <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                            {showAddRow && (
                                                <tr className="bg-brand-50/20 dark:bg-brand-500/5">
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-[10px] font-bold text-brand-600 mx-auto">+</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={selectedProductId}
                                                            onChange={(e) => setSelectedProductId(e.target.value)}
                                                            className="w-full h-9 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-3 py-1 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                                                        >
                                                            <option value="">Select product to add...</option>
                                                            {products.map(product => (
                                                                <option key={product._id} value={product._id} disabled={!product.isAvailable || product.stock <= 0}>
                                                                    {product.name} (₹{product.price}) - Stock: {product.stock} {product.stock <= 0 ? '(Out of Stock)' : ''}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-gray-400 text-xs font-medium italic">Auto</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={products.find(p => p._id === selectedProductId)?.stock || 1}
                                                            value={quantity}
                                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                                            className="w-full h-9 rounded-lg border border-gray-200 bg-white dark:bg-gray-800 px-2 py-1 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white text-center"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={handleAddProduct}
                                                            disabled={!selectedProductId}
                                                            className="px-4 py-1.5 bg-brand-500 text-white font-bold text-[10px] rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-all uppercase tracking-widest"
                                                        >
                                                            Add
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4"></td>
                                                </tr>
                                            )}
                                            {orderItems.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400 text-xs italic uppercase">No products in this order.</td>
                                                </tr>
                                            ) : (
                                                orderItems.map((item: any, index: number) => (
                                                    <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                        <td className="px-6 py-5 text-xs text-gray-500 font-bold tabular-nums text-center">{index + 1}</td>
                                                        {(isPicker || isPacker) && (
                                                            <td className="px-6 py-5 text-center">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={!!checkedItems[index]}
                                                                    onChange={(e) => setCheckedItems(prev => ({ ...prev, [index]: e.target.checked }))}
                                                                    className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                                                                />
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                                                                    {item.images?.[0]?.url || item.image ? (
                                                                        <img src={item.images?.[0]?.url || item.image} alt="" className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.name || item.product_name}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{item.brand?.name || item.brand_name || 'Generic'}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-1 group">
                                                                <span className="text-gray-400 text-xs font-bold font-sans">₹</span>
                                                                <input
                                                                    type="number"
                                                                    value={item.price}
                                                                    disabled={isCancelled}
                                                                    onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)}
                                                                    className={`w-20 bg-transparent border-b border-transparent ${!isCancelled ? 'group-hover:border-gray-200 dark:group-hover:border-gray-700' : ''} focus:border-brand-500 focus:ring-0 text-xs font-bold text-gray-700 dark:text-gray-300 text-center transition-all px-0`}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-1 group">
                                                                <span className="text-gray-400 text-[10px] font-bold">x</span>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={item.stock}
                                                                    value={item.quantity}
                                                                    disabled={isCancelled}
                                                                    onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                                                    className={`w-12 bg-transparent border-b border-transparent ${!isCancelled ? 'group-hover:border-gray-200 dark:group-hover:border-gray-700' : ''} focus:border-brand-500 focus:ring-0 text-xs font-black text-gray-900 dark:text-white text-center transition-all px-0`}
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5 whitespace-nowrap text-right font-black text-gray-900 dark:text-white tracking-tight text-xs tabular-nums">₹{(item.price * item.quantity).toLocaleString()}</td>
                                                        <td className="px-6 py-5 text-center">
                                                            {!isCancelled && (
                                                                <button
                                                                    onClick={() => removeItem(index)}
                                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                                                    title="Remove Item"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Consolidated Summary Card */}
                            {(!isPicker && !isPacker) && (
                                <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl group-hover:bg-brand-500/20 transition-all duration-500"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Order Summary</h3>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border ${selectedOrder.payment_details?.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                    {selectedOrder.payment_details?.status || 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Payment Details Container */}
                                        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Method</p>
                                                    <p className="text-xs font-bold text-white uppercase">{selectedOrder.payment_details?.method || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Gateway</p>
                                                    <p className="text-xs font-bold text-white uppercase">{selectedOrder.payment_details?.gateway || 'N/A'}</p>
                                                </div>
                                                <div className="space-y-0.5 col-span-2">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</p>
                                                    <p className="text-[10px] font-bold text-gray-300 break-all tabular-nums">{selectedOrder.payment_details?.transaction_id || '---'}</p>
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Paid Amount</p>
                                                    <p className="text-xs font-black text-green-500 font-mono">₹{selectedOrder.payment_details?.paid_amount?.toLocaleString() || 0}</p>
                                                </div>
                                                {selectedOrder.payment_details?.adjustment && selectedOrder.payment_details.adjustment.adjustment_type !== 'balanced' && (
                                                    <div className="col-span-2 pt-3 border-t border-white/5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-1.5 h-1.5 rounded-full ${selectedOrder.payment_details.adjustment.adjustment_type === 'collect' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                        Adj. ({selectedOrder.payment_details.adjustment.adjustment_type === 'collect' ? 'Collect' : 'Refund'})
                                                                    </p>
                                                                    <span className={`px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest rounded-md border ${selectedOrder.payment_details.adjustment.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                                        {selectedOrder.payment_details.adjustment.status || 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className={`text-xs font-black ${selectedOrder.payment_details.adjustment.adjustment_type === 'collect' ? 'text-red-500' : 'text-blue-500'}`}>
                                                                ₹{selectedOrder.payment_details.adjustment.adjustment_balance.toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Subtotal</span>
                                                <span className="text-sm font-black text-white">₹{subtotal.toLocaleString()}</span>
                                            </div>

                                            <div className="flex justify-between items-center pb-4 border-b border-white/5 border-dashed">
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Delivery Charges</span>
                                                <span className={`text-sm font-black ${deliveryCharges === 0 ? 'text-green-500' : 'text-white'}`}>
                                                    {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges.toLocaleString()}`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                <span className="text-base font-black text-white uppercase tracking-widest">New Total</span>
                                                <span className="text-3xl font-black text-brand-500 tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                                            </div>

                                            <div className="pt-4 mt-2 border-t border-white/10 space-y-3">
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Original Payable</span>
                                                        <span className="text-xs font-black text-gray-400">₹{originalPayable.toLocaleString()}</span>
                                                    </div>

                                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Difference</span>
                                                        <span className={`text-sm font-black ${balanceAdjustment === 0 ? 'text-green-500' : balanceAdjustment > 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                                            {balanceAdjustment === 0 ? 'BALANCED' : (balanceAdjustment > 0 ? `+ ₹${balanceAdjustment.toLocaleString()}` : `- ₹${Math.abs(balanceAdjustment).toLocaleString()}`)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {balanceAdjustment !== 0 ? (
                                                    <div className={`p-3 rounded-xl border flex flex-col gap-1 ${balanceAdjustment > 0
                                                        ? "bg-red-500/10 border-red-500/20"
                                                        : "bg-blue-500/10 border-blue-500/20"
                                                        }`}>
                                                        <div className="flex justify-between items-center">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${balanceAdjustment > 0 ? "text-red-400" : "text-blue-400"
                                                                }`}>
                                                                {balanceAdjustment > 0 ? "Distribution: To Collect" : "Distribution: To Refund"}
                                                            </span>
                                                            <span className={`text-sm font-black ${balanceAdjustment > 0 ? "text-red-500" : "text-blue-500"
                                                                }`}>
                                                                ₹{Math.abs(balanceAdjustment).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className={`text-[9px] font-medium leading-tight ${balanceAdjustment > 0 ? "text-red-400/60" : "text-blue-400/60"
                                                            }`}>
                                                            {balanceAdjustment > 0
                                                                ? "Additional payment required to cover order updates."
                                                                : "Surplus amount to be returned to customer."}
                                                        </p>
                                                    </div>
                                                ) : isOrderDirty ? (
                                                    <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/10 flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Status</span>
                                                        <span className="text-xs font-black text-green-500 uppercase">Balanced</span>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}



                            {/* Checklist Summary Container for Picker/Packer */}
                            {(isPicker || isPacker) && (
                                <div className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-white/5 space-y-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-white/5 pb-4">Checklist Summary</h3>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Checked</p>
                                            <p className="text-xl font-black text-green-500">{Object.values(checkedItems).filter(v => v).length}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Unchecked</p>
                                            <p className="text-xl font-black text-amber-500">{orderItems.length - Object.values(checkedItems).filter(v => v).length}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-center">
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Overall</p>
                                            <p className="text-xl font-black text-white">{orderItems.length}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateAssignmentStatus}
                                        disabled={updating || (orderItems.length > 0 && Object.values(checkedItems).filter(v => v).length !== orderItems.length)}
                                        className="w-full py-4 bg-brand-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                    >
                                        {updating ? <DotLoading size="sm" className="text-white" /> : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                {isPicker ? 'Mark as Picked' : 'Mark as Packed'}
                                            </>
                                        )}
                                    </button>

                                    <div className="pt-2">
                                        {!showRemarkInput ? (
                                            <button
                                                onClick={() => setShowRemarkInput(true)}
                                                className="text-[10px] font-bold text-brand-500 uppercase tracking-widest hover:text-brand-600 transition-colors flex items-center gap-1.5"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                Add Remark
                                            </button>
                                        ) : (
                                            <div className="space-y-3 animate-fade-in">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Remark</p>
                                                    <button
                                                        onClick={() => { setShowRemarkInput(false); setAssignmentRemark(""); }}
                                                        className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={2}
                                                    value={assignmentRemark}
                                                    onChange={(e) => setAssignmentRemark(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder:text-gray-600 focus:border-brand-500/50 focus:ring-0 transition-all resize-none"
                                                    placeholder="Add a note about this assignment..."
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleUpdateAssignmentStatus}
                                                    disabled={updating || !assignmentRemark.trim()}
                                                    className="w-full py-3 bg-white/10 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {updating ? <DotLoading size="sm" /> : "Submit Notes & Update Order"}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    {(orderItems.length > 0 && Object.values(checkedItems).filter(v => v).length !== orderItems.length) && (
                                        <p className="text-[10px] text-amber-500/80 font-medium text-center italic"> Please check all items to update status </p>
                                    )}
                                </div>
                            )}



                            {/* Packer Information */}
                            {(isPicker && !isPacker) && (

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
                                    <div
                                        className={`space-y-4 transition-all duration-300 ${!canEditAssignments ? 'opacity-70 grayscale-[0.5]' : ''}`}
                                        title={!canEditAssignments ? "Assignments can only be updated when order status is 'Ready'" : ""}
                                    >
                                        {!canEditAssignments && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                                                <svg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tight">
                                                    {isCancelled ? "Order is Cancelled" : "Assignments only in 'Ready' status"}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <Label htmlFor="packer" className="text-[10px] mb-1">Select Packer</Label>
                                            <select
                                                id="packer"
                                                value={selectedPackerId}
                                                onChange={(e) => setSelectedPackerId(e.target.value)}
                                                disabled={!canEditAssignments}
                                                className={`w-full h-10 rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
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
                                            <div>
                                                <Label htmlFor="packerRemark" className="text-[10px] mb-1">Packer Remark</Label>
                                                <textarea
                                                    id="packerRemark"
                                                    rows={2}
                                                    value={packerRemark}
                                                    onChange={(e) => setPackerRemark(e.target.value)}
                                                    disabled={!canEditAssignments}
                                                    className={`w-full rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white transition-all ${!canEditAssignments ? 'cursor-not-allowed' : ''}`}
                                                    placeholder="Add instructions..."
                                                ></textarea>
                                            </div>
                                        )}
                                        {!canEditAssignments && (selectedOrder.packer_obj?.name) && (
                                            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned To</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 border border-blue-100 dark:border-blue-900/30 uppercase">
                                                        {selectedOrder.packer_obj.name.charAt(0)}
                                                    </div>
                                                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">{selectedOrder.packer_obj.name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            )}



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
            )
            }

            {/* Raise Reverse Comparison Modal */}
            {isReverseModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-up">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-500/5">
                            <div className="flex items-center gap-3 text-amber-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" /></svg>
                                <h3 className="text-lg font-black uppercase tracking-tight">Raise Reverse (Comparison)</h3>
                            </div>
                            <button onClick={() => setIsReverseModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 max-h-[60vh] overflow-y-auto">
                            <p className="text-sm text-gray-500 mb-6 font-medium">The following changes will be applied to the order. A balance adjustment will be calculated automatically.</p>

                            <div className="space-y-4">
                                {differences.map((diff: any, idx: number) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex items-center justify-between ${diff.type === 'removed' ? 'bg-red-50 border-red-100 text-red-700' :
                                        diff.type === 'added' ? 'bg-green-50 border-green-100 text-green-700' :
                                            'bg-blue-50 border-blue-100 text-blue-700'
                                        }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white/50 flex items-center justify-center font-bold text-xs shadow-sm">
                                                {diff.type === 'removed' ? '-' : diff.type === 'added' ? '+' : 'Δ'}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight">{diff.name}</p>
                                                <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">{diff.type}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black opacity-50 tabular-nums">Qty: {diff.originalQty}</span>
                                                <svg className="w-3 h-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                <span className="text-xs font-black tabular-nums">{diff.currentQty}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-bold text-gray-400 uppercase tracking-widest">Adjustment Amount</span>
                                    <span className={`text-xl font-black tabular-nums ${balanceAdjustment >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        ₹{Math.abs(balanceAdjustment).toLocaleString()}
                                        <span className="text-[10px] ml-1 uppercase font-bold">{balanceAdjustment >= 0 ? 'Collect' : 'Refund'}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 flex items-center justify-end gap-3">
                            <button
                                onClick={() => setIsReverseModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleSaveOrder();
                                    setIsReverseModalOpen(false);
                                }}
                                className="px-8 py-2.5 bg-brand-500 text-white rounded-xl hover:bg-brand-600 font-bold text-sm shadow-lg shadow-brand-500/20 transition-all uppercase tracking-widest"
                            >
                                Finalize & Raise Reverse
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
