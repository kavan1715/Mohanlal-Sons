import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
          <p className="font-display text-sm tracking-widest text-luxury-gold uppercase animate-pulse">Verifying Credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    // If logged in but not admin, redirect to home page, otherwise to login
    return <Navigate to={user ? "/" : "/login"} replace />;
  }

  return children;
};

export default AdminRoute;
