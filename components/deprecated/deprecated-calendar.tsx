"use client";

import React, { useState, useRef, useEffect } from 'react';
import { CgChevronLeftR, CgChevronRightR } from "react-icons/cg";
import { GoChevronDown } from "react-icons/go";

type DropdownType = 'month' | 'year' | null;

const CalendarToolbar: React.FC<{
    currentDate: Date;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
}> = ({ currentDate, onMonthChange, onYearChange }) => {
    const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
    const [showMonthArrow, setShowMonthArrow] = useState(false);
    const [showYearArrow, setShowYearArrow] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 2019 }, (_, i) => currentYear - i);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDropdown = (type: DropdownType) => {
        setActiveDropdown(prevState => prevState === type ? null : type);
    };

    return (
        <div className="flex items-center" ref={dropdownRef}>
            <div className="relative">
                <button
                    className="flex items-center text-2xl font-bold"
                    onMouseEnter={() => setShowMonthArrow(true)}
                    onMouseLeave={() => setShowMonthArrow(false)}
                    onClick={() => toggleDropdown('month')}
                >
                    <span className="">{currentDate.toLocaleString('default', { month: 'long' })}</span>
                    <span className="w-4">
                        {showMonthArrow && <GoChevronDown size={16} />}
                    </span>
                </button>
                {activeDropdown === 'month' && (
                    <div className="absolute top-full left-0 bg-white dark:bg-boxdark border-2 border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 w-auto">
                        {months.map((month, index) => (
                            <div
                                key={month}
                                className="pl-2 pr-6 py-1 dark:bg-boxdark hover:bg-graydark hover:text-white dark:hover:text-black dark:hover:bg-white cursor-pointer"
                                onClick={() => {
                                    onMonthChange(index);
                                    setActiveDropdown(null);
                                }}
                            >
                                {month}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="relative">
                <button
                    className="flex items-center text-2xl font-bold"
                    onMouseEnter={() => setShowYearArrow(true)}
                    onMouseLeave={() => setShowYearArrow(false)}
                    onClick={() => toggleDropdown('year')}
                >
                    <span className="">{currentDate.getFullYear()}</span>
                    <span className="w-4">
                        {showYearArrow && <GoChevronDown size={16} />}
                    </span>
                </button>
                {activeDropdown === 'year' && (
                    <div className="absolute top-full left-0 bg-white dark:bg-boxdark border-2 border-gray-200 dark:border-gray-700 rounded shadow-lg z-10 w-auto">
                        {years.map((year) => (
                            <div
                                key={year}
                                className="pl-2 pr-6 py-1 dark:bg-boxdark hover:bg-graydark hover:text-white dark:hover:text-black dark:hover:bg-white cursor-pointer"
                                onClick={() => {
                                    onYearChange(year);
                                    setActiveDropdown(null);
                                }}
                            >
                                {year}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const MonthlyCalendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysArray = [];

        // Add days from previous month to fill the first week
        const firstDayOfWeek = firstDay.getDay();
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const prevMonthDay = new Date(year, month, -i);
            daysArray.push({ date: prevMonthDay, isCurrentMonth: false });
        }

        // Add days of the current month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            daysArray.push({ date: new Date(year, month, d), isCurrentMonth: true });
        }

        // Add days from next month to fill the last week
        const remainingDays = 7 - (daysArray.length % 7);
        if (remainingDays < 7) {
            for (let i = 1; i <= remainingDays; i++) {
                const nextMonthDay = new Date(year, month + 1, i);
                daysArray.push({ date: nextMonthDay, isCurrentMonth: false });
            }
        }

        return daysArray;
    };

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentDate(newDate);
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const isCurrentMonthOrFuture = () => {
        const now = new Date();
        return (
            currentDate.getFullYear() > now.getFullYear() ||
            (currentDate.getFullYear() === now.getFullYear() &&
                currentDate.getMonth() >= now.getMonth())
        );
    };

    const handleMonthChange = (month: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(month);
        setCurrentDate(newDate);
    };

    const handleYearChange = (year: number) => {
        const newDate = new Date(currentDate);
        newDate.setFullYear(year);
        setCurrentDate(newDate);
    };

    const renderCalendarDays = () => {
        const days = getDaysInMonth(currentDate);

        return (
            <div className="grid grid-cols-7 gap-0 ease relative border border-stroke dark:border-strokedark transition duration-500 flex-grow">
                {days.map(({ date, isCurrentMonth }, index) => (
                    <div
                        key={index}
                        className={`bg-white dark:bg-boxdark p-2 ease relative border border-stroke dark:border-strokedark transition duration-500
                            hover:bg-gray-2 dark:hover:bg-meta-4
                            ${isCurrentMonth
                                ? 'text-graydark dark:text-secondary'
                                : 'text-stroke dark:text-strokedark'
                            }`}
                    >
                        <span className="text-sm">{date.getDate()}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-boxdark text-gray-800 dark:text-gray-200">
            <div className="flex justify-between items-center p-4">
                <CalendarToolbar
                    currentDate={currentDate}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                />
                <div className="flex items-center">
                    <button onClick={() => changeMonth(-1)} className="p-1">
                        <CgChevronLeftR size={24} />
                    </button>
                    <button onClick={goToToday} className="px-2 text-sm font-medium text-primary dark:text-white rounded">
                        Today
                    </button>
                    <button
                        onClick={() => changeMonth(1)}
                        className={`p-1 ${isCurrentMonthOrFuture() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isCurrentMonthOrFuture()}
                    >
                        <CgChevronRightR size={24} />
                    </button>
                </div>
            </div>
            <div className="flex-grow flex flex-col">
                <div className="grid grid-cols-7 bg-primary text-white">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="p-2 text-right">
                            {day}
                        </div>
                    ))}
                </div>
                {renderCalendarDays()}
            </div>
        </div>
    );
};

export default MonthlyCalendar;