import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Ensure Correct Import
import emailjs from "@emailjs/browser"; // ✅ Import EmailJS
import { collection, doc, getDoc, updateDoc, getFirestore, query, where, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./InstallerMeasurement.css";
import SignatureCanvas from "react-signature-canvas"; // ✅ Import Signature Pad


const db = getFirestore();
const mountTypes = ["Please Select", "Inside Mount", "Outside Mount"];
const fractionOptions = ["", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8"];
const initialMeasurement = {
  location: "",
  width: "",
  widthFraction: "",
  height: "",
  heightFraction: "",
  depth: "",
  depthFraction: "",
  mountType: "Please Select",
  notes: "",
};
// eslint-disable-next-line
const auth = getAuth();


const InstallerMeasurement = () => {
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(initialMeasurement);
  const [errors, setErrors] = useState({});  
  // eslint-disable-next-line
  const [quotes, setQuotes] = useState([]); // ✅ Stores all quotes (filtered by Measure status)
  const [selectedQuoteId, setSelectedQuoteId] = useState(""); // ✅ Selected Quote ID
  const [showSignaturePopup, setShowSignaturePopup] = useState(false); // ✅ Controls Popup
  const [signatureData, setSignatureData] = useState(null); // ✅ Stores Signature Image
  const [customers, setCustomers] = useState([]); // ✅ Ensure customers state is defined

  const signaturePadRef = useRef(null);
  const navigate = useNavigate(); // Initialize navigation


  useEffect(() => {
    document.body.classList.add("no-navbar");
    return () => {
      document.body.classList.remove("no-navbar");
    };
  }, []);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const quotesRef = collection(db, "quotes");
        const q = query(quotesRef, where("status", "==", "Measure"));
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const quoteList = snapshot.docs.map((doc) => ({
            id: doc.id, // ✅ Store quoteId internally
            address: doc.data().address || "No Address Provided",
          }));
  
          setCustomers(quoteList); // ✅ Correctly set customers state
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Error fetching quotes:", error);
      }
    };
    fetchQuotes();
  }, []);
  
  
  const handleSignatureEnd = () => {
    if (signaturePadRef.current) {
      setSignatureData(signaturePadRef.current.toDataURL());
    }
  };

  const handleClearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      setSignatureData(null);
    }
  };

  const handleAcceptSignature = async () => {
    if (!signatureData) {
      alert("Please sign before submitting.");
      return;
    }

    setShowSignaturePopup(false);
    submitMeasurements();
  };
  
  const validateInputs = () => {
    let newErrors = {};
    if (!currentMeasurement.location.trim()) newErrors.location = "Window location is required";
    if (!currentMeasurement.width || currentMeasurement.width <= 0) newErrors.width = "Valid width is required";
    if (!currentMeasurement.height || currentMeasurement.height <= 0) newErrors.height = "Valid height is required";
    if (!currentMeasurement.depth || currentMeasurement.depth <= 0) newErrors.depth = "Valid depth is required"; // ✅ Added depth validation
    if (currentMeasurement.mountType === "Please Select") newErrors.mountType = "Select a mount type";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  
  const isFormValid = useMemo(() => {
    return (
      currentMeasurement.location.trim() &&
      currentMeasurement.width > 0 &&
      currentMeasurement.height > 0 &&
      currentMeasurement.depth > 0 && // ✅ Added depth check
      currentMeasurement.mountType !== "Please Select"
    );
  }, [currentMeasurement]);
  

  const handleInputChange = (field, value) => {
    setCurrentMeasurement({ ...currentMeasurement, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const addMeasurement = () => {
    if (!validateInputs()) {
      alert("Please fill in all required fields.");
      return;
    }
    setMeasurements([...measurements, currentMeasurement]);
    setCurrentMeasurement(initialMeasurement);
  };

  const deleteMeasurement = (index) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const submitMeasurements = async () => {
    if (!selectedQuoteId) {
      alert("No quote selected.");
      return;
    }
  
    if (!signatureData) {
      alert("Please sign before submitting.");
      return;
    }
  
    try {
      // ✅ Fetch quote details using Quote ID (no need to filter by address)
      const quoteRef = doc(db, "quotes", selectedQuoteId);
      const quoteSnap = await getDoc(quoteRef);
  
      if (!quoteSnap.exists()) {
        alert("Error: Quote not found.");
        return;
      }
  
      const quoteData = quoteSnap.data();
  
      // ✅ Fetch User Details (Created By)
      let userData = {};
      if (quoteData.createdBy) {
        const userRef = doc(db, "users", quoteData.createdBy);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userData = userSnap.data();
        } else {
          console.error("❌ Error: User details not found.");
        }
      }
  
      // ✅ Format measurements into structured text
      const measurementData = measurements
        .map(
          (m, index) => `
          Measurement #${index + 1}
          - Location: ${m.location}
          - Width: ${m.width} ${m.widthFraction || ""}
          - Height: ${m.height} ${m.heightFraction || ""}
          - Depth: ${m.depth} ${m.depthFraction || ""}
          - Mount Type: ${m.mountType}
          - Notes: ${m.notes || "None"}
          `
        )
        .join("\n\n");
  
      // ✅ Prepare email parameters
      const emailParams = {
        to_email: ["matthew@designerblindco.com", "lauren@designerblindco.com"],
        submitted_at: new Date().toLocaleString(),
  
        // ✅ Customer Information
        customer_name: quoteData.customerName || "N/A",
        customer_address: quoteData.address || "N/A",
        customer_phone: quoteData.phoneNumber || "N/A",
  
        // ✅ User Information
        user_name: userData.User || "N/A",
        user_email: userData.Email || "N/A",
        user_phone: userData.PhoneNumber || "N/A",
  
        // ✅ Measurements
        measurements: measurementData,
  
        // ✅ Signature Image (Base64)
        signature_image: signatureData,
      };
  
      // ✅ Send email using EmailJS
      await emailjs.send(
        "service_iol1dvk",
        "template_qbvys3m",
        emailParams,
        "znLAerSnhygI4VwJX"
      );
  
      alert("Measurements sent successfully via email!");
  
      // ✅ Update Firestore status from "Measure" to "Order Pending"
      await updateDoc(quoteRef, {
        status: "Order Pending",
        signature: signatureData, // ✅ Store Signature in Firestore
      });
  
      console.log(`📌 Updated status for Quote ID: ${selectedQuoteId} to "Order Pending"`);
  
      // ✅ Remove the submitted quote from the dropdown immediately
      setQuotes((prevQuotes) =>
        prevQuotes.filter((quote) => quote.id !== selectedQuoteId)
      );
  
      // ✅ Reset state
      setMeasurements([]);
      setSelectedQuoteId("");
      setSignatureData(null);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      alert("Something went wrong while sending the email.");
    }
  };
  

  

  return (

    
    <div className="installer-measurement-container">
      {/* ✅ Back to Dashboard Button */}
      <button className="back-to-dashboard-button" onClick={() => navigate("/resources")}>
        ← Back to Resources
      </button>

      <div className="customer-selection">
  <label htmlFor="customer">Customer Selection:</label>
  <select 
    id="customer" 
    className="customer-dropdown" 
    value={selectedQuoteId} 
    onChange={(e) => setSelectedQuoteId(e.target.value)}
  >
    <option value="">Select a Customer</option>
    {customers.map((customer) => (
      <option key={customer.id} value={customer.id}>
        {customer.address} {/* ✅ Displays only address, uses quoteId internally */}
      </option>
    ))}
  </select>


      {/* ✅ Signature Pop-Up Modal */}
      {showSignaturePopup && (
        <div className="signature-modal-overlay">
          <div className="signature-modal">
            <h3>Measurement Responsibility Agreement</h3>
            <p>
              By signing below, you confirm that the measurements submitted are accurate. If incorrect, you accept financial responsibility for any required replacements.
            </p>

            {/* ✅ Signature Pad (Auto-Saves on End) */}
            <SignatureCanvas
              ref={signaturePadRef}
              penColor="black"
              onEnd={handleSignatureEnd}
              canvasProps={{
                className: "signature-canvas",
                width: 400,
                height: 150,
              }}
            />

<div className="signature-buttons">
  <button className="clear-btn" onClick={handleClearSignature}>Clear Signature</button>
  <button className="submit-btn" onClick={handleAcceptSignature}>Accept & Submit</button>
</div>



          </div>
        </div>
      )}
    </div>



      <h2 className="measure-title">Measurement Form</h2>
      <div className="measurement-form">
        <input className="measurement-input" name="location" placeholder="Window Location" value={currentMeasurement.location} onChange={(e) => handleInputChange("location", e.target.value)} />
        <div className="measurement-group">
          <input className="measurement-input" name="width" type="number" placeholder="Width (In inches)" value={currentMeasurement.width} onChange={(e) => handleInputChange("width", e.target.value)} />
          <select className="measurement-select" name="widthFraction" value={currentMeasurement.widthFraction} onChange={(e) => handleInputChange("widthFraction", e.target.value)}>
            {fractionOptions.map((frac) => (
              <option key={frac} value={frac}>{frac}</option>
            ))}
          </select>
        </div>
        <div className="measurement-group">
          <input className="measurement-input" name="height" type="number" placeholder="Height (In inches)" value={currentMeasurement.height} onChange={(e) => handleInputChange("height", e.target.value)} />
          <select className="measurement-select" name="heightFraction" value={currentMeasurement.heightFraction} onChange={(e) => handleInputChange("heightFraction", e.target.value)}>
            {fractionOptions.map((frac) => (
              <option key={frac} value={frac}>{frac}</option>
            ))}
          </select>
        </div>

         {/* ✅ Depth Input (NEW) */}
  <div className="measurement-group">
    <input className="measurement-input" name="depth" type="number" placeholder="Depth (In inches)" value={currentMeasurement.depth} onChange={(e) => handleInputChange("depth", e.target.value)} />
    <select className="measurement-select" name="depthFraction" value={currentMeasurement.depthFraction} onChange={(e) => handleInputChange("depthFraction", e.target.value)}>
      {fractionOptions.map((frac) => (
        <option key={frac} value={frac}>{frac}</option>
      ))}
    </select>
  </div>

       {/* ✅ Inside/Outside Mount Title */}
<div className="measurement-mount-group">
  <label className="measurement-mount-title">Inside or Outside Mount:</label>
  <select className="measurement-mount" name="mountType" value={currentMeasurement.mountType} onChange={(e) => handleInputChange("mountType", e.target.value)}>
    {mountTypes.map((type) => (
      <option key={type} value={type}>{type}</option>
    ))}
  </select>
</div>

        <input className="measurement-input" name="notes" placeholder="Notes" value={currentMeasurement.notes} onChange={(e) => handleInputChange("notes", e.target.value)} />
      </div>
      <div className="measurement-buttons">
    <button className="next-measurement-button" onClick={addMeasurement} disabled={!isFormValid}>
      Next Measurement
    </button>
       {/* ✅ Submit Button (Opens Signature Modal) */}
   <div className="measurement-buttons">
   <button
  className="submit-button"
  onClick={() => setShowSignaturePopup(true)}
  disabled={!selectedQuoteId || measurements.length === 0} // ✅ Disabled when no customer or no measurements
>
  Submit & Finish
</button>

      </div>
  </div>

  <h3 className="measure-title">Measure Sheet</h3>
  <table className="measure-sheet">
    <thead>
      <tr>
        <th>#</th>
        <th>Location</th>
        <th>Width</th>
        <th>Height</th>
        <th>Depth</th>
        <th>Mount</th>
        <th>Edit</th>
      </tr>
    </thead>
    <tbody>
      {measurements.map((m, index) => (
        <React.Fragment key={index}>
          <tr>
            <td>{index + 1}</td>
            <td>{m.location}</td>
            <td>{m.width}{m.widthFraction && ` ${m.widthFraction}`}"</td>
            <td>{m.height}{m.heightFraction && ` ${m.heightFraction}`}"</td>
            <td>{m.depth}{m.depthFraction && ` ${m.depthFraction}`}"</td>
            <td>
              {m.mountType === "Inside Mount" ? "ID" : m.mountType === "Outside Mount" ? "OD" : m.mountType}
            </td>
            <td>
              <button className="delete-button" onClick={() => deleteMeasurement(index)}>❌</button>
            </td>
          </tr>
          <tr>
            <td colSpan="8" className="notes-row">Notes: {m.notes}</td>
          </tr>
        </React.Fragment>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default InstallerMeasurement;
