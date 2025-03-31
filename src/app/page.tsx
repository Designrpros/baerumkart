"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../data/spots";

const imageMap: { [key: string]: string } = {
  "1": "/Hero.jpg",
  "2": "/Hero2.jpg",
  "3": "/Hero3.jpg",
  "4": "/Hero4.jpg",
  "5": "/Hero.jpg",
  "6": "/Hero2.jpg",
};

const HomePage = styled.div`
  padding: 0;
  margin: 0;
  min-height: 95vh; /* Adjusted to 95vh */
  width: 100vw;
  overflow-x: hidden;
  background-color: #fff; /* Light background to contrast with hero section */
`;

const HeroSection = styled.section`
  position: relative;
  height: 50vh;
  background-image: url("/Hero.jpg");
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
  width: 100vw;
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
  font-size: 3rem; /* Increased font size */
  font-weight: bold;
  margin-bottom: 1rem;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 2px; /* Added spacing for more impact */
`;

const SearchContainer = styled.div`
  z-index: 1;
  width: 100%;
  max-width: 500px;
  margin-top: 1rem;
  position: relative;
  border-radius: 30px; /* Rounded corners for search container */
`;

const SearchInput = styled.input<{ $expanded: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border-radius: ${({ $expanded }) => ($expanded ? "20px 20px 0 0" : "20px")};
  border: none;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  font-family: "Helvetica", sans-serif;
  transition: all 0.3s ease;
  background-color: #fff;
`;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  max-width: 500px;
  max-height: 300px;
  overflow-y: auto;
  background: #fff;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 1002;
  padding: 0.5rem;
`;

const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f4f4f4;
  }
`;

const ResultContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  flex-grow: 1;
`;

const ResultImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
  margin-left: 0.5rem;
`;

const SearchResultTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #1a1a1a;
`;

const SearchResultDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const CategorySection = styled.section`
  padding: 3rem 1rem;
  text-align: center;
  background-color: #ffff;
`;

const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #333;
`;

const CategoryContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
`;

const CategoryCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: scale(1.1); /* Slight scale increase on hover */
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); /* Added shadow on hover */
  }
`;

const CategoryIcon = styled.div`
  width: 60px;
  height: 60px;
  background-color: #e6f0e6;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CategoryLabel = styled.p`
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  color: #333;
`;

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [spotsList, setSpotsList] = useState<Spot[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "spots"), (snapshot) => {
      const fetchedSpots = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Spot[];
      setSpotsList(fetchedSpots);
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    { name: "Fottur", icon: "/icons/hiking.png" },
    { name: "Skitur", icon: "/icons/skiing.png" },
    { name: "Utsiktspunkt", icon: "/icons/viewpoint.png" },
    { name: "Bålplass", icon: "/icons/campfire.png" },
    { name: "Rullestolvennlig", icon: "/icons/accessible.png" },
    { name: "Gapahuk", icon: "/icons/gapahuk.png" },
    { name: "Badeplass", icon: "/icons/swimming.png" },
    { name: "Klatrefelt", icon: "/icons/climbing.png" },
    { name: "Fiskeplass", icon: "/icons/fishing.png" },
    { name: "Hengekøye", icon: "/icons/hammock.png" },
    { name: "Sykkeltur", icon: "/icons/cycling.png" },
    { name: "Teltplass", icon: "/icons/tent.png" },
    { name: "Hytter", icon: "/icons/cabin.png" },
  ];

  const handleCategoryClick = (category: string) => {
    router.push(`/oversikt?category=${category}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsSearchExpanded(e.target.value.length > 0);
  };

  const handleSearchResultClick = (spotId: string) => {
    setSearchQuery("");
    setIsSearchExpanded(false);
    router.push(`/location/${spotId}`);
  };

  const filteredSpots = spotsList.filter((spot: Spot) =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <HomePage>
      <Head>
        <title>BærumKart - Nedtur og Opptur</title>
        <meta name="description" content="Utforsk Bærum med BærumKart!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <HeroSection>
        <HeroTitle>Finn din tur i Bærum</HeroTitle>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Hvor vil du på tur?"
            $expanded={isSearchExpanded}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchExpanded(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
          />
          {isSearchExpanded && (
            <SearchResults>
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot: Spot) => (
                  <SearchResultItem
                    key={spot.id}
                    onClick={() => handleSearchResultClick(spot.id)}
                  >
                    <ResultContent>
                      <SearchResultTitle>{spot.name}</SearchResultTitle>
                      <SearchResultDescription>{spot.description}</SearchResultDescription>
                    </ResultContent>
                    <ResultImage
                      src={imageMap[spot.id] || "/Hero.jpg"}
                      alt={spot.name}
                    />
                  </SearchResultItem>
                ))
              ) : (
                <SearchResultItem>Ingen resultater funnet.</SearchResultItem>
              )}
            </SearchResults>
          )}
        </SearchContainer>
      </HeroSection>

      <CategorySection>
        <CategoryTitle>Finn din neste...</CategoryTitle>
        <CategoryContainer>
          {categories.map((category) => (
            <CategoryCard
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
            >
              <CategoryIcon>
                <img src={category.icon} alt={category.name} style={{ width: '40px', height: '40px' }} />
              </CategoryIcon>
              <CategoryLabel>{category.name}</CategoryLabel>
            </CategoryCard>
          ))}
        </CategoryContainer>
      </CategorySection>
    </HomePage>
  );
}
