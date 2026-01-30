import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function FAQ() {
    return (
        <div>
            <PageMeta
                title="FAQ | Khana Fast "
                description="This is the FAQ page for   Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="FAQ" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Frequently Asked Questions</h3>
                <p className="text-gray-500 dark:text-gray-400">Content for the FAQ will go here.</p>
            </div>
        </div>
    );
}
