"use client";

import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation"; // Added for navigation
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { MapComponent, MapComponentHandle } from "./components/MapComponent";
import { Sidebar } from "./components/Sidebar";
import { CategoryList } from "./components/CategoryList";
import { SpotList } from "./components/SpotList";
import { Spot, Category } from "./types/mapTypes";

// Styled Component
const MapContainer = styled.div`
  position: relative;
  height: 95vh;
  width: 100%;
`;

const MapPage = () => {
  const router = useRouter(); // Added for navigation
  const mapComponentRef = useRef<MapComponentHandle>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [spotsList, setSpotsList] = useState<Spot[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visibleCategories, setVisibleCategories] = useState<Record<string, boolean>>({});
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);

  // Fetch spots from Firebase
  useEffect(() => {
    const unsubscribeSpots = onSnapshot(collection(db, "spots"), (snapshot) => {
      const fetchedSpots = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
        category: doc.data().category || "Uncategorized",
        coordinates: doc.data().coordinates || { lat: 59.95, lng: 10.6 },
        description: doc.data().description || "Ingen beskrivelse tilgjengelig.",
        wheelchairAccessible: doc.data().wheelchairAccessible || false,
        difficulty: doc.data().difficulty || "lett",
        location: doc.data().location || "Unknown",
        imageUrl: doc.data().imageUrl || "",
        photos: doc.data().photos || [],
        addedBy: doc.data().addedBy || "",
        createdAt: doc.data().createdAt || "",
        updatedAt: doc.data().updatedAt || "",
      })) as Spot[];
      console.log("Fetched spots:", fetchedSpots);
      setSpotsList(fetchedSpots);

      const spotCategories = Array.from(new Set(fetchedSpots.map((spot) => spot.category)));
      setVisibleCategories((prev) => {
        const updated = { ...prev };
        spotCategories.forEach((cat) => {
          if (!(cat in updated)) updated[cat] = true;
        });
        return updated;
      });
    });

    return () => unsubscribeSpots();
  }, []);

  // Fetch categories from Firebase
  useEffect(() => {
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (snapshot) => {
      const fetchedCategories = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        iconUrl: doc.data().iconUrl || "/icons/default.png",
      })) as Category[];
      console.log("Fetched categories:", fetchedCategories);
      setCategories(fetchedCategories);

      setVisibleCategories((prev) => {
        const updated = { ...prev };
        fetchedCategories.forEach((cat) => {
          if (!(cat.name in updated)) updated[cat.name] = true;
        });
        return updated;
      });
    });

    return () => unsubscribeCategories();
  }, []);

  const toggleCategory = (category: string) => {
    setVisibleCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleCategoriesSection = () => {
    setCategoriesCollapsed((prev) => !prev);
  };

  const panToSpot = (coordinates: { lat: number; lng: number }) => {
    const mapInstance = mapComponentRef.current?.getMap();
    if (mapInstance) mapInstance.panTo(coordinates);
  };

  const navigateToSpot = (spotId: string) => {
    router.push(`/location/${spotId}`);
  };

  return (
    <MapContainer>
      <Sidebar open={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)}>
        <CategoryList
          visibleCategories={visibleCategories}
          toggleCategory={toggleCategory}
          categoriesCollapsed={categoriesCollapsed}
          toggleCategoriesSection={toggleCategoriesSection}
        />
        <SpotList spots={spotsList} panToSpot={panToSpot} />
      </Sidebar>
      <MapComponent
        ref={mapComponentRef}
        spots={spotsList}
        categories={categories}
        visibleCategories={visibleCategories}
        sidebarOpen={sidebarOpen}
        onNavigateToSpot={navigateToSpot} // Pass navigation callback
      />
    </MapContainer>
  );
};

export default MapPage;