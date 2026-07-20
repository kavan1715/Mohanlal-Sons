import React, { useState } from "react";
import { submitContactMessage } from "../../firebase/firebase";
import { Phone, Mail, MapPin, Clock, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Your name is required";
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please provide a valid email";
    }
    
    if (!formData.message.trim()) {
      errors.message = "Message content cannot be blank";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await submitContactMessage(formData);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Contact Form Submit error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream/30 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[0.3em] font-semibold text-luxury-gold uppercase block mb-3">
            Get In Touch
          </span>
          <h2 className="font-serif text-4xl font-semibold uppercase tracking-wider text-luxury-charcoal">
            Advisory &amp; Support
          </h2>
          <p className="mt-4 text-sm text-luxury-charcoal/60 max-w-xl mx-auto font-light leading-relaxed">
            Whether you need tax guidance, GST assistance, audit planning, or a strategic business review, our team is ready to support you with clear, confidential advice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Columns */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Contact Card */}
            <div className="bg-white p-8 rounded-xl border border-luxury-gold/15 shadow-md space-y-6">
              <h3 className="font-display text-lg font-semibold text-luxury-charcoal pb-3 border-b border-luxury-gold/10">
                Contact Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-luxury-sand text-luxury-gold rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal">Location</h4>
                    <p className="text-sm font-light text-luxury-charcoal/70 mt-1">
                      Connaught Place, New Delhi, 110001
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-luxury-sand text-luxury-gold rounded-lg">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal">Consultation Line</h4>
                    <p className="text-sm font-light text-luxury-charcoal/70 mt-1">
                      +91 11 4151 3535
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-luxury-sand text-luxury-gold rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal">Email Support</h4>
                    <p className="text-sm font-light text-luxury-charcoal/70 mt-1">
                      advisory@mohanlalandsons.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-luxury-sand text-luxury-gold rounded-lg">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal">Business Hours</h4>
                    <p className="text-sm font-light text-luxury-charcoal/70 mt-1">
                      Monday to Saturday: 10:00 AM - 7:00 PM (IST)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-xl border border-luxury-gold/15 shadow-md">
              <h3 className="font-display text-lg font-semibold text-luxury-charcoal mb-8 pb-3 border-b border-luxury-gold/10">
                Send a Message
              </h3>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3"
                >
                  <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-green-800">Message Received</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Thank you for reaching out. A member of our advisory team will review your enquiry and respond shortly.
                    </p>
                  </div>
                </motion.div>
              )}

              {submitStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
                >
                  <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-red-800">Submission Failed</h4>
                    <p className="text-xs text-red-700 mt-1">
                      We were unable to deliver your enquiry. Please check your connection or contact us directly by email.
                    </p>
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Aarav Mehta"
                    className={`border ${
                      formErrors.name ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:border-luxury-gold"
                    } rounded px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-luxury-gold/50 bg-luxury-cream/10 transition-all`}
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
                    placeholder="aarav@email.com"
                    className={`border ${
                      formErrors.email ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:border-luxury-gold"
                    } rounded px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-luxury-gold/50 bg-luxury-cream/10 transition-all`}
                  />
                  {formErrors.email && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.email}</span>}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold uppercase tracking-wider text-luxury-charcoal/80 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Share your tax, GST, audit, or business advisory enquiry..."
                    className={`border ${
                      formErrors.message ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:border-luxury-gold"
                    } rounded px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-luxury-gold/50 bg-luxury-cream/10 transition-all resize-none`}
                  ></textarea>
                  {formErrors.message && <span className="text-red-500 text-[10px] mt-1 font-medium">{formErrors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-luxury-charcoal text-white hover:bg-luxury-gold font-display text-xs tracking-widest uppercase font-semibold py-3.5 px-6 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
