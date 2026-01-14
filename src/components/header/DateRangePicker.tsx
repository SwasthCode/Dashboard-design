import React, { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";

const DateRangePicker: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date(2022, 0, 1)); // January 2022
    const [startDate, setStartDate] = useState<Date | null>(new Date(2022, 0, 20));
    const [endDate, setEndDate] = useState<Date | null>(new Date(2022, 1, 9));

    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const isDateInRange = (date: Date) => {
        if (!startDate || !endDate) return false;
        return date >= startDate && date <= endDate;
    };

    const isStartDate = (date: Date) => {
        return startDate && date.toDateString() === startDate.toDateString();
    };

    const isEndDate = (date: Date) => {
        return endDate && date.toDateString() === endDate.toDateString();
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        if (!startDate || (startDate && endDate)) {
            setStartDate(selectedDate);
            setEndDate(null);
        } else if (selectedDate < startDate) {
            setStartDate(selectedDate);
        } else {
            setEndDate(selectedDate);
        }
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const prevMonthDays = getDaysInMonth(year, month - 1);

        const days = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push(
                <div
                    key={`prev-${i}`}
                    className="h-10 w-full flex items-center justify-center text-gray-400 text-sm"
                >
                    {prevMonthDays - i}
                </div>
            );
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const inRange = isDateInRange(date);
            const start = isStartDate(date);
            const end = isEndDate(date);

            days.push(
                <div
                    key={i}
                    onClick={() => handleDateClick(i)}
                    className={`h-10 w-full flex items-center justify-center cursor-pointer text-sm relative transition-colors
            ${inRange ? "bg-blue-50 dark:bg-blue-500/10" : "hover:bg-gray-100 dark:hover:bg-gray-800"}
            ${start ? "!bg-blue-600 text-white rounded-l-lg" : ""}
            ${end ? "!bg-blue-600 text-white rounded-r-lg" : ""}
            ${!start && !end && inRange ? "text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"}
            ${i === 1 && !start && !end ? "font-bold" : ""}
          `}
                >
                    {i}
                </div>
            );
        }

        // Next month days
        const totalSlots = 42;
        const remainingSlots = totalSlots - days.length;
        for (let i = 1; i <= remainingSlots; i++) {
            days.push(
                <div
                    key={`next-${i}`}
                    className="h-10 w-full flex items-center justify-center text-gray-400 text-sm"
                >
                    {i}
                </div>
            );
        }

        return days;
    };

    const formatDateRange = () => {
        if (!startDate) return "Select Date";
        const startStr = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
        if (!endDate) return `${startStr} - ...`;
        const endStr = endDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });
        return `${startStr} - ${endStr}`;
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.05] dropdown-toggle"
            >
                <svg
                    className="w-5 h-5 text-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M15.8333 3.33333H4.16667C3.24619 3.33333 2.5 4.07952 2.5 5V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V5C17.5 4.07952 16.7538 3.33333 15.8333 3.33333Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M13.3334 1.66667V5M6.66675 1.66667V5M2.5 8.33333H17.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span>{formatDateRange()}</span>
            </button>

            <Dropdown
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                className="absolute right-0 mt-2 w-80 p-5"
            >
                <div className="flex items-center justify-between mb-5">
                    <button
                        onClick={handlePrevMonth}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20">
                            <path
                                d="M12.5 15L7.5 10L12.5 5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                        {currentDate.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h3>
                    <button
                        onClick={handleNextMonth}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20">
                            <path
                                d="M7.5 5L12.5 10L7.5 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-y-1 mb-2">
                    {daysOfWeek.map((day) => (
                        <div
                            key={day}
                            className="h-8 flex items-center justify-center text-xs font-medium text-gray-400"
                        >
                            {day}
                        </div>
                    ))}
                    {renderDays()}
                </div>
            </Dropdown>
        </div>
    );
};

export default DateRangePicker;
