import { useState, useEffect, useRef, ReactNode } from "react";
import Input from "../form/input/InputField";
import DatePicker from "../form/date-picker";
import { FilterIcon, CloseIcon } from "../../icons";

interface FilterState {
    search: string;
    startDate: string;
    endDate: string;
    status?: string;
}

interface TableFilterProps {
    onFilterChange: (state: FilterState) => void;
    placeholder?: string;
    children?: ReactNode;
}

export default function TableFilter({ onFilterChange, placeholder = "Search...", children }: TableFilterProps) {
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    // Use ref to keep track of the latest callback without triggering effect
    const onFilterChangeRef = useRef(onFilterChange);

    useEffect(() => {
        onFilterChangeRef.current = onFilterChange;
    }, [onFilterChange]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce search and filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChangeRef.current({ search, startDate, endDate });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, startDate, endDate]);

    const handleStartDateChange = (_dates: Date[], dateStr: string) => {
        setStartDate(dateStr);
    };

    const handleEndDateChange = (_dates: Date[], dateStr: string) => {
        setEndDate(dateStr);
    };

    const clearFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        // If children have their own state (managed by parent), we can't clear them here easily 
        // without a clear callback prop. But for now this clears the TableFilter managed state.
    };

    const hasActiveFilters = search || startDate || endDate;

    return (
        <div className="mb-6" ref={filterRef}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Left: Search Bar */}
                <div className="relative w-full sm:max-w-md group">
                    <Input
                        placeholder={placeholder}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-11 pr-10 py-2.5 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:ring-brand-500/20 text-gray-800 dark:text-gray-100 placeholder-gray-400 w-full rounded-xl shadow-sm transition-all hover:shadow"
                    />
                    <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 rounded-full transition-all"
                        >
                            <CloseIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Compact Date Pickers */}
                    <div className="hidden md:flex items-center gap-2">
                         <div className="w-32">
                            <DatePicker
                                id="filter-start-date"
                                placeholder="Start Date"
                                onChange={handleStartDateChange}
                                defaultDate={startDate}
                            />
                        </div>
                        <span className="text-gray-400">-</span>
                        <div className="w-32">
                             <DatePicker
                                id="filter-end-date"
                                placeholder="End Date"
                                onChange={handleEndDateChange}
                                defaultDate={endDate}
                            />
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 border shadow-sm ${isFilterOpen || (startDate || endDate)
                                    ? "bg-white text-brand-600 border-brand-200 dark:bg-gray-900 dark:border-brand-500/30 dark:text-brand-400 ring-4 ring-brand-500/5"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                                }`}
                        >
                            <FilterIcon className={`w-5 h-5 transition-transform duration-200 ${isFilterOpen ? 'rotate-0' : ''}`} />
                            <span className="text-sm font-semibold hidden sm:inline-block">Filters</span>
                        </button>

                        {/* Dropdown Menu */}
                        <div className={`absolute right-0 top-full mt-2 w-full sm:w-[300px] z-50 transform transition-all duration-200 origin-top-right ${isFilterOpen
                                ? "scale-100 opacity-100 visible"
                                : "scale-95 opacity-0 invisible pointer-events-none"
                            }`}>
                            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden ring-1 ring-black/5">
                                <div className="p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Filter Options
                                        </h3>
                                        {hasActiveFilters && (
                                            <button
                                                type="button"
                                                onClick={clearFilters}
                                                className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                    
                                    {/* Mobile Date Pickers (visible only on small screens) */}
                                    <div className="md:hidden space-y-3 mb-4">
                                         <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                                                Start Date
                                            </label>
                                            <DatePicker
                                                id="filter-start-date-mobile"
                                                placeholder="Start Date"
                                                onChange={handleStartDateChange}
                                                defaultDate={startDate}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                                                End Date
                                            </label>
                                            <DatePicker
                                                id="filter-end-date-mobile"
                                                placeholder="End Date"
                                                onChange={handleEndDateChange}
                                                defaultDate={endDate}
                                            />
                                        </div>
                                    </div>

                                    {children}
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsFilterOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm shadow-brand-500/20 transition-all active:scale-95"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
