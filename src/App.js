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
import ScrollToTop from "./utils/ScrollToTop.jsx"
import Cartpage from './components/Cart/Cartpage.jsx';
import WishListPage from './components/WishList/WishListPage.jsx';
import Checkout from './components/Pages/Checkout.jsx';
import Orders from './components/Pages/Orders.jsx';
import AddressesPage from './components/Pages/AddressesPage.jsx';
import OrderDetails from './components/Pages/OrderDetails.jsx';
import Payment from './components/Pages/Paymentpage.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
      <ScrollToTop />
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
        <Route path="/cart" element={<Cartpage />} />
        <Route path="/wishlist" element={<WishListPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/details" element={<OrderDetails />} />
        <Route path="/address"   element={<AddressesPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/product/:productSlug" element={<ProductDetailPage />} />
        <Route path="/buy" element={<CatalogBrowse mode="buy" />} />
        <Route path="/buy/:categorySlug" element={<Navigate to="/buy" replace />} />
        <Route path="/rent" element={<CatalogBrowse mode="rent" />} />
        <Route path="/rent/:categorySlug" element={<Navigate to="/rent" replace />} />
        <Route path="/categories" element={<Navigate to="/buy" replace />} />
        <Route path="/categories/*" element={<Navigate to="/buy" replace />} />
        <Route path="/products/*" element={<Navigate to="/buy" replace />} />
        <Route path="/details/:id" element={<DetailsSection />} />
        <Route path="*" element={<FriendlyUrlComponent />} />
      </Routes>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={2200}
        hideProgressBar
        newestOnTop
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </BrowserRouter>
  );
}

export default App;
