import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface Artwork {
  objectID: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
}

const ArtGallery: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetching a list of artwork IDs
        const idsResponse = await axios.get(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );

        const artworkIds = idsResponse.data.objectIDs.slice(0, 10); // Fetching only the first 10 artworks

        // Fetching details for each artwork ID
        const artworkPromises = artworkIds.map((id: number) =>
          axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          )
        );

        const artworksData = await Promise.all(artworkPromises);

        // Filtering artworks with images
        const fetchedArtworks: Artwork[] = artworksData
          .map((response) => response.data)
          .filter((artwork) => artwork.primaryImage);

        setArtworks(fetchedArtworks);
      } catch (err) {
        setError("Failed to load artworks.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  if (loading) return <div>Loading artworks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
      }}
    >
      {artworks.map((artwork) => (
        <div
          key={artwork.objectID}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            maxWidth: "300px",
            textAlign: "center",
          }}
        >
          <Link to={`/artwork/${artwork.objectID}`}>
            <img
              src={artwork.primaryImage}
              alt={artwork.title}
              style={{ maxWidth: "100%", borderRadius: "8px" }}
            />
            <h3>{artwork.title}</h3>
          </Link>
          <p>{artwork.artistDisplayName || "Unknown Artist"}</p>
          <p>{artwork.objectDate}</p>
        </div>
      ))}
    </div>
  );
};

export default ArtGallery;
