import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

interface Transaction {
    id: string;
    customer: string;
    date: string;
    amount: string;
    method: string;
    status: "Paid" | "Pending" | "Failed";
}

export default function Pay() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [transactions] = useState<Transaction[]>([
        { id: "#TRX-8547", customer: "John Doe", date: "Jan 12, 2024", amount: "$120.00", method: "Credit Card", status: "Paid" },
        { id: "#TRX-8548", customer: "Jane Smith", date: "Jan 13, 2024", amount: "$240.00", method: "PayPal", status: "Paid" },
        { id: "#TRX-8549", customer: "Robert Fox", date: "Jan 14, 2024", amount: "$89.50", method: "Credit Card", status: "Pending" },
        { id: "#TRX-8550", customer: "Alice Johnson", date: "Jan 15, 2024", amount: "$150.00", method: "Apple Pay", status: "Failed" },
        { id: "#TRX-8551", customer: "Mike Brown", date: "Jan 16, 2024", amount: "$200.00", method: "Google Pay", status: "Paid" },
        { id: "#TRX-8552", customer: "Sarah Wilson", date: "Jan 17, 2024", amount: "$300.00", method: "Credit Card", status: "Paid" },
        { id: "#TRX-8553", customer: "David Lee", date: "Jan 18, 2024", amount: "$450.00", method: "PayPal", status: "Paid" },
        { id: "#TRX-8554", customer: "Emily Davis", date: "Jan 19, 2024", amount: "$50.00", method: "Credit Card", status: "Paid" },
        { id: "#TRX-8555", customer: "Michael Clark", date: "Jan 20, 2024", amount: "$120.00", method: "Credit Card", status: "Pending" },
        { id: "#TRX-8556", customer: "Jessica White", date: "Jan 21, 2024", amount: "$330.00", method: "Apple Pay", status: "Paid" },
        { id: "#TRX-8557", customer: "Daniel Martinez", date: "Jan 22, 2024", amount: "$90.00", method: "PayPal", status: "Paid" },
        { id: "#TRX-8558", customer: "Laura Lewis", date: "Jan 23, 2024", amount: "$110.00", method: "Credit Card", status: "Paid" },
        { id: "#TRX-8559", customer: "James Wilson", date: "Jan 24, 2024", amount: "$210.00", method: "Google Pay", status: "Failed" },
        { id: "#TRX-8560", customer: "Linda Brown", date: "Jan 25, 2024", amount: "$180.00", method: "Credit Card", status: "Paid" },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = transactions.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageMeta
                title="Payments | TailAdmin - React.js Admin Dashboard"
                description="This is the Payments page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Payments / Transactions" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Transaction History
                    </h3>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors">
                            Export
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Invoice ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Method
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentTransactions.map((trx, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-brand-500 underline cursor-pointer">
                                            {trx.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {trx.customer}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {trx.date}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {trx.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">{trx.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-semibold rounded-full ${trx.status === "Paid"
                                                    ? "bg-green-100 text-green-600"
                                                    : trx.status === "Pending"
                                                        ? "bg-orange-100 text-orange-600"
                                                        : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {trx.status}
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
                    totalResults={transactions.length}
                />
            </div>
        </div>
    );
}
