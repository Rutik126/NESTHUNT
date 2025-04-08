import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Advertisement from './Advertisement';
import '../styles/Hero.css';
import '../styles/RoomOwner.css';

const Hero = () => {
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '/default-property.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    return `http://localhost:5000/${imgPath.replace(/^\/+/, '')}`;
  };
  
  const [showContactModal, setShowContactModal] = useState(false);
  const [ownerPhone, setOwnerPhone] = useState('');
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'All',
    priceRange: 'All',
    location: 'All'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        const token = localStorage.getItem('token');
        const storedUserType = localStorage.getItem('userType');
        setUserType(storedUserType);
        
        // If room owner, don't fetch properties - show advertisement instead
        if (token && storedUserType === 'roomowner') {
          setLoading(false);
          return;
        }
        
        if (token && storedUserType === 'user') {
          const profile = await axios.get('http://localhost:5000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(profile.data.data?.user);
        }
    
        // Fetch properties only for users or guests
        const propsResponse = await axios.get('http://localhost:5000/api/properties/', {
          params: { limit: 20 },
          timeout: 5000
        });
    
        if (!propsResponse.data.success) {
          throw new Error(propsResponse.data.message || 'Failed to load properties');
        }
    
        setProperties(propsResponse.data.properties || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // If user is room owner, show advertisement instead of properties
  if (userType === 'roomowner') {
    return <Advertisement />;
  }

  // Rest of your existing Hero component code...
  const applyFilters = () => {
    return properties.filter(property => {
      const matchesType = filters.type === 'All' || property.type === filters.type;
      const matchesPrice = filters.priceRange === 'All' || 
        (filters.priceRange === 'Under 1500' ? property.price < 1500 : 
         filters.priceRange === 'Under 2000' ? property.price < 2000 : true);
      const matchesLocation = filters.location === 'All' || 
        (property.location?.address?.toLowerCase().includes(filters.location.toLowerCase()));
      
      return matchesType && matchesPrice && matchesLocation;
    });
  };

  const contactOwner = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // navigate('/signin');
        return;
      }
  
      const response = await axios.get(
        `http://localhost:5000/api/properties/${propertyId}/owner`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        setOwnerPhone(response.data.phone);
        document.body.classList.add('modal-open');
        setShowContactModal(true);
      }
    } catch (err) {
      console.error('Error contacting owner:', err);
      alert(err.response?.data?.message || 'Error contacting owner');
    }
  };
  
  const closeContactModal = () => {
    document.body.classList.remove('modal-open');
    setShowContactModal(false);
  };

  const saveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // navigate('/signin');
        return;
      }
  
      const response = await axios.post(
        'http://localhost:5000/api/user/save-property',
        { propertyId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
  
      if (response.data.success) {
        alert('Property saved successfully!');
      }
    } catch (err) {
      console.error('Error saving property:', err);
      alert(err.response?.data?.message || 'Error saving property');
    }
  };

  const filteredProperties = applyFilters();

  const getCleanAddress = (location) => {
    if (!location) return "Location not specified";
    if (typeof location === 'string') return location;
    if (location.address) return location.address.replace(/, India$/, '');
    return "Location not available";
  };

  const nextImage = () => {
    setCurrentImageIndex(prev => 
      (prev + 1) % (selectedProperty.images?.length || 1)
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      (prev - 1 + (selectedProperty.images?.length || 1)) % 
      (selectedProperty.images?.length || 1)
    );
  };

  if (loading) return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <section className="hero">
      {user && (
        <div className="user-info">
          <h2>Welcome back, {user.username}!</h2>
        </div>
      )}

      {/* Filters Section */}
      <div className="filter-section">
        <select 
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          className="filter-select"
        >
          <option value="All">All Types</option>
          <option value="PG">PG</option>
          <option value="Hostel">Hostel</option>
          <option value="Apartment">Apartment</option>
          <option value="House">House</option>
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
          className="filter-select"
        >
          <option value="All">All Prices</option>
          <option value="Under 1000">Under ₹1000</option>
          <option value="Under 2000">Under ₹2000</option>
          <option value="Above 5000">Above ₹5000</option>
        </select>

        <select
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
          className="filter-select"
        >
          <option value="All">All Locations</option>
          <option value="Ashta">Ashta</option>
          <option value="Sangli">Sangli</option>
          <option value="Islampur">Islampur</option>
        </select>
      </div>

      {/* Property Gallery */}
      <div className="property-gallery">
        {filteredProperties.length === 0 ? (
          <div className="no-properties">
            <p>No properties match your filters</p>
            <button
              className="reset-filters-btn"
              onClick={() => setFilters({
                type: 'All',
                priceRange: 'All',
                location: 'All'
              })}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredProperties.map(property => {
            const images = property.images || (property.image ? [property.image] : []);
            const mainImage = getImageUrl(images[0]);
            const address = getCleanAddress(property.location);
            const mapLink = property.location?.coordinates
              ? `https://www.google.com/maps?q=${property.location.coordinates.lat},${property.location.coordinates.lng}`
              : null;

            return (
              <div className="property-card-modern" key={property._id}>
                <div 
                  className="property-left" 
                  onClick={() => {
                    setSelectedProperty(property);
                    setCurrentImageIndex(0);
                  }}
                >
                  <div className="property-img-box">
                    <img
                      src={mainImage}
                      alt={property.name}
                    />
                    {images.length > 1 && (
                      <div className="photo-count">+{images.length - 1} more</div>
                    )}
                  </div>
                </div>
                <div className="property-right">
                  <div className="property-header">
                    <div className="property-price">
                      ₹{property.price} <div>Onwards</div>
                      <div className="rating">3.7/5⭐</div>
                    </div>
                    <h3>{property.name}</h3>
                    <p className="property-desc">{property.description}</p>
                  </div>

                  <div className="property-footer">
                    <div className="location-info">
                      <div>📍 {address}</div>
                      {mapLink && (
                        <a href={mapLink} target="_blank" rel="noreferrer" className="map-link">
                          view on map
                        </a>
                      )}
                    </div>
                    {showContactModal && (
                      <div className="contact-modal-overlay">
                        <div className="contact-modal">
                          <h3>Contact Property Owner</h3>
                          <p>Phone: {ownerPhone}</p>
                          <div className="modal-actions">
                            <a href={`tel:${ownerPhone}`} className="call-btn">Call Now</a>
                            <button onClick={closeContactModal}>Close</button>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="actions">
                      <div className={`status-badge ${property.vacant ? "vacant" : "occupied"}`}>
                        {property.vacant ? "Vacant" : "Occupied"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="image-gallery-modal" onClick={() => setSelectedProperty(null)}>
          <div className="gallery-content" onClick={e => e.stopPropagation()}>
            <button 
              className="close-gallery"
              onClick={() => setSelectedProperty(null)}
            >
              ×
            </button>
            
            <div className="gallery-main-image">
              <img
                src={getImageUrl(selectedProperty.images?.[currentImageIndex] || selectedProperty.image)}
                alt={selectedProperty.name}
              />
              <button className="nav-button prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
                &#10094;
              </button>
              <button className="nav-button next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
                &#10095;
              </button>
            </div>
            
            <div className="image-counter">
              Image {currentImageIndex + 1} of {(selectedProperty.images || [selectedProperty.image]).length}
            </div>
            
            <div className="modal-details">
              <h2>{selectedProperty.name}</h2>
              
              <div className="detail-row">
                <h3>Price:</h3>
                <h3>₹{selectedProperty.price}/month</h3>
              </div>
              
              <div className="detail-row">
                <h3>Type:</h3>
                <h4>{selectedProperty.type}</h4>
              </div>
              
              <div className="detail-row">
                <h3>Location:</h3>
                <h4>{getCleanAddress(selectedProperty.location)}</h4>
              </div>
              
              <div className="detail-row">
                <h3>Status:</h3>
                <h4 className={selectedProperty.vacant ? 'vacant' : 'occupied'}>
                  {selectedProperty.vacant ? 'Vacant' : 'Occupied'}
                </h4>
              </div>
              
              <div className="detail-row full-width">
                <h3>Description:</h3>
                <p>{selectedProperty.description || 'No description available'}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="contact-btn"
                  onClick={() => contactOwner(selectedProperty._id)}
                >
                  Contact Owner
                </button>
                <button 
                  className="save-btn"
                  onClick={() => saveProperty(selectedProperty._id)}
                >
                  Save Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;