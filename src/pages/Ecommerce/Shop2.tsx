import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Shop2() {
    const categories = ["All", "Watches", "Footwear", "Audio"];
    const products = [
        { name: "Luxury Geneva Watch", price: "$299.00", image: "/images/products/watch.png" },
        { name: "Sleek Sneakers", price: "$120.00", image: "/images/products/sneaker.png" },
        { name: "Studio Headphones", price: "$250.00", image: "/images/products/headphone.png" },
    ];

    return (
        <div>
            <PageMeta
                title="Shop 2 | TailAdmin - React.js Admin Dashboard"
                description="This is the Shop 2 page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Shop 2" />
            <div className="flex flex-col space-y-8">
                {/* Filters */}
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map((cat, i) => (
                        <button key={i} className={`px-6 py-2 rounded-full text-sm font-medium border transition-colors ${i === 0 ? "bg-brand-500 border-brand-500 text-white" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-brand-300"
                            }`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* List Layout */}
                <div className="grid grid-cols-1 gap-4">
                    {products.map((product, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                            <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div>
                                    <h4 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{product.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-lg">
                                        High-quality premium materials with ergonomic design for the best user experience. Perfect for everyday use or professional settings.
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-2xl font-bold text-brand-500">{product.price}</span>
                                    <div className="flex gap-2">
                                        <button className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                            Details
                                        </button>
                                        <button className="bg-brand-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
