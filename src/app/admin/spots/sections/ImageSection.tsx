"use client";

import React from "react";
import { Spot } from "../../../../data/spots";
import { Image } from "../styles"; // Assuming Image is exported from your original styles
import styled from "styled-components";
import DeleteIcon from "@mui/icons-material/Delete";

interface EditSpot extends Partial<Spot> {
  images?: File[];
  imageUrls?: string[];
}

interface ImageSectionProps {
  editSpot: EditSpot;
  isEditing: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeImage: (index: number) => void;
}

const ImageContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 150px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(255, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  color: white;
`;

export const ImageSection: React.FC<ImageSectionProps> = ({
  editSpot,
  isEditing,
  handleImageUpload,
  removeImage,
}) => (
  <ImageContainer>
    {editSpot.imageUrls?.map((url, index) => (
      <ImageWrapper key={`url.${index}`}>
        <Image src={url} alt={`${editSpot.name || "New Spot"} ${index}`} />
        {isEditing && (
          <RemoveImageButton onClick={() => removeImage(index)}>
            <DeleteIcon fontSize="small" />
          </RemoveImageButton>
        )}
      </ImageWrapper>
    ))}
    {editSpot.images?.map((file, index) => (
      <ImageWrapper key={`file.${index}`}>
        <Image src={URL.createObjectURL(file)} alt={`New ${index}`} />
        {isEditing && (
          <RemoveImageButton onClick={() => removeImage((editSpot.imageUrls?.length || 0) + index)}>
            <DeleteIcon fontSize="small" />
          </RemoveImageButton>
        )}
      </ImageWrapper>
    ))}
    {isEditing && (
      <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
    )}
  </ImageContainer>
);