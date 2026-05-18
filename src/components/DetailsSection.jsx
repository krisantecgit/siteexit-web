import React, { useState, useEffect } from "react";
import "./detailssection.css";
import img from "./images/products.webp";
import FormModal from "../PopupModal/FormModal";
import { useParams } from "react-router-dom";
// Product detail should use catlog/product-variant-detail/ when this page is wired up.

const DetailsSection = () => {
  const { id } = useParams();
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
    setError("Product details are not available yet.");
    setProduct(null);
  }, [id]);

  function handleEnquire() {
    setSelectedProduct({
      name: product?.name || "SITE-EXIT – Product",
      image: product?.image || img,
    });
    setShow(true);
  }

  // Build table rows from API data if available
  const tableData = product?.items ?? product?.details ?? [];

  // Gallery images
  const images = product?.images?.length
    ? product.images
    : [img, img, img, img];

  const mainImage = product?.image || img;
  const category = product?.category?.name || product?.category || "";

  return (
    <div>
      <div className="contact-banner">
        <h3>{loading ? "Loading…" : error ? "Error" : category}</h3>
      </div>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="container py-4">
          <div className="alert alert-danger">{error}</div>
        </div>
      )}

      {!loading && !error && product && (
        <div className="product-container">
          {/* Product Images */}
          <div className="product-gallery">
            <img
              src={mainImage}
              alt={product.name}
              className="main-image"
              onError={(e) => { e.target.src = img; }}
            />
            <div className="thumbnail-container">
              {images.slice(0, 4).map((src, i) => (
                <img
                  key={i}
                  src={typeof src === "string" ? src : src.image || img}
                  alt={`Thumbnail ${i + 1}`}
                  onError={(e) => { e.target.src = img; }}
                />
              ))}
            </div>
          </div>

          <div className="product-info">
            <h4>For {category} :</h4>

            <div className="pricing-box">
              <div className="pricing-header">
                <span className="name-title">Name</span>
                <span className="price-title">Price</span>
              </div>

              {tableData.length > 0 ? (
                tableData.map((item, i) => (
                  <div className="pricing-item" key={i}>
                    <div className="name">{item.name}</div>
                    <div className="price">{item.price}</div>
                  </div>
                ))
              ) : (
                <div className="pricing-item">
                  <div className="name">{product.name}</div>
                  <div className="price">{product.price || "Contact for price"}</div>
                </div>
              )}
            </div>

            <button
              className="book-btn btn btn-warning mt-3 w-100"
              onClick={handleEnquire}
            >
              Enquire Now
            </button>
          </div>

          <div>
            <div className="description cmn">
              <h3>DESCRIPTION</h3>
              <div className="mb-2">
                <button className="gradient-button">For {category} :</button>
              </div>

              {/* Detailed items table if available */}
              {tableData.length > 0 && (
                <div className="table-container">
                  <table className="pricing-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Min Required</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((data, ind) => (
                        <tr key={ind}>
                          <td>{data.name}</td>
                          <td>{data.description}</td>
                          <td>{data.price}</td>
                          <td>{data.min_required ?? data.minRequired ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Plain description if no items */}
              {tableData.length === 0 && product.description && (
                <p>{product.description}</p>
              )}
            </div>

            {/* Installation guidelines */}
            {product.guidelines?.length > 0 ? (
              <div className="details cmn">
                <h3>Installation &amp; Maintenance Guidelines</h3>
                <ul>
                  {product.guidelines.map((g, i) => (
                    <li key={i}>
                      <p>{g.title}</p>
                      <div>{g.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="details cmn">
                <h3>Installation &amp; Maintenance Guidelines</h3>
                <ul>
                  <li><p>Subsurface Requirements:</p><div>Should be smooth and stable, with a 1%–2% cross slope directing runoff toward a gravel bag containment area.</div></li>
                  <li><p>No Geotextile or Rock Needed:</p><div>When placed on a solid base, runoff flows freely and is filtered by gravel bags.</div></li>
                  <li><p>Size &amp; Compliance:</p><div>The entrance must be at least 12 feet wide (or the full width of the roadway) and 30 feet long (including ramps).</div></li>
                  <li><p>Drainage Control:</p><div>Direct all surface runoff to a sediment trap, basin, or gravel bag containment area.</div></li>
                  <li><p>Inspection &amp; Cleaning:</p><div>Regularly check after rain events. If sediment exceeds 4 inches, clean by lifting the tread flex panel and removing debris with a skid loader.</div></li>
                  <li><p>Proper Disposal:</p><div>Ensure all tracked mud or sediment is removed from public roadways promptly.</div></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {show && (
        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      )}
    </div>
  );
};

export default DetailsSection;
