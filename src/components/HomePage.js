import React from 'react';
import HeroSection from './HeroSection';
import HowItWorks from './HowItWorks/HowItWorks';
import OurTeam from './OurTeam/OurTeam';
import PricingPlans from './PricePlans/PricingPlans';
import LatestArticles from './LatestArticles/LatestArticles';
import FAQs from './FAQs/FAQs';
import Contact from './Contact/Contact';
import End from './end/End';

const HomePage = ({ onHRClick, onCandidateClick }) => {
  return (
    <>
      <section id="hero">
        <HeroSection onHRClick={onHRClick} onCandidateClick={onCandidateClick} />
      </section>
      <section id="how-it-works"><HowItWorks /></section>
      <section id="team"><OurTeam /></section>
      <section id="pricing"><PricingPlans /></section>
      <section id="articles"><LatestArticles /></section>
      <section id="faqs"><FAQs /></section>
      <section id="contact"><Contact /></section>
      <section id="end"><End /></section>
    </>
  );
};

export default HomePage;
