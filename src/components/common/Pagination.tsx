import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    startIndex: number;
    endIndex: number;
    totalResults: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    startIndex,
    endIndex,
    totalResults,
}) => {
    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const showMax = 5;

        if (totalPages <= showMax) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push("...");
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{totalResults === 0 ? 0 : startIndex + 1}</span>-
                <span className="font-medium text-gray-900 dark:text-white">{Math.min(endIndex, totalResults)}</span> of <span className="font-medium text-gray-900 dark:text-white">{totalResults}</span> results
            </p>
            <div className="flex items-center gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${currentPage === 1
                        ? "text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 shadow-sm"
                        }`}
                >
                    Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((number, idx) => (
                        number === "..." ? (
                            <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={idx}
                                onClick={() => onPageChange(number as number)}
                                className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-all ${currentPage === number
                                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-brand-500 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-brand-400"
                                    }`}
                            >
                                {number}
                            </button>
                        )
                    ))}
                </div>

                <div className="flex sm:hidden items-center px-4 font-medium text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${currentPage === totalPages || totalPages === 0
                        ? "text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 shadow-sm"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
