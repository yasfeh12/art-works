import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

interface Artwork {
  objectID: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
}

interface Department {
  departmentId: number;
  displayName: string;
}

const ITEMS_PER_PAGE = 12;
const MAX_ITEMS = 500;
const MAX_CONCURRENT_REQUESTS = 5;
const FALLBACK_IMAGE = "https://via.placeholder.com/400x500?text=No+Image";

const EXCLUDED_DEPARTMENTS = [
  "Modern Art",
  "Photographs",
  "American Decorative Arts",
  "The Costume Institute",
];

const Explore: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<number>(11);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [artworkIds, setArtworkIds] = useState<number[]>([]);
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();

  // Utility function to fetch data
  const fetchData = async (url: string) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      throw new Error("Failed to fetch data.");
    }
  };

  // Fetch departments on initial load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await fetchData(
          "https://collectionapi.metmuseum.org/public/collection/v1/departments"
        );

        const filteredDepartments = data.departments.filter(
          (dept: Department) => !EXCLUDED_DEPARTMENTS.includes(dept.displayName)
        );

        setDepartments(filteredDepartments);
      } catch (err) {
        setError("Failed to load departments. Please try again later.");
      }
    };

    fetchDepartments();
  }, []);

  // Fetch artwork IDs when department changes
  useEffect(() => {
    const fetchArtworkIds = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchData(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${selectedDepartment}`
        );

        if (!data.objectIDs || data.objectIDs.length === 0) {
          throw new Error("No objects found for this department.");
        }

        const limitedIds = data.objectIDs.slice(0, MAX_ITEMS);
        setArtworkIds(limitedIds);
        setTotalPages(Math.ceil(limitedIds.length / ITEMS_PER_PAGE));
      } catch (err) {
        setError(err.message || "Failed to load Explore.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworkIds();
  }, [selectedDepartment]);

  // Fetch artworks for the current page
  useEffect(() => {
    if (artworkIds.length === 0) return;

    const fetchArtworksForPage = async () => {
      try {
        setLoading(true);
        setError(null);

        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        let pageArtworkIds = artworkIds.slice(
          startIndex,
          startIndex + ITEMS_PER_PAGE
        );

        const fetchedArtworks: Artwork[] = [];
        let currentIndex = startIndex;

        while (
          fetchedArtworks.length < ITEMS_PER_PAGE &&
          currentIndex < artworkIds.length
        ) {
          const currentBatch = artworkIds.slice(
            currentIndex,
            currentIndex + MAX_CONCURRENT_REQUESTS
          );

          const responses = await Promise.allSettled(
            currentBatch.map((id) =>
              axios
                .get(
                  `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
                )
                .then((res) => res.data)
            )
          );

          responses.forEach((response) => {
            if (
              response.status === "fulfilled" &&
              response.value.primaryImage
            ) {
              fetchedArtworks.push({
                objectID: response.value.objectID,
                primaryImage: response.value.primaryImage,
                title: response.value.title,
                artistDisplayName:
                  response.value.artistDisplayName || "Unknown Artist",
                objectDate: response.value.objectDate,
              });
            }
          });

          currentIndex += MAX_CONCURRENT_REQUESTS;
        }

        setArtworks(fetchedArtworks.slice(0, ITEMS_PER_PAGE));
      } catch (err) {
        console.error(err);
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworksForPage();
  }, [currentPage, artworkIds]);

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a valid search term.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchResponse = await fetchData(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`
      );

      if (!searchResponse.objectIDs || searchResponse.objectIDs.length === 0) {
        setError("No results found. Try a different query.");
        return;
      }

      const limitedIds = searchResponse.objectIDs.slice(0, MAX_ITEMS);
      setArtworkIds(limitedIds);
      setTotalPages(Math.ceil(limitedIds.length / ITEMS_PER_PAGE));
      setCurrentPage(1);
    } catch (err) {
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center flex-wrap gap-3">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
          <div
            key={index}
            className="card"
            style={{
              width: "22rem",
              height: "28rem",
              backgroundColor: "#e0e0e0",
            }}
          />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="text-center">
        <h1>Error</h1>
        <p>{error}</p>
        <p>Try refreshing the page or searching again.</p>
      </div>
    );

  return (
    <div className="container">
      <h1 className="my-4 text-center">Current Explore</h1>
      <div className="mb-4 text-center">
        <form onSubmit={handleSearch} className="d-flex mb-4">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Search by artwork or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>
        <label htmlFor="department" className="form-label">
          Choose a Department:
        </label>
        <select
          id="department"
          className="form-select w-auto mx-auto"
          value={selectedDepartment}
          onChange={handleDepartmentChange}
        >
          {departments.map((dept) => (
            <option key={dept.departmentId} value={dept.departmentId}>
              {dept.displayName}
            </option>
          ))}
        </select>
      </div>
      <div className="row g-3">
        {artworks.map((artwork) => (
          <div className="col-md-6 col-lg-4" key={artwork.objectID}>
            <Link
              to={`/artwork/${artwork.objectID}`}
              className="text-decoration-none"
            >
              <div className="card h-100">
                <img
                  src={artwork.primaryImage || FALLBACK_IMAGE}
                  alt={artwork.title}
                  className="card-img-top"
                  style={{
                    height: "20rem",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
                <div className="card-body">
                  <h5 className="card-title">{artwork.title}</h5>
                  <p className="card-text">{artwork.artistDisplayName}</p>
                  <p className="card-text text-muted">{artwork.objectDate}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="btn btn-secondary me-2"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Explore;
