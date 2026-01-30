import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Fintech() {
    return (
        <div>
            <PageMeta
                title="Fintech | TailAdmin - React.js Admin Dashboard"
                description="This is the Fintech page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Fintech" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Wallet Balance */}
                <div className="lg:col-span-2 bg-brand-500 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-brand-100 text-sm font-medium opacity-80 uppercase tracking-widest">Total Balance</p>
                        <h2 className="text-4xl font-bold mt-2">$245,670.80</h2>
                        <div className="mt-12 flex gap-8">
                            <div>
                                <p className="text-xs text-brand-100 opacity-60 uppercase mb-1">Income</p>
                                <p className="text-lg font-bold">+$12,400</p>
                            </div>
                            <div>
                                <p className="text-xs text-brand-100 opacity-60 uppercase mb-1">Expenses</p>
                                <p className="text-lg font-bold">-$3,240</p>
                            </div>
                        </div>
                    </div>
                    {/* Abstract Circle Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Transfer", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m4-4l-4-4" },
                            { label: "Request", icon: "M19 14l-7 7m0 0l-7-7m7 7V3" },
                            { label: "Cards", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
                            { label: "History", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
                        ].map((action, i) => (
                            <button key={i} className="flex flex-col items-center justify-center p-4 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <svg className="w-6 h-6 text-brand-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} /></svg>
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {[
                            { name: "Apple Service", date: "Jan 12, 2024", amount: "-$14.99", type: "Expense" },
                            { name: "Stripe Payout", date: "Jan 10, 2024", amount: "+$2,500.00", type: "Income" },
                            { name: "Amazon US", date: "Jan 08, 2024", amount: "-$240.50", type: "Expense" },
                        ].map((tx, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === "Income" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                        }`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tx.type === "Income" ? "M12 4v16m8-8H4" : "M20 12H4"} /></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{tx.name}</p>
                                        <p className="text-xs text-gray-400">{tx.date}</p>
                                    </div>
                                </div>
                                <p className={`font-bold ${tx.type === "Income" ? "text-green-500" : "text-gray-800 dark:text-white"}`}>{tx.amount}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
