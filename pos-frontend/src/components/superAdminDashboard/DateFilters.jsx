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
        startDate.setHours(0, 0, 0, 0); // Start of today
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999); // End of today
        console.log("Today range:", startDate, endDate);
        break;

      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0); // Start of yesterday
        startDate = yesterday;

        endDate = new Date(yesterday);
        endDate.setHours(23, 59, 59, 999); // End of yesterday
        console.log("Yesterday range:", startDate, endDate);
        break;

      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = new Date(now);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "custom":
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        }
        break;
      case "monthly":
        if (selectedMonth && selectedYear) {
          const monthIndex = months.indexOf(selectedMonth);
          startDate = new Date(selectedYear, monthIndex, 1);
          endDate = new Date(selectedYear, monthIndex + 1, 0);
        }
        break;
      default: // 'all'
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
    // Reset custom dates when switching to non-custom filter
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
            Export
          </button>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
        <button
          onClick={() => handleFilterChange("all")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "all"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          All Time
        </button>
        <button
          onClick={() => handleFilterChange("today")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "today"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          Today
        </button>
        <button
          onClick={() => handleFilterChange("yesterday")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "yesterday"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => handleFilterChange("week")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "week"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handleFilterChange("month")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "month"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          This Month
        </button>
        <button
          onClick={() => handleFilterChange("monthly")}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            dateFilter === "monthly"
              ? "bg-[#60a5fa] text-white"
              : "bg-[#262626] text-[#f5f5f5] hover:bg-[#333]"
          }`}
        >
          Specific Month
        </button>
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
