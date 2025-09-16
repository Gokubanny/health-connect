import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;

  // ✅ Only allow admin users - check the role from AuthContext
  if (role === "admin") {
    return children;
  }

  // ❌ If not admin, redirect to home
  return <Navigate to="/" replace />;
};

export default AdminRoute;