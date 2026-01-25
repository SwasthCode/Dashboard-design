import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";

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

    const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>(invoices);

    const handleFilterChange = ({ search, startDate, endDate }: any) => {
        let result = invoices;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(inv =>
                inv.client.toLowerCase().includes(lowerSearch) ||
                inv.id.toLowerCase().includes(lowerSearch) ||
                inv.email.toLowerCase().includes(lowerSearch)
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(inv => {
                if (!inv.updatedAt) return true;
                const date = new Date(inv.updatedAt);
                return date >= start && date <= end;
            });
        }

        setFilteredInvoices(result);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

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

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Invoices..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <button className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors whitespace-nowrap mt-1">
                        Create Invoice
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Invoice List
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
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.status === "Paid"
                                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                : invoice.status === "Unpaid"
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                                                    : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                                                }`}
                                        >
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {invoice.updatedAt}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button className="text-brand-500 hover:text-brand-700">
                                                Edit
                                            </button>
                                            <button className="text-red-500 hover:text-red-700">
                                                Delete
                                            </button>
                                        </div>
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
                    totalResults={filteredInvoices.length}
                />
            </div>
        </div>
    );
}
