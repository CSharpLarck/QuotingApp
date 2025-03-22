import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, doc, getDoc, setDoc, runTransaction, updateDoc, collection, addDoc, serverTimestamp } from "../firebase";
import CustomAlert from "./CustomAlert"; // ✅ Import Custom Alert
import RequestMeasureAlert from "./RequestMeasureAlert"; // ✅ Import Request Measure Alert
import emailjs from "emailjs-com";

import "./QuotePage.css"; // Ensure CSS is imported

const QuotePage = () => {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [quotes, setQuotes] = useState([]);
  

  // eslint-disable-next-line no-unused-vars
  const [customerName, setCustomerName] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [poNumber, setPoNumber] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [sidemark, setSidemark] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [address, setAddress] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [phoneNumber, setPhoneNumber] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [showAlert, setShowAlert] = useState(false);

  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [installationCost, setInstallationCost] = useState(0); // ← track installation cost
  const [needsLadder, setNeedsLadder] = useState(false);
  const [ladderWindowCount, setLadderWindowCount] = useState(1);
  const [distance, setDistance] = useState(""); // Distance in miles
  const [distanceCost, setDistanceCost] = useState(0);

  const [needsRemoval, setNeedsRemoval] = useState(false);
  const [removalCount, setRemovalCount] = useState(1); // Default to 1 when checked
  const [showMeasureAlert, setShowMeasureAlert] = useState(false);

  const [needsHaulOff, setNeedsHaulOff] = useState(false);
  const [haulOffCount, setHaulOffCount] = useState(1); // Default to 1 when checked
  const [shippingCost, setShippingCost] = useState(0); // ✅ New state for shipping cost
  const [includeTaxes, setIncludeTaxes] = useState(false);
    // eslint-disable-next-line
  const [suggestedRetailPrice, setSuggestedRetailPrice] = useState(0);

  const [showTooltip, setShowTooltip] = useState(false);
  const [totalSuggestedRetail, setTotalSuggestedRetail] = useState(0);
  const memoizedQuoteItems = useMemo(() => quote?.items || [], [quote]);
  // eslint-disable-next-line
  const totalRetail = totalSuggestedRetail + shippingCost + (includeInstallation ? installationCost : 0);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);

  
  const [grossProfitMargin, setGrossProfitMargin] = useState(0.1); // Default 10%
  const isQuoteSubmitted = quote?.status === "Submitted";

  
  const totalQuotePrice = quote?.items?.reduce((acc, item) => acc + (item.totalPrice || 0), 0) || 0;
  const totalUnits = memoizedQuoteItems.reduce((acc, item) => acc + (item.quantity || 0), 0);
  // eslint-disable-next-line
  const totalCost = totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0);
  const [loading, setLoading] = useState(true); // ✅ New Loading State
  const [showSaveAlert, setShowSaveAlert] = useState(false);



  const navigate = useNavigate();

  const generateNextPONumber = async () => {
    const counterRef = doc(db, "counters", "poNumberCounter");
  
    try {
      let newPONumber;
  
      await runTransaction(db, async (transaction) => {
        const counterSnap = await transaction.get(counterRef);
  
        if (!counterSnap.exists()) {
          // Initialize if it doesn't exist
          transaction.set(counterRef, { current: 1000 });
          newPONumber = 1000;
        } else {
          const current = counterSnap.data().current || 1000;
          newPONumber = current + 1;
          transaction.update(counterRef, { current: newPONumber });
        }
      });
  
      return newPONumber;
    } catch (error) {
      console.error("❌ Error generating PO Number:", error);
      return null;
    }
  };
  
  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true); // ✅ Start Loading

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
                setPoNumber(quoteData.poNumber || "");

      // ✅ Restore saved grossProfitMargin, default to 25% if not found
      setGrossProfitMargin(quoteData.grossProfitMargin ?? 0.25);
                // Restore saved data
                setSuggestedRetailPrice(quoteData.suggestedRetailPrice || 0);

                setInstallationCost(quoteData.installationCost || 0);
                setShippingCost(quoteData.shippingCost || 0);
                setIncludeInstallation(quoteData.includeInstallation || false);
                setIncludeTaxes(quoteData.includeTaxes || false);
                setNeedsLadder(quoteData.needsLadder || false);
                setLadderWindowCount(quoteData.ladderWindowCount || 1);
                setDistance(quoteData.distance || "");
                setNeedsRemoval(quoteData.needsRemoval || false);
                setRemovalCount(quoteData.removalCount || 1);
                setNeedsHaulOff(quoteData.needsHaulOff || false);
                setHaulOffCount(quoteData.haulOffCount || 1);
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

  const calculateDistanceCost = useCallback(() => {
    let cost = 0;
    const miles = parseFloat(distance);

    if (!isNaN(miles)) {
      if (miles < 30) {
        cost = 0; // No charge for distances below 30 miles
      } else if (miles >= 30 && miles <= 60) {
        cost = 60; // Flat $60 charge for 30-60 miles
      } else {
        cost = 60 + 2 * (miles - 60); // Additional $2 per mile beyond 60 miles
      }
    }

    setDistanceCost(cost);
  }, [distance]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the tooltip and the icon
      if (
        showTooltip &&
        !event.target.closest(".distance-cost-container")
      ) {
        setShowTooltip(false);
      }
    };
  
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showTooltip]);
  
  // 🧮 Function to Calculate Retail Price Based on Gross Profit Margin
  // eslint-disable-next-line
