// src/app/map/BottomSheet.tsx
import styled from "styled-components";
import { Spot } from "../../../data/spots";

const BottomSheetStyled = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: ${({ $isOpen }) => ($isOpen ? "50vh" : "0")};
  background: linear-gradient(135deg, #ffffff 0%, #f9f9f9 100%);
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  padding: ${({ $isOpen }) => ($isOpen ? "0" : "0")};
  overflow-y: auto;
  transition: height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  font-family: "Helvetica", sans-serif;

  @media (min-width: 769px) {
    display: none;
  }
`;

const SheetInner = styled.div`
  padding: 1rem;
`;

const SheetImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  margin: 0;
`;

const SheetTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const SheetContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const SheetItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  position: sticky;
  bottom: 1rem;
  padding: 0.5rem 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%);
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

interface BottomSheetProps {
  isOpen: boolean;
  spot: Spot | null;
  onClose: () => void;
  onDetailClick: (spotId: string) => void;
}

export const BottomSheet = ({ isOpen, spot, onClose, onDetailClick }: BottomSheetProps) => {
  if (!spot) return null;

  const imageSrc = spot.photos && spot.photos.length > 0 ? spot.photos[0] : "/placeholder.jpg";

  return (
    <BottomSheetStyled $isOpen={isOpen}>
      <SheetImage src={imageSrc} alt={spot.name} />
      <SheetInner>
        <SheetTitle>{spot.name}</SheetTitle>
        <SheetContent>
          <SheetItem><strong>Kategori:</strong> {spot.category}</SheetItem>
          <SheetItem><strong>Vanskelighetsgrad:</strong> {spot.difficulty}</SheetItem>
          <SheetItem><strong>Tilgjengelighet:</strong> {spot.wheelchairAccessible ? "Ja" : "Nei"}</SheetItem>
          <SheetItem>{spot.description}</SheetItem>
          <SheetItem><strong>Vurdering:</strong> {spot.rating ?? 0}/5</SheetItem>
          <SheetItem><strong>Koordinater:</strong> {spot.coordinates.lat}, {spot.coordinates.lng}</SheetItem>
        </SheetContent>
        <ButtonContainer>
          <CloseButton onClick={onClose}>Lukk</CloseButton>
          <DetailButton onClick={() => onDetailClick(spot.id)}>Se Detaljer</DetailButton>
        </ButtonContainer>
      </SheetInner>
    </BottomSheetStyled>
  );
};