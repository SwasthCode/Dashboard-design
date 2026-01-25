import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

interface Invoice {
    id: string;
    client: string;
    email: string;
    amount: string;
    date: string;
    dueDate: string;
    status: "Paid" | "Unpaid" | "Overdue";
    updatedAt?: string;
}

export default function Invoices() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const [invoices] = useState<Invoice[]>([
        { id: "INV-001", client: "Acme Corp", email: "contact@acme.com", amount: "$3,400.00", date: "Jan 10, 2024", dueDate: "Feb 10, 2024", status: "Paid", updatedAt: "2024-01-10" },
        { id: "INV-002", client: "Global Tech", email: "info@globaltech.com", amount: "$1,200.00", date: "Jan 12, 2024", dueDate: "Feb 12, 2024", status: "Unpaid", updatedAt: "2024-01-12" },
        { id: "INV-003", client: "Soft Solutions", email: "support@softsol.com", amount: "$500.00", date: "Jan 15, 2024", dueDate: "Jan 25, 2024", status: "Overdue", updatedAt: "2024-01-20" },
        { id: "INV-004", client: "Alpha Inc", email: "billing@alpha.com", amount: "$2,100.00", date: "Jan 18, 2024", dueDate: "Feb 18, 2024", status: "Paid", updatedAt: "2024-01-18" },
        { id: "INV-005", client: "Beta Ltd", email: "fin@beta.com", amount: "$900.00", date: "Jan 20, 2024", dueDate: "Feb 20, 2024", status: "Unpaid", updatedAt: "2024-01-20" },
        { id: "INV-006", client: "Gamma Co", email: "acc@gamma.com", amount: "$4,500.00", date: "Jan 22, 2024", dueDate: "Feb 22, 2024", status: "Paid", updatedAt: "2024-01-22" },
        { id: "INV-007", client: "Delta LLC", email: "pay@delta.com", amount: "$1,200.00", date: "Jan 25, 2024", dueDate: "Feb 25, 2024", status: "Paid", updatedAt: "2024-01-25" },
        { id: "INV-008", client: "Epsilon Group", email: "info@epsilon.com", amount: "$3,000.00", date: "Jan 28, 2024", dueDate: "Feb 28, 2024", status: "Unpaid", updatedAt: "2024-01-28" },
        { id: "INV-009", client: "Zeta Ind", email: "bill@zeta.com", amount: "$750.00", date: "Jan 30, 2024", dueDate: "Mar 01, 2024", status: "Overdue", updatedAt: "2024-02-15" },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(invoices.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = invoices.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageMeta
                title="Invoices | TailAdmin - React.js Admin Dashboard"
                description="This is the Invoices page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Invoices" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Invoice List
                    </h3>
                    <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                        Create Invoice
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Invoice ID
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Client
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Amount
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Issued Date
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Due Date
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentInvoices.map((invoice, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-brand-500 underline cursor-pointer">
                                            {invoice.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                {invoice.client}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {invoice.email}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {invoice.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.date}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.dueDate}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-semibold rounded-full ${invoice.status === "Paid"
                                                ? "bg-green-100 text-green-600"
                                                : invoice.status === "Unpaid"
                                                    ? "bg-orange-100 text-orange-600"
                                                    : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button className="text-gray-500 hover:text-brand-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
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
                    totalResults={invoices.length}
                />
            </div>
        </div>
    );
}
