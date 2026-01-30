import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Campaigns() {
    return (
        <div>
            <PageMeta
                title="Campaigns | Khana Fast "
                description="This is the Campaigns page for   Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Marketing Campaigns" />
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-8">Performance Snapshot</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { label: "Total Reach", value: "854k+", color: "bg-purple-100 text-purple-600" },
                            { label: "Conversions", value: "12,400", color: "bg-blue-100 text-blue-600" },
                            { label: "Total Spend", value: "$45,200", color: "bg-green-100 text-green-600" },
                        ].map((c, i) => (
                            <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${c.color}`}>
                                    #
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
                                    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{c.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-8">Recent Active Campaigns</h3>
                    <div className="space-y-4">
                        {[
                            { name: "Winter Collection Launch", status: "Active", progress: "80%" },
                            { name: "Global SEO Overhaul", status: "Active", progress: "45%" },
                            { name: "Influencer Outreach Beta", status: "Pending", progress: "0%" },
                        ].map((camp, i) => (
                            <div key={i} className="p-6 border border-gray-100 dark:border-gray-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800 dark:text-white">{camp.name}</h4>
                                    <div className="flex items-center gap-4 mt-2">
                                        <div className="flex-1 max-w-xs bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-brand-500 h-full" style={{ width: camp.progress }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{camp.progress}</span>
                                    </div>
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${camp.status === "Active" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"
                                    }`}>{camp.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
