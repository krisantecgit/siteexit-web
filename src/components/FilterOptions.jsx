// import React, { useEffect } from "react";
// import "./filteroptions.css";
// import { IoClose } from "react-icons/io5";

// function FilterOptions({
//     show,
//     onClose,
//     filterData = [],
//     variantOptions = [],
//     selectedVariantId,
//     selectedOptions,
//     onVariantClick,
//     onOptionSelect,
//     onClearAll,
//     onApplyFilters
// }) {
//     const handleVariantClick = (variant) => onVariantClick(variant.id);

//     const handleOptionChange = (variantId, option) => {
//         const isChecked =
//             !selectedOptions[variantId]?.some((opt) => opt.id === option.id);
//         onOptionSelect(variantId, option.id, option.name, isChecked);
//     };
//     useEffect(() => {
//         if (show && filterData.length > 0 && !selectedVariantId) {
//             onVariantClick(filterData[0].id);
//         }
//     }, [show, filterData, selectedVariantId, onVariantClick]);
//     return (
//         <>
//             {show && <div className="filter-backdrop" onClick={onClose}></div>}

//             <div className={`filter-canvas ${show ? "open" : ""}`}>
//                 <div className="filter-header">
//                     <h3>Filter by</h3>
//                     <IoClose onClick={onClose} className="close-icon" />
//                 </div>

//                 <div className="filter-body">
//                     <div className="filter-columns">
//                         <div className="variants-section">
//                             <div className="variants-list">
//                                 {filterData.map((variant) => (
//                                     <div
//                                         key={variant.id}
//                                         className={`variant-item ${selectedVariantId === variant.id ? "active" : ""
//                                             }`}
//                                         onClick={() => handleVariantClick(variant)}
//                                     >
//                                         {variant.name}
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         <div className="options-section">
//                             {selectedVariantId && variantOptions.length > 0 ? (
//                                 <>
//                                     {/* <h4 className="section-title">
//                                         {filterData.find((v) => v.id === selectedVariantId)?.name}
//                                     </h4> */}
//                                     <div className="options-list">
//                                         {variantOptions.map((option) => (
//                                             <label key={option.id} className="option-item">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={
//                                                         selectedOptions[selectedVariantId]?.some(
//                                                             (opt) => opt.id === option.id
//                                                         ) || false
//                                                     }
//                                                     onChange={() =>
//                                                         handleOptionChange(selectedVariantId, option)
//                                                     }
//                                                 />
//                                                 <span className="checkmark"></span>
//                                                 {option.name}
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </>
//                             ) : (
//                                 <p className="no-options-text">Select a variant to view options</p>
//                             )}
//                         </div>
//                     </div>
//                 </div>

//                 <div className="filter-footer">
//                     <button className="clear-all-btn" onClick={onClearAll}>
//                         Clear All
//                     </button>
//                     <button className="show-results-btn" onClick={onApplyFilters}>
//                         SHOW RESULTS
//                     </button>
//                 </div>
//             </div>
//         </>
//     );
// }

// export default FilterOptions;
import React, { useEffect } from "react";
import { Offcanvas } from "react-bootstrap";
import { IoClose } from "react-icons/io5";
import "./filteroptions.css";

function FilterOptions({
  show,
  onClose,
  filterData = [],
  variantOptions = [],
  selectedVariantId,
  selectedOptions,
  onVariantClick,
  onOptionSelect,
  onClearAll,
  onApplyFilters,
}) {
  const handleVariantClick = (variant) => onVariantClick(variant.id);

  const handleOptionChange = (variantId, option) => {
    const isChecked =
      !selectedOptions[variantId]?.some((opt) => opt.id === option.id);
    onOptionSelect(variantId, option.id, option.name, isChecked);
  };

  useEffect(() => {
    if (show && filterData.length > 0 && !selectedVariantId) {
      onVariantClick(filterData[0].id);
    }
  }, [show, filterData, selectedVariantId, onVariantClick]);

  return (
    <Offcanvas show={show} onHide={onClose} placement="end" className="filter-offcanvas">
      <Offcanvas.Header>
        <Offcanvas.Title>Filter by</Offcanvas.Title>
        <IoClose onClick={onClose} className="close-icon" />
      </Offcanvas.Header>

      <Offcanvas.Body>
        <div className="filter-body">
          <div className="filter-columns">
            <div className="variants-section">
              <div className="variants-list">
                {filterData.map((variant) => (
                  <div
                    key={variant.id}
                    className={`variant-item ${selectedVariantId === variant.id ? "active" : ""}`}
                    onClick={() => handleVariantClick(variant)}
                  >
                    {variant.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="options-section">
              {selectedVariantId && variantOptions.length > 0 ? (
                <div className="options-list">
                  {variantOptions.map((option) => (
                    <label key={option.id} className="option-item">
                      <input
                        type="checkbox"
                        checked={
                          selectedOptions[selectedVariantId]?.some(
                            (opt) => opt.id === option.id
                          ) || false
                        }
                        onChange={() => handleOptionChange(selectedVariantId, option)}
                      />
                      <span className="checkmark"></span>
                      {option.name}
                    </label>
                  ))}
                </div>
              ) : (
                <p className="no-options-text">Select a variant to view options</p>
              )}
            </div>
          </div>
        </div>
      </Offcanvas.Body>

      <div className="filter-footer">
        <button className="clear-all-btn" onClick={onClearAll}>
          Clear All
        </button>
        <button className="show-results-btn" onClick={onApplyFilters}>
          SHOW RESULTS
        </button>
      </div>
    </Offcanvas>
  );
}

export default FilterOptions;
