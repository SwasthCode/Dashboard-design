import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Finance() {
    return (
        <div>
            <PageMeta
                title="Finance | TailAdmin - React.js Admin Dashboard"
                description="This is the Finance page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Finance" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Expenses Summary */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Monthly Expenses</h3>
                        <select className="bg-gray-50 dark:bg-gray-800 border-none rounded-lg text-sm font-bold text-gray-500">
                            <option>Jan 2024</option>
                            <option>Dec 2023</option>
                        </select>
                    </div>
                    <div className="space-y-6">
                        {[
                            { label: "Business", amount: "$3,450.00", color: "bg-brand-500", width: "w-3/4" },
                            { label: "Lifestyle", amount: "$1,200.00", color: "bg-orange-500", width: "w-1/4" },
                            { label: "Entertainment", amount: "$800.00", color: "bg-blue-500", width: "w-1/5" },
                        ].map((item, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-500">{item.label}</span>
                                    <span className="text-gray-800 dark:text-white">{item.amount}</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden">
                                    <div className={`${item.color} h-full ${item.width}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Accounts */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8">My Accounts</h3>
                    <div className="space-y-4">
                        {[
                            { name: "Visa Gold Card", balance: "$12,450.00", status: "Active" },
                            { name: "Business Checking", balance: "$45,200.00", status: "Active" },
                        ].map((acc, i) => (
                            <div key={i} className="p-6 border border-gray-100 dark:border-gray-800 rounded-2xl flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{acc.name}</p>
                                        <p className="text-xl font-bold text-brand-500 mt-1">{acc.balance}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-green-500 uppercase tracking-widest">{acc.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
