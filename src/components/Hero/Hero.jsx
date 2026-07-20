import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const heroRef = useRef(null);
  const nameplateRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Elegant entrance animation on page load
      gsap.fromTo(
        nameplateRef.current,
        { opacity: 0, y: 30, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.6,
          ease: "power3.out",
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="hero relative overflow-hidden bg-luxury-cream text-luxury-charcoal">
      <div className="hero-inner hero-scene px-6 py-24 sm:px-8 lg:px-12">
        <div ref={nameplateRef} className="nameplate-frame relative z-10">
          <div className="nameplate font-serif text-[clamp(3rem,10vw,7.5rem)] font-semibold uppercase leading-[0.9] tracking-[0.16em] text-luxury-charcoal">
            MOHANLAL <span className="amp">&amp;</span> SONS
          </div>
        </div>

        <div className="scroll-cue">
          Scroll
        </div>
      </div>
    </section>
  );
};

export default Hero;
