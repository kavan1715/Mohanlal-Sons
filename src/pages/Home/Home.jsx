import React from "react";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import Services from "../../components/Services/Services";
import Testimonials from "../../components/Testimonials/Testimonials";

const Home = () => {
  return (
    <div className="relative">
      <Hero />
      <About />
      <Services />
      <Testimonials />
    </div>
  );
};

export default Home;
