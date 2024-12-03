import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  setArtworks: (artworks: any[]) => void;
  setError: (error: string | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ setArtworks, setError }) => {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a valid search term.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch artworks that match the search query
      const response = await axios.get(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`
      );

      if (response.data.total === 0) {
        setError("No results found. Try searching for something else.");
        return;
      }

      // Fetch details for the objectIDs returned by the search
      const fetchedArtworks: any[] = [];
      const objectIDs = response.data.objectIDs.slice(0, 50); // Limit to 50 results, this can be changed later when optiomizing.
      for (const id of objectIDs) {
        const artworkResponse = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );
        fetchedArtworks.push(artworkResponse.data);
      }

      setArtworks(fetchedArtworks);
      navigate("/search-results");
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <form onSubmit={handleSearch} className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search by artwork or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
