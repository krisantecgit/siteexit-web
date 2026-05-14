import './App.css';
import Header from './componnets/Header';
// import '../node_modules/bootstrap/dist/css/bootstrap.css';
// import '../node_modules/jquery/dist/jquery.js';
// import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CarouselPage from './componnets/Carousel.jsx';
import ProductGrid from './componnets/ProductsPage.jsx';
import { useRef } from "react";
import Testimonials from './componnets/Testimonial.jsx';
import HowItWorks from './componnets/HowDoesItWorks.jsx';
import Footer from './componnets/Footer.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import DetailsSection from './componnets/DetailsSection.jsx';
import ContactForm from './componnets/ContactUs.jsx';
import SiteExit from './componnets/SiteExit.jsx';
import KeyFeatures from './componnets/KeyFeatures.jsx';
import About from './componnets/About.jsx';

function App() {
  const productRef = useRef(null);
  const aboutRef = useRef(null);
  const scrollToProduct = () => {
    if (productRef.current) {
      productRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }
  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }
  return (
    <BrowserRouter>
      <Header scrollToProduct={scrollToProduct} scrollToAbout={scrollToAbout} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <CarouselPage />
              <div ref={productRef}>
                <ProductGrid />
              </div>
              <div ref={aboutRef}>
              <About />
              </div>
              {/* <Features /> */}
              <SiteExit />
              <KeyFeatures />
              <Testimonials />
              <HowItWorks />
            </>
          }
        />
        <Route path='/contact' element={<ContactForm />} />
        <Route path="/details/:id" element={<DetailsSection />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
