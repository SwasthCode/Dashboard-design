import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Settings() {
    return (
        <div>
            <PageMeta
                title="Settings | TailAdmin - React.js Admin Dashboard"
                description="This is the Settings page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Settings" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 lg:p-12 shadow-sm">
                    <div className="flex items-center gap-8 mb-12 border-b border-gray-50 dark:border-gray-800 pb-12">
                        <div className="w-24 h-24 rounded-3xl bg-brand-500 shadow-xl shadow-brand-500/30 border-4 border-white dark:border-gray-800 relative group cursor-pointer overflow-hidden">
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold uppercase">Change</div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Information</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Update your personal details and public profile.</p>
                        </div>
                    </div>

                    <form className="space-y-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Full Name</label>
                                <input type="text" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-500/20" defaultValue="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                                <input type="email" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-500/20" defaultValue="john@example.com" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Bio</label>
                                <textarea className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-brand-500/20 min-h-[120px]" placeholder="Write something about yourself..."></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button className="bg-brand-500 text-white px-10 py-4 rounded-2xl font-bold hover:scale-[1.02] active:scale-100 shadow-xl shadow-brand-500/20 transition-all">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
