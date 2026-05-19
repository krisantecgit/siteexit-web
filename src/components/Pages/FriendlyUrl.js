import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
// import Navigation from "./Navigation";
import Product from "../Products/Product";
import Productdetails from "./Productdetails";
const FriendlyUrlComponent = () => {
  const { friendlyurl, categoryurl, subcategoryurl } = useParams();
  const [data, setData] = useState(null);
  const [type, setType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFriendlyData = async () => {
      try {
        const res = await axiosInstance.get(`/catlog/seo-url/${friendlyurl}`);
        setData(res.data.product_data);
        setType(res.data.product_type);
      } catch (err) {
        console.error("Error loading friendly URL", err);
        navigate("/404");
      }
    };
    fetchFriendlyData();
  }, [friendlyurl]);

  if (!data) return <p className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}><div className="modern-spinner" style={{ width: "60px", height: "60px" }}></div></p>;

  return (
    <div className="friendly-page-container">
      {type === "product" && (
        <>
          <Productdetails productData={data} />
        </>
      )}

      {type === "category" && (
        <>
          <Product friendlyData={data} />
        </>
      )}

      {type === "promotionalcategory" && (
        <Product products={data.results} isPromotional={true} />
      )}

      {type === "page" && (
        <div className="cms-page">
          <h1>{data.meta_title}</h1>
          <div dangerouslySetInnerHTML={{ __html: data.description }} />
        </div>
      )}

      {!["product", "category", "promotionalcategory", "page"].includes(type) && (
        <p>Unknown content type: {type}</p>
      )}
    </div>
  );
};

export default FriendlyUrlComponent;
