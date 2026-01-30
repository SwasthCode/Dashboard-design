import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Community() {
    return (
        <div>
            <PageMeta
                title="Community | Khana Fast "
                description="This is the Community page for   Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Community" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Member Search */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col h-fit">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Discover Members</h3>
                    <div className="relative">
                        <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500/20" placeholder="Search naming..." />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div className="mt-8 space-y-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Categories</p>
                            <div className="space-y-2">
                                {["All Members", "Moderators", "Designers", "Developers"].map((cat, i) => (
                                    <div key={i} className="flex items-center justify-between cursor-pointer hover:text-brand-500 transition-colors">
                                        <span className={`text-sm ${i === 0 ? 'text-brand-500 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{cat}</span>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-400">12k</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Member Grid */}
                <div className="lg:col-span-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { name: "Alex Rivera", role: "UI Designer", color: "bg-blue-500" },
                            { name: "Sarah Jenkins", role: "Product Manager", color: "bg-purple-500" },
                            { name: "Michael Chen", role: "Frontend Lead", color: "bg-green-500" },
                            { name: "Emily Blunt", role: "UX Researcher", color: "bg-red-500" },
                            { name: "David Gandy", role: "Backend Dev", color: "bg-orange-500" },
                            { name: "Jessica Alba", role: "CEO", color: "bg-indigo-500" },
                        ].map((member, i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className={`w-20 h-20 rounded-full ${member.color} mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-gray-800 shadow-xl`}>
                                    {member.name.charAt(0)}
                                </div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{member.name}</h4>
                                <p className="text-xs text-brand-500 font-semibold mb-6 mt-1">{member.role}</p>
                                <button className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-brand-500 hover:text-white transition-all">
                                    Add Connect
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
