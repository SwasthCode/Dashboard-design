import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAddresses, deleteAddress, Address } from "../../store/slices/addressSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import AddAddressModal from "./AddAddressModal";
import EditAddressModal from "./EditAddressModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function Addresses() {
    const dispatch = useDispatch<AppDispatch>();
    const { addresses, loading, error } = useSelector((state: RootState) => state.address);
    const { users } = useSelector((state: RootState) => state.user);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        dispatch(fetchAddresses());
        if (users.length === 0) dispatch(fetchUsers());
    }, [dispatch, users.length]);

    // Calculate pagination
    const totalPages = Math.ceil(addresses.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAddresses = addresses.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (address: Address) => {
        setSelectedAddress(address);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (address: Address) => {
        setSelectedAddress(address);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedAddress?._id) {
            setIsDeleting(true);
            try {
                await dispatch(deleteAddress(selectedAddress._id)).unwrap();
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Failed to delete address:", err);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // const getUserName = (id: string) => {
    //     const user = users.find(u => (u.id || u._id) === id);
    //     return user ? `${user.first_name} ${user.last_name}` : "Unknown User";
    // };

    if (error) {
        return (
            <div className="p-6 text-center text-red-500 font-medium">
                Error loading addresses: {error}
            </div>
        );
    }

    return (
        <div>
            <PageMeta
                title="Addresses | Admin Dashboard"
                description="Manage user addresses"
            />
            <PageBreadcrumb pageTitle="Addresses" />
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        User Addresses
                    </h3>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
                    >
                        Add Address
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Address
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Updated At
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading && addresses.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading addresses...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {currentAddresses.map((addr) => (
                                <tr
                                    key={addr._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                                            {/* {getUserName(addr.user_id)} */}
                                            {addr.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium text-gray-800 dark:text-white">{addr.shipping_phone}</div>
                                            {/* <div className="text-gray-500 dark:text-gray-400">{addr.shipping_phone}</div> */}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-500 dark:text-gray-400 block max-w-xs">
                                            {addr.address}, {addr.locality}
                                            <br />
                                            {addr.city}, {addr.state} - {addr.pincode}
                                            {addr.landmark && <span className="block text-xs text-gray-400 mt-0.5">Landmark: {addr.landmark}</span>}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                            {addr.type || 'Home'}
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
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {addr.createdAt ? new Date(addr.createdAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {addr.updatedAt ? new Date(addr.updatedAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(addr)} className="p-1.5 text-gray-500 hover:text-brand-500 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDeleteClick(addr)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    totalResults={addresses.length}
                />
            </div>

            <AddAddressModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditAddressModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                address={selectedAddress}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Address"
                message="Are you sure you want to delete this address? This action cannot be undone."
                loading={isDeleting}
            />
        </div>
    );
}
