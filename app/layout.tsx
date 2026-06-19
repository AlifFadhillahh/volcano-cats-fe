import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Volcano Cats 🌋",
  description: "Multiplayer card game — jangan kena Lava Cat!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-obsidian text-cream font-body antialiased">
        {children}
      </body>
    </html>
  );
}
