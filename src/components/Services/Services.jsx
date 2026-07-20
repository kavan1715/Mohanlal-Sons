import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Landmark, BadgeCheck, FileCheck2, TrendingUp, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const serviceItems = [
  {
    icon: <Landmark className="h-8 w-8 text-luxury-accent" />,
    title: "Chartered Accountancy",
    desc: "Reliable financial reporting, statutory compliance, and governance support for growing businesses.",
  },
  {
    icon: <BadgeCheck className="h-8 w-8 text-luxury-accent" />,
    title: "Tax Planning & Advisory",
    desc: "Strategic tax solutions designed to reduce liabilities while improving long-term resilience.",
  },
  {
    icon: <FileCheck2 className="h-8 w-8 text-luxury-accent" />,
    title: "GST & Compliance",
    desc: "End-to-end filings, reconciliations, and operational guidance that keep you audit-ready.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-luxury-accent" />,
    title: "Business Advisory",
    desc: "Practical counsel for expansion, restructuring, and performance planning with executive-level clarity.",
  },
];

const Services = () => {
  const containerRef = useRef(null);
  const introRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const introChildren = introRef.current ? Array.from(introRef.current.children) : [];

      gsap.fromTo(
        introChildren,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 96%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        cardsRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.14,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="overflow-hidden bg-luxury-cream px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div ref={introRef} className="mb-16 text-center">
          <span className="mb-3 block text-[10px] font-semibold uppercase tracking-[0.35em] text-luxury-accent">
            Expertise Across Every Critical Need
          </span>
          <h2 className="font-serif text-3xl font-semibold uppercase tracking-[0.08em] text-luxury-charcoal sm:text-4xl">
            Advisory services built for trust and growth.
          </h2>
          <div className="mx-auto mt-4 h-[2px] w-12 bg-luxury-accent" />
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {serviceItems.map((service, index) => (
            <motion.div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              whileHover={{ y: -8, rotateX: 2, rotateY: -2, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="group relative flex h-[320px] flex-col justify-between overflow-hidden rounded-[1.5rem] border border-luxury-border bg-luxury-cream/70 p-6 text-left transition-all duration-300 hover:border-luxury-accent/40 hover:shadow-soft"
            >
              <div>
                <div className="mb-6 inline-flex rounded-2xl bg-luxury-sand p-3 transition-colors duration-300 group-hover:bg-white">
                  {service.icon}
                </div>
                <h3 className="mb-3 text-lg font-semibold uppercase tracking-[0.22em] text-luxury-charcoal transition-colors duration-300 group-hover:text-luxury-accent">
                  {service.title}
                </h3>
                <p className="text-sm leading-7 text-luxury-muted">{service.desc}</p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-luxury-border pt-6">
                <Link to="/book" className="text-[10px] font-semibold uppercase tracking-[0.28em] text-luxury-charcoal transition-colors duration-300 group-hover:text-luxury-accent">
                  Book Consultation
                </Link>
                <div className="text-luxury-muted transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-luxury-accent">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
