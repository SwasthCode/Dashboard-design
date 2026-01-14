import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function SingleProduct() {
    return (
        <div>
            <PageMeta
                title="Single Product | TailAdmin - React.js Admin Dashboard"
                description="This is the Single Product page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Product Details" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-10 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Image Gallery Placeholder */}
                    <div className="w-full lg:w-1/2 space-y-4">
                        <div className="aspect-square rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                            <img src="/images/products/watch.png" alt="Featured Product" className="w-full h-full object-cover" />
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer border-2 border-transparent hover:border-brand-500 transition-colors overflow-hidden">
                                    <img src="/images/products/watch.png" alt="Thumb" className="w-full h-full object-cover opacity-50 hover:opacity-100" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <span className="text-brand-500 text-sm font-semibold uppercase tracking-wider">Premium Collection</span>
                            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">Luxury Geneva Gold Watch</h2>
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">$299.00</span>
                                <span className="text-lg text-gray-400 line-through font-medium">$450.00</span>
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">30% OFF</span>
                            </div>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
                            Elevate your style with the Geneva Gold Edition. Crafted with precision Swiss movement, scratch-resistant sapphire glass, and a genuine leather strap. Designed for those who appreciate timeless elegance and modern durability.
                        </p>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-800 dark:text-white">Select Color</h4>
                            <div className="flex gap-3">
                                {["bg-blue-600", "bg-gray-800", "bg-brand-500", "bg-orange-500"].map((color, i) => (
                                    <button key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-white dark:border-gray-900 shadow-sm hover:scale-110 transition-transform`}></button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                            <button className="flex-1 bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20">
                                Add to Cart
                            </button>
                            <button className="flex-1 border border-gray-200 dark:border-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
