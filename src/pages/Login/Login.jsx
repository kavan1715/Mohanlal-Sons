import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import GoogleSignInButton from "../../components/UI/GoogleSignInButton";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CalendarRange, Lock, Mail, User, AlertCircle } from "lucide-react";

const Login = () => {
  const { user, login, loginWithEmail, registerWithEmail, loading } = useAuth();
  const navigate = useNavigate();

  // Email Auth State
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect
    if (user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await login();
    } catch (err) {
      console.error("Login component error:", err);
      setError("Google Sign-In failed or popup was blocked.");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    if (isSignUp && !displayName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setSubmitLoading(false);
    try {
      if (isSignUp) {
        await registerWithEmail(email.trim(), password, displayName.trim());
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err) {
      console.error("Email auth component error:", err);
      const msg = err.message || "";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password") || msg.includes("auth/user-not-found")) {
        setError("Invalid email or password. Please verify credentials.");
      } else if (msg.includes("auth/email-already-in-use")) {
        setError("This email is already registered. Please sign in instead.");
      } else if (msg.includes("auth/weak-password")) {
        setError("Password must be at least 6 characters.");
      } else if (msg.includes("auth/invalid-email")) {
        setError("Please enter a valid email address.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  };

  const isFormLoading = loading || submitLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-luxury-sand/40 via-luxury-white/60 to-luxury-cream/40 px-4 sm:px-6 lg:px-8 py-16 relative overflow-hidden">
      {/* Decorative Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[350px] h-[350px] rounded-full border border-luxury-border/30 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-15%] w-[450px] h-[450px] rounded-full border border-luxury-border/30 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full space-y-6 bg-white/70 backdrop-blur-md p-8 sm:p-10 rounded-2xl border border-luxury-border/60 shadow-xl relative z-10 text-center"
      >
        <div>
          <span className="font-serif text-3xl font-bold tracking-widest text-luxury-charcoal uppercase block">
            Mohanlal
          </span>
          <span className="font-sans text-xs tracking-[0.4em] text-luxury-muted uppercase font-bold block mt-1">
            &amp; SONS
          </span>
          <h2 className="mt-6 text-xl font-display font-bold uppercase tracking-wider text-luxury-charcoal">
            {isSignUp ? "Create Account" : "Partner & Client Portal"}
          </h2>
          <p className="mt-1 text-xs text-luxury-muted font-light leading-relaxed">
            {isSignUp 
              ? "Register to coordinate private strategy consultations." 
              : "Sign in to manage appointments and access secure advisory panels."}
          </p>
        </div>

        {/* Error Notification Alert */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start space-x-2.5 rounded-xl border border-red-200 bg-red-50/50 p-3.5 text-left text-xs text-red-700"
            >
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4 text-left">
          
          {isSignUp && (
            <div className="flex flex-col">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Kavan Prajapati"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isFormLoading}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-sm outline-none transition-all focus:border-luxury-charcoal focus:ring-2 focus:ring-luxury-charcoal/5"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-muted">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                placeholder="client@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-sm outline-none transition-all focus:border-luxury-charcoal focus:ring-2 focus:ring-luxury-charcoal/5"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-1.5 ml-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-luxury-muted">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormLoading}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-border/60 rounded-xl text-sm outline-none transition-all focus:border-luxury-charcoal focus:ring-2 focus:ring-luxury-charcoal/5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isFormLoading}
            className="w-full mt-2 rounded-xl bg-luxury-charcoal px-5 py-3 font-display text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-luxury-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isFormLoading ? (
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            ) : isSignUp ? (
              "Register & Sign In"
            ) : (
              "Sign In with Email"
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="text-xs text-luxury-muted">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button 
                onClick={() => { setIsSignUp(false); setError(""); }}
                className="font-semibold text-luxury-gold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have a password account?{" "}
              <button 
                onClick={() => { setIsSignUp(true); setError(""); }}
                className="font-semibold text-luxury-gold hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>

        {/* Separator line */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-luxury-border/60"></div>
          <span className="flex-shrink mx-4 text-[9px] font-bold tracking-widest text-luxury-muted uppercase">OR CONTINUE WITH</span>
          <div className="flex-grow border-t border-luxury-border/60"></div>
        </div>

        {/* Google Authentication Section */}
        <div className="flex flex-col items-center justify-center space-y-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-luxury-muted"></div>
            </div>
          ) : (
            <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isFormLoading} />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
