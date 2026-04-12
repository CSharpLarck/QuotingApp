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
import { auth, db } from "./firebase";
// eslint-disable-next-line
import { AuthProvider, useAuth } from "./context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import RegisterUser from "./pages/RegisterUser";
import { onAuthStateChanged } from "firebase/auth";
import ReleaseLiability from "./pages/ReleaseLiability";
import FormCompletion from "./pages/FormCompletion";


const App = () => {
  const [categories, setCategories] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line
  const [user, setUser] = useState(null);

  // ✅ Fetch product categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);
        if (!querySnapshot.empty) {
          const categoriesSet = new Set();
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.category) {
              categoriesSet.add(data.category);
            }
          });
          setCategories(Array.from(categoriesSet));
        }
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      }
    }
    fetchCategories();
  }, []);

  // ✅ Handle authentication state & fetch user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("Email", "==", user.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setUserRole(userData?.Role?.toLowerCase());
            localStorage.setItem("userData", JSON.stringify(userData));
          } else {
            console.warn("⚠️ No matching Firestore user found.");
          }
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <MainRoutes categories={categories} userRole={userRole} loading={loading} />
      </Router>
    </AuthProvider>
  );
};

// ✅ Main Routing Component
const MainRoutes = ({ categories, userRole, loading }) => {
  const location = useLocation();
  
  // ✅ Pages where the Navbar should NOT be displayed
  const hideNavbarOnPages = ["/release-liability", "/form-completion", "/installer-measurement"];
  const shouldShowNavbar = !hideNavbarOnPages.includes(location.pathname);

  // ✅ Prevent flashing UI while checking auth state
  if (loading) return <div>Loading...</div>;

  const isAdmin = userRole === "admin";

  return (
    <>
      {shouldShowNavbar && <Navbar userRole={userRole} />}
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/brochure" element={<BrochurePage />} />
        <Route path="/curatedcollection" element={<CuratedCollection />} />
        <Route path="/installer-measurement" element={<InstallerMeasurement />} />
        <Route path="/release-liability" element={<ReleaseLiability />} />
        <Route path="/form-completion" element={<FormCompletion />} />
        <Route path="/quotingpage/edit/:quoteId/:editItemIndex" element={<QuotingPage />} />


        {/* ✅ Protected Routes (Require Authentication) */}
        <Route path="/" element={userRole ? <ManageQuotesOrders /> : <Navigate to="/signin" />} />
        <Route path="/settings" element={userRole ? <Settings /> : <Navigate to="/signin" />} />
        <Route path="/quote" element={userRole ? <QuotingPage categories={categories} /> : <Navigate to="/signin" />} />
        <Route path="/quote/:quoteId" element={userRole ? <QuotePage /> : <Navigate to="/signin" />} />
        <Route path="/quotingpage/:quoteId" element={userRole ? <QuotingPage /> : <Navigate to="/signin" />} />
        <Route path="/quotingpage" element={userRole ? <QuotingPage categories={categories} /> : <Navigate to="/signin" />} />
        <Route path="/viewmeasurements/:quoteId" element={userRole ? <ViewMeasurements /> : <Navigate to="/signin" />} />

        {/* ✅ Admin-Only Routes */}
        <Route path="/register-user" element={isAdmin ? <RegisterUser /> : <Navigate to="/settings" />} />
      </Routes>
    </>
  );
};

export default App;
