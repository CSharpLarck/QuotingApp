const CustomerInfoForm = ({
  customerName,
  setCustomerName,
  sidemark,
  setSidemark,
  address,
  setAddress,
  phoneNumber,
  setPhoneNumber,
  validationErrors,
  setValidationErrors,
}) => {
  return (
    <div className="customer-column-container">
      <h3>Customer Information</h3>

      <div className="customer-column-form">
        <label className="customer-column-label">
          Customer Name:
          <input
            type="text"
            data-testid="customer-name-input"
            placeholder="Enter customer name"
            className={`customer-column-input ${validationErrors.customerName ? "error-border" : ""}`}
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              setValidationErrors((prev) => ({
                ...prev,
                customerName: e.target.value.trim() ? "" : "Customer name is required.",
              }));
            }}
          />
          {validationErrors.customerName && (
            <p className="error-text">{validationErrors.customerName}</p>
          )}
        </label>

        <label className="customer-column-label">
          Sidemark:
          <input
            type="text"
            data-testid="sidemark-input"
            placeholder="Enter sidemark"
            className={`customer-column-input ${validationErrors.sidemark ? "error-border" : ""}`}
            value={sidemark}
            onChange={(e) => {
              setSidemark(e.target.value);
              setValidationErrors((prev) => ({
                ...prev,
                sidemark: e.target.value.trim() ? "" : "Sidemark is required.",
              }));
            }}
          />
          {validationErrors.sidemark && (
            <p className="error-text">{validationErrors.sidemark}</p>
          )}
        </label>

        <label className="customer-column-label">
          Address:
          <input
            type="text"
            data-testid="customer-address-input"
            placeholder="Enter address"
            className={`customer-column-input ${validationErrors.address ? "error-border" : ""}`}
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              setValidationErrors((prev) => ({
                ...prev,
                address: e.target.value.trim() ? "" : "Address is required.",
              }));
            }}
          />
          {validationErrors.address && (
            <p className="error-text">{validationErrors.address}</p>
          )}
        </label>

        <label className="customer-column-label">
          Phone Number:
          <input
            type="text"
            data-testid="customer-phone-number-input"
            placeholder="Enter phone number"
            className={`customer-column-input ${validationErrors.phoneNumber ? "error-border" : ""}`}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setValidationErrors((prev) => ({
                ...prev,
                phoneNumber: e.target.value.trim() ? "" : "Phone Number is required.",
              }));
            }}
          />
          {validationErrors.phoneNumber && (
            <p className="error-text">{validationErrors.phoneNumber}</p>
          )}
        </label>
      </div>
    </div>
  );
};

export default CustomerInfoForm;