const calculateRetailPrice = (cost) => {
  return cost * (1 + grossProfitMargin);
};

const handleSubmitOrder = async () => {
  try {
    const quoteRef = doc(db, "quotes", quoteId);

    // 🔢 Generate the next P.O. Number
    const newPoNumber = await generateNextPONumber();
    if (!newPoNumber) throw new Error("Failed to generate P.O. Number");

    // ✅ Save full quote with status update & new PO Number
    await setDoc(
      quoteRef,
      {
        ...quote,
        status: "Submitted",
        poNumber: newPoNumber,
        submittedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // ✅ Get user name for notification (optional)
    let userName = "Unknown User";
    if (quote.createdBy) {
      const userDocRef = doc(db, "users", quote.createdBy);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        userName = userSnap.data().User || "Unknown User";
      }
    }

    // ✅ Add to notifications
    await addDoc(collection(db, "notifications"), {
      type: "orderSubmitted",
      userName,
      poNumber: newPoNumber,
      quoteId,
      shortQuoteId: quote.shortQuoteId || quoteId.slice(-4),
      timestamp: serverTimestamp(),
    });

    // ✅ Update local state
    setQuote((prev) => ({
      ...prev,
      status: "Submitted",
      poNumber: newPoNumber,
    }));

    setShowSubmitAlert(true);
    console.log("✅ Order submitted and PO Number saved:", newPoNumber);
  } catch (error) {
    console.error("❌ Error submitting order:", error);
    alert("Something went wrong while submitting the order.");
  }
};



  useEffect(() => {
    calculateDistanceCost();
  }, [distance, calculateDistanceCost]);

  const calculateTotalCosts = useCallback((items) => {
    let totalInstall = items.length > 20 ? 300 : items.length > 10 ? 200 : 150;
    let totalShipping = 0;
    
    items.forEach((item) => {
        const qty = item.quantity || 1;
        const productName = (item.product || "").toLowerCase();
        const controlOptions = (item.controlOptions || "").toLowerCase();
        const itemWidth = parseFloat(item.width) || 0;

        // ✅ Motorized vs Non-Motorized Patio Shades
        if (productName.includes("patio shade")) {
            if (controlOptions.includes("motorized")) {
                totalInstall += 500 * qty; // Motorized Patio Shade
            } else {
                totalInstall += 200 * qty; // Non-Motorized Patio Shade
            }
            totalShipping += 100 * qty; // $100/unit shipping for patio shades
        }
        // ✅ Motorized Roller, Roman, and Natural Shades ($45 per unit)
        else if (
            (productName.includes("roller shade") ||
            productName.includes("roman shade") ||
            productName.includes("natural shade")) &&
            controlOptions.includes("motorized")
        ) {
            totalInstall += 45 * qty;
        }
        // ✅ Shutters ($45 per unit)
        else if (productName.includes("shutter")) {
            totalInstall += 45 * qty;
        }
        // ✅ Non-Motorized Blinds & Non-Motorized Roller, Roman, and Natural Shades ($9 per unit)
        else if (
            productName.includes("blind") ||
            productName.includes("roller shade") ||
            productName.includes("roman shade") ||
            productName.includes("natural shade")
        ) {
            totalInstall += 9 * qty;
        }
        // ✅ Quick Ship Panels ($30 per unit)
        else if (productName.includes("quick ship panel")) {
            totalInstall += 30 * qty;
        }

        // 📦 Shipping Costs for Roller Shades, Natural Shades, and Blinds
        if (
            productName.includes("roller shade") ||
            productName.includes("natural shade") ||
            productName.includes("blind")
        ) {
            if (items.length === 1) {
                totalShipping += 20; // $20 minimum order fee for single item orders
            }
            totalShipping += 10 * qty; // $10 per item standard shipping fee
            if (itemWidth > 90) {
                totalShipping += Math.min(90 * qty, 180); // $90 per oversized item, max $180
            }
        }

        // 🚚 Shipping Surcharges for Roman Shades, Shutters, Quick Ship Panels
        if (productName.includes("roman shade")) {
            totalShipping += Math.max(15 * qty, 30); // $15/unit, min $30/order
        } else if (productName.includes("shutter")) {
            totalShipping += Math.max(25 * qty, 75); // $25/unit, min $75/order
        } else if (productName.includes("quick ship panel")) {
            totalShipping += Math.max(30 * qty, 30); // $30/unit, min $30/order
        }
    });

    totalInstall += 50; // Fixed delivery fee

    if (needsLadder) totalInstall += ladderWindowCount * 35;
    if (distance !== "" && !isNaN(distance)) {
        const miles = parseFloat(distance);
        if (miles >= 30 && miles <= 60) totalInstall += 60;
        else if (miles > 60) totalInstall += 60 + 2 * (miles - 60);
    }
    if (needsRemoval) totalInstall += removalCount * 10;
    if (needsHaulOff) totalInstall += haulOffCount * 10;

    return { totalInstall, totalShipping };
}, [needsLadder, ladderWindowCount, distance, needsRemoval, removalCount, needsHaulOff, haulOffCount]);

useEffect(() => {
  if (!quote) return;

  const { totalInstall, totalShipping } = calculateTotalCosts(quote?.items || []);

  setInstallationCost(includeInstallation ? totalInstall : 0);
  setShippingCost(totalShipping);

  const quoteRef = doc(db, "quotes", quoteId);
  setDoc(quoteRef, { 
      installationCost: includeInstallation ? totalInstall : 0,
      shippingCost: totalShipping,
  }, { merge: true });

}, [quote, includeInstallation, includeTaxes, calculateTotalCosts, quoteId, totalQuotePrice]);

const handleToggleInstallation = async (e) => {
  const isChecked = e.target.checked;
  setIncludeInstallation(isChecked);

  const { totalInstall } = calculateTotalCosts(quote.items || []);
  let newInstallationCost = isChecked ? totalInstall : 0;
  
  setInstallationCost(newInstallationCost);

  try {
      if (quote) {
          const quoteRef = doc(db, "quotes", quoteId);
          await setDoc(
              quoteRef,
              { installationCost: newInstallationCost },
              { merge: true }
          );
          console.log("✅ Installation cost updated in Firestore:", newInstallationCost);

          setQuote(prev => ({
              ...prev,
              installationCost: newInstallationCost
          }));
      }
  } catch (err) {
      console.error("❌ Error updating installation cost:", err);
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
        await setDoc(doc(db, "quotes", quoteId), updatedQuote);
        setQuote(updatedQuote);

        // ♻️ Recalculate total costs (installation + shipping)
        const { totalInstall, totalShipping } = calculateTotalCosts(updatedItems);

        if (includeInstallation) {
            setInstallationCost(totalInstall);
        }

        setShippingCost(totalShipping); // Always update shipping cost

        // ✅ Save updated costs in Firestore
        const quoteRef = doc(db, "quotes", quoteId);
        await setDoc(quoteRef, { 
            ...updatedQuote, 
            installationCost: includeInstallation ? totalInstall : 0,
            shippingCost: totalShipping 
        }, { merge: true });

        console.log("✅ Item deleted successfully and costs updated!");
    } catch (error) {
        console.error("❌ Error deleting item:", error);
    }
};

const handleAddMoreItems = async () => {
  if (!quoteId) {
    console.warn("⚠️ No Quote ID found! Cannot add more items.");
    return;
  }

  try {
    const quoteRef = doc(db, "quotes", quoteId);
    const quoteSnap = await getDoc(quoteRef);

    if (quoteSnap.exists()) {
      const data = quoteSnap.data();

      // ✅ Preserve customer info from Firestore
      setCustomerName(data.customerName || "");
      setPoNumber(data.poNumber || "");
      setSidemark(data.sidemark || "");
      setAddress(data.address || "");
      setPhoneNumber(data.phoneNumber || "");

      setShowAlert(false); // ✅ Close the alert

      // ✅ Store `quoteId` in `localStorage` to persist across pages
      localStorage.setItem("currentQuoteId", quoteId);

      navigate(`/quotingpage/${quoteId}`);
    }
  } catch (error) {
    console.error("❌ Error retrieving quote:", error);
  }
};
const getControlOptions = (item) => {
  const controlDetails = [];

  const productName = item.product?.toLowerCase() || "";

  // ✅ Always show "Cordless" for 2" or 2.5" blinds
  if (
    productName.includes('2 faux wood blinds') ||
    productName.includes('2.5 faux wood blinds')
  ) {
    controlDetails.push("Cordless");
  } else {
    // ✅ Default logic for other products
    if (item.controlOptions && item.controlOptions !== "N/A") {
      controlDetails.push(item.controlOptions);
    }

    if (
      ["Loop Control", "Continuous Loop"].includes(item.controlOptions) &&
      item.controlPosition &&
      item.controlPosition !== "N/A"
    ) {
      controlDetails.push(`${item.controlPosition}`);
    }

    if (
      item.controlOptions === "Manual Crank" &&
      item.handleOptions &&
      item.handleOptions !== "N/A"
    ) {
      controlDetails.push(`${item.handleOptions}`);
    }

    if (
      item.controlOptions === "Motorized" &&
      Array.isArray(item.motorizationOptions) &&
      item.motorizationOptions.length > 0
    ) {
      controlDetails.push(...item.motorizationOptions);
    }
  }

  return controlDetails.length
    ? controlDetails.map((opt, idx) => <div key={idx} className="sub-text">{opt}</div>)
    : <div className="sub-text">N/A</div>;
};



const handleSaveQuote = async () => {
  if (!quoteId) return;

  try {
    const calculatedShippingCost = shippingCost / (1 - grossProfitMargin);
    const calculatedInstallationCost = includeInstallation
      ? installationCost / (1 - grossProfitMargin)
      : 0;
    const calculatedProductRetailPrice = totalQuotePrice / (1 - grossProfitMargin);
    const calculatedTotalRetailPrice =
      (totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0)) / (1 - grossProfitMargin);

    const quoteRef = doc(db, "quotes", quoteId);
    await setDoc(quoteRef, {
          ...quote,
          installationCost: includeInstallation ? installationCost : 0,
          shippingCost: shippingCost,
          includeInstallation,
          includeTaxes,
          needsLadder,
          ladderWindowCount,
          distance,
          needsRemoval,
          removalCount,
          needsHaulOff,
          haulOffCount,
          grossProfitMargin, // ✅ Save Gross Profit Margin
          customerName: quote.customerName || "",
          poNumber: quote.poNumber || "",
          sidemark: quote.sidemark || "",
          address: quote.address || "",
          phoneNumber: quote.phoneNumber || "",
          items: quote.items || [], // ✅ Saves all quote items
          
          // ✅ Save Pricing Information
          totalUnits: totalUnits,
          totalQuotePrice: totalQuotePrice, // Your Cost
          totalSuggestedRetail: totalSuggestedRetail, // Retail Price
    
          // ✅ Save Total Cost Breakdown
          totalCost: totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0),
    
          // ✅ Save Total Retail Price Breakdown
          totalRetailPrice: calculatedTotalRetailPrice.toFixed(2), // Retail price with gross margin
    
          // ✅ Save Adjusted Prices
          adjustedShippingCost: calculatedShippingCost.toFixed(2),
          adjustedInstallationCost: calculatedInstallationCost.toFixed(2),
          adjustedProductRetailPrice: calculatedProductRetailPrice.toFixed(2),
        }, { merge: true });
    
        console.log("✅ Quote saved successfully!");
        setShowSaveAlert(true); // ✅ Show Custom Alert
      } catch (error) {
        console.error("❌ Error saving quote:", error);
        alert("Error saving quote. Please try again.");
      }
    };

