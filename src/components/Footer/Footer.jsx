import React from "react";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-luxury-border bg-luxury-charcoal text-white/90">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex flex-col">
              <span className="font-serif text-2xl font-semibold uppercase tracking-[0.25em] text-white">Mohanlal</span>
              <span className="ml-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-sand">&amp; SONS</span>
            </Link>
            <p className="text-sm leading-7 text-white/60">
              Delivering trusted chartered accountancy, tax advisory, GST compliance, audit support, and business guidance with discretion and precision.
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-luxury-sand">Navigation</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/" className="transition-colors duration-300 hover:text-white">Home</Link></li>
              <li><Link to="/book" className="transition-colors duration-300 hover:text-white">Book Consultation</Link></li>
              <li><Link to="/contact" className="transition-colors duration-300 hover:text-white">Contact Us</Link></li>
              <li><Link to="/login" className="transition-colors duration-300 hover:text-white">Client Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-luxury-sand">Our Services</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>Chartered Accountancy</li>
              <li>Tax Planning &amp; Advisory</li>
              <li>GST &amp; Compliance Support</li>
              <li>Audit &amp; Business Advisory</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-luxury-sand">Advisory Office</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start space-x-3"><MapPin size={18} className="mt-0.5 shrink-0 text-luxury-sand" /><span>Connaught Place, New Delhi, 110001, India</span></li>
              <li className="flex items-center space-x-3"><Phone size={18} className="shrink-0 text-luxury-sand" /><span>+91 11 4151 3535</span></li>
              <li className="flex items-center space-x-3"><Mail size={18} className="shrink-0 text-luxury-sand" /><span>advisory@mohanlalandsons.com</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 text-xs font-light text-white/50 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Mohanlal &amp; Sons. All rights reserved.</p>
          <div className="mt-4 flex space-x-6 sm:mt-0">
            <a href="#" className="transition-colors duration-300 hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors duration-300 hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
