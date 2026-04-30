const PricingSummary = ({
  totalPrice,
  selectedOptions,
  optionsData,
  sizeBasedPricing,
  sizeBasedPricingData,
  width,
  height,
  costFactor,
  selectedProduct,
  quantity,
  handleQuantityChange,
  isEditMode,
  handleUpdateItem,
  handleSaveItem,
  hasAddedItem,
  currentQuoteId,
  navigate,
}) => {
  return (
    <div className="price-column">
      <div className="right-column-content">
        <div className="total-price">
          <h2 data-testid="total-price">Total Price: ${Math.round(totalPrice)}</h2>
        </div>

        {Object.entries(selectedOptions).some(([key, value]) =>
          key !== "Motorization Options" &&
          value &&
          value !== "None" &&
          (optionsData[key]?.includes(value) || sizeBasedPricing[value])
        ) && (
          <div className="selected-options-pricing">
            <h3>Selected Options:</h3>

            {Object.entries(selectedOptions)
              .filter(([key, value]) =>
                key !== "Motorization Options" &&
                value &&
                value !== "None" &&
                (optionsData[key]?.includes(value) || sizeBasedPricing[value])
              )
              .map(([categoryKey, value]) => {
                const roundedWidth = Math.ceil(width / 12) * 12 || 0;
                const roundedHeight = Math.ceil(height / 12) * 12 || 0;
                const dimensionKey = `${roundedWidth}x${roundedHeight}`;

                let optionPrice = 0;

                if (
                  typeof sizeBasedPricingData[value] === "object" &&
                  sizeBasedPricingData[value][dimensionKey] !== undefined
                ) {
                  optionPrice = sizeBasedPricingData[value][dimensionKey];
                }

                if (optionPrice === 0 && typeof sizeBasedPricing[value] === "number") {
                  optionPrice = sizeBasedPricing[value];
                }

                return (
                  <div key={categoryKey} className="option-price-item">
                    <span className="option-name">{value}</span>

                    {optionPrice > 0 && (
                      <span className="option-price">
                        ${Math.round(optionPrice * costFactor).toFixed(0)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        <div className="quantity-container">
          <label className="quantity-label">
            Quantity:
            <input
              type="number"
              value={selectedProduct ? quantity : 1}
              onChange={handleQuantityChange}
              min="1"
              className="quantity-input"
            />
          </label>
        </div>

        <div className="quote-actions">
          {isEditMode ? (
            <button className="add-to-quote-btn" onClick={handleUpdateItem}>
              Update Item
            </button>
          ) : (
            <button className="add-to-quote-btn" onClick={handleSaveItem}>
              Add Item(s) to Quote
            </button>
          )}

          {(hasAddedItem || localStorage.getItem("hasAddedItem") === "true") &&
            currentQuoteId && (
              <button
                className="add-to-quote-btn"
                onClick={() => navigate(`/quote/${currentQuoteId}`)}
              >
                Go to Quote
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default PricingSummary;