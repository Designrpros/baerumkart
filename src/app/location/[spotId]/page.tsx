"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import styled from "styled-components";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Spot } from "../../../data/spots";

interface LocationDetailPageProps {
  params: { spotId: string };
}

const LocationDetailPage = () => {
  const params = useParams<{ spotId: string }>();
  const router = useRouter();
  const { spotId } = params;
  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribeSpots = onSnapshot(collection(db, "spots"), (snapshot) => {
      const fetchedSpots = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Spot[];
      const currentSpot = fetchedSpots.find((s) => s.id === spotId) || null;
      setSpot(currentSpot);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => {
      unsubscribeSpots();
      unsubscribeAuth();
    };
  }, [spotId]);

  const handleHyttebokSubmit = async () => {
    if (!isLoggedIn || !comment || !rating) {
      alert("Logg inn og fyll ut kommentar og vurdering for å legge til i hytteboken.");
      return;
    }
    try {
      const newReview = {
        user: auth.currentUser?.email || "Anonym",
        comment,
        rating,
        timestamp: Date.now(),
      };
      await addDoc(collection(db, "spots", spotId, "reviews"), newReview);
      setComment("");
      setRating(null);
      // Spot updates via onSnapshot, no need to manually update here
    } catch (error) {
      console.error("Error adding hyttebok entry:", error);
    }
  };

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
        {/* Overview Section */}
        <Card>
          <CardTitle>Oversikt</CardTitle>
          <Tags>
            <Tag>{spot.category}</Tag>
            <Tag>{spot.difficulty}</Tag>
            <Tag>{spot.wheelchairAccessible ? "♿ Rullestolvennlig" : "Ikke rullestolvennlig"}</Tag>
          </Tags>
        </Card>

        {/* Description Section */}
        <Card>
          <CardTitle>Beskrivelse</CardTitle>
          <Description>{spot.description}</Description>
        </Card>

        {/* Key Info Section */}
        <Card>
          <CardTitle>Nøkkelinformasjon</CardTitle>
          <InfoSection>
            <InfoItem><strong>Vurdering:</strong> {(spot.rating ?? 0)}/5</InfoItem>
            <InfoItem><strong>Koordinater:</strong> {spot.coordinates?.lat}, {spot.coordinates?.lng}</InfoItem>
            {spot.distance && <InfoItem><strong>Avstand:</strong> {spot.distance} km</InfoItem>}
            {spot.duration && <InfoItem><strong>Varighet:</strong> {spot.duration}</InfoItem>}
            {spot.elevation && <InfoItem><strong>Høyde:</strong> {spot.elevation} m</InfoItem>}
            {spot.addedBy && <InfoItem><strong>Lagt til av:</strong> {spot.addedBy}</InfoItem>}
            {spot.createdAt && (
              <InfoItem>
                <strong>Opprettet:</strong> {new Date(spot.createdAt).toLocaleDateString("no-NO")}
              </InfoItem>
            )}
          </InfoSection>
          <ButtonContainer>
            <BackButton onClick={() => router.push("/oversikt")}>Tilbake til Oversikt</BackButton>
            <MapButton onClick={() => router.push(`/map?highlight=${spot.id}`)}>Se på Kart</MapButton>
          </ButtonContainer>
        </Card>

        {/* Map Section (Edge-to-Edge, Conditional on Coordinates) */}
        {(spot.coordinates || spot.route) && (
          <MapCard>
            <CardTitle>Kart</CardTitle>
            <MapPlaceholder hasRoute={!!spot.route}>
              <p>
                {spot.route
                  ? "[Kart med rutevisning kommer her]"
                  : "[Kart med stedets posisjon kommer her]"}
              </p>
            </MapPlaceholder>
          </MapCard>
        )}

        {/* Gallery and Videos Section */}
        <Card>
          <CardTitle>Galleri og Videoer</CardTitle>
          <GallerySection>
            {spot.photos && spot.photos.length > 0 ? (
              spot.photos.map((photo, index) => (
                <GalleryImage key={index} src={photo} alt={`Bilde ${index + 1}`} />
              ))
            ) : (
              <p>[Ingen bilder tilgjengelig ennå]</p>
            )}
            <p>[Plassholder for videoer kommer her]</p>
          </GallerySection>
        </Card>

        {/* Placeholder Additional Info Sections */}
        <Card>
          <CardTitle>Detaljer</CardTitle>
          <CardContent>
            <CardItem>[Plassholder for mer detaljert informasjon]</CardItem>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Tips</CardTitle>
          <CardContent>
            <CardItem>[Plassholder for brukertips eller anbefalinger]</CardItem>
          </CardContent>
        </Card>

        {/* Facilities Section */}
        {spot.facilities && (
          <Card>
            <CardTitle>Fasiliteter</CardTitle>
            <CardContent>
              <CardItem>{spot.facilities.join(", ")}</CardItem>
            </CardContent>
          </Card>
        )}

        {/* Access Section */}
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

        {/* Additional Info Section */}
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

        {/* Hyttebok Section */}
        <Card>
          <CardTitle>Hyttebok</CardTitle>
          {isLoggedIn && (
            <HyttebokForm>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Skriv din kommentar her..."
                rows={3}
              />
              <RatingSection>
                <label>Vurdering (1-5):</label>
                <select
                  value={rating || ""}
                  onChange={(e) => setRating(parseInt(e.target.value) || null)}
                >
                  <option value="">Velg vurdering</option>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </RatingSection>
              <SubmitButton onClick={handleHyttebokSubmit}>Legg til i Hyttebok</SubmitButton>
            </HyttebokForm>
          )}
          <ReviewSection>
            {spot.reviews && spot.reviews.length > 0 ? (
              spot.reviews.map((review, index) => (
                <Review key={index}>
                  <ReviewUser>{review.user}</ReviewUser>
                  <ReviewComment>{review.comment}</ReviewComment>
                  <ReviewRating>Vurdering: {review.rating}/5</ReviewRating>
                </Review>
              ))
            ) : (
              <p>Ingen hyttebokinnlegg ennå.</p>
            )}
          </ReviewSection>
        </Card>
      </ContentWrapper>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 0 2rem 0;

  @media (max-width: 768px) {
    padding: 0 0 1rem 0;
  }
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

  @media (max-width: 768px) {
    height: 30vh;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
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

  @media (max-width: 768px) {
    max-width: 90%;
    margin-top: -3rem;
    gap: 1rem;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  font-family: "Helvetica", sans-serif;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const MapCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  font-family: "Helvetica", sans-serif;
  width: 100%; /* Edge-to-edge within ContentWrapper */
  max-width: 1200px; /* Match SpotList max-width for consistency */
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 8px;
  }
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #4a4a4a;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.4;
    margin-bottom: 1rem;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const InfoItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
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

  @media (max-width: 768px) {
    padding: 0.3rem 0.75rem;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    gap: 0.25rem;
    margin-bottom: 1rem;
  }
`;

const MapPlaceholder = styled.div<{ hasRoute: boolean }>`
  width: 100%;
  height: ${({ hasRoute }) => (hasRoute ? "400px" : "300px")}; /* Taller if route */
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;

  @media (max-width: 768px) {
    height: ${({ hasRoute }) => (hasRoute ? "250px" : "200px")}; /* Smaller on mobile */
  }
`;

const GallerySection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
`;

const GalleryImage = styled.img`
  width: 150px; /* Default for larger screens */
  height: 100px;
  object-fit: cover;
  border-radius: 8px;

  @media (max-width: 768px) {
    width: 100px; /* Smaller on mobile */
    height: 75px;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const CardItem = styled.p`
  font-size: 1rem;
  color: #333;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    align-items: center;
  }
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

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
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

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    width: 100%;
    max-width: 200px;
  }
`;

const HyttebokForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  textarea {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: "Helvetica", sans-serif;
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1rem;

    textarea {
      font-size: 0.9rem;
    }
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  label {
    font-size: 1rem;
  }

  select {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: "Helvetica", sans-serif;
  }

  @media (max-width: 768px) {
    label {
      font-size: 0.9rem;
    }

    select {
      padding: 0.3rem;
      font-size: 0.9rem;
    }
  }
`;

const SubmitButton = styled.button`
  background: #ff6f61;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-family: "Helvetica", sans-serif;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #ff897d;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const ReviewSection = styled.div`
  margin-top: 2rem;

  @media (max-width: 768px) {
    margin-top: 1rem;
  }
`;

const Review = styled.div`
  border-bottom: 1px solid #eee;
  padding: 1rem 0;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0;
  }
`;

const ReviewUser = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
`;

const ReviewComment = styled.p`
  font-size: 0.95rem;
  color: #4a4a4a;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
  }
`;

const ReviewRating = styled.p`
  font-size: 0.9rem;
  color: #666;

  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

export default LocationDetailPage;