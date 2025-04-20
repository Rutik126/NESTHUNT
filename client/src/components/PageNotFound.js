import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PageNotFound.css';

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="page-not-found">
      <div className="error-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist or you don't have permission to access it.</p>
        
        <div className="navigation-buttons">
          <button onClick={() => navigate('/')} className="home-btn">
            Go to Home
          </button>
          <button onClick={() => navigate(-1)} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound; 