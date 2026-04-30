const ProductSelector = ({
  categories,
  products,
  selectedCategory,
  selectedProduct,
  validationErrors,
  handleCategoryChange,
  handleProductChange,
  formatProductName,
}) => {
  return (
    <>
      <label className="form-label">
        Select Category:
        <select
          data-testid="category-select"
          className={`form-select ${validationErrors.selectedCategory ? "error" : ""}`}
          value={selectedCategory}
          onChange={handleCategoryChange}
        >
          <option value="">Select Category</option>

          {categories.length > 0 ? (
            categories.sort().map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))
          ) : (
            <option disabled>No categories available</option>
          )}
        </select>
      </label>

      <label className="form-label">
        Select Product:
        <select
          data-testid="product-select"
          className={`form-select ${validationErrors.selectedProduct ? "error" : ""}`}
          value={selectedProduct}
          onChange={handleProductChange}
          disabled={products.length === 0}
        >
          <option value="">Select Product</option>

          {products.length > 0 ? (
            products
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((product) => (
                <option key={product.id || product.name} value={product.name}>
                  {formatProductName(product.name)}
                </option>
              ))
          ) : (
            <option disabled>No products available</option>
          )}
        </select>

        {validationErrors.selectedProduct && (
          <p className="error-text">{validationErrors.selectedProduct}</p>
        )}
      </label>
    </>
  );
};

export default ProductSelector;