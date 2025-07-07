import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = ({ children }) => {
  const { currentUser, userData } = useAuth();

  if (!currentUser) return <Navigate to="/login" />;

  if (userData?.role === "supervisor") return <Navigate to="/supervisor" />;
  if (userData?.role === "staff") return <Navigate to="/staff" />;
  if (userData?.role === "admin") return <Navigate to="/admin" />;

  return null; // If no valid role found
};

export default PrivateRoute;
