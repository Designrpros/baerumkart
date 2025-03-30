"use client";

import React from "react";
import styled from "styled-components";
import { Spot } from "../types/mapTypes";

// Styled Components
const SpotsListStyled = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const SpotItemStyled = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #424242;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 500;
    color: #2e7d32;
  }

  p {
    margin: 4px 0 0;
    font-size: 0.85rem;
    color: #666;
  }
`;

interface SpotListProps {
  spots: Spot[];
  panToSpot: (coordinates: { lat: number; lng: number }) => void;
}

export const SpotList: React.FC<SpotListProps> = ({ spots, panToSpot }) => {
  return (
    <SpotsListStyled>
      <SectionTitle>Steder</SectionTitle>
      {spots.map((spot) => (
        <SpotItemStyled
          key={spot.id}
          onClick={() => panToSpot(spot.coordinates || { lat: 59.95, lng: 10.6 })}
        >
          <h4>{spot.name}</h4>
          <p>{spot.category}</p>
        </SpotItemStyled>
      ))}
    </SpotsListStyled>
  );
};