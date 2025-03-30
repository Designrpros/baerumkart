"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import { Spot } from "../../../../data/spots";
import {
  DetailList,
  DetailItem,
  DetailLabel,
  DetailValue,
  DescriptionText,
  ButtonContainer,
  Input,
  Textarea,
  SaveButton,
  ErrorText,
} from "../styles";
import styled from "styled-components";
import { parseGPX, Point } from "@we-gold/gpxjs";
import { Picker } from "./Picker";
import LabelIcon from "@mui/icons-material/Label";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

interface EditSpot extends Partial<Spot> {
  images?: File[];
  imageUrls?: string[];
  categories?: string[];
  coordinates?: { lat: number; lng: number };
  route?: { lat: number; lng: number }[];
  manualLat?: string;
  manualLng?: string;
}

interface DetailsFormProps {
  isOpen: boolean;
  spot: Spot | null;
  editSpot: EditSpot;
  setEditSpot: (spot: EditSpot) => void;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  toggleEditMode: () => void;
  handleAddOrUpdateSpot: (spotData: EditSpot, spotId?: string) => Promise<boolean>;
  handleDeleteSpot: (id: string) => Promise<void>;
  handleAddCategory: (categoryName: string, iconPath: string) => Promise<void>; // Updated
  handleAddLocation: (locationName: string) => Promise<void>;
  categories: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  error: string | null;
  clearError: () => void;
  isFrontPage?: boolean;
  onClose?: () => void;
}

const DetailItemAligned = styled(DetailItem)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const DetailLabelAligned = styled(DetailLabel)`
  flex: 0 0 150px;
  text-align: left;
`;

const DetailContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const StyledInputAligned = styled(Input)`
  width: 100%;
  max-width: 400px;
  text-align: right;
`;

const FileInputAligned = styled(Input)`
  width: 100%;
  max-width: 400px;
`;

const TextareaAligned = styled(Textarea)`
  width: 100%;
  max-width: 400px;
  text-align: right;
`;

const CoordinateInputContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
  max-width: 400px;
`;

const ToggleButtonStyled = styled.button<{ isActive: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: ${({ isActive }) => (isActive ? "#1a1a1a" : "#fff")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#000")};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  &:hover {
    background: ${({ isActive }) => (isActive ? "#333" : "#f0f0f0")};
  }
`;

