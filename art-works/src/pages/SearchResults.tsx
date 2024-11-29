import React from "react";
import { Link, useLocation } from "react-router-dom";

const FALLBACK_IMAGE = "https://via.placeholder.com/400x500?text=No+Image";

const SearchResults: React.FC = () => {
  const location = useLocation();
  const artworks = location.state?.artworks || []; // Access artworks from React Router state

  if (artworks.length === 0) {
    return (
      <div className="container text-center" style={{ marginTop: "100px" }}>
        <h1 className="my-4">No Results Found</h1>
        <p>Try searching for a different artwork or artist.</p>
        <Link to="/" className="btn btn-primary mt-3">
          Go Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="my-4 text-center">Search Results</h1>
      <div className="row g-3">
        {artworks.map((artwork: any) => (
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
    </div>
  );
};

export default SearchResults;
