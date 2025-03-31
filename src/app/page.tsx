"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../data/spots";
import "./page.css";

const imageMap: { [key: string]: string } = {
  "1": "/Hero.jpg",
  "2": "/Hero2.jpg",
  "3": "/Hero3.jpg",
  "4": "/Hero4.jpg",
  "5": "/Hero.jpg",
  "6": "/Hero2.jpg",
};

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

  const truncateDescription = (description: string, limit: number = 100) => {
    return description.length > limit ? description.substring(0, limit) + "..." : description;
  };

  const filteredSpots = spotsList.filter((spot: Spot) =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="home-page">
      <Head>
        <title>BærumKart - Nedtur og Opptur</title>
        <meta name="description" content="Utforsk Bærum med BærumKart!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="hero-section">
        <h1 className="hero-title">Finn din tur i Bærum</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Hvor vil du på tur?"
            className={`search-input ${isSearchExpanded ? "expanded" : ""}`}
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchExpanded(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
          />
          {isSearchExpanded && (
            <div className="search-results">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot: Spot) => (
                  <div
                    key={spot.id}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(spot.id)}
                  >
                    <div className="result-content">
                      <h3 className="search-result-title">{spot.name}</h3>
                      <p className="search-result-description">{truncateDescription(spot.description)}</p>
                    </div>
                    <img
                      src={imageMap[spot.id] || "/Hero.jpg"}
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
      </section>

      <section className="category-section">
        <h2 className="category-title">Finn din neste...</h2>
        <div className="category-container">
          {categories.map((category) => (
            <div
              key={category.name}
              className="category-card"
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="category-icon">
                <img
                  src={category.icon}
                  alt={category.name}
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
              <p className="category-label">{category.name}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}