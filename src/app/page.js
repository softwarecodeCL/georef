'use client';
import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from 'react-bootstrap';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import Search from './components/Search';

const MapContainer = () => {
  const [poiData, setPoiData] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleMapClick = (event) => {
    const clickedLat = event.latLng.lat();
    const clickedLng = event.latLng.lng();
  
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat: clickedLat, lng: clickedLng } },
      (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            const address = results[0].formatted_address;
            setSelectedAddress(address);
          } else {
            console.log("No results found");
          }
        } else {
          console.log("Geocoder failed due to: " + status);
        }
      }
    );
  };
  
  useEffect(() => {
    // Actualizar poiData cada vez que se cambie la lista de marcadores
    const updatedPoiData = markers.map(marker => ({
      id: marker.id,
      name: marker.title,
      latitude: marker.position.lat,
      longitude: marker.position.lng
    }));
    setPoiData(updatedPoiData);
  }, [markers]);

  const addOrUpdatePOI = (poi) => {
    const existingIndex = poiData.findIndex(item => item.id === poi.id);
    const updatedMarkers = [...markers];
  
    if (existingIndex !== -1) {
      const existingMarkerIndex = updatedMarkers.findIndex(marker => marker.id === poi.id);
      if (existingMarkerIndex !== -1) {
        updatedMarkers.splice(existingMarkerIndex, 1);
      }
    }
  
    if (existingIndex === -1) {
      updatedMarkers.push({
        id: poi.id,
        position: { lat: parseFloat(poi.latitude), lng: parseFloat(poi.longitude) },
        title: poi.name
      });
    }
  
    setPoiData([...poiData.filter(item => item.id !== poi.id), poi]);
    setMarkers(updatedMarkers);
  };


    
  return (
    <Container className="mt-5" >
      <Row>
        <Col md={3} className="mt-3" style={{ height: "70vh", overflowY: "auto" }}>  
          <Search onAddPOI={addOrUpdatePOI} />
        </Col>
        <Col md={9} className="d-flex flex-column">
        <div style={{ flex: "1" }}>
        <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY} className="mt-3 mb-4">
            <GoogleMap 
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: -33.4266707, lng: -70.6202899 }}
              zoom={17}
              onClick={handleMapClick}
              options={{ disablePointsOfInterest: true }}>
              {markers.map(marker => (
                <Marker
                  key={marker.id}
                  position={marker.position}
                  title={marker.title}
                />
              ))}
              {selectedAddress && <Marker position={selectedAddress} />}
            </GoogleMap>
          </LoadScript>
          </div>

        </Col>
      </Row>
    </Container>

  );
};

export default MapContainer;