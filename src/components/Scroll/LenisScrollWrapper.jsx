import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLocation } from "react-router-dom";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const LenisScrollWrapper = ({ children }) => {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Instantiate Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutQuart
      direction: "vertical",
      gestureDirection: "vertical",
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Direct ScrollTrigger to update when Lenis scrolls
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Integrate Lenis scroll loop into GSAP ticker
    const rafCallback = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);

    // Disable GSAP lag smoothing to keep scrolling animations fully synchronized
    gsap.ticker.lagSmoothing(0);

    // Keep reference in window for easy debug or external triggering
    window.lenis = lenis;

    return () => {
      lenis.destroy();
      gsap.ticker.remove(rafCallback);
      window.lenis = null;
    };
  }, []);

  // Scroll to top instantly when page route changes
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  return <>{children}</>;
};

export default LenisScrollWrapper;
