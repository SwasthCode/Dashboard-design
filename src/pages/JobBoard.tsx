import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function JobBoard() {
    return (
        <div>
            <PageMeta
                title="Job Board | TailAdmin - React.js Admin Dashboard"
                description="This is the Job Board page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Job Board" />
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Active Listings</h3>
                        <div className="flex gap-2">
                            {["Full-time", "Remote", "Freelance"].map((tag, i) => (
                                <span key={i} className="px-4 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full text-xs font-bold text-gray-500 hover:bg-brand-500 hover:text-white transition-all cursor-pointer">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: "Senior UI/UX Designer", company: "Meta", salary: "$120k - $150k", deadline: "Exp in 2 Days" },
                            { title: "Frontend Developer (React)", company: "Google", salary: "$140k - $170k", deadline: "Exp in 5 Days" },
                            { title: "Product Marketing Manager", company: "Spotify", salary: "$110k - $130k", deadline: "Exp in 1 Day" },
                        ].map((job, i) => (
                            <div key={i} className="p-6 border border-gray-100 dark:border-gray-800 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-bold text-brand-500 text-lg group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                        {job.company.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-800 dark:text-white">{job.title}</h4>
                                        <p className="text-sm font-medium text-gray-400 mt-1">{job.company} • {job.salary}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg whitespace-nowrap">{job.deadline}</span>
                                    <button className="flex-1 sm:flex-none px-6 py-3 bg-brand-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/20 hover:scale-105 active:scale-100 transition-all">
                                        Apply
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
