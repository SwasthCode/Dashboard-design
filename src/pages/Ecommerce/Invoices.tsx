import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Invoices() {
    return (
        <div>
            <PageMeta
                title="Invoices | TailAdmin - React.js Admin Dashboard"
                description="This is the Invoices page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Invoices" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { id: "INV-2024-001", client: "Acme Corp", amount: "$3,400.00", due: "Feb 05, 2024", status: "Paid" },
                    { id: "INV-2024-002", client: "Global Tech", amount: "$1,200.00", due: "Feb 12, 2024", status: "Unpaid" },
                    { id: "INV-2024-003", client: "Soft Solutions", amount: "$500.00", due: "Feb 01, 2024", status: "Overdue" },
                ].map((invoice, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">{invoice.id}</p>
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{invoice.client}</h4>
                            </div>
                            <span className={`px-2 py-1 text-[10px] font-semibold rounded-full ${invoice.status === "Paid" ? "bg-green-100 text-green-600" :
                                    invoice.status === "Unpaid" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"
                                }`}>
                                {invoice.status}
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-gray-400">Amount Due</p>
                                <p className="text-xl font-bold text-gray-800 dark:text-white">{invoice.amount}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">Due Date</p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{invoice.due}</p>
                            </div>
                        </div>
                        <button className="w-full border border-gray-200 dark:border-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
