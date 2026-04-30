const InstallationDetailsForm = ({
  mountingPosition,
  setMountingPosition,
  windowLocation,
  setWindowLocation,
  validationErrors,
  setValidationErrors,
}) => {
  return (
    <>
      <div className="mounting-position-container">
        <label className="form-label">Mounting Position:</label>

        <select
          data-testid="mounting-position-select"
          className={`form-select ${
            validationErrors["Mounting Position"] ? "error" : ""
          }`}
          value={mountingPosition || ""}
          onChange={(e) => {
            setMountingPosition(e.target.value);

            if (e.target.value) {
              setValidationErrors((prev) => ({
                ...prev,
                "Mounting Position": "",
              }));
            }
          }}
        >
          <option value="">Select Mounting Position</option>
          <option value="Inside Mount">Inside Mount</option>
          <option value="Outside Mount">Outside Mount</option>
        </select>

        {validationErrors["Mounting Position"] && (
          <p className="error-text">
            {validationErrors["Mounting Position"]}
          </p>
        )}
      </div>

      <div className="window-location-container">
        <label className="form-label">Window Location:</label>

        <input
          type="text"
          data-testid="window-location-input"
          className={`form-input ${
            validationErrors["Window Location"] ? "error-border" : ""
          }`}
          value={windowLocation || ""}
          onChange={(e) => {
            setWindowLocation(e.target.value);

            if (e.target.value.trim()) {
              setValidationErrors((prev) => ({
                ...prev,
                "Window Location": "",
              }));
            }
          }}
        />

        {validationErrors["Window Location"] && (
          <p className="error-text">
            {validationErrors["Window Location"]}
          </p>
        )}
      </div>
    </>
  );
};

export default InstallationDetailsForm;