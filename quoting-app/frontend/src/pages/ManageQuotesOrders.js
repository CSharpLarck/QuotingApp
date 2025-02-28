import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, query, getDoc, orderBy, addDoc, serverTimestamp, getDocs, doc, deleteDoc, updateDoc } from "../firebase";
import { auth } from "../firebase"; // ✅ Import Firebase auth
import emailjs from "emailjs-com";
import "./ManageQuotesOrders.css";
import RequestMeasureAlert from "../components/RequestMeasureAlert"; // Import the custom alert

const ManageQuotesOrders = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const quotesPerPage = 10; // ✅ 10 quotes per page
  const [showMeasureAlert, setShowMeasureAlert] = useState(false);

  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line no-unused-vars
  const [currentQuoteId, setCurrentQuoteId] = useState(null);


  useEffect(() => {
    const fetchUserQuotes = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("❌ User is not authenticated");
        return;
      }
      
      try {
        console.log("📡 Fetching user-specific quotes...");
        const quotesRef = collection(db, "quotes");
        const q = query(quotesRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);

        const fetchedQuotes = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            customerName: doc.data().customerName || "N/A",
            sidemark: doc.data().sidemark || "N/A",
            status: doc.data().status || "Quote",
            timestamp: doc.data().timestamp || null,
            createdBy: doc.data().createdBy || "" // ✅ Check for ownership
          }))
          .filter((quote) => quote.createdBy === user.uid); // ✅ Only show quotes created by the logged-in user

        setQuotes(fetchedQuotes);
      } catch (error) {
        console.error("❌ Error fetching quotes:", error);
      }
    };

    fetchUserQuotes();
  }, []);
  
  // ✅ Handle Deletion of Quote
  const handleDelete = async (quoteId) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      try {
        await deleteDoc(doc(db, "quotes", quoteId));
        setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== quoteId));
        setSelectedQuote(null);
      } catch (error) {
        console.error("Error deleting quote:", error);
      }
    }
  };

  const handleRequestMeasure = async (quoteId) => {
    console.log(`🚀 Request Measure Triggered for Quote ID: ${quoteId}`);
  
    try {
      const quoteRef = doc(db, "quotes", quoteId);
      const quoteSnap = await getDoc(quoteRef);
  
      if (!quoteSnap.exists()) {
        console.error("❌ Error: Quote not found.");
        return;
      }
  
      const quoteData = quoteSnap.data();
      console.log("📜 Quote Data Retrieved:", quoteData);
  
      const customerName = quoteData.customerName || "No Name Provided";
      const customerAddress = quoteData.address || "No Address Provided";
      const createdByUserId = quoteData.createdBy;
  
      if (!createdByUserId) {
        console.error("❌ Error: No user ID found in quote data.");
        return;
      }
  
      // ✅ Fetch the User Details from Firestore
      console.log(`📡 Fetching User Details for User ID: ${createdByUserId}`);
      const userRef = doc(db, "users", createdByUserId);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        console.error("❌ Error: User details not found.");
        return;
      }
  
      const userData = userSnap.data();
      console.log("👤 User Data Retrieved:", userData);
  
      const userName = userData.User || "No Name Provided";
      const userEmail = userData.Email || "No Email Provided";
      const userPhone = userData["Phone Number"] || userData.PhoneNumber || "No Phone Number Provided";
  
      // ✅ Update Firestore status
      console.log(`📝 Updating Firestore status for Quote ID: ${quoteId}`);
      await updateDoc(quoteRef, { status: "Measure" });
  
      // ✅ Update UI state immediately
      setQuotes((prevQuotes) =>
        prevQuotes.map((quote) =>
          quote.id === quoteId ? { ...quote, status: "Measure" } : quote
        )
      );
  
      // ✅ Add a new request to the measureRequests collection
      console.log("🗂️ Storing Measure Request in Firestore...");
      const measureRequestRef = await addDoc(collection(db, "measureRequests"), {
        quoteId: quoteId,
        customerName: customerName,
        customerAddress: customerAddress,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        status: "Requested",
        timestamp: serverTimestamp(),
      });
  
      console.log("✅ Measure Request Stored Successfully:", measureRequestRef.id);
  
      // ✅ Send Email Notification to Installer
      console.log("📧 Sending Email to Installer...");
      const emailParams = {
        to_email: "matthew@clearviewfinishes.com",
        subject: "New Measurement Request",
        customerName: customerName,
        customerAddress: customerAddress,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
      };
  
      emailjs
        .send(
          "service_iol1dvk", // Replace with your EmailJS Service ID
          "template_mlzc9zd", // Replace with your EmailJS Template ID
          emailParams,
          "znLAerSnhygI4VwJX" // Replace with your EmailJS Public Key
        )
        .then((response) => {
          console.log("✅ Email Sent Successfully:", response.status, response.text);
        })
        .catch((error) => {
          console.error("❌ Email Sending Failed:", error);
        });
  
      console.log("✅ Measure Request Completed:", customerAddress);
  
    } catch (error) {
      console.error("❌ Error storing request:", error.message);
      alert("Something went wrong while requesting a measure. Please try again.");
    }
  };
  

  
