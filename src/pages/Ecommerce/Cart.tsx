import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Cart() {
    const items = [
        { name: "Luxury Geneva Watch", price: 299.00, qty: 1, image: "/images/products/watch.png" },
        { name: "Sleek Sneakers", price: 120.00, qty: 2, image: "/images/products/sneaker.png" },
    ];

    return (
        <div>
            <PageMeta
                title="Cart | TailAdmin - React.js Admin Dashboard"
                description="This is the Cart page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Shopping Cart" />
            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-4">
                    {items.map((item, i) => (
                        <div key={i} className="bg-white dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-6">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 dark:text-white">{item.name}</h4>
                                <p className="text-sm text-gray-500 font-medium">${item.price.toFixed(2)}</p>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <button className="px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800">-</button>
                                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-200 dark:border-gray-700">{item.qty}</span>
                                        <button className="px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800">+</button>
                                    </div>
                                    <button className="text-xs text-red-500 font-medium hover:underline">Remove</button>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.qty).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full lg:w-96">
                    <div className="bg-white dark:bg-gray-900 p-6 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm space-y-6 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="font-medium text-gray-800 dark:text-white">$539.00</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className="font-medium text-green-500">Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax</span>
                                <span className="font-medium text-gray-800 dark:text-white">$43.12</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                <span className="font-bold text-gray-800 dark:text-white">Total</span>
                                <span className="font-bold text-2xl text-brand-500">$582.12</span>
                            </div>
                        </div>
                        <button className="w-full bg-brand-500 text-white py-4 rounded-xl font-bold hover:bg-brand-600 transition-all">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
