// src/app/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../../../data/spots";

interface Stats {
  totalSpots: number;
  wheelchairAccessible: number;
  recentAdditions: number;
  totalUsers: number;
  activeContributors: number;
  lastUpdated: string;
}

const DashboardContainer = styled.div`
  background: #fff;
  padding: clamp(15px, 3vw, 30px);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box;
  font-family: "Helvetica", sans-serif;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(15px, 3vw, 20px);
  text-align: center;
  color: #1a1a1a;
`;

const Section = styled.div`
  margin-bottom: clamp(20px, 4vw, 30px);
`;

const SectionTitle = styled.h2`
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 600;
  color: #333;
  margin-bottom: clamp(10px, 2vw, 15px);
  text-align: center;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: clamp(10px, 2vw, 15px);
  justify-items: center;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatBox = styled.div<{ $highlight?: boolean }>`
  background: ${({ $highlight }) => ($highlight ? "#fff3f3" : "#f9f9f9")};
  padding: clamp(10px, 2vw, 15px);
  border-radius: 8px;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
  ${({ $highlight }) => $highlight && "border: 1px solid #ff4444;"}
`;

const StatNumber = styled.div`
  font-size: clamp(18px, 3vw, 24px);
  font-weight: bold;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
`;

const LastUpdated = styled.div`
  font-size: clamp(12px, 2vw, 14px);
  color: #888;
  text-align: center;
  margin-top: clamp(15px, 3vw, 20px);
`;

const ErrorMessage = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  color: #d32f2f;
  text-align: center;
`;

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalSpots: 0,
    wheelchairAccessible: 0,
    recentAdditions: 0,
    totalUsers: 0,
    activeContributors: 0,
    lastUpdated: "",
  });
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubSpots: () => void;
    let unsubUsers: () => void;

    const fetchData = async () => {
      unsubSpots = onSnapshot(
        collection(db, "spots"),
        (snapshot) => {
          const fetchedSpots = snapshot.docs.map((doc) => doc.data() as Spot);
          setSpots(fetchedSpots);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          setStats((prev) => ({
            ...prev,
            totalSpots: snapshot.size,
            wheelchairAccessible: fetchedSpots.filter((spot) => spot.wheelchairAccessible).length,
            recentAdditions: fetchedSpots.filter(
              (spot) => spot.createdAt && new Date(spot.createdAt) >= thirtyDaysAgo
            ).length,
            lastUpdated: new Date().toLocaleString("no-NO"),
          }));
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error("[Dashboard] Spots fetch error:", err);
          setError("Kunne ikke laste steder: Manglende tillatelser eller tilkoblingsfeil.");
          setLoading(false);
        }
      );

      unsubUsers = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const users = snapshot.docs.map((doc) => doc.data());
          const contributorIds = new Set(spots.map((spot) => spot.addedBy).filter(Boolean));
          setStats((prev) => ({
            ...prev,
            totalUsers: snapshot.size,
            activeContributors: contributorIds.size,
            lastUpdated: new Date().toLocaleString("no-NO"),
          }));
          setError(null);
        },
        (err) => {
          console.error("[Dashboard] Users fetch error:", err);
          setError((prev) => prev || "Kunne ikke laste brukere: Manglende tillatelser eller tilkoblingsfeil.");
        }
      );
    };

    fetchData();

    return () => {
      if (unsubSpots) unsubSpots();
      if (unsubUsers) unsubUsers();
    };
  }, []); // Remove spots dependency

  if (loading) return <DashboardContainer><Title>Laster...</Title></DashboardContainer>;
  if (error) return <DashboardContainer><ErrorMessage>{error}</ErrorMessage></DashboardContainer>;

  return (
    <DashboardContainer>
      <Title>Admin Oversikt</Title>

      <Section>
        <SectionTitle>Steder</SectionTitle>
        <StatsContainer>
          <StatBox><StatNumber>{stats.totalSpots}</StatNumber><StatLabel>Totalt Antall Steder</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.wheelchairAccessible}</StatNumber><StatLabel>Rullestolvennlige</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.recentAdditions}</StatNumber><StatLabel>Nye Siste 30 Dager</StatLabel></StatBox>
        </StatsContainer>
      </Section>

      <Section>
        <SectionTitle>Brukere</SectionTitle>
        <StatsContainer>
          <StatBox><StatNumber>{stats.totalUsers}</StatNumber><StatLabel>Totalt Antall Brukere</StatLabel></StatBox>
          <StatBox><StatNumber>{stats.activeContributors}</StatNumber><StatLabel>Aktive Bidragsytere</StatLabel></StatBox>
        </StatsContainer>
      </Section>

      <LastUpdated>Sist Oppdatert: {stats.lastUpdated}</LastUpdated>
    </DashboardContainer>
  );
};

export default Dashboard;