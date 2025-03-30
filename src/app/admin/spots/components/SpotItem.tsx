"use client";

import React, { useState } from "react";
import { Spot } from "../../../../data/spots";
import { SpotHeader, SpotName, ToggleButton, SpotItem as StyledSpotItem } from "../styles";
import { SpotDetails } from "./SpotDetails"; // Fixed import

interface EditSpot extends Partial<Spot> {
  image?: File | null;
}

interface SpotItemProps {
  spot: Spot;
  handleAddOrUpdateSpot: (spotData: EditSpot, spotId?: string) => Promise<boolean>;
  handleDeleteSpot: (id: string) => Promise<void>;
  handleAddCategory: (categoryName: string, iconPath: string) => Promise<void>;
  handleAddLocation: (locationName: string) => Promise<void>;
  categories: { id: string; name: string; subcategories?: string[] }[];
  locations: { id: string; name: string }[];
  error: string | null;
  clearError: () => void;
}

export const SpotItem: React.FC<SpotItemProps> = ({
  spot,
  handleAddOrUpdateSpot,
  handleDeleteSpot,
  handleAddCategory,
  handleAddLocation,
  categories,
  locations,
  error,
  clearError,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSpotDetails = () => setIsOpen(!isOpen);

  return (
    <StyledSpotItem>
      <SpotHeader onClick={toggleSpotDetails}>
        <SpotName>{spot.name} ({spot.category})</SpotName>
        <ToggleButton>{isOpen ? "−" : "+"}</ToggleButton>
      </SpotHeader>
      <SpotDetails
        isOpen={isOpen}
        spot={spot}
        handleAddOrUpdateSpot={handleAddOrUpdateSpot}
        handleDeleteSpot={handleDeleteSpot}
        handleAddCategory={handleAddCategory}
        handleAddLocation={handleAddLocation}
        categories={categories}
        locations={locations}
        error={error}
        clearError={clearError}
      />
    </StyledSpotItem>
  );
};