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
        </label>

        <label className="customer-column-label">
          Sidemark:
          <input
            type="text"
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
        </label>

        <label className="customer-column-label">
          Address:
          <input
            type="text"
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
        </label>

        <label className="customer-column-label">
          Phone Number:
          <input
            type="text"
            placeholder="Enter phone number"
            className={`customer-column-input ${validationErrors.phoneNumber ? "error-border" : ""}`}
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setValidationErrors((prev) => ({
                ...prev,
                phoneNumber: e.target.value.trim() ? "" : "Phone number is required.",
              }));
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default CustomerInfoForm;