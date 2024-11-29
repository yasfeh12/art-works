import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ArtGallery from "../components/ArtGallery";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const FALLBACK_IMAGE = "https://via.placeholder.com/800x400?text=No+Image";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [carouselArtworks, setCarouselArtworks] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      alert("Please enter a search query.");
      return;
    }

    try {
      const response = await axios.get(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(
          searchQuery
        )}`
      );

      if (response.data.objectIDs && response.data.objectIDs.length > 0) {
        const limitedResults = response.data.objectIDs.slice(0, 50); // Limit to the first 50 results (change if needed for optimzied speed...still need testing)
        const artworks = await Promise.all(
          limitedResults.map((id: number) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
              .catch((err) => {
                console.error(`Error fetching artwork with ID ${id}:`, err);
                return null; // Ignore failed requests
              })
          )
        );

        // Filter out null values in case of failed requests
        const validArtworks = artworks.filter((artwork) => artwork !== null);

        // Navigate to the search results page with the fetched artworks
        navigate("/search-results", { state: { artworks: validArtworks } });
      } else {
        alert("No artworks found for your search query.");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("An error occurred while searching. Please try again.");
    }
  };

  // Fetch artworks for the carousel on initial load
  useEffect(() => {
    const fetchCarouselArtworks = async () => {
      try {
        const response = await axios.get(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects`
        );

        const objectIDs = response.data.objectIDs.slice(0, 10); // Fetch 10 artworks for the carousel
        const artworks = await Promise.all(
          objectIDs.map((id: number) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
              .catch((err) => {
                console.error(`Error fetching artwork with ID ${id}:`, err);
                return null;
              })
          )
        );

        setCarouselArtworks(artworks.filter((artwork) => artwork !== null));
      } catch (error) {
        console.error("Error fetching carousel artworks:", error);
      }
    };

    fetchCarouselArtworks();
  }, []);

  return (
    <div className="container">
      <h1 className="my-4 text-center">
        Welcome to the MET Museum Art Gallery
      </h1>
      <div className="mb-4 text-center">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search for an artist or artwork"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary mt-2" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div
        id="artCarousel"
        className="carousel slide mb-5"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {carouselArtworks.map((artwork, index) => (
            <div
              key={artwork.objectID}
              className={`carousel-item ${index === 0 ? "active" : ""}`}
            >
              <img
                src={artwork.primaryImage || FALLBACK_IMAGE}
                className="d-block w-100"
                alt={artwork.title}
                style={{
                  maxHeight: "500px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>{artwork.title}</h5>
                <p>{artwork.artistDisplayName || "Unknown Artist"}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#artCarousel"
          data-bs-slide="prev"
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#artCarousel"
          data-bs-slide="next"
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <ArtGallery />
    </div>
  );
};

export default Home;
