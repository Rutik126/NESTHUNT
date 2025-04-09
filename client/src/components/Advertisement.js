import React from 'react';
import '../styles/Advertisement.css';

const Advertisement = () => {
  return (
    <div className="advertisement-page">
      {/* Showcase Hero Section */}
      {/* <section className="showcase">
        <div className="showcase-content">
          <h1>Rent your spare room</h1>
          <p>Join our trusted host community and earn by sharing your unused space. Flexible stays, verified guests, and full control over your property.</p>
        </div>
      </section> */}

      {/* Info Section */}
      <section className="info-section">
        <h2>Earn Money Your Way</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Who stays</h3>
            <p>All guests are verified. Advertise your space to students, working professionals, and travelers.</p>
          </div>
          <div className="info-card">
            <h3>How long</h3>
            <p>Let guests book for days, weeks, or months — your choice. You set the rules for stay duration.</p>
          </div>
          <div className="info-card">
            <h3>Right price</h3>
            <p>You decide your own pricing. Offer competitive rates and maximize your income from rentals.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Hosts Love Us</h2>
          <div className="features-grid">
            <div className="feature">
              <i className="fas fa-calendar-alt"></i>
              <p>Short and Long Term Stays</p>
            </div>
            <div className="feature">
              <i className="fas fa-wallet"></i>
              <p>Deposit Payment Option</p>
            </div>
            <div className="feature">
              <i className="fas fa-globe"></i>
              <p>Guests from 160+ Countries</p>
            </div>
            <div className="feature">
              <i className="fas fa-headset"></i>
              <p>Excellent Customer Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Advertisement;