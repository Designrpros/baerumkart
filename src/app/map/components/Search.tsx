// src/app/map/Search.tsx
import { useState } from "react"; // Add this import
import styled from "styled-components";
import { Spot } from "../../../data/spots";

const SearchContainer = styled.div`
  z-index: 1;
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
  position: relative;

  @media (max-width: 768px) {
    max-width: 90%;
    padding: 0 1rem;
  }
`;

const SearchInput = styled.input<{ $expanded: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border-radius: ${({ $expanded }) => ($expanded ? "20px 20px 0 0" : "20px")};
  border: none;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", sans-serif;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: #fff;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  padding: 0.5rem;
`;

const SearchResultItem = styled.div`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  h3 {
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }

  p {
    font-size: 0.8rem;
    color: #666;
    margin: 0;
  }
`;

interface SearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setSelectedSpot: (spot: Spot) => void;
  filteredSpots: Spot[];
}

export const Search = ({ searchQuery, setSearchQuery, setSelectedSpot, filteredSpots }: SearchProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Søk etter steder..."
        $expanded={isExpanded}
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setIsExpanded(e.target.value.length > 0);
        }}
        onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
      />
      {isExpanded && (
        <SearchResults>
          {filteredSpots.length > 0 ? (
            filteredSpots.map((spot) => (
              <SearchResultItem key={spot.id} onClick={() => setSelectedSpot(spot)}>
                <h3>{spot.name}</h3>
                <p>{spot.description}</p>
              </SearchResultItem>
            ))
          ) : (
            <SearchResultItem>Ingen resultater funnet.</SearchResultItem>
          )}
        </SearchResults>
      )}
    </SearchContainer>
  );
};