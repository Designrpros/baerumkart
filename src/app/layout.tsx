// app/layout.tsx
"use client";

import Toolbar from "../components/Toolbar";
import "./styles/globals.css"; // Import global styles

// Layout Component
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body style={{ fontFamily: '"Helvetica", sans-serif', margin: 0 }}>
        <Toolbar />
        {children}
      </body>
    </html>
  );
}