import { useState, useEffect, useRef, ReactNode } from "react";
import Input from "../form/input/InputField";
import DatePicker from "../form/date-picker";
import Select from "../form/Select";
import { CloseIcon } from "../../icons";

interface FilterState {
    search: string;
    startDate: string;
    endDate: string;
    [key: string]: string | undefined; // Allow dynamic filter keys
}

interface FilterOption {
    label: string;
    value: string;
}

interface FilterConfig {
    key: string;
    label: string;
    placeholder?: string;
    options: FilterOption[];
}

interface TableFilterProps {
    onFilterChange: (state: FilterState) => void;
    placeholder?: string;
    children?: ReactNode;
    className?: string;
    filters?: FilterConfig[];
}

export default function TableFilter({ onFilterChange, placeholder = "Search...", children, className = "", filters = [] }: TableFilterProps) {
    const [search, setSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [dynamicFilters, setDynamicFilters] = useState<Record<string, string>>({});

    // Use ref to keep track of the latest callback without triggering effect
    const onFilterChangeRef = useRef(onFilterChange);

    useEffect(() => {
        onFilterChangeRef.current = onFilterChange;
    }, [onFilterChange]);



    // Debounce search and filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChangeRef.current({ search, startDate, endDate, ...dynamicFilters });
        }, 500);
        return () => clearTimeout(timer);
    }, [search, startDate, endDate, dynamicFilters]);

    const handleDateRangeChange = (dates: Date[], _dateStr: string) => {
        if (dates.length === 2 && dates[0] && dates[1]) {
            // Ensure start date is beginning of day (just in case)
            const start = new Date(dates[0]);
            start.setHours(0, 0, 0, 0);

            // Ensure end date is end of day
            const end = new Date(dates[1]);
            end.setHours(23, 59, 59, 999);

            setStartDate(start.toISOString());
            setEndDate(end.toISOString());
        } else if (dates.length === 0) {
            setStartDate("");
            setEndDate("");
        }
    };

    const handleDynamicFilterChange = (key: string, value: string) => {
        setDynamicFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearDateFilter = () => {
        setStartDate("");
        setEndDate("");
    };

    const clearAllFilters = () => {
        setSearch("");
        setStartDate("");
        setEndDate("");
        setDynamicFilters({});
    };

    return (
        <div className={className}>
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

                    {/* Dynamic Filters */}
                    {filters.map((filter) => (
                        <div key={filter.key} className="w-full sm:w-40">
                            <Select
                                options={filter.options}
                                placeholder={filter.label}
                                value={dynamicFilters[filter.key] || ""}
                                onChange={(value) => handleDynamicFilterChange(filter.key, value)}
                                className="bg-white dark:bg-gray-900 w-full"
                            />
                        </div>
                    ))}

                    {children}

                    {/* Date Range Picker - Range Mode */}
                    <div className="relative w-full sm:w-64">
                        <DatePicker
                            key={`${startDate}-${endDate}`} // Force re-render on clear
                            id="date-range-filter"
                            mode="range"
                            placeholder="Start date  →  End date"
                            onChange={handleDateRangeChange}
                            defaultDate={startDate && endDate ? ([startDate, endDate] as any) : undefined}
                        />
                        {(startDate || endDate) && (
                            <button
                                type="button"
                                onClick={clearDateFilter}
                                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 rounded-full transition-all z-10"
                                title="Clear Dates"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Clear All Button */}
                    {/* {(search || startDate || endDate || Object.keys(dynamicFilters).length > 0) && (
                        <button
                            type="button"
                            onClick={clearAllFilters}
                            className="p-2.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            title="Clear All Filters"
                        >
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    )} */}
                </div>
            </div>
        </div>
    );
}
