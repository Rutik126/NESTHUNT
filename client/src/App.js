import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
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
import './App.css';
import 'leaflet/dist/leaflet.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/check', {
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
                {isLoggedIn && <Hero />} {/* Render Hero only if logged in */}
                <TopApartments />
                {/* <Conveniences /> */}
              </>
            }
          />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/roomowner-profile" element={<RoomOwnerProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/signup" element={<SignUp setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/signin" element={<SignIn setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;