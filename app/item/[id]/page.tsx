import { prisma } from "@/lib/prisma";
import { STATUS_CONFIG } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailPage(props: ItemPageProps) {
  const params = await props.params;
  const item = await prisma.item.findUnique({
    where: { id: params.id },
  });

  if (!item) {
    notFound();
  }

  const itemUrl = `http://localhost:3000/item/${item.id}`;
  const qrDataUrl = await QRCode.toDataURL(itemUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: "#173653",
      light: "#FFFFFF",
    },
  });

  async function toggleStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status") as string;
    await prisma.item.update({
      where: { id: params.id },
      data: { status: newStatus },
    });
    revalidatePath(`/item/${params.id}`);
    revalidatePath("/");
  }

  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOST;

  return (
    <div className="min-h-screen bg-[#F3F5F7] print:bg-white text-[#344054]">
      {/* Header (wird beim Drucken ausgeblendet) */}
      <header className="bg-white border-b border-[#DCE3E9] print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-semibold text-[#173653] hover:underline inline-flex items-center gap-1.5"
          >
            <span>← Zurück zur Übersicht</span>
          </Link>

          <div className="flex items-center gap-3">
            <form action={toggleStatus}>
              {item.status !== "RESOLVED" ? (
                <button
                  type="submit"
                  name="status"
                  value="RESOLVED"
                  className="text-xs bg-[#F3F5F7] hover:bg-[#DCE3E9] text-[#344054] font-medium px-3.5 py-2 rounded-md border border-[#DCE3E9] transition-colors"
                >
                  Als erledigt markieren
                </button>
              ) : (
                <button
                  type="submit"
                  name="status"
                  value="LOST"
                  className="text-xs bg-[#F3F5F7] hover:bg-[#DCE3E9] text-[#344054] font-medium px-3.5 py-2 rounded-md border border-[#DCE3E9] transition-colors"
                >
                  Fall wieder öffnen
                </button>
              )}
            </form>

            <span className="text-xs bg-[#173653] text-white font-medium px-3.5 py-2 rounded-md">
              Drucken mit Strg + P
            </span>
          </div>
        </div>
      </header>

      {/* DIN-A4 Druck-Flyer */}
      <main className="max-w-3xl mx-auto p-4 sm:p-8 print:p-0">
        <div className="bg-white border border-[#DCE3E9] print:border-2 print:border-[#173653] rounded-md p-8 sm:p-10 space-y-8">
          {/* Kopfbereich des Aushangs */}
          <div className="text-center border-b border-[#DCE3E9] pb-6 space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[#526477]">
              Hochschule Aalen • Zentrales Campus-Fundbüro
            </p>
            <div className="pt-1">
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded border ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}
              >
                {item.status === "LOST"
                  ? "Verlustmeldung – Wird gesucht"
                  : item.status === "FOUND"
                  ? "Fundmeldung – Gegenstand gefunden"
                  : "Status: Erledigt"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#173653] pt-2">
              {item.title}
            </h1>
          </div>

          {/* Hauptinformationen & Großer QR-Code */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-8 items-center">
            <div className="sm:col-span-3 space-y-4 text-sm">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] block">
                  Ort / Gebäude
                </span>
                <p className="font-semibold text-[#344054] text-base mt-0.5">
                  {item.location} {item.room ? `(${item.room})` : ""}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] block">
                  Kategorie
                </span>
                <p className="font-medium text-[#344054] mt-0.5">{item.category}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] block">
                  Zeitpunkt
                </span>
                <p className="font-medium text-[#344054] mt-0.5">
                  {new Date(item.incidentDate).toLocaleString("de-DE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}{" "}
                  Uhr
                </p>
              </div>

              {item.description && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] block">
                    Beschreibung
                  </span>
                  <p className="text-[#344054] mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              )}

              {item.contact && (
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] block">
                    Kontakt für Rückfragen
                  </span>
                  <p className="font-semibold text-[#173653] mt-0.5">{item.contact}</p>
                </div>
              )}
            </div>

            <div className="sm:col-span-2 flex flex-col items-center justify-center border border-[#DCE3E9] rounded-md p-4 bg-[#F3F5F7]/50">
              <img
                src={qrDataUrl}
                alt={`QR-Code für ${item.title}`}
                className="w-44 h-44 object-contain bg-white p-2 border border-[#DCE3E9] rounded-sm"
              />
              <span className="text-[11px] text-[#526477] font-medium mt-2 text-center">
                Scannen für aktuellen Live-Status
              </span>
            </div>
          </div>

          {/* Abreißzettel für das Schwarze Brett */}
          <div className="pt-6 border-t-2 border-dashed border-[#DCE3E9]">
            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#526477] mb-4">
              Abreißzettel für Aushänge am Schwarzen Brett
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-dashed divide-[#DCE3E9] border border-dashed border-[#DCE3E9] rounded-sm">
              {[1, 2, 3, 4].map((tab) => (
                <div key={tab} className="p-3 flex flex-col items-center text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-[#173653] line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-[9px] text-[#526477] line-clamp-1">
                    {item.location}
                  </span>
                  <img
                    src={qrDataUrl}
                    alt="Mini-QR"
                    className="w-20 h-20 object-contain"
                  />
                  <span className="text-[9px] text-[#526477]">Fundbüro HS AA</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}