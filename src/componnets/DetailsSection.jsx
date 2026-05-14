import React, { useState, useEffect } from "react";
import "./detailssection.css";
import img from "./images/products.webp"
import FormModal from "../PopupModal/FormModal";
import { useParams } from "react-router-dom";

const DetailsSection = () => {
  const {id} = useParams();
  const[show,setShow] = useState(false);
  const[selectedProduct,setSelectedProduct] = useState(null);
  const[category,setCategory] = useState("")
  const[tableData,setTableData] = useState([])
  // const[guidline, setGuidline] = useState([])
  // const guidelinesSale = [
  //   { title: "Subsurface Requirements:", description: "Should be smooth and stable, with a 1%-2% cross slope directing runoff toward a gravel bag containment area." },
  //   { title: "No Geotextile or Rock Needed:", description: "When placed on a solid base, runoff flows freely and is filtered by gravel bags." },
  //   { title: "Size & Compliance:", description: "The entrance must be at least 12 feet wide (or the full width of the roadway) and 30 feet long (including ramps)." },
  //   { title: "Drainage Control:", description: "Direct all surface runoff to a sediment trap, basin, or gravel bag containment area." },
  //   { title: "Inspection & Cleaning:", description: "Regularly check after rain events. If sediment exceeds 4 inches, clean by lifting the tread flex panel and removing debris with a skid loader." },
  //   { title: "Proper Disposal:", description: "Ensure all tracked mud or sediment is removed from public roadways promptly." }
  // ];
  const rentalData = [
    {
      name: "SITE-EXIT - MAIN FRAME/BALLAST PLATE 6x12 UNIT ASSEMBLY",
      description: "Sturdy, reusable construction device for stabilized site entrances.",
      price: "$800 per month (plus transportation & labor)",
      minRequired: "5 units required initially, expandable as needed."
    },
    {
      name: "SITE-EXIT - RAMP PAIR 3x12",
      description: "Durable ramps for secure vehicle movement.",
      price: "$400 per month (plus transportation & labor)",
      minRequired: "2 units required initially."
    }
  ];

  const saleData = [
    {
      name: "SITE-EXIT - MAIN FRAME/BALLAST PLATE 6x12 UNIT ASSEMBLY",
      description: "High-strength, modular design for stabilized construction entrances.",
      price: "$8,000 Each",
      minRequired: "5 units required initially, expandable as needed."
    },
    {
      name: "SITE-EXIT - RAMP PAIR 3x12",
      description: "Sturdy, easy-to-install ramp pair for smooth entry/exit.",
      price: "$4,000 Each",
      minRequired: "2 units required for front and back of the main frame."
    }
  ];
  
  
  function HandleEnquire() {
    setSelectedProduct({
      name : "SITE-EXIT – MAIN FRAME/ BALLAST PLATE 6×12 UNIT ASSEMBLY",
      image : img
    })
    setShow(!show);
  }
  function HandleEnquire() {
    setSelectedProduct({
      name : "SITE-EXIT – MAIN FRAME/ BALLAST PLATE 6×12 UNIT ASSEMBLY",
      image : img
    })
    setShow(!show);
  }
  useEffect(() => {
    if (id === "1") {
      setCategory("Sale");
      setTableData(saleData)
    } else {
      setCategory("Rental");
      setTableData(rentalData)
    }

  },[id])
  return (
    <div>
      <div className="contact-banner">
        <h3>{category}</h3>
      </div>
      <div className="product-container">
        {/* Product Images */}
        <div className="product-gallery">
          <img
            src={img}
            alt="Main product"
            className="main-image"
          />
          <div className="thumbnail-container">
            <img src={img} alt="Thumbnail 1" />
            <img src={img} alt="Thumbnail 3" />
            <img src={img} alt="Thumbnail 4" />
            <img src={img} alt="Thumbnail 2" />
          </div>
        </div>

        <div className="product-info">
          <h4>For {category} :</h4>

          <div className="pricing-box">
            <div className="pricing-header">
              <span className="name-title">Name</span>
              <span className="price-title">Price</span>
            </div>

            <div className="pricing-item">
              <div className="name">SITE-EXIT – MAIN FRAME/ BALLAST PLATE 6×12 UNIT ASSEMBLY</div>
              <div className="price">$8,000 Each</div>
            </div>

            <div className="pricing-item">
              <div className="name">SITE-EXIT – RAMP PAIR 3×12</div>
              <div className="price">$4,000 Each</div>
            </div>
          </div>

          <button className="book-btn btn btn-warning mt-3 w-100" onClick={HandleEnquire}>Enquire Now</button>
        </div>

        <div>
          <div className="description cmn">
            <h3>DESCRIPTION</h3>

            <div className="mb-2"><button className="gradient-button">For {category} :</button></div>

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
                  {
                    tableData.map((data,ind)=>(
                      <tr>
                        <td>{data.name}</td>
                        <td>{data.description}</td>
                        <td>{data.price}</td>
                        <td>{data.minRequired}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>


          <div className="details cmn">
            <h3>Installation & Maintenance Guidelines</h3>
            <ul>
              <li><p>Subsurface Requirements:</p> <div>Should be smooth and stable, with a 1%-2% cross slope
                directing runoff toward a gravel bag containment area.</div></li>
              <li><p>No Geotextile or Rock Needed:</p><div>When placed on a solid base, runoff flows freely and is
                filtered by gravel bags.</div></li>
              <li><p>Size & Compliance:</p> <div>The entrance must be at least 12 feet wide (or the full width
                of the roadway) and 30 feet long (including ramps).</div></li>
              <li><p>Drainage Control:</p><div>Direct all surface runoff to a sediment trap, basin, or gravel
                bag containment area.</div></li>
              <li><p>Inspection & Cleaning:</p><div>Regularly check after rain events. If sediment exceeds 4 inches,
                clean by lifting the tread flex panel and removing debris with a skid loader.</div></li>
              <li><p>Proper Disposal:</p><div>Ensure all tracked mud or sediment is removed from public
                roadways promptly.</div></li>
            </ul>
          </div>
        </div>
      </div>
      {
        show && <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      }
    </div>
  );
};

export default DetailsSection;
