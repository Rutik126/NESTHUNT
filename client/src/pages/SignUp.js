import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/SignUp.css';

const SignUp = ({ setIsLoggedIn }) => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    profilePhoto: null,
  });

  const [roomOwnerData, setRoomOwnerData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    profilePhoto: null,
    location: ''
  });

  const [error, setError] = useState('');
  const [isUser, setIsUser] = useState(true);
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [otpSent, setOtpSent] = useState('');
  const [showOtpField, setShowOtpField] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomOwnerChange = (e) => {
    const { name, value } = e.target;
    setRoomOwnerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, isUserForm) => {
    const file = e.target.files[0];
    if (isUserForm) {
      setUserData((prev) => ({ ...prev, profilePhoto: file }));
    } else {
      setRoomOwnerData((prev) => ({ ...prev, profilePhoto: file }));
    }
  };

  const sendOtp = async () => {
    try {
      const data = isUser ? userData : roomOwnerData;
      const identifier = data.phone || data.email;
      
      if (!identifier) {
        setError('Phone or email is required');
        return;
      }

      const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
        phone: data.phone,
        email: data.email
      });

      setOtpSentTo(identifier);
      setOtpSent(true);
      setShowOtpField(true);
      setCountdown(300); // 5 minutes
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      const data = isUser ? userData : roomOwnerData;
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
        phone: data.phone,
        email: data.email,
        otp
      });

      setIsVerified(true);
      setShowOtpField(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    }
  };

  const handleSubmit = async (e, isUserForm) => {
    e.preventDefault();
    try {
      if (!isVerified) {
        setError('Please verify your phone/email with OTP first');
        return;
      }

      const formData = new FormData();
      const data = isUserForm ? userData : roomOwnerData;

      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      if (!isUserForm) {
        formData.append('location', data.location);
      }
      if (data.profilePhoto) {
        formData.append('profilePhoto', data.profilePhoto);
      }

      const response = await axios.post(
        `http://localhost:5000/api/auth/register${isUserForm ? '' : '-roomowner'}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setIsLoggedIn(true);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Error during registration:', err.response?.data || err.message);
    }
  };

  const renderOtpSection = () => (
    <div className="otp-section">
      {!otpSent ? (
        <button type="button" className="otp-btn" onClick={sendOtp}>
          Send OTP
        </button>
      ) : (
        <>
          {showOtpField && (
            <>
              <p className="otp-sent-msg">OTP sent to {otpSentTo}</p>
              <input
                type="text"
                className="input-field"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button type="button" className="otp-btn" onClick={verifyOtp}>
                Verify OTP
              </button>
              {countdown > 0 && (
                <p className="countdown">
                  OTP expires in: {Math.floor(countdown / 60)}:
                  {countdown % 60 < 10 ? '0' : ''}{countdown % 60}
                </p>
              )}
              <button 
                type="button" 
                className="resend-btn" 
                onClick={sendOtp}
                disabled={countdown > 0}
              >
                Resend OTP {countdown > 0 && `(in ${countdown}s)`}
              </button>
            </>
          )}
          {isVerified && (
            <p className="verified-text">✓ Verified successfully</p>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className='background'>
      <div className="form-box">
        <div className="button-box">
          <div id="btn" style={{ left: isUser ? '0' : '150px' }}></div>
          <button type="button" className="toggle-btn" onClick={() => setIsUser(true)}>
            User
          </button>
          <button type="button" className="toggle-btn" onClick={() => setIsUser(false)}>
            RoomOwner
          </button>
        </div>

        {/* User Form */}
        <form
          onSubmit={(e) => handleSubmit(e, true)}
          className="input-group"
          id="login"
          style={{ left: isUser ? '50px' : '-400px' }}
        >
          <div className="form-control">
            <label htmlFor="user-image" className="profile-photo-label">
              <img
                src={
                  userData.profilePhoto
                    ? URL.createObjectURL(userData.profilePhoto)
                    : 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
                }
                alt="Upload Profile"
                className="profile-photo"
              />
            </label>
            <input
              id="user-image"
              type="file"
              name="profilePhoto"
              className="file-input"
              onChange={(e) => handleFileChange(e, true)}
              accept="image/*"
              required
            />
            <label className="header">Choose Profile Photo</label>
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="User ID"
            name="username"
            value={userData.username}
            onChange={handleUserChange}
            required
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email ID"
            name="email"
            value={userData.email}
            onChange={handleUserChange}
            required
          />
          <input
            type="tel"
            className="input-field"
             placeholder="Phone (e.g., +1234567890)"
            name="phone"
            value={userData.phone}
            onChange={handleUserChange}
            required
          />
          
          {renderOtpSection()}
          
          <input
            type="password"
            className="input-field"
            placeholder="Enter Password"
            name="password"
            value={userData.password}
            onChange={handleUserChange}
            required
          />
          <input type="checkbox" className="check-box" required />
          <span>I agree to the terms & conditions</span>
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>

        {/* RoomOwner Form */}
        <form
          onSubmit={(e) => handleSubmit(e, false)}
          className="input-group"
          id="register"
          style={{ left: isUser ? '450px' : '50px' }}
        >
          <div className="form-control">
            <label htmlFor="roomowner-image" className="profile-photo-label">
              <img
                src={
                  roomOwnerData.profilePhoto
                    ? URL.createObjectURL(roomOwnerData.profilePhoto)
                    : 'https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
                }
                alt="Upload Profile"
                className="profile-photo"
              />
            </label>
            <input
              id="roomowner-image"
              type="file"
              name="profilePhoto"
              className="file-input"
              onChange={(e) => handleFileChange(e, false)}
              accept="image/*"
              required
            />
            <label className="header">Choose Profile Photo</label>
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="Owner ID"
            name="username"
            value={roomOwnerData.username}
            onChange={handleRoomOwnerChange}
            required
          />
          <input
            type="email"
            className="input-field"
            placeholder="Email ID"
            name="email"
            value={roomOwnerData.email}
            onChange={handleRoomOwnerChange}
            required
          />
          <input
            type="tel"
            className="input-field"
             placeholder="Phone (e.g., +1234567890)"
            name="phone"
            value={roomOwnerData.phone}
            onChange={handleRoomOwnerChange}
            required
          />
          
            {renderOtpSection()}
          <input
            type="text"
            className="input-field"
            placeholder="Location"
            name="location"
            value={roomOwnerData.location}
            onChange={handleRoomOwnerChange}
            required
          />
          
          
          <input
            type="password"
            className="input-field"
            placeholder="Enter Password"
            name="password"
            value={roomOwnerData.password}
            onChange={handleRoomOwnerChange}
            required
          />
          <input type="checkbox" className="check-box" required />
          <span>I agree to the terms & conditions</span>
          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default SignUp;