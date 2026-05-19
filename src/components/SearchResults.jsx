import React, { useEffect, useRef, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import "./productpage.css";
import "./catalogBrowse.css";
import FormModal from "../PopupModal/FormModal";
import ProductCard, { getProductImage } from "./ProductCard";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";
import FilterSection from "./Filtersection";
import { addToBuyCart, addToRentCart } from "../redux/cartSlice";

const priceRanges = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 5,000", min: "", max: "5000" },
  { label: "Rs. 5,000 - Rs. 10,000", min: "5000", max: "10000" },
  { label: "Above Rs. 10,000", min: "10000", max: "" },
];

function SearchResults({ initialProducts = null, title = "" }) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("buy");
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const storeId = searchParams.get("store_id") || STORE_ID;
  const [products, setProducts] = useState(initialProducts || []);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resultCount, setResultCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);
  const [activeSort, setActiveSort] = useState("featured");
  const [selectedOptionNames, setSelectedOptionNames] = useState("");
  const categoryScrollerRef = useRef(null);

  useEffect(() => {
    if (initialProducts) {
      return;
    }

    Promise.allSettled([
      axiosInstance.get("sitedata/site/"),
      axiosInstance.get("catlog/with-buy-or-both/", {
        params: { is_suspended: false, store_id: storeId },
      }),
      axiosInstance.get("catlog/variants/", {
        params: { page: 1, page_size: 30, store_id: storeId },
      }),
      axiosInstance.get("catlog/sub-categories/", {
        params: { is_suspended: false, store_id: storeId },
      }),
    ]);
  }, [initialProducts, query, storeId]);

  useEffect(() => {
    axiosInstance
      .get("catlog/with-buy-or-both/", {
        params: { is_suspended: false, store_id: storeId },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setCategories([]));
  }, [storeId]);

  useEffect(() => {
    setActiveSubcategory("");

    axiosInstance
      .get("catlog/sub-categories/", {
        params: {
          ...(activeCategory?.id ? { category: activeCategory.id } : {}),
          is_suspended: false,
          store_id: storeId,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setSubcategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubcategories([]));
  }, [activeCategory?.id, storeId]);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setResultCount(initialProducts.length);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    axiosInstance
      .get("catlog/category-variants/", {
        params: {
          search: query,
          category: activeCategory?.name || "",
          subcategory: activeSubcategory,
          price_min: priceRange.min,
          price_max: priceRange.max,
          options: selectedOptionNames,
          store_id: storeId,
          listing_type: "buy",
          is_suspended: false,
          ...(activeSort !== "featured" ? { sortBy: activeSort } : {}),
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        const nextProducts = Array.isArray(data) ? data : [];
        setProducts(nextProducts);
        setResultCount(res.data?.count ?? nextProducts.length);
      })
      .catch(() => {
        setError("Failed to load search results. Please try again.");
        setProducts([]);
        setResultCount(0);
      })
      .finally(() => setLoading(false));
  }, [
    activeCategory?.name,
    activeSort,
    activeSubcategory,
    initialProducts,
    priceRange.max,
    priceRange.min,
    query,
    selectedOptionNames,
    storeId,
  ]);



  const getCartProduct = (product) => ({
    id: product.id,
    name: product.name,
    image: getProductImage(product),
    slug: product.slug || product.product?.slug,
    friendlyurl: product.slug || product.product?.slug,
    type: mode === "rent" ? "rent" : "buy",
    offerPrice:
      mode === "rent"
        ? Number(product.prices?.rental_price || 0)
        : Number(product.prices?.sale_offer_price || product.prices?.sale_price || 0),
    sale_offer_price: product.prices?.sale_offer_price,
    sale_price: product.prices?.sale_price,
    rental_price: product.prices?.rental_price,
  });

  const handleAddToCart = (event, product) => {
    event.stopPropagation();
    const cartProduct = getCartProduct(product);

    if (mode === "rent") {
      axiosInstance.get(`catlog/variant-price-packages/?product_variant=${product.id}&active=true`).catch(() => {});
      axiosInstance.get(`sitedata/site/`).catch(() => {});

      dispatch(addToRentCart({
        ...cartProduct,
        cartItemId: `${product.id}-rent`,
      }));
      toast.success("Added to rental cart");
      return;
    }

    dispatch(addToBuyCart(cartProduct));
    toast.success("Added to cart");
  };

  const openProduct = (product) => {
    const slug = product.slug || product.product?.slug;
    if (slug) {
      navigate(`/product/${slug}`, {
        search: `variant=${product.id}`,
        state: { variantId: product.id },
      });
    }
  };

  const handleEnquire = (product) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      image: getProductImage(product),
    });
    setShow(true);
  };

  return (
    <section className="cb-root search-results-page">
      <style>{`
        .search-results-page .cb-filter-bar {
          max-width: 100% !important;
        }
      `}</style>
      <div className="cb-container">
        {/* <div className="search-results-header d-flex justify-content-between align-items-center flex-wrap mb-4 pb-2 border-bottom"> */}
          <div className="d-flex align-items-baseline gap-2 mb-3">
            <h1 className="results-for fs-3 fw-normal text-secondary mb-3">
              {title || (query ? `Results for "${query}"` : "Search products")}
            </h1>
            {!loading && !error && (
              <span className="text-muted fs-6 fw-light">
                {resultCount} {resultCount === 1 ? "Item" : "Items"}
              </span>
            )}
          </div>
          {/* <div className="buy-rent-toggle d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-1 px-3 py-1 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Buy</button>
            <button className="btn btn-outline-secondary btn-sm rounded-1 px-3 py-1 text-uppercase fw-semibold" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>Rent</button>
          </div> */}
        {/* </div>  */}
      

        {!initialProducts && (
          <FilterSection
            categories={categories}
            subcategories={subcategories}
            activeCategory={activeCategory}
            activeSubcategory={activeSubcategory}
            activeSort={activeSort}
            onCategorySelect={setActiveCategory}
            onSubcategoryChange={setActiveSubcategory}
            onPriceRangeChange={setPriceRange}
            onSortChange={setActiveSort}
            onOptionsChange={setSelectedOptionNames}
            priceRange={priceRange}
            priceRanges={priceRanges}
            scrollerRef={categoryScrollerRef}
            showCategories={false}
            showSubcategories={false}
          />
        )}

        {loading && (
          <div className="catalog-loading">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert-danger catalog-alert">{error}</div>
        )}

        {!loading && !error && (
          <div className="cb-grid search-results-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  mode={mode}
                  onOpen={openProduct}
                  onAdd={handleAddToCart}
                  onEnquire={handleEnquire}
                />
              ))
            ) : (
              <div className="catalog-empty-state catalog-grid-empty">
                <p>No products found for this search.</p>
              </div>
            )}
          </div>
        )}

        <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
      </div>
    </section>
  );
}

export default SearchResults;
