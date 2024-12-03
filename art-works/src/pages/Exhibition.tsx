import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

interface Artwork {
  objectID?: number;
  primaryImage: string;
  title: string;
  artistDisplayName: string;
  objectDate: string;
}

const ITEMS_PER_PAGE = 12;
const MAX_ITEMS = 50;
const FALLBACK_IMAGE = "https://via.placeholder.com/400x500?text=No+Image";
const SMITHSONIAN_API_KEY = "qKuqy0bc4m1sJZ7OH35MajawQohz3Wncn3IahrOl";

const Exhibition: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");

  const fetchData = async (url: string) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (err) {
      console.error(`Error fetching data from ${url}:`, err);
      throw new Error("Failed to fetch data.");
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a valid search term.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: Artwork[] = [];

      // Fetch from MET Museum API
      const metSearchResponse = await fetchData(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${query}`
      );

      if (
        metSearchResponse.objectIDs &&
        metSearchResponse.objectIDs.length > 0
      ) {
        const metObjectIDs = metSearchResponse.objectIDs.slice(0, MAX_ITEMS);
        const metArtworks = await Promise.allSettled(
          metObjectIDs.map((id: number) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
          )
        );

        metArtworks.forEach((response) => {
          if (response.status === "fulfilled" && response.value.primaryImage) {
            results.push({
              objectID: response.value.objectID,
              primaryImage: response.value.primaryImage,
              title: response.value.title,
              artistDisplayName:
                response.value.artistDisplayName || "Unknown Artist",
              objectDate: response.value.objectDate || "Unknown Date",
            });
          }
        });
      }

      // Fetch from Smithsonian Institution API
      const smithsonianResponse = await fetchData(
        `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(
          query
        )}&rows=${MAX_ITEMS}&api_key=${SMITHSONIAN_API_KEY}`
      );

      const smithsonianResults = smithsonianResponse.response?.rows || [];
      smithsonianResults.forEach((artwork: any) => {
        const thumbnail =
          artwork.content?.descriptiveNonRepeating?.online_media?.media[0]
            ?.thumbnail;
        if (thumbnail) {
          results.push({
            primaryImage: thumbnail,
            title: artwork.title || "Untitled",
            artistDisplayName:
              artwork.content?.freetext?.name?.[0]?.content || "Unknown Artist",
            objectDate:
              artwork.content?.indexedStructured?.date?.[0] || "Unknown Date",
          });
        }
      });

      setArtworks(results);
    } catch (err) {
      console.error("Error fetching search results:", err);
      setError("Failed to fetch search results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;

  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <div className="container">
      <h1 className="my-4 text-center">Art Exhibition</h1>
      <form onSubmit={handleSearch} className="mb-4 text-center">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search for artworks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-primary mt-2" type="submit">
          Search
        </button>
      </form>

      <div className="row">
        {artworks.map((artwork, index) => (
          <div
            className="col-md-4 col-lg-3 mb-4"
            key={artwork.objectID || index}
          >
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
                    height: "300px",
                    objectFit: "cover",
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

export default Exhibition;
