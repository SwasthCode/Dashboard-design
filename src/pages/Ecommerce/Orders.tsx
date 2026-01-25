import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { FilterIcon, CloseIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import Pagination from "../../components/common/Pagination";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchOrders, updateOrderStatus, OrderStatus, Order } from "../../store/slices/orderSlice";

export default function Orders() {
    const dispatch = useDispatch<AppDispatch>();
    const { orders, loading, updating } = useSelector((state: RootState) => state.order);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    const statusOptions: OrderStatus[] = ["pending", "hold", "ready", "shipped", "delivered", "cancelled", "returned"];

    const handleDateChange = (_dates: Date[], dateStr: string) => {
        setSelectedDate(dateStr);
        setCurrentPage(1); // Reset page on filter change
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
        setCurrentPage(1); // Reset page on filter change
    };

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const filteredOrders = orders.filter((order: Order) => {
        const matchesSearch =
            (order._id && order._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.user?.first_name && order.user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (order.user?.last_name && order.user.last_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus = selectedStatuses.length > 0 ? selectedStatuses.includes(order.status) : true;

        let matchesDate = true;
        if (selectedDate) {
            const orderDate = new Date(order.createdAt).toDateString();
            const filterDate = new Date(selectedDate).toDateString();
            matchesDate = orderDate === filterDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination Logic on Filtered Orders
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "delivered": return "bg-green-100 text-green-600";
            case "pending": return "bg-orange-100 text-orange-600";
            case "shipped": return "bg-blue-100 text-blue-600";
            case "cancelled": return "bg-red-100 text-red-600";
            case "returned": return "bg-purple-100 text-purple-600";
            case "hold": return "bg-yellow-100 text-yellow-600";
            case "ready": return "bg-teal-100 text-teal-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const printOrder = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const date = new Date(order.createdAt).toLocaleDateString();
        const customerName = order.user ? `${order.user.first_name} ${order.user.last_name}` : order.customer_name || 'Customer';

        const itemsHtml = order.items?.map(item => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${item.product_name}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">₹${item.price}</td>
                <td style="padding: 10px; text-align: right;">₹${item.price * item.quantity}</td>
            </tr>
        `).join('') || '';

        printWindow.document.write(`
            <html>
                <head>
                    <title>Order Invoice #${order._id.slice(-8)}</title>
                    <style>
                        body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
                        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
                        .logo { font-size: 24px; font-weight: bold; color: #0aad0a; }
                        .invoice-title { font-size: 32px; font-weight: bold; color: #111; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                        .label { color: #888; font-size: 14px; margin-bottom: 5px; }
                        .value { font-size: 16px; font-weight: 600; }
                        table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                        th { text-align: left; padding: 10px; background: #f9f9f9; color: #666; font-size: 14px; }
                        .total-section { display: flex; justify-content: flex-end; }
                        .total-row { display: flex; justify-content: space-between; width: 250px; padding: 5px 0; }
                        .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #eee; padding-top: 10px; margin-top: 10px; }
                        .status-badge { display: inline-block; padding: 5px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; background: #f3f4f6; color: #374151; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <div class="logo">Blinkit</div>
                        <div class="invoice-title">INVOICE</div>
                    </div>
                    
                    <div class="info-grid">
                        <div>
                            <div style="margin-bottom: 20px;">
                                <div class="label">BILLED TO</div>
                                <div class="value">${customerName}</div>
                            </div>
                            <div>
                                <div class="label">ORDER ID</div>
                                <div class="value">#${order._id}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="margin-bottom: 20px;">
                                <div class="label">DATE</div>
                                <div class="value">${date}</div>
                            </div>
                            <div>
                                <div class="label">STATUS</div>
                                <span class="status-badge">${order.status}</span>
                            </div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ITEM</th>
                                <th style="text-align: center;">QTY</th>
                                <th style="text-align: right;">PRICE</th>
                                <th style="text-align: right;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div>
                            <div class="total-row grand-total">
                                <div>TOTAL AMOUNT</div>
                                <div>₹${order.total_amount}</div>
                            </div>
                        </div>
                    </div>

                    <div style="margin-top: 60px; text-align: center; color: #888; font-size: 14px;">
                        <p>Thank you for shopping with us!</p>
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

        return (
            <div className="flex items-center justify-end gap-2">
                {actions}
            </div>
        );
    };

    return (
        <div>
            <PageMeta
                title="Orders | Admin Dashboard"
                description="Manage your orders in the Admin Dashboard"
            />
            <PageBreadcrumb pageTitle="Orders" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 max-w-md relative">
                        <Input
                            placeholder="Search by ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1); // Reset page on search
                            }}
                            className="pl-11"
                        />
                        <svg
                            className="absolute top-1/2 left-4 -translate-y-1/2 fill-gray-500 dark:fill-gray-400"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.04199 9.37363C3.04199 5.87611 5.87736 3.04074 9.37488 3.04074C12.8724 3.04074 15.7078 5.87611 15.7078 9.37363C15.7078 11.1226 14.9984 12.6891 13.8596 13.7997L16.6548 16.5949C16.9477 16.8878 16.9477 17.3627 16.6548 17.6556C16.3619 17.9485 15.8871 17.9485 15.5942 17.6556L12.799 14.8604C11.6883 15.9991 10.1219 16.7065 8.37289 16.7065C4.87537 16.7065 2.04001 13.8711 2.04001 10.3736C2.04001 10.1983 2.04786 10.0247 2.06328 9.85322C2.04786 9.69976 2.04001 9.5375 2.04001 9.37363ZM9.37488 4.54074C6.70585 4.54074 4.54199 6.7046 4.54199 9.37363C4.54199 12.0427 6.70585 14.2065 9.37488 14.2065C12.0439 14.2065 14.2078 12.0427 14.2078 9.37363C14.2078 6.7046 12.0439 4.54074 9.37488 4.54074Z"
                                fill=""
                            />
                        </svg>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <DatePicker
                                key={selectedDate || "reset"}
                                id="order-date-picker"
                                placeholder="Filter by Date"
                                onChange={handleDateChange}
                            />
                            {selectedDate && (
                                <button
                                    className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 z-10"
                                    onClick={() => setSelectedDate("")}
                                    title="Clear Date"
                                >
                                    <CloseIcon className="size-4" />
                                </button>
                            )}
                        </div>

                        <div className="relative dropdown-toggle">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center justify-center w-11 h-11 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
                            >
                                <FilterIcon className="size-5" />
                            </button>
                            <Dropdown
                                isOpen={isFilterOpen}
                                onClose={() => setIsFilterOpen(false)}
                                className="absolute right-0 mt-2 w-48 p-3"
                            >
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400 mb-2">Filter by Status</h4>
                                    {statusOptions.map((status) => (
                                        <label key={status} className="flex items-center gap-2 cursor-pointer p-1 rounded-sm hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700"
                                                checked={selectedStatuses.includes(status)}
                                                onChange={() => toggleStatus(status)}
                                            />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            </Dropdown>
                        </div>
                    </div>
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
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                {/* Dot Loading */}
                                                <div className="flex space-x-1 text-brand-500 text-xl font-bold">
                                                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                                                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                                                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                                                </div>
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
                                                        <span key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                                                            {item.name || item.product_name} <span className="text-xs text-gray-400">x{item.quantity}</span>
                                                        </span>
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
                        totalResults={filteredOrders.length}
                    />
                </div>
            </div>
        </div>
    );
}
