import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, collection, query, orderBy, getDocs, doc, deleteDoc } from "../firebase";
import { auth } from "../firebase"; // ✅ Import Firebase auth
import "./ManageQuotesOrders.css";
import { onSnapshot} from "firebase/firestore";



const ManageQuotesOrders = () => {
  const [quotes, setQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const quotesPerPage = 10; // ✅ 10 quotes per page
  // eslint-disable-next-line
  const [quoteToDelete, setQuoteToDelete] = useState(null); // ✅ Track which quote is being deleted
  const [forceRender, setForceRender] = useState(0);

  const [userRole, setUserRole] = useState(null); // ✅ Store user role

  const [dropdownTimeout, setDropdownTimeout] = useState(null); // ✅ Timeout for delayed closing

  const [newOrderNotifications, setNewOrderNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const navigate = useNavigate();

  // eslint-disable-next-line no-unused-vars
  const [currentPage, setCurrentPage] = useState(1);

  // eslint-disable-next-line no-unused-vars
  const [currentQuoteId, setCurrentQuoteId] = useState(null);
  const [readNotifications, setReadNotifications] = useState(new Set(JSON.parse(localStorage.getItem("readNotifications")) || []));


  useEffect(() => {
    const fetchUserQuotes = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.error("❌ User is not authenticated");
        return;
      }
  
      try {
        const usersRef = collection(db, "users");
        const userSnapshot = await getDocs(usersRef);
        const currentUserData = userSnapshot.docs.find(
          (doc) => doc.data().Email === user.email
        )?.data();
        const role = currentUserData?.Role?.toLowerCase();
        setUserRole(role); // ✅ Trigger notification listener separately after this is set
  
        const quotesRef = collection(db, "quotes");
        const q = query(quotesRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
  
        const fetchedQuotes = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const quoteData = doc.data();
            const userId = quoteData.createdBy || "";
            let userName = "Unknown User";
  
            if (userId) {
              const userDoc = userSnapshot.docs.find((userDoc) => userDoc.id === userId);
              if (userDoc) {
                userName = userDoc.data().User || "Unknown User";
              }
            }
  
            return {
              id: doc.id,
              shortQuoteId: quoteData.shortQuoteId || "N/A",
              customerName: quoteData.customerName || "N/A",
              sidemark: quoteData.sidemark || "N/A",
              status: quoteData.status || "Quote",
              timestamp: quoteData.timestamp || null,
              createdBy: userId,
              userName: userName,
            };
          })
        );
  
        setQuotes(
          role === "admin"
            ? fetchedQuotes
            : fetchedQuotes.filter((quote) => quote.createdBy === user.uid)
        );
      } catch (error) {
        console.error("❌ Error fetching quotes:", error);
      }
    };
  
    fetchUserQuotes();
  }, []);
  

  useEffect(() => {
    if (userRole !== "admin") return;
  
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const submittedNotifs = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((notif) => notif.type === "orderSubmitted");
  
      // 🔁 Split into unread and read, sort both by timestamp DESC
      const unread = submittedNotifs
        .filter((n) => !readNotifications.has(n.id))
        .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
  
      const read = submittedNotifs
        .filter((n) => readNotifications.has(n.id))
        .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
  
      // ✅ Combine unread first, then read
      setNewOrderNotifications([...unread, ...read]);
    });
  
    return () => unsubscribe();
  }, [userRole, readNotifications]);
  
  
  
  // Sync to localStorage whenever readNotifications updates
