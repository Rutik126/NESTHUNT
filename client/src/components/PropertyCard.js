import React from 'react';
import { Link } from 'react-router-dom';
import RatingBar from './RatingBar';
import '../styles/PropertyCard.css';

const PropertyCard = ({ property }) => {
  return (
    <div className="property-card">
      <Link to={`/property/${property._id}`}>
        <div className="property-image">
          <img src={property.images[0]} alt={property.title} />
        </div>
        <div className="property-details">
          <h3>{property.title}</h3>
          <p className="price">${property.price.toLocaleString()}</p>
          <p className="location">{property.location}</p>
          <div className="property-features">
            <span>{property.bedrooms} beds</span>
            <span>{property.bathrooms} baths</span>
            <span>{property.area} sqft</span>
          </div>
        </div>
      </Link>
      <RatingBar propertyId={property._id} />
    </div>
  );
};

export default PropertyCard; 