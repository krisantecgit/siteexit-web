import React, { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import "./address.css";
import "./addresses.css";
import { IoLocationOutline } from "react-icons/io5";
import axiosConfig from "../../Services/axiosConfig"
import { toast } from "react-toastify";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAddress } from "../../redux/addressSlice";
import CheckoutNavbar from "../CheckoutNavbar/CheckoutNavbar";

const API_KEY = "AIzaSyDD8frd15FoMhemosVqGvVBCHaRjLgNszc";

const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
];

export default function AddressPage() {
    const userId = localStorage.getItem("userid")
    const [step, setStep] = useState("default");
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [zipcodeCheck, setZipcodeCheck] = useState("");
    const [zipcodeStatus, setZipcodeStatus] = useState(null);
    const [checkingZip, setCheckingZip] = useState(false);
    const inputRef = useRef();
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const location = useLocation();
    const addressType = location.state?.addressType || 'sale';
    const [formData, setFormData] = useState({
        name: "",
        address_line_1: "",
        address_line_2: "",
        flat_no: "",
        landmark: "",
        zipcode: "",
        latitude: "",
        longitude: "",
        mobileno: "",
        country: "",
        state: "",
        city: "",
        user: userId
    })
    useEffect(() => {
        if (window.google) return setScriptLoaded(true);
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.head.appendChild(script);
    }, []);

    async function fetchAddress() {
        try {
            const res = await axiosConfig.get(`/accounts/address/?user=${userId}&is_suspended=false`);

            const list = res?.data?.results ?? [];

            setAddresses(list);
            dispatch(setAddress(list));

            // 🔥 set default based on saved ID
            const savedId = localStorage.getItem("defaultAddressId");

            if (savedId) {
                const index = list.findIndex(a => String(a?.id) === String(savedId));
                if (index !== -1) {
                    setSelectedIndex(index);
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchAddress()
    }, [userId])

    useEffect(() => {
        setZipcodeCheck("");
        setZipcodeStatus(null);
    }, [addressType]);

    const checkZipcode = async () => {
        if (!zipcodeCheck) return;

        setCheckingZip(true);
        try {
            let url = `/masters/check-zipcode-availability/?`;
            if (addressType === "rental") {
                url += `rental_zipcode=${zipcodeCheck}`;
            } else {
                url += `sale_zipcode=${zipcodeCheck}`;
            }

            const res = await axiosConfig.get(url);
            const statusData =
                addressType === "rental"
                    ? res?.data?.rental_zipcode ?? null
                    : res?.data?.sale_zipcode ?? null;

            setZipcodeStatus(statusData);
            if (statusData?.status === "Available") {
                setFormData((prev) => ({ ...prev, zipcode: zipcodeCheck }));
            }
        } catch (error) {
            setZipcodeStatus({ status: "Error", message: "Something went wrong" });
        } finally {
            setCheckingZip(false);
        }
    };

    const handleAddAddress = () => {
        // Mirrored exactly from AddressesPage.jsx as requested
        setFormData((prev) => ({ ...prev, zipcode: zipcodeCheck }));
        setStep("add");
    };
    const getSuggestions = (val) => {
        if (!window.google || val.length < 2) return setSuggestions([]);
        new window.google.maps.places.AutocompleteService().getPlacePredictions(
            { input: val, types: ["address"], componentRestrictions: { country: "in" } },
            (preds, status) =>
                status === "OK" ? setSuggestions(preds) : setSuggestions([])
        );
    };

    const handleSelect = (place) => {
        setQuery(place.description);
        setSuggestions([]);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ placeId: place.place_id }, (res, status) => {
            if (status === "OK" && res[0]) {
                const loc = res[0].geometry.location;
                const data = { lat: loc.lat(), lng: loc.lng(), address: place.description };
                setSelected(data);
                setStep("map");
            }
        });
    };

    useEffect(() => {
        if (step !== "map" || !selected || !window.google) return;
        const map = new window.google.maps.Map(document.getElementById("map"), {
            center: selected,
            zoom: 16,
        });
        new window.google.maps.Marker({ position: selected, map });

        map.addListener("click", (e) => {
            const lat = e.latLng.lat(), lng = e.latLng.lng();
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (res, status) => {
                if (status === "OK" && res[0]) {
                    setSelected({ lat, lng, address: res[0].formatted_address });
                    setQuery(res[0].formatted_address);
                }
            });
        });
    }, [step, selected]);
    useEffect(() => {
        if (selected?.address) {
            setFormData(prev => ({
                ...prev,
                address_line_1: selected.address
            }));
        }
    }, [selected]);
    async function formSubmit(e) {
        e.preventDefault();

        if (formData.zipcode !== zipcodeCheck || zipcodeStatus?.status !== "Available") {
            toast.error("Please verify the zipcode before adding the address");
            return;
        }

        const payload = {
            ...formData,
            latitude: selected?.lat || "",
            longitude: selected?.lng || "",
        };

        try {
            const res = await axiosConfig.post("/accounts/address/", payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.data.success) {
                toast.success(res.data.message);
            }
            setZipcodeCheck("");
            setZipcodeStatus(null);
            setQuery("");
            setSuggestions([]);
            setSelected(null);
            setStep("default")
            await fetchAddress()
        } catch (error) {
            console.log(error);
        }
    }
    async function handleValidate() {
        const selectedAddress = addresses[selectedIndex];

        if (!selectedAddress) {
            toast.error(`Please select ${addressType} delivery address`);
            return;
        }

        if (!selectedAddress.zipcode) {
            toast.error("Selected address doesn't have a zipcode");
            return;
        }
        try {
            const result = await validateZipcode(selectedAddress.zipcode);

            const isAvailable =
                addressType === "sale"
                    ? result.sale_zipcode?.status === "Available"
                    : addressType === "rental"
                        ? result.rental_zipcode?.status === "Available"
                        : result.sale_zipcode?.status === "Available" && result.rental_zipcode?.status !== "Unavailable";

            if (isAvailable) {
                if (addressType === 'sale') {
                    localStorage.setItem('saleAddress', JSON.stringify(selectedAddress));
                    toast.success("Sale delivery available for this zipcode!");
                } else if (addressType === 'rental') {
                    localStorage.setItem('rentalAddress', JSON.stringify(selectedAddress));
                    toast.success("Rental delivery available for this zipcode!");
                } else {
                    localStorage.setItem('saleAddress', JSON.stringify(selectedAddress));
                    localStorage.setItem('rentalAddress', JSON.stringify(selectedAddress));
                    toast.success("Delivery available for this zipcode!");
                }

                navigate(-1);
            } else {
                toast.error(`Delivery not available for zipcode: ${selectedAddress.zipcode}`);
            }

        } catch (error) {
            toast.success(error?.response?.data?.message)
        }
    }

    async function validateZipcode(zipcode) {
        try {
            let url = `/masters/check-zipcode-availability/?`;

            if (addressType === 'sale') {
                url += `sale_zipcode=${zipcode}`;
            } else if (addressType === 'rental') {
                url += `rental_zipcode=${zipcode}`;
            } else {
                url += `sale_zipcode=${zipcode}`; // Both mode fallback
            }

            const response = await axiosConfig.get(url);
            return response.data;
        } catch (error) {
            console.error("Zipcode validation error:", error);
            throw error;
        }
    }
    return (
        <div>
            <CheckoutNavbar />
            <div className="address-container">
                <div className="address-left">
                    {step === "default" && (
                        <>
                            <h3>Select Delivery Address</h3>
                            <div className="zipcode-top-box">
                                <div className="zip-input-group">
                                    <input
                                        type="text"
                                        placeholder="Enter Zipcode"
                                        maxLength={5}
                                        value={zipcodeCheck}
                                        onChange={(e) => {
                                            setZipcodeCheck(e.target.value);
                                            setZipcodeStatus(null);
                                        }}
                                    />
                                    <button onClick={checkZipcode}>Check</button>
                                </div>

                                {checkingZip && <div className="zip-info">Checking...</div>}

                                {zipcodeStatus && (
                                    <div
                                        className={`zip-info ${zipcodeStatus?.status === "Available" ? "success" : "error"
                                            }`}
                                    >
                                        {zipcodeStatus?.status === "Available"
                                            ? "Service available"
                                            : "Service not available"}
                                    </div>
                                )}
                            </div>
                            <button onClick={handleAddAddress} className="address-add-btn">
                                + Add new address
                            </button>
                            <div className="address-container">
                                <div className="address-list">
                                    {addresses.map((add, ind) => (
                                        <div
                                            key={ind}
                                            className={`address-box ${selectedIndex === ind ? "active" : ""}`}
                                            onClick={() => {
                                                setSelectedIndex(ind);
                                                localStorage.setItem("defaultAddressId", add?.id);
                                                if (addressType === 'sale') {
                                                    localStorage.setItem('saleAddress', JSON.stringify(add));
                                                } else if (addressType === 'rental') {
                                                    localStorage.setItem('rentalAddress', JSON.stringify(add));
                                                } else {
                                                    localStorage.setItem('saleAddress', JSON.stringify(add));
                                                    localStorage.setItem('rentalAddress', JSON.stringify(add));
                                                }
                                            }}
                                        >
                                            <div className="address-box-header">
                                                <div className="user-name">
                                                    {selectedIndex === ind ? (
                                                        <FaCheckCircle className="check-icon checked" />
                                                    ) : (
                                                        <FaRegCircle className="check-icon" />
                                                    )}
                                                    {add.name}{" "}
                                                    {selectedIndex === ind && <span className="default-badge">Default</span>}
                                                </div>

                                                {selectedIndex === ind && (
                                                    <button
                                                        type="button"
                                                        className="address-proceed-btn address-card-proceed-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedIndex(ind);
                                                            handleValidate();
                                                        }}
                                                    >
                                                        {addressType === 'sale'
                                                            ? 'Use for Sale Delivery'
                                                            : addressType === 'rental'
                                                                ? 'Use for Rental Delivery'
                                                                : 'Use this Delivery Address'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="user-city">
                                                {add?.city} {add?.zipcode}
                                            </div>

                                            <div className="user-address">
                                                {add.flat_no}, {add.address_line_1}, {add.address_line_2}, {add.city},{" "}
                                                {add.state}, {add.country} - {add.zipcode}
                                            </div>

                                            <div className="user-mob-no">
                                                Contact Number : <span className="mob">{add.mobileno}</span>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                            </div>
                        </>
                    )}

                    {step === "add" && (
                        <>
                            <h3 className="address-add-new">Add new address</h3>
                            <div className="address-search-bar">
                                <input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => {
                                        setQuery(e.target.value);
                                        getSuggestions(e.target.value);
                                    }}
                                    placeholder="Search my location"
                                />
                                <FiSearch className="address-search-icon" />
                                {suggestions.length > 0 && (
                                    <div className="suggestions-dropdown">
                                        {suggestions.map((s) => (
                                            <div key={s.place_id} onClick={() => handleSelect(s)} className="map-suggestion">
                                                <IoLocationOutline className="map-alt" />  <span>{s.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {!scriptLoaded && <p>Loading maps...</p>}
                        </>
                    )}

                    {step === "map" && selected && (
                        <>
                            <h3 className="address-confirm-title">Confirm Location</h3>
                            <div className="selected-address">
                                <div className="selected-address">
                                    <IoLocationOutline className="map-alt" /> {selected.address}
                                </div>
                            </div>
                            <div id="map" className="map-view" />
                            <div className="map-actions">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        setSuggestions([]);
                                        setStep("add");
                                    }}
                                    className="address-confirm-btn"
                                >
                                    change
                                </button>
                                <button
                                    className="address-confirm-btn"
                                    onClick={() => {
                                        setQuery("");
                                        setSuggestions([]);
                                        setStep("address");
                                    }}
                                >
                                    confirm
                                </button>
                            </div>
                        </>
                    )}
                    {step === "address" && (
                        <form className="address-form" onSubmit={formSubmit}>
                            <div className="selected-address-box">
                                <div className="address-head">
                                    <div className="area-name"><IoLocationOutline className="map-alt me-1" />{selected?.address?.split(",")[0]}</div>
                                    <button
                                        className="address-confirm-btn"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setQuery("");
                                            setSuggestions([]);
                                            setStep("add");
                                        }}
                                    >
                                        CHANGE
                                    </button>

                                </div>
                                <div className="area-details">{selected?.address}</div>
                            </div>
                            <div className="address-form-box">
                                <div className="input-field">
                                    <label htmlFor="locality">Country  <span className="sup-color">*</span></label>
                                    <input
                                        type="text"
                                        className="input-box-address"
                                        placeholder="Country"
                                        value={formData.country}
                                        required
                                        onChange={(e) =>
                                            setFormData({ ...formData, country: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="input-double">
                                    <div className="input-field">
                                        <label htmlFor="floor">Full Name  <span className="sup-color">*</span></label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            required
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                        />
                                    </div>
                                    <div className="input-field">
                                        <label htmlFor="houseNo">Mobile Number <span className="sup-color">*</span></label>
                                        <input
                                            type="text"
                                            className="input-box-address"
                                            placeholder="Mobile Number"
                                            value={formData.mobileno}
                                            required
                                            maxLength={10}
                                            onChange={(e) =>
                                                setFormData({ ...formData, mobileno: e.target.value })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="label-title">
                                    <div className="input-double">

                                        <div className="input-field">
                                            <label htmlFor="houseNo">Flat no  <span className="sup-color">*</span></label>
                                            <input
                                                type="text"
                                                className="input-box-address"
                                                placeholder="House/Apartment no"
                                                value={formData.flat_no}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, flat_no: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="input-field">
                                    <label htmlFor="houseName">Address line 1  <span className="sup-color">*</span></label>
                                    <input
                                        type="text"
                                        className="input-box-address"
                                        placeholder="Address line 1"
                                        value={formData.address_line_1}
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_line_1: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="input-field">
                                    <label htmlFor="locality">Address line 2  <span className="sup-color">*</span></label>
                                    <input
                                        type="text"
                                        className="input-box-address"
                                        placeholder="Address line 2"
                                        value={formData.address_line_2}
                                        required
                                        onChange={(e) =>
                                            setFormData({ ...formData, address_line_2: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="label-title">

                                    <div className="input-double">
                                        <div className="input-field">
                                            <label htmlFor="floor">Zipcode  <span className="sup-color">*</span></label>
                                            <input
                                                type="text"
                                                className="input-box-address"
                                                placeholder="Zipcode"
                                                value={formData.zipcode}
                                                // onChange={(e) =>
                                                //     setFormData({ ...formData, zipcode: e.target.value })
                                                // }
                                                maxLength={5}
                                                onChange={(e) => {
                                                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, ''); // Removes anything not 0-9
                                                    setFormData({ ...formData, zipcode: onlyNumbers });
                                                }}
                                            />
                                        </div>

                                        <div className="input-field">
                                            <label htmlFor="houseNo">State  <span className="sup-color">*</span></label>
                                            <select
                                                className="input-box-address address-select-field"
                                                required
                                                value={formData.state || ""}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, state: e.target.value })
                                                }
                                            >
                                                <option value="">Select State</option>
                                                {INDIAN_STATES.map((stateName) => (
                                                    <option key={stateName} value={stateName}>
                                                        {stateName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="input-field">
                                            <label htmlFor="floor">City  <span className="sup-color">*</span></label>
                                            <input
                                                type="text"
                                                className="input-box-address"
                                                placeholder="City"
                                                value={formData.city}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, city: e.target.value })
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" className="address-proceed-btn">Proceed</button>
                        </form>
                    )}
                </div>

                <div className="address-right">
                    <div className="delivery-estimate-title">Delivery Estimate</div>
                    <div className="address-delivery-estimate-time">
                        <TbTruckDelivery className="truck-icon" />
                        <div>
                            {selected
                                ? "Address confirmed! Delivery estimate will be calculated."
                                : "Add a new address to get a delivery estimate."}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