useEffect(() => {
  localStorage.setItem("readNotifications", JSON.stringify([...readNotifications]));
}, [readNotifications]);

  const handleDelete = async (quoteId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this quote? This action cannot be undone.");
    
    if (!isConfirmed) return;
  
    try {
      await deleteDoc(doc(db, "quotes", quoteId));
  
      setQuotes((prevQuotes) => prevQuotes.filter((quote) => quote.id !== quoteId));
  
      setSelectedQuote(null);
      setQuoteToDelete(null);
  
      // ✅ Force a re-render
      setForceRender((prev) => prev + 1);
    } catch (error) {
      console.error("❌ Error deleting quote:", error);
    }
  };
  
   // ✅ Handles mouse enter and clears timeout
   const handleMouseEnter = (quoteId) => {
    if (dropdownTimeout) clearTimeout(dropdownTimeout);
    setSelectedQuote(quoteId);
  };

  // ✅ Handles mouse leave with delay to prevent accidental closing
  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setSelectedQuote(null);
    }, 300); // ✅ Small delay to prevent instant closing
    setDropdownTimeout(timeout);
  };

  
  const deleteNotification = async (notifId) => {
    try {
      await deleteDoc(doc(db, "notifications", notifId));
      setNewOrderNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error("❌ Error deleting notification:", err);
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
{/* ✅ Only show notification bell if user is admin */}
{userRole === "admin" && (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
        title="Notifications"
      >
        🔔
        {newOrderNotifications.some((notif) => !readNotifications.has(notif.id)) && (
  <span className="notification-count">
    {
      newOrderNotifications.filter((notif) => !readNotifications.has(notif.id)).length
    }
  </span>
)}

      </button>

      {showNotifications && (
  <div className="notification-dropdown">

<div className="mark-all-read-container">
  <button
    className="mark-all-read"
    onClick={() => {
      const allIds = newOrderNotifications.map((n) => n.id);
      setReadNotifications(new Set(allIds));
    }}
  >
    Mark all as read
  </button>
</div>


    {newOrderNotifications.length === 0 ? (
      <p>No submitted orders yet.</p>
    ) : (
      newOrderNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`notification-item ${readNotifications.has(notif.id) ? "read" : "unread"}`}
          onClick={() => {
            setReadNotifications((prev) => new Set([...prev, notif.id]));
            navigate(`/quote/${notif.quoteId}`);
          }}
          
        >
          <button
            className="notification-close-btn"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notif.id);
            }}
            title="Dismiss notification"
          >
            ×
          </button>

          <strong>Submitted Order:</strong><br />
          User: {notif.userName}<br />
          PO: {notif.poNumber}<br />
          Quote ID: #{notif.shortQuoteId || notif.quoteId?.slice(-4)}<br />
          <small>{notif.timestamp?.toDate().toLocaleString()}</small>
        </div>
      ))
    )}
  </div>
)}

</div>
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
    <th className="table-cell">Quote ID</th> {/* ✅ Added Quote ID */}
    <th className="table-cell">Customer Name</th>
    <th className="table-cell">Sidemark</th>
    <th className="table-cell">Status</th>
    {userRole === "admin" && <th className="table-cell">User</th>} {/* ✅ Show only for Admins */}
    <th className="table-cell actions-header">Actions</th>
  </tr>
</thead>
<tbody>
  {quotes.length > 0 ? (
    quotes.map((quote) => (
      <tr key={`${quote.id}-${forceRender}`} className="table-row">
        <td className="table-cell">{quote.shortQuoteId}</td> {/* ✅ Display Short ID */}
        <td className="table-cell">{quote.customerName}</td>
        <td className="table-cell">{quote.sidemark}</td>
        <td className="table-cell">{quote.status}</td>
        {userRole === "admin" && <td className="table-cell">{quote.userName}</td>} {/* ✅ Display User Name */}
        <td className="table-cell actions-cell">

        <div
                      className="edit-dropdown-container"
                      onMouseEnter={() => handleMouseEnter(quote.id)}
                      onMouseLeave={handleMouseLeave}
                    >
       <button
    className={`edit-button ${selectedQuote === quote.id ? "active" : ""}`}
    onClick={() => setSelectedQuote(selectedQuote === quote.id ? null : quote.id)}
  >
    ⋮
  </button>
  
                      {selectedQuote === quote.id && (
    <div className="dropdown-menu">
      {/* ✅ Close dropdown after navigation */}
      <button
        onClick={() => {
          navigate(`/quote/${quote.id}`);
          setSelectedQuote(null); // ✅ Close dropdown
        }}
      >
        View
      </button>
      
      
      {/* ✅ Keep delete modal open until confirmed/canceled */}
      <button
  onClick={() => handleDelete(quote.id)} // ✅ Directly call handleDelete
>
  Delete
</button>




                  
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
