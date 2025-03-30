"use client";

import React from "react";
import styled from "styled-components";
import { ToggleButton } from "./ToggleButton";

// Styled Components
const StyledSidebar = styled.div<{ open: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ open }) => (open ? "0" : "-300px")};
  width: 300px;
  height: 100%;
  background: #ffffff;
  padding: 20px;
  transition: left 0.3s ease;
  z-index: 1000;
  font-family: "Arial", sans-serif;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const SidebarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2e7d32;
  margin: 0;
`;

interface SidebarProps {
  open: boolean;
  toggleSidebar: () => void;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, toggleSidebar, children }) => {
  return (
    <StyledSidebar open={open}>
      {children}
      <ToggleButton isOpen={open} onClick={toggleSidebar} />
    </StyledSidebar>
  );
};