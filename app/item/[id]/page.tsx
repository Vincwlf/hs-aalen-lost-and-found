import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetail(props: ItemPageProps) {
  const params = await props.params;
  const item = await prisma.item.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    notFound();
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const itemUrl = `${origin}/item/${item.id}`;

  const qrDataUrl = await QRCode.toDataURL(itemUrl, {
    width: 280,
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <div className="max-w-3xl mx-auto p-6 font-sans">
      <div className="print:hidden flex justify-between items-center mb-6 border-b pb-4">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← Zurück zur Übersicht
        </Link>
        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded">
          Tipp: Drücke <strong>Strg + P</strong> zum Drucken
        </span>
      </div>

      <div className="border-2 border-dashed border-gray-400 p-8 rounded-2xl bg-white text-gray-900 shadow-sm">
        <div className="text-center border-b pb-4 mb-6">
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
            Hochschule Aalen – Campus Fundbüro
          </p>
          <h1 className="text-4xl font-black mt-1 uppercase text-gray-900">
            {item.status === "LOST" ? "VERLOREN" : item.status === "FOUND" ? "GEFUNDEN" : "ABGESCHLOSSEN"}
          </h1>
          <p className="text-2xl font-semibold text-gray-800 mt-2">{item.title}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase font-bold text-gray-400">Ort / Gebäude:</span>
              <p className="text-base font-medium text-gray-900">{item.location}</p>
              {item.room && <p className="text-sm text-gray-600">Raum: {item.room}</p>}
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-gray-400">Kategorie:</span>
              <p className="text-base font-medium text-gray-900">{item.category}</p>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-gray-400">Zeitpunkt:</span>
              <p className="text-sm text-gray-700">
                {new Date(item.incidentDate).toLocaleString("de-DE", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>

            {item.description && (
              <div>
                <span className="text-xs uppercase font-bold text-gray-400">Beschreibung:</span>
                <p className="text-sm text-gray-700 mt-0.5">{item.description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR-Code zum Gegenstand" className="w-52 h-52" />
            <p className="text-xs font-semibold text-gray-500 mt-2 text-center">
              Scannen für aktuellen Live-Status
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t-2 border-dashed border-gray-300">
          <p className="text-xs font-bold text-gray-400 text-center uppercase tracking-wider mb-4">
            Abreißzettel für Aushänge am Schwarzen Brett
          </p>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border-l-2 border-dashed border-gray-300 px-2 py-1">
                <p className="text-[11px] font-bold text-gray-800 truncate">{item.title}</p>
                <p className="text-[9px] text-gray-500 truncate">{item.location}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR-Code klein" className="w-16 h-16 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}