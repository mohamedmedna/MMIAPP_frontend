import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MapComponent from "./MapComponent";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import { FileText, Calendar, Layers } from "lucide-react";
import "../Styles/PlateformeGestion.css";
import { useTranslation } from "react-i18next";

const API_BASE = window.__APP_CONFIG__?.API_BASE;
const LOCALE_MAP = { fr: "fr-FR", en: "en-GB", ar: "ar-MA" };

// compact spacing
const SECTION_STYLE = { padding: "18px 0", margin: "0" };
const SECTION_HEADER_STYLE = { marginBottom: 10 };
const GRID_GAP_STYLE = { gap: 10 };

const formatDate = (d, locale) => {
  if (!d) return "-";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "-";
  const s = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    numberingSystem: "latn",
    calendar: "gregory",
  }).format(date);
  return s.replace(/[\u200e\u200f\u061c]/g, "");
};

const toText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
};

const absolutize = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

function Pager({ page, pageSize, total, onPage, isRTL = false }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;

  const prev = () => onPage(Math.max(1, page - 1));
  const next = () => onPage(Math.min(pages, page + 1));

  const windowSize = 5;
  const half = Math.floor(windowSize / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(pages, start + windowSize - 1);
  start = Math.max(1, end - windowSize + 1);

  const nums = [];
  for (let p = start; p <= end; p++) nums.push(p);

  const prevSymbol = isRTL ? "»" : "«";
  const nextSymbol = isRTL ? "«" : "»";

  return (
    <nav
      className="pager"
      aria-label="Pagination"
      dir={isRTL ? "rtl" : "ltr"}
      style={{ marginTop: 8 }}
    >
      <button className="pager-btn" onClick={prev} disabled={page === 1}>
        {prevSymbol}
      </button>
      {start > 1 && (
        <>
          <button className="pager-btn" onClick={() => onPage(1)}>
            1
          </button>
          {start > 2 && <span className="pager-ellipsis">…</span>}
        </>
      )}
      {nums.map((p) => (
        <button
          key={p}
          className={`pager-btn ${p === page ? "active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      {end < pages && (
        <>
          {end < pages - 1 && <span className="pager-ellipsis">…</span>}
          <button className="pager-btn" onClick={() => onPage(pages)}>
            {pages}
          </button>
        </>
      )}
      <button className="pager-btn" onClick={next} disabled={page === pages}>
        {nextSymbol}
      </button>
    </nav>
  );
}

function PlateformeGestion() {
  const { t, i18n } = useTranslation();

  const newsSectionRef = useRef(null);
  const docsSectionRef = useRef(null);
  const annexSectionRef = useRef(null);
  const projetsSectionRef = useRef(null);

  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentsAnnexes, setDocumentsAnnexes] = useState([]);
  const [projets, setProjets] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [pagingActu, setPagingActu] = useState(false);
  const [pagingDoc, setPagingDoc] = useState(false);
  const [pagingAnnex, setPagingAnnex] = useState(false);
  const [pagingProjet, setPagingProjet] = useState(false);

  const [errorActu, setErrorActu] = useState(null);
  const [errorDoc, setErrorDoc] = useState(null);
  const [errorAnnex, setErrorAnnex] = useState(null);
  const [errorProjet, setErrorProjet] = useState(null);

  const [actuPage, setActuPage] = useState(1);
  const [actuPageSize, setActuPageSize] = useState(3);
  const [actuTotal, setActuTotal] = useState(0);

  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(5);
  const [docTotal, setDocTotal] = useState(0);

  const [annexPage, setAnnexPage] = useState(1);
  const [annexPageSize, setAnnexPageSize] = useState(5);
  const [annexTotal, setAnnexTotal] = useState(0);

  const [projetPage, setProjetPage] = useState(1);
  const [projetPageSize, setProjetPageSize] = useState(9);
  const [projetTotal, setProjetTotal] = useState(0);

  // Only docs type filter remains
  const [typeDocs, setTypeDocs] = useState([]);
  const [docTypeFilter, setDocTypeFilter] = useState("");

  const typeMap = useMemo(() => {
    const m = {};
    typeDocs.forEach((t) => (m[t.id] = t.libelle));
    return m;
  }, [typeDocs]);

  const actuAbortRef = useRef(null);
  const docAbortRef = useRef(null);
  const annexAbortRef = useRef(null);
  const projetAbortRef = useRef(null);

  const [lang, setLang] = useState(() => {
    try {
      return (
        localStorage.getItem("lang") ||
        i18n.language ||
        navigator.language ||
        "fr"
      ).slice(0, 2);
    } catch {
      return (i18n.language || "fr").slice(0, 2);
    }
  });

  useEffect(() => {
    const isRTL = lang === "ar";
    document.documentElement.setAttribute("dir", isRTL ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  useEffect(() => {
    const onChange = (lng) => setLang((lng || "fr").slice(0, 2));
    i18n.on("languageChanged", onChange);
    const onStorage = (e) => {
      if (e.key === "lang") setLang((e.newValue || "fr").slice(0, 2));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      i18n.off("languageChanged", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [i18n]);

  const currentLocale = LOCALE_MAP[lang] || "fr-FR";
  const isRTL = lang === "ar";

  // types for docs
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/type-documents?lang=${lang}`);
        if (r.ok) setTypeDocs(await r.json());
      } catch {}
    })();
  }, [lang]);

  // Actualités
  useEffect(() => {
    if (actuAbortRef.current) actuAbortRef.current.abort();
    const controller = new AbortController();
    actuAbortRef.current = controller;

    const firstPaint = initialLoading && actualites.length === 0;
    if (firstPaint) setInitialLoading(true);
    else setPagingActu(true);
    setErrorActu(null);

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/actualites?status=PUBLIE&lang=${lang}&page=${actuPage}&pageSize=${actuPageSize}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("API actualités non disponible");
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : [];
        setActuTotal(json.total ?? items.length);

        const ids = [
          ...new Set(items.map((a) => a.fichierMediaId).filter(Boolean)),
        ];
        const mediaMap = {};
        await Promise.all(
          ids.map(async (mid) => {
            try {
              const r = await fetch(`${API_BASE}/api/media/${mid}`, {
                signal: controller.signal,
              });
              if (r.ok) mediaMap[mid] = await r.json();
            } catch {}
          })
        );

        const adapted = items.map((a) => {
          const url = a.fichierMediaId ? mediaMap[a.fichierMediaId]?.url : null;
          const text = toText(a.contenuHtml);
          return {
            id: a.id,
            titre: a.titre,
            image: absolutize(url) || "/images/placeholder-news.jpg",
            date: a.datePublication,
            extrait: text.length > 140 ? text.slice(0, 140) + "…" : text,
          };
        });

        setActualites(adapted);
      } catch (e) {
        if (e.name !== "AbortError") setErrorActu(e.message || "Erreur");
      } finally {
        setInitialLoading(false);
        setPagingActu(false);
      }
    })();

    return () => controller.abort();
  }, [actuPage, actuPageSize, lang, initialLoading, actualites.length]);

  // Documents (hide size + publication date in UI)
  useEffect(() => {
    if (docAbortRef.current) docAbortRef.current.abort();
    const controller = new AbortController();
    docAbortRef.current = controller;

    setPagingDoc(true);
    setErrorDoc(null);

    (async () => {
      try {
        const qs = new URLSearchParams({
          status: "PUBLIE",
          page: String(docPage),
          pageSize: String(docPageSize),
          lang,
        });
        if (docTypeFilter) qs.set("typeId", docTypeFilter);

        const res = await fetch(`${API_BASE}/api/documents?${qs.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API documents non disponible");
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : [];
        setDocTotal(json.total ?? items.length);

        const ids = [
          ...new Set(items.map((d) => d.fichierMediaId).filter(Boolean)),
        ];
        const mediaMap = {};
        await Promise.all(
          ids.map(async (mid) => {
            try {
              const r = await fetch(`${API_BASE}/api/media/${mid}`, {
                signal: controller.signal,
              });
              if (r.ok) mediaMap[mid] = await r.json();
            } catch {}
          })
        );

        const adapted = items.map((d) => {
          const m = d.fichierMediaId ? mediaMap[d.fichierMediaId] : null;
          return {
            id: d.id,
            titre: d.titre,
            description: d.description || "",
            type: typeMap[d.docTypeId] || "Document", // kept internally
            date: d.datePublication, // kept in data (not displayed)
            url: absolutize(m?.url),
          };
        });

        setDocuments(adapted);
      } catch (e) {
        if (e.name !== "AbortError") setErrorDoc(e.message || "Erreur");
      } finally {
        setPagingDoc(false);
      }
    })();

    return () => controller.abort();
  }, [docPage, docPageSize, docTypeFilter, typeMap, lang]);

  // Documents annexes (no Type selector; hide Type badge; keep date)
  useEffect(() => {
    if (annexAbortRef.current) annexAbortRef.current.abort();
    const controller = new AbortController();
    annexAbortRef.current = controller;

    setPagingAnnex(true);
    setErrorAnnex(null);

    (async () => {
      try {
        const qs = new URLSearchParams({
          status: "PUBLIE",
          page: String(annexPage),
          pageSize: String(annexPageSize),
          lang,
        });

        const res = await fetch(
          `${API_BASE}/api/documents-annexes?${qs.toString()}`,
          {
            signal: controller.signal,
          }
        );
        if (!res.ok) throw new Error("API documents annexes non disponible");
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : [];
        setAnnexTotal(json.total ?? items.length);

        const ids = [
          ...new Set(items.map((d) => d.fichierMediaId).filter(Boolean)),
        ];
        const mediaMap = {};
        await Promise.all(
          ids.map(async (mid) => {
            try {
              const r = await fetch(`${API_BASE}/api/media/${mid}`, {
                signal: controller.signal,
              });
              if (r.ok) mediaMap[mid] = await r.json();
            } catch {}
          })
        );

        const adapted = items.map((d) => {
          const m = d.fichierMediaId ? mediaMap[d.fichierMediaId] : null;
          return {
            id: d.id,
            titre: d.titre,
            description: d.description || "",
            type: typeMap[d.docTypeId] || "Document", // not displayed
            date: d.datePublication,
            url: absolutize(m?.url),
          };
        });

        setDocumentsAnnexes(adapted);
      } catch (e) {
        if (e.name !== "AbortError") setErrorAnnex(e.message || "Erreur");
      } finally {
        setPagingAnnex(false);
      }
    })();

    return () => controller.abort();
  }, [annexPage, annexPageSize, typeMap, lang]);

  // Projets (no État selector, no status chip)
  useEffect(() => {
    if (projetAbortRef.current) projetAbortRef.current.abort();
    const controller = new AbortController();
    projetAbortRef.current = controller;

    setPagingProjet(true);
    setErrorProjet(null);

    (async () => {
      try {
        const qs = new URLSearchParams({
          status: "PUBLIE",
          page: String(projetPage),
          pageSize: String(projetPageSize),
          lang,
        });

        const res = await fetch(`${API_BASE}/api/projets?${qs.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API projets non disponible");
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : [];
        setProjetTotal(json.total ?? items.length);

        const ids = [
          ...new Set(items.map((p) => p.fichierMediaId).filter(Boolean)),
        ];
        const mediaMap = {};
        await Promise.all(
          ids.map(async (mid) => {
            try {
              const r = await fetch(`${API_BASE}/api/media/${mid}`, {
                signal: controller.signal,
              });
              if (r.ok) mediaMap[mid] = await r.json();
            } catch {}
          })
        );

        const adapted = items.map((p) => {
          const m = p.fichierMediaId ? mediaMap[p.fichierMediaId] : null;
          const excerpt =
            (p.description || "").length > 120
              ? (p.description || "").slice(0, 120) + "…"
              : p.description || "";
          return {
            id: p.id,
            titre: p.titre,
            description: excerpt,
            date: p.datePublication,
            url: absolutize(m?.url),
            etat: p.etat || "EN_COURS", // kept, not shown
          };
        });

        setProjets(adapted);
      } catch (e) {
        if (e.name !== "AbortError") setErrorProjet(e.message || "Erreur");
      } finally {
        setPagingProjet(false);
      }
    })();

    return () => controller.abort();
  }, [projetPage, projetPageSize, lang]);

  // Reset pages on the only remaining filter (docs type)
  useEffect(() => setDocPage(1), [docTypeFilter]);

  // Clamp page if totals change
  useEffect(() => {
    const pages = Math.max(1, Math.ceil(actuTotal / Math.max(1, actuPageSize)));
    if (actuPage > pages) setActuPage(pages);
  }, [actuTotal, actuPageSize, actuPage]);

  useEffect(() => {
    const pages = Math.max(1, Math.ceil(docTotal / Math.max(1, docPageSize)));
    if (docPage > pages) setDocPage(pages);
  }, [docTotal, docPageSize, docPage]);

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(annexTotal / Math.max(1, annexPageSize))
    );
    if (annexPage > pages) setAnnexPage(pages);
  }, [annexTotal, annexPageSize, annexPage]);

  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(projetTotal / Math.max(1, projetPageSize))
    );
    if (projetPage > pages) setProjetPage(pages);
  }, [projetTotal, projetPageSize, projetPage]);

  // Scroll helpers
  const goActuPage = (p) => {
    setActuPage(p);
    newsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const goDocPage = (p) => {
    setDocPage(p);
    docsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const goAnnexPage = (p) => {
    setAnnexPage(p);
    annexSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const goProjetPage = (p) => {
    setProjetPage(p);
    projetsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <Header />
      <div
        className={`plateforme-gestion-container ${isRTL ? "rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <section
          className="hero hero--compact section"
          role="banner"
          style={{
            position: "relative",
            backgroundImage: `url(${banniereMinistere})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="digital-animation" aria-hidden="true">
            <div className="circle big"></div>
            <div className="circle medium"></div>
            <div className="circle small"></div>
          </div>
        </section>

        {/* Actualités */}
        <section
          className="news section"
          aria-labelledby="news-title"
          ref={newsSectionRef}
          style={SECTION_STYLE}
        >
          <div className="container">
            <div className="section-header" style={SECTION_HEADER_STYLE}>
              <div>
                <h2
                  className="section-title"
                  id="news-title"
                  style={{ marginBottom: 4 }}
                >
                  {t("plateformeGestion.actualites.title")}
                </h2>
                <p className="section-subtitle" style={{ margin: 0 }}>
                  {t("plateformeGestion.actualites.subtitle")}
                </p>
              </div>
              <div className="section-controls" style={{ gap: 6 }}>
                <label className="filter-label">
                  {t("plateformeGestion.actualites.resultsPerPage")}&nbsp;
                  <select
                    value={actuPageSize}
                    onChange={(e) => {
                      setActuPageSize(Number(e.target.value));
                      goActuPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </label>
                <span className="count-indicator">
                  {t("plateformeGestion.actualites.page")}{" "}
                  <span dir="ltr">{actuPage}</span> —{" "}
                  <span dir="ltr">
                    {Math.min(actuPage * actuPageSize, actuTotal)}/{actuTotal}
                  </span>
                </span>
              </div>
            </div>

            {initialLoading && actualites.length === 0 ? (
              <div className="loading-spinner" style={{ marginTop: 8 }}>
                <div className="spinner"></div>
                <p>{t("plateformeGestion.actualites.loading")}</p>
              </div>
            ) : actualites.length === 0 ? (
              <div className="no-data" style={{ marginTop: 8 }}>
                <p>❌ {t("plateformeGestion.actualites.noData")}</p>
                {errorActu ? (
                  <small style={{ opacity: 0.7 }}>({errorActu})</small>
                ) : null}
              </div>
            ) : (
              <>
                {pagingActu && (
                  <div className="thin-loader" aria-hidden="true" />
                )}
                <div className="news-grid" style={GRID_GAP_STYLE}>
                  {actualites.map((a, idx) => (
                    <article
                      key={a.id}
                      className={`news-card animate-fade-in-up delay-${
                        idx % 3
                      }`}
                      style={{ marginBottom: 8 }}
                    >
                      <div className="news-image-wrapper">
                        <img
                          src={a.image}
                          alt={a.titre}
                          className="news-image"
                        />
                      </div>
                      <div className="news-content">
                        <div className="news-meta">
                          <Calendar size={16} />
                          <span dir={isRTL ? "ltr" : undefined}>
                            {formatDate(a.date, currentLocale)}
                          </span>
                        </div>
                        <h3 className="news-title">{a.titre}</h3>
                        <p className="news-excerpt">{a.extrait}</p>
                        <Link to={`/actualite/${a.id}`} className="news-link">
                          {t("plateformeGestion.actualites.readMore")}{" "}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                <Pager
                  page={actuPage}
                  pageSize={actuPageSize}
                  total={actuTotal}
                  onPage={goActuPage}
                  isRTL={isRTL}
                />
              </>
            )}
          </div>
        </section>

        {/* Hub */}
        <section
          className="hub section"
          aria-labelledby="hub-title"
          style={SECTION_STYLE}
        >
          <div className="container">
            <div className="section-header" style={SECTION_HEADER_STYLE}>
              <div>
                <h2
                  className="section-title"
                  id="hub-title"
                  style={{ marginBottom: 4 }}
                >
                  {t("plateformeGestion.hub.title", {
                    defaultValue: "Espace documentaire et projets",
                  })}
                </h2>
                <p className="section-subtitle" style={{ margin: 0 }}>
                  {t("plateformeGestion.hub.subtitle", {
                    defaultValue:
                      "Consultez les documents, la banque des projets et les documents annexes dans un seul espace.",
                  })}
                </p>
              </div>
            </div>

            <div
              className={`hub-grid ${isRTL ? "rtl" : ""}`}
              dir={isRTL ? "rtl" : "ltr"}
              style={GRID_GAP_STYLE}
            >
              {/* Documents */}
              <section
                className="hub-col"
                aria-labelledby="hub-docs-title"
                ref={docsSectionRef}
              >
                <header className="hub-col-header" style={{ marginBottom: 8 }}>
                  <h3 className="hub-col-title" id="hub-docs-title">
                    {t("plateformeGestion.documents.title")}
                  </h3>
                  <div className="section-controls" style={{ gap: 6 }}>
                    <label className="filter-label">
                      {t("plateformeGestion.documents.typeFilter")}&nbsp;
                      <select
                        value={docTypeFilter}
                        onChange={(e) => setDocTypeFilter(e.target.value)}
                      >
                        <option value="">
                          {t("plateformeGestion.documents.allTypes")}
                        </option>
                        {typeDocs.map((tDoc) => (
                          <option key={tDoc.id} value={tDoc.id}>
                            {tDoc.libelle}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="filter-label">
                      {t("plateformeGestion.documents.resultsPerPage")}&nbsp;
                      <select
                        value={docPageSize}
                        onChange={(e) => {
                          setDocPageSize(Number(e.target.value));
                          goDocPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </label>
                  </div>
                </header>

                {pagingDoc && (
                  <div className="thin-loader" aria-hidden="true" />
                )}

                {documents.length === 0 && !pagingDoc && !errorDoc ? (
                  <div className="no-data" style={{ marginTop: 8 }}>
                    <p>{t("plateformeGestion.documents.noData")}</p>
                  </div>
                ) : (
                  <>
                    <ul
                      className="note-list"
                      style={{ ...GRID_GAP_STYLE, marginTop: 6 }}
                    >
                      {documents.map((doc) => {
                        const href = doc?.url || `/document/${doc.id}`;
                        return (
                          <li
                            key={doc.id}
                            className="note-card"
                            style={{ padding: 8 }}
                          >
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="note-card-link"
                              title={doc.titre}
                            >
                              <span className="note-icon" aria-hidden="true">
                                <FileText size={18} />
                              </span>
                              <span className="note-main">
                                <span className="note-title">{doc.titre}</span>
                                {/* size + publication date removed */}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>

                    <Pager
                      page={docPage}
                      pageSize={docPageSize}
                      total={docTotal}
                      onPage={goDocPage}
                      isRTL={isRTL}
                    />
                    {errorDoc ? (
                      <div className="no-data" style={{ marginTop: 6 }}>
                        <small style={{ opacity: 0.7 }}>({errorDoc})</small>
                      </div>
                    ) : null}
                  </>
                )}
              </section>

              {/* Projets (no État selector, no status chip) */}
              <section
                className="hub-col"
                aria-labelledby="hub-projets-title"
                ref={projetsSectionRef}
              >
                <header className="hub-col-header" style={{ marginBottom: 8 }}>
                  <h3 className="hub-col-title" id="hub-projets-title">
                    {t("plateformeGestion.projects.title", {
                      defaultValue: "Banque des projets",
                    })}
                  </h3>
                  <div className="section-controls" style={{ gap: 6 }}>
                    <label className="filter-label">
                      {t("plateformeGestion.projects.resultsPerPage", {
                        defaultValue: "Résultats / page",
                      })}
                      &nbsp;
                      <select
                        value={projetPageSize}
                        onChange={(e) => {
                          setProjetPageSize(Number(e.target.value));
                          goProjetPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={9}>9</option>
                        <option value={12}>12</option>
                      </select>
                    </label>
                  </div>
                </header>

                {pagingProjet && (
                  <div className="thin-loader" aria-hidden="true" />
                )}

                {projets.length === 0 && !pagingProjet && !errorProjet ? (
                  <div className="no-data" style={{ marginTop: 8 }}>
                    <p>
                      {t("plateformeGestion.projects.noData", {
                        defaultValue: "Aucun projet pour le moment.",
                      })}
                    </p>
                  </div>
                ) : (
                  <>
                    <ul
                      className="note-list"
                      style={{ ...GRID_GAP_STYLE, marginTop: 6 }}
                    >
                      {projets.map((p) => {
                        const href =
                          p?.detailUrl || p?.url || `/projet/${p.id}`;
                        return (
                          <li
                            key={p.id}
                            className="note-card"
                            style={{ padding: 8 }}
                          >
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="note-card-link"
                              title={p.titre}
                            >
                              <span className="note-icon" aria-hidden="true">
                                <Layers size={18} />
                              </span>
                              <span className="note-main">
                                <span className="note-title">{p.titre}</span>
                                <span className="note-meta"></span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>

                    <Pager
                      page={projetPage}
                      pageSize={projetPageSize}
                      total={projetTotal}
                      onPage={goProjetPage}
                      isRTL={isRTL}
                    />
                    {errorProjet ? (
                      <div className="no-data" style={{ marginTop: 6 }}>
                        <small style={{ opacity: 0.7 }}>({errorProjet})</small>
                      </div>
                    ) : null}
                  </>
                )}
              </section>

              <section
                className="hub-col"
                aria-labelledby="hub-annex-title"
                ref={annexSectionRef}
              >
                <header className="hub-col-header" style={{ marginBottom: 8 }}>
                  <h3 className="hub-col-title" id="hub-annex-title">
                    {t("plateformeGestion.documentsAnnexes.title")}
                  </h3>
                  <div className="section-controls" style={{ gap: 6 }}>
                    <label className="filter-label">
                      {t("plateformeGestion.documentsAnnexes.resultsPerPage")}
                      &nbsp;
                      <select
                        value={annexPageSize}
                        onChange={(e) => {
                          setAnnexPageSize(Number(e.target.value));
                          goAnnexPage(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </label>
                  </div>
                </header>

                {pagingAnnex && (
                  <div className="thin-loader" aria-hidden="true" />
                )}

                {documentsAnnexes.length === 0 &&
                !pagingAnnex &&
                !errorAnnex ? (
                  <div className="no-data" style={{ marginTop: 8 }}>
                    <p>{t("plateformeGestion.documentsAnnexes.noData")}</p>
                  </div>
                ) : (
                  <>
                    <ul
                      className="note-list"
                      style={{ ...GRID_GAP_STYLE, marginTop: 6 }}
                    >
                      {documentsAnnexes.map((doc) => {
                        const href = doc?.url || `/document-annexe/${doc.id}`;
                        return (
                          <li
                            key={doc.id}
                            className="note-card"
                            style={{ padding: 8 }}
                          >
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="note-card-link"
                              title={doc.titre}
                            >
                              <span className="note-icon" aria-hidden="true">
                                <FileText size={18} />
                              </span>
                              <span className="note-main">
                                <span className="note-title">{doc.titre}</span>
                                <span className="note-meta"></span>
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ul>

                    <Pager
                      page={annexPage}
                      pageSize={annexPageSize}
                      total={annexTotal}
                      onPage={goAnnexPage}
                      isRTL={isRTL}
                    />
                    {errorAnnex ? (
                      <div className="no-data" style={{ marginTop: 6 }}>
                        <small style={{ opacity: 0.7 }}>({errorAnnex})</small>
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            </div>
          </div>
        </section>

        {/* Map */}
        <section
          className="map-block section"
          aria-labelledby="map-title"
          style={SECTION_STYLE}
        >
          <div className="container">
            <div className="section-header" style={{ marginBottom: 8 }}>
              <h2
                className="section-title"
                id="map-title"
                style={{ margin: 0 }}
              >
                {t("map.title")}
              </h2>
            </div>
            <div className="map-block-content" style={{ marginTop: 6 }}>
              <MapComponent />
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default PlateformeGestion;
