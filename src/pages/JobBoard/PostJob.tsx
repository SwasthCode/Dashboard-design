import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function PostJob() {
    return (
        <div>
            <PageMeta
                title="Post Job | TailAdmin - React.js Admin Dashboard"
                description="This is the Post Job page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Post Job" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Post a New Job</h3>
                <p className="text-gray-500 dark:text-gray-400">Content for posting a job will go here.</p>
            </div>
        </div>
    );
}
