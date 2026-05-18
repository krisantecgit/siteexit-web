import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./catalogBrowse.css";
import pm from "./images/products.webp";
import "bootstrap/dist/css/bootstrap.min.css";
import FormModal from "../PopupModal/FormModal";
import axiosInstance from "../utils/axiosInstance";
import { CATALOG_MODES, STORE_ID } from "../constants/catalog";

const priceRanges = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 5,000", min: "", max: "5000" },
  { label: "Rs. 5,000 - Rs. 10,000", min: "5000", max: "10000" },
  { label: "Above Rs. 10,000", min: "10000", max: "" },
];

function CatalogBrowse({ mode = "buy", categorySlugOverride = "" }) {
  const config = CATALOG_MODES[mode] || CATALOG_MODES.buy;
  const { categorySlug: routeCategorySlug } = useParams();
  const categorySlug = categorySlugOverride || routeCategorySlug;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryScrollerRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubcategory, setActiveSubcategory] = useState("");
  const [priceRange, setPriceRange] = useState(priceRanges[0]);
  const [show, setShow] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [nextProductsUrl, setNextProductsUrl] = useState(null);
  const [error, setError] = useState(null);
  const loadMoreRef = useRef(null);

  const isCategorySelected = Boolean(categorySlug && activeCategory);
  const search = searchParams.get("q") || searchParams.get("search") || "";

  useEffect(() => {
    setLoadingCategories(true);
    setError(null);
    setCategories([]);
    setActiveCategory(null);
    setSubcategories([]);
    setProducts([]);
    setNextProductsUrl(null);
    setActiveSubcategory("");

    axiosInstance
      .get(config.categoriesEndpoint, {
        params: { is_suspended: false, store_id: STORE_ID },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        const nextCategories = Array.isArray(data) ? data : [];
        setCategories(nextCategories);

        if (categorySlug) {
          const matched =
            nextCategories.find((category) => category.slug === categorySlug) ||
            nextCategories.find((category) => String(category.id) === categorySlug);
          setActiveCategory(matched || null);
        }
      })
      .catch(() => {
        setError("Failed to load categories. Please try again.");
        setCategories([]);
      })
      .finally(() => setLoadingCategories(false));
  }, [config.categoriesEndpoint, categorySlug, mode]);

  useEffect(() => {
    if (!activeCategory?.id) {
      setSubcategories([]);
      return;
    }

    setActiveSubcategory("");
    axiosInstance
      .get("catlog/sub-categories/", {
        params: {
          category: activeCategory.id,
          is_suspended: false,
          store_id: STORE_ID,
        },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setSubcategories(Array.isArray(data) ? data : []);
      })
      .catch(() => setSubcategories([]));
  }, [activeCategory?.id]);

  const fetchProductsPage = useCallback(
    (nextUrl = null) => {
      if (!activeCategory?.name || !categorySlug) {
        setProducts([]);
        setNextProductsUrl(null);
        return;
      }

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
        .get(nextUrl || "catlog/category-variants/", nextUrl ? undefined : {
        params: {
          search,
          category: activeCategory.name,
          subcategory: activeSubcategory,
          price_min: priceRange.min,
          price_max: priceRange.max,
          options: "",
          store_id: STORE_ID,
          listing_type: config.listingType,
          is_suspended: false,
        },
      })
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
      activeCategory?.name,
      activeSubcategory,
      categorySlug,
      config.listingType,
      priceRange.max,
      priceRange.min,
      search,
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

  const getProductImage = (product) =>
    product.images?.[0]?.image?.image || product.product?.image?.image || pm;

  const getPrice = (product) => {
    const offerPrice = product.prices?.sale_offer_price;
    const salePrice = product.prices?.sale_price;
    const rentalPrice = product.prices?.rental_price;

    if (mode === "rent" && rentalPrice) {
      return `Rs. ${rentalPrice.toLocaleString("en-IN")} / day`;
    }

    if (offerPrice) {
      return `Rs. ${offerPrice.toLocaleString("en-IN")}`;
    }

    if (salePrice) {
      return `Rs. ${salePrice.toLocaleString("en-IN")}`;
    }

    return "Quote on request";
  };

  const selectCategory = (category) => {
    navigate({
      pathname: `/${config.path}/${category.slug}`,
      search: searchParams.toString(),
    });
  };

  const scrollCategories = (direction) => {
    categoryScrollerRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
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

  const renderCategoryCarousel = (showImages = false) => (
    <div className={`cb-swiper-wrap${showImages ? " cb-image-swiper-wrap" : ""}`}>
      <button
        className="cb-swiper-arrow"
        type="button"
        onClick={() => scrollCategories(-1)}
        aria-label="Previous categories"
      >
        {"<"}
      </button>
      <div className={`cb-swiper${showImages ? " cb-image-swiper" : ""}`} ref={categoryScrollerRef}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={
              showImages
                ? "cb-image-cat"
                : `cb-cat-tab${activeCategory?.id === category.id ? " active" : ""}`
            }
            onClick={() => selectCategory(category)}
          >
            {showImages ? (
              <>
                <span className="cb-image-cat-media">
                  <img
                    src={category.image?.image || pm}
                    alt=""
                    onError={(event) => { event.target.src = pm; }}
                  />
                </span>
                <span className="cb-image-cat-label">{category.name}</span>
              </>
            ) : (
              <>
                {activeCategory?.id === category.id && (
                  <span className="cb-tab-check" aria-hidden="true">✓</span>
                )}
                {category.name}
              </>
            )}
          </button>
        ))}
      </div>
      <button
        className="cb-swiper-arrow"
        type="button"
        onClick={() => scrollCategories(1)}
        aria-label="Next categories"
      >
        {">"}
      </button>
    </div>
  );

  return (
    <section className="cb-root">
      <div className="cb-container">
        {loadingCategories && (
          <div className="cb-loading">
            <span className="cb-spinner" />
          </div>
        )}

        {!loadingCategories && error && !isCategorySelected && (
          <div className="cb-alert">{error}</div>
        )}

        {!loadingCategories && !categorySlug && (
          <div className="cb-landing">
            <h1 className="cb-landing-title">
              {mode === "rent" ? "Rent Equipment" : "Sale Equipment"}
            </h1>
            {renderCategoryCarousel(true)}
            {categories.length === 0 && !error && (
              <div className="cb-empty"><p>No categories available.</p></div>
            )}
          </div>
        )}

        {!loadingCategories && categorySlug && !activeCategory && (
          <div className="cb-empty">
            <p>Category not found.</p>
            <button
              type="button"
              className="cb-btn-outline"
              onClick={() => navigate(`/${config.path}`)}
            >
              View all categories
            </button>
          </div>
        )}

        {!loadingCategories && isCategorySelected && (
          <>
            {renderCategoryCarousel()}

            <div className="cb-filter-bar">
              <span className="cb-filter-label">Filter</span>

              <div className="cb-selects">
                <div className="cb-select-wrap">
                  <select
                    value={activeSubcategory}
                    onChange={(event) => setActiveSubcategory(event.target.value)}
                  >
                    <option value="">Sub-Category</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                  <span className="cb-select-arrow">v</span>
                </div>

                <div className="cb-select-wrap">
                  <select
                    value={priceRange.label}
                    onChange={(event) =>
                      setPriceRange(
                        priceRanges.find((range) => range.label === event.target.value) ||
                          priceRanges[0]
                      )
                    }
                  >
                    {priceRanges.map((range) => (
                      <option key={range.label} value={range.label}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                  <span className="cb-select-arrow">v</span>
                </div>

                <div className="cb-select-wrap">
                  <select defaultValue="">
                    <option value="">More Options</option>
                  </select>
                  <span className="cb-select-arrow">v</span>
                </div>
              </div>

              <div className="cb-sort">
                <span>Sort by</span>
                <div className="cb-select-wrap">
                  <select defaultValue="featured">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <span className="cb-select-arrow">v</span>
                </div>
              </div>
            </div>

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
                      <article
                        key={product.id}
                        className="cb-card"
                        role="button"
                        tabIndex={0}
                        onClick={() => openProduct(product)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            openProduct(product);
                          }
                        }}
                      >
                        <div className="cb-card-img">
                          <img
                            src={getProductImage(product)}
                            alt=""
                            onError={(event) => { event.target.src = pm; }}
                          />
                        </div>

                        <div className="cb-card-body">
                          <h3 className="cb-card-name">{product.name}</h3>
                          {product.sku_code && (
                            <p className="cb-card-sku">SKU: {product.sku_code}</p>
                          )}
                          <div className="cb-card-footer">
                            <span className="cb-card-price">{getPrice(product)}</span>
                            <button
                              type="button"
                              className="cb-btn-primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEnquire(product);
                              }}
                            >
                              Request Quote
                            </button>
                          </div>
                        </div>
                      </article>
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
          </>
        )}
      </div>

      <FormModal selectedProduct={selectedProduct} show={show} setShow={setShow} />
    </section>
  );
}

export default CatalogBrowse;
