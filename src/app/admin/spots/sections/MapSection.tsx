"use client";

import React from "react";
import { Spot } from "../../../../data/spots";
import { MapContainer } from "../styles"; // Assuming MapContainer is exported from your original styles
import styled from "styled-components";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";

interface EditSpot extends Partial<Spot> {
  images?: File[];
  imageUrls?: string[];
  categories?: string[];
  coordinates?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  manualLat?: string;
  manualLng?: string;
}

interface MapSectionProps {
  editSpot: EditSpot;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

export const MapSection: React.FC<MapSectionProps> = ({ editSpot }) => (
  <MapContainer>
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={editSpot.coordinates || { lat: 0, lng: 0 }}
        zoom={editSpot.route?.length ? 12 : 15}
      >
        {editSpot.coordinates && <Marker position={editSpot.coordinates} />}
        {editSpot.route && (
          <Polyline path={editSpot.route} options={{ strokeColor: "#FF0000", strokeWeight: 4 }} />
        )}
      </GoogleMap>
    </LoadScript>
  </MapContainer>
);