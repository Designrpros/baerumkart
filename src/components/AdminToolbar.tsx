"use client";

import React from "react";
import styled from "styled-components";
import { useAdminContext } from "../contexts/AdminContext";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeIcon from "@mui/icons-material/Home";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PersonIcon from "@mui/icons-material/Person";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import AnalyticsIcon from "@mui/icons-material/Analytics";

const Nav = styled.nav`
  background: #ffffff;
  padding: 8px 0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", Arial, sans-serif;
  height: 56px;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0 10px;
  width: 100%;
  max-width: 1200px;
  justify-content: space-around;

  @media (max-width: 768px) {
    flex-direction: row;
    overflow-x: auto;
    white-space: nowrap;
    justify-content: flex-start;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const NavItem = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  color: ${({ $isActive }) => ($isActive ? "#1a1a1a" : "#666")};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: clamp(12px, 2vw, 14px);
  font-weight: ${({ $isActive }) => ($isActive ? "600" : "400")};
  position: relative;
  flex: 1;
  justify-content: center;
  text-align: center;
  background: none;
  border: none;
  transition: color 0.2s ease, transform 0.2s ease;

  svg {
    font-size: clamp(18px, 3vw, 20px);
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: ${({ $isActive }) => ($isActive ? "60%" : "0")};
    height: 2px;
    background: #1a1a1a;
    border-radius: 2px;
    transition: width 0.2s ease;
  }

  &:hover {
    color: #333;
    transform: translateY(-1px);
  }

  &:hover::after {
    width: 40%;
  }

  @media (max-width: 768px) {
    flex: none;
    min-width: 100px;
    padding: 6px 12px;
  }
`;

const AdminToolbar = () => {
  const { activeTab, setActiveTab } = useAdminContext();

  const handleTabClick = (tab: string) => {
    console.log("[AdminToolbar] Switching to tab:", tab);
    setActiveTab(tab);
  };

  return (
    <Nav>
      <NavList>
        <NavItem
          $isActive={activeTab === "dashboard"}
          onClick={() => handleTabClick("dashboard")}
        >
          {activeTab === "dashboard" ? <HomeIcon /> : <HomeOutlinedIcon />}
          Oversikt
        </NavItem>
        <NavItem
          $isActive={activeTab === "spots"}
          onClick={() => handleTabClick("spots")}
        >
          {activeTab === "spots" ? <PlaceIcon /> : <PlaceOutlinedIcon />}
          Steder
        </NavItem>
        <NavItem
          $isActive={activeTab === "users"}
          onClick={() => handleTabClick("users")}
        >
          {activeTab === "users" ? <PersonIcon /> : <PersonOutlineIcon />}
          Brukere
        </NavItem>
        <NavItem
          $isActive={activeTab === "analytics"}
          onClick={() => handleTabClick("analytics")}
        >
          {activeTab === "analytics" ? <AnalyticsIcon /> : <AnalyticsOutlinedIcon />}
          Analyse
        </NavItem>
      </NavList>
    </Nav>
  );
};

export default AdminToolbar;