import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Tasks() {
    return (
        <div>
            <PageMeta
                title="Tasks | TailAdmin - React.js Admin Dashboard"
                description="This is the Tasks page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Tasks" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { title: "To Do", count: 4, tasks: ["Design Dashboard UI", "Setup API Endpoints"] },
                    { title: "In Progress", count: 2, tasks: ["Sidebar Redesign", "E-Commerce Implementation"] },
                    { title: "Completed", count: 12, tasks: ["User Auth Logic", "Messages Page"] },
                ].map((column, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800/60 min-h-[500px]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                {column.title}
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-[10px] rounded text-gray-500 font-mono">{column.count}</span>
                            </h3>
                            <button className="text-gray-400 hover:text-brand-500 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {column.tasks.map((task, ti) => (
                                <div key={ti} className="bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-grab group">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{task}</p>
                                    <div className="mt-6 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {[1, 2].map(i => <div key={i} className="w-6 h-6 rounded-full bg-brand-200 border-2 border-white dark:border-gray-900"></div>)}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-brand-500 transition-colors">Feb 02</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
