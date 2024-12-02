import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        const limitedResults = response.data.objectIDs.slice(0, 10);
        const artworks = await Promise.all(
          limitedResults.map((id: number) =>
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

        // Filter artworks with valid images
        const validArtworks = artworks.filter(
          (artwork) =>
            artwork !== null &&
            artwork.primaryImage &&
            artwork.primaryImage !== ""
        );

        navigate("/search-results", { state: { artworks: validArtworks } });
      } else {
        alert("No artworks found for your search query.");
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("An error occurred while searching. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCarouselArtworks = async () => {
      try {
        const response = await axios.get(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );

        const objectIDs = response.data.objectIDs.slice(0, 10); // Fetch 10 artworks
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

        // Filter artworks with valid images
        const validArtworks = artworks.filter(
          (artwork) =>
            artwork && artwork.primaryImage && artwork.primaryImage !== ""
        );

        setCarouselArtworks(validArtworks);
      } catch (error) {
        console.error("Error fetching carousel artworks:", error);
      }
    };

    fetchCarouselArtworks();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Welcome to the Art Explorer</h1>
      <p className="text-center">
        Discover and explore thousands of artworks from renowned collections,
        powered by APIs like the MET Museum.
      </p>

      <div
        id="artCarousel"
        className="carousel slide mb-5"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {carouselArtworks.length > 0 ? (
            carouselArtworks.map((artwork, index) => (
              <div
                key={artwork.objectID}
                className={`carousel-item ${index === 0 ? "active" : ""}`}
              >
                <img
                  src={artwork.primaryImage || FALLBACK_IMAGE}
                  className="d-block w-100"
                  alt={artwork.title || "Artwork"}
                  style={{
                    maxHeight: "500px",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
                <div className="carousel-caption d-none d-md-block">
                  <h5>{artwork.title || "Untitled"}</h5>
                  <p>{artwork.artistDisplayName || "Unknown Artist"}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="carousel-item active">
              <img
                src={FALLBACK_IMAGE}
                className="d-block w-100"
                alt="Fallback"
                style={{
                  maxHeight: "500px",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              <div className="carousel-caption d-none d-md-block">
                <h5>No Artworks Available</h5>
              </div>
            </div>
          )}
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

      <div className="text-center mb-4">
        <input
          type="text"
          className="form-control w-50 mx-auto"
          placeholder="Search for an artist or artwork"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-primary mt-3" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="about-section text-center p-4 bg-light">
        <h2>About Art Explorer</h2>
        <p>
          Art Explorer uses APIs like the MET Museum to bring you a vast
          collection of artworks. With over 400,000 items in their database, the
          MET Museum API allows users to explore art from different cultures and
          eras. This platform is designed to inspire and educate art lovers
          around the world.
        </p>
      </div>
    </div>
  );
};

export default Home;
