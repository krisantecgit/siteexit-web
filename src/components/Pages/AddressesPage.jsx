import React, { useEffect, useRef, useState } from "react";
import { FiEdit2, FiSearch, FiTrash2 } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getAddresses, updateAddress } from "../../utils/accountApi";
import axiosInstance from "../../utils/axiosInstance";
import "./account.css";

const API_KEY = "AIzaSyDD8frd15FoMhemosVqGvVBCHaRjLgNszc";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const emptyForm = {
  name: "", address_line_1: "", address_line_2: "", flat_no: "",
  landmark: "", zipcode: "", mobileno: "", country: "India",
  state: "", city: "", latitude: "", longitude: "",
};

// steps: "default" → "add" (search) → "map" → "address" (form)

function AddressesPage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");
  const userName = localStorage.getItem("name") || "Customer";

  // ── address list state ──
  const [addresses, setAddresses] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // ── flow step ──
  const [step, setStep] = useState("default");
  const [editId, setEditId] = useState(null);

  // ── zipcode check ──
  const [zipcodeCheck, setZipcodeCheck] = useState("");
  const [zipcodeStatus, setZipcodeStatus] = useState(null); // null | { status, zipcode }
  const [checkingZip, setCheckingZip] = useState(false);

  // ── map / search ──
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null); // { lat, lng, address }
  const searchRef = useRef(null);

  // ── form ──
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  // ═══════════════════════════════════════════════════════
  // Load Google Maps script once
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (window.google) return setScriptLoaded(true);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, []);

  // ═══════════════════════════════════════════════════════
  // Map render when step = "map"
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (step !== "map" || !selected || !window.google) return;
    const map = new window.google.maps.Map(document.getElementById("gmap"), {
      center: { lat: selected.lat, lng: selected.lng },
      zoom: 16,
    });
    new window.google.maps.Marker({ position: { lat: selected.lat, lng: selected.lng }, map });

    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      new window.google.maps.Geocoder().geocode({ location: { lat, lng } }, (res, status) => {
        if (status === "OK" && res[0]) {
          setSelected({ lat, lng, address: res[0].formatted_address });
          setQuery(res[0].formatted_address);
        }
      });
    });
  }, [step, selected]);

  // ═══════════════════════════════════════════════════════
  // Sync address_line_1 when selected changes
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    if (selected?.address) {
      setFormData((prev) => ({ ...prev, address_line_1: selected.address }));
    }
  }, [selected]);

  // ═══════════════════════════════════════════════════════
  // Fetch addresses
  // ═══════════════════════════════════════════════════════
  const fetchAddresses = () => {
    if (!userId) return;
    setListLoading(true);
    setListError("");
    getAddresses(userId)
      .then((res) => setAddresses(Array.isArray(res.data?.results) ? res.data.results : []))
      .catch(() => {
        setListError("Failed to load addresses.");
        setAddresses([]);
      })
      .finally(() => setListLoading(false));
  };

  useEffect(() => { fetchAddresses(); }, [userId]);

  // ═══════════════════════════════════════════════════════
  // Logout
  // ═══════════════════════════════════════════════════════
  const logout = () => {
    ["token", "userid", "name", "store_id"].forEach((k) => localStorage.removeItem(k));
    toast.success("Logged out");
    navigate("/");
  };

  // ═══════════════════════════════════════════════════════
  // Zipcode check
  // ═══════════════════════════════════════════════════════
  const checkZipcode = async () => {
    if (!zipcodeCheck || zipcodeCheck.length < 5) return;
    setCheckingZip(true);
    setZipcodeStatus(null);
    try {
      const res = await axiosInstance.get(
        `/masters/check-zipcode-availability/?sale_zipcode=${zipcodeCheck}`
      );
      setZipcodeStatus(res?.data?.sale_zipcode ?? null);
    } catch {
      setZipcodeStatus({ status: "Error" });
    } finally {
      setCheckingZip(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // Google Places autocomplete
  // ═══════════════════════════════════════════════════════
  const getSuggestions = (val) => {
    if (!window.google || val.length < 2) return setSuggestions([]);
    new window.google.maps.places.AutocompleteService().getPlacePredictions(
      { input: val, types: ["address"], componentRestrictions: { country: "in" } },
      (preds, status) => (status === "OK" ? setSuggestions(preds) : setSuggestions([]))
    );
  };

  const handleSelect = (place) => {
    setQuery(place.description);
    setSuggestions([]);
    new window.google.maps.Geocoder().geocode({ placeId: place.place_id }, (res, status) => {
      if (status === "OK" && res[0]) {
        const loc = res[0].geometry.location;
        setSelected({ lat: loc.lat(), lng: loc.lng(), address: place.description });
        setStep("map");
      }
    });
  };

  // ═══════════════════════════════════════════════════════
  // Start add flow
  // ═══════════════════════════════════════════════════════
  const startAdd = () => {
    if (zipcodeStatus?.status !== "Available") {
      toast.warning("Please check zipcode availability first.");
      return;
    }
    setEditId(null);
    setSelected(null);
    setQuery("");
    setSuggestions([]);
    setFormData({ ...emptyForm, zipcode: zipcodeCheck });
    setStep("add");
  };

  // ═══════════════════════════════════════════════════════
  // Edit address
  // ═══════════════════════════════════════════════════════
  const startEdit = async (address) => {
    setEditId(address.id);
    setFormData({
      name: address.name || "",
      address_line_1: address.address_line_1 || "",
      address_line_2: address.address_line_2 || "",
      flat_no: address.flat_no || "",
      landmark: address.landmark || "",
      zipcode: address.zipcode || "",
      mobileno: address.mobileno || "",
      country: address.country || "India",
      state: address.state || "",
      city: address.city || "",
      latitude: address.latitude || "",
      longitude: address.longitude || "",
    });
    setSelected({
      lat: address.latitude,
      lng: address.longitude,
      address: address.address_line_1,
    });
    setQuery(address.address_line_1 || "");
    setStep("address");
  };

  // Delete address
  const deleteAddress = async (id) => {
    try {
      await axiosInstance.delete(`/accounts/address/${id}/`);
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address.");
    }
  };
  // ═══════════════════════════════════════════════════════
  // Submit form
  // ═══════════════════════════════════════════════════════
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...formData,
      latitude: selected?.lat || formData.latitude,
      longitude: selected?.lng || formData.longitude,
      address_line_1: selected?.address || formData.address_line_1,
      user: userId,
    };

    try {
      if (editId) {
        await updateAddress(editId, payload);
        toast.success("Address updated");
      } else {
        await axiosInstance.post("/accounts/address/", payload, {
          headers: { "Content-Type": "application/json" },
        });
        toast.success("Address added");
      }
      setStep("default");
      setEditId(null);
      setSelected(null);
      setQuery("");
      setFormData({ ...emptyForm });
      fetchAddresses();
    } catch {
      toast.error("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ═══════════════════════════════════════════════════════
  // Not logged in
  // ═══════════════════════════════════════════════════════
  if (!userId) {
    return (
      <main className="account-page">
        <div className="account-wrap">
          <section className="account-empty">
            <p>Please login to manage your addresses.</p>
            <button className="account-primary-btn" type="button" onClick={() => navigate("/")}>
              Go home
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="account-page">
      <div className="account-shell">

        {/* ── sidebar ── */}
        <aside className="account-sidebar">
          <p>Account</p>
          <strong>{userName}</strong>
          <button type="button" onClick={() => navigate("/orders")}>Orders</button>
          <button className="active" type="button">Address</button>
          <button type="button" onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button type="button" onClick={logout}>Logout</button>
        </aside>

        {/* ── main content ── */}
        <section className="account-content">
          <div className="account-heading compact">
            <div>
              <span>Account</span>
              <h1>
                {step === "default" && "My Addresses"}
                {step === "add" && "Search Location"}
                {step === "map" && "Confirm Location"}
                {step === "address" && (editId ? "Edit Address" : "Add Address")}
              </h1>
            </div>
            {step !== "default" && (
              <button
                className="account-secondary-btn"
                type="button"
                onClick={() => {
                  setStep("default");
                  setEditId(null);
                  setSelected(null);
                  setQuery("");
                  setFormData({ ...emptyForm });
                }}
              >
                ← Back
              </button>
            )}
          </div>

          {/* ════════════ STEP: default ════════════ */}
          {step === "default" && (
            <>
              {/* zipcode checker */}
              <div className="zip-checker">
                <p className="zip-checker-label">Check service availability in your area</p>
                <div className="zip-row">
                  <input
                    className="zip-input"
                    type="text"
                    placeholder="Enter pincode"
                    maxLength={5}
                    value={zipcodeCheck}
                    onChange={(e) => {
                      setZipcodeCheck(e.target.value.replace(/\D/g, "").slice(0, 5));
                      setZipcodeStatus(null);
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") checkZipcode(); }}
                  />
                  <button
                    className="zip-check-btn"
                    type="button"
                    onClick={checkZipcode}
                    disabled={checkingZip || zipcodeCheck.length < 5}
                  >
                    {checkingZip ? "Checking..." : "Check"}
                  </button>
                </div>
                {zipcodeStatus && (
                  <p className={`zip-result ${zipcodeStatus.status === "Available" ? "zip-ok" : "zip-fail"}`}>
                    {zipcodeStatus.status === "Available"
                      ? `✓ Service available at ${zipcodeCheck}`
                      : "✗ Service not available in this area"}
                  </p>
                )}
              </div>

              {/* add button — only enabled if zip is available */}
              <button
                className="account-primary-btn"
                type="button"
                onClick={startAdd}
                style={{ marginBottom: 24 }}
              >
                + Add new address
              </button>

              {/* address list */}
              {listLoading && <div className="account-empty">Loading addresses...</div>}
              {listError && <div className="account-alert">{listError}</div>}
              {!listLoading && (
                <div className="account-grid">
                  {addresses.length > 0 ? (
                    addresses.map((addr) => (
                      <article className="account-card address-card" key={addr.id}>
                        <div>
                          <h2><IoLocationOutline /> {addr.name || "Address"}</h2>
                          <p>
                            {[addr.flat_no, addr.address_line_1, addr.address_line_2, addr.landmark]
                              .filter(Boolean).join(", ")}
                          </p>
                          <p>
                            {[addr.city, addr.state, addr.country].filter(Boolean).join(", ")}
                            {addr.zipcode ? ` - ${addr.zipcode}` : ""}
                          </p>
                          <small>Contact: {addr.mobileno || "N/A"}</small>
                        </div>

                        <div className="account-card-actions">  
                          <button
                            className="account-icon-btn"
                            type="button"
                            onClick={() => startEdit(addr)}
                            aria-label="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="account-icon-btn account-icon-btn-danger"
                            type="button"
                            onClick={() => deleteAddress(addr.id)}
                            aria-label="Delete"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="account-empty">No addresses found.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ════════════ STEP: add (search) ════════════ */}
          {step === "add" && (
            <div className="addr-search-wrap">
              <p className="addr-search-hint">Search your location to place it on the map</p>
              <div className="addr-search-box">
                <FiSearch className="addr-search-icon" />
                <input
                  ref={searchRef}
                  className="addr-search-input"
                  value={query}
                  placeholder="Search address, area, city..."
                  onChange={(e) => { setQuery(e.target.value); getSuggestions(e.target.value); }}
                  autoFocus
                />
                {suggestions.length > 0 && (
                  <div className="addr-suggestions">
                    {suggestions.map((s) => (
                      <div
                        key={s.place_id}
                        className="addr-suggestion-item"
                        onClick={() => handleSelect(s)}
                      >
                        <IoLocationOutline className="addr-sugg-icon" />
                        <span>{s.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════ STEP: map (confirm) ════════════ */}
          {step === "map" && selected && (
            <div className="addr-map-wrap">
              <div className="addr-map-selected">
                <IoLocationOutline />
                <span>{selected.address}</span>
              </div>
              <div id="gmap" className="addr-map-frame" />
              <div className="addr-map-actions">
                <button
                  className="account-secondary-btn"
                  type="button"
                  onClick={() => { setQuery(""); setSuggestions([]); setStep("add"); }}
                >
                  Change
                </button>
                <button
                  className="account-primary-btn"
                  type="button"
                  onClick={() => { setQuery(""); setSuggestions([]); setStep("address"); }}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          )}

          {/* ════════════ STEP: address form ════════════ */}
          {step === "address" && (
            <form className="account-card addr-form" onSubmit={handleSubmit}>

              {/* selected location preview */}
              {selected?.address && (
                <div className="addr-location-preview">
                  <div className="addr-location-text">
                    <IoLocationOutline />
                    <span>{selected.address}</span>
                  </div>
                  <button
                    type="button"
                    className="addr-change-link"
                    onClick={() => { setQuery(""); setStep("add"); }}
                  >
                    Change
                  </button>
                </div>
              )}

              <div className="address-form-grid">
                <label>
                  Full Name *
                  <input value={formData.name} required
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </label>
                <label>
                  Mobile *
                  <input value={formData.mobileno} maxLength={10} required
                    onChange={(e) => setFormData({ ...formData, mobileno: e.target.value.replace(/\D/g, "").slice(0, 10) })} />
                </label>
                <label className="full">
                  Address line 1 *
                  <input value={formData.address_line_1} required
                    onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })} />
                </label>
                <label className="full">
                  Address line 2
                  <input value={formData.address_line_2}
                    onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })} />
                </label>
                <label>
                  Flat / House no
                  <input value={formData.flat_no}
                    onChange={(e) => setFormData({ ...formData, flat_no: e.target.value })} />
                </label>
                <label>
                  Landmark
                  <input value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} />
                </label>
                <label>
                  City *
                  <input value={formData.city} required
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </label>
                <label>
                  State *
                  <select value={formData.state} required
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}>
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label>
                  Country *
                  <input value={formData.country} required
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                </label>
                <label>
                  Zipcode *
                  <input value={formData.zipcode} maxLength={5} required
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value.replace(/\D/g, "").slice(0, 6) })} />
                </label>
              </div>

              <div className="address-form-actions">
                <button
                  type="button"
                  className="account-secondary-btn"
                  onClick={() => { setStep("default"); setEditId(null); setFormData({ ...emptyForm }); }}
                >
                  Cancel
                </button>
                <button type="submit" className="account-primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editId ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          )}

        </section>
      </div>
    </main>
  );
}

export default AddressesPage;