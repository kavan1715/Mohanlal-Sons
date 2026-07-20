import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  signInWithGooglePopup, 
  signOutUser, 
  subscribeToAuthChanges,
  signInWithEmail,
  signUpWithEmail
} from "../firebase/firebase";

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  loading: true,
  login: async () => {},
  loginWithEmail: async (email, password) => {},
  registerWithEmail: async (email, password, displayName) => {},
  logout: async () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const loggedUser = await signInWithGooglePopup();
      setUser(loggedUser);
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await signInWithEmail(email, password);
      setUser(loggedUser);
    } catch (error) {
      console.error("AuthContext loginWithEmail Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (email, password, displayName) => {
    setLoading(true);
    try {
      const loggedUser = await signUpWithEmail(email, password, displayName);
      setUser(loggedUser);
    } catch (error) {
      console.error("AuthContext registerWithEmail Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error("AuthContext Logout Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAdmin: user?.role === "admin",
    loading,
    login,
    loginWithEmail,
    registerWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
