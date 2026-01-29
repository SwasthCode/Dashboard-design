import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

export default function Inbox() {
    return (
        <div>
            <PageMeta
                title="Inbox | TailAdmin - React.js Admin Dashboard"
                description="This is the Inbox page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Inbox" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[700px]">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Primary Inbox</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-gray-400 hover:text-brand-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-50 dark:divide-gray-800">
                        {[
                            { from: "GitHub Notification", subject: "New release v2.0", time: "10:30 AM", unread: true },
                            { from: "Dribbble", subject: "Weekly designers to follow", time: "09:12 AM", unread: false },
                            { from: "Figma Team", subject: "Updated library for your project", time: "Yesterday", unread: false },
                            { from: "Bank Alert", subject: "Your statement is ready", time: "Jan 12", unread: true },
                        ].map((mail, i) => (
                            <div key={i} className={`p-6 flex items-center gap-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${mail.unread ? 'border-l-4 border-brand-500' : 'border-l-4 border-transparent'}`}>
                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex-shrink-0 flex items-center justify-center font-bold text-gray-500">
                                    {mail.from.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm ${mail.unread ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{mail.from}</h4>
                                    <p className={`text-sm mt-0.5 truncate max-w-md ${mail.unread ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{mail.subject}</p>
                                </div>
                                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{mail.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
