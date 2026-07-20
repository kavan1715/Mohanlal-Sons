import React from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search documents..." }) => {
  return (
    <div className="relative flex-1 text-left">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
        <Search size={14} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-9 pr-9 py-2 bg-gray-50 border border-luxury-border/30 rounded-xl text-xs outline-none focus:border-luxury-charcoal focus:bg-white transition-all"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-luxury-muted hover:text-luxury-charcoal transition-all"
          title="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
