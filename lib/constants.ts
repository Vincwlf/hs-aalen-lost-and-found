export const CATEGORIES = [
  "Elektronik & IT",
  "Campus Card & Schlüssel",
  "Taschen & Kleidung",
  "Studienmaterial",
  "Wertgegenstände",
  "Sonstiges",
] as const;

export const CAMPUS_LOCATIONS = [
  {
    group: "Campus Beethovenstraße",
    items: [
      "BS1 – Hauptgebäude",
      "AH – Aula- & Hörsaalgebäude",
      "F – Forschungsgebäude",
      "M / E – Mensa & explorhino",
    ],
  },
  {
    group: "Campus Burren",
    items: [
      "G1 – Optik & Mechatronik",
      "G2 – Elektronik & Informatik",
      "G3 – Hochschulbibliothek",
      "G4 / C – Cafeteria Burren",
      "IZ – Innovationszentrum",
    ],
  },
  {
    group: "Waldcampus & Stadtgebiet",
    items: [
      "WIN – Wirtschaftswissenschaften",
      "DIS – Digital Innovation Space",
      "NM – Neue Mensa",
      "SW – Studierendenwohnheime",
      "Außenbereich / Campus-Areal",
    ],
  },
] as const;

export const STATUS_CONFIG: Record<
  string,
  { label: string; dotColor: string; badgeBg: string; badgeText: string; badgeBorder: string }
> = {
  LOST: {
    label: "Verloren",
    dotColor: "bg-red-600",
    badgeBg: "bg-red-50",
    badgeText: "text-red-800",
    badgeBorder: "border-red-200",
  },
  FOUND: {
    label: "Gefunden",
    dotColor: "bg-emerald-600",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-200",
  },
  RESOLVED: {
    label: "Erledigt",
    dotColor: "bg-[#526477]",
    badgeBg: "bg-[#F3F5F7]",
    badgeText: "text-[#526477]",
    badgeBorder: "border-[#DCE3E9]",
  },
};