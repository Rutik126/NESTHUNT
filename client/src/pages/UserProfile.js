import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaHeart } from 'react-icons/fa'; // Import icons
import '../styles/UserProfile.css';
import { getImageUrl, getDefaultPropertyImage } from '../utils/imageUtils';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);

  const formatDate = (dateString) => {
    if (!dateString) {
      console.log('No date string provided');
      return 'Not available';
    }
    
    try {
      // Handle ISO date string
      const date = new Date(dateString);
      console.log('Parsed date:', date); // Debug log
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'Not available';
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      console.error('Original date string:', dateString);
      return 'Not available';
    }
  };

  useEffect(() => { 
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (!token || userType !== 'user') {
          navigate('/signin');
          return;
        }

        const response = await axios.get(`${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        console.log('Profile API Response:', response.data); // Debug log

        if (response.data.success && response.data.data?.user) {
          const userData = response.data.data.user;
          console.log('User Profile Data:', userData);
          console.log('Created At Date:', userData.createdAt); // Debug log for createdAt
          setProfile(userData);
          // Set saved properties from the profile data
          if (userData.savedProperties) {
            setSavedProperties(userData.savedProperties);
          }
        } else {
          setError('Invalid profile data received');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
        if (err.response?.status === 401) {
          navigate('/signin');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const removeSavedProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.delete(
        `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/remove-saved-property`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { propertyId }
        }
      );

      if (response.data.success) {
        setSavedProperties(prevProperties => 
          prevProperties.filter(prop => prop._id !== propertyId)
        );
      }
    } catch (err) {
      console.error('Error removing saved property:', err);
      alert(err.response?.data?.message || 'Error removing property');
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <h3>Error Loading Profile</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h3>Profile Not Found</h3>
        <p>Unable to load profile information</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className="user-profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={
                profile.profilePhoto
                  ? `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/${profile.profilePhoto.replace(/\\/g, '/')}`
                  : 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
              }
              alt="Profile"
              className="profile-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg';
              }}
            />
            <h2 className="profile-name">{profile.username}</h2>
          </div>
          <div className="profile-info">
            <div className="info-item"><strong>Email:</strong> {profile.email}</div>
            <div className="info-item"><strong>Phone:</strong> {profile.phone}</div>
            <div className="info-item"><strong>Member since:</strong> {formatDate(profile.createdAt)}</div>
          </div>
        </div>
      </div>

      <div className="saved-properties">
        <h3>Saved Properties <FaHeart className="heart-icon" /></h3>
        {savedProperties && savedProperties.length > 0 ? (
          <div className="saved-properties-grid">
            {savedProperties.map(property => (
              <div key={property._id} className="saved-property-card">
                <img 
                  src={getImageUrl(property.mainImage)} 
                  alt={property.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getDefaultPropertyImage();
                  }}
                />
                <div className="property-info">
                  <h4>{property.name}</h4>
                  <p>₹{property.price}/month</p>
                  <p>{property.type}</p>
                  <button 
                    className="remove-btn"
                    onClick={() => removeSavedProperty(property._id)}
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-saved-properties">
            <i className="fa-regular fa-folder-open"></i>
            <p>No saved properties yet</p>
          </div>
        )}
      </div>
    </>
  );
};

export default UserProfile;
