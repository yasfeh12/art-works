import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import Carousel from "../components/Carousel";

const FALLBACK_IMAGE = "https://via.placeholder.com/400x300?text=No+Image";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [artworks, setArtworks] = useState<any[]>([]);
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
        const artworksData = await Promise.all(
          limitedResults.map((id: number) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
              .catch(() => null)
          )
        );

        const validArtworks = artworksData.filter(
          (artwork) => artwork && artwork.primaryImage
        );

        navigate("/search-results", { state: { artworks: validArtworks } });
      } else {
        alert("No artworks found for your search query.");
      }
    } catch {
      alert("An error occurred while searching. Please try again.");
    }
  };

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get(
          "https://collectionapi.metmuseum.org/public/collection/v1/objects"
        );

        const objectIDs = response.data.objectIDs.slice(0, 8);
        const artworksData = await Promise.all(
          objectIDs.map((id: number) =>
            axios
              .get(
                `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
              )
              .then((res) => res.data)
              .catch(() => null)
          )
        );

        const validArtworks = artworksData.filter(
          (artwork) => artwork && artwork.primaryImage
        );

        setArtworks(validArtworks);
      } catch {
        console.error("Error fetching artworks.");
      }
    };

    fetchArtworks();
  }, []);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1 className="hero-title">Welcome to the Art Explorer</h1>
        <p className="hero-subtitle">
          Discover and explore thousands of artworks from renowned collections,
          powered by APIs like the MET Museum.
        </p>
        <div className="search-bar">
          <input
            type="text"
            className="form-control"
            placeholder="Search for an artist or artwork"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <div className="artworks-section">
        <h2 className="section-title">Featured Artworks</h2>
        <Carousel />
        <div className="artworks-grid">
          {artworks.map((artwork) => (
            <div className="artwork-card" key={artwork.objectID}>
              <img
                src={artwork.primaryImage || FALLBACK_IMAGE}
                alt={artwork.title || "Artwork"}
                className="artwork-image"
              />
              <div className="artwork-info">
                <h5 className="artwork-title">{artwork.title || "Untitled"}</h5>
                <p className="artwork-artist">
                  {artwork.artistDisplayName || "Unknown Artist"}
                </p>
                <p className="artwork-date">
                  {artwork.objectDate || "Unknown Date"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
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
