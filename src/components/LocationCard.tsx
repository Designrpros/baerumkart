import styled from "styled-components";
import { Spot } from "../data/spots";

interface LocationCardProps {
  spot: Spot;
  variant?: "primary" | "compact" | "detailed";
  onClick?: () => void;
}

const CardWrapper = styled.div<{ variant: "primary" | "compact" | "detailed" }>`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  font-family: "Helvetica", sans-serif;
  height: ${({ variant }) => (variant === "compact" ? "140px" : "auto")};

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    max-width: 500px;
  }
`;

const Image = styled.img<{ variant: "primary" | "compact" | "detailed" }>`
  width: ${({ variant }) => (variant === "compact" ? "140px" : "240px")};
  height: 100%;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
`;

const Content = styled.div<{ variant: "primary" | "compact" | "detailed" }>`
  padding: ${({ variant }) => (variant === "compact" ? "1rem" : "1.5rem")};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  flex-grow: 1;
`;

const Title = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.2;
  margin: 0 0 0.75rem 0;
`;

const DetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Detail = styled.p`
  font-size: 0.95rem;
  color: #4a4a4a;
  margin: 0;
  line-height: 1.4;
  text-align: left;
`;

const Tag = styled.span`
  display: inline-block;
  background: #e6f0e6;
  color: #1a3c34;
  padding: 0.3rem 0.75rem;
  border-radius: 16px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-right: 0.5rem;
  text-transform: capitalize;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
`;

const LocationCard: React.FC<LocationCardProps> = ({
  spot,
  variant = "primary",
  onClick,
}) => {
  const imageSrc = spot.photos && spot.photos.length > 0 ? spot.photos[0] : "/placeholder.jpg";

  return (
    <CardWrapper variant={variant} onClick={onClick}>
      <Content variant={variant}>
        <Title>{spot.name}</Title>
        <Tags>
          <Tag>{spot.category}</Tag>
          <Tag>{spot.difficulty}</Tag>
          <Tag>{spot.wheelchairAccessible ? "♿ Rullestolvennlig" : "Ikke rullestolvennlig"}</Tag>
        </Tags>
        <DetailWrapper>
          {variant !== "compact" && <Detail>{spot.description}</Detail>}
          <Detail>Vurdering: <strong>{spot.rating ?? 0}/5</strong></Detail>
          {variant === "detailed" && (
            <Detail>Koordinater: {spot.coordinates.lat}, {spot.coordinates.lng}</Detail>
          )}
        </DetailWrapper>
      </Content>
      <Image src={imageSrc} alt={spot.name} variant={variant} />
    </CardWrapper>
  );
};

export default LocationCard;