import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";

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

    const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>(coupons);

    const handleFilterChange = ({ search, startDate, endDate }: any) => {
        let result = coupons;

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(c =>
                c.code.toLowerCase().includes(lowerSearch) ||
                c.description.toLowerCase().includes(lowerSearch)
            );
        }

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            result = result.filter(c => {
                if (!c.createdAt) return true;
                const date = new Date(c.createdAt);
                return date >= start && date <= end;
            });
        }

        setFilteredCoupons(result);
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCoupons = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleDelete = (id: number) => {
        const updated = coupons.filter(c => c.id !== id);
        setCoupons(updated);
        // Re-apply filters to update view
        setFilteredCoupons(prev => prev.filter(c => c.id !== id));
    };

    return (
        <div>
            <PageMeta
                title="Coupons | TailAdmin - React.js Admin Dashboard"
                description="This is the Coupons page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Coupons & Discounts" />

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Coupons..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <button className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors whitespace-nowrap mt-1">
                        Create Coupon
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Active Coupons
                    </h3>
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
                                        <span className="text-sm font-medium text-brand-500 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded border border-brand-100 dark:border-brand-500/20 font-mono">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-800 dark:text-gray-300">
                                            {coupon.description}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {coupon.discount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.expiryDiff === "Expired" ? "bg-red-500" : "bg-green-500"
                                                }`}></span>
                                            <span className={`text-sm ${coupon.expiryDiff === "Expired"
                                                ? "text-red-500 font-medium"
                                                : "text-gray-500 dark:text-gray-400"
                                                }`}>
                                                {coupon.expiryDiff}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.status === "Active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                        >
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-brand-500 rounded-full"
                                                    style={{ width: `${Math.min((coupon.usage / 2500) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {coupon.usage}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.createdAt}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {coupon.updatedAt}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex gap-2">
                                            <button className="text-brand-500 hover:text-brand-700">
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </div>
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
                    totalResults={filteredCoupons.length}
                />
            </div>
        </div>
    );
}
