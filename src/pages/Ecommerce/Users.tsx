import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser, User, fetchRoles } from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";
import { ITEMS_PER_PAGE, MIN_TABLE_HEIGHT } from "../../constants/constants";


const sanitizeUrl = (url: string | undefined): string => {
    if (!url) return "";
    return url.replace(/[\n\r]/g, '').trim();
};

export default function Customers() {
    const { roleId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { users, roles, loading } = useSelector((state: RootState) => state.user);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (roles.length === 0) dispatch(fetchRoles({}));
    }, [dispatch, roles.length]);

    // Build filter object
    const buildFilter = useCallback(() => {
        const filter: any = {};

        // Role Filter (from URL or Dropdown)
        if (roleId) {
            // roleId from URL is the MongoDB _id (string)
            // We need to find the corresponding role object to get the numeric role_id
            const role = roles.find(r => r._id === roleId);
            if (role && role.role_id !== undefined) {
                filter['role.role_id'] = role.role_id;
            }
        } else if (selectedRole) {
            const parsed = Number(selectedRole);
            if (!isNaN(parsed)) filter['role.role_id'] = parsed;
        }

        if (selectedStatus) {
            filter.status = selectedStatus;
        }

        // Global search
        if (searchQuery) {
            const terms = searchQuery.trim().split(/\s+/);
            if (terms.length > 0) {
                filter.$and = terms.map(term => {
                    const regex = { $regex: term, $options: "i" };
                    return {
                        $or: [
                            { first_name: regex },
                            { last_name: regex },
                            { email: regex },
                            { phone_number: regex },
                            { status: regex },
                        ]
                    };
                });
            }
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        return filter;
    }, [searchQuery, startDate, endDate, roleId, selectedRole, selectedStatus, roles]);

    // Debounced Fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            // Request a large limit to ensure we get 'all' data for client-side pagination
            // Adjust 1000 if your backend supports a specific 'all' keyword or different limit
            dispatch(fetchUsers({ filter, limit: 1000 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter]);

    // Handle updates from TableFilter (Search + Date)
    const handleFilterChange = ({ search, startDate: start, endDate: end, role_id, status }: any) => {
        setSearchQuery(search);
        setStartDate(start);
        setEndDate(end);
        setSelectedRole(role_id || "");
        setSelectedStatus(status || "");
        setCurrentPage(1);
    };

    // Calculate pagination
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedUser?._id) {
            setIsDeleting(true);
            try {
                await dispatch(deleteUser(selectedUser._id)).unwrap();
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Failed to delete user:", err);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Get Role Name for Display
    const currentRole = roles.find(r => r._id === roleId);
    const pageTitle = currentRole ? `${currentRole.name}s` : "All Users";

    return (
        <div>
            <PageMeta
                title={`${pageTitle} | Khana Fast `}
                description={`${pageTitle} page`}
            />
            <PageBreadcrumb pageTitle={pageTitle} />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white uppercase tracking-wide">
                        {pageTitle}
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto items-start sm:items-center">
                        <div className="w-full sm:w-auto">
                            <TableFilter
                                placeholder="Universal Search..."
                                onFilterChange={handleFilterChange}
                                className="mb-0"
                                filters={[
                                    ...(roleId ? [] : [{
                                        key: "role_id",
                                        label: "Role",
                                        options: roles
                                            .filter(r => r.role_id !== undefined && r.role_id !== null)
                                            .map(r => ({ label: r.name, value: String(r.role_id) }))
                                    }]),
                                    {
                                        key: "status",
                                        label: "Status",
                                        options: [
                                            { label: "Active", value: "active" },
                                            { label: "Inactive", value: "inactive" },
                                            { label: "Pending", value: "pending" }
                                        ]
                                    }
                                ]}
                            >
                                {/* <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Advanced Filters</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1">
                                                Role
                                            </label>
                                            <Select
                                                options={roles.map(r => ({ label: r.name, value: r._id || "" }))}
                                                placeholder="Filter by Role"
                                                value={roleFilter}
                                                onChange={(value) => setRoleFilter(value)}
                                                className="bg-gray-50 dark:bg-gray-800"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1">
                                                    First Name
                                                </label>
                                                <Input
                                                    placeholder="e.g. John"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    className="bg-gray-50 dark:bg-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1">
                                                    Last Name
                                                </label>
                                                <Input
                                                    placeholder="e.g. Doe"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    className="bg-gray-50 dark:bg-gray-800"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1">
                                                    Email
                                                </label>
                                                <Input
                                                    placeholder="@example.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="bg-gray-50 dark:bg-gray-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1 mb-1">
                                                    Phone
                                                </label>
                                                <Input
                                                    placeholder="e.g. +91..."
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    className="bg-gray-50 dark:bg-gray-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div> */}
                            </TableFilter>
                        </div>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-brand-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 whitespace-nowrap flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add {currentRole ? currentRole.name : "User"}
                        </button>
                    </div>
                </div>
                <div className={`overflow-x-auto ${MIN_TABLE_HEIGHT}`}>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider w-10">S.no</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created At</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Updated At</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative min-h-[100px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <DotLoading />
                                            <span>Loading {pageTitle.toLowerCase()}...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-10 text-center text-gray-500 h-[400px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No {pageTitle.toLowerCase()} found</p>
                                            <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((user, i) => (
                                    <tr
                                        key={user._id || i}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                    >
                                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-gray-500 dark:text-gray-400">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + i + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 min-w-[36px] rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold uppercase text-xs overflow-hidden border border-brand-100 dark:border-brand-500/20">
                                                    {(user.profile_image || user.image) ? (
                                                        <img
                                                            src={sanitizeUrl(typeof user.profile_image === 'string' ? user.profile_image : (typeof user.image === 'string' ? user.image : user.image?.url))}
                                                            alt={`${user.first_name} ${user.last_name}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <>
                                                            {user.first_name?.[0]}
                                                            {user.last_name?.[0]}
                                                        </>
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-semibold text-gray-800 dark:text-white">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {user.phone_number}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                {(() => {
                                                    const roleData = user.role?.[0];
                                                    if (!roleData) return "N/A";

                                                    // Handle ID numbers, ID strings, or populated objects
                                                    const roleId = typeof roleData === 'object' ? roleData._id : String(roleData);
                                                    const foundRole = roles.find(r => r._id === roleId || String(r.role_id) === roleId || String(r.role_type) === roleId);

                                                    return foundRole?.name || (typeof roleData === 'object' ? roleData.name : "N/A");
                                                })()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded-full border border-transparent ${user.status === "active" || user.status === "Active"
                                                    ? "bg-green-100 text-green-600"
                                                    : "bg-red-100 text-red-600"
                                                    }`}
                                            >
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(user)}
                                                    className="p-1.5 text-gray-500 hover:text-brand-500 bg-white border border-gray-200 rounded-lg hover:border-brand-200 transition-all shadow-sm"
                                                    title="Edit"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteClick(user)}
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
                                ))
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
                    totalResults={users.length}
                />
            </div>
            <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} initialRoleId={roleId} />
            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={selectedUser}
                initialRoleId={roleId}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${currentRole ? currentRole.name : "User"}`}
                message={`Are you sure you want to delete "${selectedUser?.first_name} ${selectedUser?.last_name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </div>
    );
}
