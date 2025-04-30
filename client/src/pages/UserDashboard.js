import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/UserDashboard.css';
// import '../styles/RoomOwnerDashboard.css';

const UserDashboard = () => {
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const fetchUserProperty = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/user/property`, {
          withCredentials: true,
        });
        if (response.data.property) {
          setProperty(response.data.property);
        }
      } catch (err) {
        console.error('Error fetching property:', err);
      }
    };

    fetchUserProperty();
  }, []);

  return (
    <div className="user-dashboard">
      <h1>Your Living Property</h1>
      {property ? (
        <div className="property-details">
          <h2>{property.title}</h2>
          <p>{property.description}</p>
          <p><strong>Price:</strong> ${property.price}</p>
          <p><strong>Location:</strong> {property.location}</p>
          <img src={`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/${property.image}`} alt={property.title} />
        </div>
      ) : (
        <p>No property purchased yet.</p>
      )}
    </div>
  );
};

export default UserDashboard;