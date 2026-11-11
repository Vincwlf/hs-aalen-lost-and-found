import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = searchParams.q || "";
  const filterStatus = searchParams.status || "";
  const filterCategory = searchParams.category || "";

  const items = await prisma.item.findMany({
    where: {
      AND: [
        query
          ? {
              OR: [
                { title: { contains: query } },
                { description: { contains: query } },
                { location: { contains: query } },
                { room: { contains: query } },
              ],
            }
          : {},
        filterStatus ? { status: filterStatus } : {},
        filterCategory ? { category: filterCategory } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  async function createItem(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const room = (formData.get("room") as string) || null;
    const incidentDateStr = formData.get("incidentDate") as string;
    const status = (formData.get("status") as string) || "LOST";
    const description = (formData.get("description") as string) || null;
    const secretFeature = (formData.get("secretFeature") as string) || null;
    const contact = (formData.get("contact") as string) || null;

    const incidentDate = incidentDateStr ? new Date(incidentDateStr) : new Date();

    await prisma.item.create({
      data: {
        title,
        category,
        location,
        room,
        incidentDate,
        status,
        description,
        secretFeature,
        contact,
      },
    });

    revalidatePath("/");
  }

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    await prisma.item.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/");
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8 font-sans">
      <header className="border-b pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">HS Aalen – Lost & Found</h1>
          <p className="text-gray-600">Zentrales Fundbüro für alle Standorte der Hochschule</p>
        </div>
      </header>

      {/* Eingabeformular */}
      <section className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Meldung erfassen</h2>
        <form action={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            required
            placeholder="Titel (z. B. Blauer Deuter Rucksack, Schlüsselbund)*"
            className="border p-2 rounded bg-white text-gray-900"
          />

          <select name="status" className="border p-2 rounded bg-white text-gray-900 font-medium">
            <option value="LOST">Verloren (Ich suche)</option>
            <option value="FOUND">Gefunden (Liegt vor / abgegeben)</option>
          </select>

          <select name="category" required className="border p-2 rounded bg-white text-gray-900">
            <option value="">Kategorie wählen... *</option>
            <option value="Elektronik">Elektronik & Zubehör</option>
            <option value="Schlüssel & Ausweise">Schlüssel & Campus Card</option>
            <option value="Taschen & Kleidung">Taschen, Rucksäcke & Kleidung</option>
            <option value="Studienmaterial">Bücher & Lernmaterialien</option>
            <option value="Wertgegenstände">Geldbeutel & Wertgegenstände</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>

          <select name="location" required className="border p-2 rounded bg-white text-gray-900">
            <option value="">Standort / Gebäude wählen... *</option>
            <optgroup label="Campus Beethovenstraße (Stammcampus)">
              <option value="BS1 – Hauptgebäude">BS1 – Hauptgebäude (Verwaltung / Chemie / Maschinenbau)</option>
              <option value="AH – Aula- & Hörsaalgebäude">AH – Aula- & Hörsaalgebäude</option>
              <option value="F – Forschungsgebäude">F – Forschungsgebäude (ZTN / ZiMATE)</option>
              <option value="M / E – Mensa & explorhino">M / E – Mensa & explorhino</option>
              <option value="VfR – Stadionweg">VfR – Bürogebäude & Hörsaal VFR1</option>
              <option value="Kita Einsteinchen">Kita Einsteinchen</option>
            </optgroup>
            <optgroup label="Campus Burren">
              <option value="G1 – Optik & Mechatronik">G1 – Optik & Mechatronik</option>
              <option value="G2 – Elektronik & Informatik">G2 – Elektronik & Informatik</option>
              <option value="G3 – Hochschulbibliothek">G3 – Hochschulbibliothek</option>
              <option value="G4 / C – Cafeteria Burren">G4 / C – Augenoptik, Hörakustik & Cafeteria</option>
              <option value="IZ (INNO-Z) – Innovationszentrum">IZ (INNO-Z) – Innovationszentrum</option>
              <option value="STE – Steinbeis-Haus">STE – Steinbeis-Haus</option>
            </optgroup>
            <optgroup label="Waldcampus (Anton-Huber-Straße)">
              <option value="WIN – Wirtschaftswissenschaften">WIN – Fakultät Wirtschaft & International Center</option>
              <option value="DIS – Digital Innovation Space">DIS – Digital Innovation Space (Rundbau)</option>
              <option value="NM – Neue Mensa">NM – Neue Mensa</option>
              <option value="SW – Wohnheime">SW – Studierendenwohnheime</option>
              <option value="Graduate Campus">Graduate Campus</option>
            </optgroup>
            <optgroup label="Außenstellen Stadtgebiet & Sonstiges">
              <option value="G135 – Campus-IT">G135 – Campus-IT (Gartenstraße 135)</option>
              <option value="MER – Mercatura">MER – Mercatura (Bahnhofstraße)</option>
              <option value="S46 / NT – Innenstadt">S46 / NT – Silcherstraße & Neues Tor</option>
              <option value="Außenbereich / Campus-Areal">Außenbereich / Parkplatz / Campus-Weg</option>
            </optgroup>
          </select>

          <input
            name="room"
            placeholder="Raum / Detailort (z. B. Raum 0.21, 2. OG Treppenhaus)"
            className="border p-2 rounded bg-white text-gray-900"
          />

          <input
            name="incidentDate"
            type="datetime-local"
            defaultValue={new Date().toISOString().slice(0, 16)}
            className="border p-2 rounded bg-white text-gray-900"
          />

          <input
            name="secretFeature"
            placeholder="Geheimes Merkmal (z. B. Gravur, PIN - nur intern)"
            className="border p-2 rounded bg-white text-gray-900"
          />

          <input
            name="contact"
            placeholder="Kontakt (E-Mail oder Telefon - optional)"
            className="border p-2 rounded bg-white text-gray-900"
          />

          <textarea
            name="description"
            rows={2}
            placeholder="Öffentliche Beschreibung..."
            className="border p-2 rounded bg-white text-gray-900 md:col-span-2"
          />

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded md:col-span-2 transition"
          >
            Meldung anlegen
          </button>
        </form>
      </section>

      {/* Filter- & Suchleiste */}
      <section className="bg-white p-4 rounded-lg border border-gray-200">
        <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={query}
            placeholder="Suchbegriff..."
            className="border p-2 rounded text-sm"
          />
          <select name="status" defaultValue={filterStatus} className="border p-2 rounded text-sm bg-white">
            <option value="">Alle Status</option>
            <option value="LOST">Verloren</option>
            <option value="FOUND">Gefunden</option>
            <option value="RESOLVED">Erledigt</option>
          </select>
          <select name="category" defaultValue={filterCategory} className="border p-2 rounded text-sm bg-white">
            <option value="">Alle Kategorien</option>
            <option value="Elektronik">Elektronik & Zubehör</option>
            <option value="Schlüssel & Ausweise">Schlüssel & Campus Card</option>
            <option value="Taschen & Kleidung">Taschen & Kleidung</option>
            <option value="Studienmaterial">Bücher & Lernmaterialien</option>
            <option value="Wertgegenstände">Wertgegenstände</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-gray-800 text-white rounded text-sm font-medium py-2">
              Filtern
            </button>
            <Link href="/" className="px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm flex items-center justify-center">
              Reset
            </Link>
          </div>
        </form>
      </section>

      {/* Gegenstands-Karten */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Einträge ({items.length})</h2>

        {items.length === 0 ? (
          <p className="text-gray-500 italic py-6 text-center border rounded-lg bg-gray-50">
            Keine passenden Einträge vorhanden.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="border p-4 rounded-xl bg-white shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold uppercase tracking-wider ${
                        item.status === "LOST"
                          ? "bg-red-100 text-red-700"
                          : item.status === "FOUND"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.status === "LOST" ? "Verloren" : item.status === "FOUND" ? "Gefunden" : "Erledigt"}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mb-2">
                    📍 {item.location} {item.room ? `(${item.room})` : ""} | 🏷️ {item.category}
                  </p>

                  <p className="text-xs text-gray-400 mb-3">
                    Ereignis: {new Date(item.incidentDate).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" })}
                  </p>

                  {item.description && <p className="text-sm text-gray-700 mb-3">{item.description}</p>}
                </div>

                <div className="pt-3 border-t flex items-center justify-between gap-2 mt-2">
                  <Link
                    href={`/item/${item.id}`}
                    className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-1.5 px-3 rounded"
                  >
                    Aushang & QR-Code 🖨️
                  </Link>

                  <form action={updateStatus} className="flex gap-1">
                    <input type="hidden" name="id" value={item.id} />
                    {item.status !== "RESOLVED" ? (
                      <button
                        name="status"
                        value="RESOLVED"
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2.5 rounded"
                      >
                        Erledigt
                      </button>
                    ) : (
                      <button
                        name="status"
                        value="LOST"
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2.5 rounded"
                      >
                        Wieder öffnen
                      </button>
                    )}
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}