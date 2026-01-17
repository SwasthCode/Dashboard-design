import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import AddCustomerModal from "./AddCustomerModal";

export default function Customers() {
    const dispatch = useDispatch<AppDispatch>();
    const { users, loading, error } = useSelector((state: RootState) => state.user);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // Calculate pagination
    const userList = Array.isArray(users) ? users : [];
    const totalPages = Math.ceil(userList.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = userList.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 font-medium">
                Error loading customers: {error}
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Customers | Admin Dashboard"
                description="This is the Customers page for the Redux-integrated Admin Dashboard"
            />
            <PageBreadcrumb pageTitle="Customers" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Customer List</h3>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                        Add Customer
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                {/* <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th> */}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative min-h-[100px]">
                            {loading && userList.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center">
                                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-brand-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                    </td>
                                </tr>
                            )}
                            {currentUsers.map((user, i) => (
                                <tr
                                    key={user._id || i}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-500 font-semibold">
                                                {user.first_name?.[0]}
                                                {user.last_name?.[0]}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-800 dark:text-white">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.phone_number}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {user.role?.[0]?.name || "N/A"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === "active" || user.status === "Active"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-red-100 text-red-600"
                                                }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!loading && userList.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No customers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    startIndex={indexOfFirstItem}
                    endIndex={indexOfLastItem}
                    totalResults={userList.length}
                />
            </div>
            <AddCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
