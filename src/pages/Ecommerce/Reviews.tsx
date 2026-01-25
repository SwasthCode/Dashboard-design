import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReviews, deleteReview, updateReview, Review } from "../../store/slices/reviewSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";
import AddReviewModal from "./AddReviewModal";
import EditReviewModal from "./EditReviewModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import TableFilter from "../../components/common/TableFilter";

export default function Reviews() {
    const dispatch = useDispatch<AppDispatch>();
    const { reviews, loading: reviewsLoading } = useSelector((state: RootState) => state.review);
    const { products, loading: productsLoading } = useSelector((state: RootState) => state.product);
    const { users, loading: usersLoading } = useSelector((state: RootState) => state.user);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        // Initial fetch for products and users if not already loaded
        if (products.length === 0) dispatch(fetchProducts({}));
        if (users.length === 0) dispatch(fetchUsers({}));
    }, [dispatch, products.length, users.length]);

    // Construct filter for backend
    const buildFilter = useCallback(() => {
        const filter: any = {};
        if (searchQuery) {
            filter.$or = [
                { comment: { $regex: searchQuery, $options: 'i' } },
                { status: { $regex: searchQuery, $options: 'i' } }
            ];
            // Note: Searching by product name or user name would require backend support to filter on populated fields or aggregations.
            // For now, we search on fields directly on the review model + status.
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
            dispatch(fetchReviews({ filter }));
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [dispatch, buildFilter, products.length, users.length]);

    const handleFilterChange = ({ search, startDate: start, endDate: end }: any) => {
        setSearchQuery(search);
        setStartDate(start);
        setEndDate(end);
    };

    // Calculate pagination
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleEdit = (review: Review) => {
        setSelectedReview(review);
        setIsEditModalOpen(true);
    };

    const handleDeleteClick = (review: Review) => {
        setSelectedReview(review);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (selectedReview?._id) {
            setIsDeleting(true);
            try {
                await dispatch(deleteReview(selectedReview._id)).unwrap();
                setIsDeleteModalOpen(false);
            } catch (err) {
                console.error("Failed to delete review:", err);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await dispatch(updateReview({ id, data: { status: "Published" } })).unwrap();
        } catch (err) {
            console.error("Failed to approve review:", err);
        }
    };

    const sanitizeUrl = (url: string) => {
        if (!url) return '';
        return url.replace(/[\n\r]+/g, '').trim();
    };

    const getProduct = (id: string) => {
        return products.find(p => p._id === id);
    };

    const getProductName = (id: string) => {
        return getProduct(id)?.name || "Unknown Product";
    };

    const getUserName = (id: string) => {
        const user = users.find(u => (u.id || u._id) === id);
        return user ? `${user.first_name} ${user.last_name}` : "Unknown Customer";
    };

    return (
        <div>
            <PageMeta
                title="Reviews | TailAdmin - React.js Admin Dashboard"
                description="Reviews page for TailAdmin"
            />
            <PageBreadcrumb pageTitle="Reviews" />

            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                        <TableFilter
                            placeholder="Search Reviews..."
                            onFilterChange={handleFilterChange}
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-brand-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors whitespace-nowrap mt-1"
                    >
                        Add Review
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Review List
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Image
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Comment
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
                            {reviewsLoading && reviews.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Loading reviews...</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            {currentReviews.map((review) => (
                                <tr
                                    key={review._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center text-gray-500">
                                                {getProduct(review.product_id)?.images?.[0]?.url ? (
                                                    <img
                                                        src={sanitizeUrl(getProduct(review.product_id)!.images[0].url)}
                                                        alt="Product"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]">
                                                {productsLoading && products.length === 0 ? (
                                                    <span className="inline-block w-24 h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></span>
                                                ) : (
                                                    getProductName(review.product_id)
                                                )}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {usersLoading && users.length === 0 ? (
                                                <span className="inline-block w-20 h-4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></span>
                                            ) : (
                                                getUserName(review.user_id)
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {(review.images && review.images.length > 0) ? (
                                            <div className="flex -space-x-2">
                                                {review.images.map((img, idx) => (
                                                    <div key={img._id || idx} className="h-10 w-10 rounded-lg overflow-hidden border border-white dark:border-gray-900 shadow-sm">
                                                        <img
                                                            src={sanitizeUrl(img.url)}
                                                            alt={`Review ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : review.image ? (
                                            <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                                <img
                                                    src={sanitizeUrl(typeof review.image === 'string' ? review.image : review.image.url)}
                                                    alt="Review"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300 dark:text-gray-600"}`} viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-xs">{review.comment}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`px-2 py-1 text-[10px] font-semibold rounded-full ${review.status === "Published"
                                                ? "bg-green-100 text-green-600"
                                                : "bg-orange-100 text-orange-600"
                                                }`}
                                        >
                                            {review.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : "-"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2">
                                            {review.status === "Pending" && (
                                                <button onClick={() => handleApprove(review._id!)} className="text-green-500 hover:text-green-700 font-medium text-xs">
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => handleEdit(review)} className="p-1.5 text-gray-500 hover:text-brand-500 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDeleteClick(review)} className="p-1.5 text-gray-500 hover:text-red-500 transition-colors">
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
                    totalResults={reviews.length}
                />
            </div>

            <AddReviewModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <EditReviewModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                review={selectedReview}
            />
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Review"
                message="Are you sure you want to delete this review? This action cannot be undone."
                loading={isDeleting}
            />
        </div>
    );
}
