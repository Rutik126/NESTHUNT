import React, { useEffect, useState } from "react";
import axios from "axios";
import LocationPicker from "./LocationPicker";
import "../styles/RoomOwner.css";

const RoomOwnerProfile = () => {
  const getImageUrl = (imgPath) => {
    if (!imgPath) return '/default-property.jpg';
    if (imgPath.startsWith('http')) return imgPath;
    return `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/${imgPath.replace(/^\/+/, '')}`;
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
    
  const [advertisement, setAdvertisement] = useState(null);
  const [roomOwner, setRoomOwner] = useState({
    username: "",
    email: "",
    phone: "",
    profilePhoto: "",
    location: ""
  });
  const [properties, setProperties] = useState([]);
  const [activePage, setActivePage] = useState("profile");
  const [newProperty, setNewProperty] = useState({
    name: "",
    location: "",
    price: "",
    type: "PG",
    description: "",
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);


  const toggleVacancy = async (propertyId, currentVacantStatus) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      const response = await axios.patch(
        `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/properties/${propertyId}/vacancy`,
        { vacant: !currentVacantStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );
  
      if (response.data.success) {
        // Fetch updated property list
        const updatedProperties = await axios.get(
          `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/properties/my-properties`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
  
        setProperties(updatedProperties.data.properties || []);
      }
    } catch (err) {
      console.error("Error toggling vacancy:", err);
    }
  };


 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
  
        setLoading(true);
        const [profileRes, propertiesRes] = await Promise.all([
          axios.get(`${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/roomowner/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/properties/my-properties`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          })
        ]);
  
        // Check if it's an advertisement response
        if (profileRes.data.advertisement) {
          setAdvertisement(profileRes.data.ads[0]);
          setRoomOwner(null);
        } else {
          setRoomOwner(profileRes.data.roomOwner || {});
        }
        
        setProperties(propertiesRes.data.properties || []);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handlePropertySubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newProperty.name || !newProperty.location || !newProperty.price) {
      setError('Please fill in all required fields');
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError('Authentication required. Please login again.');
        return;
      }
  
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      
      // Prepare location data
      const locationData = {
        address: newProperty.location.trim(),
        coordinates: selectedCoordinates
      };
      
      // Append all data to formData
      formData.append('location', JSON.stringify(locationData));
      formData.append('name', newProperty.name.trim());
      formData.append('price', newProperty.price.toString().trim());
      formData.append('type', newProperty.type);
      formData.append('description', newProperty.description.trim());
      
      // Handle single file or multiple files
      if (newProperty.image) {
        // Single file case
        formData.append('images', newProperty.image);
      } else if (newProperty.images && newProperty.images.length > 0) {
        // Multiple files case
        Array.from(newProperty.images).forEach((file, index) => {
          formData.append(`images`, file);
        });
      } else {
        throw new Error('At least one image is required');
      }
  
      // Submit property
      const response = await axios.post(
        `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/properties`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
  
      if (response.data.success) {
        // Refresh properties list
        try {
          const propertiesResponse = await axios.get(
            `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/api/properties/my-properties`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          );
          
          setProperties(propertiesResponse.data.properties || []);
        } catch (fetchError) {
          console.error("Error fetching updated properties:", fetchError);
        }
  
        // Reset form
        setNewProperty({
          name: "",
          location: "",
          price: "",
          type: "PG",
          description: "",
          image: null,
          images: []
        });
        setSelectedCoordinates(null);
        setActivePage("manage-properties");
        
        setSuccessMessage("Property added successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      let errorMessage = err.response?.data?.message || err.message;
      
      if (err.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (err.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // For multiple files
      if (e.target.multiple) {
        setNewProperty(prev => ({ 
          ...prev, 
          images: Array.from(e.target.files),
          image: null // Clear single image if it exists
        }));
      } 
      // For single file
      else {
        setNewProperty(prev => ({ 
          ...prev, 
          image: e.target.files[0],
          images: [] // Clear images array if it exists
        }));
      }
    }
  };

  const handleLocationSelect = (lat, lng, address) => {
    setSelectedCoordinates({ lat, lng });
    setNewProperty(prev => ({ ...prev, location: address }));
  };

  
  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h2>Dashboard</h2>
        <ul >
          <li 
            className={`nav-item ${activePage === "profile" ? "active" : ""}`}
            onClick={() => setActivePage("profile")}
          >
            Personal Info
          </li>
          <li 
            className={`nav-item ${activePage === "add-property" ? "active" : ""}`}
            onClick={() => setActivePage("add-property")}
          >
            Add Property
          </li>
          <li 
            className={`nav-item ${activePage === "manage-properties" ? "active" : ""}`}
            onClick={() => setActivePage("manage-properties")}
          >
            Manage Properties
          </li>
        </ul>
      </div>

      {sidebarOpen && (
    <div 
      className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
      onClick={toggleSidebar}
    />
  )}
  
  <button className="sidebar-toggle" onClick={toggleSidebar}>
    ☰
  </button>
  
      <div className="content">
        {loading && activePage !== "profile" && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)} className="close-error">
              &times;
            </button>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            {successMessage}
          </div>
        )}

        {activePage === "profile" && (
          <ProfilePage roomOwner={roomOwner} properties={properties} />
        )}
        
        {activePage === "add-property" && (
          <AddPropertyPage 
            newProperty={newProperty}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
            handleSubmit={handlePropertySubmit}
            onLocationSelect={handleLocationSelect}
            loading={loading}
          />
        )}
        
        {activePage === "manage-properties" && (
          <ManagePropertiesPage 
            properties={properties} 
            setActivePage={setActivePage}
            toggleVacancy={toggleVacancy}
          />
        )}
      </div>
    </div>
  );
};

