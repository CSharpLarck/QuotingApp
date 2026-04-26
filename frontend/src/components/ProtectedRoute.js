import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/signin",
  unauthorizedRedirectTo = "/",
}) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;