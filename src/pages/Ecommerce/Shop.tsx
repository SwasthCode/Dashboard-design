import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Shop() {
    const products = [
        { name: "Luxury Geneva Watch", price: "$299.00", image: "/images/products/watch.png", tag: "New" },
        { name: "Sleek Sneakers", price: "$120.00", image: "/images/products/sneaker.png", tag: "Sale" },
        { name: "Studio Headphones", price: "$250.00", image: "/images/products/headphone.png", tag: "Popular" },
    ];

    return (
        <div>
            <PageMeta
                title="Shop | TailAdmin - React.js Admin Dashboard"
                description="This is the Shop page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Shop" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all">
                        <div className="relative h-64 overflow-hidden bg-gray-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <span className={`absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${product.tag === "New" ? "bg-brand-500 text-white" :
                                    product.tag === "Sale" ? "bg-red-500 text-white" : "bg-orange-500 text-white"
                                }`}>
                                {product.tag}
                            </span>
                        </div>
                        <div className="p-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{product.name}</h4>
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{product.price}</span>
                                <button className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-500 hover:text-white transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