// Sub-components
const ProfilePage = ({ roomOwner, properties, advertisement }) => (
  <div className="profile-page">
    {advertisement ? (
      <div className="advertisement-box">
        <h2>{advertisement.title}</h2>
        <p>{advertisement.description}</p>
        <button className="cta-btn">{advertisement.cta}</button>
      </div>
    ) : (
      <>
    <div className="profile-header">
      <div className="profile-pic">
      <img
        src={
          roomOwner.profilePhoto
            ? `${process.env.VITE_REACT_APP_BACKEND_BASEURL}/${roomOwner.profilePhoto.replace(/\\/g, '/')}`
            : "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"
        }
        alt="Profile"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://t3.ftcdn.net/jpg/03/46/83/96/360_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg";
        }}
      />
      </div>
      <div className="profile-info">
        <h1>{roomOwner.username}</h1>
        <p className="role">Room Owner</p>
      </div>
    </div>
    <div className="profile-details">
      <div className="info-box">
        <h3>📅 Rental Information</h3>
        <p><strong>Total Properties:</strong> {properties.length}</p>
        <p><strong>Vacant Properties:</strong> {properties.filter(p => p.vacant).length}</p>
      </div>
      <div className="info-box">
        <h3>📞 Contact Info</h3>
        <p><strong>Email:</strong> {roomOwner.email}</p>
        <p><strong>Phone:</strong> {roomOwner.phone}</p>
        <p><strong>Location:</strong> {roomOwner.location}</p>
      </div>
    </div>
    </>
    )}
  </div>
);

