import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "animate.css";

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

        const idsResponse = await axios.get(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );

        const artworkIds = idsResponse.data.objectIDs.slice(0, 10);

        const artworkPromises = artworkIds.map((id: number) =>
          axios.get(
            `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
          )
        );

        const artworksData = await Promise.all(artworkPromises);

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
    <div className="row g-4">
      {artworks.map((artwork) => (
        <div className="col-md-4" key={artwork.objectID}>
          <Link
            to={`/artwork/${artwork.objectID}`}
            className="text-decoration-none"
          >
            <div className="card h-100 animate__animated animate__fadeIn">
              <img
                src={artwork.primaryImage}
                alt={artwork.title}
                className="card-img-top"
                style={{ height: "300px", objectFit: "cover" }}
              />
              <div className="card-body">
                <h5 className="card-title">{artwork.title}</h5>
                <p className="card-text">
                  {artwork.artistDisplayName || "Unknown Artist"}
                </p>
                <p className="card-text text-muted">{artwork.objectDate}</p>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ArtGallery;
