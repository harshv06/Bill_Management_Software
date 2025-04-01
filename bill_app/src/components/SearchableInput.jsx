import { useState, useEffect, useRef } from "react";

const SearchableInput = ({ options, value, onChange, placeholder }) => {
  const [searchTerm, setSearchTerm] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const optionsRef = useRef([]);

  // Update filtered options when options prop changes
  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    // Filter options based on input
    const filtered = options.filter((option) =>
      option.toLowerCase().includes(input.toLowerCase())
    );
    setFilteredOptions(filtered);
    setIsOpen(true);
    setActiveIndex(-1);
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    setSearchTerm(option);
    onChange(option);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prevIndex) =>
        prevIndex < filteredOptions.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleOptionSelect(filteredOptions[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && optionsRef.current[activeIndex]) {
      optionsRef.current[activeIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeIndex]);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        onFocus={() => {
          setIsOpen(true);
          setFilteredOptions(options);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full border rounded p-1 text-xs"
      />
      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-10 w-full max-h-60 overflow-y-auto border rounded mt-1 bg-white shadow-lg">
          {filteredOptions.map((option, index) => (
            <div
              key={index}
              ref={(el) => (optionsRef.current[index] = el)}
              onClick={() => handleOptionSelect(option)}
              className={`
                px-2 py-1 text-xs cursor-pointer 
                ${activeIndex === index ? "bg-blue-100" : "hover:bg-gray-100"}
              `}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchableInput;
