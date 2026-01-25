import { useState, useEffect, useCallback } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchBrands, deleteBrand, Brand } from "../../store/slices/brandSlice";
import { fetchMainCategories } from "../../store/slices/mainCategorySlice";
import Pagination from "../../components/common/Pagination";
import AddBrandModal from "./AddBrandModal";
import EditBrandModal from "./EditBrandModal";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import TableFilter from "../../components/common/TableFilter";
import DotLoading from "../../components/common/DotLoading";


export default function Brands() {
    const dispatch = useDispatch<AppDispatch>();
    const { brands, loading } = useSelector((state: RootState) => state.brand);
    const { mainCategories } = useSelector((state: RootState) => state.mainCategory);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        dispatch(fetchBrands({}));
        if (mainCategories.length === 0) {
            dispatch(fetchMainCategories({}));
        }
    }, [dispatch, mainCategories.length]);

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};
        if (searchQuery) {
            filter.name = { $regex: searchQuery, $options: 'i' };
        }
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = startDate;
            if (endDate) filter.createdAt.$lte = endDate;
        }
        return filter;
    }, [searchQuery, startDate, endDate]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const filter = buildFilter();
            dispatch(fetchBrands({ filter }));
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter]);

    const handleFilterChange = ({ search, startDate: start, endDate: end }: any) => {
        setSearchQuery(search);
        setStartDate(start);
        setEndDate(end);
    };

    const totalPages = Math.ceil(brands.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedBrand?._id) {
            setIsDeleting(true);
            try {
                await dispatch(deleteBrand(selectedBrand._id)).unwrap();
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Failed to delete brand:", err);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div>
            <PageMeta
                title="Brands | Khana Fast Admin"
                description="Manage your product brands in the Khana Fast Admin Dashboard"
            />
            <PageBreadcrumb pageTitle="Brands" />

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Brands..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors whitespace-nowrap mt-1"
                    >
                        Add Brand
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Brand List
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Logo
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Main Category
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
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
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800 relative min-h-[100px]">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <DotLoading />
                                            <span>Loading brands...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentBrands.map((brand, i) => (
                                    <tr
                                        key={brand._id || i}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                                {brand.image ? (
                                                    <img
                                                        src={brand.image}
                                                        alt={brand.name}
                                                        className="h-full w-full object-contain p-1"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                                                        No Logo
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-800 dark:text-white">
                                                {brand.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {mainCategories.find(mc => mc._id === brand.main_category_id)?.name || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px] block">
                                                {brand.description || "No description"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-[10px] font-semibold rounded-full uppercase tracking-wider ${brand.status === "active"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500"
                                                    : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500"
                                                    }`}
                                            >
                                                {brand.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {brand.updatedAt ? new Date(brand.updatedAt).toLocaleDateString() : "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(brand)}
                                                    className="p-1.5 text-gray-500 hover:text-brand-500 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(brand)}
                                                    className="p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M19 7L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 7M10 11V17M14 11V17M15 7V4C15 3.44772 14.5523 3 14 3H10C9.44772 3 9 3.44772 9 4V7M4 7H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!loading && brands.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                                        No brands found.
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
                    totalResults={brands.length}
                />
            </div>

            <AddBrandModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

            <EditBrandModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedBrand(null);
                }}
                brand={selectedBrand}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Brand"
                message={`Are you sure you want to delete "${selectedBrand?.name}"? This action cannot be undone.`}
                loading={isDeleting}
            />
        </div >
    );
}
