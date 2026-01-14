import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Cart3() {
    return (
        <div>
            <PageMeta
                title="Cart 3 | TailAdmin - React.js Admin Dashboard"
                description="This is the Cart 3 page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Cart Variant 3" />
            <div className="space-y-6">
                <div className="bg-blue-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-bold">Limited Time Offer!</h3>
                        <p className="text-blue-100 opacity-80">Free worldwide shipping on orders above $500. Don't miss out!</p>
                    </div>
                    <span className="px-4 py-2 bg-white/20 rounded-lg font-mono font-bold tracking-widest uppercase">FREESHIP</span>
                </div>

                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Review Items (3)</h3>
                    <div className="space-y-6 divide-y divide-gray-100 dark:divide-gray-800">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="pt-6 first:pt-0 flex gap-6">
                                <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                                    <img src={`/images/products/${i === 1 ? 'watch' : i === 2 ? 'sneaker' : 'headphone'}.png`} alt="Product" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 dark:text-white">Product Item Name {i}</h4>
                                        <span className="font-bold">$125.00</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-tighter">SKU: 98234-AX</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-green-500 font-medium">In Stock</span>
                                        <div className="flex items-center gap-4 text-xs">
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">Save for later</button>
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
