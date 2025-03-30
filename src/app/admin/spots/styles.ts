"use client";

import styled from "styled-components";

export const Container = styled.div`
  background: #fff;
  padding: clamp(15px, 3vw, 30px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: "Helvetica", sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(15px, 3vw, 20px);
  text-align: center;
  color: #1a1a1a;
`;

export const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  justify-content: space-between; /* Ensures button stays to the right */
`;

export const SearchBar = styled.input`
  flex: 1; /* Takes remaining space */
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  border-radius: 8px;
  border: 1px solid #1a1a1a;
  background: #fff;
  color: #1a1a1a;
  outline: none;
`;

export const SpotList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

export const SpotItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
`;

export const SpotHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 2vw, 15px);
  cursor: pointer;
  background: #f9f9f9;
`;

export const SpotName = styled.h3`
  font-size: clamp(16px, 3vw, 18px);
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
`;

export const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: clamp(14px, 2vw, 16px);
  color: #555;
  cursor: pointer;
`;

export const SpotDetails = styled.div<{ isOpen: boolean }>`
  max-height: ${({ isOpen }) => (isOpen ? "600px" : "0")};
  width: 100%;
  max-width: 1200px;
  overflow-y: auto;
  transition: max-height 0.3s ease;
  padding: ${({ isOpen }) => (isOpen ? "clamp(20px, 4vw, 30px)" : "0 clamp(20px, 4vw, 30px)")};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: #fafafa;
  border-top: 1px solid #eee;
`;

export const Image = styled.img`
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  margin-bottom: clamp(10px, 2vw, 15px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const DetailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  width: 100%;
  max-width: 1100px;
`;

export const DetailItem = styled.li`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 15px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: clamp(14px, 2vw, 16px);
  color: #333;

  &:last-child {
    border-bottom: none;
  }
`;

export const DetailLabel = styled.span`
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
`;

export const DetailValue = styled.span`
  color: #555;
  word-break: break-word;
`;

export const DescriptionText = styled.pre`
  font-size: clamp(14px, 2vw, 16px);
  color: #555;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  width: 100%;
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.1s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

export const EditButton = styled(ActionButton)`
  background: #ff6f61;
  color: white;
`;

export const SaveButton = styled(ActionButton)`
  background: #1a1a1a;
  color: white;
`;

export const DeleteButton = styled(ActionButton)`
  background: #d32f2f;
  color: white;
`;

export const CancelButton = styled(ActionButton)`
  background: #ccc;
  color: #333;
`;

export const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  width: 100%;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #1a1a1a;
  }
`;

export const Textarea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  width: 100%;
  min-height: 120px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #1a1a1a;
  }
`;

export const PickerContainer = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

export const PickerButton = styled.button`
  padding: 10px 15px;
  font-size: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #1a1a1a;
  }
`;

export const PickerDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  max-height: ${({ isOpen }) => (isOpen ? "300px" : "0")};
  overflow-y: auto;
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: max-height 0.3s ease;
  z-index: 1000;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  display: block;
`;

export const PickerOption = styled.div`
  padding: 10px 15px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  text-align: left;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background: #f5f5f5;
  }
`;

export const AddForm = styled.div`
  display: flex;
  flex-direction: column; /* Keep form vertical */
  gap: 10px;
  padding: 10px 0;
  width: 100%;
  max-width: 600px;
  align-items: center;
`;

export const AddButton = styled.button`
  width: 40px;
  height: 40px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #333;
  }
`;

export const ErrorText = styled.p`
  color: #ff4444;
  font-size: clamp(12px, 2vw, 14px);
  text-align: center;
`;

export const CategoryFilters = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
`;

export const FilterButton = styled.button<{ isActive: boolean }>`
  padding: clamp(6px, 1vw, 8px) clamp(10px, 2vw, 15px);
  font-size: clamp(12px, 2vw, 14px);
  background: ${({ isActive }) => (isActive ? "#1a1a1a" : "transparent")};
  color: ${({ isActive }) => (isActive ? "#fff" : "#1a1a1a")};
  border: 1px solid #1a1a1a;
  border-radius: 20px;
  cursor: pointer;
`;

export const MapContainer = styled.div`
  width: 300px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-left: auto;
`;