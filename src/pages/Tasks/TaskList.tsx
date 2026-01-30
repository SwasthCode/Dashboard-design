import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function TaskList() {
    return (
        <div>
            <PageMeta
                title="Task List | Khana Fast "
                description="This is the Task List page for   Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Task List" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">All Tasks</h3>
                <p className="text-gray-500 dark:text-gray-400">Content for the task list will go here.</p>
            </div>
        </div>
    );
}
