import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./catalogBrowse.css";
import pm from "./images/products.webp";
import "bootstrap/dist/css/bootstrap.min.css";
import FormModal from "../PopupModal/FormModal";
import axiosInstance from "../utils/axiosInstance";
import { CATALOG_MODES, STORE_ID } from "../constants/catalog";
import FilterSection from "./Filtersection";
import { addToBuyCart, addToRentCart } from "../redux/cartSlice";
import ProductCard, { getProductImage } from "./ProductCard";

const priceRanges = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 5,000", min: "", max: "5000" },
  { label: "Rs. 5,000 - Rs. 10,000", min: "5000", max: "10000" },
  { label: "Above Rs. 10,000", min: "10000", max: "" },
];

function CatalogBrowse({ mode = "buy" }) {
  const dispatch = useDispatch();
  const config = CATALOG_MODES[mode] || CATALOG_MODES.buy;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryScrollerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);
  const [activeSort, setActiveSort] = useState("featured");
  const [selectedOptionNames, setSelectedOptionNames] = useState("");
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [nextProductsUrl, setNextProductsUrl] = useState(null);
  const [error, setError] = useState(null);

  const search = searchParams.get("q") || searchParams.get("search") || "";

  useEffect(() => {
    setActiveSubcategory("");
    setSelectedOptionNames("");
  }, [mode]);

  const fetchProductsPage = useCallback(
    (nextUrl = null) => {
      const isNextPage = Boolean(nextUrl);

      if (isNextPage) {
        setLoadingMoreProducts(true);
      } else {
        setLoadingProducts(true);
        setProducts([]);
        setNextProductsUrl(null);
      }

      setError(null);

      axiosInstance
        .get(
          nextUrl || "catlog/category-variants/",
          nextUrl
            ? undefined
            : {
                params: {
                  search,
                  subcategory: activeSubcategory,
                  price_min: priceRange.min,
                  price_max: priceRange.max,
                  options: selectedOptionNames,
                  store_id: STORE_ID,
                  listing_type: config.listingType,
                  is_suspended: false,
                  ...(activeSort !== "featured" ? { sortBy: activeSort } : {}),
                },
              }
        )
        .then((res) => {
          const data = res.data?.results ?? res.data;
          const nextProducts = Array.isArray(data) ? data : [];
          setNextProductsUrl(res.data?.next || null);
          setProducts((currentProducts) => {
            if (!isNextPage) {
              return nextProducts;
            }

            const seenProductIds = new Set(currentProducts.map((product) => product.id));
            const uniqueProducts = nextProducts.filter((product) => !seenProductIds.has(product.id));
            return [...currentProducts, ...uniqueProducts];
          });
        })
        .catch(() => {
          setError("Failed to load products. Please try again.");
          if (!isNextPage) {
            setProducts([]);
          }
        })
        .finally(() => {
          if (isNextPage) {
            setLoadingMoreProducts(false);
          } else {
            setLoadingProducts(false);
          }
        });
    },
    [
      activeSubcategory,
      activeSort,
      config.listingType,
      priceRange.max,
      priceRange.min,
      search,
      selectedOptionNames,
    ]
  );

  useEffect(() => {
    fetchProductsPage();
  }, [fetchProductsPage]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;
    if (!loadMoreElement || !nextProductsUrl || loadingProducts || loadingMoreProducts) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          fetchProductsPage(nextProductsUrl);
        }
      },
      { rootMargin: "350px 0px" }
    );

    observer.observe(loadMoreElement);
    return () => observer.disconnect();
  }, [fetchProductsPage, loadingMoreProducts, loadingProducts, nextProductsUrl]);



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
    <section className="cb-root">
      <div className="cb-container">
        {/* <div className="cb-page-heading">
          <h1 className="cb-landing-title">{config.pageTitle}</h1>
        </div> */}

        <FilterSection
          activeSubcategory={activeSubcategory}
          activeSort={activeSort}
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

        {error && <div className="cb-alert">{error}</div>}

        {loadingProducts && (
          <div className="cb-loading">
            <span className="cb-spinner" />
          </div>
        )}

        {!loadingProducts && !error && (
          <>
            <div className="cb-grid">
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
                <div className="cb-empty cb-grid-empty">
                  <p>No products found for this selection.</p>
                </div>
              )}
            </div>

            <div ref={loadMoreRef} className="cb-load-more-sentinel">
              {loadingMoreProducts && <span className="cb-spinner" />}
            </div>
          </>
        )}
      </div>

      <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
    </section>
  );
}

export default CatalogBrowse;
