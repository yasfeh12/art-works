import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase">Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <Link to="/" className="text-light text-decoration-none">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/exhibition"
                  className="text-light text-decoration-none"
                >
                  Exhibition
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-light text-decoration-none">
                  Explore
                </Link>
              </li>
              <li>
                <Link
                  to="/favourites"
                  className="text-light text-decoration-none"
                >
                  Favourites
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase">About Art Explorer</h5>
            <p className="small">
              Art Explorer allows users to discover art from the MET Museum and
              other collections. Dive into the beauty of art from various
              cultures and eras.
            </p>
          </div>

          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase">Follow Us</h5>
            <div className="d-flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-light"
              >
                <FaFacebook size={24} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-light"
              >
                <FaTwitter size={24} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="text-light"
              >
                <FaInstagram size={24} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-light"
              >
                <FaGithub size={24} />
              </a>
            </div>
          </div>
        </div>
        <hr className="bg-light" />
        <div className="text-center small">
          &copy; {new Date().getFullYear()} Art Explorer. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
