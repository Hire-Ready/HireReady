import React from 'react';
import './PricingPlans.css';

const PricingPlans = () => {
  return (
    <section className="pricing-plans">
      <h2>Pricing Plans</h2>
      <div className="plans-container">
        <div className="plan-card">
          <h3>Student Free</h3>
          <p className="price">$0/month</p>
          <ul>
            <li>Basic interview practice</li>
            <li>Community support</li>
          </ul>
          <button className="get-started-btn">Get Started</button>
        </div>
        <div className="plan-card highlighted">
          <h3>HR Pro</h3>
          <p className="price">$49/month</p>
          <ul>
            <li>Unlimited jobs</li>
            <li>AI matching</li>
            <li>Priority support</li>
          </ul>
          <button className="get-started-btn">Get Started</button>
        </div>
        <div className="plan-card">
          <h3>Enterprise</h3>
          <p className="price">$ Custom</p>
          <ul>
            <li>Custom solutions</li>
            <li>Dedicated support</li>
            <li>API access</li>
          </ul>
          <button className="get-started-btn">Get Started</button>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;