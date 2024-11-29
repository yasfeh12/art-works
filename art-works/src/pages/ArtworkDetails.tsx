import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CSSTransition } from "react-transition-group"; // For animations
import "bootstrap/dist/css/bootstrap.min.css";
import "./ArtworkDetails.css"; // Custom styles and animations

interface Artwork {
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
  const [showContent, setShowContent] = useState<boolean>(false); // For animations

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );

        setArtwork(response.data);
        setShowContent(true); // Trigger animation
      } catch (err) {
        setError("Failed to load artwork details.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

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
          {/* Adjusted column sizes */}
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
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button
            className="btn btn-primary"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    </CSSTransition>
  ) : (
    <div className="text-center mt-5">Artwork not found.</div>
  );
};

export default ArtworkDetails;
