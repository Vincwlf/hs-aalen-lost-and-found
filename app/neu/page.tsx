import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import Link from "next/link";
import { CATEGORIES, CAMPUS_LOCATIONS } from "@/lib/constants";

const prisma = new PrismaClient();

export default async function NewItemPage() {
  // Sorgt dafür, dass Next.js 16 die Uhrzeit dynamisch beim Seitenaufruf berechnet
  await connection();

  // Aktuelles Datum & Uhrzeit auf 15-Minuten-Schritte (viertelstündlich) runden
  const now = new Date();
  const minutes = Math.floor(now.getMinutes() / 15) * 15;
  now.setMinutes(minutes - now.getTimezoneOffset(), 0, 0);
  const defaultDateTime = now.toISOString().slice(0, 16);

  async function createItem(formData: FormData) {
    "use server";

    const status = (formData.get("status") as string) || "LOST";
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const room = (formData.get("room") as string) || null;
    const incidentDateRaw = formData.get("incidentDate") as string;
    const description = (formData.get("description") as string) || null;
    const secretFeature = (formData.get("secretFeature") as string) || null;
    const contact = (formData.get("contact") as string) || null;

    const newItem = await prisma.item.create({
      data: {
        status,
        title,
        category,
        location,
        room,
        incidentDate: incidentDateRaw ? new Date(incidentDateRaw) : new Date(),
        description,
        secretFeature,
        contact,
      },
    });

    revalidatePath("/");
    redirect(`/item/${newItem.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f8] text-[#102438]">
      {/* Obere Hochschul-Leiste exakt im Blau der Startseite (#0f2b46) */}
      <div className="bg-[#0f2b46] text-white text-xs py-2 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="font-semibold tracking-wider uppercase">
            HOCHSCHULE AALEN • Technik und Wirtschaft
          </span>
          <span className="hidden sm:inline text-slate-300">
            Campus Beethovenstraße • Burren • Waldcampus
          </span>
        </div>
      </div>

      {/* Weißer Header mit Logo und Zurück-Button */}
      <header className="bg-white border-b border-[#DCE3E9] py-4 px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-[#0f2b46] text-white font-bold text-xs w-10 h-10 rounded flex flex-col items-center justify-center leading-tight">
              <span>HS</span>
              <span>AA</span>
            </div>
            <div>
              <div className="font-bold text-[#102438] text-base leading-tight">
                Hochschule Aalen
              </div>
              <div className="text-[11px] text-[#526477] tracking-wider uppercase">
                DIGITALES FUNDBÜRO
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-medium text-[#102438] bg-white border border-[#DCE3E9] rounded-md px-3.5 py-2 hover:bg-[#f4f6f8] transition"
          >
            ← Zurück zur Übersicht
          </Link>
        </div>
      </header>

      {/* Hauptbereich mit Formular-Karte */}
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-[#DCE3E9] p-6 md:p-8">
          <div className="mb-6 pb-4 border-b border-[#DCE3E9]">
            <p className="text-[11px] font-bold tracking-wider text-[#0f2b46] uppercase mb-1">
              NEUEN FALL ERFASSEN
            </p>
            <h1 className="text-2xl font-bold text-[#102438] mb-1.5">
              Fund- oder Verlustfall melden
            </h1>
            <p className="text-xs text-[#526477]">
              Trage die Details ein. Nach dem Speichern wird sofort ein offizieller DIN-A4-Aushang mit QR-Code und Abreißzetteln generiert.
            </p>
          </div>

          <form action={createItem} className="space-y-5">
            {/* Art der Meldung oben als Radio-Buttons */}
            <div>
              <label className="block text-xs font-semibold text-[#102438] mb-2">
                Art der Meldung *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center justify-center p-3 border border-[#DCE3E9] rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#0f2b46] has-[:checked]:bg-[#0f2b46]/5 has-[:checked]:text-[#0f2b46] has-[:checked]:font-semibold transition text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="FOUND"
                    defaultChecked
                    className="mr-2 accent-[#0f2b46]"
                  />
                  Gefunden
                </label>
                <label className="flex items-center justify-center p-3 border border-[#DCE3E9] rounded-lg cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#0f2b46] has-[:checked]:bg-[#0f2b46]/5 has-[:checked]:text-[#0f2b46] has-[:checked]:font-semibold transition text-sm">
                  <input
                    type="radio"
                    name="status"
                    value="LOST"
                    className="mr-2 accent-[#0f2b46]"
                  />
                  Verloren
                </label>
              </div>
            </div>

            {/* Gegenstand / Bezeichnung */}
            <div>
              <label htmlFor="title" className="block text-xs font-semibold text-[#102438] mb-1">
                Gegenstand / Bezeichnung *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder="z. B. Schwarzer Regenschirm, ThinkPad-Netzteil, Campus-Card"
                className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
              />
            </div>

            {/* Kategorie & Campus / Gebäude direkt aus constants.ts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-xs font-semibold text-[#102438] mb-1">
                  Kategorie *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] bg-white focus:border-[#0f2b46] focus:outline-none"
                >
                  <option value="" disabled>
                    Bitte wählen...
                  </option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-xs font-semibold text-[#102438] mb-1">
                  Campus / Gebäude *
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  defaultValue=""
                  className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] bg-white focus:border-[#0f2b46] focus:outline-none"
                >
                  <option value="" disabled>
                    Gebäude wählen...
                  </option>
                  {CAMPUS_LOCATIONS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Raum oder genaue Stelle & Zeitpunkt (viertelstündlich) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="room" className="block text-xs font-semibold text-[#102438] mb-1">
                  Raum oder genaue Stelle
                </label>
                <input
                  type="text"
                  id="room"
                  name="room"
                  placeholder="z. B. Hörsaal 0.01, Bibliothek EG Tisch 4"
                  className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="incidentDate" className="block text-xs font-semibold text-[#102438] mb-1">
                  Zeitpunkt des Verlusts / Funds
                </label>
                <input
                  type="datetime-local"
                  id="incidentDate"
                  name="incidentDate"
                  defaultValue={defaultDateTime}
                  step={900}
                  required
                  className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
                />
              </div>
            </div>

            {/* Kontakt mit Datenschutz-Hinweis */}
            <div>
              <label htmlFor="contact" className="block text-xs font-semibold text-[#102438] mb-1">
                Kontakt (E-Mail oder Telefon – bleibt geschützt & nicht öffentlich sichtbar)
              </label>
              <input
                type="text"
                id="contact"
                name="contact"
                placeholder="z. B. vorname.nachname@studmail.htw-aalen.de"
                className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
              />
              <p className="text-[11px] text-[#526477] mt-1">
                🔒 Datenschutz: Deine Kontaktdaten werden nicht öffentlich im Klartext auf der Startseite oder dem Aushang abgedruckt.
              </p>
            </div>

            {/* Geheimes Prüfmerkmal */}
            <div>
              <label htmlFor="secretFeature" className="block text-xs font-semibold text-[#102438] mb-1">
                Geheimes Prüfmerkmal (wird nicht öffentlich auf dem Aushang gedruckt)
              </label>
              <input
                type="text"
                id="secretFeature"
                name="secretFeature"
                placeholder="z. B. Gravur, Matrikelnummer-Endung, Sperrbildschirm-Motiv"
                className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
              />
            </div>

            {/* Öffentliche Beschreibung */}
            <div>
              <label htmlFor="description" className="block text-xs font-semibold text-[#102438] mb-1">
                Öffentliche Beschreibung
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Besondere Merkmale, Marke, Farbe oder Hinweis zum Abholort (z. B. Infothek)..."
                className="w-full rounded-md border border-[#DCE3E9] px-3.5 py-2 text-sm text-[#102438] focus:border-[#0f2b46] focus:outline-none"
              />
            </div>

            {/* Buttons unten rechts */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCE3E9]">
              <Link
                href="/"
                className="px-4 py-2.5 text-xs font-semibold text-[#102438] bg-white border border-[#DCE3E9] rounded-md hover:bg-[#f4f6f8] transition"
              >
                Abbrechen
              </Link>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#0f2b46] hover:bg-[#193e63] rounded-md transition cursor-pointer"
              >
                Meldung speichern & Aushang erstellen
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Dezenter Footer */}
      <footer className="bg-white border-t border-[#DCE3E9] py-4 px-6 text-[11px] text-[#526477]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Hochschule Aalen – Digitales Fundbüro</span>
          <span>Zentraler Campus-Service für Studierende und Mitarbeitende</span>
        </div>
      </footer>
    </div>
  );
}