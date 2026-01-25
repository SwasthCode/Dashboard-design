import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";

interface Transaction {
    id: string;
    customer: string;
    date: string;
    amount: string;
    method: string;
    status: "Paid" | "Pending" | "Failed";
    createdAt?: string;
    updatedAt?: string;
}

export default function Pay() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [transactions] = useState<Transaction[]>([
        { id: "#TRX-8547", customer: "John Doe", date: "Jan 12, 2024", amount: "$120.00", method: "Credit Card", status: "Paid", createdAt: "2024-01-12", updatedAt: "2024-01-12" },
        { id: "#TRX-8548", customer: "Jane Smith", date: "Jan 13, 2024", amount: "$240.00", method: "PayPal", status: "Paid", createdAt: "2024-01-13", updatedAt: "2024-01-13" },
        { id: "#TRX-8549", customer: "Robert Fox", date: "Jan 14, 2024", amount: "$89.50", method: "Credit Card", status: "Pending", createdAt: "2024-01-14", updatedAt: "2024-01-14" },
        { id: "#TRX-8550", customer: "Alice Johnson", date: "Jan 15, 2024", amount: "$150.00", method: "Apple Pay", status: "Failed", createdAt: "2024-01-15", updatedAt: "2024-01-15" },
        { id: "#TRX-8551", customer: "Mike Brown", date: "Jan 16, 2024", amount: "$200.00", method: "Google Pay", status: "Paid", createdAt: "2024-01-16", updatedAt: "2024-01-16" },
        { id: "#TRX-8552", customer: "Sarah Wilson", date: "Jan 17, 2024", amount: "$300.00", method: "Credit Card", status: "Paid", createdAt: "2024-01-17", updatedAt: "2024-01-17" },
        { id: "#TRX-8553", customer: "David Lee", date: "Jan 18, 2024", amount: "$450.00", method: "PayPal", status: "Paid", createdAt: "2024-01-18", updatedAt: "2024-01-18" },
        { id: "#TRX-8554", customer: "Emily Davis", date: "Jan 19, 2024", amount: "$50.00", method: "Credit Card", status: "Paid", createdAt: "2024-01-19", updatedAt: "2024-01-19" },
        { id: "#TRX-8555", customer: "Michael Clark", date: "Jan 20, 2024", amount: "$120.00", method: "Credit Card", status: "Pending", createdAt: "2024-01-20", updatedAt: "2024-01-20" },
        { id: "#TRX-8556", customer: "Jessica White", date: "Jan 21, 2024", amount: "$330.00", method: "Apple Pay", status: "Paid", createdAt: "2024-01-21", updatedAt: "2024-01-21" },
        { id: "#TRX-8557", customer: "Daniel Martinez", date: "Jan 22, 2024", amount: "$90.00", method: "PayPal", status: "Paid", createdAt: "2024-01-22", updatedAt: "2024-01-22" },
        { id: "#TRX-8558", customer: "Laura Lewis", date: "Jan 23, 2024", amount: "$110.00", method: "Credit Card", status: "Paid", createdAt: "2024-01-23", updatedAt: "2024-01-23" },
        { id: "#TRX-8559", customer: "James Wilson", date: "Jan 24, 2024", amount: "$210.00", method: "Google Pay", status: "Failed", createdAt: "2024-01-24", updatedAt: "2024-01-24" },
        { id: "#TRX-8560", customer: "Linda Brown", date: "Jan 25, 2024", amount: "$180.00", method: "Credit Card", status: "Paid", createdAt: "2024-01-25", updatedAt: "2024-01-25" },
    ]);

    const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);

    const handleFilterChange = ({ search, startDate, endDate }: any) => {
        let result = transactions;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(trx =>
                trx.id.toLowerCase().includes(lowerSearch) ||
                trx.customer.toLowerCase().includes(lowerSearch) ||
                trx.method.toLowerCase().includes(lowerSearch)
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(trx => {
                if (!trx.createdAt) return true;
                const date = new Date(trx.createdAt);
                return date >= start && date <= end;
            });
        }

        setFilteredTransactions(result);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

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

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Transactions..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <div className="flex gap-2 mt-1">
                        <button className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors whitespace-nowrap">
                            Export
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Transaction History
                    </h3>
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
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
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
                                        <span className="text-sm font-medium text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded border border-brand-100 dark:border-brand-500/20 font-mono">
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
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {trx.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                            {trx.method}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${trx.status === "Paid"
                                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                : trx.status === "Pending"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                                    : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                                }`}
                                        >
                                            {trx.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {trx.createdAt}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {trx.updatedAt}
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
                    totalResults={filteredTransactions.length}
                />
            </div>
        </div>
    );
}
