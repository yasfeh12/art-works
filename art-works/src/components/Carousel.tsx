import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Carousel.css";
import churchLady from "../assets/church-lady.webp";
import garden from "../assets/garden.webp";
import goghPort from "../assets/gogh-port.jpg";
import gothic from "../assets/gothic.jpg";
import monaLisa from "../assets/Mona_Lisa.jpg";

const placeholderImages = [churchLady, garden, goghPort, gothic, monaLisa];

const Carousel: React.FC = () => {
  return (
    <div
      id="featuredCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
    >
      <div className="carousel-inner">
        {placeholderImages.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === 0 ? "active" : ""}`}
          >
            <img
              src={image}
              className="d-block w-100"
              alt={`Placeholder ${index + 1}`}
              style={{
                objectFit: "contain",
                height: "400px",
              }}
            />
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#featuredCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#featuredCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
};

export default Carousel;
