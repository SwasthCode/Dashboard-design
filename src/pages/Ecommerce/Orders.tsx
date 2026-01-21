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

    const statusOptions: OrderStatus[] = ["Pending", "Hold", "Ready", "Shipped", "Delivered", "Cancelled", "Returned"];

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
            (order.user_id && order.user_id.toLowerCase().includes(searchQuery.toLowerCase()));

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
            case "Delivered": return "bg-green-100 text-green-600";
            case "Pending": return "bg-orange-100 text-orange-600";
            case "Shipped": return "bg-blue-100 text-blue-600";
            case "Cancelled": return "bg-red-100 text-red-600";
            case "Returned": return "bg-purple-100 text-purple-600";
            case "Hold": return "bg-yellow-100 text-yellow-600";
            case "Ready": return "bg-teal-100 text-teal-600";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    const renderActions = (order: Order) => {
        switch (order.status) {
            case "Pending":
                return (
                    <div className="flex gap-2">
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Ready")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-brand-500 rounded hover:bg-brand-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Accept
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Hold")}
                            className={`px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Hold
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Cancelled")}
                            className={`px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                    </div>
                );
            case "Hold":
                return (
                    <div className="flex gap-2">
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Ready")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-brand-500 rounded hover:bg-brand-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Accept
                        </button>
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Cancelled")}
                            className={`px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Cancel
                        </button>
                    </div>
                );
            case "Ready":
                return (
                    <div className="flex gap-2">
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Shipped")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Slip
                        </button>
                    </div>
                );
            case "Shipped":
                return (
                    <div className="flex gap-2">
                        <button
                            disabled={updating}
                            onClick={() => handleStatusChange(order._id, "Delivered")}
                            className={`px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Mark Delivered
                        </button>
                    </div>
                );
            case "Delivered":
                return (
                    <button
                        disabled={updating}
                        onClick={() => handleStatusChange(order._id, "Returned")}
                        className={`px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded hover:bg-purple-200 ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Mark Returned
                    </button>
                );
            default:
                return <span className="text-xs text-gray-400">No actions</span>;
        }
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
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">STATUS</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading orders...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    currentOrders.map((order: Order, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-brand-500 underline cursor-pointer">#{order._id.substring(0, 8)}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-800 dark:text-white">{order.customer_name || 'Customer'}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">&#8377;{order.total_price}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
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
