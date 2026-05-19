
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { getActiveStoreId, setActiveStoreId } from "../../Services/storeService";
// import loader from "../Assets/spinner.gif";

const Product = React.lazy(() => import("../Products/Product"));

function SearchedData() {
  const [params] = useSearchParams();
  const query = params.get("q");
  const decodedQuery = query?.replace(/-/g, " ");
  const storeIdFromUrl = params.get("store_id");
  const [storeId, setStoreId] = useState(storeIdFromUrl || localStorage.getItem("store_id") || "");
  const [products, setProducts] = useState([]);
  const [listingType, setListingType] = useState(params.get("listing_type") || "");

  useEffect(() => {
    let isActive = true;

    async function resolveStoreId() {
      const resolvedStoreId = storeIdFromUrl ? setActiveStoreId(storeIdFromUrl) : await getActiveStoreId();
      if (isActive) setStoreId(resolvedStoreId || "");
    }

    resolveStoreId();

    return () => {
      isActive = false;
    };
  }, [storeIdFromUrl]);

  useEffect(() => {
    let isActive = true;

    async function fetchSearch() {
      if (!decodedQuery || !storeId) return;

      const searchQuery = new URLSearchParams({
        search: decodedQuery,
        is_suspended: "false",
        category: params.get("category") || "",
        subcategory: params.get("subcategory") || "",
        price_min: params.get("price_min") || "",
        price_max: params.get("price_max") || "",
        options: params.get("options") || "",
      });

      if (listingType) {
        searchQuery.set("listing_type", listingType);
      }
      if (storeId) {
        searchQuery.set("store_id", storeId);
      }

      try {
        const res = await axiosInstance.get(`/catlog/category-variants/?${searchQuery.toString()}`);

        if (isActive) {
          setProducts(res?.data?.results || []);
        }
      } catch (error) {
        console.error("fetchSearch", error);
      }
    }

    fetchSearch();

    return () => {
      isActive = false;
    };
  }, [params, decodedQuery, listingType, storeId]);

  function handleListingTypeChange(type) {
    setListingType(type);
  }

  return (
    <div className="search-product-container">
      {/* <h2>Showing results for: {decodedQuery || query}</h2> */}

      <Suspense fallback={<div className="modern-spinner" style={{ margin: "50px auto" }}></div>}>
        <Product products={products}
          searchListingType={listingType}
          onListingTypeChange={handleListingTypeChange} />
      </Suspense>
    </div>
  );
}

export default SearchedData;
