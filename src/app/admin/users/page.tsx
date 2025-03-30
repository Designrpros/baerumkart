"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { db, auth } from "../../../firebase";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { Spot } from "../../../data/spots";
import { ADMIN_EMAILS } from "../../../adminPrivileges";

interface UserData {
  id: string;
  email: string;
  createdAt?: string;
  lastLogin?: string;
  spotsAdded: number;
}

const Container = styled.div`
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

const SearchContainer = styled.div`
  margin-bottom: clamp(15px, 3vw, 20px);
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: clamp(8px, 1.5vw, 12px);
  font-size: clamp(14px, 2vw, 16px);
  border: 1px solid #ddd;
  border-radius: 6px;
  box-sizing: border-box;
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(10px, 2vw, 15px);
  cursor: pointer;
  transition: background 0.3s ease;

  &:hover {
    background: #f9f9f9;
  }
`;

const UserEmail = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
`;

const ToggleButton = styled.span`
  font-size: clamp(16px, 2vw, 20px);
  color: #555;
`;

const UserDetails = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  padding: clamp(10px, 2vw, 15px);
  border-top: 1px solid #eee;
`;

const DetailSection = styled.div`
  margin-bottom: clamp(10px, 2vw, 15px);
`;

const SectionLabel = styled.div`
  font-size: clamp(14px, 2vw, 16px);
  font-weight: bold;
  color: #1a1a1a;
  margin-bottom: 5px;
`;

const DetailList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const DetailItem = styled.li`
  font-size: clamp(12px, 2vw, 14px);
  color: #555;
  margin-bottom: 5px;
`;

const EmptyMessage = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #666;
  font-style: italic;
  text-align: center;
`;

const Summary = styled.div`
  margin-top: clamp(15px, 3vw, 20px);
  padding: clamp(10px, 2vw, 15px);
  background: #f9f9f9;
  border-radius: 8px;
  text-align: center;
`;

const SummaryText = styled.p`
  font-size: clamp(14px, 2vw, 16px);
  color: #1a1a1a;
  margin: 5px 0;
`;

const Users = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    setLoading(true);

    const user = auth.currentUser;
    console.log("Current user:", user);
    if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
      console.warn("User does not have admin privileges");
      setHasAccess(false);
      setLoading(false);
      return;
    }

    setHasAccess(true);

    // One-time fetch to debug
    const fetchUsersOnce = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        console.log("One-time fetch - Users snapshot size:", snapshot.size);
        console.log("One-time fetch - Users snapshot empty:", snapshot.empty);
        snapshot.docs.forEach((doc) => console.log("One-time fetch - User doc:", doc.data()));
      } catch (error) {
        console.error("Error in one-time fetch of users:", error);
      }
    };
    fetchUsersOnce();

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        console.log("Users snapshot size:", snapshot.size);
        console.log("Users snapshot empty:", snapshot.empty);
        const fetchedUsers = snapshot.docs.map((doc) => {
          const data = doc.data();
          console.log("User doc data:", data);
          return {
            id: doc.id,
            email: data.email || "Ukjent",
            createdAt: data.createdAt || "",
            lastLogin: data.lastLogin || "",
            spotsAdded: 0,
          } as UserData;
        });
        setUsers(fetchedUsers);
        console.log("Fetched users:", fetchedUsers);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    const unsubSpots = onSnapshot(
      collection(db, "spots"),
      (snapshot) => {
        console.log("Spots snapshot size:", snapshot.size);
        const fetchedSpots = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Spot[];
        setSpots(fetchedSpots);
        setUsers((prevUsers) =>
          prevUsers.map((user) => ({
            ...user,
            spotsAdded: fetchedSpots.filter((spot) => spot.addedBy === user.id).length,
          }))
        );
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching spots:", error);
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubSpots();
    };
  }, []);

  const toggleUserDetails = (userId: string) => {
    setOpenUserId(openUserId === userId ? null : userId);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpotsAdded = filteredUsers.reduce((sum, user) => sum + user.spotsAdded, 0);

  if (loading) return <Container><Title>Laster...</Title></Container>;

  if (!hasAccess) return <Container><Title>Du har ikke tilgang til denne siden</Title></Container>;

  return (
    <Container>
      <Title>Alle Brukere</Title>
      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Søk etter e-post eller ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchContainer>
      {filteredUsers.length > 0 ? (
        <>
          <UserList>
            {filteredUsers.map((user) => (
              <UserItem key={user.id}>
                <UserHeader onClick={() => toggleUserDetails(user.id)}>
                  <UserEmail>
                    {user.email} (ID: {user.id})
                  </UserEmail>
                  <ToggleButton>{openUserId === user.id ? "−" : "+"}</ToggleButton>
                </UserHeader>
                <UserDetails isOpen={openUserId === user.id}>
                  <DetailSection>
                    <SectionLabel>Kontoinformasjon</SectionLabel>
                    <DetailList>
                      <DetailItem>Opprettet: {user.createdAt ? new Date(user.createdAt).toLocaleString("no-NO") : "N/A"}</DetailItem>
                      <DetailItem>Siste Innlogging: {user.lastLogin ? new Date(user.lastLogin).toLocaleString("no-NO") : "N/A"}</DetailItem>
                      <DetailItem>Antall Steder Lagt Til: {user.spotsAdded}</DetailItem>
                    </DetailList>
                  </DetailSection>
                </UserDetails>
              </UserItem>
            ))}
          </UserList>
          <Summary>
            <SummaryText>Totalt Antall Brukere: {filteredUsers.length}</SummaryText>
            <SummaryText>Totalt Antall Steder Lagt Til: {totalSpotsAdded}</SummaryText>
          </Summary>
        </>
      ) : (
        <EmptyMessage>Ingen brukere funnet.</EmptyMessage>
      )}
    </Container>
  );
};

export default Users;