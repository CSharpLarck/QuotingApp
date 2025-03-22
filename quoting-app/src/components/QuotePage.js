import React from "react";
import "./QuotePage.css";

const QuotePage = () => {
  return (
    <div className="add-new-quote-container">
      <main className="main-content">
        <div className="quote-form">
          <div className="form-header">
            <label>
              Customer Name:
              <input type="text" placeholder="Enter customer name" />
            </label>
            <label>
              Sidemark:
              <input type="text" placeholder="Enter sidemark" />
            </label>
          </div>
          <div className="form-body">
            <h3>Product Selection</h3>
            <select>
              <option>Select Product</option>
            </select>
            <select>
              <option>Select Fabric/Color</option>
            </select>
            <select>
              <option>Select Control Option</option>
            </select>
            <select>
              <option>Select Style Option</option>
            </select>
            <input type="number" placeholder="Input Width (in inches)" />
            <input type="number" placeholder="Input Height (in inches)" />
            <select>
              <option>Product Specific Add-Ons</option>
            </select>
            <select>
              <option>Product Specific Add-Ons</option>
            </select>
            <select>
              <option>Product Specific Add-Ons</option>
            </select>
          </div>
          <div className="price-display">
            <h3>Price per SF</h3>
            <p>(Show Price and update after every edit in the product selection inputs)</p>
          </div>
          <div className="quote-actions">
            <h3>Display Details Below:</h3>
            <p>Base Title & Price</p>
            <p>Additional Title & Price</p>
            <p>Additional Title & Price</p>
            <button>Add Item to Quote</button>
            <button>Go to Quote</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuotePage;
