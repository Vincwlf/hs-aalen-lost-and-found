import { prisma } from "@/lib/prisma";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

const CategoryIcons: Record<string, React.ReactNode> = {
  "Elektronik & IT": (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  "Campus Card & Schlüssel": (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  "Taschen & Kleidung": (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Studienmaterial: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Wertgegenstände: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sonstiges: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q || "").trim();
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
                { category: { contains: query } },
              ],
            }
          : {},
        filterStatus ? { status: filterStatus } : {},
        filterCategory ? { category: filterCategory } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  async function updateStatus(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    if (!id || !status) return;

    await prisma.item.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/");
    revalidatePath(`/item/${id}`);
  }

  const hasActiveFilters = Boolean(query || filterStatus || filterCategory);

  function buildFilterUrl(params: { q?: string; status?: string; category?: string }) {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.status) sp.set("status", params.status);
    if (params.category) sp.set("category", params.category);
    const str = sp.toString();
    return str ? `/?${str}` : "/";
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F5F7] text-[#344054]">
      {/* 1. Oberer Informationsbalken */}
      <div className="bg-[#173653] text-white text-xs px-4 sm:px-6 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-semibold tracking-wide">HOCHSCHULE AALEN</span>
          <span className="text-white/80 hidden sm:inline">
            Standorte: Beethovenstraße • Burren • Waldcampus
          </span>
        </div>
      </div>

      {/* 2. Header */}
      <header className="bg-white border-b border-[#DCE3E9] sticky top-0 z-20">
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
            href="/neu"
            className="bg-[#173653] hover:bg-[#122a40] text-white text-xs font-semibold px-4 py-2.5 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Meldung erfassen</span>
          </Link>
        </div>
      </header>

      {/* 3. Hero- & Filterbereich */}
      <section className="bg-white border-b border-[#DCE3E9] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <h1 className="text-2xl font-bold text-[#173653] tracking-tight">
              Verloren & Gefunden auf dem Campus
            </h1>
            <p className="text-sm text-[#526477] leading-relaxed">
              Zentrales Verzeichnis für Studierende und Mitarbeitende der Hochschule Aalen zur Meldung und Rückgabe von Fund- und Verlustgegenständen.
            </p>
          </div>

          {/* Suchformular (erhält aktive Status-/Kategoriefilter bei Textsuche) */}
          <form method="get" action="/" className="flex flex-col sm:flex-row gap-2 max-w-2xl">
            {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
            {filterCategory && <input type="hidden" name="category" value={filterCategory} />}
            <div className="relative flex-1">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#526477]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                name="q"
                defaultValue={query}
                placeholder="Gegenstand, Gebäude, Raum oder Beschreibung durchsuchen..."
                className="w-full bg-[#F3F5F7] focus:bg-white text-[#344054] placeholder-[#526477] text-sm pl-10 pr-3 py-2.5 rounded-md border border-[#DCE3E9] focus:outline-none focus:border-[#173653] focus:ring-1 focus:ring-[#173653] transition-colors"
              />
            </div>
            <button
              type="submit"
              className="bg-[#173653] hover:bg-[#122a40] text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors shrink-0"
            >
              Suchen
            </button>
          </form>

          {/* Filterleisten */}
          <div className="space-y-2.5 pt-1">
            {/* Status */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#526477] w-16 shrink-0">Status:</span>
              <Link
                href={buildFilterUrl({ q: query, category: filterCategory })}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  !filterStatus
                    ? "bg-[#173653] text-white border-[#173653] font-medium"
                    : "bg-white text-[#344054] border-[#DCE3E9] hover:bg-[#F3F5F7]"
                }`}
              >
                Alle
              </Link>
              <Link
                href={buildFilterUrl({
                  q: query,
                  status: filterStatus === "LOST" ? "" : "LOST",
                  category: filterCategory,
                })}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                  filterStatus === "LOST"
                    ? "bg-[#173653] text-white border-[#173653] font-medium"
                    : "bg-white text-[#344054] border-[#DCE3E9] hover:bg-[#F3F5F7]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === "LOST" ? "bg-white" : "bg-red-600"}`} />
                Wird gesucht
              </Link>
              <Link
                href={buildFilterUrl({
                  q: query,
                  status: filterStatus === "FOUND" ? "" : "FOUND",
                  category: filterCategory,
                })}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                  filterStatus === "FOUND"
                    ? "bg-[#173653] text-white border-[#173653] font-medium"
                    : "bg-white text-[#344054] border-[#DCE3E9] hover:bg-[#F3F5F7]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === "FOUND" ? "bg-white" : "bg-emerald-600"}`} />
                Gefunden
              </Link>
              <Link
                href={buildFilterUrl({
                  q: query,
                  status: filterStatus === "RESOLVED" ? "" : "RESOLVED",
                  category: filterCategory,
                })}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                  filterStatus === "RESOLVED"
                    ? "bg-[#173653] text-white border-[#173653] font-medium"
                    : "bg-white text-[#344054] border-[#DCE3E9] hover:bg-[#F3F5F7]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === "RESOLVED" ? "bg-white" : "bg-[#526477]"}`} />
                Erledigt
              </Link>
            </div>

            {/* Kategorien */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#526477] w-16 shrink-0">Kategorie:</span>
              {CATEGORIES.map((cat) => {
                const isActive = filterCategory === cat;
                return (
                  <Link
                    key={cat}
                    href={buildFilterUrl({
                      q: query,
                      status: filterStatus,
                      category: isActive ? "" : cat,
                    })}
                    className={`text-xs px-3 py-1.5 rounded-md border transition-colors inline-flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#173653] text-white border-[#173653] font-medium"
                        : "bg-white text-[#344054] border-[#DCE3E9] hover:bg-[#F3F5F7]"
                    }`}
                  >
                    {CategoryIcons[cat]}
                    <span>{cat}</span>
                  </Link>
                );
              })}

              {hasActiveFilters && (
                <Link
                  href="/"
                  className="text-xs text-[#173653] hover:underline ml-1 font-medium inline-flex items-center gap-1"
                >
                  <span>× Filter zurücksetzen</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ergebnisbereich */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCE3E9] pb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#526477]">
            {items.length} {items.length === 1 ? "Meldung gefunden" : "Meldungen gefunden"}
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-[#526477]">
              Gefilterte Ansicht •{" "}
              <Link href="/" className="text-[#173653] font-medium hover:underline">
                Alle anzeigen
              </Link>
            </span>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#DCE3E9] rounded-md p-10 text-center space-y-2.5">
            <p className="text-sm font-semibold text-[#344054]">
              Keine passenden Einträge vorhanden
            </p>
            <p className="text-xs text-[#526477] max-w-md mx-auto">
              Für deine aktuelle Auswahl liegen im System keine Meldungen vor. Setze die Filter zurück oder erfasse eine neue Meldung.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <Link
                  href="/"
                  className="text-xs bg-[#F3F5F7] hover:bg-[#DCE3E9] text-[#344054] font-medium px-3.5 py-2 rounded-md transition-colors"
                >
                  Filter zurücksetzen
                </Link>
              )}
              <Link
                href="/neu"
                className="text-xs bg-[#173653] hover:bg-[#122a40] text-white font-medium px-3.5 py-2 rounded-md transition-colors"
              >
                + Neue Meldung erfassen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOST;
              const icon = CategoryIcons[item.category] || CategoryIcons["Sonstiges"];

              return (
                <article
                  key={item.id}
                  className="bg-white border border-[#DCE3E9] rounded-md flex flex-col justify-between hover:border-[#526477] transition-colors"
                >
                  <div className="p-4 space-y-3">
                    {/* Karten-Header */}
                    <div className="flex items-center justify-between border-b border-[#DCE3E9] pb-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded border ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                        {statusCfg.label}
                      </span>
                      <time className="text-[11px] text-[#526477]">
                        {new Date(item.incidentDate).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </time>
                    </div>

                    {/* Titel & Standort */}
                    <div>
                      <h2 className="font-semibold text-base text-[#173653] leading-snug">
                        <Link href={`/item/${item.id}`} className="hover:underline">
                          {item.title}
                        </Link>
                      </h2>
                      <p className="text-xs text-[#526477] mt-1 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">
                          {item.location}
                          {item.room ? ` (${item.room})` : ""}
                        </span>
                      </p>
                    </div>

                    {/* Beschreibung */}
                    {item.description ? (
                      <p className="text-xs text-[#344054] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    ) : (
                      <p className="text-xs text-[#526477] italic">
                        Keine nähere Beschreibung hinterlegt.
                      </p>
                    )}

                    {/* Kategorie */}
                    <div className="text-[11px] text-[#526477] flex items-center gap-1.5 pt-1">
                      {icon}
                      <span>{item.category}</span>
                    </div>
                  </div>

                  {/* Karten-Footer mit Aktionen */}
                  <div className="px-4 py-2.5 border-t border-[#DCE3E9] bg-[#F3F5F7] flex items-center justify-between rounded-b-md">
                    <Link
                      href={`/item/${item.id}`}
                      className="text-xs font-semibold text-[#173653] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Aushang & QR</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <form action={updateStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      {item.status !== "RESOLVED" ? (
                        <button
                          type="submit"
                          name="status"
                          value="RESOLVED"
                          className="text-[11px] font-medium text-[#526477] hover:text-[#173653] transition-colors"
                        >
                          Als erledigt markieren
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="status"
                          value="LOST"
                          className="text-[11px] font-medium text-[#526477] hover:text-[#173653] transition-colors"
                        >
                          Wieder öffnen
                        </button>
                      )}
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <footer className="border-t border-[#DCE3E9] bg-white py-6 mt-12 text-center text-xs text-[#526477]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-semibold text-[#344054]">Hochschule Aalen – Digitales Fundbüro</p>
          <p>Zentraler Campus-Service für Studierende und Mitarbeitende</p>
        </div>
      </footer>
    </div>
  );
}