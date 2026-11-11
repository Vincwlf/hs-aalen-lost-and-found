import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Hochschule Aalen – Campus Fundbüro",
  description: "Zentrales Fund- und Verlustportal für Studierende und Mitarbeitende",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={fontSans.variable}>
      <body className="font-sans bg-[#fafafc] text-stone-800 antialiased">
        {children}
      </body>
    </html>
  );
}