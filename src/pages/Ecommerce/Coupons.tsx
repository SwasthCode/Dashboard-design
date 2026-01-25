import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

interface Coupon {
    id: number;
    code: string;
    description: string;
    discount: string;
    expiryDiff: string;
    status: "Active" | "Expired";
    usage: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function Coupons() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [coupons, setCoupons] = useState<Coupon[]>([
        { id: 1, code: "WELCOME20", description: "Welcome Discount", discount: "20%", expiryDiff: "25 days", status: "Active", usage: 154, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        { id: 2, code: "SUMMERSALE", description: "Summer Sale 2024", discount: "$50", expiryDiff: "5 days", status: "Active", usage: 890, createdAt: "2024-01-05", updatedAt: "2024-01-10" },
        { id: 3, code: "BLACKFRIDAY", description: "Black Friday Deal", discount: "50%", expiryDiff: "Expired", status: "Expired", usage: 2405, createdAt: "2023-11-01", updatedAt: "2023-11-30" },
        { id: 4, code: "LOYALTY10", description: "Loyalty Program", discount: "10%", expiryDiff: "Unlimited", status: "Active", usage: 45, createdAt: "2023-01-01", updatedAt: "2023-01-01" },
        { id: 5, code: "FREESHIP", description: "Free Shipping", discount: "Shipping", expiryDiff: "10 days", status: "Active", usage: 320, createdAt: "2024-02-01", updatedAt: "2024-02-01" },
        { id: 6, code: "FLASH50", description: "Flash Sale", discount: "50%", expiryDiff: "Expired", status: "Expired", usage: 112, createdAt: "2023-12-01", updatedAt: "2023-12-05" },
        { id: 7, code: "NEWYEAR30", description: "New Year Special", discount: "30%", expiryDiff: "360 days", status: "Active", usage: 12, createdAt: "2024-01-01", updatedAt: "2024-01-01" },
        { id: 8, code: "STUDENT15", description: "Student Discount", discount: "15%", expiryDiff: "Unlimited", status: "Active", usage: 560, createdAt: "2023-09-01", updatedAt: "2023-09-01" },
        { id: 9, code: "VIP25", description: "VIP Members", discount: "25%", expiryDiff: "Unlimited", status: "Active", usage: 78, createdAt: "2023-06-01", updatedAt: "2023-06-01" },
        { id: 10, code: "SPRING10", description: "Spring Season", discount: "10%", expiryDiff: "60 days", status: "Active", usage: 0, createdAt: "2024-03-01", updatedAt: "2024-03-01" },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(coupons.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCoupons = coupons.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = (id: number) => {
        setCoupons(coupons.filter(c => c.id !== id));
    };

    return (
        <div>
            <PageMeta
                title="Coupons | TailAdmin - React.js Admin Dashboard"
                description="This is the Coupons page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Coupons & Discounts" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Active Coupons
                    </h3>
                    <button className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors">
                        Create Coupon
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Discount
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Expiry
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Usage
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentCoupons.map((coupon) => (
                                <tr
                                    key={coupon.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-brand-500">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </span>
                                            <span className="text-sm font-bold text-gray-800 dark:text-white font-mono">
                                                {coupon.code}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.description}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {coupon.discount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.expiryDiff}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-semibold rounded-full ${coupon.status === "Active"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.usage} used
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.createdAt ? new Date(coupon.createdAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.updatedAt ? new Date(coupon.updatedAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button onClick={() => handleDelete(coupon.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={coupons.length}
                />
            </div>
        </div>
    );
}