const getAdditionalOptionsForEmail = (item) => {
  const options = [
      item.mountingPosition && item.mountingPosition !== "N/A" ? `Mounting: ${item.mountingPosition}` : null,
      item.tiltOptions && item.tiltOptions !== "N/A" ? `Tilt: ${item.tiltOptions}` : null,
      item.hingeColor && item.hingeColor !== "N/A" ? `Hinge Color: ${item.hingeColor}` : null,
      item.linerOptions && item.linerOptions !== "N/A"
          ? `Liner: ${item.linerOptions}${item.linerColor && item.linerColor !== "N/A" ? ` (${item.linerColor})` : ""}`
          : null,
      item.headboxOptions && item.headboxOptions !== "N/A" ? `Headbox: ${item.headboxOptions}` : null,
      item.headboxOptions === "Metal Fascia" && item.fasciaColor && item.fasciaColor !== "N/A"
          ? `Fascia Color: ${item.fasciaColor}`
          : null,
      item.hardwareOptions && item.hardwareOptions !== "N/A" ? `Hardware: ${item.hardwareOptions}` : null,
      item.hardwareColor && item.hardwareColor !== "N/A" ? `Hardware Color: ${item.hardwareColor}` : null,
      item.finialOptions && item.finialOptions !== "N/A" ? `Finial: ${item.finialOptions}` : null,
      item.additionalOptions === "Decorative Tape" && item.decorativeTapeType
          ? `Decorative Tape: ${item.decorativeTapeType}`
          : null,
      item.decorativeTapeColor && item.additionalOptions === "Decorative Tape"
          ? `Tape Color: ${item.decorativeTapeColor}`
          : null,
  ];

  return options.filter(Boolean).join(", ") || "N/A"; // Return "N/A" if no additional options exist
};



