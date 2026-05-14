import React, { useState } from "react";
import "./productpage.css";
import pm from "./images/products.webp"
import "react-datepicker/dist/react-datepicker.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import FormModal from "../PopupModal/FormModal";

const products = [
  { id: 1, name: "Site-Exit Rockless Stabilized Construction Device – For Sale", price: "$505", image: pm },
  { id: 2, name: "Site-Exit Rockless Stabilized Construction Device – For Rental", price: "$505", image: pm },
];

function ProductGrid() {
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();
  const handleBookClick = (product) => {
    setSelectedProduct(product);
    setShow(true);
  };

 

  return (
    <div className="container my-5">
      <h3 className="fw-bold text-dark about-title">PRODUCTS</h3>
      <div className="row">
        {products.map((product) => (
          <div key={product.id} className="col-md-6 mb-6 cards-margin">
            <div className="card shadow product-card">
              <img src={product.image} alt={product.name} className="card-img-top" />
              <div className="card-body text-center">
                <h5 className="fw-bold product-name mb-2">{product.name}</h5>
                <div className="d-flex justify-content-center">
                  <button className="btn btn-outline-dark mx-2" onClick={() => navigate(`/details/${product.id}`)}>VIEW MORE</button>
                  <button className="btn btn-dark" onClick={() => handleBookClick(product)}>Enquire Now</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title>SUBMIT YOUR REQUIREMENTS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <h5>Product Detail:</h5>
              <img src={selectedProduct.image} alt={selectedProduct.name} className="img-fluid mb-3" style={{ borderRadius: "10px" }} />
              <div>{selectedProduct.name}</div>
            </>
          )}
          <form>
            <input type="text" name="fullName" className="form-control mb-3" placeholder="Full Name" onChange={handleChange} />
            <input type="tel" name="mobile" className="form-control mb-3" placeholder="Mobile No" onChange={handleChange} />
            <input type="email" name="email" className="form-control mb-3" placeholder="Email" onChange={handleChange} />
            <input type="text" name="location" className="form-control mb-3" placeholder="Location" onChange={handleChange} />
            <div className="d-flex gap-3 mb-3">
              <DatePicker selected={formData.fromDate} onChange={(date) => setFormData({ ...formData, fromDate: date })} placeholderText="From Date" className="form-control" />
              <DatePicker selected={formData.toDate} onChange={(date) => setFormData({ ...formData, toDate: date })} placeholderText="To Date" className="form-control" />
            </div>
            <textarea name="message" className="form-control mb-3" placeholder="Message" rows="3" onChange={handleChange}></textarea>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <button className="w-100 text-white fw-bold" style={{background : "FE7900" , borderRadius : "10px"}}>Submit</button>
        </Modal.Footer>
      </Modal> */}
      <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
    </div>
  );
}

export default ProductGrid;
