import React, { useState } from "react";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonialsData = [
  {
    name: "Kunal Sharma",
    role: "Managing Director, Mid-Market Manufacturing Group",
    review: "The team brought structure to our financial reporting and helped us navigate a complex tax transition with calm, practical advice. Their responsiveness and depth stood out immediately.",
    rating: 5,
  },
  {
    name: "Aditi Rao",
    role: "Founder, Growth-Stage Consultancy",
    review: "We needed a partner who could combine compliance accuracy with business insight. Mohanlal & Sons delivered both, and the experience felt genuinely strategic rather than transactional.",
    rating: 5,
  },
  {
    name: "Raghav Mehta",
    role: "CFO, Family-Owned Enterprise",
    review: "Their guidance has given us much stronger control over audit readiness and cash flow planning. Every engagement feels thoughtful, timely, and exceptionally well managed.",
    rating: 5,
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length);
  };

  const active = testimonialsData[activeIndex];

  return (
    <section className="overflow-hidden bg-luxury-white/60 px-4 py-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-12 text-center">
          <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.35em] text-luxury-accent">
            Partnerships &amp; Impact
          </span>
          <h2 className="font-serif text-3xl font-semibold uppercase tracking-[0.08em] text-luxury-charcoal sm:text-4xl">
            Client Success Stories
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-12 bg-luxury-accent" />
        </div>

        <div className="mb-6 flex justify-center text-luxury-accent/40">
          <Quote size={56} className="rotate-180" />
        </div>

        <div className="flex min-h-[220px] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={activeIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-6">
              <div className="flex justify-center space-x-1">
                {[...Array(active.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-luxury-accent text-luxury-accent" />
                ))}
              </div>

              <p className="mx-auto max-w-2xl font-serif text-lg leading-8 text-luxury-muted sm:text-xl">
                &ldquo;{active.review}&rdquo;
              </p>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-[0.26em] text-luxury-charcoal">{active.name}</h4>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-luxury-accent">{active.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center space-x-4">
          <button onClick={handlePrev} className="rounded-full border border-luxury-border p-2 text-luxury-charcoal transition-all duration-300 hover:border-luxury-accent hover:bg-luxury-accent hover:text-white" title="Previous Story">
            <ArrowLeft size={16} />
          </button>
          <button onClick={handleNext} className="rounded-full border border-luxury-border p-2 text-luxury-charcoal transition-all duration-300 hover:border-luxury-accent hover:bg-luxury-accent hover:text-white" title="Next Story">
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
