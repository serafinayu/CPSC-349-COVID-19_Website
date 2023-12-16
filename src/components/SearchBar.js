import React, { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Enter country or area name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
};

// Define PropTypes for SearchBar
SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired, // Indicates onSearch is a required function
};

export default SearchBar;
