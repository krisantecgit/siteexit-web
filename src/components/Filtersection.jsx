import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import { IoArrowForward, IoChevronBack, IoChevronForward } from "react-icons/io5";
import axiosInstance from "../utils/axiosInstance";
import { STORE_ID } from "../constants/catalog";
import FilterOptions from "./FilterOptions";
import "./filteroptions.css";

function FilterSection({
  categories = [],
  subcategories = [],
  activeCategory,
  activeSubcategory,
  activeSort,
  onCategorySelect,
  onSubcategoryChange,
  onPriceRangeChange,
  onSortChange,
  onOptionsChange,
  priceRange,
  priceRanges = [],
  scrollerRef,
  showCategories = true,
  showSubcategories = true,
}) {
  const [showOptions, setShowOptions] = useState(false);
  const [filterData, setFilterData] = useState([]);
  const [variantOptions, setVariantOptions] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    axiosInstance
      .get("catlog/variants/", {
        params: { page: 1, page_size: 30, store_id: STORE_ID },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setFilterData(Array.isArray(data) ? data : []);
      })
      .catch(() => setFilterData([]));
  }, []);

  const scrollCategories = (direction) => {
    scrollerRef?.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  const fetchVariantOptions = (variantId) => {
    setSelectedVariantId(variantId);
    axiosInstance
      .get("catlog/variantoptions/", {
        params: { variant_type: variantId, store_id: STORE_ID },
      })
      .then((res) => {
        const data = res.data?.results ?? res.data;
        setVariantOptions(Array.isArray(data) ? data : []);
      })
      .catch(() => setVariantOptions([]));
  };

  const handleOptionSelect = (variantId, optionId, optionName, isChecked) => {
    setSelectedOptions((currentOptions) => {
      const nextOptions = { ...currentOptions };

      if (isChecked) {
        nextOptions[variantId] = [
          ...(nextOptions[variantId] || []),
          { id: optionId, name: optionName },
        ];
      } else {
        nextOptions[variantId] = (nextOptions[variantId] || []).filter(
          (option) => option.id !== optionId
        );
        if (nextOptions[variantId].length === 0) {
          delete nextOptions[variantId];
        }
      }

      return nextOptions;
    });
  };

  const clearOptions = () => {
    setSelectedOptions({});
    setVariantOptions([]);
    setSelectedVariantId(null);
    onOptionsChange("");
  };

  const applyOptions = () => {
    const optionNames = Object.values(selectedOptions)
      .flat()
      .map((option) => option.name)
      .join(",");

    onOptionsChange(optionNames);
    setShowOptions(false);
  };

  return (
    <>
      <div className="catalog-filter-panel">
        {showCategories && (
          <div className="cb-swiper-wrap">
            <button
              className="cb-swiper-arrow"
              type="button"
              onClick={() => scrollCategories(-1)}
              aria-label="Previous categories"
            >
              <IoChevronBack />
            </button>

            <div className="cb-swiper" ref={scrollerRef}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={`cb-cat-tab${activeCategory?.id === category.id ? " active" : ""}`}
                  onClick={() => onCategorySelect(category)}
                >
                  {activeCategory?.id === category.id && (
                    <span className="cb-tab-check" aria-hidden="true">
                      <FaCheck />
                    </span>
                  )}
                  {category.name}
                </button>
              ))}
            </div>

            <button
              className="cb-swiper-arrow"
              type="button"
              onClick={() => scrollCategories(1)}
              aria-label="Next categories"
            >
              <IoChevronForward />
            </button>
          </div>
        )}

        <div className="cb-filter-bar">
          <div className="cb-filter-left">
            <span className="cb-filter-label">FILTER</span>

            <div className="cb-selects">
              {showSubcategories && (
                <div className="cb-select-wrap">
                  <select
                    value={activeSubcategory}
                    onChange={(event) => onSubcategoryChange(event.target.value)}
                    className="rounded-select"
                  >
                    <option value="">Sub-Category</option>
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.name}>
                        {subcategory.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="cb-select-wrap">
                <select
                  value={priceRange.label}
                  onChange={(event) => {
                    const nextRange =
                      priceRanges.find((range) => range.label === event.target.value) ||
                      priceRanges[0];
                    onPriceRangeChange(nextRange);
                  }}
                  className="rounded-select"
                >
                  {priceRanges.map((range) => (
                    <option key={range.label} value={range.label}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="cb-more-options rounded-select"
                onClick={() => setShowOptions(true)}
              >
                More Options
                <IoArrowForward className="more-options-icon" />
              </button>
            </div>
          </div>

          <div className="cb-sort">
            <span className="cb-filter-label">SORT BY</span>
            <div className="cb-select-wrap">
              <select 
                value={activeSort} 
                onChange={(event) => onSortChange(event.target.value)}
                className="rounded-select"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <FilterOptions
        show={showOptions}
        onClose={() => setShowOptions(false)}
        filterData={filterData}
        variantOptions={variantOptions}
        selectedVariantId={selectedVariantId}
        selectedOptions={selectedOptions}
        onVariantClick={fetchVariantOptions}
        onOptionSelect={handleOptionSelect}
        onClearAll={clearOptions}
        onApplyFilters={applyOptions}
      />
    </>
  );
}

export default FilterSection;
