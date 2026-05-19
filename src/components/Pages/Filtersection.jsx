import React, { useEffect, useRef, useState } from "react";
import axiosConfig from "../../Services/axiosConfig";
import { getActiveStoreId, setActiveStoreId } from "../../Services/storeService";
import { IoChevronBack, IoChevronForward, IoArrowDown, IoArrowForward } from "react-icons/io5";
import { FaCheck } from "react-icons/fa6";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import FilterOptions from "../Pages/FilterOptions";
import { sort_map } from "../../utils/sort_map";
import "../Products/product.css"


function FilterSection({ friendlyData, isPromotional, onProductsChange, onLoading, categoryurl, products, searchListingType, onListingTypeChange }) {
    const { friendlyurl } = useParams();
    const [params] = useSearchParams()
    const query = params.get("q");
    const storeIdFromUrl = params.get("store_id");
    const [storeId, setStoreId] = useState(storeIdFromUrl || localStorage.getItem("store_id") || "");
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation()
    const carouselRef = useRef(null);
    const isSearchPage = window.location.pathname.includes('/search/results');
    const [category, setCategory] = useState([]);
    const [subcategoryProducts, setSubCategoryProducts] = useState([]);
    const [selectedSubcats, setSelectedSubcats] = useState([]);
    const [activeSort, setActiveSort] = useState("Featured");
    const [activeListingType, setActiveListingType] = useState(
        isSearchPage ? (searchListingType || "") : (searchListingType || categoryurl)
    )
    const [filterData, setFilterData] = useState([]);
    const [nextUrl, setNextUrl] = useState(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [variantOptions, setVariantOptions] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    // ── single source of truth for current category name ──────────────────────
    const getSelectedCategory = () =>
        friendlyData?.name ||
        friendlyData?.product_data?.name ||
        "";

    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

    const [showFilter, setShowFilter] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});

    const priceRanges = [
        { id: 1, label: "$0 - $5000", min: 0, max: 5000 },
        { id: 2, label: "$5000 - $10,000", min: 5000, max: 10000 },
        { id: 3, label: "$10,000 - $20,000", min: 10000, max: 20000 },
    ];
    useEffect(() => {
        setActiveListingType(isSearchPage ? (searchListingType || "") : (searchListingType || categoryurl))
    }, [searchListingType, categoryurl, isSearchPage])

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
    // async function handleActiveListingType(type) {
    //     setActiveListingType(type);
    //     if (isSearchPage && onListingTypeChange) {
    //         onListingTypeChange(type);
    //     } else {
    //         setActiveListingType(type);
    //     }
    // }

    function handleActiveListingType(type) {
        setActiveListingType(type);

        if (isSearchPage && onListingTypeChange) {
            onListingTypeChange(type);
        }
    }
    const collectAllRemaining = async (initialNext) => {
        if (!storeId) return;
        let nextUrl = initialNext;
        while (nextUrl) {
            try {
                let fetchUrl = nextUrl.replace(/^https?:\/\/[^/]+/, '');
                if (storeId && !fetchUrl.includes("store_id=")) {
                    const joiner = fetchUrl.includes("?") ? "&" : "?";
                    fetchUrl = `${fetchUrl}${joiner}store_id=${encodeURIComponent(storeId)}`;
                }
                const nextRes = await axiosConfig.get(fetchUrl);
                if (nextRes?.data?.results) {
                    onProductsChange(prev => {
                        const previous = typeof prev === 'function' ? prev() : (prev || []);
                        // Avoid duplicates if possible, or just append
                        return [...previous, ...nextRes.data.results];
                    });
                }
                nextUrl = nextRes?.data?.next || null;
            } catch (err) {
                console.error("collectAllRemaining error", err);
                break;
            }
        }
    };

    async function fetchCategories() {
        if (!storeId) return;
        try {
            const res = await axiosConfig.get(
                storeId
                    ? `/catlog/with-${categoryurl}-or-both/?store_id=${encodeURIComponent(storeId)}`
                    : `/catlog/with-${categoryurl}-or-both/`
            );
            setCategory(res.data);
        } catch (err) {
            console.error("fetchCategories", err);
        }
    }

    // async function fetchInitialProducts() {
    //     try {
    //         onLoading(true);
    //         const selectedCategory = friendlyData?.product_data?.name || "";
    //         const res = await axiosConfig.get(
    //             `/catlog/category-variants/?listing_type=${activeListingType}&category=${selectedCategory}`
    //         );
    //         onProductsChange(res.data.results || []);
    //         setNextUrl(res.data.next || null);
    //         setSearchParams((prev) => {
    //             const p = Object.fromEntries([...prev]);
    //             // p.collection = selectedCategory.toUpperCase() || "";
    //             return p;
    //         });
    //     } catch (err) {
    //         console.error("fetchInitialProducts", err);
    //     } finally {
    //         onLoading(false);
    //     }
    // }
    const loadMoreProducts = async () => {
        if (!storeId || !nextUrl || loadingMore) return;
        setLoadingMore(true);
        try {
            let fetchUrl = nextUrl;
            if (storeId && fetchUrl && !String(fetchUrl).includes("store_id=")) {
                const joiner = String(fetchUrl).includes("?") ? "&" : "?";
                fetchUrl = `${fetchUrl}${joiner}store_id=${encodeURIComponent(storeId)}`;
            }
            const res = await axiosConfig.get(fetchUrl);
            setTotalCount(prev => res.data.count !== undefined ? res.data.count : prev);
            onProductsChange(prev => [...prev, ...res.data.results]);
            setNextUrl(res.data.next || null);
        } catch (err) {
            console.error("loadMoreProducts", err);
        } finally {
            setLoadingMore(false);
        }
    };
    useEffect(() => {
        const handleScroll = () => {
            if (location.pathname.includes("/search/results")) return;
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
                !loadingMore &&
                nextUrl
            ) {
                loadMoreProducts();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [nextUrl, loadingMore, location.pathname, storeId]);


    async function fetchSubcategories(categoryId) {
        if (!storeId || !categoryId) return;
        try {
            const res = await axiosConfig.get(
                `/catlog/sub-categories/?category=${categoryId}&is_suspended=false${storeId ? `&store_id=${encodeURIComponent(storeId)}` : ""}`
            );
            setSubCategoryProducts(res.data.results || []);
        } catch (err) {
            console.error("fetchSubcategories", err);
        }
    }
    async function searchSubcategory() {
        if (!storeId) return;
        try {
            const res = await axiosConfig.get(
                `/catlog/sub-categories/?is_suspended=false${storeId ? `&store_id=${encodeURIComponent(storeId)}` : ""}`
            );
            setSubCategoryProducts(res.data.results || []);
        } catch (err) {
            console.error("fetchSubcategories", err);
        }
    }
    async function fetchFilterData() {
        if (!storeId) return;
        try {
            const res = await axiosConfig.get(
                `/catlog/variants/?page=1&page_size=30${storeId ? `&store_id=${encodeURIComponent(storeId)}` : ""}`
            );
            setFilterData(res.data.results || []);
        } catch (err) {
            console.error("fetchFilterData", err);
        }
    }

    async function fetchVariantOptions(variantId) {
        if (!storeId) return;
        try {
            setSelectedVariantId(variantId);
            const res = await axiosConfig.get(
                `/catlog/variantoptions/?variant_type=${variantId}${storeId ? `&store_id=${encodeURIComponent(storeId)}` : ""}`
            );
            setVariantOptions(res.data.results || []);
        } catch (err) {
            console.error("fetchVariantOptions", err);
            setVariantOptions([]);
        }
    }

    const buildOptionString = (optsObj) =>
        Object.values(optsObj).flat().map((o) => o.name).join(",");

    const buildCategoryVariantsUrl = ({
        selectedCategory = "",
        subcategory = "",
        priceMin = "",
        priceMax = "",
        optionNames = "",
        sortBy = "",
        includeSuspended = true,
    } = {}) => {
        const apiParams = new URLSearchParams({
            search: query || "",
            category: selectedCategory,
            price_min: priceMin,
            price_max: priceMax,
            options: optionNames,
        });

        subcategory?.split(",").forEach((sub) => {
            apiParams.append("subcategory", sub);
        });

        if (storeId) {
            apiParams.set("store_id", storeId);
        }

        if (activeListingType) {
            apiParams.set("listing_type", activeListingType);
        }

        if (sortBy) {
            apiParams.set("sortBy", sortBy);
        }

        if (includeSuspended) {
            apiParams.set("is_suspended", "false");
        }

        return `/catlog/category-variants/?${apiParams.toString()}`;
    };

    async function applyFilters() {
        if (!storeId) return;
        try {
            onLoading(true);
            const selectedCategory = getSelectedCategory();
            const subcatParam = selectedSubcats.join(",");
            const optionNames = buildOptionString(selectedOptions);
            let priceMin = "";
            let priceMax = "";
            const currentPriceRanges = selectedPriceRanges;
            if (currentPriceRanges.length > 0) {
                const allMins = currentPriceRanges.map(r => Number(r.min));
                const allMaxs = currentPriceRanges.map(r => Number(r.max));
                priceMin = Math.min(...allMins);
                priceMax = Math.max(...allMaxs);
            }


            // Ensure store_id stays in the URL so subsequent requests keep scoping to the right store.
            // (React Router's setSearchParams with an object replaces the whole querystring.)
            setSearchParams((prev) => {
                const next = Object.fromEntries([...prev]);
                next.subcategory = subcatParam || "";
                next.options = optionNames || "";
                // next.price_min = priceMin || "";
                // next.price_max = priceMax || "";
                next.price_min = priceMin ?? "";
                next.price_max = priceMax ?? "";
                if (storeId) next.store_id = storeId;
                return next;
            });

            const res = await axiosConfig.get(
                buildCategoryVariantsUrl({
                    selectedCategory,
                    subcategory: subcatParam,
                    priceMin,
                    priceMax,
                    optionNames,
                    includeSuspended: false,
                })
            );
            setAppliedFilters({
                subcategory: [...selectedSubcats],
                options: selectedOptions,
                price: currentPriceRanges,
            });
            setTotalCount(res?.data?.count || 0);
            onProductsChange(res.data.results || []);
            if (res.data.next) {
                collectAllRemaining(res.data.next);
            }
            setShowFilter(false);
        } catch (err) {
            console.error("applyFilters", err);
        } finally {
            onLoading(false);
        }
    }

    async function applySubCategoryFilter() {
        if (!storeId) return;
        try {
            onLoading(true);
            const selectedCategory = getSelectedCategory();
            const optionNames = buildOptionString(selectedOptions);
            const subcatParam = selectedSubcats.join(",");
            let priceMin = searchParams.get("price_min") || "";
            let priceMax = searchParams.get("price_max") || "";

            // if (selectedPriceRanges.length > 0) {
            //     const allMins = selectedPriceRanges.map(range => range.min).filter(min => min !== "");
            //     const allMaxs = selectedPriceRanges.map(range => range.max).filter(max => max !== "");
            //     priceMin = allMins.length > 0 ? Math.min(...allMins) : "";
            //     priceMax = allMaxs.length > 0 ? Math.max(...allMaxs) : "";
            // }
            setSearchParams((prev) => {
                const next = Object.fromEntries([...prev]);
                next.subcategory = subcatParam || "";
                next.options = optionNames || "";
                // next.price_min = priceMin || "";
                // next.price_max = priceMax || "";
                next.price_min = priceMin ?? "";
                next.price_max = priceMax ?? "";
                if (storeId) next.store_id = storeId;
                return next;
            });


            const res = await axiosConfig.get(
                buildCategoryVariantsUrl({
                    selectedCategory,
                    subcategory: subcatParam || "",
                    priceMin: priceMin || "",
                    priceMax: priceMax || "",
                    optionNames: optionNames || "",
                })
            );

            setTotalCount(res?.data?.count || 0);
            onProductsChange(res.data.results || []);
            if (res.data.next) {
                collectAllRemaining(res.data.next);
            }
        } catch (err) {
            console.error("applySubCategoryFilter", err);
        } finally {
            onLoading(false);
        }
    }

    async function handleSortChange(label) {
        if (!storeId) return;
        try {
            setActiveSort(label);
            onLoading(true);
            const selectedCategory = getSelectedCategory();
            setSearchParams((p) => {
                const next = Object.fromEntries([...p]);
                next.sortBy = label;
                return next;
            });
            const subcategory = params.get("subcategory") || "";
            const price_min = params.get("price_min") || "";
            const price_max = params.get("price_max") || "";
            const options = params.get("options") || "";

            const res = await axiosConfig.get(
                buildCategoryVariantsUrl({
                    selectedCategory,
                    subcategory: subcategory || "",
                    priceMin: price_min || "",
                    priceMax: price_max || "",
                    optionNames: options || "",
                    sortBy: label || "",
                })
            );

            setTotalCount(res?.data?.count || 0);
            onProductsChange(res.data.results || []);
            if (res.data.next) {
                collectAllRemaining(res.data.next);
            }
        } catch (err) {
            console.error("handleSortChange", err);
        } finally {
            onLoading(false);
        }
    }

    function handleOptionSelect(variantId, optionId, optionName, isChecked) {
        setSelectedOptions((prev) => {
            const next = { ...prev };
            if (isChecked) {
                next[variantId] = [...(next[variantId] || []), { id: optionId, name: optionName }];
            } else {
                next[variantId] = (next[variantId] || []).filter((o) => o.id !== optionId);
                if ((next[variantId] || []).length === 0) delete next[variantId];
            }
            return next;
        });
    }
    const handlePriceRangeSelect = (rangeId, min, max, isChecked) => {
        setSelectedPriceRanges(prev => {
            if (isChecked) {
                return [{ id: rangeId, min, max }];
            } else {
                return [];
            }
        });
    };
    //uncomment if doesnt work
    // const handlePriceRangeSelect = (rangeId, min, max, isChecked) => {
    //     setSelectedPriceRanges(prev => {
    //         if (isChecked) {
    //             // return [...prev, { id: rangeId, min, max }];
    //             return [{ id: rangeId, min, max }];
    //         } else {
    //             // return prev.filter(range => range.id !== rangeId);
    //             return [];
    //         }
    //     });
    // };
    // async function handleCategoryClick(slug, id) {
    //     if (slug !== friendlyurl) {
    //         navigate(`/${categoryurl}/${slug}`);
    //     }
    //     let newSlug = slug.replace(/-/g, "%")
    //     fetchSubcategories(id);
    //     try {
    //         onLoading(true)
    //         const res = await axiosConfig(`/catlog/category-variants/?listing_type=${activeListingType}&category=${newSlug}`)
    //         onProductsChange(res?.data?.results)
    //     } catch (error) {
    //         console.log(error)
    //     } finally {
    //         onLoading(false)
    //     }
    // }
    async function handleCategoryClick(slug, id, name) {
        if (!storeId) return;
        if (slug !== friendlyurl) {
            navigate(`/${categoryurl}/${slug}`);
        }

        fetchSubcategories(id);
        try {
            onLoading(true)
            // Use name instead of slug for API call
            const encodedName = encodeURIComponent(name);
            const apiParams = new URLSearchParams({
                category: encodedName,
            });
            if (activeListingType) {
                apiParams.set("listing_type", activeListingType);
            }
            if (storeId) {
                apiParams.set("store_id", storeId);
            }
            const res = await axiosConfig(`/catlog/category-variants/?${apiParams.toString()}`)
            setTotalCount(res?.data?.count || 0);
            onProductsChange(res?.data?.results || []);
            if (res?.data?.next) {
                collectAllRemaining(res.data.next);
            }
        } catch (error) {
            console.log(error)
        } finally {
            onLoading(false)
        }
    }
    async function fetchProductsFromURL() {
        if (!storeId) return;
        try {
            onLoading(true);

            // const selectedCategory = friendlyData?.product_data?.slug || friendlyData?.product_data?.name || "";
            const selectedCategory = friendlyData?.name || "";

            const priceMin = params.get("price_min") || "";
            const priceMax = params.get("price_max") || "";
            const options = params.get("options") || "";
            const subcategory = params.get("subcategory") || "";

            const res = await axiosConfig.get(
                buildCategoryVariantsUrl({
                    selectedCategory,
                    subcategory,
                    priceMin,
                    priceMax,
                    optionNames: options,
                })
            );
            setTotalCount(res?.data?.count || 0);
            onProductsChange(res.data.results || []);
            if (res.data.next) {
                collectAllRemaining(res.data.next);
            }
        } catch (err) {
            console.error("fetchProductsFromURL", err);
        } finally {
            onLoading(false);
        }
    }

    // useEffect(() => {
    //     fetchCategories();
    //     fetchFilterData();

    //     const hasFilters =
    //         params.get("price_min") ||
    //         params.get("price_max") ||
    //         params.get("options") ||
    //         params.get("subcategory");

    //     if (hasFilters) {
    //         fetchProductsFromURL();
    //     } else {
    //         fetchInitialProducts();
    //     }

    //     if (friendlyData?.product_data?.id) {
    //         fetchSubcategories(friendlyData.product_data.id);
    //     }

    //     if (category.length > 0 && friendlyurl) {
    //         const activeCategory = category.find(cat => cat.slug === friendlyurl);
    //         if (activeCategory) {
    //             fetchSubcategories(activeCategory.id);
    //         }
    //     }
    // }, [friendlyData, categoryurl]);
    // 1. Fetch main generic filter data only on load/url change
    useEffect(() => {
        fetchCategories();
        fetchFilterData();
    }, [categoryurl, storeId]);

    // 2. Fetch subcategories safely after category mapping or friendlyData is available
    useEffect(() => {
        if (friendlyData?.product_data?.id) {
            fetchSubcategories(friendlyData.product_data.id);
        } else if (category.length > 0 && friendlyurl) {
            const activeCategory = category.find(cat => cat.slug === friendlyurl);
            if (activeCategory) {
                fetchSubcategories(activeCategory.id);
            }
        }
    }, [friendlyData, category, friendlyurl, storeId]);

    // 3. Search page special subcategory fetch
    useEffect(() => {
        if (isSearchPage && category.length > 0) {
            searchSubcategory();
        }
    }, [isSearchPage, category, storeId]);

    // 4. Parse URL filters and trigger product fetch
    useEffect(() => {
        const price_min = searchParams.get("price_min");
        const price_max = searchParams.get("price_max");
        const optionsParam = searchParams.get("options");
        const subcategoryParam = searchParams.get("subcategory");

        const filtersFromURL = {};

        // Price from URL
        if (price_min && price_max) {
            const min = Number(price_min);
            const max = Number(price_max);
            filtersFromURL.price = [{ min, max }];
            const matched = priceRanges.find(r => r.min === min && r.max === max);
            setSelectedPriceRanges(matched ? [matched] : [{ id: 999, min, max, label: `$${min} - $${max}` }]);
        } else {
            setSelectedPriceRanges([]);
        }

        // Subcategories from URL
        if (subcategoryParam) {
            const selectedSubcatsFromURL = decodeURIComponent(subcategoryParam).split(",").filter(Boolean);
            setSelectedSubcats(selectedSubcatsFromURL);
            filtersFromURL.subcategory = selectedSubcatsFromURL;
        } else {
            setSelectedSubcats([]);
            filtersFromURL.subcategory = [];
        }

        // Options from URL
        if (optionsParam) {
            try {
                // If the parameter is JSON (from second hook)
                if (optionsParam.startsWith("{") || optionsParam.startsWith("[")) {
                    const decodedOptions = JSON.parse(decodeURIComponent(optionsParam));
                    setSelectedOptions(decodedOptions);
                    filtersFromURL.options = decodedOptions;
                } else {
                    // Normal comma separated (from first hook)
                    const optionNames = decodeURIComponent(optionsParam).split(",").filter(Boolean);
                    const optionsObj = {};
                    if (optionNames.length > 0) {
                        optionsObj["fromURL"] = optionNames.map((name, i) => ({ id: i + 1, name }));
                    }
                    filtersFromURL.options = optionsObj;
                    setSelectedOptions(optionsObj);
                }
            } catch {
                console.warn("Invalid options format in URL");
            }
        } else {
            setSelectedOptions({});
        }

        setAppliedFilters(filtersFromURL);

        // Fetch products on initial mount or when data updates
        if (!isPromotional) {
            fetchProductsFromURL();
        }

    }, [friendlyData, categoryurl, activeListingType, searchParams, storeId]); // Re-fetch when filters or listing type change //add searchParams if needed

    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        }).replace("$", "$ ");
    const handleRemoveFilter = (type, value) => {
        const params = new URLSearchParams(searchParams);

        if (type === "price") {
            setSelectedPriceRanges([]);
            setAppliedFilters(prev => ({ ...prev, price: [] }));
            params.delete("price_min");
            params.delete("price_max");
        }

        if (type === "subcategory") {
            const current = decodeURIComponent(params.get("subcategory") || "").split(",").filter(Boolean);
            const updated = current.filter(item => item !== value);
            setSelectedSubcats(updated);
            setAppliedFilters(prev => ({ ...prev, subcategory: updated }));
            if (updated.length) params.set("subcategory", updated.join(","));
            else params.delete("subcategory");
        }

        if (type === "option") {
            const updatedOptions = { ...selectedOptions };
            Object.keys(updatedOptions).forEach(key => {
                updatedOptions[key] = updatedOptions[key].filter(opt => opt.name !== value);
                if (updatedOptions[key].length === 0) delete updatedOptions[key];
            });
            setSelectedOptions(updatedOptions);
            setAppliedFilters(prev => ({ ...prev, options: updatedOptions }));

            if (Object.keys(updatedOptions).length)
                params.set("options", encodeURIComponent(JSON.stringify(updatedOptions)));
            else params.delete("options");
        }

        setSearchParams(params);
        // applyFilters();
    };


    return (
        <>
            <div className="carousel-container">
                {/* <button
                    className="scroll-btn left"
                    onClick={() => carouselRef.current?.scrollBy({ left: -200, behavior: "smooth" })}
                >
                    <IoChevronBack className="arrow-icons" />
                </button> */}

                {
                    !isSearchPage ? (
                        <div className="carousel" ref={carouselRef}>
                            {category.map((cat) => (
                                <div
                                    key={cat.id}
                                    className={`category-item ${friendlyurl === cat.slug ? "active" : ""}`}
                                    onClick={() => handleCategoryClick(cat.slug, cat.id, cat.name)}
                                >
                                    {cat.name}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="searched-data">
                            <div>
                                <span className="search-query">{query}</span> <span className="ms-2 search-count">{totalCount || products.length} Items</span>
                            </div>
                            <div className="listing-type-container">
                                <div className={`listing-type ${activeListingType === "buy" ? "active" : ""}`} onClick={() => handleActiveListingType("buy")}>BUY</div>
                                <div className={`listing-type ${activeListingType === "rent" ? "active" : ""}`} onClick={() => handleActiveListingType("rent")}>RENT</div>
                            </div>
                        </div>
                    )
                }

                {/* <button
                    className="scroll-btn right"
                    onClick={() => carouselRef.current?.scrollBy({ left: 200, behavior: "smooth" })}
                >
                    <IoChevronForward className="arrow-icons" />
                </button> */}
            </div>

            <div className="filter-sections">
                <div className="applied-filters">
                    {
                        (Object.values(appliedFilters.options || {}).flat().length > 0 ||
                            (appliedFilters.price || []).length > 0 ||
                            (appliedFilters.subcategory || []).length > 0) && (
                            <p className="applied-filter">Applied Filters:</p>
                        )
                    }

                    {(appliedFilters.subcategory || []).map((sub) => (
                        <span key={sub} className="filter-tags">
                            {sub}
                            <span className="remove-icon" onClick={() => handleRemoveFilter("subcategory", sub)}>×</span>
                        </span>
                    ))}

                    {(appliedFilters.price || []).map((p) => (
                        <span key={`${p.min}-${p.max}`} className="filter-tags">
                            ${p.min} - ${p.max}
                            <span className="remove-icon" onClick={() => handleRemoveFilter("price", `${p.min}-${p.max}`)}>×</span>
                        </span>
                    ))}

                    {Object.values(appliedFilters.options || {}).flat().map((opt) => (
                        <span key={opt.name} className="filter-tags">
                            {opt.name}
                            <span className="remove-icon" onClick={() => handleRemoveFilter("option", opt.name)}>×</span>
                        </span>
                    ))}
                </div>
            </div>


            <div className="filter-section">
                <div className="filters-left">
                    <div className="filter">FILTER</div>

                    <div className="filter-box">
                        Sub-Category
                        <div className="dropdown">
                            {subcategoryProducts.length > 0 ? (
                                subcategoryProducts.map((item) => (
                                    <label key={item.id}>
                                        <input
                                            type="checkbox"
                                            checked={selectedSubcats.includes(item.name)}
                                            onChange={(e) =>
                                                setSelectedSubcats((prev) =>
                                                    e.target.checked ? [...prev, item.name] : prev.filter((n) => n !== item.name)
                                                )
                                            }
                                        />
                                        {item.name}
                                    </label>
                                ))
                            ) : (
                                <div className="d-flex justify-content-center">No subcategories</div>
                            )}
                            {
                                subcategoryProducts.length > 0 && (
                                    <div className="confirm-btn">
                                        <button onClick={applySubCategoryFilter}>CONFIRM</button>
                                    </div>)
                            }
                        </div>
                        <IoArrowDown />
                    </div>

                    <div className="filter-box">
                        Price Range
                        <div className="dropdown">
                            {/* Pre-defined price ranges with checkboxes */}
                            {priceRanges.map((range) => (
                                <label key={range.id}>
                                    <input
                                        type="checkbox"
                                        checked={selectedPriceRanges.some(r => r.id === range.id)}
                                        onChange={(e) => handlePriceRangeSelect(range.id, range.min, range.max, e.target.checked)}
                                    />
                                    {range.label}
                                </label>
                            ))}

                            <div className="confirm-btn">
                                <button onClick={applyFilters}>APPLY PRICE FILTER</button>
                            </div>
                        </div>
                        <IoArrowDown />
                    </div>
                    <div className="filter-box" onClick={() => setShowFilter(true)}>
                        More Options
                        <div>
                            <IoArrowForward />
                        </div>
                    </div>
                </div>

                <div className="sort-right">
                    <div className="sortby">SORT BY</div>
                    <div className="sort-box">
                        {activeSort}
                        <div className="dropdown">
                            {Object.keys(sort_map).map((label) => (
                                <div
                                    key={label}
                                    className={`sort-option ${activeSort === label ? "active" : ""}`}
                                    onClick={() => handleSortChange(label)}
                                >
                                    {label}
                                    {activeSort === label && <FaCheck />}
                                </div>
                            ))}
                        </div>
                        <FaCheck />
                    </div>
                </div>
            </div>

            <FilterOptions
                show={showFilter}
                onClose={() => setShowFilter(false)}
                filterData={filterData}
                variantOptions={variantOptions}
                selectedVariantId={selectedVariantId}
                selectedOptions={selectedOptions}
                onVariantClick={fetchVariantOptions}
                onOptionSelect={handleOptionSelect}
                onClearAll={() => {
                    setSelectedOptions({});
                    setVariantOptions([]);
                    setSelectedVariantId(null);
                }}
                onApplyFilters={applyFilters}
            />
        </>
    );
}

export default FilterSection;
