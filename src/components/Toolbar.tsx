"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { ADMIN_EMAILS } from "../adminPrivileges";
import "./Toolbar.css";

const Toolbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
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

    return () => unsubscribeAuth();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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

  return (
    <header className="toolbar-container">
      <div className="left-section">
        <Link href="/">
          <Logo />
        </Link>
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