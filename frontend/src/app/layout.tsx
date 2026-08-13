import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "Airbnb | Vacation Rentals, Cabins, Beach Houses & More",
  description: "Find the perfect place to stay at Airbnb. Book unique homes, beachfront villas, cabins, and luxury apartments around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
