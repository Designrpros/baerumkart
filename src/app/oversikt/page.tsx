"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";
import { db } from "../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../../data/spots";
import { CategoryFilterSection } from "../../components/CategoryFilterSection";
import { FilterSheet } from "../../components/FilterSheet";
import LocationCard from "../../components/LocationCard";
import "../styles/Oversikt.css";

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 50vh;
  background-image: url("/Hero4.jpg");
  background-size: cover;
  background-position: center;
  position: relative;
  color: white;

  @media (max-width: 768px) {
    height: 30vh;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  z-index: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

const FilterToggleButton = styled.button`
  position: fixed;
  top: 60px;
  right: 20px;
  padding: 0.75rem 1.5rem;
  background-color: #fff;
  color: black;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  z-index: 999;
  font-family: "Helvetica", sans-serif;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #e6f0e6;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const SpotListSection = styled.section`
  padding: 2rem 1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 1rem 0.5rem;
  }
`;

const SpotListTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
`;

const SpotList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0 0.5rem;
  }
`;

const Oversikt = () => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [wheelchairAccessible, setWheelchairAccessible] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "rating">("name");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchExpanded, setIsSearchExpanded] = useState<boolean>(false);
  const [spotsList, setSpotsList] = useState<Spot[]>([]);

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

  const categories = ["Alle", ...Array.from(new Set(spotsList.map((spot) => spot.category)))];
  const difficulties = ["Alle", "lett", "moderat", "Vanskelig"];
  const accessibilityOptions = ["Alle", "Ja", "Nei"];
  const sortOptions = ["name", "rating"];

  const filteredSpots = useMemo(() => {
    let filtered = spotsList.filter((spot) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes("Alle") ||
        selectedCategories.includes(spot.category);
      const matchesDifficulty =
        !selectedDifficulty ||
        selectedDifficulty === "Alle" ||
        spot.difficulty === selectedDifficulty;
      const matchesAccessibility =
        wheelchairAccessible === null ||
        (wheelchairAccessible && spot.wheelchairAccessible) ||
        (!wheelchairAccessible && !spot.wheelchairAccessible);
      const matchesSearch =
        !searchQuery ||
        spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spot.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesAccessibility && matchesSearch;
    });

    if (sortBy === "rating") {
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [selectedCategories, selectedDifficulty, wheelchairAccessible, sortBy, searchQuery, spotsList]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      if (category === "Alle") {
        return prev.includes("Alle") ? prev.filter((c) => c !== "Alle") : ["Alle"];
      }
      const newCategories = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev.filter((c) => c !== "Alle"), category];
      return newCategories.length === 0 ? ["Alle"] : newCategories;
    });
  };

  const handleAccessibilityChange = (value: string) => {
    if (value === "Alle") {
      setWheelchairAccessible(null);
    } else {
      setWheelchairAccessible(value === "Ja");
    }
  };

  const handleSpotClick = (spot: Spot) => {
    router.push(`/location/${spot.id}`);
  };

  const handleSpotNavigate = (spotId: string) => {
    router.push(`/location/${spotId}`);
  };

  const truncateDescription = (description: string, limit: number = 100) => {
    return description.length > limit ? description.substring(0, limit) + "..." : description;
  };

  return (
    <div className="oversikt-page">
      <HeroSection>
        <HeroTitle>Oversikt over Steder i Bærum</HeroTitle>
        <div className="search-container">
          <input
            type="text"
            placeholder="Søk etter steder..."
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchExpanded(e.target.value.length > 0);
            }}
            onFocus={() => setIsSearchExpanded(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
          />
          {isSearchExpanded && (
            <div className="search-results">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => (
                  <div
                    key={spot.id}
                    className="search-result-item"
                    onClick={() => handleSpotNavigate(spot.id)}
                  >
                    <div className="result-content">
                      <h3 className="search-result-title">{spot.name}</h3>
                      <p className="search-result-description">{truncateDescription(spot.description)}</p>
                    </div>
                    <img
                      src={spot.photos && spot.photos.length > 0 ? spot.photos[0] : "/Hero.jpg"}
                      alt={spot.name}
                      className="result-image"
                    />
                  </div>
                ))
              ) : (
                <div className="search-result-item">Ingen resultater funnet.</div>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.4)",
            zIndex: 0,
          }}
        />
      </HeroSection>

      <FilterToggleButton onClick={() => setIsFilterSheetOpen(true)}>
        Filtrer
      </FilterToggleButton>

      <FilterSheet isOpen={isFilterSheetOpen} onClose={() => setIsFilterSheetOpen(false)}>
        <h2>Filtrer Steder</h2>
        <div className="filter-section">
          <h3>Kategori</h3>
          <CategoryFilterSection
            selectedCategory={selectedCategories.length === 0 ? "Alle" : selectedCategories[0]}
            setSelectedCategory={handleCategoryChange}
            filterCategories={categories}
          />
        </div>
        <div className="filter-section">
          <h3>Vanskelighetsgrad</h3>
          <CategoryFilterSection
            selectedCategory={selectedDifficulty || "Alle"}
            setSelectedCategory={(diff) =>
              setSelectedDifficulty(diff === selectedDifficulty ? "" : diff)
            }
            filterCategories={difficulties}
          />
        </div>
        <div className="filter-section">
          <h3>Tilgjengelighet</h3>
          <CategoryFilterSection
            selectedCategory={
              wheelchairAccessible === null
                ? "Alle"
                : wheelchairAccessible
                ? "Ja"
                : "Nei"
            }
            setSelectedCategory={handleAccessibilityChange}
            filterCategories={accessibilityOptions}
          />
        </div>
        <div className="filter-section">
          <h3>Sorter Etter</h3>
          <CategoryFilterSection
            selectedCategory={sortBy}
            setSelectedCategory={(sort) => setSortBy(sort as "name" | "rating")}
            filterCategories={sortOptions}
          />
        </div>
      </FilterSheet>

      <SpotListSection>
        <SpotListTitle>Steder</SpotListTitle>
        <SpotList>
          {filteredSpots.map((spot) => (
            <LocationCard
              key={spot.id}
              spot={{ ...spot, description: truncateDescription(spot.description) }}
              variant="primary"
              onClick={() => handleSpotClick(spot)}
            />
          ))}
        </SpotList>
      </SpotListSection>
    </div>
  );
};

export default Oversikt;