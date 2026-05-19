import React, { useEffect, useState } from "react";
import "./Header.css";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import img from "./images/logo.webp";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { FiHeart, FiSearch, FiShoppingCart, FiUser } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import FormModal from "../PopupModal/FormModal";
import axiosInstance from "../utils/axiosInstance";
import LoginModal from "./Login/Login";

const SEARCH_DEBOUNCE_MS = 250;

function Header({ scrollToProduct, scrollToAbout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [show, setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [profileName, setProfileName] = useState(localStorage.getItem("name") || "");
  const { buyCart = [], rentCart = [] } = useSelector((store) => store.cart || {});
  const wishlistItems = useSelector((store) => store.wishlist?.items || []);
  const cartCount = buyCart.length + rentCart.length;
  const wishlistCount = wishlistItems.length;

  const isSaleActive =
    location.pathname === "/buy" || location.pathname.startsWith("/buy/");
  const isRentActive =
    location.pathname === "/rent" || location.pathname.startsWith("/rent/");

  useEffect(() => {
    setCatalogSearch(searchParams.get("q") || searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const searchText = catalogSearch.trim();

    if (searchText.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const debounceTimer = setTimeout(() => {
      axiosInstance
        .get("catlog/search-keywords/", {
          params: { search: searchText },
        })
        .then((res) => {
          const nextSuggestions = Array.isArray(res.data?.suggestions)
            ? res.data.suggestions
            : [];
          setSuggestions(nextSuggestions);
        })
        .catch(() => {
          setSuggestions([]);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(debounceTimer);
  }, [catalogSearch]);

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
    setShowSuggestions(false);
    const params = new URLSearchParams();
    params.set("store_id", "5");

    if (nextSearch) {
      params.set("q", nextSearch);
    }

    navigate(`/search/results?${params.toString()}`);
  };

  const searchForSuggestion = (suggestion) => {
    const params = new URLSearchParams();
    params.set("store_id", "5");
    params.set("q", suggestion);
    setCatalogSearch(suggestion);
    setShowSuggestions(false);
    navigate(`/search/results?${params.toString()}`);
  };

  const handleLoginSuccess = (data) => {
    setProfileName(data?.name || localStorage.getItem("name") || "Customer");
    setShowLogin(false);
  };

  const handleLogout = () => {
    ["token", "userid", "name", "store_id"].forEach((key) => localStorage.removeItem(key));
    setProfileName("");
    closeMenu();
    toast.success("Logged out");
    navigate("/");
  };

  const profileInitial = (profileName || "Customer").charAt(0).toUpperCase();

  return (
    <div className="header-shell">
      <header className="header">
        <div onClick={() => navigate("/")}>
          <img src={img} className="header-img" alt="Site Exit" />
        </div>

        <nav className={`nav ${isOpen ? "active" : "close"}`}>
          
    
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
          
        </nav>

        <div className="right-container">
            <form className="header-search" onSubmit={handleCatalogSearch}>
              <input
                type="search"
                value={catalogSearch}
                placeholder="What are you searching for?"
                onChange={(event) => setCatalogSearch(event.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
              />
              <button className="header-search-submit" type="submit" aria-label="Search">
                <FiSearch />
              </button>
              {showSuggestions && suggestions.length > 0 && (
                <div className="header-search-suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      className="header-search-suggestion"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => searchForSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>
          <div className="header-actions">
            <div className="header-profile-wrap">
              <button
                type="button"
                className={`header-icon-btn header-profile-btn${profileName ? " is-logged-in" : ""}`}
                onClick={() => {
                  if (!profileName) setShowLogin(true);
                }}
                aria-label={profileName ? `Profile: ${profileName}` : "Login"}
                title={profileName || "Login"}
              >
                {profileName ? <span>{profileInitial}</span> : <FiUser />}
              </button>
              <div className="header-profile-menu">
                {profileName ? (
                  <>
                    <p>Hello <strong>{profileName}</strong></p>
                    <button type="button" onClick={() => navigate("/orders")}>My orders</button>
                    <button type="button" onClick={() => navigate("/address")}>My address</button>
                    <button type="button" onClick={() => navigate("/wishlist")}>Wishlist</button>
                    <button type="button" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <>
                    <p>Hello <strong>User</strong></p>
                    <button type="button" onClick={() => setShowLogin(true)}>Login</button>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className={`header-icon-btn${location.pathname === "/wishlist" ? " active" : ""}`}
              onClick={() => {
                closeMenu();
                navigate("/wishlist");
              }}
              aria-label="Wishlist"
            >
              <FiHeart />
              {wishlistCount > 0 && <span className="header-badge">{wishlistCount}</span>}
            </button>
            <button
              type="button"
              className={`header-icon-btn${location.pathname === "/cart" ? " active" : ""}`}
              onClick={() => {
                closeMenu();
                navigate("/cart");
              }}
              aria-label="Cart"
            >
              <FiShoppingCart />
              {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
            </button>
          </div>
          {/* <button className="cta-button" type="button" onClick={() => setShow(true)}>
            REQUEST A CALL
          </button> */}
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
      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} onLoginSuccess={handleLoginSuccess} />
    </div>
  );
}

export default Header;
