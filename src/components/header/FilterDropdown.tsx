import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

const FilterDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const options = [
        "Direct VS Indirect",
        "Real Time Value",
        "Top Channels",
        "Sales VS Refunds",
        "Last Order",
        "Total Spent",
    ];

    const handleCheckboxChange = (option: string) => {
        setSelectedFilters((prev) =>
            prev.includes(option)
                ? prev.filter((item) => item !== option)
                : [...prev, option]
        );
    };

    const handleClear = () => {
        setSelectedFilters([]);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.05] dropdown-toggle"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path
                        d="M2.5 5.83333H17.5M5 10H15M7.5 14.1667H12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="absolute right-0 mt-2 w-64 p-4"
            >
                <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Filters
                    </h4>
                    <div className="space-y-3">
                        {options.map((option) => (
                            <label
                                key={option}
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={selectedFilters.includes(option)}
                                        onChange={() => handleCheckboxChange(option)}
                                    />
                                    <div
                                        className={`w-5 h-5 border rounded-md transition-colors ${selectedFilters.includes(option)
                                                ? "bg-brand-500 border-brand-500"
                                                : "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600 group-hover:border-brand-400"
                                            }`}
                                    >
                                        {selectedFilters.includes(option) && (
                                            <svg
                                                className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M10 3L4.5 8.5L2 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 text-sm font-medium text-red-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-transparent dark:border-gray-800 dark:hover:bg-gray-800"
                    >
                        Clear
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                        Apply
                    </button>
                </div>
            </Dropdown>
        </div>
    );
};

export default FilterDropdown;
