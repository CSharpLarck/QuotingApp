import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, doc, getDoc, setDoc } from "../firebase";
import "./QuotePage.css"; // Ensure CSS is imported

const QuotePage = () => {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [customerName, setCustomerName] = useState("");
const [poNumber, setPoNumber] = useState("");
const [sidemark, setSidemark] = useState("");
const [address, setAddress] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
const [showAlert, setShowAlert] = useState(false);



  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const quoteRef = doc(db, "quotes", quoteId);
        const quoteSnap = await getDoc(quoteRef);
    
        if (quoteSnap.exists()) {
          const quoteData = quoteSnap.data();
          
          // ✅ Ensure motorizationOptions exist in all items
          quoteData.items = quoteData.items.map(item => ({
            ...item,
            motorizationOptions: item.motorizationOptions || [],
          }));
    
          console.log("🔍 Retrieved Quote Data:", quoteData); // ✅ Debugging log
    
          setQuote(quoteData);
        } else {
          console.error("❌ Quote not found");
        }
      } catch (error) {
        console.error("❌ Error fetching quote:", error);
      }
    };
    
    fetchQuote();
  }, [quoteId]);

  if (!quote) return <p>Loading...</p>;

  const quoteItems = quote.items || [];
  const totalQuotePrice = quoteItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
  const totalUnits = quoteItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  // 🗑️ Handle Deleting an Item
  const handleDeleteItem = async (index) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    const updatedItems = quoteItems.filter((_, i) => i !== index);
    const updatedQuote = { ...quote, items: updatedItems };

    try {
      await setDoc(doc(db, "quotes", quoteId), updatedQuote);
      setQuote(updatedQuote); // ✅ Update UI immediately
      console.log("✅ Item deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting item:", error);
    }
  };

  const handleAddMoreItems = async () => {
    console.log("📌 handleAddMoreItems triggered"); // Debugging log
  
    if (!currentQuoteId) {
      console.warn("⚠️ No currentQuoteId found!");
      return;
    }
  
    try {
      const quoteRef = doc(db, "quotes", currentQuoteId);
      const quoteSnap = await getDoc(quoteRef);
  
      if (quoteSnap.exists()) {
        const data = quoteSnap.data();
  
        console.log("✅ Quote found:", data); // Debugging log
  
        // ✅ Preserve customer info from Firestore
        setCustomerName(data.customerName || "");
        setPoNumber(data.poNumber || "");
        setSidemark(data.sidemark || "");
        setAddress(data.address || "");
        setPhoneNumber(data.phoneNumber || "");
  
        setShowAlert(false); // ✅ Close the alert
        console.log("📌 Navigating to:", `/quotingpage/${currentQuoteId}`); // Debugging log
  
        navigate(`/quotingpage/${currentQuoteId}`); // ✅ Pass quote ID in URL
      } else {
        console.warn("⚠️ No quote found for this ID!");
      }
    } catch (error) {
      console.error("❌ Error fetching customer info:", error);
    }
  };

  const getControlOptions = (item) => {
    console.log("🛠 Rendering Control Options for:", item.product, "-> Control:", item.controlOptions);
    console.log("🔍 Item Data:", item); // Log full item object
  
    let controlOptions = [];
  
    // ✅ Force "Cordless" if the product name contains "Blinds"
    if (item.product?.toLowerCase().includes("blinds")) {
      controlOptions.push("Cordless");
    } else {
      // ✅ Add control option (if it exists and is NOT Cordless)
      if (item.controlOptions && item.controlOptions !== "N/A" && item.controlOptions !== "Cordless") {
        controlOptions.push(item.controlOptions);
      }
  
      // ✅ Show Control Position only if "Continuous Loop" or "Loop Control" is selected
      if (item.controlPosition && ["Continuous Loop", "Loop Control"].includes(item.controlOptions)) {
        controlOptions.push(`Control Position: ${item.controlPosition}`);
      }
  
      // ✅ Handle Manual Crank options
      if (item.controlOptions === "Manual Crank" && item.handleOptions) {
        controlOptions.push(`Handle: ${item.handleOptions}`);
      }
  
      // ✅ Handle Motorized options
      if (item.controlOptions === "Motorized") {
        if (Array.isArray(item.motorizationOptions) && item.motorizationOptions.length > 0) {
          console.log("✅ Motorization Options Found:", item.motorizationOptions); // Debugging log
  
          // ✅ Render each motorization option on a new line
          controlOptions.push(
            ...item.motorizationOptions.map((option, index) => (
              <div key={`motorization-${index}`} className="sub-text">{option}</div>
            ))
          );
        } else {
          console.warn("🚨 No Motorization Options found for Motorized shade!");
        }
      }
    }
  
    return controlOptions.length > 0
      ? controlOptions.map((option, index) => <div key={index} className="sub-text">{option}</div>)
      : <div className="sub-text">N/A</div>;
  };
  
  
  
  
  
  

  return (
    <div className="quote-details-container">
      {/* 🔙 Back to Dashboard Button */}
      <button className="back-to-orders-btn" onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>

      {/* 🏠 Customer Information */}
      <div className="customer-info">
        <h2>Quote Details</h2>
        <p><strong>Customer Name:</strong> {quote.customerName}</p>
        <p><strong>P.O. Number:</strong> {quote.poNumber}</p>
        <p><strong>Sidemark:</strong> {quote.sidemark}</p>
        <p><strong>Address:</strong> {quote.address}</p>
        <p><strong>Phone Number:</strong> {quote.phoneNumber}</p>
      </div>

      {/* 📄 Quote Items Table */}
      <div className="table-container">
        <table className="quote-table">
          <thead>
            <tr>
              <th>Line</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Product</th>
              <th>Location</th>
              <th>Width</th>
              <th>Height</th>
              <th>Control Option</th>
              <th>Additional Options</th>
              <th></th> {/* Delete button column */}
            </tr>
          </thead>
          <tbody>
            {quoteItems.map((item, index) => (
              <tr key={index}>
                <td>{(index + 1).toFixed(1)}</td> {/* Line numbers: 1.0, 2.0, etc. */}
                <td>{item.quantity}</td>
                <td>${Math.round(item.totalPrice)}</td>

                {/* 🏠 Product Details */}
                <td>
                  <strong>{formatProductName(item.product)}</strong>
                  {item.fabricOption && item.fabricOption !== "N/A" && <span className="sub-text">{item.fabricOption}</span>}
                  {item.fabricColor && item.fabricColor !== "N/A" && <span className="sub-text">{item.fabricColor}</span>}
                  {item.shadeStyles && item.shadeStyles !== "N/A" && <span className="sub-text">{item.shadeStyles}</span>}
                  {item.pleatStyles && item.pleatStyles !== "N/A" && <span className="sub-text">{item.pleatStyles}</span>}
                </td>

                {/* 📍 Location */}
                <td className="table-cell">{item.windowLocation || "N/A"}</td>

                {/* 📏 Dimensions */}
                <td className="table-cell">{`${item.width}" ${item.widthFraction || ""}`}</td>
                <td className="table-cell">{`${item.height}" ${item.heightFraction || ""}`}</td>

                {/* 🎮 Control Options */}
                <td className="table-cell">
                  {getControlOptions(item)}
                </td>

                {/* 🔧 Additional Options */}
                <td className="table-cell">
                  {getAdditionalOptions(item)}
                </td>

                {/* 🗑️ Delete Button */}
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteItem(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

  {/* 📊 Total Price & Units Summary */}
<div className="total-summary-wrapper">
  <div className="total-summary-left">
    <h3><strong>Total Price:</strong> ${totalQuotePrice.toFixed(0)}</h3>
    <h3 className="total-units">Total Units: {totalUnits}</h3>
  </div>
</div>

<div className="add-more-items-container">
<button 
  className="add-more-items-btn"
  onClick={() => {
    if (!quoteId) {
      console.warn("⚠️ No quoteId found!");
      return;
    }
    navigate(`/quotingpage/${quoteId}`); // ✅ Pass the quoteId directly
  }}
>
  Add More Items
</button>



</div>



    </div>
  );
};

export default QuotePage;

/// 🛠️ Utility Functions

const formatProductName = (product) => {
  if (product === "2.5 Faux Wood Blinds") return '2.5" Faux Wood Blinds';
  if (product === "2 Faux Wood Blinds") return '2" Faux Wood Blinds';
  return product;
};

// 🔧 Additional Options Formatting
const getAdditionalOptions = (item) => {
  const options = [
    item.mountingPosition && item.mountingPosition !== "N/A" ? item.mountingPosition : null,
    item.tiltOptions && item.tiltOptions !== "N/A" ? `${item.tiltOptions}` : null,
    item.hingeColor && item.hingeColor !== "N/A" ? `${item.hingeColor}` : null, // ✅ Added Hinge Color
    item.linerOptions && item.linerOptions !== "N/A"
      ? `${item.linerOptions}${item.linerColor && item.linerColor !== "N/A" ? ` (${item.linerColor})` : ""}`
      : null,
      item.headboxOptions && item.headboxOptions !== "N/A" ? `${item.headboxOptions}` : null, // ✅ Added Headbox Options
      item.headboxOptions === "Metal Fascia" && item.fasciaColor && item.fasciaColor !== "N/A"
      ? `Fascia Color: ${item.fasciaColor}` // ✅ Add Fascia Color only if Metal Fascia is selected
      : null,
      item.hardwareOptions && item.hardwareOptions !== "N/A" ? item.hardwareOptions : null,
    item.hardwareColor && item.hardwareColor !== "N/A" ? item.hardwareColor : null,
 // ✅ Ensure Finial Options are displayed if applicable
 item.finialOptions && item.finialOptions !== "N/A" ? `Finial: ${item.finialOptions}` : null,
        // ✅ Add Decorative Tape Type and Color
        item.additionalOptions === "Decorative Tape" && item.decorativeTapeType
        ? `Decorative Tape: ${item.decorativeTapeType}`
        : null,
      item.decorativeTapeColor && item.additionalOptions === "Decorative Tape"
        ? `Tape Color: ${item.decorativeTapeColor}`
        : null,
  ];

  return options.filter(Boolean).map((option, index) => (
    <div key={index} className="sub-text">{option}</div>
  ));
};

