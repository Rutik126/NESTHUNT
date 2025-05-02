import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css';

const Search = () => {
  const [apartments, setApartments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApartments = async () => {
      const token = localStorage.getItem('token'); // Get token from localStorage
      if (!token) {
        navigate('/signin'); // Redirect to sign-in if no token
        return;
      }

      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/api/apartments`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        });
        setApartments(response.data);
      } catch (err) {
        setError('Failed to fetch properties.');
      }
    };

    fetchApartments();
  }, [navigate]);

  return (
    <div className="search">
      <h2>Search Properties</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {apartments.map((apartment) => (
          <li key={apartment._id}>
            <h3>{apartment.name}</h3>
            <p>{apartment.location}</p>
            <p>{apartment.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;