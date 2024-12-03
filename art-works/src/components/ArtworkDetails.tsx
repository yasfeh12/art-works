import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Artwork {
  objectID?: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
  medium: string;
  dimensions: string;
}

const ArtworkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );

        setArtwork(response.data);
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

  if (loading) return <div>Loading artwork details...</div>;
  if (error) return <div>{error}</div>;

  return artwork ? (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <img
        src={artwork.primaryImage}
        alt={artwork.title}
        style={{ maxWidth: "80%", borderRadius: "8px" }}
      />
      <h2>{artwork.title}</h2>
      <p>
        <strong>Artist:</strong> {artwork.artistDisplayName || "Unknown Artist"}
      </p>
      <p>
        <strong>Date:</strong> {artwork.objectDate}
      </p>
      <p>
        <strong>Medium:</strong> {artwork.medium}
      </p>
      <p>
        <strong>Dimensions:</strong> {artwork.dimensions}
      </p>
      <button className="btn btn-primary mt-3" onClick={handleAddToFavorites}>
        Add to Favorites
      </button>
    </div>
  ) : (
    <div>Artwork not found.</div>
  );
};

export default ArtworkDetails;
