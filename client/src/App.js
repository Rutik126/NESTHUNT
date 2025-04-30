import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import TopApartments from './components/TopApartments';
import Footer from './components/Footer';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import UserProfile from './pages/UserProfile';
import RoomOwnerProfile from './pages/RoomOwnerProfile';
import Search from './pages/Search';
import Banner from './components/banner';
// import Advertisement from './components/Advertisement';
import './App.css';
import 'leaflet/dist/leaflet.css';
import PageNotFound from './components/PageNotFound';

const ProtectedRoute = ({ children, userType }) => {
  const token = localStorage.getItem('token');
  const storedUserType = localStorage.getItem('userType');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (userType && storedUserType !== userType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/auth/check`, {
          credentials: 'include', // Include cookies
        });
        const data = await response.json();
        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setUserType(data.userType); // Set userType from the backend response
        }
      } catch (err) {
        console.error('Error checking login status:', err);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <Router>
      <div className="App">
        <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} userType={userType} />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Banner />
                {/* <Advertisement /> */}
                {isLoggedIn && <Hero />} {/* Render Hero only if logged in */}
                <TopApartments />
                {/* <Conveniences /> */}
              </>
            }
          />
          <Route path="/profile" element={ isLoggedIn && <UserProfile />} />
          <Route path="/roomowner-profile" element={ isLoggedIn && <RoomOwnerProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
          
          {/* Protected Routes */}
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute userType="user">
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roomowner-profile"
            element={
              <ProtectedRoute userType="roomowner">
                <RoomOwnerProfile />
              </ProtectedRoute>
            }
          />
          
          {/* 404 Page */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;