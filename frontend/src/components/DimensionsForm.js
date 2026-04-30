const DimensionsForm = ({
  width,
  setWidth,
  widthFraction,
  setWidthFraction,
  height,
  setHeight,
  heightFraction,
  setHeightFraction,
  validationErrors,
  setValidationErrors,
  fractions,
}) => {
  return (
    <>
      <div className="standard-dimension-container">
        <label className="form-label">Enter Width:</label>

        <div className="dimension-input-wrapper">
          <input
            type="number"
            className={`width-input ${validationErrors.width ? "error-border" : ""}`}
            value={width || ""}
            onChange={(e) => {
              setWidth(e.target.value);
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                width: e.target.value ? "" : "Width is required.",
              }));
            }}
            placeholder="Width (inches)"
          />

          <select
            value={widthFraction || ""}
            onChange={(e) => setWidthFraction(e.target.value)}
            className="dimension-fraction"
          >
            <option value="">--</option>
            {fractions.map((fraction) => (
              <option key={fraction} value={fraction}>
                {fraction}
              </option>
            ))}
          </select>
        </div>

        {validationErrors.width && (
          <p className="error-text">{validationErrors.width}</p>
        )}
      </div>

      <div className="standard-dimension-container">
        <label className="form-label">Enter Height:</label>

        <div className="dimension-input-wrapper">
          <input
            type="number"
            className={`height-input ${validationErrors.height ? "error-border" : ""}`}
            value={height || ""}
            onChange={(e) => {
              setHeight(e.target.value);
              setValidationErrors((prevErrors) => ({
                ...prevErrors,
                height: e.target.value ? "" : "Height is required.",
              }));
            }}
            placeholder="Height (inches)"
          />

          <select
            value={heightFraction || ""}
            onChange={(e) => setHeightFraction(e.target.value)}
            className="dimension-fraction"
          >
            <option value="">--</option>
            {fractions.map((fraction) => (
              <option key={fraction} value={fraction}>
                {fraction}
              </option>
            ))}
          </select>
        </div>

        {validationErrors.height && (
          <p className="error-text">{validationErrors.height}</p>
        )}
      </div>
    </>
  );
};

export default DimensionsForm;