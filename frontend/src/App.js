import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/NavBar/Navbar";
import ManageQuotesOrders from "./pages/ManageQuotesPage/ManageQuotesOrders";
import Resources from "./pages/ResourcesPage/Resources";
import Settings from "./pages/SettingsPage/Settings";
import SignIn from "./pages/SignInPage/SignIn";
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

  return (
    <>
      {shouldShowNavbar && <Navbar userRole={userRole} />}

      <Routes>
  {/* Public routes that do not require authentication. */}
  <Route path="/resources" element={<Resources />} />
  <Route path="/signin" element={<SignIn />} />
  <Route
    path="/quotingpage/edit/:quoteId/:editItemIndex"
    element={<QuotingPage />}
  />

  {/* Protected routes that require an authenticated user. */}
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <ManageQuotesOrders />
      </ProtectedRoute>
    }
  />

  <Route
    path="/settings"
    element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    }
  />

  <Route
    path="/quote"
    element={
      <ProtectedRoute>
        <QuotingPage categories={categories} />
      </ProtectedRoute>
    }
  />

  <Route
    path="/quote/:quoteId"
    element={
      <ProtectedRoute>
        <QuotePage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/quotingpage/:quoteId"
    element={
      <ProtectedRoute>
        <QuotingPage />
      </ProtectedRoute>
    }
  />

  <Route
    path="/quotingpage"
    element={
      <ProtectedRoute>
        <QuotingPage categories={categories} />
      </ProtectedRoute>
    }
  />

  {/* Admin-only route. */}
<Route
  path="/register-user"
  element={
    <ProtectedRoute allowedRoles={["admin"]} unauthorizedRedirectTo="/settings">
      <RegisterUser />
    </ProtectedRoute>
  }
/>
</Routes>
    </>
  );
};

export default App;