import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/SignIn.css';


const SignIn = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user'); // Default to 'user'
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/login`, {
        email,
        password,
        userType, // Include userType in the request
      }, { withCredentials: true });
  
      if (response.status === 200) {
        setIsLoggedIn(true);
        localStorage.setItem('token', response.data.token); // Store the token in localStorage
        localStorage.setItem('userType', response.data.userType); // Store userType in localStorage
        navigate('/'); // Redirect to home page
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
        (userType === 'user' ? 'User not found!' : 'Roomowner not found!');
      setError(errorMessage);
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className='background'>
      <div className='form-box'>
        <div className='button-box'>
          <div id='btn' style={{ left: userType === 'user' ? '0' : '150px' }}></div>
          <button
            type='button'
            className='toggle-btn'
            onClick={() => setUserType('user')}
          >
            User
          </button>
          <button
            type='button'
            className='toggle-btn'
            onClick={() => setUserType('roomowner')}
          >
            RoomOwner
          </button>
        </div>
        {error && <p className='error'>{error}</p>}
        <form onSubmit={handleSubmit} className='input-group' id='login' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', marginTop: '10vh' }}>
          <input
            type='email'
            className='input-field'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type='password'
            className='input-field'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type='submit' className='submit-btn'>Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
