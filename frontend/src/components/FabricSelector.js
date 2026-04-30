const FabricSelector = ({
  selectedCategory,
  fabricCollectionOptions,
  selectedFabricOption,
  setSelectedFabricOption,
  fabricColorOptions,
  selectedFabricColorOption,
  setSelectedFabricColorOption,
  validationErrors,
  setValidationErrors,
  handleMouseEnter,
  setHoveredInfo,
}) => {
  return (
    <>
      {fabricCollectionOptions.length > 0 && (
        <div className="dropdown-container">
          <label htmlFor="fabric-option" className="form-label">
            {["Blinds", "Shutters"].includes(selectedCategory)
              ? "Select Color:"
              : "Select Fabric:"}
          </label>

          <div className="dropdown-with-info">
            <select
              data-testid="color-select"
              className={`form-select ${validationErrors.selectedFabricOption ? "error" : ""}`}
              value={selectedFabricOption}
              onChange={(e) => {
                setSelectedFabricOption(e.target.value);
                setValidationErrors((prevErrors) => ({
                  ...prevErrors,
                  selectedFabricOption: e.target.value
                    ? null
                    : ["Blinds", "Shutters"].includes(selectedCategory)
                    ? "Color selection is required."
                    : "Fabric selection is required.",
                }));
              }}
            >
              <option value="">
                {["Blinds", "Shutters"].includes(selectedCategory)
                  ? "Select Color"
                  : "Select Fabric"}
              </option>

              {fabricCollectionOptions
                .sort((a, b) => a.localeCompare(b))
                .map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
            </select>

            <div
              className="info-button"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  "See your samples for available colors and fabric options."
                )
              }
              onMouseLeave={() => setHoveredInfo(null)}
            >
              ?
            </div>
          </div>

          {validationErrors.selectedFabricOption && (
            <p className="error-text">{validationErrors.selectedFabricOption}</p>
          )}
        </div>
      )}

      {fabricColorOptions.length > 0 && (
        <div className="dropdown-container">
          <label className="form-label">Select Fabric Color:</label>

          <div className="dropdown-with-info">
            <select
              className={`form-select ${validationErrors.selectedFabricColorOption ? "error" : ""}`}
              value={selectedFabricColorOption || ""}
              onChange={(e) => {
                setSelectedFabricColorOption(e.target.value);
                setValidationErrors((prevErrors) => ({
                  ...prevErrors,
                  selectedFabricColorOption: e.target.value
                    ? null
                    : "Fabric color is required.",
                }));
              }}
            >
              <option value="">Select Color</option>

              {fabricColorOptions
                .sort((a, b) => a.localeCompare(b))
                .map((color, index) => (
                  <option key={index} value={color}>
                    {color}
                  </option>
                ))}
            </select>

            <div
              className="info-button"
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  "See your samples for available colors and fabric options."
                )
              }
              onMouseLeave={() => setHoveredInfo(null)}
            >
              ?
            </div>
          </div>

          {validationErrors.selectedFabricColorOption && (
            <p className="error-text">
              {validationErrors.selectedFabricColorOption}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default FabricSelector;