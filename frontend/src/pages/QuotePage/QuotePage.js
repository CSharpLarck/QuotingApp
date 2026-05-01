import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from "../../firebase";
import CustomAlert from "../../components/CustomAlert/CustomAlert"; // ✅ Import Custom Alert
import  ConfirmModal from "../../components/ConfirmModal/ConfirmModal";


import "./QuotePage.css"; // Ensure CSS is imported

const QuotePage = () => {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);

  

  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const [shippingCost, setShippingCost] = useState(0); // ✅ New state for shipping cost

  const [totalSuggestedRetail, setTotalSuggestedRetail] = useState(0);
  const memoizedQuoteItems = useMemo(() => quote?.items || [], [quote]);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);
  const [, setUserName] = useState("");

  
  const [grossProfitMargin, setGrossProfitMargin] = useState(0.1); // Default 10%
  const isQuoteSubmitted = quote?.status === "Submitted";
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  
  const totalQuotePrice = quote?.items?.reduce((acc, item) => acc + (item.totalPrice || 0), 0) || 0;
  const totalUnits = memoizedQuoteItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  const [loading, setLoading] = useState(true); // ✅ New Loading State
  const [showSaveAlert, setShowSaveAlert] = useState(false);



  const navigate = useNavigate();

  
  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
  
      try {
        const quoteRef = doc(db, "quotes", quoteId);
        const quoteSnap = await getDoc(quoteRef);
  
        if (quoteSnap.exists()) {
          const quoteData = quoteSnap.data();
  
          // Ensure motorizationOptions is always an array
          quoteData.items = (quoteData.items || []).map((item) => ({
            ...item,
            motorizationOptions: item.motorizationOptions || [],
          }));
  
          setQuote(quoteData);
          setGrossProfitMargin(quoteData.grossProfitMargin ?? 0.25);
          setShippingCost(quoteData.shippingCost || 0);
  
          // ✅ Fetch user name from createdBy UID
          if (quoteData.createdBy) {
            const userRef = doc(db, "users", quoteData.createdBy);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const fetchedName = userSnap.data().User || "Unknown";
              setUserName(fetchedName);
            }
          }
        } else {
          console.error("Quote not found");
        }
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchQuote();
  }, [quoteId, navigate]);
  
const handleSubmitOrder = async () => {
  try {
    const quoteRef = doc(db, "quotes", quoteId);

    const existingPoNumber = quote.poNumber || "";

    await setDoc(
      quoteRef,
      {
        ...quote,
        status: "Submitted",
        poNumber: existingPoNumber,
        submittedAt: serverTimestamp(),
      },
      { merge: true }
    );

    let userName = "Unknown User";

    if (quote.createdBy) {
      const userDocRef = doc(db, "users", quote.createdBy);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        userName = userSnap.data().User || "Unknown User";
      }
    }

    await addDoc(collection(db, "notifications"), {
      type: "orderSubmitted",
      userName,
      poNumber: existingPoNumber,
      quoteId,
      shortQuoteId: quote.shortQuoteId || quoteId.slice(-4),
      timestamp: serverTimestamp(),
    });

    setQuote((prev) => ({
      ...prev,
      status: "Submitted",
      poNumber: existingPoNumber,
    }));

    setShowSubmitAlert(true);
    console.log("✅ Order submitted:", existingPoNumber);
  } catch (error) {
    console.error("❌ Error submitting order:", error);
    alert("Something went wrong while submitting the order.");
  }
};



useEffect(() => {
  const totalRetail = memoizedQuoteItems.reduce((sum, item) => {
    const adjustedRetailPrice = item.totalPrice * (1 + grossProfitMargin); // ✅ Apply Gross Profit Margin
    return sum + adjustedRetailPrice;
  }, 0);

  setTotalSuggestedRetail(totalRetail);
}, [memoizedQuoteItems, grossProfitMargin]); // ✅ Trigger Recalculation When Margin Changes




  if (!quote) return <p>Loading...</p>;

  
  const handleDeleteItem = async (index) => {
  if (!window.confirm("Are you sure you want to delete this item?")) return;

  const updatedItems = memoizedQuoteItems.filter((_, i) => i !== index);
  const updatedQuote = { ...quote, items: updatedItems };

  try {
    const quoteRef = doc(db, "quotes", quoteId);

    await setDoc(quoteRef, updatedQuote, { merge: true });
    setQuote(updatedQuote);

    console.log("✅ Item deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting item:", error);
  }
};

const handleAddMoreItems = () => {
  if (!quoteId) {
    console.warn("⚠️ No Quote ID found! Cannot add more items.");
    return;
  }

  localStorage.setItem("currentQuoteId", quoteId);
  navigate(`/new-quote/${quoteId}`);
};


