import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Ensure Correct Import

import { collection, getDocs, addDoc, getDoc, setDoc, arrayUnion, getFirestore, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import "./InstallerMeasurement.css";

const db = getFirestore();
const mountTypes = ["Please Select", "Inside Mount", "Outside Mount"];
const fractionOptions = ["", "1/8", "1/4", "3/8", "1/2", "5/8", "3/4", "7/8"];
const initialMeasurement = {
  room: "",
  location: "",
  width: "",
  widthFraction: "",
  height: "",
  heightFraction: "",
  depth: "",
  mountType: "Please Select",
  notes: "",
};

const InstallerMeasurement = () => {
  const [measurements, setMeasurements] = useState([]);
  const [currentMeasurement, setCurrentMeasurement] = useState(initialMeasurement);
  const [errors, setErrors] = useState({});  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const navigate = useNavigate(); // Initialize navigation


  useEffect(() => {
    document.body.classList.add("no-navbar");
    return () => {
      document.body.classList.remove("no-navbar");
    };
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const quotesRef = collection(db, "quotes");
        const q = query(quotesRef, where("status", "==", "Measure"));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const addressList = snapshot.docs.map((doc) => ({
            id: doc.id,
            address: doc.data().address || "No Address Provided", 
          }));
          setCustomers(addressList);
        });
        
        return () => unsubscribe();
      } catch (error) {
        console.error("❌ Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);
  
  
  
  const validateInputs = () => {
    let newErrors = {};
    if (!currentMeasurement.room.trim()) newErrors.room = "Room name is required";
    if (!currentMeasurement.location.trim()) newErrors.location = "Window location is required";
    if (!currentMeasurement.width || currentMeasurement.width <= 0) newErrors.width = "Valid width is required";
    if (!currentMeasurement.height || currentMeasurement.height <= 0) newErrors.height = "Valid height is required";
    if (currentMeasurement.mountType === "Please Select") newErrors.mountType = "Select a mount type";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = useMemo(() => {
    return (
      currentMeasurement.room.trim() &&
      currentMeasurement.location.trim() &&
      currentMeasurement.width > 0 &&
      currentMeasurement.height > 0 &&
      currentMeasurement.mountType !== "Please Select"
    );
  }, [currentMeasurement]);

  const handleInputChange = (field, value) => {
    setCurrentMeasurement({ ...currentMeasurement, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const addMeasurement = () => {
    if (!validateInputs()) return;
    setMeasurements([...measurements, currentMeasurement]);
    setCurrentMeasurement(initialMeasurement);
  };

  const deleteMeasurement = (index) => {
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  const submitMeasurements = async () => {
    if (measurements.length === 0 || !selectedCustomer) {
      alert("No measurements to submit or no customer selected.");
      return;
    }
  
    try {
      // ✅ Find the quoteId associated with the selected customer (address)
      const quotesRef = collection(db, "quotes");
      const q = query(quotesRef, where("address", "==", selectedCustomer));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert("Error: No matching quote found for this address.");
        return;
      }
  
      const quoteDoc = querySnapshot.docs[0]; // ✅ Get the first matching quote
      const quoteId = quoteDoc.id; // ✅ Get the quote ID
      const quoteRef = doc(db, "quotes", quoteId); // ✅ Reference to Firestore document
  
      // ✅ Prepare the measurement data
      const measurementData = measurements.map((m) => ({
        room: m.room,
        location: m.location,
        width: `${m.width} ${m.widthFraction}`,
        height: `${m.height} ${m.heightFraction}`,
        mountType: m.mountType,
        notes: m.notes,
      }));
  
      // ✅ Update Firestore: Add `measurements` array under the quote document
      await updateDoc(quoteRef, {
        measurements: measurementData, // ✅ Store the entire array of measurements
        status: "Order Pending", // ✅ Update status
        updatedAt: serverTimestamp(), // ✅ Add timestamp
      });
  
      console.log("✅ Measurements added successfully.");
      alert("Success! Measurements saved, and status is now 'Order Pending'.");
  
      // ✅ Clear state after submission
      setMeasurements([]);
      setSelectedCustomer("");
  
    } catch (error) {
      console.error("❌ Error submitting measurements:", error.message);
      alert("Something went wrong while submitting measurements. Please try again.");
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
    value={selectedCustomer} 
    onChange={(e) => setSelectedCustomer(e.target.value)}
  >
    <option value="">Select a Customer</option>
    {customers.map((customer) => (
      <option key={customer.id} value={customer.address}>
        {customer.address}
      </option>
    ))}
  </select>
</div>



      <h2 className="measure-title">Measurement Form</h2>
      <div className="measurement-form">
        <input className="measurement-input" name="room" placeholder="Room Name" value={currentMeasurement.room} onChange={(e) => handleInputChange("room", e.target.value)} />
        <input className="measurement-input" name="location" placeholder="Window Location" value={currentMeasurement.location} onChange={(e) => handleInputChange("location", e.target.value)} />
        <div className="measurement-group">
          <input className="measurement-input" name="width" type="number" placeholder="Width (in)" value={currentMeasurement.width} onChange={(e) => handleInputChange("width", e.target.value)} />
          <select className="measurement-select" name="widthFraction" value={currentMeasurement.widthFraction} onChange={(e) => handleInputChange("widthFraction", e.target.value)}>
            {fractionOptions.map((frac) => (
              <option key={frac} value={frac}>{frac}</option>
            ))}
          </select>
        </div>
        <div className="measurement-group">
          <input className="measurement-input" name="height" type="number" placeholder="Height (in)" value={currentMeasurement.height} onChange={(e) => handleInputChange("height", e.target.value)} />
          <select className="measurement-select" name="heightFraction" value={currentMeasurement.heightFraction} onChange={(e) => handleInputChange("heightFraction", e.target.value)}>
            {fractionOptions.map((frac) => (
              <option key={frac} value={frac}>{frac}</option>
            ))}
          </select>
        </div>
        <select className="measurement-select" name="mountType" value={currentMeasurement.mountType} onChange={(e) => handleInputChange("mountType", e.target.value)}>
          {mountTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input className="measurement-input" name="notes" placeholder="Notes" value={currentMeasurement.notes} onChange={(e) => handleInputChange("notes", e.target.value)} />
      </div>
      <div className="measurement-buttons">
        <button className="next-measurement-button" onClick={addMeasurement} disabled={!isFormValid}>Next Measurement</button>
        <button className="submit-button" onClick={submitMeasurements}>Submit & Finish</button>
      </div>

      <h3 className="measure-title">Measure Sheet</h3>
      <table className="measure-sheet">
        <thead>
          <tr>
            <th>#</th>
            <th>Room</th>
            <th>Location</th>
            <th>Width</th>
            <th>Height</th>
            <th>Mount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {measurements.map((m, index) => (
    <>
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{m.room}</td>
        <td>{m.location}</td>
        {/* ✅ Include fraction if selected */}
        <td>{m.width}{m.widthFraction && ` ${m.widthFraction}`}"</td>
        <td>{m.height}{m.heightFraction && ` ${m.heightFraction}`}"</td>
        <td>{m.mountType}</td>
        <td>
          <button className="delete-button" onClick={() => deleteMeasurement(index)}>❌</button>
        </td>
      </tr>
      <tr>
        <td colSpan="7" className="notes-row">Notes: {m.notes}</td>
      </tr>
    </>
  ))}
</tbody>

      </table>
    </div>
  );
};

export default InstallerMeasurement;
