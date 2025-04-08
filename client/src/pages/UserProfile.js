import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaHeart } from 'react-icons/fa'; // Import icons
import '../styles/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);

  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userType = localStorage.getItem('userType');
        
        if (!token || userType !== 'user') {
          navigate('/signin');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });

        if (response.data.success && response.data.data.user) {
          setProfile(response.data.data.user);
        } else {
          setError('Invalid profile data received');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        if (err.response?.status === 401) {
          navigate('/signin');
        }
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
        'http://localhost:5000/api/user/remove-saved-property',
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { propertyId }
        }
      );

      if (response.data.success) {
        setSavedProperties(response.data.savedProperties);
      }
    } catch (err) {
      console.error('Error removing saved property:', err);
      alert(err.response?.data?.message || 'Error removing property');
    }
  };

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
    
        const response = await axios.get('http://localhost:5000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.data?.user?.savedProperties) {
          setSavedProperties(response.data.data.user.savedProperties);
        }
      } catch (err) {
        console.error('Error fetching saved properties:', err);
      }
    };
  
    if (profile) {
      fetchSavedProperties();
    }
  }, [profile]);

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
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
  <>
    <div className="user-profile-container">
      <div className="profile-card">
        <div className="profile-header">
        <img
          src={
            profile.profilePhoto
              ? `http://localhost:5000/${profile.profilePhoto.replace(/\\/g, '/')}`
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
          <div className="info-item"><strong>Member since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</div>
        </div>
      </div>
    </div>

    {/* Update the saved properties display */}
    <div className="saved-properties">
        <h3>Saved Properties <FaHeart className="heart-icon" /></h3>
        {savedProperties && savedProperties.length > 0 ? (
          <div className="saved-properties-grid">
            {savedProperties.map(property => (
              <div key={property._id} className="saved-property-card">
                <img 
                  src={property.mainImage} 
                  alt={property.name}
                  // onError={(e) => {
                  //   e.target.onerror = null;
                  //   e.target.src = '/default-property.jpg';
                  // }}
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
