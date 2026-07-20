import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { submitBooking } from "../../firebase/firebase";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";

const servicesList = [
  { id: "tax", label: "Tax Planning & Advisory" },
  { id: "gst", label: "GST Compliance Support" },
  { id: "audit", label: "Audit & Financial Review" },
  { id: "business", label: "Business Advisory Consultation" },
  { id: "other", label: "General Advisory Enquiry" }
];

const timeSlots = [
  "11:00 AM - 01:00 PM",
  "01:00 PM - 03:00 PM",
  "03:00 PM - 05:00 PM",
  "05:00 PM - 07:00 PM"
];

const Book = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    preferredDate: "",
    preferredTime: "",
    message: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const overlayRef = useRef(null);
  const medallionRef = useRef(null);

  useEffect(() => {
    if (showSuccessAnimation && medallionRef.current && overlayRef.current) {
      // Clear scale and rotation, and animate to showcase 3D depth
      gsap.fromTo(
        medallionRef.current,
        {
          rotateY: 0,
          rotateX: -45,
          scale: 0.2,
          opacity: 0
        },
        {
          rotateY: 1080,
          rotateX: 0,
          scale: 1,
          opacity: 1,
          duration: 1.8,
          ease: "power3.out"
        }
      );

      // Subtle breathing floating animation
      gsap.to(medallionRef.current, {
        y: -8,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.8
      });

      // Exit transition
      const timeout = setTimeout(() => {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.6,
          ease: "power2.inOut",
          onComplete: () => {
            setShowSuccessAnimation(false);
            setSubmitStatus("success");
          }
        });
      }, 2400);

      return () => clearTimeout(timeout);
    }
  }, [showSuccessAnimation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full name is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{10,15}$/.test(formData.phone.replace(/\D/g, ""))) {
      errors.phone = "Please enter a valid phone number (10+ digits)";
    }
    
    if (!formData.service) errors.service = "Please select a service";
    if (!formData.preferredDate) errors.preferredDate = "Please choose a preferred date";
    if (!formData.preferredTime) errors.preferredTime = "Please pick a preferred time slot";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: "/book" } });
      return;
    }
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitBooking(formData);
      setShowSuccessAnimation(true); // Trigger 3D modal animation overlay
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "",
        preferredDate: "",
        preferredTime: "",
        message: ""
      });
    } catch (error) {
      console.error("Booking submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-luxury-sand/50 via-luxury-white/70 to-luxury-cream/60 px-4 py-16 sm:px-6 lg:px-8 relative flex items-center justify-center overflow-hidden">
      {/* Decorative Gold Accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[320px] h-[320px] rounded-full bg-luxury-gold/5 blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[360px] h-[360px] rounded-full bg-luxury-accent/5 blur-[90px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="w-full max-w-2xl bg-luxury-white rounded-[2rem] border border-luxury-border/60 p-8 sm:p-10 shadow-soft relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-gold">
            Appointment Desk
          </span>
          <h2 className="font-serif text-3xl font-bold uppercase tracking-wider text-luxury-charcoal">
            Book a Consultation
          </h2>
          <p className="mt-2 text-sm font-light text-luxury-muted max-w-md mx-auto">
            Schedule a confidential 1-on-1 briefing with our senior partners to plan your corporate governance, tax, or business strategy.
          </p>
          <div className="mx-auto mt-4 h-[1px] w-16 bg-luxury-gold/60" />
        </div>

        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-start space-x-3 rounded-xl border border-green-200 bg-green-50/50 p-4"
          >
            <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-luxury-charcoal">Consultation Request Received</h4>
              <p className="mt-1 text-xs text-luxury-muted">
                Your request has been successfully recorded. An advisory partner will contact you shortly to confirm the scheduled date and time.
              </p>
            </div>
          </motion.div>
        )}

        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-start space-x-3 rounded-xl border border-red-200 bg-red-50/50 p-4"
          >
            <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-luxury-charcoal">Submission Error</h4>
              <p className="mt-1 text-xs text-luxury-muted leading-relaxed">
                We encountered an error processing your reservation. If you are using a new Firebase project, make sure **Cloud Firestore** is initialized in your Firebase Console and its **Security Rules** allow public writes. Check your browser console (F12) for the exact error details.
              </p>
            </div>
          </motion.div>
        )}

        {/* Auth Notice Warning Box */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-start space-x-3 rounded-xl border border-yellow-200 bg-yellow-50/50 p-4"
          >
            <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-luxury-charcoal">Authentication Required</h4>
              <p className="mt-1 text-xs text-luxury-muted leading-relaxed">
                If you want to book a consultation, you need to sign in first. Please{" "}
                <Link to="/login" className="font-semibold text-luxury-gold underline hover:text-luxury-charcoal">
                  Sign In
                </Link>{" "}
                to unlock the booking desk.
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!user}
                placeholder={user ? "Mohan Lal" : "Sign in required"}
                className={`border ${
                  formErrors.name ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-cream/20 text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {formErrors.name && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.name}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!user}
                placeholder={user ? "mohan@example.com" : "Sign in required"}
                className={`border ${
                  formErrors.email ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-cream/20 text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {formErrors.email && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.email}</span>}
            </div>
          </div>

          {/* Phone & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!user}
                placeholder={user ? "+91 99999 88888" : "Sign in required"}
                className={`border ${
                  formErrors.phone ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-cream/20 text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {formErrors.phone && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.phone}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Select Service
              </label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                disabled={!user}
                className={`border ${
                  formErrors.service ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-white text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:bg-luxury-cream/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">-- Choose Advisory Service --</option>
                {servicesList.map(srv => (
                  <option key={srv.id} value={srv.label}>{srv.label}</option>
                ))}
              </select>
              {formErrors.service && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.service}</span>}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Preferred Date
              </label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                disabled={!user}
                min={new Date().toISOString().split("T")[0]}
                className={`border ${
                  formErrors.preferredDate ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-cream/20 text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              />
              {formErrors.preferredDate && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.preferredDate}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                Preferred Time Slot
              </label>
              <select
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                disabled={!user}
                className={`border ${
                  formErrors.preferredTime ? "border-red-400 focus:ring-red-100" : "border-luxury-border/60 focus:border-luxury-accent"
                } rounded-xl px-4 py-2.5 bg-luxury-white text-sm outline-none transition-all focus:ring-2 focus:ring-luxury-accent/10 disabled:bg-luxury-cream/10 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <option value="">-- Choose Time Slot --</option>
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
              {formErrors.preferredTime && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.preferredTime}</span>}
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
              Additional Notes
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              disabled={!user}
              rows={3}
              placeholder={user ? "Mention any details relevant to your advisory request, timeline, or documentation needs" : "Sign in required to schedule strategy bookings"}
              className="resize-none rounded-xl border border-luxury-border/60 bg-luxury-cream/20 px-4 py-2.5 text-sm outline-none transition-all focus:border-luxury-accent focus:ring-2 focus:ring-luxury-accent/10 disabled:opacity-60 disabled:cursor-not-allowed"
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-luxury-charcoal px-6 py-4 font-display text-xs font-bold uppercase tracking-widest text-white shadow-md transition-all duration-300 hover:bg-luxury-accent hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                  Submitting Request...
                </span>
              ) : !user ? (
                "Sign In to Book Consultation"
              ) : (
                "Submit Consultation Request"
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* 3D Gold Medallion Success Animation Overlay */}
      {showSuccessAnimation && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0B0B]/95 backdrop-blur-xl"
        >
          {/* 3D Perspective Container */}
          <div className="perspective-[1200px] flex flex-col items-center justify-center">
            {/* Medallion Card */}
            <div
              ref={medallionRef}
              className="w-44 h-44 rounded-full bg-gradient-to-tr from-luxury-accent via-[#E5E5E5] to-luxury-accent p-[3px] shadow-[0_0_60px_rgba(26,26,26,0.35)] flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Inner circle with premium dark metallic finish */}
              <div 
                className="w-full h-full rounded-full bg-gradient-to-tr from-[#0B0B0B] to-[#262626] flex items-center justify-center border border-luxury-accent/30 shadow-inner"
                style={{ transform: "translateZ(30px)" }}
              >
                {/* Glowing Gold circular checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 120 }}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-luxury-accent via-[#E5E5E5] to-luxury-accent text-luxury-charcoal shadow-lg"
                >
                  <svg 
                    className="w-10 h-10 stroke-[3] text-luxury-charcoal" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
            
            {/* Premium Messaging */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-10 space-y-2"
            >
              <h3 className="font-serif text-2xl font-bold uppercase tracking-[0.2em] text-white">
                Appointment Booked
              </h3>
              <p className="text-[10px] tracking-[0.35em] uppercase text-luxury-accent font-bold">
                Mohanlal &amp; Sons
              </p>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Book;
