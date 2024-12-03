import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ArtworkDetails from "./pages/ArtworkDetails";
import Exhibition from "./pages/Exhibition";
import Explore from "./pages/Explore";
import SearchResults from "./pages/SearchResults";
import Favourites from "./pages/Favourites";

function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artwork/:id" element={<ArtworkDetails />} />
        <Route path="/exhibition" element={<Exhibition />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/favourites" element={<Favourites />} />
        <Route
          path="/search-results"
          element={<SearchResults artworks={searchResults} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
