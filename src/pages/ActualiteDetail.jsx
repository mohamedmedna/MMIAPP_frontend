import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Calendar, User, ArrowLeft } from "lucide-react";
import "../Styles/ActualiteDetail.css";
import { useTranslation } from "react-i18next";

//const API_BASE =
//import.meta?.env?.VITE_API_BASE ||
//process.env.REACT_APP_API_BASE ||
//"http://localhost:4000";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  window.__API_BASE__ ||
  "http://localhost:4000";

const LOCALE_MAP = { fr: "fr-FR", en: "en-US", ar: "ar-SA" };

const absolutize = (u) => {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u;
  return `${API_BASE}${u.startsWith("/") ? "" : "/"}${u}`;
};

const fmtDate = (dstr, locale) => {
  if (!dstr) return "-";
  const d = new Date(dstr);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
};

function ActualiteDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [actualite, setActualite] = useState(null);
  const [loading, setLoading] = useState(true);

  const lang = (i18n.language || "fr").slice(0, 2);
  const locale = LOCALE_MAP[lang] || "fr-FR";

  useEffect(() => {
    let aborted = false;

    async function fetchActualite() {
      setLoading(true);
      try {
        let r = await fetch(`${API_BASE}/api/actualites/${id}?lang=${lang}`);
        if (!r.ok) r = await fetch(`${API_BASE}/api/actualites/${id}`);
        if (!r.ok) {
          if (!aborted) setActualite(null);
          return;
        }
        const row = await r.json();

        let imageUrl = null;
        if (row.fichierMediaId) {
          try {
            const mr = await fetch(
              `${API_BASE}/api/media/${row.fichierMediaId}`
            );
            if (mr.ok) {
              const media = await mr.json();
              imageUrl = absolutize(media.url);
            }
          } catch (_) {}
        }

        if (!aborted) {
          setActualite({
            id: row.id,
            titre: row.titre,
            image: imageUrl,
            categorie: row.categorie || "",
            date: row.datePublication,
            auteur: row.auteur || "",
            contenu: row.contenuHtml || "",
          });
        }
      } catch (e) {
        console.error("Erreur lors du chargement de l'actualité:", e);
        if (!aborted) setActualite(null);
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchActualite();
    return () => {
      aborted = true;
    };
  }, [id, lang]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="actualite-detail-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t("actualiteDetail.loading")}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!actualite) {
    return (
      <>
        <Header />
        <div className="actualite-detail-container">
          <div className="error-message">
            <h2>{t("actualiteDetail.notFound")}</h2>
            <Link to="/plateforme-gestion" className="back-link">
              <ArrowLeft size={20} />
              {t("actualiteDetail.backToNews")}
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        className="actualite-detail-container"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <div className="actualite-detail-content">
          <Link to="/plateforme-gestion" className="back-link">
            <ArrowLeft size={20} />
            {t("actualiteDetail.backToNews")}
          </Link>

          <article className="actualite-article">
            <div className="actualite-header">
              {actualite.categorie ? (
                <span className="actualite-category">
                  {actualite.categorie}
                </span>
              ) : null}
              <h1 className="actualite-title">{actualite.titre}</h1>

              <div className="actualite-meta">
                <div className="meta-item">
                  <Calendar size={18} />
                  <span>{fmtDate(actualite.date, locale)}</span>
                </div>
                {actualite.auteur ? (
                  <div className="meta-item">
                    <User size={18} />
                    <span>{actualite.auteur}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {actualite.image && (
              <div className="actualite-image-container">
                <img
                  src={actualite.image}
                  alt={actualite.titre}
                  className="actualite-image"
                />
              </div>
            )}

            <div
              className="actualite-content"
              // The content is trusted HTML coming from your CMS/API
              dangerouslySetInnerHTML={{ __html: actualite.contenu }}
            />
          </article>

          <div className="actualite-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              {t("actualiteDetail.back")}
            </button>
            <button onClick={() => window.print()} className="btn-primary">
              {t("actualiteDetail.print")}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ActualiteDetail;
