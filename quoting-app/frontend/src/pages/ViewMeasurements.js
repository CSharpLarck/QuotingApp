import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import "./ViewMeasurements.css";

const db = getFirestore();

const ViewMeasurements = () => {
  const { quoteId } = useParams(); // ✅ Get quoteId from URL
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        const quoteRef = doc(db, "quotes", quoteId);
        const quoteSnap = await getDoc(quoteRef);

        if (quoteSnap.exists()) {
          const quoteData = quoteSnap.data();

          setCustomerInfo({
            name: quoteData.customerName || "N/A",
            sidemark: quoteData.sidemark || "N/A",
            poNumber: quoteData.poNumber || "N/A",
            address: quoteData.address || "N/A",
            quoteId: quoteId, // ✅ Ensures Quote ID is set
          });

          setMeasurements(quoteData.measurements || []);
        } else {
          console.error("❌ Error: Quote not found.");
          setCustomerInfo(null);
        }
      } catch (error) {
        console.error("❌ Error fetching quote data:", error);
        setCustomerInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteData();
  }, [quoteId]);

  return (
    <div className="view-measurements-container">
      {/* ✅ Back to Dashboard Button */}
      <button className="back-to-dashboard-button" onClick={() => navigate("/")}>
        ← Back to Dashboard
      </button>

      {/* ✅ Ensure Customer Info Exists Before Rendering */}
      {customerInfo ? (
        <div className="customer-info">
          <p><strong>Name:</strong> {customerInfo.name}</p>
          <p><strong>Sidemark:</strong> {customerInfo.sidemark}</p>
          <p><strong>P.O. Number:</strong> {customerInfo.poNumber}</p>
          <p><strong>Address:</strong> {customerInfo.address}</p>
          <p><strong>Quote ID:</strong> {customerInfo.quoteId}</p>

        </div>
      ) : (
        <p className="error-message">⚠️ Customer information not found.</p>
      )}

      {/* ✅ Updated Header to Show Customer Name */}
      <h2>Measurements for {customerInfo?.name || "Customer"}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : measurements.length === 0 ? (
        <p>No measurements found for this quote.</p>
      ) : (
        <table className="measurements-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Room</th>
              <th>Location</th>
              <th>Width</th>
              <th>Height</th>
              <th>Mount Type</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map((m, index) => (
              <>
                <tr key={index}>
                  <td>{index + 1}</td> {/* ✅ Row count */}
                  <td>{m.room}</td>
                  <td>{m.location}</td>
                  <td>{m.width}"</td>
                  <td>{m.height}"</td>
                  <td>{m.mountType}</td>
                </tr>
                {/* ✅ Notes Row */}
                <tr className="notes-row">
                  <td colSpan="6"><strong>Notes:</strong> {m.notes || "No additional notes."}</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewMeasurements;
