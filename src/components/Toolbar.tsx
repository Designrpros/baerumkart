"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../data/spots";
import { ADMIN_EMAILS } from "../adminPrivileges";
import "./Toolbar.css";

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
    <header className="toolbar-container">
      <div className="left-section">
        <Link href="/">
          <Logo />
        </Link>
        <div className="search-container">
          <input
            type="text"
            placeholder="Hvor vil du på tur?"
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchExpanded(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setIsSearchExpanded(false), 200)}
          />
          <span className="search-icon">
            <img src="/icons/search.png" alt="Search" />
          </span>
          {isSearchExpanded && (
            <div className="search-results">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot: Spot) => (
                  <div
                    key={spot.id}
                    className="search-result-item"
                    onClick={() => handleSearchResultClick(spot.id)}
                  >
                    <div className="result-title">{spot.name}</div>
                    <div className="result-description">{spot.description}</div>
                  </div>
                ))
              ) : (
                <div className="search-result-item">Ingen resultater funnet.</div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <nav className={`tabs ${isMenuOpen ? "open" : ""}`}>
        <Link href="/map" className="tab-link" onClick={() => setIsMenuOpen(false)}>
          Kart
        </Link>
        <Link href="/oversikt" className="tab-link" onClick={() => setIsMenuOpen(false)}>
          Oversikt
        </Link>
        <Link href="/anbefalinger" className="tab-link" onClick={() => setIsMenuOpen(false)}>
          Anbefalinger
        </Link>
        {isAdmin && (
          <Link href="/admin" className="tab-link" onClick={() => setIsMenuOpen(false)}>
            Admin
          </Link>
        )}
        <button className="auth-button" onClick={handleLoginLogout}>
          {isLoggedIn ? "Logg Ut" : "Logg Inn"}
        </button>
      </nav>
    </header>
  );
};

export default Toolbar;