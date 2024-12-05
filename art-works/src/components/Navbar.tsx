import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar-container">
      <ul className="navbar-list">
        <li className="navbar-item">
          <Link to="/" className="navbar-link">
            Home
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/explore" className="navbar-link">
            Explore
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/exhibition" className="navbar-link">
            Exhibition
          </Link>
        </li>
        <li className="navbar-item">
          <Link to="/favourites" className="navbar-link">
            Favourites
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
