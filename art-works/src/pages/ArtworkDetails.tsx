import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CSSTransition } from "react-transition-group";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ArtworkDetails.css";

interface Artwork {
  objectID?: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  dimensions: string;
  creditLine: string;
  culture: string;
}

const ArtworkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );

        setArtwork(response.data);
        setShowContent(true);
      } catch (err) {
        setError("Failed to load artwork details.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleAddToFavorites = () => {
    if (artwork) {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      const isAlreadyFavorited = favorites.some(
        (fav: Artwork) => fav.objectID === artwork.objectID
      );

      if (!isAlreadyFavorited) {
        favorites.push(artwork);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        alert("Artwork added to favorites!");
      } else {
        alert("Artwork is already in favorites.");
      }
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-center text-danger" style={{ padding: "20px" }}>
        {error}
      </div>
    );

  return artwork ? (
    <CSSTransition
      in={showContent}
      timeout={500}
      classNames="fade"
      unmountOnExit
    >
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-9">
            <img
              src={
                artwork.primaryImage ||
                "https://via.placeholder.com/800x600?text=No+Image"
              }
              alt={artwork.title}
              className="img-fluid shadow-lg rounded"
            />
          </div>
          <div className="col-md-3">
            <div className="artwork-details bg-light p-4 rounded shadow-lg">
              <h2 className="text-center mb-4">
                {artwork.title || "Untitled"}
              </h2>
              <p>
                <strong>Artist:</strong>{" "}
                {artwork.artistDisplayName || "Unknown Artist"}
              </p>
              <p>
                <strong>Date:</strong> {artwork.objectDate || "Unknown Date"}
              </p>
              <p>
                <strong>Medium:</strong> {artwork.medium || "Unknown Medium"}
              </p>
              <p>
                <strong>Dimensions:</strong>{" "}
                {artwork.dimensions || "Unknown Dimensions"}
              </p>
              <p>
                <strong>Culture:</strong> {artwork.culture || "Unknown Culture"}
              </p>
              <p>
                <strong>Credit Line:</strong>{" "}
                {artwork.creditLine || "No credit information available"}
              </p>
              <button
                className="btn btn-warning w-100 mb-2"
                onClick={handleAddToFavorites}
              >
                Add to Favorites
              </button>
              <button
                className="btn btn-primary w-100"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  ) : (
    <div className="text-center mt-5">Artwork not found.</div>
  );
};

export default ArtworkDetails;
