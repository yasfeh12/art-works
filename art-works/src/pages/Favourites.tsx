import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface Artwork {
  objectID?: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium?: string;
  dimensions?: string;
}

const Favourites: React.FC = () => {
  const [favorites, setFavorites] = useState<Artwork[]>([]);

  useEffect(() => {
    const savedFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavorites(savedFavorites);
  }, []);

  const handleRemove = (id: number | undefined) => {
    if (!id) return;

    const updatedFavorites = favorites.filter(
      (artwork) => artwork.objectID !== id
    );
    setFavorites(updatedFavorites);

    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    alert("Artwork removed from favorites!");
  };

  if (favorites.length === 0) {
    return <div className="text-center mt-5">No favorites added yet!</div>;
  }

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">My Favorites</h1>
      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        {favorites.map((artwork, index) => (
          <div key={artwork.objectID || index} className="col">
            <div className="card h-100 shadow-sm">
              <Link
                to={`/artwork/${artwork.objectID}`}
                className="text-decoration-none"
              >
                <img
                  src={
                    artwork.primaryImage ||
                    "https://via.placeholder.com/300x400?text=No+Image"
                  }
                  alt={artwork.title}
                  className="card-img-top"
                  style={{
                    height: "250px",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              </Link>
              <div className="card-body d-flex flex-column">
                <h5 className="card-title text-center mb-2">
                  {artwork.title || "Untitled"}
                </h5>
                <p className="card-text text-muted text-center">
                  {artwork.artistDisplayName || "Unknown Artist"}
                </p>
                <p className="card-text text-muted text-center">
                  {artwork.objectDate || "Unknown Date"}
                </p>
                <button
                  className="btn btn-danger mt-auto"
                  onClick={() => handleRemove(artwork.objectID)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourites;