const handleRequestMeasure = async (quoteId) => {
  console.log(`Request Measure Triggered for Quote ID: ${quoteId}`);

  try {
      const quoteRef = doc(db, "quotes", quoteId);
      const quoteSnap = await getDoc(quoteRef);

      if (!quoteSnap.exists()) {
          console.error("Error: Quote not found.");
          return;
      }

      const quoteData = quoteSnap.data();

      const {
          customerName = "No Name Provided",
          poNumber = "No PO Number",
          sidemark = "No Sidemark",
          address = "No Address Provided",
          phoneNumber = "No Phone Number",
          installationCost = 0,
          shippingCost = 0,
          taxes = 0,
          includeInstallation = false,
          includeTaxes = false,
          needsLadder = false,
          ladderWindowCount = 0,
          distance = "Not Provided",
          needsRemoval = false,
          removalCount = 0,
          needsHaulOff = false,
          haulOffCount = 0,
          items = [],
          createdBy,
      } = quoteData;

      if (!createdBy) {
          console.error("Error: No user ID found in quote data.");
          return;
      }

        // ✅ Calculate Total Cost
        const totalQuotePrice = items.reduce((acc, item) => acc + (item.totalPrice || 0), 0);
        const totalCost = totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0) + (includeTaxes ? taxes : 0);
        const totalUnits = items.reduce((acc, item) => acc + (item.quantity || 0), 0);

        
      // Fetch User Details
      const userRef = doc(db, "users", createdBy);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
          console.error("Error: User details not found.");
          return;
      }

      const userData = userSnap.data();
      const userName = userData.User || "No Name Provided";
      const userEmail = userData.Email || "No Email Provided";
      const userPhone = userData["Phone Number"] || userData.PhoneNumber || "No Phone Number Provided";

      // Update Firestore Status
      await updateDoc(quoteRef, { status: "Measure" });

      // ✅ Immediately update local state to reflect the change
    setQuote((prevQuote) => ({ ...prevQuote, status: "Measure" }));

      setQuotes((prevQuotes) =>
          prevQuotes.map((quote) =>
              quote.id === quoteId ? { ...quote, status: "Measure" } : quote
          )
      );

      // Save Measure Request in Firestore
      await addDoc(collection(db, "measureRequests"), {
          quoteId,
          customerName,
          address,
          userName,
          userEmail,
          userPhone,
          status: "Requested",
          timestamp: serverTimestamp(),
      });
            // ✅ Show Custom Alert Instead of `alert()`
            setShowMeasureAlert(true);

             const formatQuoteItemsForEmail = (quoteItems) => {
              return quoteItems
                .map((item, index) => {
                  const motorizationOptions =
                    item.controlOptions?.toLowerCase() === "motorized"
                      ? item.motorizationOptions?.join(", ") || "None"
                      : "N/A";
            
                  // ✅ Append Control Position & Handle Options inside Control Options column
                  const controlDetails = [item.controlOptions || "N/A"];
                  if (item.controlPosition && item.controlPosition !== "N/A") {
                    controlDetails.push(`${item.controlPosition}`);
                  }
                  if (item.handleOptions && item.handleOptions !== "N/A") {
                    controlDetails.push(`${item.handleOptions}`);
                  }
            
                  // ✅ Merge Control Options Details
                  const formattedControlOptions = controlDetails.join(", ");
            
                  // ✅ Get Additional Options
                  const additionalOptions = getAdditionalOptionsForEmail(item);
            
                  return `
                  Line ${index + 1}:
                  - Quantity: ${item.quantity}
                  - Price: $${Math.round(item.totalPrice)}
                  - Product: ${item.product}
                  - Location: ${item.windowLocation || "N/A"}
                  - Width: ${item.width}" ${item.widthFraction || ""}
                  - Height: ${item.height}" ${item.heightFraction || ""}
                  - Control Option: ${formattedControlOptions}
                  - Motorization Options: ${motorizationOptions}
                  - Additional Options: ${additionalOptions}
                  `;
                })
                .join("\n\n"); // ✅ Ensure each item is separated by a blank line
            };
            
            const formatInstallationDetails = ({
              needsLadder,
              ladderWindowCount,
              distance,
              needsRemoval,
              removalCount,
              needsHaulOff,
              haulOffCount,
          }) => {
              return `Installation Details:
          Needs Ladder: ${needsLadder ? "Yes" : "No"}
          Ladder Window Count: ${needsLadder ? ladderWindowCount : "0"}
          
          Distance: ${distance && distance !== "Not Provided" ? `${distance} miles` : "0 miles"}
          
          Needs Removal: ${needsRemoval ? "Yes" : "No"}
          Removal Count: ${needsRemoval ? removalCount : "0"}
          
          Needs Haul-Off: ${needsHaulOff ? "Yes" : "No"}
          Haul-Off Count: ${needsHaulOff ? haulOffCount : "0"}
              `.trim(); // ✅ Removes extra spaces & ensures clean formatting
          };
          
            
                    
                   

      // ✅ Send Email with Additional Options Included
      console.log("Sending Email to Installer...");
      const emailParams = {
        to_email: ["matthew@designerblindco.com", "lauren@designerblindco.com"],
        subject: "New Measurement Request",
        quoteId,
        customerName,
        poNumber,
        sidemark,
        address,
        phoneNumber,
        userName,
        userEmail,
        userPhone,
        totalUnits,
      
        installationCost: `$${installationCost.toFixed(0)}`,
        shippingCost: `$${shippingCost.toFixed(0)}`,
        totalCost: `$${totalCost.toFixed(0)}`,
        includeInstallation: includeInstallation ? "Yes" : "No",
      
        // ✅ Updated Pricing Fields:
        totalQuotePrice: `$${totalQuotePrice.toFixed(0)}`, // Your cost
        totalSuggestedRetail: `$${totalSuggestedRetail.toFixed(0)}`, // Retail price
        totalRetailPrice: `$${(
          totalSuggestedRetail +
          shippingCost +
          (includeInstallation ? installationCost : 0)
        ).toFixed(0)}`,
      
        // ✅ Use ONLY installationDetails
        installationDetails: formatInstallationDetails({
          needsLadder,
          ladderWindowCount,
          distance,
          needsRemoval,
          removalCount,
          needsHaulOff,
          haulOffCount,
        }),
      
        formattedItems: formatQuoteItemsForEmail(items),
      };
      

      emailjs
          .send(
              "service_iol1dvk", // Replace with your EmailJS Service ID
              "template_mlzc9zd", // Replace with your EmailJS Template ID
              emailParams,
              "znLAerSnhygI4VwJX" // Replace with your EmailJS Public Key
          )
          .then((response) => {
              console.log("Email Sent Successfully:", response.status, response.text);
          })
          .catch((error) => {
              console.error("Email Sending Failed:", error);
          });

      console.log("Measure Request Completed:", address);

  } catch (error) {
      console.error("Error storing request:", error.message);
      alert("Something went wrong while requesting a measure. Please try again.");
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
              <th>Control Option</th>
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
    {includeInstallation && (
      <div className="install-price-line">
        <strong>Installation Price:</strong> ${installationCost.toFixed(0)}
      </div>
    )}
    <div className="product-total-line">
      <strong>Your Cost:</strong> ${totalQuotePrice.toFixed(0)}
    </div>
  
    <div className="install-total-line">
      <strong>Total Cost:</strong> $
      {(totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0)).toFixed(0)}
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
  
  {/* 🔹 Apply Gross Profit Margin to Installation Cost */}
  {includeInstallation && (
    <div className="install-price-line">
      <strong>Installation Price:</strong> $
      {(installationCost / (1 - grossProfitMargin)).toFixed(0)}
    </div>
  )}

    {/* 🔹 Apply Gross Profit Margin to Product Cost */}
    <div className="product-retail-line">
    <strong>Customer Price:</strong> $
    {(totalQuotePrice / (1 - grossProfitMargin)).toFixed(0)}
  </div>

  {/* 🔹 Updated Total Retail Price Including All Costs */}
  <div className="total-retail-line">
    <strong>Total Price:</strong> $
    {((totalQuotePrice + shippingCost + (includeInstallation ? installationCost : 0)) / (1 - grossProfitMargin)).toFixed(0)}
  </div>
