import PageMeta from "../../components/common/PageMeta";

export default function ResetPassword() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <PageMeta
                title="Reset Password | TailAdmin - React.js Admin Dashboard"
                description="This is the Reset Password page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Reset Password</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your email to receive a password reset link.</p>
                <button className="w-full bg-brand-500 text-white font-bold py-3 rounded-xl hover:bg-brand-600 transition-colors">
                    Send Link
                </button>
            </div>
        </div>
    );
}
