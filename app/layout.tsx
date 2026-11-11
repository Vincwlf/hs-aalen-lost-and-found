import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Digitales Fundbüro | Hochschule Aalen",
  description:
    "Zentrales Verzeichnis für Fundstücke und Verlustmeldungen an den Standorten Beethovenstraße, Burren und Waldcampus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.className} bg-[#F3F5F7] text-[#344054] antialiased selection:bg-[#173653] selection:text-white`}>
        {children}
      </body>
    </html>
  );
}