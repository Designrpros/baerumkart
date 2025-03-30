"use client";

import React, { useRef } from "react";
import styled from "styled-components";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

interface PickerProps<T> {
  options: T[];
  selectedValues: T[]; // Consistent with multi-select support
  onSelect: (value: T) => void;
  onRemove: (value: T) => void;
  placeholder: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  getLabel: (option: T) => string;
  multiSelect: boolean;
}

const PickerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
`;

const PickerButton = styled.button`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  width: 100%;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PickerDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #ddd;
  max-height: ${({ isOpen }) => (isOpen ? "300px" : "0")};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  overflow-y: auto;
  z-index: 1000;
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const PickerOption = styled.div`
  padding: 10px;
  cursor: pointer;
  &:hover {
    background: #f0f0f0;
  }
`;

export const Picker = <T,>({
  options,
  selectedValues,
  onSelect,
  onRemove,
  placeholder,
  isOpen,
  setIsOpen,
  getLabel,
  multiSelect,
}: PickerProps<T>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <PickerContainer>
      <PickerButton ref={buttonRef} onClick={() => setIsOpen(!isOpen)}>
        {selectedValues.length > 0
          ? multiSelect
            ? `${selectedValues.length} valgt`
            : getLabel(selectedValues[0])
          : placeholder}
        {isOpen ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </PickerButton>
      <PickerDropdown isOpen={isOpen}>
        {options.map((option) => (
          <PickerOption
            key={getLabel(option)}
            onClick={() => {
              onSelect(option);
              if (!multiSelect) setIsOpen(false);
            }}
          >
            {getLabel(option)}
          </PickerOption>
        ))}
      </PickerDropdown>
    </PickerContainer>
  );
};