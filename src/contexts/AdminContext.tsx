"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AdminContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AdminContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdminContext must be used within AdminProvider");
  return context;
};