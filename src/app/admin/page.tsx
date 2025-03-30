"use client";

import React, { useState, useEffect } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AdminProvider, useAdminContext } from "../../contexts/AdminContext";
import AdminToolbar from "../../components/AdminToolbar";
import Dashboard from "./dashboard/page";
import Spots from "./spots/page"; // Import Spots directly
import Users from "./users/page";
import Analytics from "./analytics/page";
import styled from "styled-components";
import { ADMIN_EMAILS } from "../../adminPrivileges";

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  width: 100vw;
  overflow-x: hidden;
`;

const ContentWrapper = styled.main`
  flex-grow: 1;
  padding: clamp(10px, 2vw, 20px);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 60px; /* Space for bottom toolbar */
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 70px;
    padding: 10px;
  }
`;

const AdminContent = () => {
  const { activeTab } = useAdminContext();

  const renderActiveTab = () => {
    console.log(`[AdminContent] Rendering tab: ${activeTab}`);
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "spots":
        return <Spots />; // Render Spots component directly
      case "users":
        return <Users />;
      case "analytics":
        return <Analytics />;
      default:
        return <div>Ugyldig fane: {activeTab}</div>;
    }
  };

  return <ContentWrapper>{renderActiveTab()}</ContentWrapper>;
};

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[AdminPage] Auth state changed:", user ? user.email : "No user");
      if (user) {
        const email = user.email || "";
        setUserEmail(email);
        const isAdmin = ADMIN_EMAILS.some(
          (adminEmail) => adminEmail.toLowerCase() === email.toLowerCase()
        );
        console.log(`[AdminPage] Checking admin status - Email: ${email}, Is Admin: ${isAdmin}`);
        setIsAuthorized(isAdmin);

        if (!isAdmin) {
          console.log("[AdminPage] Non-admin user, redirecting to home");
          router.push("/map");
        }
      } else {
        console.log("[AdminPage] No user signed in, redirecting to login");
        setIsAuthorized(false);
        setUserEmail(null);
        router.push("/login?returnTo=/admin");
      }
    });

    return () => {
      console.log("[AdminPage] Unsubscribing from auth state listener");
      unsubscribe();
    };
  }, [router]);

  if (isAuthorized === null) {
    console.log("[AdminPage] Rendering loading state");
    return (
      <div>
        Laster admin-tilgang... (Bruker: {userEmail || "Ikke logget inn"})
      </div>
    );
  }

  if (!isAuthorized) {
    console.log("[AdminPage] User not authorized, redirecting...");
    return (
      <div>
        Tilgang nektet. Omdirigerer... (Bruker: {userEmail || "Ikke logget inn"})
      </div>
    );
  }

  console.log("[AdminPage] Rendering admin interface");
  return (
    <AdminProvider>
      <LayoutWrapper>
        <AdminContent />
        <AdminToolbar />
      </LayoutWrapper>
    </AdminProvider>
  );
}