import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ManageQuotesOrders from "./pages/ManageQuotesOrders";
import Resources from "./pages/Resources";
import Settings from "./pages/Settings";
import SignIn from "./pages/SignIn";
import BrochurePage from "./components/BrochurePage";
import CuratedCollection from "./pages/CuratedCollection";
import QuotingPage from "./pages/QuotingPage";
import QuotePage from "./pages/QuotePage";
import InstallerMeasurement from "./pages/InstallerMeasurement";
import ViewMeasurements from "./pages/ViewMeasurements";
import { auth } from "./firebase";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { db, collection, getDocs } from "./firebase";
import RegisterUser from "./pages/RegisterUser";
import { onAuthStateChanged } from "firebase/auth";


const App = () => {
  const [categories, setCategories] = useState([]);

  // eslint-disable-next-line no-unused-vars
  const [user, setUser] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchCategories() {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);

        if (querySnapshot.empty) {
          console.warn("⚠️ No products found in Firestore.");
          return;
        }

        const categoriesSet = new Set();
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.category) {
            categoriesSet.add(data.category);
          }
        });

        setCategories(Array.from(categoriesSet));
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("🔥 Auth State Changed:", user);
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
      <Router>
        <MainRoutes categories={categories} />
      </Router>
    </AuthProvider>
  );
};

// ✅ Authentication-Based Routing Logic
const MainRoutes = ({ categories }) => {
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  const hideNavbarOnPages = ["/installer-measurement"];
  const shouldShowNavbar = !hideNavbarOnPages.includes(location.pathname);

  // ✅ Prevent flashing UI while checking auth state
  if (loading) return <div>Loading...</div>;

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/brochure" element={<BrochurePage />} />
        <Route path="/curatedcollection" element={<CuratedCollection />} />
        <Route path="/installer-measurement" element={<InstallerMeasurement />} />

        {/* ✅ Redirect to Sign-In if Not Authenticated */}
        <Route
          path="/"
          element={currentUser ? <ManageQuotesOrders /> : <Navigate to="/signin" />}
        />
        <Route
          path="/settings"
          element={currentUser ? <Settings /> : <Navigate to="/signin" />}
        />
        <Route
          path="/quote"
          element={currentUser ? <QuotingPage categories={categories} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/quote/:quoteId"
          element={currentUser ? <QuotePage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/quotingpage/:quoteId"
          element={currentUser ? <QuotingPage /> : <Navigate to="/signin" />}
        />
        <Route
          path="/quotingpage"
          element={currentUser ? <QuotingPage categories={categories} /> : <Navigate to="/signin" />}
        />
        <Route
          path="/viewmeasurements/:quoteId"
          element={currentUser ? <ViewMeasurements /> : <Navigate to="/signin" />}
        />

        {/* ✅ Protected Route for Admin Only */}
        <Route 
  path="/register-user"
  element={currentUser?.Role?.toLowerCase() === "admin" ? <RegisterUser /> : <Navigate to="/settings" />} 
/>


      </Routes>
    </>
  );
};

export default App;
