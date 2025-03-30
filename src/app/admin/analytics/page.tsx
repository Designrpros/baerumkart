// src/app/admin/analytics/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { Spot } from "../../../data/spots";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

const AnalyticsContainer = styled.div`
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
    padding: 10px;
  }
`;

const Title = styled.h1`
  font-size: clamp(20px, 5vw, 32px);
  font-weight: bold;
  margin-bottom: clamp(15px, 3vw, 20px);
  text-align: center;
  color: #1a1a1a;
`;

const ChartWrapper = styled.div`
  margin-bottom: clamp(20px, 4vw, 30px);
  padding: clamp(10px, 2vw, 20px);
  background: #f9f9f9;
  border-radius: 8px;
  max-width: 100%;
  overflow-x: auto;

  h2 {
    font-size: clamp(16px, 3vw, 20px);
    margin-bottom: clamp(10px, 2vw, 15px);
    text-align: center;
    color: #1a1a1a;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ChartContainer = styled.div`
  position: relative;
  width: 100%;
  height: clamp(200px, 50vh, 300px);

  @media (max-width: 768px) {
    height: clamp(150px, 40vh, 250px);
  }
`;

const Analytics = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartOptions, setChartOptions] = useState<any>(null);

  useEffect(() => {
    const unsubSpots = onSnapshot(collection(db, "spots"), (snapshot) => {
      setSpots(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Spot[]);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const updateChartOptions = () => {
      const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
      setChartOptions({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top" as const,
            labels: {
              font: {
                size: isMobile ? 12 : 14,
              },
            },
          },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            display: true,
            ticks: {
              autoSkip: true,
              maxTicksLimit: isMobile ? 10 : 30,
              maxRotation: isMobile ? 45 : 0,
              minRotation: isMobile ? 45 : 0,
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              font: {
                size: isMobile ? 10 : 12,
              },
            },
          },
        },
      });
    };

    updateChartOptions();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateChartOptions);
      return () => {
        window.removeEventListener("resize", updateChartOptions);
        unsubSpots();
        unsubUsers();
      };
    }

    return () => {
      unsubSpots();
      unsubUsers();
    };
  }, []);

  const timeChartData = () => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 29);

    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(last30Days);
      date.setDate(date.getDate() + i);
      return date.toISOString().split("T")[0];
    });

    const additionsByDate = dates.map((date) => {
      return spots.filter((spot) => spot.createdAt?.startsWith(date)).length;
    });

    return {
      labels: dates,
      datasets: [
        {
          label: "Nye Steder",
          data: additionsByDate,
          borderColor: "#ff6384",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
        },
      ],
    };
  };

  const userChartData = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = users.filter((u) =>
      spots.some((s) => s.addedBy === u.id && s.createdAt && new Date(s.createdAt) >= thirtyDaysAgo)
    ).length;
    const inactiveUsers = users.length - activeUsers;

    return {
      labels: ["Aktive Bidragsytere (Siste 30 Dager)", "Inaktive Brukere"],
      datasets: [
        {
          data: [activeUsers, inactiveUsers],
          backgroundColor: ["#ffcd56", "#e0e0e0"],
          borderColor: ["#ffcd56", "#e0e0e0"],
          borderWidth: 1,
        },
      ],
    };
  };

  if (loading || !chartOptions) return <AnalyticsContainer><Title>Laster...</Title></AnalyticsContainer>;

  return (
    <AnalyticsContainer>
      <Title>Analyse</Title>

      <ChartWrapper>
        <h2>Nye Steder Over Tid (Siste 30 Dager)</h2>
        <ChartContainer>
          <Line data={timeChartData()} options={chartOptions} />
        </ChartContainer>
      </ChartWrapper>

      <ChartWrapper>
        <h2>Brukeraktivitet</h2>
        <ChartContainer>
          <Pie data={userChartData()} options={chartOptions} />
        </ChartContainer>
      </ChartWrapper>
    </AnalyticsContainer>
  );
};

export default Analytics;