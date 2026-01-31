import { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { fetchOrders, Order } from "../../store/slices/orderSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import { ITEMS_PER_PAGE, MIN_TABLE_HEIGHT } from "../../constants/constants";
import { getStatusColor } from "../../utils/helper";

export default function Payments() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { orders, loading, error } = useSelector((state: RootState) => state.order);

    const [currentPage, setCurrentPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const buildFilter = useCallback(() => {
        const filter: any = {
            status: { $ne: 'cancelled' }
        };
        if (searchQuery) {
            filter.$or = [
                { order_id: { $regex: searchQuery, $options: "i" } },
                { customer_name: { $regex: searchQuery, $options: "i" } },
            ];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        if (selectedStatuses.length > 0) {
            filter["payment_details.status"] = { $in: selectedStatuses.map((s) => s.toLowerCase()) };
        }
        return filter;
    }, [searchQuery, startDate, endDate, selectedStatuses]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            // Fetch comprehensive data for billing and payments
            dispatch(fetchOrders({
                filter,
                select: 'payment_details order_id customer_name user createdAt status items address total_amount shipping_phone shipping_address order_remark'
            }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter]);

    const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrintInvoice = (order: Order) => {
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
        const customerName = order.customer_name || (order.user ? `${order.user.first_name} ${order.user.last_name}` : 'Customer');
        const address = order.shipping_address || (order.address ? `${order.address.address}, ${order.address.city}, ${order.address.state} ${order.address.pincode}` : 'Not available');
        const phone = order.shipping_phone || (order.address?.shipping_phone) || 'Not available';
        const invoiceId = order.order_id || order._id.slice(-8).toUpperCase();

        const itemsHtml = order.items?.map((item) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; font-size: 14px; color: #1f2937;">${item.name || item.product_name}</td>
                <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #1f2937;">${item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1f2937;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" style="padding: 12px 0; text-align: center; color: #9ca3af;">No items found</td></tr>';

        const adjustment = order.payment_details?.adjustment;
        const adjustmentHtml = adjustment && adjustment.adjustment_balance > 0 ? `
            <div class="total-row" style="color: #f97316;">
                <div>Adjustment (${adjustment.adjustment_type || 'Balance'})</div>
                <div class="text-bold">₹${adjustment.adjustment_balance.toLocaleString()}</div>
            </div>
        ` : '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Invoice #${invoiceId}</title>
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
                        
                        .footer { display: grid; grid-template-columns: 1.2fr 1.8fr; gap: 40px; }
                        .notes-section { font-size: 13px; color: #9ca3af; }
                        .totals-grid { display: flex; flex-direction: column; gap: 12px; background: #f9fafb; padding: 20px; border-radius: 12px; }
                        .total-row { display: flex; justify-content: space-between; font-size: 14px; }
                        .grand-total { border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 4px; font-size: 20px; font-weight: 700; color: #111827; }
                        
                        .payment-method { display: inline-block; padding: 4px 12px; border: 1px solid #eff6ff; background: #eff6ff; color: #2563eb; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }

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
                            <div class="invoice-label">PAYMENT RECEIPT</div>
                        </div>
                        
                        <div class="info-section">
                            <div>
                                <div class="section-title">Customer Details</div>
                                <div class="text-bold">${customerName}</div>
                                <div class="text-small">${address}</div>
                                <div class="text-small">Phone: ${phone}</div>
                            </div>
                            <div>
                                <div class="section-title">Payment Info</div>
                                <div class="text-small"><span class="text-bold">Receipt #:</span> PAY-${invoiceId}</div>
                                <div class="text-small"><span class="text-bold">Date:</span> ${date}</div>
                                <div class="text-small"><span class="text-bold">Payment Status:</span> ${order.payment_details?.status?.toUpperCase() || 'N/A'}</div>
                                <div class="payment-method">${order.payment_details?.method || 'Method N/A'}</div>
                            </div>
                        </div>

                        <table>
                            <thead>
                                <tr>
                                    <th>Item Description</th>
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
                                <div class="section-title">Authorized Payment Receipt</div>
                                <p>This document serves as an official receipt of payment for the items listed above. For any discrepancies, please contact support.</p>
                                <p style="margin-top: 20px;">© 2026 Khana Fast. All rights reserved.</p>
                            </div>
                            <div class="totals-grid">
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Subtotal Amount</div>
                                    <div class="text-bold">₹${(order.total_amount || 0).toLocaleString()}</div>
                                </div>
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Payable Amount</div>
                                    <div class="text-bold">₹${(order.payment_details?.payable_amount || 0).toLocaleString()}</div>
                                </div>
                                <div class="total-row">
                                    <div style="color: #9ca3af;">Paid Amount</div>
                                    <div class="text-bold text-green-600">₹${(order.payment_details?.paid_amount || 0).toLocaleString()}</div>
                                </div>
                                ${adjustmentHtml}
                                <div class="total-row grand-total">
                                    <div>Net Payment</div>
                                    <div>₹${(order.payment_details?.paid_amount || 0).toLocaleString()}</div>
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

    return (
        <div>
            <PageMeta
                title="Payments | Khana Fast"
                description="Manage your payments in the Khana Fast Admin Dashboard"
            />
            <PageBreadcrumb pageTitle="Payments" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white tracking-wide">
                        Payment Transactions
                    </h3>
                    <div className="w-full xl:w-auto flex items-center justify-end gap-3 flex-wrap">
                        <TableFilter
                            placeholder="Search Order ID or Customer..."
                            onFilterChange={({ search, startDate: start, endDate: end }) => {
                                setSearchQuery(search);
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            className="mb-0"
                        >
                            <div className="relative" ref={filterRef}>
                                <button
                                    className={`flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-theme-xs transition-all hover:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${selectedStatuses.length > 0 ? 'border-brand-500 ring-3 ring-brand-500/10' : ''}`}
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    <span className={`w-26 ${selectedStatuses.length > 0 ? 'text-brand-600' : 'text-gray-500'}`}>
                                        {selectedStatuses.length > 0 ? `${selectedStatuses.length} Status Filters` : 'Payment Status'}
                                    </span>
                                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {isFilterOpen && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 animate-fadeIn">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between mb-2">
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
                                            <div className="space-y-2">
                                                {["Pending", "Paid", "Failed", "Refunded"].map((status) => (
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
                                                        <span className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                                            {status}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TableFilter>
                    </div>
                </div>

                <div className={`overflow-x-auto ${MIN_TABLE_HEIGHT}`}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">S.no</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Method</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Payable</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Paid</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Adjustment</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative min-h-[100px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DotLoading />
                                            <span>Loading payment data...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-red-500 h-[400px]">
                                        <p>Error: {error}</p>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No payment records found</p>
                                    </td>
                                </tr>
                            ) : (
                                currentOrders.map((order: Order, i: number) => (
                                    <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-800 dark:text-white font-bold">#{order.order_id}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                {order.customer_name || (order.user ? `${order.user.first_name} ${order.user.last_name}` : 'N/A')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${order.payment_details?.method?.toLowerCase() === 'online'
                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}>
                                                {order.payment_details?.method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${getStatusColor(order.payment_details?.status || 'Pending')}`}>
                                                {order.payment_details?.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <span className="text-sm text-gray-800 dark:text-white font-medium">₹{order.payment_details?.payable_amount || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <span className="text-sm text-green-600 font-medium">₹{order.payment_details?.paid_amount || 0}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-medium ${(order.payment_details?.adjustment?.adjustment_balance || 0) > 0 ? 'text-orange-600' : 'text-gray-400'
                                                    }`}>
                                                    ₹{order.payment_details?.adjustment?.adjustment_balance || 0}
                                                </span>
                                                {order.payment_details?.adjustment?.adjustment_type && (
                                                    <span className="text-[10px] text-gray-400 uppercase">{order.payment_details.adjustment.adjustment_type}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handlePrintInvoice(order)}
                                                    className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"
                                                    title="Print Payment Invoice"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/orders/view/${order._id}`)}
                                                    className="p-1.5 text-gray-500 hover:text-green-500 bg-white border border-gray-200 rounded-lg hover:border-green-200 transition-all shadow-sm"
                                                    title="View Order Details"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
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
        </div>
    );
}
