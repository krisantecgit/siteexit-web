import React, { useEffect, useState } from "react";
import "./productpage.css";
import pm from "./images/products.webp";
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import FormModal from "../PopupModal/FormModal";
import axiosInstance from "../utils/axiosInstance.js"

const staticProducts = [
  {
    id: 1,
    name: "Site-Exit Rockless Stabilized Construction Device - For Sale",
    image: pm,
    path: "/buy",
    isStatic: true,
  },
  {
    id: 2,
    name: "Site-Exit Rockless Stabilized Construction Device - For Rental",
    image: pm,
    path: "/rent",
    isStatic: true,
  },
];

function StaticProducts() {
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [banners, setBanners] = useState([]);

  const navigate = useNavigate();

  const handleBookClick = (product) => {
    setSelectedProduct(product);
    setShow(true);
  };

  useEffect(() => {
    const fetchBannerSlider = async () => {
      try {
        const response = await axiosInstance.get(
          "cms/get_homepagedesign/?type=home page"
        );

        const bannerSliderSection = response?.data?.results?.find(
          (item) => item?.title === "Banner Slider"
        );

        setBanners(bannerSliderSection?.slider ?? []);
      } catch (error) {
        console.error("Failed to fetch banner slider", error);
      }
    };

    fetchBannerSlider();
  }, []);

  return (
    <div className="container my-5">
      <h3 className="fw-bold text-dark about-title">PRODUCTS</h3>

      <div className="row">
        {/* Static Products */}
        {staticProducts.map((product) => (
          <div key={product.id} className="col-md-6 mb-4 cards-margin">
            <div
              className="card shadow product-card"
              role="button"
              tabIndex={0}
              onClick={() => navigate(product.path)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(product.path);
                }
              }}
            >
              <img
                src={product.image}
                alt={product.name}
                className="card-img-top"
              />

              <div className="card-body text-center">
                <h5 className="fw-bold product-name mb-2">
                  {product.name}
                </h5>

                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-outline-dark mx-2"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(product.path);
                    }}
                  >
                    VIEW MORE
                  </button>

                  <button
                    className="btn btn-dark"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleBookClick(product);
                    }}
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dynamic Banner Slider Categories */}
        {banners.map((banner) => (
          <div key={banner.id} className="col-md-6 mb-4 cards-margin">
            <div
              className="card shadow product-card"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  `/productlisting?category=${banner?.cat_slug}`
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  navigate(
                    `/productlisting?category=${banner?.cat_slug}`
                  );
                }
              }}
            >
              <img
                src={banner?.image__image}
                alt={banner?.cat_slug}
                className="card-img-top"
              />

              <div className="card-body text-center">
                <h5
                  className="fw-bold product-name mb-2 text-capitalize"
                >
                  {banner?.cat_slug?.replaceAll("-", " ")}
                </h5>

                <div className="d-flex justify-content-center">
                  <button
                    className="btn btn-outline-dark mx-2"
                    onClick={(event) => {
                      event.stopPropagation();

                      navigate(
                        `/productlisting?category=${banner?.cat_slug}`
                      );
                    }}
                  >
                    VIEW MORE
                  </button>

                  <button
                    className="btn btn-dark"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleBookClick(banner);
                    }}
                  >
                    Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FormModal
        selectedProduct={selectedProduct}
        show={show}
        setShow={setShow}
      />
    </div>
  );
}

export default StaticProducts;