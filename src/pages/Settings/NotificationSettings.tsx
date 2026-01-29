import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function NotificationSettings() {
    return (
        <div>
            <PageMeta
                title="Notification Settings | TailAdmin - React.js Admin Dashboard"
                description="This is the Notification Settings page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Notification Settings" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Preferences</h3>
                <p className="text-gray-500 dark:text-gray-400">Content for notification settings will go here.</p>
            </div>
        </div>
    );
}
