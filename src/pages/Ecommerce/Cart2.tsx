import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Cart2() {
    return (
        <div>
            <PageMeta
                title="Cart 2 | TailAdmin - React.js Admin Dashboard"
                description="This is the Cart 2 page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Cart Variant 2" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                    <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center text-brand-500">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" /></svg>
                    </div>
                    <div className="max-w-xs">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Your cart is empty</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Looks like you haven't added anything to your cart yet.</p>
                    </div>
                    <button className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
