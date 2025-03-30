"use client";

import React from "react";
import styled from "styled-components";

// Styled Component
const StyledToggleButton = styled.button`
  position: absolute;
  top: 50%;
  right: -20px;
  width: 20px;
  height: 40px;
  background: #2e7d32;
  color: white;
  border: none;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: background 0.2s ease;

  &:hover {
    background: #1b5e20;
  }
`;

interface ToggleButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({ isOpen, onClick }) => {
  return (
    <StyledToggleButton onClick={onClick}>{isOpen ? "❯" : "❮"}</StyledToggleButton>
  );
};