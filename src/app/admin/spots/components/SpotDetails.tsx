"use client";

import React, { useState, useEffect } from "react";
import { Spot } from "../../../../data/spots";
import { SpotDetails as StyledSpotDetails } from "../styles";
import styled from "styled-components";
import { ImageSection } from "../sections/ImageSection";
import { MapSection } from "../sections/MapSection";
import { DetailsForm } from "./DetailsForm";

interface EditSpot extends Partial<Spot> {
  images?: File[];
  imageUrls?: string[];
  categories?: string[];
  coordinates?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  manualLat?: string;
  manualLng?: string;
}

interface SpotDetailsProps {
  isOpen: boolean;
  spot: Spot | null;
  handleAddOrUpdateSpot: (spotData: EditSpot, spotId?: string) => Promise<boolean>;
  handleDeleteSpot: (id: string) => Promise<void>; // Already correct
  handleAddCategory: (categoryName: string, iconPath: string) => Promise<void>; // Already updated
  handleAddLocation: (locationName: string) => Promise<void>; // Updated to Promise<void>
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  error: string | null;
  clearError: () => void;
  isFrontPage?: boolean;
  onClose?: () => void;
}

const FormContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

export const SpotDetails: React.FC<SpotDetailsProps> = ({
  isOpen,
  spot,
  handleAddOrUpdateSpot,
  handleDeleteSpot,
  handleAddCategory,
  handleAddLocation,
  categories,
  locations,
  error,
  clearError,
  isFrontPage = false,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(!spot);
  const [editSpot, setEditSpot] = useState<EditSpot>(
    spot || {
      name: "",
      description: "",
      images: [],
      imageUrls: [],
      categories: [],
      coordinates: { lat: 0, lng: 0 },
      route: [],
      manualLat: "",
      manualLng: "",
      wheelchairAccessible: false,
      difficulty: "lett",
      location: "Unknown",
      subcategory: "",
    }
  );

  useEffect(() => {
    if (!isEditing && spot) {
      setEditSpot({
        ...spot,
        images: [],
        imageUrls: spot.imageUrl ? [spot.imageUrl] : [],
        categories: spot.category ? [spot.category] : [],
        route: [],
        manualLat: spot.coordinates?.lat.toString() || "",
        manualLng: spot.coordinates?.lng.toString() || "",
      });
    }
  }, [spot, isEditing]);

  const toggleEditMode = () => {
    if (isEditing) clearError();
    setIsEditing(!isEditing);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEditSpot({
      ...editSpot,
      images: [...(editSpot.images || []), ...files],
    });
  };

  const removeImage = (index: number) => {
    const newImages = [...(editSpot.images || [])];
    const newImageUrls = [...(editSpot.imageUrls || [])];
    if (index < newImageUrls.length) {
      newImageUrls.splice(index, 1);
      setEditSpot({ ...editSpot, imageUrls: newImageUrls });
    } else {
      newImages.splice(index - newImageUrls.length, 1);
      setEditSpot({ ...editSpot, images: newImages });
    }
  };

  if (!isOpen) return null;

  return (
    <FormContainer>
      <StyledSpotDetails isOpen={isOpen}>
        <ImageSection
          editSpot={editSpot}
          isEditing={isEditing}
          handleImageUpload={handleImageUpload}
          removeImage={removeImage}
        />
        <MapSection editSpot={editSpot} />
        <DetailsForm
          isOpen={isOpen}
          spot={spot}
          editSpot={editSpot}
          setEditSpot={setEditSpot}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          toggleEditMode={toggleEditMode}
          handleAddOrUpdateSpot={handleAddOrUpdateSpot}
          handleDeleteSpot={handleDeleteSpot}
          handleAddCategory={handleAddCategory}
          handleAddLocation={handleAddLocation}
          categories={categories}
          locations={locations}
          error={error}
          clearError={clearError}
          isFrontPage={isFrontPage}
          onClose={onClose}
        />
      </StyledSpotDetails>
    </FormContainer>
  );
};