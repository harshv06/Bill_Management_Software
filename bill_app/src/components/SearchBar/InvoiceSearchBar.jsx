import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value.toUpperCase();
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative">
      <div className="flex items-center bg-white rounded-lg border px-3 py-2 shadow-sm">
        <input
          type="text"
          placeholder="Search invoice number"
          value={searchTerm}
          onChange={handleSearch}
          className="flex-1 outline-none text-gray-700 placeholder-gray-500"
        />
        <FaSearch className="text-gray-400 ml-2" />
      </div>
    </div>
  );
};

export default SearchBar;
