// components/DateFilter.js
import React, { useState, useEffect } from "react";

const DateFilter = ({ onDateFilterChange, onExportFilteredData }) => {
  const [dateFilter, setDateFilter] = useState("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  useEffect(() => {
    const now = new Date();
    let startDate, endDate;

    switch (dateFilter) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(12, 0, 0, 0); // Start at today's 12 PM
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(11, 59, 59, 999); // Next day 11:59 AM
        break;

      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(12, 0, 0, 0); // Yesterday 12 PM
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        endDate.setHours(11, 59, 59, 999); // Today 11:59 AM
        break;

      case "week":
        endDate = new Date(now);
        endDate.setHours(11, 59, 59, 999);
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 7);
        startDate.setHours(12, 0, 0, 0);
        break;

      case "month":
        // Month starts from first day 12PM → last day next month's 12PM
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 12, 0, 0, 0);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          1,
          11,
          59,
          59,
          999
        );
        endDate.setDate(endDate.getDate() - 1);
        break;

      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          startDate.setHours(12, 0, 0, 0); // Start 12 PM of chosen start day
          endDate = new Date(customEndDate);
          endDate.setDate(endDate.getDate() + 1);
          endDate.setHours(11, 59, 59, 999); // End 11:59 AM of next day
        }
        break;

      case "monthly":
        if (selectedMonth && selectedYear) {
          const monthIndex = months.indexOf(selectedMonth);
          startDate = new Date(selectedYear, monthIndex, 1, 12, 0, 0, 0);
          endDate = new Date(selectedYear, monthIndex + 1, 1, 11, 59, 59, 999);
          endDate.setDate(endDate.getDate() - 1);
        }
        break;

      default:
        startDate = null;
        endDate = null;
        break;
    }

    onDateFilterChange({
      type: dateFilter,
      startDate,
      endDate,
      selectedMonth,
      selectedYear,
    });
  }, [dateFilter, customStartDate, customEndDate, selectedMonth, selectedYear]);

  const handleFilterChange = (filterType) => {
    setDateFilter(filterType);
    if (filterType !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
    }
    if (filterType !== "monthly") {
      setSelectedMonth("");
    }
  };

  const clearFilters = () => {
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setSelectedMonth("");
    setSelectedYear(new Date().getFullYear());
  };

  const getFilterDisplayText = () => {
    switch (dateFilter) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "week":
        return "Last 7 Days";
      case "month":
        return "This Month";
      case "custom":
        return `Custom: ${customStartDate} to ${customEndDate}`;
      case "monthly":
        return `${selectedMonth} ${selectedYear}`;
      default:
        return "All Time";
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-[#404040] mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-[#f5f5f5] text-lg font-semibold">Date Filter</h3>
          <p className="text-[#a0a0a0] text-sm">
            Filter analytics data by date range
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#60a5fa] text-sm font-medium">
            Active: {getFilterDisplayText()}
          </span>
          <button
            onClick={clearFilters}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            Clear
          </button>
          <button
            onClick={() =>
              onExportFilteredData(dateFilter, {
                customStartDate,
                customEndDate,
                selectedMonth,
                selectedYear,
              })
            }
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-2"
          >
            Export
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 mb-4">
        {[
          "all",
          "today",
          "yesterday",
          "week",
          "month",
          "monthly",
          "custom",
        ].map((filter) => {
          const labels = {
            all: "All Time",
            today: "Today",
            yesterday: "Yesterday",
            week: "Last 7 Days",
            month: "This Month",
            monthly: "Specific Month",
            custom: "Custom Range",
          };
          return (
            <button
              key={filter}
              onClick={() => handleFilterChange(filter)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === filter
                  ? "bg-[#60a5fa] text-white"
                  : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
              }`}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>

      {/* Custom Date Range */}
      {dateFilter === "custom" && (
        <div className="bg-[#262626] p-4 rounded-lg mb-3">
          <h4 className="text-[#f5f5f5] font-medium mb-3">Custom Date Range</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#60a5fa]"
              />
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#60a5fa]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Selection */}
      {dateFilter === "monthly" && (
        <div className="bg-[#262626] p-4 rounded-lg">
          <h4 className="text-[#f5f5f5] font-medium mb-3">
            Select Month & Year
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#60a5fa]"
              >
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[#a0a0a0] text-sm mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#404040] rounded-lg text-[#f5f5f5] focus:outline-none focus:border-[#60a5fa]"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
