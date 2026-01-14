import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Pay() {
    return (
        <div>
            <PageMeta
                title="Pay | TailAdmin - React.js Admin Dashboard"
                description="This is the Pay page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Checkout" />
            <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-10">
                <div className="flex-1 space-y-8">
                    {/* Shipping Info */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Shipping Information</h3>
                        <form className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">First Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500/20" placeholder="John" />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Last Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500/20" placeholder="Doe" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase">Street Address</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-brand-500/20" placeholder="123 Luxury St, Beverly Hills" />
                            </div>
                        </form>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {["Credit Card", "PayPal", "Apple Pay", "Google Pay"].map((method, i) => (
                                <div key={i} className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${i === 0 ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/5" : "border-gray-100 dark:border-gray-800 hover:border-gray-300"
                                    }`}>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{method}</span>
                                    <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? "border-brand-500 bg-brand-500 shadow-[0_0_0_2px_white_inset]" : "border-gray-300"}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Aside */}
                <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 sticky top-24">
                        <h3 className="text-lg font-bold mb-6 text-gray-800 dark:text-white">Your Order</h3>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">3 Items</span>
                                <span className="font-bold">$582.12</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 font-medium">Promo Code</span>
                                <span className="text-gray-400">None</span>
                            </div>
                        </div>
                        <button className="w-full bg-brand-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand-500/30 hover:scale-[1.02] active:scale-100 transition-all">
                            Pay Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
