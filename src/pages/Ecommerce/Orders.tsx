import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, updateOrderStatus, Order, OrderStatus } from "../../store/slices/orderSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";

import EditOrderModal from './EditOrderModal';
export default function Orders() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, updating } = useSelector((state: RootState) => state.order);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);


    const statusOptions = ["Pending", "Ready", "Shipped", "Delivered", "Cancelled", "Returned"];

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};
        if (searchQuery) {
            filter.$or = [
                { _id: { $regex: searchQuery, $options: 'i' } },
                { customer_name: { $regex: searchQuery, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        if (selectedStatuses.length > 0) {
            filter.status = { $in: selectedStatuses.map(s => s.toLowerCase()) };
        }
        return filter;
    }, [searchQuery, startDate, endDate, selectedStatuses]);

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
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleStatusChange = (id: string, newStatus: string) => {
        dispatch(updateOrderStatus({ id, status: newStatus as OrderStatus }));
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending": return "bg-orange-100 text-orange-600";
            case "ready": return "bg-blue-100 text-blue-600";
            case "shipped": return "bg-purple-100 text-purple-600";
            case "delivered": return "bg-green-100 text-green-600";
            case "cancelled": return "bg-red-100 text-red-600";
            case "returned": return "bg-gray-100 text-gray-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const printOrder = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Customer';
        const address = order.shipping_address || 'Not available';
        const phone = order.shipping_phone || 'Not available';

        const itemsHtml = order.items?.map(item => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; font-size: 14px; color: #1f2937;">${item.product_name || item.name}</td>
                <td style="padding: 12px 0; text-align: center; font-size: 14px; color: #1f2937;">${item.quantity}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; color: #1f2937;">₹${item.price.toLocaleString()}</td>
                <td style="padding: 12px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111827;">₹${(item.price * item.quantity).toLocaleString()}</td>
            </tr>
        `).join('') || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Invoice #${order._id.slice(-8)} | Khana Fast</title>
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
                                <div class="section-title">Order Details</div>
                                <div class="text-small"><span class="text-bold">Order ID:</span> #${order._id}</div>
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
        setTimeout(() => printWindow.print(), 500);
    };

    const renderActions = (order: Order) => {
        let actions = null;
        switch (order.status) {
            case "pending":
                actions = (
                    <>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "ready")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-brand-500 rounded hover:bg-brand-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Accept
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "hold")}
                            className={`px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Hold
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "cancelled")}
                            className={`px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                    </>
                );
                break;
            case "hold":
                actions = (
                    <>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "ready")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-brand-500 rounded hover:bg-brand-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Accept
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "cancelled")}
                            className={`px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                    </>
                );
                break;
            case "ready":
                actions = (
                    <>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "shipped")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Ship
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "cancelled")}
                            className={`px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                    </>
                );
                break;
            case "shipped":
                actions = (
                    <button
                        disabled={updating}
                        onClick={() => handleStatusChange(order._id, "delivered")}
                        className={`px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Mark Delivered
                    </button>
                );
                break;
            case "delivered":
                actions = (
                    <button
                        disabled={updating}
                        onClick={() => handleStatusChange(order._id, "returned")}
                        className={`px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded hover:bg-purple-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Mark Returned
                    </button>
                );
                break;
            default:
                actions = null;
        }

        const editButton = (
            <button
                disabled={updating}
                onClick={() => {
                    setSelectedOrderForEdit(order);
                    setIsEditModalOpen(true);
                }}
                className="p-1.5 text-gray-500 hover:text-brand-500 transition-colors"
                title="Edit Order"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        );

        if (!actions) {
            return (
                <div className="flex justify-end gap-2">
                    {order.status !== 'cancelled' && order.status !== 'returned' && order.status !== 'delivered' && editButton}
                    <span className="text-xs text-gray-400 italic self-center">Not available</span>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>
                    <span className="text-xs text-gray-400 italic self-center">Not available</span>

                </div>
            );
        }

        return (
            <div className="flex items-center justify-end gap-3">

                {actions}
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

                {order.status !== 'cancelled' && order.status !== 'returned' && order.status !== 'delivered' && (
                    <>
                        {editButton}
                    </>
                )}
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
            <div className="space-y-6">
                <div className="flex flex-col gap-4">
                    <TableFilter
                        placeholder="Search by ID or Customer..."
                        onFilterChange={({ search, startDate: start, endDate: end }) => {
                            setSearchQuery(search);
                            setStartDate(start);
                            setEndDate(end);
                        }}
                    >
                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400 mb-2">Filter by Status</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {statusOptions.map((status) => (
                                    <label key={status} className="flex items-center gap-2 cursor-pointer p-1 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </TableFilter>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Orders</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">INVOICE</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">STATUS</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr className="animate-pulse">
                                        <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <DotLoading />
                                                <span>Loading orders...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentOrders.map((order: Order, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-brand-500 underline cursor-pointer">#{order._id.slice(- 8)}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-800 dark:text-white">{`${order.user?.first_name} ${order.user?.last_name}` || 'Customer'}</span></td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="flex flex-col">
                                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                                {item.name || item.product_name}
                                                            </span>
                                                            {item.brand_name && (
                                                                <span className="text-[10px] text-gray-400 font-medium">
                                                                    {item.brand_name}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">&#8377;{order.total_amount}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "-"}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {order.status === 'delivered' ? (
                                                    <button
                                                        onClick={() => printOrder(order)}
                                                        className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors inline-block"
                                                        title="Print Invoice"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Not available</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
            </div>

            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                order={selectedOrderForEdit}
            />
        </div>
    );
}
