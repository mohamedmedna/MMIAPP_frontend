import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import { FileText, Download, Calendar, Tag } from "lucide-react";
import "../Styles/PlateformeGestion.css";

// -------- Helpers / Config --------
const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:4000";

const toText = (html) => {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return (div.textContent || "").trim();
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

const absolutize = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

// Simple pagination component
function Pager({ page, pageSize, total, onPage }) {
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

  return (
    <nav className="pager" aria-label="Pagination">
      <button className="pager-btn" onClick={prev} disabled={page === 1}>
        «
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
        »
      </button>
    </nav>
  );
}

function PlateformeGestion() {
  const newsSectionRef = useRef(null);
  const docsSectionRef = useRef(null);

  // Lists
  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [pagingActu, setPagingActu] = useState(false);
  const [pagingDoc, setPagingDoc] = useState(false);
  const [errorActu, setErrorActu] = useState(null);
  const [errorDoc, setErrorDoc] = useState(null);

  const [actuPage, setActuPage] = useState(1);
  const [actuPageSize, setActuPageSize] = useState(3);
  const [actuTotal, setActuTotal] = useState(0);

  const [docPage, setDocPage] = useState(1);
  const [docPageSize, setDocPageSize] = useState(3);
  const [docTotal, setDocTotal] = useState(0);

  const [typeDocs, setTypeDocs] = useState([]);
  const [docTypeFilter, setDocTypeFilter] = useState("");

  const typeMap = useMemo(() => {
    const m = {};
    typeDocs.forEach((t) => (m[t.id] = t.libelle));
    return m;
  }, [typeDocs]);

  const actuAbortRef = useRef(null);
  const docAbortRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/type-documents`);
        if (r.ok) setTypeDocs(await r.json());
      } catch {}
    })();
  }, []);

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
          `${API_BASE}/api/actualites?status=PUBLIE&page=${actuPage}&pageSize=${actuPageSize}`,
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
            categorie: "",
            date: a.datePublication,
            extrait: text.length > 160 ? text.slice(0, 160) + "…" : text,
          };
        });

        setActualites(adapted);
      } catch (e) {
        if (e.name !== "AbortError") {
          setErrorActu(e.message || "Erreur");
        }
      } finally {
        setInitialLoading(false);
        setPagingActu(false);
      }
    })();

    return () => controller.abort();
  }, [actuPage, actuPageSize]);

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
        });
        if (docTypeFilter) qs.set("typeId", docTypeFilter);

        const res = await fetch(`${API_BASE}/api/documents?${qs.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API documents non disponible");
        const json = await res.json();
        const items = Array.isArray(json.data) ? json.data : [];
        setDocTotal(json.total ?? items.length);

        // Preload media
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
            type: typeMap[d.docTypeId] || "Document",
            date: d.datePublication,
            categorie: "",
            taille: m?.tailleOctets ? formatBytes(m.tailleOctets) : "",
            url: absolutize(m?.url),
          };
        });

        setDocuments(adapted);
      } catch (e) {
        if (e.name !== "AbortError") {
          setErrorDoc(e.message || "Erreur");
        }
      } finally {
        setPagingDoc(false);
      }
    })();

    return () => controller.abort();
  }, [docPage, docPageSize, docTypeFilter, typeMap]);

  useEffect(() => {
    setDocPage(1);
  }, [docTypeFilter]);

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

  return (
    <>
      <Header />
      <div className="plateforme-gestion-container">
        {/* Section Hero */}
        <section
          className="hero section"
          role="banner"
          style={{
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

        {/* Section Actualités */}
        <section
          className="news section"
          aria-labelledby="news-title"
          ref={newsSectionRef}
        >
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title" id="news-title">
                  📰 Actualités
                </h2>
                <p className="section-subtitle">
                  Restez informé des dernières nouvelles du secteur industriel
                </p>
              </div>
              <div className="section-controls">
                <label className="filter-label">
                  Résultats / page:&nbsp;
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
                  Page {actuPage} —{" "}
                  {Math.min(actuPage * actuPageSize, actuTotal)}/{actuTotal}
                </span>
              </div>
            </div>

            {initialLoading && actualites.length === 0 ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Chargement des actualités...</p>
              </div>
            ) : actualites.length === 0 ? (
              <div className="no-data">
                <p>❌ Aucune actualité disponible</p>
                {errorActu ? (
                  <small style={{ opacity: 0.7 }}>({errorActu})</small>
                ) : null}
              </div>
            ) : (
              <>
                {pagingActu && (
                  <div className="thin-loader" aria-hidden="true" />
                )}

                <div className="news-grid">
                  {actualites.map((actualite, index) => (
                    <article
                      key={actualite.id}
                      className={`news-card animate-fade-in-up delay-${
                        index % 3
                      }`}
                      tabIndex="0"
                    >
                      <div className="news-image-wrapper">
                        <img
                          src={actualite.image}
                          alt={actualite.titre}
                          className="news-image"
                        />
                        {actualite.categorie ? (
                          <span className="news-category">
                            {actualite.categorie}
                          </span>
                        ) : null}
                      </div>
                      <div className="news-content">
                        <div className="news-meta">
                          <Calendar size={16} />
                          <span>
                            {new Date(actualite.date).toLocaleDateString(
                              "fr-FR"
                            )}
                          </span>
                        </div>
                        <h3 className="news-title">{actualite.titre}</h3>
                        <p className="news-excerpt">{actualite.extrait}</p>
                        <Link
                          to={`/actualite/${actualite.id}`}
                          className="news-link"
                        >
                          Lire la suite →
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
                />
              </>
            )}
          </div>
        </section>

        {/* Section Documents Juridiques */}
        <section
          className="documents section"
          aria-labelledby="documents-title"
          ref={docsSectionRef}
        >
          <div className="container">
            <div className="section-header">
              <div>
                <h2 className="section-title" id="documents-title">
                  📄 Documents Juridiques
                </h2>
                <p className="section-subtitle">
                  Accédez aux textes législatifs et réglementaires
                </p>
              </div>

              <div className="section-controls">
                <label className="filter-label">
                  Type:&nbsp;
                  <select
                    value={docTypeFilter}
                    onChange={(e) => setDocTypeFilter(e.target.value)}
                  >
                    <option value="">Tous</option>
                    {typeDocs.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.libelle}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="filter-label">
                  Résultats / page:&nbsp;
                  <select
                    value={docPageSize}
                    onChange={(e) => {
                      setDocPageSize(Number(e.target.value));
                      goDocPage(1);
                    }}
                  >
                    <option value={3}>3</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </label>

                <span className="count-indicator">
                  Page {docPage} — {Math.min(docPage * docPageSize, docTotal)}/
                  {docTotal}
                </span>
              </div>
            </div>

            {documents.length === 0 && !pagingDoc && !errorDoc ? (
              <div className="no-data">
                <p>❌ Aucun document disponible</p>
              </div>
            ) : (
              <>
                {pagingDoc && (
                  <div className="thin-loader" aria-hidden="true" />
                )}

                <div className="documents-grid">
                  {documents.map((doc) => (
                    <article key={doc.id} className="document-card">
                      <div className="document-icon">
                        <FileText size={32} />
                      </div>
                      <div className="document-content">
                        <div className="document-header">
                          <h3 className="document-title">{doc.titre}</h3>
                          <span className="document-type">{doc.type}</span>
                        </div>
                        <p className="document-description">
                          {doc.description}
                        </p>
                        <div className="document-meta">
                          <div className="meta-item">
                            <Calendar size={14} />
                            <span>
                              {new Date(doc.date).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                          {doc.categorie ? (
                            <div className="meta-item">
                              <Tag size={14} />
                              <span>{doc.categorie}</span>
                            </div>
                          ) : null}
                          {doc.taille ? (
                            <div className="meta-item">
                              <span className="document-size">
                                {doc.taille}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        {doc.url ? (
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="document-download-btn"
                            download
                          >
                            Télécharger
                          </a>
                        ) : (
                          <button
                            className="document-download-btn"
                            disabled
                            title="Fichier indisponible"
                          >
                            Télécharger
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>

                <Pager
                  page={docPage}
                  pageSize={docPageSize}
                  total={docTotal}
                  onPage={goDocPage}
                />

                {errorDoc ? (
                  <div className="no-data" style={{ marginTop: 8 }}>
                    <small style={{ opacity: 0.7 }}>({errorDoc})</small>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>

        {/* Lien vers l'administration */}
        <section className="admin-access section">
          <div className="container">
            <div className="admin-card">
              <h3>Espace Administrateur</h3>
              <p>Gérez les actualités et les documents juridiques</p>
              <Link to="/admin-portail" className="admin-link-btn">
                Accéder à l'administration
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

export default PlateformeGestion;
