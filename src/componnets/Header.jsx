import React, { useState } from "react";
import "./Header.css"
import { Link, useNavigate } from "react-router-dom";
import img from "./images/logo.webp"
import { GiHamburgerMenu } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import FormModal from "../PopupModal/FormModal";

function Header({scrollToProduct, scrollToAbout}) {
  let navigate = useNavigate();
  const[show,setShow] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  function HandleRequest() {
    setShow(true);
  }
  return (
   <div>
     <header className="header">
      <div onClick={() => navigate("/")}><img src={img} className="header-img" /></div>
      <nav className={`nav ${isOpen ? "active" : "close"}`}>
        <Link onClick={() => setIsOpen(false)} to="/">Home</Link>
        <Link onClick={(e) =>{
          setIsOpen(false);
          e.preventDefault();
          scrollToAbout();
        }}>About Us</Link>
        <Link onClick={(e) => {
          setIsOpen(false);
          e.preventDefault();
          scrollToProduct();
        }}>Products</Link>
        <Link onClick={() => setIsOpen(false)} to="/contact">Contact Us</Link>
      </nav>

      <div className="right-container">
        <button className="cta-button" onClick={HandleRequest}>REQUEST A CALL</button>
        <div className="icon-container" onClick={() => setIsOpen(!isOpen)}>
          {isOpen == true ? <IoClose className="react-icon" /> : <GiHamburgerMenu className="react-icon" />}
        </div>
      </div>
    </header>
      <FormModal show={show} setShow={setShow} />
   </div>
  );
};

export default Header;
