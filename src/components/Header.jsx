import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import img from "./images/logo.webp";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import FormModal from "../PopupModal/FormModal";

function Header({ scrollToProduct, scrollToAbout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");

  const isSaleActive =
    location.pathname === "/buy" || location.pathname.startsWith("/buy/");
  const isRentActive =
    location.pathname === "/rent" || location.pathname.startsWith("/rent/");
  const isSearchPage = location.pathname.startsWith("/search/results");
  const isProductPage = location.pathname.startsWith("/product/");
  const isCatalogPage = isSaleActive || isRentActive || isSearchPage || isProductPage;

  useEffect(() => {
    setCatalogSearch(searchParams.get("q") || searchParams.get("search") || "");
  }, [searchParams]);

  const closeMenu = () => setIsOpen(false);

  const handleAboutClick = (event) => {
    closeMenu();
    event.preventDefault();
    navigate("/");
    setTimeout(() => scrollToAbout?.(), 0);
  };

  const handleProductsClick = (event) => {
    closeMenu();
    event.preventDefault();
    navigate("/");
    setTimeout(() => scrollToProduct?.(), 0);
  };

  const handleCatalogSearch = (event) => {
    event.preventDefault();
    const nextSearch = catalogSearch.trim();
    const params = new URLSearchParams();
    params.set("store_id", "5");

    if (nextSearch) {
      params.set("q", nextSearch);
    }

    navigate(`/search/results?${params.toString()}`);
  };

  return (
    <div className="header-shell">
      <header className="header">
        <div onClick={() => navigate("/")}>
          <img src={img} className="header-img" alt="Site Exit" />
        </div>

        <nav className={`nav ${isOpen ? "active" : "close"}`}>
          <Link onClick={closeMenu} to="/">
            Home
          </Link>
          <Link onClick={handleAboutClick} to="/">
            About Us
          </Link>
          <Link onClick={handleProductsClick} to="/">
            Products
          </Link>
          <Link
            onClick={closeMenu}
            to="/buy"
            className={isSaleActive ? "nav-mode-active" : ""}
          >
            Sale
          </Link>
          <Link
            onClick={closeMenu}
            to="/rent"
            className={isRentActive ? "nav-mode-active" : ""}
          >
            Rent
          </Link>
          <Link onClick={closeMenu} to="/contact">
            Contact Us
          </Link>
        </nav>

        <div className="right-container">
          {isCatalogPage && (
            <form className="header-search" onSubmit={handleCatalogSearch}>
              <input
                type="search"
                value={catalogSearch}
                placeholder="What are you searching for?"
                onChange={(event) => setCatalogSearch(event.target.value)}
              />
              <button type="submit" aria-label="Search">
                <FiSearch />
              </button>
            </form>
          )}
          <button className="cta-button" type="button" onClick={() => setShow(true)}>
            REQUEST A CALL
          </button>
          <div className="icon-container" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <IoClose className="react-icon" />
            ) : (
              <GiHamburgerMenu className="react-icon" />
            )}
          </div>
        </div>
      </header>

      <FormModal show={show} setShow={setShow} />
    </div>
  );
}

export default Header;