// ✅ Pagination Logic
const indexOfLastQuote = currentPage * quotesPerPage;
const indexOfFirstQuote = indexOfLastQuote - quotesPerPage;

// eslint-disable-next-line no-unused-vars
const currentQuotes = quotes.slice(indexOfFirstQuote, indexOfLastQuote);

// eslint-disable-next-line no-unused-vars
const totalPages = Math.ceil(quotes.length / quotesPerPage);


  return (
    <div className="manage-quotes-container">
      {showMeasureAlert && (
        <RequestMeasureAlert 
          message="A professional installer has been requested to take precise measurements for this project. Our team will contact the client shortly to schedule an appointment."
          onClose={() => setShowMeasureAlert(false)}
        />
      )}

      <button
        onClick={() => {
          localStorage.removeItem("currentQuoteId");
          setCurrentQuoteId(null);
          navigate("/quote");
        }}
        className="start-quote-button"
      >
        Start New Quote
      </button>
  
      <main className="table-container">
        <table className="quotes-table">
          <thead>
            <tr className="table-header">
              <th className="table-cell">Customer Name</th>
              <th className="table-cell">Sidemark</th>
              <th className="table-cell">Status</th>
              <th className="table-cell actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length > 0 ? (
              quotes.map((quote) => (
                <tr key={quote.id} className="table-row">
                  <td className="table-cell">{quote.customerName}</td>
                  <td className="table-cell">{quote.sidemark}</td>
                  <td className="table-cell">{quote.status}</td>
                  <td className="table-cell actions-cell">
                    <div
                      className="edit-dropdown-container"
                      onMouseEnter={() => setSelectedQuote(quote.id)}
                      onMouseLeave={() => setSelectedQuote(null)}
                    >
                      <button
                        className={`edit-button ${selectedQuote === quote.id ? "active" : ""}`}
                        onClick={() => setSelectedQuote(selectedQuote === quote.id ? null : quote.id)}
                      >
                        ⋮
                      </button>
  
                      {selectedQuote === quote.id && (
                        <div className="dropdown-menu">
                          <button onClick={() => navigate(`/quote/${quote.id}`)}>View</button>
                          <button onClick={() => handleDelete(quote.id)}>Delete</button>
                          {quote.status === "Quote" && (
                            <button onClick={() => handleRequestMeasure(quote.id)}>
                              Request Measure
                            </button>
                          )}
                          {quote.status === "Order Pending" && (
                            <button onClick={() => navigate(`/viewmeasurements/${quote.id}`)}>
                              View Measurements
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="table-cell no-quotes">No quotes found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default ManageQuotesOrders;
