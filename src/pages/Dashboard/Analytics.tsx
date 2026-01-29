import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Analytics() {
    return (
        <div>
            <PageMeta
                title="Analytics | TailAdmin - React.js Admin Dashboard"
                description="This is the Analytics page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Analytics" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {[
                    { label: "Visits", value: "45.2k", change: "+12.5%", color: "text-brand-500" },
                    { label: "Sessions", value: "12.8k", change: "+4.2%", color: "text-blue-500" },
                    { label: "Bounce Rate", value: "32.1%", change: "-2.1%", color: "text-red-500" },
                    { label: "Duration", value: "4m 24s", change: "+31s", color: "text-green-500" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
                        <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stat.value}</h3>
                        <p className={`text-xs mt-2 font-semibold ${stat.color}`}>{stat.change} <span className="text-gray-400 font-normal ml-1">vs last month</span></p>
                    </div>
                ))}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-white">Detailed Traffic Analysis</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Charts and graphs will be rendered here.</p>
                </div>
            </div>
        </div>
    );
}
