import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

export default function Customers() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [customers] = useState([
        { name: "John Doe", email: "john@example.com", orders: 5, spent: "$1,200", status: "Active" },
        { name: "Jane Smith", email: "jane@example.com", orders: 12, spent: "$3,450", status: "Active" },
        { name: "Robert Fox", email: "robert@example.com", orders: 2, spent: "$150", status: "Inactive" },
        { name: "Alice Johnson", email: "alice@example.com", orders: 8, spent: "$2,100", status: "Active" },
        { name: "Mike Brown", email: "mike@example.com", orders: 4, spent: "$800", status: "Active" },
        { name: "Sarah Wilson", email: "sarah@example.com", orders: 15, spent: "$4,200", status: "Active" },
        { name: "David Lee", email: "david@example.com", orders: 1, spent: "$120", status: "Inactive" },
        { name: "Emily Davis", email: "emily@example.com", orders: 6, spent: "$1,500", status: "Active" },
        { name: "Michael Clark", email: "michael@example.com", orders: 3, spent: "$600", status: "Pending" },
        { name: "Jessica White", email: "jessica@example.com", orders: 9, spent: "$2,800", status: "Active" },
        { name: "Daniel Martinez", email: "daniel@example.com", orders: 7, spent: "$1,900", status: "Active" },
        { name: "Laura Lewis", email: "laura@example.com", orders: 10, spent: "$3,000", status: "Active" },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(customers.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCustomers = customers.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageMeta
                title="Customers | TailAdmin - React.js Admin Dashboard "
                description="This is the Customers page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Customers" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customer List</h3>
                    <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                        Add Customer
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Spent</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentCustomers.map((customer, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-800 dark:text-white">{customer.name}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{customer.orders}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 dark:text-gray-400">{customer.spent}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${customer.status === "Active" ? "bg-green-100 text-green-600" : customer.status === "Pending" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={customers.length}
                />
            </div>
        </div>
    );
}
