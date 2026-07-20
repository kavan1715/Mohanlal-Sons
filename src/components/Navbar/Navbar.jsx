import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const renderLabel = (label) =>
  label.split(" ").map((word, index) => (
    <span key={`${word}-${index}`} className="word">
      {word}
    </span>
  ));

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Book Consultation", path: "/book" },
    { name: "Contact Us", path: "/contact" },
  ];

  return (
    <nav className={`nav fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-luxury-border bg-white/80 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}>
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex flex-col">
            <span className="font-serif text-xl font-semibold uppercase tracking-[0.25em] text-luxury-charcoal sm:text-2xl">
              Mohanlal
            </span>
            <span className="ml-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-accent">
              &amp; SONS
            </span>
          </Link>
        </div>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `nav-link text-[11px] font-semibold uppercase tracking-[0.3em] transition-all duration-300 ${
                  isActive ? "text-luxury-charcoal" : "text-luxury-muted hover:text-luxury-charcoal"
                }`
              }
            >
              {renderLabel(link.name)}
            </NavLink>
          ))}

          {user && !isAdmin && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `nav-link text-[11px] font-semibold uppercase tracking-[0.3em] transition-all duration-300 ${
                  isActive ? "text-luxury-charcoal" : "text-luxury-muted hover:text-luxury-charcoal"
                }`
              }
            >
              {renderLabel("Dashboard")}
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-link text-[11px] font-semibold uppercase tracking-[0.3em] transition-all duration-300 ${
                  isActive ? "text-luxury-charcoal" : "text-luxury-muted hover:text-luxury-charcoal"
                }`
              }
            >
              {renderLabel("Admin Panel")}
            </NavLink>
          )}
        </div>

        <div className="hidden items-center space-x-6 md:flex">
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-luxury-charcoal">
                Hi, {user.role === "admin" ? "Admin" : (user.displayName ? user.displayName.split(" ")[0] : "User")}
              </span>
              <button onClick={handleLogout} className="rounded-full border border-luxury-border bg-transparent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-luxury-charcoal transition-all duration-300 hover:bg-luxury-charcoal hover:text-white">
                Log Out
              </button>
            </div>
          ) : (
            <Link to="/login" className="rounded-full border border-luxury-border bg-luxury-charcoal px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white transition-all duration-300 hover:bg-luxury-muted">
              Sign In
            </Link>
          )}
        </div>

        <div className="flex items-center md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="rounded-full p-2 text-luxury-charcoal transition-colors duration-300 hover:bg-white/70">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="border-t border-luxury-border bg-white/95 backdrop-blur-md md:hidden">
            <div className="space-y-3 px-4 pb-6 pt-3 shadow-inner">
              {navLinks.map((link) => (
                <NavLink key={link.name} to={link.path} onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block py-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${isActive ? "text-luxury-charcoal" : "text-luxury-muted"}`}>
                  {link.name}
                </NavLink>
              ))}

              {user && !isAdmin && (
                <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `block py-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${isActive ? "text-luxury-charcoal" : "text-luxury-muted"}`}>
                  Dashboard
                </NavLink>
              )}

              {isAdmin && (
                <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-600">
                  <LayoutDashboard size={18} />
                  Admin Panel
                </NavLink>
              )}

              <div className="border-t border-luxury-border pt-4">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-center text-xs font-medium text-luxury-muted">
                      Logged in as {user.role === "admin" ? "Admin" : user.displayName}
                    </p>
                    <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full rounded-full border border-red-200 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-red-600 hover:bg-red-50/50 transition-colors">
                      Log Out
                    </button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block w-full rounded-full bg-luxury-charcoal px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white">
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
