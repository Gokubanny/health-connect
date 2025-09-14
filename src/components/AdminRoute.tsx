import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/auth" replace />;

  // ✅ Only allow admin users
  if (user.user_metadata?.role === "admin") {
    return children; // let admin access the page
  }

  // ❌ if not admin, redirect them elsewhere (maybe home or unauthorized page)
  return <Navigate to="/" replace />;
};

export default AdminRoute;
