import React from "react";
import { Filter, ArrowUpDown } from "lucide-react";

const CategoryFilter = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange, 
  sortOrder, 
  onSortChange 
}) => {
  return (
    <div className="flex flex-wrap gap-4 text-left">
      {/* Category Dropdown */}
      <div className="relative min-w-[130px]">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-luxury-border/30 rounded-xl text-xs outline-none focus:border-luxury-charcoal cursor-pointer appearance-none pr-8"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
          <Filter size={11} />
        </span>
      </div>

      {/* Sorting Dropdown */}
      <div className="relative min-w-[130px]">
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-luxury-border/30 rounded-xl text-xs outline-none focus:border-luxury-charcoal cursor-pointer appearance-none pr-8"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="largest">Largest Size</option>
          <option value="smallest">Smallest Size</option>
        </select>
        <span className="absolute inset-y-0 right-3 flex items-center text-gray-400 pointer-events-none">
          <ArrowUpDown size={11} />
        </span>
      </div>
    </div>
  );
};

export default CategoryFilter;
