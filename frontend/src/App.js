import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/NavBar/Navbar";
import ManageQuotesOrders from "./pages/ManageQuotesPage/ManageQuotesOrders";
import Resources from "./pages/ResourcesPage/Resources";
import Settings from "./pages/SettingsPage/Settings";
import SignIn from "./pages/SignInPage/SignIn";
import BrochurePage from "./pages/BrochurePage/BrochurePage";
import CuratedCollection from "./pages/CuratedCollectionPage/CuratedCollection";
import QuotingPage from "./pages/NewQuotePage/NewQuote";
import QuotePage from "./pages/QuotePage/QuotePage";
import RegisterUser from "./pages/RegisterUserPage/RegisterUser";

import { db } from "./firebase";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { collection, getDocs } from "firebase/firestore";

const App = () => {
  const [categories, setCategories] = useState([]);

  // Fetches product categories used by the quote creation workflow.
  // Authentication state is intentionally not handled here.
  // Auth state, user role, and loading state should come from AuthContext.
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
        console.error("Error fetching product categories:", error);
      }
    }

    fetchCategories();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <MainRoutes categories={categories} />
      </Router>
    </AuthProvider>
  );
};

const MainRoutes = ({ categories }) => {
  const location = useLocation();
  const { userRole, loading } = useAuth();

  // Hide the main navigation on standalone form-style pages.
  const hideNavbarOnPages = [
    "/release-liability",
    "/form-completion",
    "/installer-measurement",
  ];

  const shouldShowNavbar = !hideNavbarOnPages.includes(location.pathname);

  // Prevents protected routes from briefly rendering before auth state is resolved.
  if (loading) {
    return <div>Loading...</div>;
  }

  const isAuthenticated = Boolean(userRole);
  const isAdmin = userRole === "admin";

  return (
    <>
      {shouldShowNavbar && <Navbar userRole={userRole} />}

      <Routes>
        {/* Public routes that do not require authentication. */}
        <Route path="/resources" element={<Resources />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/brochure" element={<BrochurePage />} />
        <Route path="/curatedcollection" element={<CuratedCollection />} />
        <Route
          path="/quotingpage/edit/:quoteId/:editItemIndex"
          element={<QuotingPage />}
        />

        {/* Protected routes that require an authenticated user. */}
        <Route
          path="/"
          element={
            isAuthenticated ? <ManageQuotesOrders /> : <Navigate to="/signin" />
          }
        />

        <Route
          path="/settings"
          element={isAuthenticated ? <Settings /> : <Navigate to="/signin" />}
        />

        <Route
          path="/quote"
          element={
            isAuthenticated ? (
              <QuotingPage categories={categories} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        <Route
          path="/quote/:quoteId"
          element={isAuthenticated ? <QuotePage /> : <Navigate to="/signin" />}
        />

        <Route
          path="/quotingpage/:quoteId"
          element={
            isAuthenticated ? <QuotingPage /> : <Navigate to="/signin" />
          }
        />

        <Route
          path="/quotingpage"
          element={
            isAuthenticated ? (
              <QuotingPage categories={categories} />
            ) : (
              <Navigate to="/signin" />
            )
          }
        />

        {/* Admin-only route. Non-admin authenticated users are redirected to Settings. */}
        <Route
          path="/register-user"
          element={isAdmin ? <RegisterUser /> : <Navigate to="/settings" />}
        />
      </Routes>
    </>
  );
};

export default App;