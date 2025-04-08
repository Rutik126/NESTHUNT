import React from 'react';
import '../styles/Banner.css';

const Banner = () => {
  return (
    <div className="hero-section">
      <h1>Welcome to NESTHUNT</h1>
      <h2>Discover Your Ideal Room near Ashta City</h2>
      {/* <br /> */}
     <p>Comfortable, Budget-Friendly Stays for Students & Employees</p>
      <div className="search-bar">
        <input type="text" placeholder="Search by Location or Room Type" />
        <button>Search</button>
      </div>
    </div>
  );
};

export default Banner;
