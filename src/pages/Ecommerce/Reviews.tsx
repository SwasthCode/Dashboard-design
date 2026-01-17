import { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Pagination from "../../components/common/Pagination";

interface Review {
    id: number;
    product: string;
    customer: string;
    rating: number;
    comment: string;
    date: string;
    status: "Published" | "Pending";
}

export default function Reviews() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [reviews, setReviews] = useState<Review[]>([
        { id: 1, product: "MacBook Pro 14", customer: "John Doe", rating: 5, comment: "Amazing laptop, very fast!", date: "Jan 12, 2024", status: "Published" },
        { id: 2, product: "iPhone 15", customer: "Jane Smith", rating: 4, comment: "Great phone but battery could be better.", date: "Jan 13, 2024", status: "Published" },
        { id: 3, product: "Sony WH-1000XM5", customer: "Robert Fox", rating: 5, comment: "Best noise cancelling headphones.", date: "Jan 14, 2024", status: "Pending" },
        { id: 4, product: "Samsung S24 Ultra", customer: "Alice Johnson", rating: 5, comment: "The screen is stunning.", date: "Jan 15, 2024", status: "Published" },
        { id: 5, product: "Dell XPS 13", customer: "Mike Brown", rating: 3, comment: "Runs a bit hot.", date: "Jan 16, 2024", status: "Pending" },
        { id: 6, product: "iPad Air", customer: "Sarah Wilson", rating: 5, comment: "Perfect for reading and notes.", date: "Jan 17, 2024", status: "Published" },
        { id: 7, product: "AirPods Pro", customer: "David Lee", rating: 4, comment: "Good sound, decent fit.", date: "Jan 18, 2024", status: "Published" },
        { id: 8, product: "Kindle Paperwhite", customer: "Emily Davis", rating: 5, comment: "Love reading on this.", date: "Jan 19, 2024", status: "Pending" },
        { id: 9, product: "Logitech MX Master", customer: "Michael Clark", rating: 5, comment: "Best productivity mouse.", date: "Jan 20, 2024", status: "Published" },
        { id: 10, product: "ASUS ROG Zephyrus", customer: "Jessica White", rating: 4, comment: "Great for gaming.", date: "Jan 21, 2024", status: "Published" },
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(reviews.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentReviews = reviews.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleApprove = (id: number) => {
        setReviews(reviews.map(r => r.id === id ? { ...r, status: "Published" } : r));
    };

    const handleDelete = (id: number) => {
        setReviews(reviews.filter(r => r.id !== id));
    };

    return (
        <div>
            <PageMeta
                title="Reviews | TailAdmin - React.js Admin Dashboard"
                description="This is the Reviews page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
            />
            <PageBreadcrumb pageTitle="Reviews" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        Customer Reviews
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
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Comment
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {currentReviews.map((review) => (
                                <tr
                                    key={review.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[150px]">
                                                {review.product}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {review.customer}
                                        </span>
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
                                        <div className="flex gap-2">
                                            {review.status === "Pending" && (
                                                <button onClick={() => handleApprove(review.id)} className="text-green-500 hover:text-green-700 font-medium text-xs">
                                                    Approve
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">
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
                    totalResults={reviews.length}
                />
            </div>
        </div>
    );
}