const handleSaveQuote = async () => {
  if (!quoteId) return;

  try {
    const calculatedShippingCost = shippingCost / (1 - grossProfitMargin);
    const calculatedProductRetailPrice = totalQuotePrice / (1 - grossProfitMargin);
    const calculatedTotalRetailPrice =
      (totalQuotePrice + shippingCost) / (1 - grossProfitMargin);

    const quoteRef = doc(db, "quotes", quoteId);

    await setDoc(
      quoteRef,
      {
        ...quote,
        shippingCost,
        grossProfitMargin,

        customerName: quote.customerName || "",
        poNumber: quote.poNumber || "",
        sidemark: quote.sidemark || "",
        address: quote.address || "",
        phoneNumber: quote.phoneNumber || "",
        items: quote.items || [],

        totalUnits,
        totalQuotePrice,
        totalSuggestedRetail,

        totalCost: totalQuotePrice + shippingCost,
        totalRetailPrice: calculatedTotalRetailPrice.toFixed(2),

        adjustedShippingCost: calculatedShippingCost.toFixed(2),
        adjustedProductRetailPrice: calculatedProductRetailPrice.toFixed(2),
      },
      { merge: true }
    );

    console.log("✅ Quote saved successfully!");
    setShowSaveAlert(true);
  } catch (error) {
    console.error("❌ Error saving quote:", error);
    alert("Error saving quote. Please try again.");
  }
};

  
   // ✅ Show Loading Screen While Fetching Data
   if (loading) {
    return (
      <div className="quote-page">
        <h2>Loading Quote...</h2>
      </div>
    );
  }
  

  return (
    <div>
      {/* ✅ Back Button Container (Separate from Quote Details) */}
      <div className="back-button-container">
        <button className="back-to-orders-btn" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
      </div>
  
{/* ✅ Main Quote Details Container */}
<div className="quote-details-container">
  <div className="customer-info">
    <div className="info-header">
      <h2>Quote Details</h2>
    </div>

    {/* ✅ Flex container for horizontal layout */}
    <div className="customer-info-grid">
      <div><strong>Quote ID:</strong> {quote.shortQuoteId}</div>
      <div><strong>Customer Name:</strong> {quote.customerName}</div>
      <div className="editable-po-container">
      <div><strong>P.O. Number:</strong> {quote.poNumber || "Not Assigned Yet"}</div>


</div>
    </div>

    <div className="customer-info-grid">
      <div><strong>Sidemark:</strong> {quote.sidemark}</div>
      <div><strong>Address:</strong> {quote.address}</div>
      <div><strong>Phone Number:</strong> {quote.phoneNumber}</div>
    </div>
  </div>
</div>



      {/* 📄 Quote Items Table */}
      <div className="table-container">
        <table className="quote-table">
          <thead>
            <tr>
              <th>Line</th>
              <th>Quantity</th>
              <th>Cost</th>   
              <th>Product</th>
              <th>Location</th>
              <th>Width</th>
              <th>Height</th>
              <th>Additional Options</th>
              <th></th> {/* Delete button column */}
            </tr>
          </thead>
          <tbody>
          {memoizedQuoteItems.map((item, index) => (
              <tr key={index}>
                <td>{(index + 1).toFixed(1)}</td> {/* Line numbers: 1.0, 2.0, etc. */}
                <td>{item.quantity}</td>
                <td>${Math.round(item.totalPrice)}</td> {/* 🔥 Display Final Cost */}

                {/* 🏠 Product Details */}
                <td>
                  <strong>{formatProductName(item.product)}</strong>
                  {item.fabricOption && item.fabricOption !== "N/A" && <span className="sub-text">{item.fabricOption}</span>}
                  {item.fabricColor && item.fabricColor !== "N/A" && <span className="sub-text">{item.fabricColor}</span>}
                </td>

                {/* 📍 Location */}
                <td className="table-cell">{item.windowLocation || "N/A"}</td>

                {/* 📏 Dimensions */}
                <td className="table-cell">{`${item.width}" ${item.widthFraction || ""}`}</td>
                <td className="table-cell">{`${item.height}" ${item.heightFraction || ""}`}</td>


                {/* 🔧 Additional Options */}
                <td className="table-cell">
                  {getAdditionalOptions(item)}
                </td>

                {/* 🗑️ Delete Button */}
                <td>
                <button
  className="edit-btn"
  onClick={() => navigate(`/quotingpage/edit/${quoteId}/${index}`)}
  disabled={isQuoteSubmitted}
>
  {isQuoteSubmitted ? "Locked" : "Edit"}
</button>



                  <button className="delete-btn" onClick={() => handleDeleteItem(index)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="two-column-wrapper">
  {/* LEFT COLUMN: Your Cost Breakdown */}
  <div className="summary-left-column">
    <h3>Your Cost</h3>
    <div className="units-line">
      <strong>Total Units:</strong> {totalUnits}
    </div>
    <div className="shipping-cost-line">
      <strong>Shipping & Handling:</strong> ${shippingCost.toFixed(0)}
   </div>
      
    <div className="product-total-line">
      <strong>Product(s) Cost:</strong> ${totalQuotePrice.toFixed(0)}
    </div>
  
    <div className="install-total-line">
      <strong>Total Cost:</strong> $
      {(totalQuotePrice + shippingCost).toFixed(0)}
    </div>
  </div>
{/* RIGHT COLUMN: Customer Retail Breakdown */}
<div className="summary-right-column">

  {/* 🔹 Gross Profit Margin Dropdown */}
  <div className="gross-profit-margin-container">
    <label htmlFor="grossProfitMargin"><strong>Gross Profit Margin:</strong></label>
    <select
      id="grossProfitMargin"
      value={grossProfitMargin}
      onChange={(e) => setGrossProfitMargin(parseFloat(e.target.value))}
      disabled={isQuoteSubmitted} // ✅ Prevent editing if submitted
    >
      {[0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35].map((margin) => (
        <option key={margin} value={margin}>
          {`${(margin * 100).toFixed(0)}%`}
        </option>
      ))}
    </select>
  </div>


  <div className="units-line">
    <strong>Total Units:</strong> {totalUnits}
  </div>



  {/* 🔹 Apply Gross Profit Margin to Shipping Cost */}
  <div className="shipping-cost-line">
    <strong>Shipping & Handling:</strong> $
    {(shippingCost / (1 - grossProfitMargin)).toFixed(0)}
  </div>

    {/* 🔹 Apply Gross Profit Margin to Product Cost */}
    <div className="product-retail-line">
    <strong>Product(s) Price:</strong> $
    {(totalQuotePrice / (1 - grossProfitMargin)).toFixed(0)}
  </div>

  {/* 🔹 Updated Total Retail Price Including All Costs */}
  <div className="total-retail-line">
    <strong>Total Price:</strong> $
    {((totalQuotePrice + shippingCost) / (1 - grossProfitMargin)).toFixed(0)}
  </div>
</div>

{/* RIGHT COLUMN: Buttons and Checkbox */}
<div className="installation-right-column">
  <div className="installation-actions">


    {/* ✅ Add More Items Button */}
    <button className="add-more-items-btn" onClick={handleAddMoreItems}  disabled={isQuoteSubmitted}
    >
      Add More Items
    </button>

 {/* ✅ Save Quote Button */}
<button className="save-quote-btn" onClick={handleSaveQuote}  disabled={isQuoteSubmitted}
>
  Save Quote
</button>



{quote?.status !== "Submitted" && (
  <button
  className="submit-order-btn"
  onClick={() => setShowConfirmModal(true)} // ✅ just opens modal
  disabled={isQuoteSubmitted}
>
  Submit Order
</button>

)}

{showConfirmModal && (
  <ConfirmModal
    message="Have you confirmed the measurements are exact and you're ready to submit this quote for order?"
    onConfirm={() => {
      setShowConfirmModal(false);
      setIsSubmittingOrder(true); // ⬅️ prevent premature alert
      setTimeout(async () => {
        await handleSubmitOrder();
        setIsSubmittingOrder(false);
        setShowSubmitAlert(true); // ✅ show alert only *after* confirmed and submitted
      }, 100);
    }}
    onCancel={() => setShowConfirmModal(false)}
  />
)}



{showSubmitAlert && !isSubmittingOrder && (
  <CustomAlert
    message="Order submitted successfully! You’ll be notified when it begins production."
    onClose={() => setShowSubmitAlert(false)}
  />
)}

{/* ✅ Show Save Alert when triggered */}
{showSaveAlert && (
  <CustomAlert
    message="Quote saved successfully!"
    onClose={() => setShowSaveAlert(false)} // ✅ Hide Alert on Close
  />
)}
  </div>
</div>

</div>


    </div>
  );
};

export default QuotePage;

// 🛠️ Utility Functions

const formatProductName = (product) => {
  if (product === "2.5 Faux Wood Blinds") return '2.5" Faux Wood Blinds';
  if (product === "2 Faux Wood Blinds") return '2" Faux Wood Blinds';
  return product;
};

// 🔧 Additional Options Formatting
const getAdditionalOptions = (item) => {
  const options = [
    item.mountingPosition && item.mountingPosition !== "N/A" ? item.mountingPosition : null,
  ];

  return options.filter(Boolean).map((option, index) => (
    <div key={index} className="sub-text">{option}</div>
  ));
};


