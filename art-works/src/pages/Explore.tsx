import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Explore.css"; // Custom CSS file for extra styling

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
const FALLBACK_IMAGE = "https://via.placeholder.com/400x500?text=No+Image";

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
  const [sortBy, setSortBy] = useState<string>("date");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "https://collectionapi.metmuseum.org/public/collection/v1/departments"
        );
        setDepartments(response.data.departments);
      } catch (err) {
        setError("Failed to load departments.");
      }
    };

    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchArtworkIds = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${selectedDepartment}`
        );
        const ids = response.data.objectIDs.slice(0, MAX_ITEMS);
        setArtworkIds(ids);
        setTotalPages(Math.ceil(ids.length / ITEMS_PER_PAGE));
      } catch (err) {
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworkIds();
  }, [selectedDepartment]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const idsToFetch = artworkIds.slice(start, start + ITEMS_PER_PAGE);

        const responses = await Promise.all(
          idsToFetch.map((id) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
          )
        );

        const validArtworks = responses
          .filter((art) => art.primaryImage)
          .map((art) => ({
            objectID: art.objectID,
            primaryImage: art.primaryImage,
            title: art.title,
            artistDisplayName: art.artistDisplayName || "Unknown Artist",
            objectDate: art.objectDate || "Unknown Date",
          }));

        const sortedArtworks = [...validArtworks].sort((a, b) => {
          if (sortBy === "date") {
            return a.objectDate.localeCompare(b.objectDate);
          } else if (sortBy === "title") {
            return a.title.localeCompare(b.title);
          } else if (sortBy === "artist") {
            return a.artistDisplayName.localeCompare(b.artistDisplayName);
          }
          return 0;
        });

        setArtworks(sortedArtworks);
      } catch (err) {
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    if (artworkIds.length > 0) {
      fetchArtworks();
    }
  }, [currentPage, artworkIds, sortBy]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Current Explore</h1>
      <div className="d-flex justify-content-center align-items-center gap-4 mb-4">
        <input
          type="text"
          className="form-control w-50"
          placeholder="Search by artwork or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setCurrentPage(1)}>
          Search
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <label htmlFor="department" className="form-label m-0">
            Department:
          </label>
          <select
            id="department"
            className="form-select"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(Number(e.target.value))}
          >
            {departments.map((dept) => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="d-flex align-items-center gap-3">
          <label htmlFor="sortBy" className="form-label m-0">
            Sort By:
          </label>
          <select
            id="sortBy"
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center">Loading artworks...</div>
      ) : error ? (
        <div className="text-center text-danger">{error}</div>
      ) : (
        <div className="row g-4">
          {artworks.map((art) => (
            <div className="col-md-6 col-lg-4" key={art.objectID}>
              <Link
                to={`/artwork/${art.objectID}`}
                className="text-decoration-none"
              >
                <div className="card h-100 shadow hover-zoom">
                  <img
                    src={art.primaryImage || FALLBACK_IMAGE}
                    className="card-img-top"
                    alt={art.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{art.title}</h5>
                    <p className="card-text">{art.artistDisplayName}</p>
                    <p className="card-text text-muted">{art.objectDate}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="d-flex justify-content-center mt-4">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Explore;
