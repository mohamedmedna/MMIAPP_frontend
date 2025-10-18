import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Plus, Edit, Trash2, FileText, Newspaper, X, Save, Image as ImageIcon } from "lucide-react";
import "../Styles/AdminPortail.css";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
import en from "date-fns/locale/en-US";
import ar from "date-fns/locale/ar-SA";
import "react-datepicker/dist/react-datepicker.css";
import { useTranslation } from "react-i18next";

registerLocale("fr", fr);
registerLocale("en", en);
registerLocale("ar", ar);
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

const toDateInputValue = (dstr) => {
  if (!dstr) return "";
  const d = new Date(dstr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const toLocalDateTimeInput = (dstr) => {
  if (!dstr) return "";
  const d = new Date(dstr);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const toMySQLDateTime = (localValue) => {
  if (!localValue) return null;
  return localValue.replace("T", " ") + ":00";
};

const API_BASE =
  import.meta?.env?.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:4000";

function AdminPortail() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState("actualites");

  const [actualites, setActualites] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [images, setImages] = useState([]);

  const [typeDocs, setTypeDocs] = useState([]);
  const typeLabelById = useMemo(() => {
    const m = {};
    typeDocs.forEach((t) => (m[t.id] = t.libelle));
    return m;
  }, [typeDocs]);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  // Form actualité
  const [formActualite, setFormActualite] = useState({
    titre: "",
    contenu: "",
    status: "BROUILLON",
    fichierMediaId: null,
    datePublication: null,
  });

  // Form document
  const [formDocument, setFormDocument] = useState({
    titre: "",
    description: "",
    status: "BROUILLON",
    docTypeId: "",
    fichierMediaId: null,
    datePublication: null,
  });

  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Form image upload
  const [uploadImageFile, setUploadImageFile] = useState(null);

  useEffect(() => {
    fetchLists();
    fetchTypeDocs();
  }, []);

  async function fetchLists() {
    try {
      const [actuRes, docRes, mediaRes] = await Promise.all([
        fetch(`${API_BASE}/api/actualites?page=1&pageSize=100`),
        fetch(`${API_BASE}/api/documents?page=1&pageSize=100`),
        fetch(`${API_BASE}/api/media?page=1&pageSize=100`),
      ]);

      if (actuRes.ok) {
        const js = await actuRes.json();
        setActualites(Array.isArray(js.data) ? js.data : []);
      }

      if (docRes.ok) {
        const js = await docRes.json();
        setDocuments(Array.isArray(js.data) ? js.data : []);
      }

      if (mediaRes.ok) {
        const js = await mediaRes.json();
        setImages(Array.isArray(js.data) ? js.data : []);
      }
    } catch (e) {
      console.error("Erreur lors du chargement des listes:", e);
    }
  }

  async function fetchTypeDocs() {
    try {
      const r = await fetch(`${API_BASE}/api/type-documents`);
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

  function handleAddNew() {
    setEditMode(false);
    setCurrentItem(null);
    setImageFile(null);
    setDocumentFile(null);
    setUploadImageFile(null);

    if (activeTab === "actualites") {
      setFormActualite({
        titre: "",
        contenu: "",
        status: "BROUILLON",
        fichierMediaId: null,
        datePublication: "",
      });
    } else if (activeTab === "documents") {
      setFormDocument({
        titre: "",
        description: "",
        status: "BROUILLON",
        docTypeId: "",
        fichierMediaId: null,
        datePublication: "",
      });
    }

    setShowModal(true);
  }

  function handleEdit(item) {
    setEditMode(true);
    setCurrentItem(item);
    setImageFile(null);
    setDocumentFile(null);

    if (activeTab === "actualites") {
      setFormActualite({
        titre: item.titre || "",
        contenu: item.contenuHtml || "",
        status: item.status || "BROUILLON",
        fichierMediaId: item.fichierMediaId || null,
        datePublication: item.datePublication
          ? new Date(item.datePublication)
          : null,
      });
    } else {
      setFormDocument({
        titre: item.titre || "",
        description: item.description || "",
        status: item.status || "BROUILLON",
        docTypeId: item.docTypeId || "",
        fichierMediaId: item.fichierMediaId || null,
        datePublication: item.datePublication
          ? new Date(item.datePublication)
          : null,
      });
    }

    setShowModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm(t('adminPortail.messages.confirmDelete')))
      return;

    try {
      let endpoint = "";
      if (activeTab === "actualites") endpoint = "actualites";
      else if (activeTab === "documents") endpoint = "documents";
      else if (activeTab === "images") endpoint = "media";
      
      const r = await fetch(`${API_BASE}/api/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (r.ok) {
        await fetchLists();
        alert(t('adminPortail.messages.deleteSuccess'));
      } else {
        const js = await r.json().catch(() => ({}));
        alert(js?.error || t('adminPortail.messages.deleteError'));
      }
    } catch (e) {
      console.error(e);
      alert(t('adminPortail.messages.deleteError'));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setUploading(true);

    try {
      // Cas spécial: Upload d'image seule
      if (activeTab === "images") {
        if (!uploadImageFile) {
          alert(t('adminPortail.messages.selectImage'));
          setUploading(false);
          return;
        }
        
        const media = await uploadMedia(uploadImageFile);
        await fetchLists();
        setShowModal(false);
        setUploadImageFile(null);
        alert(t('adminPortail.messages.imageAddSuccess'));
        setUploading(false);
        return;
      }

      let payload = {};
      let endpoint = "";
      let method = editMode ? "PUT" : "POST";
      let url = "";

      if (activeTab === "actualites") {
        let fichierMediaId = formActualite.fichierMediaId;
        if (imageFile) {
          const media = await uploadMedia(imageFile);
          fichierMediaId = media.id;
        }

        payload = {
          titre: formActualite.titre,
          contenuHtml: formActualite.contenu,
          status: formActualite.status || "BROUILLON",
          datePublication: toYYYYMMDD_HHMMSS(formActualite.datePublication),
          fichierMediaId: fichierMediaId ?? null,
          // autheurId: null, categorieIds: [], tagIds: []
        };

        endpoint = "actualites";
        url = editMode
          ? `${API_BASE}/api/${endpoint}/${currentItem.id}`
          : `${API_BASE}/api/${endpoint}`;
      } else {
        let fichierMediaId = formDocument.fichierMediaId;
        if (documentFile) {
          const media = await uploadMedia(documentFile);
          fichierMediaId = media.id;
        }

        if (!formDocument.docTypeId) {
          alert(t('adminPortail.messages.selectDocType'));
          setUploading(false);
          return;
        }

        payload = {
          titre: formDocument.titre,
          description: formDocument.description,
          status: formDocument.status || "BROUILLON",
          docTypeId: parseInt(formDocument.docTypeId, 10),
          fichierMediaId: parseInt(fichierMediaId, 10),
          datePublication: toYYYYMMDD(formDocument.datePublication),
          // autheurId: null, tagIds: []
        };

        endpoint = "documents";
        url = editMode
          ? `${API_BASE}/api/${endpoint}/${currentItem.id}`
          : `${API_BASE}/api/${endpoint}`;
      }

      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (r.ok) {
        await fetchLists();
        setShowModal(false);
        setImageFile(null);
        setDocumentFile(null);
        alert(
          editMode
            ? t('adminPortail.messages.editSuccess')
            : t('adminPortail.messages.saveSuccess')
        );
      } else {
        const js = await r.json().catch(() => ({}));
        alert(js?.error || t('adminPortail.messages.saveError'));
      }
    } catch (e) {
      console.error("Erreur lors de la sauvegarde:", e);
      alert(e.message || t('adminPortail.messages.saveError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="admin-portail-container">
        <div className="admin-header">
          <h1>{t('adminPortail.title')}</h1>
          <Link to="/superadmin-dashboard" className="back-to-dashboard">
            <i className="fa-solid fa-arrow-left"></i>
            {t('adminPortail.backToDashboard')}
          </Link>
        </div>

        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === "actualites" ? "active" : ""}`}
            onClick={() => setActiveTab("actualites")}
          >
            <Newspaper size={20} />
            {t('adminPortail.tabs.actualites')}
          </button>
          <button
            className={`tab-btn ${activeTab === "documents" ? "active" : ""}`}
            onClick={() => setActiveTab("documents")}
          >
            <FileText size={20} />
            {t('adminPortail.tabs.documents')}
          </button>
          <button
            className={`tab-btn ${activeTab === "images" ? "active" : ""}`}
            onClick={() => setActiveTab("images")}
          >
            <ImageIcon size={20} />
            {t('adminPortail.tabs.images')}
          </button>
        </div>

        <div className="admin-content">
          <div className="admin-toolbar">
            <h2>
              {activeTab === "actualites"
                ? t('adminPortail.actualites.title')
                : activeTab === "documents"
                ? t('adminPortail.documents.title')
                : t('adminPortail.images.title')}
            </h2>
            <button className="btn-add" onClick={handleAddNew}>
              <Plus size={20} />
              {t('adminPortail.actions.add')}
            </button>
          </div>

          {activeTab === "actualites" ? (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('adminPortail.actualites.columns.titre')}</th>
                    <th>{t('adminPortail.actualites.columns.statut')}</th>
                    <th>{t('adminPortail.actualites.columns.datePublication')}</th>
                    <th>{t('adminPortail.actualites.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {actualites.map((a) => (
                    <tr key={a.id}>
                      <td>{a.titre}</td>
                      <td>
                        <span className="badge">{a.status}</span>
                      </td>
                      <td>
                        {a.datePublication
                          ? new Date(a.datePublication).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
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
                        {t('adminPortail.actualites.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : activeTab === "documents" ? (
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>{t('adminPortail.documents.columns.titre')}</th>
                    <th>{t('adminPortail.documents.columns.type')}</th>
                    <th>{t('adminPortail.documents.columns.statut')}</th>
                    <th>{t('adminPortail.documents.columns.datePublication')}</th>
                    <th>{t('adminPortail.documents.columns.actions')}</th>
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
                        <span className="badge">{d.status}</span>
                      </td>
                      <td>
                        {d.datePublication
                          ? new Date(d.datePublication).toLocaleDateString(
                              "fr-FR"
                            )
                          : "-"}
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
                        {t('adminPortail.documents.noData')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="images-grid-container">
              <div className="images-grid">
                {images.map((img) => (
                  <div key={img.id} className="image-card">
                    <div className="image-preview">
                      {img.mimeType?.startsWith("image/") ? (
                        <img 
                          src={`${API_BASE}${img.url}`} 
                          alt={img.filename}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="no-preview" style={{ display: img.mimeType?.startsWith("image/") ? 'none' : 'flex' }}>
                        <FileText size={32} />
                      </div>
                    </div>
                    <div className="image-info">
                      <p className="image-filename" title={img.filename}>
                        {img.filename}
                      </p>
                      <p className="image-meta">
                        {img.mimeType} • {img.tailleOctets ? (img.tailleOctets / 1024).toFixed(1) + ' KB' : '-'}
                      </p>
                    </div>
                    <div className="image-actions">
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(img.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {images.length === 0 && (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', opacity: 0.7 }}>
                    {t('adminPortail.images.noData')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {activeTab === "actualites" 
                    ? (editMode ? t('adminPortail.actualites.form.editTitle') : t('adminPortail.actualites.form.addTitle'))
                    : activeTab === "documents" 
                    ? (editMode ? t('adminPortail.documents.form.editTitle') : t('adminPortail.documents.form.addTitle'))
                    : t('adminPortail.images.form.addTitle')}
                </h3>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="modal-form">
                {activeTab === "images" ? (
                  <>
                    <div className="form-group">
                      <label>{t('adminPortail.images.form.imageRequired')}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setUploadImageFile(e.target.files?.[0] || null)
                        }
                        className="file-input"
                        required
                      />
                      {uploadImageFile && (
                        <div className="file-preview">
                          <p className="file-name">{t('adminPortail.images.form.imageName')} {uploadImageFile.name}</p>
                          <p className="file-size">
                            {(uploadImageFile.size / 1024).toFixed(2)} {t('adminPortail.images.form.fileSize')}
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : activeTab === "actualites" ? (
                  <>
                    <div className="form-group">
                      <label>{t('adminPortail.actualites.form.titreRequired')}</label>
                      <input
                        type="text"
                        value={formActualite.titre}
                        onChange={(e) =>
                          setFormActualite({
                            ...formActualite,
                            titre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.actualites.form.image')}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setImageFile(e.target.files?.[0] || null)
                        }
                        className="file-input"
                      />
                      {imageFile && (
                        <p className="file-name">{t('adminPortail.actualites.form.imageName')} {imageFile.name}</p>
                      )}
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.actualites.form.contenuRequired')}</label>
                      <textarea
                        rows={8}
                        value={formActualite.contenu}
                        onChange={(e) =>
                          setFormActualite({
                            ...formActualite,
                            contenu: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>{t('adminPortail.actualites.form.datePublication')}</label>
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
                        locale={i18n.language}
                        placeholderText={t('adminPortail.actualites.form.datePlaceholder')}
                        isClearable
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.actualites.form.statutRequired')}</label>
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
                        <option value="BROUILLON">{t('adminPortail.actualites.form.statusBrouillon')}</option>
                        <option value="PUBLIE">{t('adminPortail.actualites.form.statusPublie')}</option>
                        <option value="ARCHIVE">{t('adminPortail.actualites.form.statusArchive')}</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>{t('adminPortail.documents.form.titreRequired')}</label>
                      <input
                        type="text"
                        value={formDocument.titre}
                        onChange={(e) =>
                          setFormDocument({
                            ...formDocument,
                            titre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.documents.form.descriptionRequired')}</label>
                      <textarea
                        rows={4}
                        value={formDocument.description}
                        onChange={(e) =>
                          setFormDocument({
                            ...formDocument,
                            description: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t('adminPortail.documents.form.typeRequired')}</label>
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
                          <option value="">{t('adminPortail.documents.form.typeSelect')}</option>
                          {typeDocs.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.documents.form.fichierRequired')}</label>
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
                          {t('adminPortail.documents.form.fileName')} {documentFile.name} (
                          {(documentFile.size / (1024 * 1024)).toFixed(2)} {t('adminPortail.documents.form.fileSizeMB')})
                        </p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>{t('adminPortail.documents.form.datePublication')}</label>
                      <DatePicker
                        selected={formDocument.datePublication}
                        onChange={(d) =>
                          setFormDocument({
                            ...formDocument,
                            datePublication: d,
                          })
                        }
                        dateFormat="dd/MM/yyyy"
                        locale={i18n.language}
                        placeholderText={t('adminPortail.documents.form.datePlaceholder')}
                        isClearable
                      />
                    </div>

                    <div className="form-group">
                      <label>{t('adminPortail.documents.form.statutRequired')}</label>
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
                        <option value="BROUILLON">{t('adminPortail.actualites.form.statusBrouillon')}</option>
                        <option value="PUBLIE">{t('adminPortail.actualites.form.statusPublie')}</option>
                        <option value="ARCHIVE">{t('adminPortail.actualites.form.statusArchive')}</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    {t('adminPortail.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={uploading}
                  >
                    <Save size={20} />
                    {uploading
                      ? t('adminPortail.actions.saving')
                      : editMode
                      ? t('adminPortail.actions.edit')
                      : t('adminPortail.actions.add')}
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
