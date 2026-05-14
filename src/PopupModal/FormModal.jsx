import React, { useState } from 'react'
import { Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";


function FormModal({selectedProduct,show,setShow}) {
    const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    location: "",
    fromDate: null,
    toDate: null,
    message: "",
  });
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
      };
    return (
        <div>
            <Modal show={show} onHide={() => setShow(false)} centered size="lg">
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
                    <button className="w-100 text-white fw-bold" style={{ background: "FE7900", borderRadius: "10px" }}>Submit</button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default FormModal