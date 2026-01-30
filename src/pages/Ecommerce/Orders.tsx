import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, deleteOrder, createOrder, Order } from "../../store/slices/orderSlice";
import { createInvoice } from "../../store/slices/invoiceSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import { ITEMS_PER_PAGE, MIN_TABLE_HEIGHT } from "../../constants/constants";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import OrderRemarkModal from "./OrderRemarkModal";
import { getStatusColor } from "../../utils/helper";

export default function Orders() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { orders, loading, error } = useSelector((state: RootState) => state.order);

    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
    const [itemSearch, setItemSearch] = useState("");
    const [minQuantity, setMinQuantity] = useState(""); // Total Quantity
    const [minItemCount, setMinItemCount] = useState(""); // Count of items

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    // Remark Modal State
    const [remarkModalOpen, setRemarkModalOpen] = useState(false);
    const [remarkOrder, setRemarkOrder] = useState<Order | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        console.log("Orders Page State:", { ordersLength: orders.length, loading, error, orders });
    }, [orders, loading, error]);




    const statusOptions = ["Pending", "Hold", "Ready", "Shipped", "Delivered", "Cancelled", "Returned"];

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};

        if (searchQuery) {
            const cleanSearch = searchQuery.trim().replace("#", "");
            filter.$or = [
                { _id: { $regex: cleanSearch, $options: "i" } },
                { customer_name: { $regex: searchQuery, $options: "i" } },
                { shipping_address: { $regex: searchQuery, $options: "i" } },
                { shipping_phone: { $regex: searchQuery, $options: "i" } },
            ];
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        if (selectedStatuses.length > 0) {
            filter.status = { $in: selectedStatuses.map((s) => s.toLowerCase()) };
        }
        if (selectedPaymentMethods.length > 0) {
            filter.payment_method = { $in: selectedPaymentMethods };
        }


        if (minItemCount) {
            // Note: This might require $expr which is supported in aggregation or find (mongo 3.6+)
            // If backend doesn't support $expr in find, this might fail or require aggregation.
            // Attempting standard Query if possible, or using $where (slow but works on some versions).
            // Ideally: { $expr: { $gte: [{ $size: "$items" }, Number(minItemCount)] } }
            const count = Number(minItemCount);
            if (!isNaN(count)) {
                filter.$expr = { $gte: [{ $size: "$items" }, count] };
            }
        }

        if (itemSearch) {
            filter.items = {
                $elemMatch: {
                    $or: [
                        { name: { $regex: itemSearch, $options: "i" } },
                        { product_name: { $regex: itemSearch, $options: "i" } }
                    ]
                }
            };
        }
        if (minQuantity) {
            // "Min. Quantity" - Interpreting as TOTAL quantity across all items if backend supports it via aggregation or virtual.
            // If "Min. Quantity" means "At least ONE item has this quantity", use items.quantity.
            // User said "Min. Quantity" in context of general filtering.
            // Given I can't easily sum without aggregation in "find", I'll stick to 'items.quantity' matches for now 
            // essentially "Order contains an item with qty >= X", or try a specific field if one exists.
            // Reverting to previous logic for "Min Quantity" on items.item.
            const qty = Number(minQuantity);
            if (!isNaN(qty)) {
                filter["items.quantity"] = { $gte: qty };
            }
        }
        return filter;
    }, [searchQuery, startDate, endDate, selectedStatuses, selectedPaymentMethods, itemSearch, minQuantity, minItemCount]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            dispatch(fetchOrders({ filter }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter]);

    // Calculate pagination (Backend should ideally handle this too, but for now we filter then slice local or backend returns filtered list)
    // Since we are fetching filtered orders from backend, 'orders' IS the current filtered list.
    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };



    const handleDeleteOrder = (order: Order) => {
        setDeletingOrder(order);
        setDeleteModalOpen(true);
    };

    const confirmDeleteOrder = async () => {
        if (!deletingOrder) return;

        setIsDeleteLoading(true);
        try {
            await dispatch(deleteOrder(deletingOrder._id)).unwrap();
            setDeleteModalOpen(false);
            setDeletingOrder(null);
        } catch (error) {
            console.error("Failed to delete order:", error);
        } finally {
            setIsDeleteLoading(false);
        }
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setDeletingOrder(null);
    };

    const handleOpenRemark = (order: Order) => {
        setRemarkOrder(order);
        setRemarkModalOpen(true);
    };


    const handleCloneOrder = async (order: Order) => {
        if (!confirm("Are you sure you want to clone this order?")) return;

        try {
            // Construct payload as per requirement
            const payload = {
                user_id: order.user?._id,
                address_id: order.address?._id,
                packer_id: typeof order.packer_id === 'object' ? order.packer_id?._id : order.packer_id,
                picker_id: typeof order.picker_id === 'object' ? order.picker_id?._id : order.picker_id,
                payment_method: order.payment_details?.method || "cod",
                items: order.items?.map((item: any) => {
                    const productId = item.product_id || item.product?._id || item.product;
                    return {
                        product_id: productId,
                        quantity: item.quantity
                    };
                }).filter((item) => item.product_id) || []
            };

            await dispatch(createOrder(payload)).unwrap();

            // Refresh orders
            dispatch(fetchOrders({ filter: buildFilter() }));
        } catch (error) {
            console.error("Failed to clone order:", error);
            alert("Failed to clone order");
        }
    };

    const handlePrintInvoice = async (order: Order) => {
        // 1. Generate/Save invoice in backend (Fire and forget or await but don't block UI strictly on success for printing if we already have data)
        try {
            dispatch(createInvoice({ order_id: order._id }));
        } catch (error) {
            console.error("Background invoice creation failed", error);
        }

        // 2. Print using the Order object directly (Restoring "like before" design)
        printOrderData(order);
    };

    const printOrderData = (order: Order) => {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.left = '0';
        iframe.style.top = '0';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const printWindow = iframe.contentWindow;
        if (!printWindow) return;

        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Customer';
        // Fallback: Use shipping_address string if available, otherwise try to construct from address object, otherwise 'Not available'
        const address = order.shipping_address
            ? order.shipping_address
            : (order.address ? `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}` : 'Not available');
        const phone = order.shipping_phone || (order.address?.shipping_phone) || 'Not available';

        // Use _id for invoice number in this view to match "like before"
        const invoiceId = order._id.slice(-8).toUpperCase();

        const itemsHtml = order.items?.map((item) => `
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
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: 'Outfit', sans-serif; padding: 40px; color: #4b5563; line-height: 1.5; }
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
                        
                        @media print {
                            body { padding: 20px; }
                            .container { width: 100%; }
                            -webkit-print-color-adjust: exact;
                        }
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

                        <table>
                            <thead>
                                <tr>
                                    <th>Service/Product</th>
                                    <th style="text-align: center;">Qty</th>
                                    <th style="text-align: right;">Rate</th>
                                    <th style="text-align: right;">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>

                        <div class="footer">
                            <div class="notes-section">
                                <div class="section-title">Important Note</div>
                                <p>Thank you for choosing Khana Fast. If you have any questions about this invoice, please reach out to our support team.</p>
                                <p style="margin-top: 20px;">© 2026 Khana Fast. All rights reserved.</p>
                            </div>
                            <div class="totals-grid">
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Subtotal</div>
                                    <div class="text-bold">₹${order.total_amount.toLocaleString()}</div>
                                </div>
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Delivery Fee</div>
                                    <div class="text-bold">₹0</div>
                                </div>
                                <div class="total-row grand-total">
                                    <div>Total</div>
                                    <div>₹${order.total_amount.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            document.body.removeChild(iframe);
        }, 500);
    };

    const renderActions = (order: Order) => {

        const viewButton = (
            <button
                onClick={() => navigate(`/orders/view/${order._id}`)}
                // className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"

                title="View Order Details"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            </button>
        );


        const invoiceButton = (
            <button
                onClick={() => handlePrintInvoice(order)}
                // className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors inline-block"
                className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"

                title="Print Invoice"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
            </button>
        );

        const cloneButton = (
            // <button
            //     onClick={() => handleCloneOrder(order)}
            //     className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            //     title="Clone Order"
            // >
            //     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            //         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            //     </svg>
            // </button>
            <button
                onClick={() => handleCloneOrder(order)}
                className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"
                title="Clone"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>

        );

        const deleteButton = (
            <button
                onClick={() => handleDeleteOrder(order)}
                // className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"

                title="Delete Order"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        );
        const remarkButton = (
            <button
                onClick={() => handleOpenRemark(order)}
                className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"
                title="Order Remark"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </button>
        );

        return (
            <div className={`flex items-center justify-end gap-1`}>
                {invoiceButton}
                {viewButton}
                {cloneButton}
                {deleteButton}
                {order.order_remark && remarkButton}
            </div>
        );
    };

    return (
        <div>
            <PageMeta
                title="Orders | Khana Fast"
                description="Manage your orders in the Khana Fast Admin Dashboard"
            />
            <PageBreadcrumb pageTitle="Orders" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                        Recent Orders
                    </h3>
                    <div className="w-full xl:w-auto flex items-center justify-end gap-3 flex-wrap">

                        <TableFilter
                            placeholder="Universal search..."
                            onFilterChange={({ search, startDate: start, endDate: end }) => {
                                setSearchQuery(search);
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            className="mb-0"
                        >
                            <div className="relative" ref={filterRef}>
                                <button
                                    className={`flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-theme-xs transition-all hover:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${(selectedStatuses.length > 0 || selectedPaymentMethods.length > 0 || itemSearch || minQuantity || minItemCount) ? 'border-brand-500 ring-3 ring-brand-500/10' : ''}`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className={(selectedStatuses.length > 0 || selectedPaymentMethods.length > 0 || itemSearch || minQuantity || minItemCount) ? 'text-brand-600' : 'text-gray-500'}>
                                        {(selectedStatuses.length > 0 || selectedPaymentMethods.length > 0 || itemSearch || minQuantity || minItemCount)
                                            ? `${selectedStatuses.length + selectedPaymentMethods.length + (itemSearch ? 1 : 0) + (minQuantity ? 1 : 0) + (minItemCount ? 1 : 0)} Filters`
                                            : 'Filter'}
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
                                        <div className="space-y-6">
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</h4>
                                                    {selectedStatuses.length > 0 && (
                                                        <button
                                                            onClick={() => setSelectedStatuses([])}
                                                            className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {statusOptions.map((status) => (
                                                        <label key={status} className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                                                                checked={selectedStatuses.includes(status)}
                                                                onChange={() => {
                                                                    const newStatuses = selectedStatuses.includes(status)
                                                                        ? selectedStatuses.filter(s => s !== status)
                                                                        : [...selectedStatuses, status];
                                                                    setSelectedStatuses(newStatuses);
                                                                }}
                                                            />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{status}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Payment</h4>
                                                    {selectedPaymentMethods.length > 0 && (
                                                        <button
                                                            onClick={() => setSelectedPaymentMethods([])}
                                                            className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {["Online", "COD"].map((method) => (
                                                        <label key={method} className="flex items-center gap-2 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                                                                checked={selectedPaymentMethods.includes(method)}
                                                                onChange={() => {
                                                                    const newMethods = selectedPaymentMethods.includes(method)
                                                                        ? selectedPaymentMethods.filter(m => m !== method)
                                                                        : [...selectedPaymentMethods, method];
                                                                    setSelectedPaymentMethods(newMethods);
                                                                }}
                                                            />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">{method}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Item Details</h4>
                                                    {(itemSearch || minQuantity || minItemCount) && (
                                                        <button
                                                            onClick={() => {
                                                                setItemSearch("");
                                                                setMinQuantity("");
                                                                setMinItemCount("");
                                                            }}
                                                            className="text-[10px] text-brand-500 hover:text-brand-600 font-bold uppercase"
                                                        >
                                                            Clear
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="space-y-3">
                                                    {/* <div>
                                                        <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Item Name</label>
                                                        <input
                                                            type="text"
                                                            value={itemSearch}
                                                            onChange={(e) => setItemSearch(e.target.value)}
                                                            placeholder="Search items..."
                                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                                                        />
                                                    </div> */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Min. Item</label>
                                                            <input
                                                                type="number"
                                                                value={minItemCount}
                                                                onChange={(e) => setMinItemCount(e.target.value)}
                                                                placeholder="e.g. 5"
                                                                min="1"
                                                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Min. Quantity</label>
                                                            <input
                                                                type="number"
                                                                value={minQuantity}
                                                                onChange={(e) => setMinQuantity(e.target.value)}
                                                                placeholder="e.g. 50"
                                                                min="1"
                                                                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TableFilter>
                        <button
                            onClick={() => navigate('/orders/create')}
                            className="inline-flex items-center justify-center h-11 px-4 text-sm font-medium text-white transition-colors bg-brand-500 rounded-lg hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Create Order
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto ${MIN_TABLE_HEIGHT}`}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">S.no</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Address</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Delivery Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                                {/* <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pay Status</th> */}
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                {/* <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Picker</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pick Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Packer</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pack-Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">OVERALL STATUS</th> */}
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Last Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative min-h-[100px]">
                            {loading ? (
                                <tr className="animate-pulse">
                                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DotLoading />
                                            <span>Loading orders...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No orders found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order: Order, i: number) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm  text-gray-800 dark:text-white font-bold cursor-pointer">#{order.order_id}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm font-medium text-gray-800 dark:text-white">{order.customer_name || `${order.user?.first_name} ${order.user?.last_name}` || 'N/A'}</span></td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col max-w-xs">
                                                <span className="text-sm text-gray-800 dark:text-white truncate">
                                                    {order.shipping_address || (order.address ? `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}` : 'N/A')}
                                                </span>
                                                {order.address?.shipping_phone && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {order.address.shipping_phone}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-bold text-gray-800 dark:text-white">
                                                    {order.items?.length || 0} {order.items?.length === 1 ? 'Item' : 'Items'}
                                                </span>
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">
                                                    ({order.items?.reduce((acc, item: any) => acc + (item.quantity || 1), 0) || 0} Total Qty)
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex flex-col items-start gap-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${order.payment_details?.method?.toLowerCase() === 'online'
                                                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                                        }`}>
                                                        {order.payment_details?.method || 'N/A'}
                                                    </span>

                                                </div>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusColor(order?.payment_details?.status || 'Pending')}`}>
                                                    {order.payment_details?.status || 'Pending'}
                                                </span>
                                            </div>
                                        </td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${order.payment_status?.toLowerCase() === 'paid'
                                                ? 'bg-green-50 text-green-600 border-green-100'
                                                : order.payment_status?.toLowerCase() === 'failed'
                                                    ? 'bg-red-50 text-red-600 border-red-100'
                                                    : 'bg-gray-50 text-gray-600 border-gray-100'
                                                }`}>
                                                {order.payment_status || 'Pending'}
                                            </span>
                                        </td> */}
                                        <td className="px-4 py-3 whitespace-nowrap"><span className="text-sm text-gray-600 dark:text-gray-400">&#8377;{order.total_amount}</span></td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs text-gray-800 dark:text-white font-medium">
                                                {typeof order.picker_id === 'object' && order.picker_id
                                                    ? `${order.picker_id.first_name || ''} ${order.picker_id.last_name || ''}`
                                                    : <span className="text-gray-400 italic">Unassigned</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {order.picker_id ? (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${order.picker_accepted === undefined ? 'bg-gray-100 text-gray-500' : order.picker_accepted ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    {order.picker_accepted === undefined ? 'Pending' : order.picker_accepted ? 'Accepted' : 'Rejected'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs text-gray-800 dark:text-white font-medium">
                                                {typeof order.packer_id === 'object' && order.packer_id
                                                    ? `${order.packer_id.first_name || ''} ${order.packer_id.last_name || ''}`
                                                    : <span className="text-gray-400 italic">Unassigned</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {order.packer_id ? (
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${['ready', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                                    {['ready', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'Packed' : 'Pending'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                            </span>
                                        </td> */}
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            {renderActions(order)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={orders.length}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDeleteOrder}
                title="Delete Order"
                message={deletingOrder ? (
                    <span>
                        Are you sure you want to delete Order <b className="text-gray-800 dark:text-white">#{deletingOrder._id.slice(-6).toUpperCase()}</b> for <b className="text-gray-800 dark:text-white">{deletingOrder.customer_name || 'Customer'}</b>? This action cannot be undone.
                    </span>
                ) : "Are you sure you want to delete this order?"}
                loading={isDeleteLoading}
            />

            {/* Remark Modal */}
            <OrderRemarkModal
                isOpen={remarkModalOpen}
                onClose={() => setRemarkModalOpen(false)}
                remark={remarkOrder?.order_remark || ""}
                orderId={remarkOrder?.order_id}
            />
        </div>
    );
}
