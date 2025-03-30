// src/app/map/Sidebar.tsx
import styled from "styled-components";
import { Spot } from "../../../data/spots";

const SidebarStyled = styled.div<{ $isOpen: boolean }>`
  width: ${({ $isOpen }) => ($isOpen ? "300px" : "0")};
  height: 100%; /* Full map height below hero */
  background: #fff;
  border-left: 1px solid #eee;
  padding: ${({ $isOpen }) => ($isOpen ? "0" : "0")};
  transition: width 0.3s ease;
  font-family: "Helvetica", sans-serif;
  z-index: 2;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SidebarInner = styled.div`
  padding: 1rem;
  flex-grow: 1;
`;

const SidebarImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  margin: 0; /* Edge-to-edge */
`;

const SidebarTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SidebarItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 0.5rem 0;
`;

const CloseButton = styled.button`
  background: #1a3c34;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2e7d32;
  }
`;

const DetailButton = styled.button`
  background: #4a4a4a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #666;
  }
`;

interface SidebarProps {
  isOpen: boolean;
  spot: Spot | null;
  onClose: () => void;
  onDetailClick: (spotId: string) => void;
}

export const Sidebar = ({ isOpen, spot, onClose, onDetailClick }: SidebarProps) => {
  if (!spot) return null;

  const imageSrc = spot.photos && spot.photos.length > 0 ? spot.photos[0] : "/placeholder.jpg";

  return (
    <SidebarStyled $isOpen={isOpen}>
      <SidebarImage src={imageSrc} alt={spot.name} />
      <SidebarInner>
        <SidebarTitle>{spot.name}</SidebarTitle>
        <SidebarContent>
          <SidebarItem><strong>Kategori:</strong> {spot.category}</SidebarItem>
          <SidebarItem><strong>Vanskelighetsgrad:</strong> {spot.difficulty}</SidebarItem>
          <SidebarItem><strong>Tilgjengelighet:</strong> {spot.wheelchairAccessible ? "Ja" : "Nei"}</SidebarItem>
          <SidebarItem>{spot.description}</SidebarItem>
          <SidebarItem><strong>Vurdering:</strong> {spot.rating ?? 0}/5</SidebarItem>
          <SidebarItem><strong>Koordinater:</strong> {spot.coordinates.lat}, {spot.coordinates.lng}</SidebarItem>
        </SidebarContent>
      </SidebarInner>
      <ButtonContainer>
        <CloseButton onClick={onClose}>Lukk</CloseButton>
        <DetailButton onClick={() => onDetailClick(spot.id)}>Se Detaljer</DetailButton>
      </ButtonContainer>
    </SidebarStyled>
  );
};