import { prisma } from "@/lib/prisma";
import { CATEGORIES, STATUS_CONFIG } from "@/lib/constants";
import { revalidatePath } from "next/cache";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; category?: string }>;
}

const CategoryIcons: Record<string, React.ReactNode> = {
  "Elektronik & IT": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  "Campus Card & Schlüssel": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  "Taschen & Kleidung": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Studienmaterial: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Wertgegenstände: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Sonstiges: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

export default async function Home(props: PageProps) {
  const searchParams = await props.searchParams;
  const query = (searchParams.q || "").trim();
  const filterStatus = searchParams.status || "";
  const filterCategory = searchParams.category || "";

  const [items, totalLost, totalFound] = await Promise.all([
    prisma.item.findMany({
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
    }),
    prisma.item.count({ where: { status: "LOST" } }),
    prisma.item.count({ where: { status: "FOUND" } }),
  ]);

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
      {/* 1. Oberer Campus-Balken */}
      <div className="bg-[#173653] text-white text-[11px] px-4 sm:px-6 py-2 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider uppercase">Hochschule Aalen</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80">Technik und Wirtschaft</span>
          </div>
          <span className="text-white/80 hidden sm:inline">
            Campus Beethovenstraße • Burren • Waldcampus
          </span>
        </div>
      </div>

      {/* 2. Haupt-Navigation */}
      <header className="bg-white border-b border-[#DCE3E9] sticky top-0 z-30 shadow-[0_1px_2px_rgba(23,54,83,0.03)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-11 h-11 bg-[#173653] group-hover:bg-[#122a40] transition-colors text-white flex flex-col items-center justify-center rounded-xl shrink-0 shadow-xs">
              <span className="text-[9px] font-medium tracking-widest leading-none text-white/80">HS</span>
              <span className="text-[14px] font-extrabold leading-none mt-0.5 tracking-tight">AA</span>
            </div>
            <div className="pl-3.5 border-l border-[#DCE3E9]">
              <span className="font-bold text-base tracking-tight text-[#173653] block leading-none">
                Hochschule Aalen
              </span>
              <span className="text-[11px] font-semibold text-[#526477] uppercase tracking-widest block mt-1">
                Digitales Fundbüro
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/neu"
              className="bg-[#173653] hover:bg-[#122a40] text-white text-xs font-semibold px-5 py-3 rounded-full shadow-xs transition-all inline-flex items-center gap-2"
            >
              <span className="text-sm font-bold leading-none">+</span>
              <span>Meldung erfassen</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero- & Steuerungsbereich */}
      <section className="bg-white border-b border-[#DCE3E9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#173653] bg-[#F3F5F7] px-3 py-1 rounded-full border border-[#DCE3E9]">
                <span>Zentraler Studierenden- & Gebäudeservice</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-[#173653] tracking-tight">
                Verloren & Gefunden auf dem Campus
              </h1>
              <p className="text-sm text-[#526477] leading-relaxed">
                Durchsuche aktuelle Fund- und Verlustmeldungen aller Hochschulgebäude oder erstelle direkt einen druckfertigen Aushang mit QR-Code.
              </p>
            </div>

            <div className="flex items-center gap-4 self-start md:self-auto bg-[#F3F5F7] border border-[#DCE3E9] rounded-2xl p-4 shrink-0 shadow-2xs">
              <div className="px-3 py-0.5 border-r border-[#DCE3E9]">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#526477]">
                  Aktuell gesucht
                </span>
                <span className="text-xl font-bold text-[#173653] flex items-center gap-2 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  {totalLost}
                </span>
              </div>
              <div className="px-3 py-0.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#526477]">
                  Bereit zur Abholung
                </span>
                <span className="text-xl font-bold text-[#173653] flex items-center gap-2 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  {totalFound}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2">
            <form method="get" action="/" className="flex-1 max-w-2xl">
              {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
              {filterCategory && <input type="hidden" name="category" value={filterCategory} />}
              <div className="relative flex items-center bg-[#F3F5F7] focus-within:bg-white rounded-full border border-[#DCE3E9] focus-within:border-[#173653] focus-within:ring-2 focus-within:ring-[#173653]/15 transition-all p-1">
                <svg
                  className="w-4 h-4 ml-4 text-[#526477] shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  name="q"
                  defaultValue={query}
                  placeholder="Nach Gegenstand, Gebäude (z. B. BS1, Bibliothek) oder Raum suchen..."
                  className="w-full bg-transparent text-[#344054] placeholder-[#526477] text-sm px-3.5 py-2.5 focus:outline-none"
                />
                {query && (
                  <Link
                    href={buildFilterUrl({ status: filterStatus, category: filterCategory })}
                    className="text-xs text-[#526477] hover:text-[#344054] px-3 font-semibold"
                    title="Suche löschen"
                  >
                    ✕
                  </Link>
                )}
                <button
                  type="submit"
                  className="bg-[#173653] hover:bg-[#122a40] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors shrink-0 shadow-xs"
                >
                  Suchen
                </button>
              </div>
            </form>

            <div className="inline-flex bg-[#F3F5F7] p-1.5 rounded-full border border-[#DCE3E9] self-start lg:self-auto gap-1">
              <Link
                href={buildFilterUrl({ q: query, category: filterCategory })}
                className={`text-xs px-4 py-1.5 rounded-full transition-all font-medium ${
                  !filterStatus
                    ? "bg-[#173653] text-white font-semibold shadow-xs"
                    : "text-[#526477] hover:text-[#344054]"
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
                className={`text-xs px-4 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 font-medium ${
                  filterStatus === "LOST"
                    ? "bg-[#173653] text-white font-semibold shadow-xs"
                    : "text-[#526477] hover:text-[#344054]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Gesucht
              </Link>
              <Link
                href={buildFilterUrl({
                  q: query,
                  status: filterStatus === "FOUND" ? "" : "FOUND",
                  category: filterCategory,
                })}
                className={`text-xs px-4 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 font-medium ${
                  filterStatus === "FOUND"
                    ? "bg-[#173653] text-white font-semibold shadow-xs"
                    : "text-[#526477] hover:text-[#344054]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Gefunden
              </Link>
              <Link
                href={buildFilterUrl({
                  q: query,
                  status: filterStatus === "RESOLVED" ? "" : "RESOLVED",
                  category: filterCategory,
                })}
                className={`text-xs px-4 py-1.5 rounded-full transition-all inline-flex items-center gap-1.5 font-medium ${
                  filterStatus === "RESOLVED"
                    ? "bg-[#173653] text-white font-semibold shadow-xs"
                    : "text-[#526477] hover:text-[#344054]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#526477]" />
                Erledigt
              </Link>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F3F5F7] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#526477] mr-2">
              Kategorien:
            </span>
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
                  className={`text-xs px-4 py-2 rounded-full border transition-all inline-flex items-center gap-2 font-medium ${
                    isActive
                      ? "bg-[#173653] text-white border-[#173653] shadow-xs"
                      : "bg-white text-[#344054] border-[#DCE3E9] hover:border-[#526477] hover:bg-[#F3F5F7]/60"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-[#526477]"}>
                    {CategoryIcons[cat]}
                  </span>
                  <span>{cat}</span>
                </Link>
              );
            })}

            {hasActiveFilters && (
              <Link
                href="/"
                className="text-xs text-[#173653] hover:underline ml-auto font-semibold inline-flex items-center gap-1 px-2 py-1"
              >
                <span>✕ Filter zurücksetzen</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 4. Ergebnisbereich */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#526477]">
            {items.length} {items.length === 1 ? "Eintrag gelistet" : "Einträge gelistet"}
          </h2>
          <span className="text-xs text-[#526477]">
            Sortiert nach aktuellsten Meldungen
          </span>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border border-[#DCE3E9] rounded-2xl p-14 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#F3F5F7] text-[#526477] flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-base font-bold text-[#173653]">
              Keine passenden Meldungen gefunden
            </p>
            <p className="text-xs text-[#526477] max-w-md mx-auto leading-relaxed">
              Für deine aktuelle Filterauswahl liegen keine Einträge vor. Setze die Filter zurück oder erfasse direkt eine neue Meldung.
            </p>
            <div className="pt-3 flex items-center justify-center gap-3">
              {hasActiveFilters && (
                <Link
                  href="/"
                  className="text-xs bg-[#F3F5F7] hover:bg-[#DCE3E9] text-[#344054] font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  Filter zurücksetzen
                </Link>
              )}
              <Link
                href="/neu"
                className="text-xs bg-[#173653] hover:bg-[#122a40] text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                + Neue Meldung erfassen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOST;
              const icon = CategoryIcons[item.category] || CategoryIcons["Sonstiges"];
              const topBarColor =
                item.status === "LOST"
                  ? "bg-red-600"
                  : item.status === "FOUND"
                  ? "bg-emerald-600"
                  : "bg-[#526477]";

              return (
                <article
                  key={item.id}
                  className="group bg-white border border-[#DCE3E9] rounded-2xl overflow-hidden flex flex-col justify-between shadow-[0_2px_8px_rgba(23,54,83,0.04)] hover:shadow-lg hover:border-[#526477]/50 transition-all"
                >
                  <div>
                    <div className={`h-1.5 w-full ${topBarColor}`} />

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border ${statusCfg.badgeBg} ${statusCfg.badgeText} ${statusCfg.badgeBorder}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor}`} />
                          {statusCfg.label}
                        </span>
                        <time className="text-[11px] font-medium text-[#526477]">
                          {new Date(item.incidentDate).toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </time>
                      </div>

                      <div className="flex items-start gap-3.5 pt-1">
                        <div className="w-10 h-10 rounded-xl bg-[#F3F5F7] border border-[#DCE3E9] text-[#173653] flex items-center justify-center shrink-0">
                          {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base text-[#173653] group-hover:underline leading-snug truncate">
                            <Link href={`/item/${item.id}`}>{item.title}</Link>
                          </h3>
                          <p className="text-xs font-medium text-[#526477] mt-0.5 truncate">
                            {item.category}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-[#344054] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                        {item.description || "Keine weiterführende Beschreibung angegeben."}
                      </p>

                      <div className="bg-[#F3F5F7]/70 border border-[#DCE3E9]/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-[#344054]">
                        <svg
                          className="w-4 h-4 text-[#173653] shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium truncate">
                          {item.location}
                          {item.room ? ` • ${item.room}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3.5 border-t border-[#DCE3E9] bg-[#F3F5F7]/40 flex items-center justify-between">
                    <Link
                      href={`/item/${item.id}`}
                      className="text-xs font-bold text-[#173653] hover:underline inline-flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      <span>Aushang & QR</span>
                    </Link>

                    <form action={updateStatus}>
                      <input type="hidden" name="id" value={item.id} />
                      {item.status !== "RESOLVED" ? (
                        <button
                          type="submit"
                          name="status"
                          value="RESOLVED"
                          className="text-[11px] font-medium text-[#526477] hover:text-[#173653] transition-colors cursor-pointer"
                        >
                          ✓ Als erledigt markieren
                        </button>
                      ) : (
                        <button
                          type="submit"
                          name="status"
                          value="LOST"
                          className="text-[11px] font-medium text-[#526477] hover:text-[#173653] transition-colors cursor-pointer"
                        >
                          ↺ Wieder öffnen
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

      {/* Physischer Info-Hinweis */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-6">
        <div className="bg-white border border-[#DCE3E9] rounded-2xl p-8 sm:p-10 shadow-[0_2px_8px_rgba(23,54,83,0.03)] grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-2 space-y-2.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#173653] bg-[#F3F5F7] px-3 py-1 rounded-full border border-[#DCE3E9]">
              <span>📍 Physische Abgabe & Zentrale</span>
            </div>
            <h3 className="font-bold text-xl text-[#173653]">
              Gegenstand im Fundbüro abgeben?
            </h3>
            <p className="text-xs sm:text-sm text-[#526477] leading-relaxed">
              Haben Sie auf dem Campus einen Gegenstand gefunden? Sie können diesen persönlich während der Servicezeiten beim zentralen Studierendenservice oder an der jeweiligen Gebäude-Infothek abgeben.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center border-t md:border-t-0 md:border-l border-[#DCE3E9] pt-6 md:pt-0 md:pl-8 space-y-3">
            <div className="text-xs text-[#344054] space-y-1 text-left md:text-right">
              <p className="font-semibold text-[#173653]">Öffnungszeiten:</p>
              <p className="text-[#526477]">Mo – Do: 09:00 – 15:00 Uhr</p>
              <p className="text-[#526477]">Fr: 09:00 – 13:00 Uhr</p>
            </div>
            <Link
              href="/neu"
              className="text-xs font-semibold text-[#173653] hover:underline pt-1 inline-flex items-center gap-1"
            >
              <span>Online-Meldung erstellen</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-[#DCE3E9] bg-white py-10 mt-12 text-xs text-[#526477]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="font-bold text-[#173653]">Hochschule Aalen – Technik und Wirtschaft</p>
            <p className="text-[#526477]">Digitales Campus-Fundbüro • Ein Service für Studierende und Beschäftigte</p>
          </div>
          <div className="flex items-center gap-4 text-[#526477]">
            <span className="hover:text-[#173653] transition-colors cursor-pointer">Impressum</span>
            <span>•</span>
            <span className="hover:text-[#173653] transition-colors cursor-pointer">Datenschutz</span>
            <span>•</span>
            <span className="hover:text-[#173653] transition-colors cursor-pointer">Kontakt</span>
          </div>
        </div>
      </footer>
    </div>
  );
}