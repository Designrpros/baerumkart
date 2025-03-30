// src/components/Toolbar.tsx
"use client";

import { useState, useEffect } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../data/spots";
import { ADMIN_EMAILS } from "../adminPrivileges";

const ToolbarContainer = styled.header`
  position: sticky;
  top: 0;
  background-color: #ffffff;
  padding: 0.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  height: 50px;
  font-family: "Helvetica", sans-serif;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;

  @media (max-width: 768px) {
    width: 200px;
  }

  @media (max-width: 480px) {
    width: 150px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 1rem;
  border-radius: 20px;
  border: 1px solid #ccc;
  font-size: 0.9rem;
  outline: none;
  background: #fff;
  color: #1a1a1a;
  font-family: "Helvetica", sans-serif;

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 22px;  /* Set appropriate icon size */
    height: 20px;
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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  padding: 0.5rem;
`;

const SearchResultItem = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  color: #1a1a1a;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const ResultTitle = styled.div`
  font-weight: 500;
  font-size: 0.9rem;
`;

const ResultDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
`;

const Tabs = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 1rem;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? "flex" : "none")};
    flex-direction: column;
    position: absolute;
    top: 50px;
    right: 0;
    background-color: #ffffff;
    padding: 1rem;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 200px;
    z-index: 999;
  }
`;

const TabLink = styled(Link)`
  color: #1a1a1a;
  font-size: 0.9rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e6f0e6;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    border-radius: 0;
    text-align: center;
  }
`;

const AuthButton = styled.button`
  color: #1a1a1a;
  font-size: 0.9rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: none;
  background: none;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #e6f0e6;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    border-radius: 0;
    text-align: center;
  }
`;

const Hamburger = styled.div`
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 25px;
  height: 18px;
  cursor: pointer;

  @media (max-width: 768px) {
    display: flex;
  }

  span {
    width: 100%;
    height: 2px;
    background-color: #1a1a1a;
    transition: all 0.3s ease;
  }
`;

const Toolbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [spotsList, setSpotsList] = useState<Spot[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("[Toolbar] Auth state changed:", user ? user.email : "No user");
      setIsLoggedIn(!!user);
      if (user) {
        const email = user.email || "";
        const isAdminUser = ADMIN_EMAILS.some(
          (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
        );
        console.log(`[Toolbar] User email: ${email}, Is Admin: ${isAdminUser}, Admin Emails: ${ADMIN_EMAILS}`);
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });

    const unsubscribeSpots = onSnapshot(collection(db, "spots"), (snapshot) => {
      const fetchedSpots = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Spot[];
      setSpotsList(fetchedSpots);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSpots();
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      signOut(auth)
        .then(() => {
          setIsLoggedIn(false);
          setIsAdmin(false);
          router.push("/");
        })
        .catch((error) => {
          console.error("Logout error:", error);
        });
    } else {
      router.push("/login");
    }
  };

  const filteredSpots = spotsList.filter((spot: Spot) =>
    spot.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ToolbarContainer>
      <LeftSection>
        <Link href="/">
          <Logo />
        </Link>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Hvor vil du på tur?"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchExpanded(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
          />
          <SearchIcon>
            <img src="/icons/search.png" alt="Search" />
          </SearchIcon>
          {isSearchExpanded && (
            <SearchResults>
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot: Spot) => (
                  <SearchResultItem
                    key={spot.id}
                    onClick={() => handleSearchResultClick(spot.id)}
                  >
                    <ResultTitle>{spot.name}</ResultTitle>
                    <ResultDescription>{spot.description}</ResultDescription>
                  </SearchResultItem>
                ))
              ) : (
                <SearchResultItem>Ingen resultater funnet.</SearchResultItem>
              )}
            </SearchResults>
          )}
        </SearchContainer>
      </LeftSection>
      <Hamburger onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </Hamburger>
      <Tabs $isOpen={isMenuOpen}>
        <TabLink href="/map" onClick={() => setIsMenuOpen(false)}>
          Kart
        </TabLink>
        <TabLink href="/oversikt" onClick={() => setIsMenuOpen(false)}>
          Oversikt
        </TabLink>
        <TabLink href="/anbefalinger" onClick={() => setIsMenuOpen(false)}>
          Anbefalinger
        </TabLink>
        {isAdmin && (
          <TabLink href="/admin" onClick={() => setIsMenuOpen(false)}>
            Admin
          </TabLink>
        )}
        <AuthButton onClick={handleLoginLogout}>
          {isLoggedIn ? "Logg Ut" : "Logg Inn"}
        </AuthButton>
      </Tabs>
    </ToolbarContainer>
  );
};

export default Toolbar;