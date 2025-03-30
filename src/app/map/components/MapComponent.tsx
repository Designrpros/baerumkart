"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import styled from "styled-components";
import { Spot, Category } from "../types/mapTypes";

// Styled Component
const MapDiv = styled.div`
  height: 100%;
  width: 100%;
`;

interface MapComponentProps {
  spots: Spot[];
  categories: Category[];
  visibleCategories: Record<string, boolean>;
  sidebarOpen: boolean;
  onNavigateToSpot: (spotId: string) => void; // New prop for navigation
}

export interface MapComponentHandle {
  getMap: () => google.maps.Map | null;
}

export const MapComponent = forwardRef<MapComponentHandle, MapComponentProps>(
  ({ spots, categories, visibleCategories, sidebarOpen, onNavigateToSpot }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

    // Expose map instance via ref
    useImperativeHandle(ref, () => ({
      getMap: () => map,
    }));

    // Load Google Maps with async
    useEffect(() => {
      const loadGoogleMaps = async () => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initMap`;
        script.async = true;
        document.head.appendChild(script);

        (window as any).initMap = () => {
          initializeMap();
        };
      };

      if (!window.google) {
        loadGoogleMaps();
      } else {
        initializeMap();
      }
    }, []);

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 59.95, lng: 10.6 }, // Initial default, updated below
        zoom: 12,
        mapTypeId: "terrain",
      });

      setMap(mapInstance);
    };

    // Center map based on visible spots and sidebar state
    useEffect(() => {
      if (!map || !mapRef.current) return;

      const visibleSpots = spots.filter(
        (spot) => visibleCategories[spot.category] !== false
      );

      let center: { lat: number; lng: number };
      if (visibleSpots.length > 0) {
        const latSum = visibleSpots.reduce(
          (sum, spot) => sum + (spot.coordinates?.lat || 59.95),
          0
        );
        const lngSum = visibleSpots.reduce(
          (sum, spot) => sum + (spot.coordinates?.lng || 10.6),
          0
        );
        center = {
          lat: latSum / visibleSpots.length,
          lng: lngSum / visibleSpots.length,
        };
      } else {
        center = { lat: 59.95, lng: 10.6 }; // Bærum fallback
      }

      const sidebarWidth = sidebarOpen ? 300 : 0;
      const mapWidth = mapRef.current.offsetWidth;
      const lngPerPixel = 0.0005; // Approximate at zoom 12
      const offsetPixels = sidebarOpen ? sidebarWidth / 2 : 0;
      const lngOffset = offsetPixels * lngPerPixel;

      const adjustedCenter = {
        lat: center.lat,
        lng: center.lng - lngOffset, // Shift left when sidebar is open
      };

      map.setCenter(adjustedCenter);
    }, [map, spots, visibleCategories, sidebarOpen]);

    // Update markers with enhanced popup
    useEffect(() => {
      if (!map || spots.length === 0) return;

      markers.forEach((marker) => marker.setMap(null));
      const newMarkers: google.maps.Marker[] = [];

      spots.forEach((spot) => {
        const categoryMatch = categories.find((cat) =>
          cat.name.localeCompare(spot.category, undefined, { sensitivity: "base" }) === 0
        );
        const iconUrl = categoryMatch?.iconUrl || "/icons/default.png";
        const position = spot.coordinates || { lat: 59.95, lng: 10.6 };
        console.log(`Spot: ${spot.name}, Position:`, position, `Icon: ${iconUrl}`);

        if (visibleCategories[spot.category] !== false) {
          const marker = new google.maps.Marker({
            position: position,
            map,
            title: spot.name,
            icon: {
              url: iconUrl,
              scaledSize: new google.maps.Size(25, 25),
            },
          });

          const imageSrc =
            spot.photos && spot.photos.length > 0
              ? spot.photos[0]
              : spot.imageUrl || "/placeholder.jpg";
          const infoContent = `
            <div style="max-width: 200px; font-family: Arial, sans-serif;">
              <img src="${imageSrc}" alt="${spot.name}" style="width: 100%; height: auto; border-radius: 4px; margin-bottom: 8px;" />
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${spot.name}</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${spot.category}</p>
              <button
                onclick="window.navigateToSpot('${spot.id}')"
                style="width: 100%; padding: 6px 0; background: #2e7d32; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; transition: background 0.2s ease;"
                onmouseover="this.style.background='#1b5e20'"
                onmouseout="this.style.background='#2e7d32'"
              >
                Vis detaljer
              </button>
            </div>
          `;

          const infoWindow = new google.maps.InfoWindow({
            content: infoContent,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
      });

      // Add navigateToSpot to window for InfoWindow button
      (window as any).navigateToSpot = (spotId: string) => {
        onNavigateToSpot(spotId);
      };

      console.log("Markers created:", newMarkers);
      setMarkers(newMarkers);

      return () => {
        delete (window as any).navigateToSpot; // Cleanup
      };
    }, [map, spots, categories, visibleCategories, onNavigateToSpot]);

    return <MapDiv ref={mapRef} />;
  }
);

MapComponent.displayName = "MapComponent";