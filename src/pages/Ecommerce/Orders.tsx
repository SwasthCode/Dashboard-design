import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import DatePicker from "../../components/form/date-picker";
import { FilterIcon } from "../../icons";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";

export default function Orders() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const orders = [
        { id: "#12345", customer: "John Doe", date: "Jan 12, 2024", price: "$120.00", status: "Delivered" },
        { id: "#12346", customer: "Jane Smith", date: "Jan 13, 2024", price: "$240.00", status: "Pending" },
        { id: "#12347", customer: "Robert Fox", date: "Jan 14, 2024", price: "$89.50", status: "Shipped" },
        { id: "#12348", customer: "Alice Johnson", date: "Jan 15, 2024", price: "$150.00", status: "Cancelled" },
        { id: "#12349", customer: "Mike Brown", date: "Jan 16, 2024", price: "$200.00", status: "Returned" },
        { id: "#12350", customer: "Sarah Wilson", date: "Jan 17, 2024", price: "$300.00", status: "Ready" },
    ];

    const statusOptions = ["Pending", "Ready", "Shipped", "Delivered", "Cancelled", "Returned"];

    const handleDateChange = (_dates: Date[], dateStr: string) => {
        setSelectedDate(dateStr);
    };

    const toggleStatus = (status: string) => {
        setSelectedStatuses(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = selectedStatuses.length > 0 ? selectedStatuses.includes(order.status) : true;

        let matchesDate = true;
        if (selectedDate) {
            const orderDate = new Date(order.date).toDateString();
            const filterDate = new Date(selectedDate).toDateString();
            matchesDate = orderDate === filterDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div>
            <PageMeta
                title="Orders | TailAdmin - React.js Admin Dashboard"
                description="This is the Orders page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Orders" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 max-w-md relative">
                        <Input
                            placeholder="Search by ID or Customer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                        <DatePicker
                            id="order-date-picker"
                            placeholder="Filter by Date"
                            onChange={handleDateChange}
                        />

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
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order, i) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-brand-500 underline cursor-pointer">{order.id}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-800 dark:text-white">{order.customer}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{order.date}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{order.price}</span></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-600" :
                                                    order.status === "Pending" ? "bg-orange-100 text-orange-600" :
                                                        order.status === "Shipped" ? "bg-blue-100 text-blue-600" :
                                                            order.status === "Cancelled" ? "bg-red-100 text-red-600" :
                                                                order.status === "Returned" ? "bg-purple-100 text-purple-600" :
                                                                    "bg-gray-100 text-gray-600"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No orders found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
