import { useState, useEffect, useCallback } from "react";
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
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import Avatar from "../../components/ui/avatar/Avatar";
import { ITEMS_PER_PAGE } from "../../constants/constants";


export default function Addresses() {
    const dispatch = useDispatch<AppDispatch>();
    const { addresses, loading: addressesLoading } = useSelector((state: RootState) => state.address);
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.user);
    const loading = addressesLoading || usersLoading;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedDefault, setSelectedDefault] = useState("");

    useEffect(() => {
        dispatch(fetchAddresses({}));
        if (users.length === 0) dispatch(fetchUsers({}));
    }, [dispatch, users.length]);

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};

        if (searchQuery) {
            filter.$or = [
                { address: { $regex: searchQuery, $options: 'i' } },
                { city: { $regex: searchQuery, $options: 'i' } },
                { state: { $regex: searchQuery, $options: 'i' } },
                { pincode: { $regex: searchQuery, $options: 'i' } },
                { shipping_phone: { $regex: searchQuery, $options: 'i' } },
                { alternate_phone: { $regex: searchQuery, $options: 'i' } },
                { landmark: { $regex: searchQuery, $options: 'i' } },
                { name: { $regex: searchQuery, $options: 'i' } },
            ];
        }

        if (selectedType) {
            filter.type = selectedType;
        }

        if (selectedDefault) {
            filter.isDefault = selectedDefault === 'Default';
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        return filter;
    }, [searchQuery, startDate, endDate, selectedType, selectedDefault]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            dispatch(fetchAddresses({ filter }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter]); // Removed users.length as it's not defined here and addresses.length is not a direct dependency for re-fetching based on filter changes.

    const handleFilterChange = ({ search, startDate: start, endDate: end, type, isDefault }: any) => {
        setSearchQuery(search);
        setStartDate(start);
        setEndDate(end);
        setSelectedType(type || "");
        setSelectedDefault(isDefault || "");
    };

    // Calculate pagination
    const totalPages = Math.ceil(addresses.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
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

    const sanitizeUrl = (url: any) => {
        if (!url) return '';
        const urlStr = typeof url === 'object' ? url.url : url;
        if (urlStr.startsWith('http')) return urlStr;
        if (urlStr.startsWith('uploads')) return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/${urlStr}`;
        return urlStr;
    };

    const getUserImage = (userId: any) => {
        const user = users.find(u => (u.id || u._id) === userId);
        if (!user) return '';
        return sanitizeUrl(user.profile_image || user.image);
    };

    return (
        <div>
            <PageMeta
                title="Addresses | Admin Dashboard"
                description="Manage user addresses"
            />
            <PageBreadcrumb pageTitle="Addresses" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white  tracking-wide">
                        Address List
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                            <TableFilter
                                placeholder="Search Addresses..."
                                onFilterChange={handleFilterChange}
                                className="mb-0"
                                filters={[
                                    {
                                        key: "type",
                                        label: "Type",
                                        options: [
                                            { label: "Home", value: "Home" },
                                            { label: "Work", value: "Work" },
                                        ]
                                    },
                                    {
                                        key: "isDefault",
                                        label: "Status",
                                        options: [
                                            { label: "Default", value: "Default" },
                                            { label: "Non-Default", value: "Non-Default" },
                                        ]
                                    }
                                ]}
                            />
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 whitespace-nowrap flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Address
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <DotLoading size="lg" />
                            <p className="text-gray-500 gap-4 dark:text-gray-400">
                                Loading Addresses...
                            </p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">
                                        S.no
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Shipping Phone
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Alternate Phone
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Address
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Created At
                                    </th>
                                    {/* <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Updated At
                                    </th> */}
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {loading && addresses.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span>Loading addresses...</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {!loading && addresses.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-lg font-medium">No addresses found</span>
                                                <p className="text-sm">Try adjusting your search or filters</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {currentAddresses.map((addr, index) => (
                                    <tr
                                        key={addr._id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={getUserImage(addr.user_id) || "https://ui-avatars.com/api/?name=" + (addr.name || "User")}
                                                    size="small"
                                                    alt={addr.name}
                                                />
                                                <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {addr.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-800 dark:text-white">
                                                {addr.shipping_phone || <span className="text-gray-400 italic">Not available</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                {addr.alternate_phone || <span className="text-gray-400 italic">Not available</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 block max-w-xs">
                                                {addr.address}, {addr.locality}
                                                <br />
                                                {addr.city}, {addr.state} - {addr.pincode}
                                                {addr.landmark && <span className="block text-xs text-gray-400 mt-0.5">Landmark: {addr.landmark}</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                                {addr.type || 'Home'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {addr.isDefault ? (
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-500">
                                                    Default
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {addr.createdAt ? new Date(addr.createdAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        {/* <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {addr.updatedAt ? new Date(addr.updatedAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td> */}
                                        <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(addr)}
                                                    className="p-1.5 text-gray-500 hover:text-brand-500 bg-white border border-gray-200 rounded-lg hover:border-brand-200 transition-all shadow-sm"
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(addr)}
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
                    )}
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
