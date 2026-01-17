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

    return (
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {startIndex + 1}-{Math.min(endIndex, totalResults)} of {totalResults} results
            </p>
            <div className="flex gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${currentPage === 1
                            ? "text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                >
                    Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`w-8 h-8 flex items-center justify-center text-sm rounded-md transition-colors ${currentPage === number
                                ? "bg-brand-500 text-white"
                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            }`}
                    >
                        {number}
                    </button>
                ))}

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${currentPage === totalPages
                            ? "text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