const CategoryTag = styled.span`
  background: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  margin: 0 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const DetailsForm: React.FC<DetailsFormProps> = ({
  isOpen,
  spot,
  editSpot,
  setEditSpot,
  isEditing,
  setIsEditing,
  toggleEditMode,
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLocationName, setNewLocationName] = useState("");

  const handleSave = async () => {
    const spotData: EditSpot = {
      ...editSpot,
      images: editSpot.images?.length ? editSpot.images : undefined,
      imageUrls: editSpot.imageUrls?.length ? editSpot.imageUrls : undefined,
      categories: editSpot.categories?.length ? editSpot.categories : undefined,
    };
    const success = await handleAddOrUpdateSpot(spotData, spot?.id);
    if (success) {
      setIsEditing(false);
      if (!spot && onClose) onClose();
    }
  };

  const handleGPXUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const gpxText = await file.text();
        const [gpxData, error] = parseGPX(gpxText);
        if (error) throw error;

        let coordinates: { lat: number; lng: number } | undefined;
        let route: { lat: number; lng: number }[] | undefined;

        if (gpxData?.tracks?.length) {
          route = gpxData.tracks[0].points.map((p: Point) => ({
            lat: p.latitude,
            lng: p.longitude,
          }));
          coordinates = route[0];
        } else if (gpxData?.waypoints?.length) {
          coordinates = {
            lat: gpxData.waypoints[0].latitude,
            lng: gpxData.waypoints[0].longitude,
          };
        }

        setEditSpot({
          ...editSpot,
          coordinates,
          route: route || editSpot.route,
          manualLat: coordinates?.lat.toString() || editSpot.manualLat,
          manualLng: coordinates?.lng.toString() || editSpot.manualLng,
        });
      } catch (err) {
        console.error("Error parsing GPX:", err);
      }
    }
  };

  const handleManualCoordinates = () => {
    const lat = parseFloat(editSpot.manualLat || "0");
    const lng = parseFloat(editSpot.manualLng || "0");
    if (!isNaN(lat) && !isNaN(lng)) {
      setEditSpot({
        ...editSpot,
        coordinates: { lat, lng },
      });
    }
  };

  const handleCategorySelect = (category: { id: string; name: string }) => {
    const currentCategories = editSpot.categories || [];
    if (!currentCategories.includes(category.name)) {
      setEditSpot({
        ...editSpot,
        categories: [...currentCategories, category.name],
      });
    }
  };

  const removeCategory = (category: { id: string; name: string }) => {
    setEditSpot({
      ...editSpot,
      categories: (editSpot.categories || []).filter((c) => c !== category.name),
    });
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      handleAddCategory(newCategoryName, "/icons/default.png"); // Added iconPath
      setEditSpot({
        ...editSpot,
        categories: [...(editSpot.categories || []), newCategoryName],
      });
      setNewCategoryName("");
      setIsAddCategoryOpen(false);
    }
  };

  const handleAddNewLocation = () => {
    if (newLocationName.trim()) {
      handleAddLocation(newLocationName);
      setEditSpot({ ...editSpot, location: newLocationName });
      setNewLocationName("");
      setIsAddLocationOpen(false);
    }
  };

  if (!isOpen) return null;

  if (isFrontPage) {
    return (
      <DetailList>
        <DetailItemAligned>
          <DetailLabelAligned>Navn:</DetailLabelAligned>
          <DetailContent>
            <DetailValue>{editSpot.name}</DetailValue>
          </DetailContent>
        </DetailItemAligned>
        <DetailItemAligned>
          <DetailLabelAligned>Beskrivelse:</DetailLabelAligned>
          <DetailContent>
            <DescriptionText>{editSpot.description || "Ingen beskrivelse"}</DescriptionText>
          </DetailContent>
        </DetailItemAligned>
        <DetailItemAligned>
          <DetailLabelAligned>Kategorier:</DetailLabelAligned>
          <DetailContent>
            {(editSpot.categories || []).map((cat) => (
              <CategoryTag key={cat}>{cat}</CategoryTag>
            ))}
          </DetailContent>
        </DetailItemAligned>
        <DetailItemAligned>
          <DetailLabelAligned>Koordinater:</DetailLabelAligned>
          <DetailContent>
            <DetailValue>
              {editSpot.coordinates?.lat}, {editSpot.coordinates?.lng}
            </DetailValue>
          </DetailContent>
        </DetailItemAligned>
      </DetailList>
    );
  }

  return (
    <DetailList>
      <DetailItemAligned>
        <DetailLabelAligned>Navn:</DetailLabelAligned>
        <DetailContent>
          {isEditing ? (
            <StyledInputAligned
              value={editSpot.name || ""}
              onChange={(e) => setEditSpot({ ...editSpot, name: e.target.value })}
            />
          ) : (
            <DetailValue>{editSpot.name}</DetailValue>
          )}
        </DetailContent>
      </DetailItemAligned>
      <DetailItemAligned>
        <DetailLabelAligned>Beskrivelse:</DetailLabelAligned>
        <DetailContent>
          {isEditing ? (
            <TextareaAligned
              value={editSpot.description || ""}
              onChange={(e) => setEditSpot({ ...editSpot, description: e.target.value })}
            />
          ) : (
            <DescriptionText>{editSpot.description || "Ingen beskrivelse"}</DescriptionText>
          )}
        </DetailContent>
      </DetailItemAligned>
      <DetailItemAligned>
        <DetailLabelAligned>Kategorier:</DetailLabelAligned>
        <DetailContent>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Picker<{ id: string; name: string }>
                  options={categories}
                  selectedValues={categories.filter((cat) =>
                    editSpot.categories?.includes(cat.name)
                  )}
                  onSelect={handleCategorySelect}
                  onRemove={removeCategory}
                  placeholder="Velg kategorier"
                  isOpen={isCategoryOpen}
                  setIsOpen={setIsCategoryOpen}
                  getLabel={(cat) => cat.name}
                  multiSelect={true}
                />
                <ToggleButtonStyled
                  isActive={isAddCategoryOpen}
                  onClick={() => setIsAddCategoryOpen(!isAddCategoryOpen)}
                >
                  <LabelIcon />
                </ToggleButtonStyled>
              </div>
              {isAddCategoryOpen && (
                <>
                  <StyledInputAligned
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Ny kategori"
                  />
                  <SaveButton onClick={handleAddNewCategory}>Legg til</SaveButton>
                </>
              )}
              <div style={{ display: "flex", gap: "5px", justifyContent: "flex-end" }}>
                {(editSpot.categories || []).map((cat) => (
                  <CategoryTag key={cat}>
                    {cat}
                    {isEditing && (
                      <DeleteIcon
                        fontSize="small"
                        onClick={() => removeCategory({ id: "", name: cat })}
                      />
                    )}
                  </CategoryTag>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "5px" }}>
              {(editSpot.categories || []).map((cat) => (
                <CategoryTag key={cat}>{cat}</CategoryTag>
              ))}
            </div>
          )}
        </DetailContent>
      </DetailItemAligned>
      <DetailItemAligned>
        <DetailLabelAligned>Lokasjon:</DetailLabelAligned>
        <DetailContent>
          {isEditing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <Picker<{ id: string; name: string }>
                  options={locations}
                  selectedValues={locations.filter((loc) => loc.name === editSpot.location)}
                  onSelect={(loc) => setEditSpot({ ...editSpot, location: loc.name })}
                  onRemove={() => {}}
                  placeholder="Velg lokasjon"
                  isOpen={isLocationOpen}
                  setIsOpen={setIsLocationOpen}
                  getLabel={(loc) => loc.name}
                  multiSelect={false}
                />
                <ToggleButtonStyled
                  isActive={isAddLocationOpen}
                  onClick={() => setIsAddLocationOpen(!isAddLocationOpen)}
                >
                  <AddIcon />
                </ToggleButtonStyled>
              </div>
              {isAddLocationOpen && (
                <>
                  <StyledInputAligned
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="Ny lokasjon"
                  />
                  <SaveButton onClick={handleAddNewLocation}>Legg til</SaveButton>
                </>
              )}
              <DetailValue>{editSpot.location || "Unknown"}</DetailValue>
            </div>
          ) : (
            <DetailValue>{editSpot.location || "Unknown"}</DetailValue>
          )}
        </DetailContent>
      </DetailItemAligned>
      <DetailItemAligned>
        <DetailLabelAligned>Koordinater:</DetailLabelAligned>
        <DetailContent>
          {isEditing ? (
            <>
              <FileInputAligned type="file" accept=".gpx" onChange={handleGPXUpload} />
              <CoordinateInputContainer>
                <StyledInputAligned
                  value={editSpot.manualLat || ""}
                  onChange={(e) => setEditSpot({ ...editSpot, manualLat: e.target.value })}
                  placeholder="Latitude"
                />
                <StyledInputAligned
                  value={editSpot.manualLng || ""}
                  onChange={(e) => setEditSpot({ ...editSpot, manualLng: e.target.value })}
                  placeholder="Longitude"
                />
                <SaveButton onClick={handleManualCoordinates}>Sett</SaveButton>
              </CoordinateInputContainer>
            </>
          ) : (
            <DetailValue>
              {editSpot.coordinates?.lat}, {editSpot.coordinates?.lng}
            </DetailValue>
          )}
        </DetailContent>
      </DetailItemAligned>
      <ButtonContainer>
        <ToggleButtonStyled isActive={isEditing} onClick={toggleEditMode}>
          Rediger
        </ToggleButtonStyled>
        {isEditing && (
          <>
            <ToggleButtonStyled isActive={true} onClick={handleSave}>
              Lagre
            </ToggleButtonStyled>
            <ToggleButtonStyled isActive={false} onClick={toggleEditMode}>
              Avbryt
            </ToggleButtonStyled>
            {spot && (
              <ToggleButtonStyled isActive={false} onClick={() => handleDeleteSpot(spot.id)}>
                Slett
              </ToggleButtonStyled>
            )}
          </>
        )}
      </ButtonContainer>
      {error && isEditing && <ErrorText>{error}</ErrorText>}
    </DetailList>
  );
};