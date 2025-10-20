import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Plus, Edit, Trash2, FileText, Newspaper, X, Save } from "lucide-react";
import "../Styles/AdminPortail.css";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

registerLocale("fr", fr);

const API_BASE = window.__APP_CONFIG__?.API_BASE;

const LOCALE_MAP = { fr: "fr-FR", en: "en-GB", ar: "ar-MA" };

// Helpers

const formatDateLatn = (d, locale = "fr-FR") => {
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

const toYYYYMMDD = (d) => {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const toYYYYMMDD_HHMMSS = (d) => {
  if (!d) return null;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
};
const getInitialLang = (i18n) => {
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
};

function AdminPortail() {
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(getInitialLang(i18n));

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

  // one empty translation “shape”
  const EMPTY_T = { titre: "", contenuHtml: "" };

  // i18n cache for the 3 locales
  const [i18nCache, setI18nCache] = useState({
    fr: { ...EMPTY_T },
    ar: { ...EMPTY_T },
    en: { ...EMPTY_T },
  });

  // slug helpers
  const makeSlug = useCallback((str) => {
    return (str || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A]+/gi, "-")
      .replace(/^-+|-+$/g, "");
  }, []);
  const makeUniqueSlug = useCallback(
    (s) => `${makeSlug(s)}-${Math.random().toString(36).slice(-5)}`,
    [makeSlug]
  );

  const [activeTab, setActiveTab] = useState("actualites");

  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [typeDocs, setTypeDocs] = useState([]);
  const [images, setImages] = useState([]);

  const typeLabelById = useMemo(() => {
    const m = {};
    typeDocs.forEach((t) => (m[t.id] = t.libelle));
    return m;
  }, [typeDocs]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const [formActualite, setFormActualite] = useState({
    status: "BROUILLON",
    fichierMediaId: null,
    datePublication: null,
  });

  const [formDocument, setFormDocument] = useState({
    status: "BROUILLON",
    docTypeId: "",
    fichierMediaId: null,
    datePublication: null,
  });

  const [trLocale, setTrLocale] = useState("fr");
  const [trTitre, setTrTitre] = useState("");
  const [trContenuHtml, setTrContenuHtml] = useState("");
  const [trDocTitre, setTrDocTitre] = useState("");
  const [trDocDescription, setTrDocDescription] = useState("");

  const trIsRTL = trLocale === "ar";

  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ---------- Load lists ----------
  useEffect(() => {
    fetchLists();
    fetchTypeDocs();
  }, [lang]);

  async function fetchLists() {
    try {
      const [actuRes, docRes] = await Promise.all([
        fetch(`${API_BASE}/api/actualites?page=1&pageSize=100&lang=${lang}`),
        fetch(`${API_BASE}/api/documents?page=1&pageSize=100&lang=${lang}`),
      ]);

      if (actuRes.ok) {
        const js = await actuRes.json();
        setActualites(Array.isArray(js.data) ? js.data : []);
      }
      if (docRes.ok) {
        const js = await docRes.json();
        setDocuments(Array.isArray(js.data) ? js.data : []);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des listes:", e);
    }
  }

  async function fetchTypeDocs() {
    try {
      const r = await fetch(`${API_BASE}/api/type-documents?lang=${lang}`);
      if (r.ok) setTypeDocs(await r.json());
    } catch (e) {
      console.error("Erreur chargement type-documents:", e);
    }
  }

  async function uploadMedia(file) {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch(`${API_BASE}/api/media`, {
      method: "POST",
      body: fd,
    });
    if (!r.ok) throw new Error("Upload media échoué");
    return r.json();
  }

  function resetTrInputs() {
    setTrLocale("fr");
    setTrTitre("");
    setTrContenuHtml("");
    setTrDocTitre("");
    setTrDocDescription("");
  }

  function resetI18nCache() {
    setI18nCache({
      fr: { ...EMPTY_T },
      ar: { ...EMPTY_T },
      en: { ...EMPTY_T },
    });
  }

  function applyTrFromCache(locale) {
    const tcache = i18nCache[locale] || EMPTY_T;
    if (activeTab === "actualites") {
      setTrTitre(tcache.titre || "");
      setTrContenuHtml(tcache.contenuHtml || "");
    } else {
      setTrDocTitre(tcache.titre || "");
      setTrDocDescription(tcache.extrait || "");
    }
  }

  useEffect(() => {
    applyTrFromCache(trLocale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trLocale]);

  function handleAddNew() {
    setEditMode(false);
    setCurrentItem(null);
    setImageFile(null);
    setDocumentFile(null);
    resetTrInputs();
    resetI18nCache();

    if (activeTab === "actualites") {
      setFormActualite({
        status: "BROUILLON",
        fichierMediaId: null,
        datePublication: null,
      });
    } else {
      setFormDocument({
        status: "BROUILLON",
        docTypeId: "",
        fichierMediaId: null,
        datePublication: null,
      });
    }

    setShowModal(true);
  }

  async function handleEdit(item) {
    setEditMode(true);
    setCurrentItem(item);
    setImageFile(null);
    setDocumentFile(null);
    resetTrInputs();
    resetI18nCache();
    setTrLocale("fr");
    setShowModal(true);

    if (activeTab === "actualites") {
      setFormActualite({
        status: item.status || "BROUILLON",
        fichierMediaId: item.fichierMediaId || null,
        datePublication: item.datePublication
          ? new Date(item.datePublication)
          : null,
      });

      // load translations
      try {
        const r = await fetch(
          `${API_BASE}/api/actualites/${item.id}/translations`
        );
        if (r.ok) {
          const rows = await r.json();
          const byLocale = {
            fr: { ...EMPTY_T },
            ar: { ...EMPTY_T },
            en: { ...EMPTY_T },
          };
          rows.forEach((tr) => {
            const loc = (tr.locale || "").toLowerCase();
            if (byLocale[loc]) {
              byLocale[loc] = {
                titre: tr.titre || "",
                contenuHtml: tr.contenuHtml || "",
              };
            }
          });
          setI18nCache(byLocale);
          setTrLocale("fr");
          setTimeout(() => applyTrFromCache("fr"), 0);
        }
      } catch (e) {
        console.error("Failed to load actualité translations", e);
      }
    } else {
      // Documents side
      setFormDocument({
        status: item.status || "BROUILLON",
        docTypeId: item.docTypeId || "",
        fichierMediaId: item.fichierMediaId || null,
        datePublication: item.datePublication
          ? new Date(item.datePublication)
          : null,
      });

      try {
        const r = await fetch(
          `${API_BASE}/api/documents/${item.id}/translations`
        );
        if (r.ok) {
          const rows = await r.json();
          const byLocale = {
            fr: { ...EMPTY_T },
            ar: { ...EMPTY_T },
            en: { ...EMPTY_T },
          };
          rows.forEach((tr) => {
            const loc = (tr.locale || "").toLowerCase();
            if (byLocale[loc]) {
              byLocale[loc] = {
                ...byLocale[loc],
                titre: tr.titre || "",
                extrait: tr.description || "",
              };
            }
          });
          setI18nCache(byLocale);
          setTrLocale("fr");
          setTimeout(() => applyTrFromCache("fr"), 0);
        }
      } catch (e) {
        console.error("Failed to load document translations", e);
      }
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("adminPortail.messages.confirmDelete"))) return;

    try {
      const endpoint = activeTab === "actualites" ? "actualites" : "documents";
      const r = await fetch(`${API_BASE}/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (r.ok) {
        await fetchLists();
        alert(t("adminPortail.messages.deleteSuccess"));
      } else {
        const js = await r.json().catch(() => ({}));
        alert(js?.error || t("adminPortail.messages.deleteError"));
      }
    } catch (e) {
      console.error(e);
      alert(t("adminPortail.messages.deleteError"));
    }
  }

  function updateCacheFor(locale, patch) {
    setI18nCache((prev) => ({
      ...prev,
      [locale]: { ...prev[locale], ...patch },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      let endpoint = activeTab === "actualites" ? "actualites" : "documents";
      let method = editMode ? "PUT" : "POST";
      let id = currentItem?.id;

      if (activeTab === "actualites") {
        const frT = i18nCache.fr?.titre?.trim();
        if (!editMode && !frT) {
          alert(t("adminPortail.messages.createNewsMissingFR"));
          setUploading(false);
          return;
        }

        let fichierMediaId = formActualite.fichierMediaId;
        if (imageFile) {
          const media = await uploadMedia(imageFile);
          fichierMediaId = media.id;
        }

        const url = editMode
          ? `${API_BASE}/api/${endpoint}/${id}`
          : `${API_BASE}/api/${endpoint}`;

        const payload = editMode
          ? {
              status: formActualite.status || "BROUILLON",
              datePublication: toYYYYMMDD_HHMMSS(formActualite.datePublication),
              fichierMediaId: fichierMediaId ?? null,
            }
          : {
              titre: i18nCache.fr.titre,
              contenuHtml: i18nCache.fr.contenuHtml || "",
              slug: makeUniqueSlug(i18nCache.fr.titre),
              extrait: "",
              status: formActualite.status || "BROUILLON",
              datePublication: toYYYYMMDD_HHMMSS(formActualite.datePublication),
              fichierMediaId: fichierMediaId ?? null,
            };

        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) {
          const js = await r.json().catch(() => ({}));
          throw new Error(js?.error || "Erreur sauvegarde actualité");
        }
        const base = await r.json();
        id = base.id;

        for (const loc of ["fr", "en", "ar"]) {
          const tcache = i18nCache[loc];
          if (!tcache?.titre?.trim()) continue;
          const resp = await fetch(
            `${API_BASE}/api/actualites/${id}/translations`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                locale: loc,
                titre: tcache.titre,
                slug: makeUniqueSlug(tcache.titre),
                extrait: "",
                contenuHtml: tcache.contenuHtml || "",
              }),
            }
          );
          if (!resp.ok) {
            const js = await resp.json().catch(() => ({}));
            throw new Error(js?.error || `Erreur traduction (${loc})`);
          }
        }
      } else {
        // DOCUMENTS
        const frDocTitle = i18nCache.fr?.titre?.trim();
        if (!editMode && !frDocTitle) {
          alert(t("adminPortail.messages.createDocMissingFR"));
          setUploading(false);
          return;
        }

        let fichierMediaId = formDocument.fichierMediaId;
        if (documentFile) {
          const media = await uploadMedia(documentFile);
          fichierMediaId = media.id;
        }

        if (!formDocument.docTypeId) {
          alert(t("adminPortail.messages.selectDocType"));
          setUploading(false);
          return;
        }

        const url = editMode
          ? `${API_BASE}/api/documents/${id}`
          : `${API_BASE}/api/documents`;

        const payload = editMode
          ? {
              status: formDocument.status || "BROUILLON",
              docTypeId: parseInt(formDocument.docTypeId, 10),
              fichierMediaId: parseInt(fichierMediaId, 10),
              datePublication: toYYYYMMDD(formDocument.datePublication),
            }
          : {
              titre: i18nCache.fr.titre,
              description: i18nCache.fr.extrait || "",
              status: formDocument.status || "BROUILLON",
              docTypeId: parseInt(formDocument.docTypeId, 10),
              fichierMediaId: parseInt(fichierMediaId, 10),
              datePublication: toYYYYMMDD(formDocument.datePublication),
            };

        const r = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!r.ok) {
          const js = await r.json().catch(() => ({}));
          throw new Error(js?.error || "Erreur sauvegarde document");
        }
        const base = await r.json();
        id = base.id;

        for (const loc of ["fr", "en", "ar"]) {
          const tcache = i18nCache[loc];
          const title = tcache?.titre?.trim();
          if (!title) continue;
          const resp = await fetch(
            `${API_BASE}/api/documents/${id}/translations`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                locale: loc,
                titre: title,
                description: tcache?.extrait || "",
              }),
            }
          );
          if (!resp.ok) {
            const js = await resp.json().catch(() => ({}));
            throw new Error(js?.error || `Erreur traduction doc (${loc})`);
          }
        }
      }

      await fetchLists();
      setShowModal(false);
      setImageFile(null);
      setDocumentFile(null);
      alert(
        editMode
          ? t("adminPortail.messages.savedEditSuccess")
          : t("adminPortail.messages.savedAddSuccess")
      );
    } catch (e) {
      console.error("Erreur lors de la sauvegarde:", e);
      alert(e.message || t("adminPortail.messages.saveErrorGeneric"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Header />
      <div
        className={`admin-portail-container ${isRTL ? "rtl" : ""}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="admin-header">
          <h1>{t("adminPortail.header.title")}</h1>
          <Link to="/plateforme-gestion" className="back-to-portal">
            {t("adminPortail.header.backToPortal")}
          </Link>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "actualites" ? "active" : ""}`}
            onClick={() => setActiveTab("actualites")}
          >
            <Newspaper size={20} />
            {t("adminPortail.tabs.news")}
          </button>
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <FileText size={20} />
            {t("adminPortail.tabs.documents")}
          </button>
        </div>

        <div className="admin-content">
          <div className="admin-toolbar">
            <h2>
              {activeTab === "actualites"
                ? t("adminPortail.toolbar.newsTitle")
                : t("adminPortail.toolbar.docsTitle")}
            </h2>
            <button className="btn-add" onClick={handleAddNew}>
              <Plus size={20} />
              {t("adminPortail.buttons.add")}
            </button>
          </div>

          {activeTab === "actualites" ? (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>{t("adminPortail.table.headers.title")}</th>
                    <th>{t("adminPortail.table.headers.status")}</th>
                    <th>{t("adminPortail.table.headers.publishDate")}</th>
                    <th>{t("adminPortail.table.headers.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {actualites.map((a) => (
                    <tr key={a.id}>
                      <td>{a.titre}</td>
                      <td>
                        <span className="badge">
                          {t(`adminPortail.status.${a.status}`)}
                        </span>
                      </td>
                      <td className="num">
                        <span dir="ltr">
                          {formatDateLatn(a.datePublication, currentLocale)}
                        </span>
                      </td>

                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(a)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(a.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {actualites.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{ textAlign: "center", opacity: 0.7 }}
                      >
                        {t("adminPortail.empty.news")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>{t("adminPortail.table.headers.title")}</th>
                    <th>{t("adminPortail.table.headers.type")}</th>
                    <th>{t("adminPortail.table.headers.status")}</th>
                    <th>{t("adminPortail.table.headers.publishDate")}</th>
                    <th>{t("adminPortail.table.headers.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td>{d.titre}</td>
                      <td>
                        <span className="badge">
                          {typeLabelById[d.docTypeId] || d.docTypeId}
                        </span>
                      </td>
                      <td>
                        <span className="badge">
                          {t(`adminPortail.status.${d.status}`)}
                        </span>
                      </td>
                      <td className="num">
                        <span dir="ltr">
                          {formatDateLatn(d.datePublication, currentLocale)}
                        </span>
                      </td>

                      <td className="actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(d)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(d.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {documents.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        style={{ textAlign: "center", opacity: 0.7 }}
                      >
                        {t("adminPortail.empty.documents")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {editMode
                    ? activeTab === "actualites"
                      ? t("adminPortail.modal.title.editNews")
                      : t("adminPortail.modal.title.editDocument")
                    : activeTab === "actualites"
                    ? t("adminPortail.modal.title.addNews")
                    : t("adminPortail.modal.title.addDocument")}
                </h3>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {activeTab === "actualites" ? (
                  <>
                    <div className="form-group">
                      <label>{t("adminPortail.fields.coverImage")}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] || null)
                        }
                        className="file-input"
                      />
                      {imageFile && (
                        <p className="file-name">📷 {imageFile.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t("adminPortail.fields.publicationDate")}</label>
                      <DatePicker
                        selected={formActualite.datePublication}
                        onChange={(d) =>
                          setFormActualite({
                            ...formActualite,
                            datePublication: d,
                          })
                        }
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={5}
                        dateFormat="dd/MM/yyyy HH:mm"
                        locale="fr"
                        placeholderText={t(
                          "adminPortail.placeholders.datetime"
                        )}
                        isClearable
                        calendarStartDay={1}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t("adminPortail.fields.status")} *</label>
                      <select
                        value={formActualite.status}
                        onChange={(e) =>
                          setFormActualite({
                            ...formActualite,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="BROUILLON">
                          {t("adminPortail.status.BROUILLON")}
                        </option>
                        <option value="PUBLIE">
                          {t("adminPortail.status.PUBLIE")}
                        </option>
                        <option value="ARCHIVE">
                          {t("adminPortail.status.ARCHIVE")}
                        </option>
                      </select>
                    </div>

                    {/* Translations panel */}
                    <fieldset className="i18n-panel">
                      <legend>
                        {t("adminPortail.fields.translationsLegend")}
                      </legend>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("adminPortail.fields.locale")}</label>
                          <select
                            value={trLocale}
                            onChange={(e) => setTrLocale(e.target.value)}
                          >
                            <option value="fr">fr</option>
                            <option value="en">en</option>
                            <option value="ar">ar</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t("adminPortail.fields.title")} *</label>
                        <input
                          type="text"
                          value={trTitre}
                          dir={trIsRTL ? "rtl" : "ltr"}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTrTitre(v);
                            updateCacheFor(trLocale, { titre: v });
                          }}
                          required={!editMode}
                        />
                      </div>
                      <div className="form-group">
                        <label>{t("adminPortail.fields.contentHtml")}</label>
                        <textarea
                          rows={6}
                          value={trContenuHtml}
                          dir={trIsRTL ? "rtl" : "ltr"}
                          onChange={(e) => {
                            setTrContenuHtml(e.target.value);
                            updateCacheFor(trLocale, {
                              contenuHtml: e.target.value,
                            });
                          }}
                        />
                      </div>
                    </fieldset>
                  </>
                ) : (
                  <>
                    {/* DOCUMENTS */}
                    <div className="form-row">
                      <div className="form-group">
                        <label>{t("adminPortail.fields.type")} *</label>
                        <select
                          value={formDocument.docTypeId}
                          onChange={(e) =>
                            setFormDocument({
                              ...formDocument,
                              docTypeId: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">
                            {t("adminPortail.fields.selectPlaceholder")}
                          </option>
                          {typeDocs.map((td) => (
                            <option key={td.id} value={td.id}>
                              {td.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>{t("adminPortail.fields.file")} *</label>
                      <input
                        type="file"
                        accept="application/pdf,application/*,image/*"
                        onChange={(e) =>
                          setDocumentFile(e.target.files?.[0] || null)
                        }
                        className="file-input"
                      />
                      {documentFile && (
                        <p className="file-name">
                          📄 {documentFile.name} (
                          <span dir="ltr">
                            {(documentFile.size / (1024 * 1024)).toFixed(2)}
                          </span>{" "}
                          MB)
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>{t("adminPortail.fields.publicationDate")}</label>
                      <DatePicker
                        selected={formDocument.datePublication}
                        onChange={(d) =>
                          setFormDocument({
                            ...formDocument,
                            datePublication: d,
                          })
                        }
                        dateFormat="dd/MM/yyyy"
                        locale="fr"
                        placeholderText={t("adminPortail.placeholders.date")}
                        isClearable
                        calendarStartDay={1}
                      />
                    </div>
                    <div className="form-group">
                      <label>{t("adminPortail.fields.status")} *</label>
                      <select
                        value={formDocument.status}
                        onChange={(e) =>
                          setFormDocument({
                            ...formDocument,
                            status: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="BROUILLON">
                          {t("adminPortail.status.BROUILLON")}
                        </option>
                        <option value="PUBLIE">
                          {t("adminPortail.status.PUBLIE")}
                        </option>
                        <option value="ARCHIVE">
                          {t("adminPortail.status.ARCHIVE")}
                        </option>
                      </select>
                    </div>

                    {/* Translations panel */}
                    <fieldset className="i18n-panel">
                      <legend>
                        {t("adminPortail.fields.translationsLegend")}
                      </legend>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t("adminPortail.fields.locale")}</label>
                          <select
                            value={trLocale}
                            onChange={(e) => setTrLocale(e.target.value)}
                          >
                            <option value="fr">fr</option>
                            <option value="en">en</option>
                            <option value="ar">ar</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>{t("adminPortail.fields.title")} *</label>
                        <input
                          type="text"
                          value={trDocTitre}
                          dir={trIsRTL ? "rtl" : "ltr"}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTrDocTitre(v);
                            updateCacheFor(trLocale, { titre: v });
                          }}
                          required={!editMode}
                        />
                      </div>

                      <div className="form-group">
                        <label>{t("adminPortail.fields.description")}</label>
                        <textarea
                          rows={4}
                          value={trDocDescription}
                          dir={trIsRTL ? "rtl" : "ltr"}
                          onChange={(e) => {
                            const v = e.target.value;
                            setTrDocDescription(v);
                            updateCacheFor(trLocale, { extrait: v });
                          }}
                        />
                      </div>
                    </fieldset>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    {t("adminPortail.buttons.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={uploading}
                  >
                    <Save size={20} />
                    {uploading
                      ? t("adminPortail.buttons.saving")
                      : editMode
                      ? t("adminPortail.buttons.edit")
                      : t("adminPortail.buttons.add")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default AdminPortail;