const AddPropertyPage = ({ 
  newProperty, 
  handleInputChange, 
  handleFileChange, 
  handleSubmit, 
  onLocationSelect,
  loading 
}) => {
  const [showMap, setShowMap] = useState(false);
  const [locationMethod, setLocationMethod] = useState('text');
  const [previewImages, setPreviewImages] = useState([]);

  const handleLocationMethodChange = (method) => {
    setLocationMethod(method);
    if (method === 'text') {
      setShowMap(false);
    } else {
      setShowMap(true);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validFiles = files.filter(file => 
      file.type.match('image.*')
    );
    
    if (validFiles.length !== files.length) {
      alert('Only image files are allowed!');
      return;
    }
    
    // Create preview URLs
    const previews = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages([...previewImages, ...previews]);
    handleFileChange({ target: { files: validFiles } }); // Pass to parent
  };

  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    URL.revokeObjectURL(updatedPreviews[index].preview);
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);
  };

  return (
    <div className="add-property-page">
      <form onSubmit={handleSubmit}>
        <h2>Add Property</h2>
        
        <div className="form-group">
          <label>Property Name</label>
          <input
            type="text"
            name="name"
            value={newProperty.name}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Type Location</label>
          <div className="location-method-selector">
            <button
              type="button"
              className={`location-method-btn ${locationMethod === 'text' ? 'active' : ''}`}
              onClick={() => handleLocationMethodChange('text')}
            >
              Type Location
            </button>
            <button
              type="button"
              className={`location-method-btn ${locationMethod === 'map' ? 'active' : ''}`}
              onClick={() => handleLocationMethodChange('map')}
            >
              Pick from Map
            </button>
          </div>
        </div>

        {locationMethod === 'text' ? (
          <div className="form-group">
            <label>Type Location</label>
            <input
              type="text"
              name="location"
              value={newProperty.location}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Selected Location</label>
              <input
                type="text"
                name="location"
                value={newProperty.location}
                readOnly
                className="selected-location-input"
              />
            </div>
            {showMap && (
              <div className="map-container">
                <LocationPicker onLocationSelect={onLocationSelect} />
              </div>
            )}
          </>
        )}

        <div className="form-group">
          <label>Price (per month)</label>
          <input
            type="number"
            name="price"
            value={newProperty.price}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Property Type</label>
          <select
            name="type"
            value={newProperty.type}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="PG">PG</option>
            <option value="Hostel">Hostel</option>
            <option value="Apartment">Apartment</option>
            <option value="House">House</option>
          </select>
        </div>
        <div className="form-group">
          <label>Images (Up to 5)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            multiple // Allow multiple files
            required
            disabled={loading}
          />
          <small>Select multiple images (max 5)</small>
          
          {/* Image previews */}
          <div className="image-previews">
            {previewImages.map((img, index) => (
              <div key={index} className="image-preview">
                <img src={img.preview} alt={`Preview ${index}`} />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => removeImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={newProperty.description}
            onChange={handleInputChange}
            rows="4"
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Property'}
        </button>
      </form>
    </div>
  );
};

const ManagePropertiesPage = ({ properties, setActivePage, toggleVacancy }) => {
  const [setSelectedProperty] = useState(null);
  const [setCurrentImageIndex] = useState(0);

  const getCleanAddress = (location) => {
    if (!location) return "Location not specified";
    if (typeof location === 'string') return location;
    if (location.address) return location.address.replace(/, India$/, '');
    return "Location not available";
  };

  const openImageGallery = (property) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
  };

  // const nextImage = () => {
  //   setCurrentImageIndex(prev => 
  //     (prev + 1) % (selectedProperty.images?.length || 1)
  //   );
  // };

  // const prevImage = () => {
  //   setCurrentImageIndex(prev => 
  //     (prev - 1 + (selectedProperty.images?.length || 1)) % 
  //     (selectedProperty.images?.length || 1)
  //   );
  // };

  return (
    <div className="manage-properties-page">
      <h2>Manage Properties</h2>
      {properties.length === 0 ? (
        <div className="no-properties">
          <p>No properties available</p>
          <button
            className="add-property-btn"
            onClick={() => setActivePage("add-property")}
          >
            Add New Property
          </button>
        </div>
      ) : (
        properties.map((property) => {
          const images = property.images || (property.image ? [property.image] : []);
          const mainImage = images[0] ? 
          (images[0].startsWith("http") ? images[0] : `${process.env.VITE_REACT_APP_BACKEND_BASEURL}${images[0]}`) 
          : '/default-property.jpg';
          const address = getCleanAddress(property.location);
          const mapLink = property.location?.coordinates
            ? `https://www.google.com/maps?q=${property.location.coordinates.lat},${property.location.coordinates.lng}`
            : null;

          return (
            <div className="property-card-modern" key={property._id}>
              <div className="property-left" onClick={() => openImageGallery(property)}>
                <div className="property-img-box">
                <img
                  src={mainImage}
                  alt={property.name}
                  // onError={(e) => {
                  //   e.target.onerror = null;
                  //   e.target.src = '/default-property.jpg';
                  // }}
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
                  <div className="actions">
                    {/* <button className="view-phone">View Phone No.</button>
                    <button className="contact-owner">Contact Owner</button> */}
                    <button
                      className={property.vacant ? "vacant" : "occupied"}
                      onClick={() => toggleVacancy(property._id, property.vacant)}
                    >
                      {property.vacant ? "Vacant" : "Occupied"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          );
        })
        
      )}
    </div>
  );
};


export default RoomOwnerProfile;