</div>




{/* RIGHT COLUMN: Buttons and Checkbox */}
{/* RIGHT COLUMN: Buttons and Checkbox */}
<div className="installation-right-column">
  <div className="installation-actions">

    {/* ✅ Checkbox & Button for Installation */}
    <label className="install-button">
      <input
        type="checkbox"
        checked={includeInstallation}
        onChange={handleToggleInstallation}
        disabled={isQuoteSubmitted}
      />
      <span>Include Installation</span>
    </label>
{/* ✅ Show "Request Measure" button only if quote status is "Quote" */}
{quote?.status === "Quote" && (
  <button className="measure-request-btn" onClick={() => handleRequestMeasure(quoteId)}    disabled={isQuoteSubmitted}
>
    Request Measure
  </button>
)}

{/* ✅ Submit Order Button */}
{quote?.status !== "Submitted" && (
  <button className="submit-order-btn" onClick={handleSubmitOrder}  disabled={isQuoteSubmitted}
>
    Submit Order
  </button>
)}



  

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

{showSubmitAlert && (
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

{showSaveAlert && <CustomAlert message="Quote saved successfully!" onClose={() => setShowSaveAlert(false)} />}
          {showMeasureAlert && <RequestMeasureAlert message="A professional installer has been requested to." onClose={() => setShowMeasureAlert(false)} />}
  </div>
</div>

</div>
{/* ✅ Installation Questions Section */}
{includeInstallation && (
  <div className="full-width-installation-questions">
    <div className="installation-questions">
      <h3>Installation Questions</h3>

      <div className="distance-question">
          Customer distance from store (miles):
          <div className="distance-input-container">
  <input
    type="number"
    value={distance}
    onChange={(e) => setDistance(e.target.value)}  disabled={isQuoteSubmitted}

    min="0"
  />

  {/* Distance Charge Box and Tooltip Container */}
  <div className="distance-cost-container">
    <div className="distance-cost-box">
    <div className="distance-cost-box">
  <strong>Distance Charge:</strong> {distanceCost === 0 ? "No Charge" : `$${distanceCost.toFixed(0)}`}
</div>
    </div>

    {/* Tooltip Icon - Clicking Toggles Tooltip */}
    <span
      className="tooltip-icon"
      onClick={(e) => {
        e.stopPropagation(); // Prevent event bubbling
        setShowTooltip((prev) => !prev); // Toggle state
      }}
    >
      ⓘ
    </span>

    {/* Tooltip Content - Only Show When Toggled */}
    {showTooltip && (
  <div className="tooltip-box">
    <p><strong>Distance Pricing:</strong></p>
    <p><strong>No Charge</strong> for distances under 30 miles</p>
    <p>Minimum Charge: $60 (for 30-60 miles)</p>
    <p>Additional Charge: $2 per mile beyond 60 miles</p>
  </div>
    )}
  </div>
</div>
</div>


  

      {/* ✅ Ladder Question */}
      <div className="ladder-question">
        <label className="primary-question">
          <input
            type="checkbox"
            checked={needsLadder}  disabled={isQuoteSubmitted}

            onChange={(e) => {
              setNeedsLadder(e.target.checked);
              setLadderWindowCount(e.target.checked ? 1 : 0); // ✅ Reset state when unchecked
            }}
          />
          Window accessible only by ladder (adds $35 per blind)
        </label>
        {needsLadder && (
          <div className="secondary-question">
            <span>How many windows need a ladder?</span>
            <input
              type="number"
              value={ladderWindowCount}  disabled={isQuoteSubmitted}

              onChange={(e) => setLadderWindowCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
            />
          </div>
        )}
      </div>

      {/* ✅ Blind Removal Question */}
      <div className="removal-question">
        <label className="primary-question">
          <input
            type="checkbox"
            checked={needsRemoval}  disabled={isQuoteSubmitted}

            onChange={(e) => {
              setNeedsRemoval(e.target.checked);
              setRemovalCount(e.target.checked ? 1 : 0); // ✅ Reset state when unchecked
            }}
          />
          Blinds to remove (adds $10 per blind)
        </label>
        {needsRemoval && (
          <div className="secondary-question">
            <span>How many blinds to remove?</span>
            <input
              type="number"
              value={removalCount}  disabled={isQuoteSubmitted}

              onChange={(e) => setRemovalCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
            />
          </div>
        )}
      </div>

      {/* ✅ Haul Off Question */}
      <div className="hauloff-question">
        <label className="primary-question">
          <input
            type="checkbox"
            checked={needsHaulOff}  disabled={isQuoteSubmitted}

            onChange={(e) => {
              setNeedsHaulOff(e.target.checked);
              setHaulOffCount(e.target.checked ? 1 : 0); // ✅ Reset state when unchecked
            }}
          />
          Blinds to haul off (adds $10 per blind)
        </label>
        {needsHaulOff && (
          <div className="secondary-question">
            <span>How many blinds to haul off?</span>
            <input
              type="number"
              value={haulOffCount}  disabled={isQuoteSubmitted}

              onChange={(e) => setHaulOffCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
              min="1"
            />
          </div>
        )}
      </div>
    </div>
  </div>
)}



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
    item.hingeColor && item.hingeColor !== "N/A" ? `${item.hingeColor}` : null,

// ✅ Only show liner info if product supports liners (e.g. NOT shutters)
!item.product?.toLowerCase().includes("shutter") &&
item.linerOptions && item.linerOptions !== "N/A"
  ? `${item.linerOptions}${item.linerColor && item.linerColor !== "N/A" ? ` (${item.linerColor})` : ""}`
  : null,



    item.headboxOptions && item.headboxOptions !== "N/A" ? `${item.headboxOptions}` : null,

    // ✅ Only show fasciaColor if Metal Fascia is selected
    item.headboxOptions === "Metal Fascia" && item.fasciaColor && item.fasciaColor !== "N/A"
      ? `Fascia Color: ${item.fasciaColor}`
      : null,

    item.hardwareOptions && item.hardwareOptions !== "N/A" ? item.hardwareOptions : null,

    // ✅ Only show hardwareColor if hardwareOptions exists
    item.hardwareOptions && item.hardwareColor && item.hardwareColor !== "N/A" ? item.hardwareColor : null,

    item.finialOptions && item.finialOptions !== "N/A" ? `Finial: ${item.finialOptions}` : null,

    // ✅ Decorative Tape
    item.additionalOptions === "Decorative Tape" && item.decorativeTapeType
      ? `Decorative Tape: ${item.decorativeTapeType}`
      : null,

    item.additionalOptions === "Decorative Tape" && item.decorativeTapeColor
      ? `Tape Color: ${item.decorativeTapeColor}`
      : null,
  ];

  return options.filter(Boolean).map((option, index) => (
    <div key={index} className="sub-text">{option}</div>
  ));
};


