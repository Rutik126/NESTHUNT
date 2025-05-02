import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Header.css';

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const userType = localStorage.getItem('userType');
        const endpoint = userType === 'user' 
          ? '/api/user/profile' 
          : '/api/roomowner/profile';

        const response = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setUserData(userType === 'user' ? response.data : response.data.roomOwner);
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };

    if (isLoggedIn) {
      fetchUserData();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/logout`, {}, { withCredentials: true });
      setIsLoggedIn(false);
      localStorage.removeItem('token');
      localStorage.removeItem('userType');
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleProfileClick = () => {
    const userType = localStorage.getItem('userType');
    navigate(userType === 'user' ? '/profile' : '/roomowner-profile');
  };

  return (
    <header>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <h1>NESTHUNT</h1>
      </Link>
      <nav>
        {isLoggedIn ? (
          <div className="user-profile">
            <div className="profile-photo-container" onClick={handleProfileClick}>
            <img
              src={
                userData?.profilePhoto
                  ? `${import.meta.env.VITE_BACKEND_BASEURL}/${userData.profilePhoto.replace(/\\/g, '/')}`
                  : 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
              }
              alt="Profile"
              className="profile-photo"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg';
              }}
            />
            </div>
            <button className="logout" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <>
            <a href="/signin">Sign In</a>
            <a href="/signup">Sign Up</a>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;