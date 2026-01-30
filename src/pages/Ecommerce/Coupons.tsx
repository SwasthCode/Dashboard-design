import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import TableFilter from "../../components/common/TableFilter";
import { ITEMS_PER_PAGE } from "../../constants/constants";

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
    const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
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
                title="Coupons | Khana Fast "
                description="This is the Coupons page for   Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Coupons & Discounts" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                        Coupon List
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                            <TableFilter
                                placeholder="Search Coupons..."
                                onFilterChange={handleFilterChange}
                                className="mb-0"
                            />
                        </div>
                        <button className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 whitespace-nowrap flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Coupon
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">
                                    S.no
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Discount
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Expiry
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Usage
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentCoupons.map((coupon, index) => (
                                <tr
                                    key={coupon.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm font-bold text-brand-600 bg-brand-50 dark:bg-brand-500/10 px-2 py-1 rounded border border-brand-100 dark:border-brand-500/20 font-mono">
                                            {coupon.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm text-gray-800 dark:text-gray-300">
                                            {coupon.description}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm font-bold text-gray-800 dark:text-white">
                                            {coupon.discount}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-1.5 h-1.5 rounded-full ${coupon.expiryDiff === "Expired" ? "bg-red-500" : "bg-green-500"
                                                }`}></span>
                                            <span className={`text-sm ${coupon.expiryDiff === "Expired"
                                                ? "text-red-500 font-medium"
                                                : "text-gray-600 dark:text-gray-400"
                                                }`}>
                                                {coupon.expiryDiff}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border border-transparent ${coupon.status === "Active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500"
                                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                }`}
                                        >
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
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
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {coupon.createdAt}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {coupon.updatedAt}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="p-1.5 text-gray-500 hover:text-brand-500 bg-white border border-gray-200 rounded-lg hover:border-brand-200 transition-all shadow-sm" title="Edit">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-lg hover:border-red-200 transition-all shadow-sm"
                                                title="Delete"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
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
