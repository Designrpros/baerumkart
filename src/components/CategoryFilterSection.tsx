import React from "react";
import styled from "styled-components";

const CategoryFilters = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  width: 100%;
  max-width: 600px;
  justify-content: center;
`;

const FilterButton = styled.button<{ $isActive: boolean }>`
  padding: clamp(6px, 1vw, 8px) clamp(10px, 2vw, 15px);
  font-size: clamp(12px, 2vw, 14px);
  background: ${({ $isActive }) => ($isActive ? "#1a1a1a" : "transparent")};
  color: ${({ $isActive }) => ($isActive ? "#fff" : "#1a1a1a")};
  border: 1px solid #1a1a1a;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

interface CategoryFilterSectionProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filterCategories: string[];
}

export const CategoryFilterSection: React.FC<CategoryFilterSectionProps> = ({
  selectedCategory,
  setSelectedCategory,
  filterCategories,
}) => (
  <CategoryFilters>
    {filterCategories.map((cat) => (
      <FilterButton
        key={cat}
        $isActive={selectedCategory === cat}
        onClick={() => setSelectedCategory(cat)}
      >
        {cat}
      </FilterButton>
    ))}
  </CategoryFilters>
);