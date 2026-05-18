import './App.css';
import Header from './components/Header';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import CarouselPage from './components/Carousel.jsx';
import { useRef } from "react";
import Testimonials from './components/Testimonial.jsx';
import HowItWorks from './components/HowDoesItWorks.jsx';
import Footer from './components/Footer.jsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import DetailsSection from './components/DetailsSection.jsx';
import ContactForm from './components/ContactUs.jsx';
import SiteExit from './components/SiteExit.jsx';
import KeyFeatures from './components/KeyFeatures.jsx';
import About from './components/About.jsx';
import CatalogBrowse from './components/CatalogBrowse.jsx';
import SearchResults from './components/SearchResults.jsx';
import ProductDetailPage from './components/ProductDetailPage.jsx';
import StaticProducts from './components/StaticProducts.jsx';
import FriendlyUrlComponent from './components/FriendlyUrl.js';

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
                {/* <HomeProductSections /> */}
                <StaticProducts />
              </div>
              <div ref={aboutRef}>
                <About />
              </div>
              <SiteExit />
              <KeyFeatures />
              <Testimonials />
              <HowItWorks />
            </>
          }
        />
        <Route path='/contact' element={<ContactForm />} />
        <Route path="/search/results" element={<SearchResults />} />
        <Route path="/product/:productSlug" element={<ProductDetailPage />} />
        <Route path="/buy" element={<CatalogBrowse mode="buy" />} />
        <Route path="/buy/:categorySlug" element={<CatalogBrowse mode="buy" />} />
        <Route path="/rent" element={<CatalogBrowse mode="rent" />} />
        <Route path="/rent/:categorySlug" element={<CatalogBrowse mode="rent" />} />
        <Route path="/categories" element={<Navigate to="/buy" replace />} />
        <Route path="/categories/*" element={<Navigate to="/buy" replace />} />
        <Route path="/products/*" element={<Navigate to="/buy" replace />} />
        <Route path="/details/:id" element={<DetailsSection />} />
        <Route path="*" element={<FriendlyUrlComponent />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
