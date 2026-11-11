import { prisma } from "@/lib/prisma";
import { CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function NewItemPage() {
  async function createItem(formData: FormData) {
    "use server";
    const title = ((formData.get("title") as string) || "").trim();
    const category = ((formData.get("category") as string) || "").trim();
    const location = ((formData.get("location") as string) || "").trim();
    const room = ((formData.get("room") as string) || "").trim() || null;
    const incidentDateStr = formData.get("incidentDate") as string;
    const status = (formData.get("status") as string) || "LOST";
    const description = ((formData.get("description") as string) || "").trim() || null;
    const secretFeature = ((formData.get("secretFeature") as string) || "").trim() || null;
    const contact = ((formData.get("contact") as string) || "").trim() || null;

    if (!title || !category || !location) {
      return;
    }

    const newItem = await prisma.item.create({
      data: {
        title,
        category,
        location,
        room,
        incidentDate: incidentDateStr ? new Date(incidentDateStr) : new Date(),
        status,
        description,
        secretFeature,
        contact,
      },
    });

    revalidatePath("/");
    redirect(`/item/${newItem.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#344054]">
      {/* Oberer Informationsbalken */}
      <div className="bg-[#173653] text-white text-xs px-4 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-semibold tracking-wide">HOCHSCHULE AALEN</span>
          <span className="text-white/80 hidden sm:inline">
            Standorte: Beethovenstraße • Burren • Waldcampus
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-[#DCE3E9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#173653] text-white flex flex-col items-center justify-center rounded-sm shrink-0">
              <span className="text-[10px] font-medium leading-none">HS</span>
              <span className="text-[14px] font-bold leading-none mt-0.5">AA</span>
            </div>
            <div className="pl-3 border-l border-[#DCE3E9]">
              <span className="font-bold text-[15px] tracking-tight text-[#173653] block leading-tight">
                Hochschule Aalen
              </span>
              <span className="text-[11px] font-medium text-[#526477] uppercase tracking-wider block mt-0.5">
                Digitales Fundbüro
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold text-[#526477] hover:text-[#173653] transition-colors"
          >
            ← Zurück zur Übersicht
          </Link>
        </div>
      </header>

      {/* Formular-Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white border border-[#DCE3E9] rounded-md p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#DCE3E9] pb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477]">
              Neue Meldung
            </span>
            <h1 className="text-xl font-bold text-[#173653] mt-0.5">
              Fund- oder Verlustfall melden
            </h1>
            <p className="text-xs text-[#526477] mt-1">
              Bitte fülle die Pflichtfelder (*) aus. Nach dem Speichern wird automatisch ein druckfertiger DIN-A4-Aushang mit QR-Code erstellt.
            </p>
          </div>

          <form action={createItem} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Gegenstand / Bezeichnung *
              </label>
              <input
                name="title"
                required
                placeholder="z. B. Schwarzer Regenschirm, ThinkPad-Netzteil, Campus Card"
                className="w-full bg-white text-[#344054] placeholder-[#526477]/70 border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Meldungstyp *
              </label>
              <select
                name="status"
                className="w-full bg-white text-[#344054] border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              >
                <option value="LOST">Verloren (Gegenstand wird gesucht)</option>
                <option value="FOUND">Gefunden (Gegenstand wurde abgegeben / gesichert)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Kategorie *
              </label>
              <select
                name="category"
                required
                className="w-full bg-white text-[#344054] border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              >
                <option value="">Bitte wählen...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Campus / Gebäude *
              </label>
              <select
                name="location"
                required
                className="w-full bg-white text-[#344054] border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              >
                <option value="">Gebäude wählen...</option>
                {CAMPUS_LOCATIONS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Raum oder genaue Stelle
              </label>
              <input
                name="room"
                placeholder="z. B. Hörsaal 0.21, Bibliothek EG Tisch 4"
                className="w-full bg-white text-[#344054] placeholder-[#526477]/70 border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Zeitpunkt des Verlusts / Funds
              </label>
              <input
                name="incidentDate"
                type="datetime-local"
                defaultValue={new Date().toISOString().slice(0, 16)}
                className="w-full bg-white text-[#344054] border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Kontakt (E-Mail oder Telefon)
              </label>
              <input
                name="contact"
                placeholder="z. B. vorname.nachname@studmail.htw-aalen.de"
                className="w-full bg-white text-[#344054] placeholder-[#526477]/70 border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Geheimes Prüfmerkmal (wird nicht öffentlich auf dem Aushang gedruckt)
              </label>
              <input
                name="secretFeature"
                placeholder="z. B. Gravur, Matrikelnummer-Endung, Sperrbildschirm-Motiv"
                className="w-full bg-white text-[#344054] placeholder-[#526477]/70 border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#344054] mb-1">
                Öffentliche Beschreibung
              </label>
              <textarea
                name="description"
                rows={3}
                placeholder="Besondere Merkmale, Marke, Farbe oder Hinweis zum Abholort (z. B. Infothek)..."
                className="w-full bg-white text-[#344054] placeholder-[#526477]/70 border border-[#DCE3E9] rounded-md px-3.5 py-2 text-sm focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653]"
              />
            </div>

            <div className="sm:col-span-2 pt-3 flex items-center justify-end gap-3 border-t border-[#DCE3E9]">
              <Link
                href="/"
                className="px-4 py-2.5 rounded-md border border-[#DCE3E9] text-xs font-semibold text-[#526477] hover:bg-[#F3F5F7] transition-colors"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                className="bg-[#173653] hover:bg-[#122a40] text-white font-semibold px-6 py-2.5 rounded-md text-xs transition-colors"
              >
                Meldung speichern
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}