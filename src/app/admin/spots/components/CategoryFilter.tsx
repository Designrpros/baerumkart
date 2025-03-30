"use client";

import React from "react";
import { CategoryFilters, FilterButton } from "../styles";

interface CategoryFilterProps {
  filterCategories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export const CategoryFilter = ({ filterCategories, selectedCategory, setSelectedCategory }: CategoryFilterProps) => {
  return (
    <CategoryFilters>
      {filterCategories.map((cat) => (
        <FilterButton
          key={cat}
          isActive={selectedCategory === cat}
          onClick={() => setSelectedCategory(cat)}
        >
          {cat}
        </FilterButton>
      ))}
    </CategoryFilters>
  );
};