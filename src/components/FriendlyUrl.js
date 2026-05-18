import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import CatalogBrowse from "./CatalogBrowse";
import ProductDetailPage from "./ProductDetailPage";
import SearchResults from "./SearchResults";
import "./friendlyurl.css";

const FriendlyUrlComponent = () => {
  const params = useParams();
  const friendlyPath = params["*"] || params.friendlyurl || "";
  const friendlyurl = friendlyPath.split("/").filter(Boolean).pop() || "";
  const [data, setData] = useState(null);
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!friendlyurl) {
      return;
    }

    setData(null);
    setType("");
    setError("");

    const fetchFriendlyData = async () => {
      try {
        const res = await axiosInstance.get(`catlog/seo-url/${friendlyurl}/`);
        setData(res.data.product_data);
        setType(res.data.product_type);
      } catch (err) {
        console.error("Error loading friendly URL", err);
        setError("The requested page could not be found.");
      }
    };
    fetchFriendlyData();
  }, [friendlyurl, navigate]);

  if (error) {
    return (
      <main className="friendly-page-container">
        <div className="friendly-empty">
          <h1>Page not found</h1>
          <p>{error}</p>
          <button type="button" onClick={() => navigate("/")}>
            Back to home
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <div className="loader-overlay friendly-loader">
        <span className="loader-spinner" />
      </div>
    );
  }

  const categorySlug = data?.slug || data?.friendly_url || friendlyurl;
  const promotionalProducts = Array.isArray(data?.results)
    ? data.results
    : Array.isArray(data)
      ? data
      : [];

  return (
    <div className="friendly-page-container">
      {type === "product" && (
        <ProductDetailPage productData={data} />
      )}

      {type === "category" && (
        <CatalogBrowse mode="buy" categorySlugOverride={categorySlug} />
      )}

      {type === "promotionalcategory" && (
        <SearchResults initialProducts={promotionalProducts} title={data?.name || "Products"} />
      )}

      {type === "page" && (
        <div className="cms-page">
          <h1>{data.meta_title || data.title || data.name}</h1>
          <div dangerouslySetInnerHTML={{ __html: data.description || data.content || "" }} />
        </div>
      )}

      {!["product", "category", "promotionalcategory", "page"].includes(type) && (
        <p>Unknown content type: {type}</p>
      )}
    </div>
  );
};

export default FriendlyUrlComponent;
