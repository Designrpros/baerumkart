"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../../../data/spots";

interface LocationDetailPageProps {
  params: { spotId: string };
}

const LocationDetailPage = () => {
  const params = useParams<{ spotId: string }>();
  const router = useRouter();
  const { spotId } = params;
  const [spot, setSpot] = useState<Spot | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "spots"), (snapshot) => {
      const fetchedSpots = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Spot[];
      const currentSpot = fetchedSpots.find((s) => s.id === spotId) || null;
      setSpot(currentSpot);
    });
    return () => unsubscribe();
  }, [spotId]);

  if (!spot) {
    return (
      <PageWrapper>
        <Card>
          <h1>Sted ikke funnet</h1>
          <p>ID: {spotId} finnes ikke.</p>
          <BackButton onClick={() => router.push("/oversikt")}>Tilbake til Oversikt</BackButton>
        </Card>
      </PageWrapper>
    );
  }

  const imageSrc = spot.photos && spot.photos.length > 0 ? spot.photos[0] : "/placeholder.jpg";

  return (
    <PageWrapper>
      <HeroSection style={{ backgroundImage: `url(${imageSrc})` }}>
        <HeroTitle>{spot.name}</HeroTitle>
      </HeroSection>

      <ContentWrapper>
        <Card>
          <CardTitle>Om stedet</CardTitle>
          <Tags>
            <Tag>{spot.category}</Tag>
            <Tag>{spot.difficulty}</Tag>
            <Tag>{spot.wheelchairAccessible ? "♿ Rullestolvennlig" : "Ikke rullestolvennlig"}</Tag>
          </Tags>
          <Description>{spot.description}</Description>
          <InfoSection>
            <InfoItem><strong>Vurdering:</strong> {(spot.rating ?? 0)}/5</InfoItem>
            <InfoItem><strong>Vanskelighetsgrad:</strong> {spot.difficulty}</InfoItem>
            <InfoItem><strong>Koordinater:</strong> {spot.coordinates?.lat}, {spot.coordinates?.lng}</InfoItem>
            {spot.distance && <InfoItem><strong>Avstand:</strong> {spot.distance} km</InfoItem>}
            {spot.duration && <InfoItem><strong>Varighet:</strong> {spot.duration}</InfoItem>}
            {spot.elevation && <InfoItem><strong>Høyde:</strong> {spot.elevation} m</InfoItem>}
            {spot.facilities && <InfoItem><strong>Fasiliteter:</strong> {spot.facilities.join(", ")}</InfoItem>}
            {spot.addedBy && <InfoItem><strong>Lagt til av:</strong> {spot.addedBy}</InfoItem>}
            {spot.createdAt && (
              <InfoItem>
                <strong>Opprettet:</strong> {new Date(spot.createdAt).toLocaleDateString("no-NO")}
              </InfoItem>
            )}
          </InfoSection>
          {spot.reviews && spot.reviews.length > 0 && (
            <ReviewSection>
              <ReviewTitle>Anmeldelser</ReviewTitle>
              {spot.reviews.map((review, index) => (
                <Review key={index}>
                  <ReviewUser>{review.user}</ReviewUser>
                  <ReviewComment>{review.comment}</ReviewComment>
                  <ReviewRating>Vurdering: {review.rating}/5</ReviewRating>
                </Review>
              ))}
            </ReviewSection>
          )}
          <ButtonContainer>
            <BackButton onClick={() => router.push("/oversikt")}>Tilbake til Oversikt</BackButton>
            <MapButton onClick={() => router.push(`/map?highlight=${spot.id}`)}>Se på Kart</MapButton>
          </ButtonContainer>
        </Card>

        {spot.facilities && (
          <Card>
            <CardTitle>Fasiliteter</CardTitle>
            <CardContent>
              <CardItem>{spot.facilities.join(", ")}</CardItem>
            </CardContent>
          </Card>
        )}

        {spot.route && (
          <Card>
            <CardTitle>Ruteinformasjon (GPX)</CardTitle>
            <CardContent>
              <CardItem><strong>Antall punkter:</strong> {spot.route.length}</CardItem>
              {spot.routeDistance && <CardItem><strong>Rutelengde:</strong> {spot.routeDistance} km</CardItem>}
              {spot.routeType && <CardItem><strong>Rutetype:</strong> {spot.routeType}</CardItem>}
              {spot.routeElevationProfile && (
                <CardItem><strong>Høydeprofil tilgjengelig:</strong> {spot.routeElevationProfile.length} punkter</CardItem>
              )}
              <RouteList>
                {spot.route.slice(0, 5).map((point, index) => (
                  <RouteItem key={index}>
                    Punkt {index + 1}: Lat: {point.lat.toFixed(4)}, Lng: {point.lng.toFixed(4)}
                  </RouteItem>
                ))}
                {spot.route.length > 5 && (
                  <RouteItem>...og {spot.route.length - 5} flere punkter</RouteItem>
                )}
              </RouteList>
            </CardContent>
          </Card>
        )}

        {(spot.parking || spot.publicTransport || spot.accessNotes) && (
          <Card>
            <CardTitle>Adkomst</CardTitle>
            <CardContent>
              {spot.parking && (
                <CardItem>
                  <strong>Parkering:</strong> Lat: {spot.parking.lat}, Lng: {spot.parking.lng} - {spot.parking.description}
                </CardItem>
              )}
              {spot.publicTransport && <CardItem><strong>Kollektivtransport:</strong> {spot.publicTransport}</CardItem>}
              {spot.accessNotes && <CardItem><strong>Tilgangsnotater:</strong> {spot.accessNotes}</CardItem>}
            </CardContent>
          </Card>
        )}

        {(spot.weatherNotes || spot.season || spot.terrain || spot.updatedAt) && (
          <Card>
            <CardTitle>Tilleggsinformasjon</CardTitle>
            <CardContent>
              {spot.weatherNotes && <CardItem><strong>Værnotater:</strong> {spot.weatherNotes}</CardItem>}
              {spot.season && <CardItem><strong>Sesong:</strong> {spot.season}</CardItem>}
              {spot.terrain && <CardItem><strong>Terreng:</strong> {spot.terrain}</CardItem>}
              {spot.updatedAt && (
                <CardItem>
                  <strong>Oppdatert:</strong> {new Date(spot.updatedAt).toLocaleDateString("no-NO")}
                </CardItem>
              )}
            </CardContent>
          </Card>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 2rem 0;
`;

const HeroSection = styled.section`
  position: relative;
  height: 50vh;
  width: 100vw;
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  padding: 0;
  margin: 0;
  box-sizing: border-box;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: -5rem;
  position: relative;
  z-index: 2;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  font-family: "Helvetica", sans-serif;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a4a4a;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const InfoItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
`;

const Tag = styled.span`
  display: inline-block;
  background: #e6f0e6;
  color: #1a3c34;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-right: 0.75rem;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const RouteList = styled.ul`
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 0;
`;

const RouteItem = styled.li`
  font-size: 0.95rem;
  color: #4a4a4a;
  line-height: 1.5;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CardItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const BackButton = styled.button`
  background: #1a3c34;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Helvetica", sans-serif;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2e7d32;
  }
`;

const MapButton = styled.button`
  background: #4a4a4a;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Helvetica", sans-serif;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #666;
  }
`;

const ReviewSection = styled.div`
  margin-top: 2rem;
`;

const ReviewTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;
`;

const Review = styled.div`
  border-bottom: 1px solid #eee;
  padding: 1rem 0;

  &:last-child {
    border-bottom: none;
  }
`;

const ReviewUser = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;
`;

const ReviewComment = styled.p`
  font-size: 0.95rem;
  color: #4a4a4a;
  margin-bottom: 0.5rem;
`;

const ReviewRating = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

export default LocationDetailPage;