// components/SearchCard.tsx
import styled from "styled-components";
import { Spot } from "../data/spots";

interface SearchCardProps {
  spot: Spot;
  onClick?: () => void;
}

const SearchCardWrapper = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 500px;

  &:hover {
    background: #f5f5f5;
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const SearchImage = styled.div`
  width: 60px;
  height: 60px;
  background: #e6f0e6;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  flex-shrink: 0;
`;

const SearchContent = styled.div`
  flex: 1;
`;

const SearchTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.25rem;
`;

const SearchDescription = styled.p`
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const SearchCard: React.FC<SearchCardProps> = ({ spot, onClick }) => {
  return (
    <SearchCardWrapper onClick={onClick}>
      <SearchImage>📷</SearchImage>
      <SearchContent>
        <SearchTitle>{spot.name}</SearchTitle>
        <SearchDescription>{spot.description}</SearchDescription>
      </SearchContent>
    </SearchCardWrapper>
  );
};

export default SearchCard;