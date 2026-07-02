import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageBackground from "@/components/page-background";

export const metadata: Metadata = {
  title: "RentAI Car Rental",
  description: "AI-powered car rental MVP",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageBackground />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
