import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import QRCode from "qrcode"

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>
}

const CATEGORIES = [
  "Elektronik & Zubehör",
  "Taschen & Rucksäcke",
  "Schlüssel",
  "Kleidung & Accessoires",
  "Ausweise & Karten",
  "Bücher & Skripte",
  "Sonstiges",
]

const LOCATIONS = [
  "Campus Burren - Gebäude G",
  "Campus Burren - Gebäude H",
  "Campus Beethovenstraße - Hauptgebäude",
  "Campus Beethovenstraße - Bibliothek",
  "Mensa / Cafeteria",
  "Sporthalle",
  "Anderer Ort",
]

export default async function Home({ searchParams }: PageProps) {
  const { q, status, category } = await searchParams

  const items = await prisma.item.findMany({
    where: {
      AND: [
        status ? { status } : {},
        category ? { category } : {},
        q
          ? {
              OR: [
                { title: { contains: q } },
                { description: { contains: q } },
                { location: { contains: q } },
                { contact: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  })

  // Erzeugt für jedes Item einen Data-URL QR-Code
  const itemsWithQr = await Promise.all(
    items.map(async (item) => {
      const qrData = `HS Aalen Lost & Found\nStatus: ${item.status}\nTitel: ${item.title}\nOrt: ${item.location}\nKontakt: ${item.contact ?? "Keiner"}`
      const qrCodeUrl = await QRCode.toDataURL(qrData, { width: 140, margin: 1 })
      return { ...item, qrCodeUrl }
    })
  )

  async function createItem(formData: FormData) {
    "use server"

    const title = formData.get("title") as string
    const category = formData.get("category") as string
    const location = formData.get("location") as string
    const status = formData.get("status") as string
    const description = (formData.get("description") as string) || null
    const contact = (formData.get("contact") as string) || null
    const imageUrl = (formData.get("imageUrl") as string) || null

    if (!title || !category || !location || !status) return

    await prisma.item.create({
      data: {
        title,
        category,
        location,
        status,
        description,
        contact,
        imageUrl,
      },
    })

    revalidatePath("/")
  }

  async function updateStatus(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const newStatus = formData.get("newStatus") as string
    if (!id || !newStatus) return

    await prisma.item.update({
      where: { id },
      data: { status: newStatus },
    })

    revalidatePath("/")
  }

  async function deleteItem(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    if (!id) return

    await prisma.item.delete({
      where: { id },
    })

    revalidatePath("/")
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold">HS Aalen – Lost & Found</h1>
          <p className="text-slate-600">Fundstücke und Verlustmeldungen für den Campus</p>
        </header>

        {/* Formular zur Meldung */}
        <section className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Gegenstand melden</h2>
          <form action={createItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Titel / Gegenstand *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="z. B. ThinkPad Ladekabel"
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Meldungsart *</label>
              <select
                name="status"
                defaultValue="FOUND"
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500 bg-white"
              >
                <option value="FOUND">Gefunden (Found)</option>
                <option value="LOST">Verloren (Lost)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kategorie *</label>
              <select
                name="category"
                required
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Standort / Campus *</label>
              <select
                name="location"
                required
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500 bg-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Kontakt (E-Mail / Tel)</label>
              <input
                type="text"
                name="contact"
                placeholder="z. B. max.mustermann@studmail.htw-aalen.de"
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bild-URL (Weblink)</label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/foto.jpg"
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Beschreibung</label>
              <textarea
                name="description"
                rows={2}
                placeholder="Besondere Merkmale, genauer Fundort, Zustand..."
                className="w-full border rounded-lg p-2 text-sm focus:outline-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-colors cursor-pointer"
              >
                Eintrag speichern
              </button>
            </div>
          </form>
        </section>

        {/* Filter- & Suchleiste */}
        <section className="bg-white p-4 rounded-xl border shadow-sm">
          <form method="GET" className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Suchen..."
              className="border rounded-lg p-2 text-sm focus:outline-blue-500"
            />

            <select
              name="status"
              defaultValue={status ?? ""}
              className="border rounded-lg p-2 text-sm focus:outline-blue-500 bg-white"
            >
              <option value="">Alle Status</option>
              <option value="FOUND">Nur Gefunden</option>
              <option value="LOST">Nur Verloren</option>
              <option value="RESOLVED">Erledigt / Zurückgegeben</option>
            </select>

            <select
              name="category"
              defaultValue={category ?? ""}
              className="border rounded-lg p-2 text-sm focus:outline-blue-500 bg-white"
            >
              <option value="">Alle Kategorien</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
              >
                Filtern
              </button>
              {(q || status || category) && (
                <a
                  href="/"
                  className="px-3 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-100 flex items-center justify-center"
                >
                  Reset
                </a>
              )}
            </div>
          </form>
        </section>

        {/* Liste der Gegenstände */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Gemeldete Einträge ({itemsWithQr.length})</h2>

          {itemsWithQr.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border text-slate-500">
              Keine Gegenstände gefunden.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {itemsWithQr.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 bg-white rounded-xl border shadow-sm flex flex-col justify-between ${
                    item.status === "RESOLVED" ? "opacity-75 bg-slate-50" : ""
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-snug">
                          {item.title}
                        </h3>
                        <span className="text-xs text-slate-500">{item.category}</span>
                      </div>
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md shrink-0 ${
                          item.status === "FOUND"
                            ? "bg-green-100 text-green-800"
                            : item.status === "LOST"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status === "FOUND"
                          ? "Gefunden"
                          : item.status === "LOST"
                          ? "Verloren"
                          : "Erledigt"}
                      </span>
                    </div>

                    {/* Bild */}
                    {item.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden border max-h-48 flex items-center justify-center bg-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="object-cover w-full h-full max-h-48"
                        />
                      </div>
                    )}

                    {item.description && (
                      <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                    )}

                    {/* QR-Code & Details */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.qrCodeUrl}
                        alt="QR Code"
                        className="w-20 h-20 border rounded bg-white p-1 shrink-0"
                      />
                      <div className="text-xs text-slate-600 space-y-1">
                        <p><strong>Standort:</strong> {item.location}</p>
                        {item.contact && <p><strong>Kontakt:</strong> {item.contact}</p>}
                        <p className="text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons: Status & Löschen */}
                  <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
                    <form action={updateStatus} className="flex gap-1">
                      <input type="hidden" name="id" value={item.id} />
                      {item.status !== "FOUND" && (
                        <button
                          type="submit"
                          name="newStatus"
                          value="FOUND"
                          className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium px-2 py-1 rounded border border-green-200 cursor-pointer"
                        >
                          → Gefunden
                        </button>
                      )}
                      {item.status !== "LOST" && (
                        <button
                          type="submit"
                          name="newStatus"
                          value="LOST"
                          className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium px-2 py-1 rounded border border-amber-200 cursor-pointer"
                        >
                          → Verloren
                        </button>
                      )}
                      {item.status !== "RESOLVED" && (
                        <button
                          type="submit"
                          name="newStatus"
                          value="RESOLVED"
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1 rounded border border-slate-300 cursor-pointer"
                        >
                          ✓ Erledigt
                        </button>
                      )}
                    </form>

                    <form action={deleteItem}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-xs text-red-600 hover:text-red-800 font-medium border border-red-200 hover:bg-red-50 rounded px-2 py-1 cursor-pointer"
                      >
                        Löschen
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}