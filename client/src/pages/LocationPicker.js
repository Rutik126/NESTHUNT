import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import axios from 'axios';

const LocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');

  // Fix for default marker icons
  const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        setPosition(e.latlng);
        try {
          // Reverse geocode to get address
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`
          );
          const addr = response.data.display_name || 'Selected Location';
          setAddress(addr);
          onLocationSelect(e.latlng.lat, e.latlng.lng, addr);
        } catch (err) {
          console.error('Error getting address:', err);
          const addr = `${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
          setAddress(addr);
          onLocationSelect(e.latlng.lat, e.latlng.lng, addr);
        }
      }
    });
    return null;
  };

  return (
    <MapContainer 
      center={[20.5937, 78.9629]} // Center on India
      zoom={5}
      style={{ height: '300px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapClickHandler />
      {position && (
        <Marker position={position} icon={markerIcon}>
          <Popup>{address || 'Selected Location'}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default LocationPicker;