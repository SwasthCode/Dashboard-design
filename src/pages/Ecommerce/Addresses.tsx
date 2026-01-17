import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

export default function Addresses() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [addresses] = useState([
        {
            user: "John Doe",
            address: "123 Main St, Apt 4B",
            cityState: "New York, NY",
            type: "Home",
            isDefault: true,
        },
        {
            user: "Jane Smith",
            address: "456 Corporate Blvd",
            cityState: "San Francisco, CA",
            type: "Work",
            isDefault: true,
        },
        {
            user: "Robert Fox",
            address: "789 Pine Ave",
            cityState: "Austin, TX",
            type: "Home",
            isDefault: false,
        },
        {
            user: "Alice Johnson",
            address: "321 Oak Ln",
            cityState: "Chicago, IL",
            type: "Home",
            isDefault: false,
        },
        {
            user: "Mike Brown",
            address: "654 Elm St",
            cityState: "Seattle, WA",
            type: "Work",
            isDefault: true,
        },
        {
            user: "Sarah Wilson",
            address: "987 Cedar Dr",
            cityState: "Miami, FL",
            type: "Home",
            isDefault: true,
        },
        {
            user: "David Lee",
            address: "147 Maple Ave",
            cityState: "Boston, MA",
            type: "Work",
            isDefault: false,
        },
        {
            user: "Emily Davis",
            address: "258 Birch Rd",
            cityState: "Denver, CO",
            type: "Home",
            isDefault: false,
        },
        {
            user: "Michael Clark",
            address: "369 Spruce Ct",
            cityState: "Atlanta, GA",
            type: "Work",
            isDefault: true,
        },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(addresses.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAddresses = addresses.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div>
            <PageMeta
                title="Addresses | TailAdmin - React.js Admin Dashboard"
                description="This is the Addresses page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Addresses" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        User Addresses
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Address
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    City/State
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Default
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentAddresses.map((addr, i) => (
                                <tr
                                    key={i}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {addr.user}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {addr.address}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {addr.cityState}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {addr.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {addr.isDefault ? (
                                            <span className="px-2 py-1 text-[10px] font-semibold rounded-full bg-brand-100 text-brand-600">
                                                Default
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
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
                    totalResults={addresses.length}
                />
            </div>
        </div>
    );
}
