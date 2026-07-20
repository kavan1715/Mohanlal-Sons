import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Landmark, ShieldCheck, TrendingUp, FileCheck2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const highlights = [
  {
    icon: <Landmark className="h-5 w-5" />,
    title: "Sound Governance",
    text: "Practical structures that create financial clarity for boards and founders.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Regulatory Confidence",
    text: "Compliance-led support that keeps your operations secure and efficient.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    title: "Growth Strategy",
    text: "Actionable insight for expansion, value protection, and sustainable performance.",
  },
  {
    icon: <FileCheck2 className="h-5 w-5" />,
    title: "Clarity & Control",
    text: "Transparent reporting and dependable support for every audit and filing cycle.",
  },
];

const About = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        panelRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 92%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.fromTo(
        textRef.current.children,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 86%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about-section overflow-hidden bg-luxury-white/60 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div ref={textRef} className="space-y-6 text-left">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.35em] text-luxury-accent">
            About Mohanlal &amp; Sons
          </span>
          <h2 className="font-serif text-3xl font-semibold uppercase leading-tight tracking-[0.08em] text-luxury-charcoal sm:text-4xl">
            A trusted authority for financial clarity and confident growth.
          </h2>
          <div className="mb-6 h-[2px] w-16 bg-luxury-accent" />
          <p className="text-base leading-8 text-luxury-muted">
            We partner with founders, executives, and family-run enterprises who value disciplined financial guidance, compliant operations, and clear strategic direction.
          </p>
          <p className="text-sm leading-8 text-luxury-muted">
            From statutory compliance and tax efficiency to audit readiness and long-term business planning, our approach is deliberate, discreet, and deeply informed.
          </p>

          <div className="grid gap-6 border-t border-luxury-border pt-6 sm:grid-cols-3">
            <div>
              <h4 className="font-serif text-2xl font-semibold text-luxury-charcoal sm:text-3xl">25+</h4>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-luxury-muted">Years of Practice</p>
            </div>
            <div>
              <h4 className="font-serif text-2xl font-semibold text-luxury-charcoal sm:text-3xl">500+</h4>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-luxury-muted">Clients Guided</p>
            </div>
            <div>
              <h4 className="font-serif text-2xl font-semibold text-luxury-charcoal sm:text-3xl">100%</h4>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-luxury-muted">Confidential Service</p>
            </div>
          </div>
        </div>

        <div ref={panelRef} className="rounded-[2rem] border border-luxury-border bg-white p-8 shadow-soft">
          <div className="space-y-4">
            {highlights.map((item, index) => (
              <div key={index} className="flex gap-4 rounded-2xl border border-luxury-border bg-luxury-cream/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-sm">
                <div className="mt-0.5 rounded-xl bg-luxury-sand p-2 text-luxury-accent">{item.icon}</div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-luxury-charcoal">{item.title}</h3>
                  <p className="mt-1 text-sm leading-7 text-luxury-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
