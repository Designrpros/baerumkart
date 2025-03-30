"use client";

import React from "react";
import styled from "styled-components";

// Styled Components
const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const CollapseToggle = styled.span`
  font-size: 0.8rem;
  color: #2e7d32;
`;

const SidebarList = styled.ul<{ $collapsed?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${({ $collapsed }) => ($collapsed ? "none" : "block")};
`;

const SidebarItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #424242;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  label {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
  }

  input[type="checkbox"] {
    margin-right: 10px;
    accent-color: #2e7d32;
  }
`;

interface CategoryListProps {
  visibleCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  categoriesCollapsed: boolean;
  toggleCategoriesSection: () => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({
  visibleCategories,
  toggleCategory,
  categoriesCollapsed,
  toggleCategoriesSection,
}) => {
  return (
    <SidebarSection>
      <SectionHeader>
        <SectionTitle onClick={toggleCategoriesSection}>Kategorier</SectionTitle>
        <CollapseToggle>{categoriesCollapsed ? "▼" : "▲"}</CollapseToggle>
      </SectionHeader>
      <SidebarList $collapsed={categoriesCollapsed}>
        {Object.keys(visibleCategories).map((category) => (
          <SidebarItem key={category}>
            <label>
              <input
                type="checkbox"
                checked={visibleCategories[category] ?? true}
                onChange={() => toggleCategory(category)}
              />
              {category}
            </label>
          </SidebarItem>
        ))}
      </SidebarList>
    </SidebarSection>
  );
};