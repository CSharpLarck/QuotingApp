import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Ensure AuthContext is used

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/signin" replace />; // ✅ Redirect to Sign-in if not authenticated
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />; // ✅ Redirect unauthorized users
  }

  return children;
};

export default ProtectedRoute;
