import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import "./productdetails.css";
import Header from '../header/Header';
import { IoArrowBack, IoArrowForward } from "react-icons/io5";
import { FaSearchPlus } from 'react-icons/fa';
import axiosConfig from "../../Services/axiosConfig"
import RelatedProducts from './RelatedProducts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch } from 'react-redux';
import { addToBuyCart, addToRentCart, } from '../../redux/cartSlice';
import { toast } from 'react-toastify';
import Wishlist from '../WishList/Wishlist';
import { generateUUID } from '../../utils/RandomId';

function Productdetails() {
    const { state } = useLocation();
    console.log(state, "fahhhhhhh")
    const dispatch = useDispatch();
    const { friendlyurl } = useParams();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [product, setProduct] = useState({});
    const [productDetails, setProductDetails] = useState()
    const [isZoomed, setIsZoomed] = useState(false)
    const [listingType, setListingType] = useState('buy');
    const [selectedOption, setSelectedOption] = useState('');
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [wishListed, setWishListed] = useState(false)
    const [error, setError] = useState("")
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    let navigate = useNavigate()
    const formatPrice = (price) =>
        price?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
        }).replace("$", "$ ");

    useEffect(() => {
        if (productDetails?.varient_listing_type) {
            const apiListingType = productDetails.varient_listing_type;
            setListingType(apiListingType);
            if (apiListingType === 'buy') {
                setSelectedOption('buy');
            } else if (apiListingType === 'rent') {
                setSelectedOption('rent');
            } else if (apiListingType === 'buy/rent') {
                setSelectedOption(state?.listingType === 'rent' ? 'rent' : 'buy');
            }
        }
    }, [productDetails, state?.listingType]);
    const userId = localStorage.getItem("userid");
    const fetchIsWishlist = useCallback(async () => {
        try {
            const res = await axiosConfig.get(`/catlog/wishlist-check/?variant_id=${productDetails.id}&type=${selectedOption}`)
            setWishListed(res?.data)
        } catch (error) {
            console.log(error)
        }
    }, [productDetails?.id, selectedOption])
    useEffect(() => {
        if (!userId) return;
        if (!productDetails?.id) return;
        if (!selectedOption) return;
        fetchIsWishlist()
    }, [productDetails?.id, selectedOption])
    useEffect(() => {
        async function fetchFullProduct() {
            const res = await axiosConfig.get(`/catlog/seo-url/${friendlyurl}`);
            setProduct(res.data.product_data);
        }
        async function fetchProductDetails() {
            const variantId =
                state?.item?.varient?.id ||
                state?.item?.id;
            try {
                const res = await axiosConfig.get(`/catlog/product-variant-detail/${variantId}`);
                setProductDetails(res.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchFullProduct();
        fetchProductDetails()
    }, [friendlyurl, state?.item?.id]);
    const images = productDetails?.images.map((img) => img.image) || [];
    // useEffect(() => {
    //     if (state?.item?.name) {
    //         document.title = product.name;
    //     }
    // }, [state?.item?.name]);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };
    function handleListingSwitch(type) {
        setError("")
        const urlType = type === "buy" ? "buy" : "rent";
        navigate(`/product/${friendlyurl}`, {
            state: { item: state?.item, listingType: urlType },
        });
    }
    function formatLocalDate(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    function handleAddToCart(type, productData) {
        const cartItemId = generateUUID();
        if (type === "rent") {
            if (!fromDate) {
                setError("Please choose start date before adding to cart.")
                setTimeout(() => {
                    setError("")
                }, 3000)
                return;
            }
            dispatch(addToRentCart({
                ...productData, cartItemId, fromDate: formatLocalDate(fromDate), toDate: formatLocalDate(toDate)
            }))
            toast.success("Product added to cart")
        } else {
            dispatch(addToBuyCart({ ...productData, cartItemId }))
            toast.success("Product added to cart")
        }
    }

    const descriptionHtml = product?.description || "";
    const plainDescription = descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const shouldShowReadMore = plainDescription.length > 320;

    return (
        <div>
            <Header />
            <div className="product-details">
                <div className="product-left">
                    <div className="image-slider">
                        {images.length > 0 && (
                            <>
                                <div className="main-image-wrapper">
                                    <img
                                        src={images[currentIndex].image}
                                        alt="Product" className="main-image" />
                                    <div className="zoom-container">
                                        <FaSearchPlus
                                            className="search-plus"
                                            onMouseEnter={() => setIsZoomed(true)}
                                            onMouseLeave={() => setIsZoomed(false)}
                                        />
                                        {isZoomed && (
                                            <div className="zoom-preview">
                                                <img src={images[currentIndex].image} />
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </>
                        )}
                        <button className="arrow left" onClick={handlePrev}>
                            <IoArrowBack />
                        </button>
                        <button className="arrow right" onClick={handleNext}>
                            <IoArrowForward />
                        </button>
                    </div>



                    <div className="thumbnail-section">
                        {images.map((img, index) => (
                            <img
                                key={index}
                                src={img.image}
                                alt={`Thumbnail ${index}`}
                                className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                            />
                        ))}
                    </div>
                    <div className="product-name">{productDetails?.name}</div>
                    <div className="product-description-section">
                        <div
                            className={`product-description ${isDescriptionExpanded ? "expanded" : "collapsed"}`}
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        ></div>
                        {shouldShowReadMore && (
                            <button
                                type="button"
                                className="product-description-toggle"
                                onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                            >
                                {isDescriptionExpanded ? "Read less" : "Read more"}
                            </button>
                        )}
                    </div>
                </div>
                <div className="product-right-column">
                    <div className={`product-right ${selectedOption === "buy" ? "buy-bg" : "rent-bg"}`}>
                        <div className='product-right-listingtype'>
                            <div>{productDetails?.varient_listing_type}</div>
                            <div>
                                <Wishlist productData={productDetails} selectedOption={selectedOption} wishListed={wishListed} onLoad={fetchIsWishlist} />
                            </div>
                        </div>
                        <div className='product-right-title'>{productDetails?.name}</div>

                        {productDetails?.options && productDetails.options.length > 0 && (
                            <div className="variant-options-container">
                                <div className="variant-options-grid">
                                    {productDetails.options.map((option) => (
                                        <div key={option.id} className="variant-option-item">
                                            <span className="variant-type-label">{option.variant_type}</span>
                                            <span className="variant-option-value">{option.variant_option}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="radio-group">
                            {productDetails?.varient_listing_type && (
                                <>
                                    {(() => {
                                        const currentType = selectedOption;
                                        const type = productDetails.varient_listing_type;

                                        const showBuy = type === "buy" || type === "buy/rent";
                                        const showRent = type === "rent" || type === "buy/rent";

                                        const options =
                                            currentType === "rent"
                                                ? [{ key: "rent" }, { key: "buy" }]
                                                : [{ key: "buy" }, { key: "rent" }];

                                        return (
                                            <>
                                                {options.map(({ key }) => {
                                                    if ((key === "buy" && showBuy) || (key === "rent" && showRent)) {
                                                        const price =
                                                            key === "buy"
                                                                ? productDetails.prices?.sale_offer_price
                                                                : productDetails.prices?.rental_price;
                                                        const oldPrice =
                                                            key === "buy" ? productDetails.prices?.sale_price : null;

                                                        const isActive = currentType === key;

                                                        return (
                                                            <div key={key}>
                                                                <div
                                                                    className="d-flex justify-content-between mt-3"
                                                                    onClick={() => {
                                                                        if (currentType !== key) handleListingSwitch(key);
                                                                    }}
                                                                >
                                                                    <div className="single-option">
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            width="14"
                                                                            height="14"
                                                                            viewBox="0 0 24 24"
                                                                            fill="none"
                                                                            stroke={isActive ? "#069baa" : "#535252ff"}
                                                                            strokeWidth="2"
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                        >
                                                                            <circle cx="12" cy="12" r="10" />
                                                                            {isActive && <circle cx="12" cy="12" r="5" fill="#069baa" />}
                                                                        </svg>
                                                                        <label className="ms-1" style={{ cursor: "pointer" }}>
                                                                            {key === "buy" ? "Buy" : "Rent"}
                                                                        </label>
                                                                    </div>

                                                                    {key === "rent" && (
                                                                        <div className="option-price" style={{ fontWeight: 600 }}>
                                                                            {formatPrice(price)}
                                                                            <span style={{ fontSize: "14px", marginLeft: "4px" }}>/Day</span>
                                                                        </div>
                                                                    )}

                                                                    {key === "buy" && oldPrice && (
                                                                        <div className="product-details-offer-price">
                                                                            {oldPrice && price ? <span className="product-old-price-right">{formatPrice(oldPrice)}</span> : <span className='product-discount-right'>{formatPrice(oldPrice)}</span>}
                                                                            <span className="product-discount-right">
                                                                                {oldPrice && price
                                                                                    ? `${Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF`
                                                                                    : ""}
                                                                            </span>
                                                                        </div>
                                                                    )}

                                                                </div>
                                                                {key === "rent" && currentType === "rent" && (
                                                                    <div className="rent-date-section mt-2">
                                                                        <div className="date-picker-row">
                                                                            <div className="date-field">
                                                                                <label>From:</label>
                                                                                <DatePicker
                                                                                    selected={fromDate}
                                                                                    onChange={(date) => setFromDate(date)}
                                                                                    dateFormat="dd/MM/yyyy"
                                                                                    placeholderText="Select start date"
                                                                                    minDate={new Date()}
                                                                                    className="custom-date-input"
                                                                                    popperPlacement="bottom-start"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {isActive && (
                                                                    <div className='cart-btn-section mt-3'>
                                                                        <div className="cart-btn mt-3" onClick={() =>
                                                                            handleAddToCart(key, {
                                                                                id: productDetails?.id,
                                                                                name: productDetails?.name,
                                                                                friendlyurl: friendlyurl,
                                                                                type: key,
                                                                                image: images?.[0]?.image,
                                                                                oldPrice: key === "buy" ? productDetails?.prices?.sale_price : null,
                                                                                offerPrice:
                                                                                    key === "buy"
                                                                                        ? productDetails?.prices?.sale_offer_price || productDetails?.prices?.sale_price
                                                                                        : productDetails?.prices?.rental_price,
                                                                                rentPerDay: key === "rent" ? productDetails?.prices?.rental_price : null,
                                                                            })
                                                                        }
                                                                        >
                                                                            <div>
                                                                                {formatPrice(price || oldPrice)}
                                                                                {key === "rent" && <span style={{ fontSize: "14px", marginLeft: "4px" }}>/Day</span>}
                                                                            </div>
                                                                            <div>
                                                                                ADD TO CART <IoArrowForward size={17} />
                                                                            </div>
                                                                        </div>
                                                                        {error && (
                                                                            <span className='text-danger text-sm'>{error}</span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <RelatedProducts productId={product?.id} varientId={productDetails?.id} />
        </div>
    );
}

export default Productdetails;
