import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, Alert, message } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Styles/RenouvellementForm.css";

const baseUrl = window.__APP_CONFIG__.API_BASE;

const defaultDynamic = () => ({
  emplois: {
    nombre_crees: "",
    nationalites: "",
    administratifs: "",
    techniciens: "",
    ouvriers: "",
  },
  economie: {
    description_unite: "",
    capital_social: "",
    financement: {
      fonds_propres: false,
      mru: false,
      emprunt: false,
      autre: "",
    },
    origine_investissement: {
      national: false,
      international: false,
    },
    nature_investissement: {
      nouvelle_creation: false,
      extension: false,
      modernisation: false,
    },
    donnees_financieres: {
      annees: [],
      commentaires: "",
    },
    matieres_premieres: "",
    capacite_production: {
      production_estimee: "",
      production_effective: "",
      stock: "",
      varietes: [],
      capacite_estimee: "",
      capacite_augmentation: "",
    },
  },
  defis: {
    principaux: [],
  },
});

const mergeDynamic = (template = {}) => {
  const base = defaultDynamic();
  const emplois = template.emplois || {};
  const economie = template.economie || {};
  const financement = economie.financement || {};
  const origine = economie.origine_investissement || {};
  const nature = economie.nature_investissement || {};
  const capacite = economie.capacite_production || {};
  const donneesFin = economie.donnees_financieres || {};
  const defis = template.defis || {};

  return {
    emplois: {
      ...base.emplois,
      ...emplois,
    },
    economie: {
      ...base.economie,
      ...economie,
      financement: {
        ...base.economie.financement,
        ...financement,
      },
      origine_investissement: {
        ...base.economie.origine_investissement,
        ...origine,
      },
      nature_investissement: {
        ...base.economie.nature_investissement,
        ...nature,
      },
      donnees_financieres: {
        ...base.economie.donnees_financieres,
        ...donneesFin,
        annees: Array.isArray(donneesFin.annees)
          ? donneesFin.annees
          : base.economie.donnees_financieres.annees,
      },
      capacite_production: {
        ...base.economie.capacite_production,
        ...capacite,
        varietes: Array.isArray(capacite.varietes)
          ? capacite.varietes
          : base.economie.capacite_production.varietes,
      },
    },
    defis: {
      ...base.defis,
      ...defis,
      principaux: Array.isArray(defis.principaux)
        ? defis.principaux
        : base.defis.principaux,
    },
  };
};

function RenouvellementUsine({ user }) {
  const navigate = useNavigate();
  const { demandeId } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [stableData, setStableData] = useState(null);
  const [dynamicData, setDynamicData] = useState(defaultDynamic());
  const [financeYears, setFinanceYears] = useState([
    { annee: new Date().getFullYear().toString(), valeur: "" },
  ]);
  const [varietes, setVarietes] = useState(["", "", "", ""]);
  const [defisText, setDefisText] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [signatureFilename, setSignatureFilename] = useState("");
  const [templateMeta, setTemplateMeta] = useState(null);
  const [lastRenouvellement, setLastRenouvellement] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!demandeId) {
      setError("Identifiant de demande manquant.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("Votre session est expirée. Veuillez vous reconnecter.");
      setLoading(false);
      return;
    }

    async function loadTemplate() {
      setLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/api/demandeur/demandes/${demandeId}/renouvellement/template`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Impossible de charger le formulaire.");
        }

        const data = await response.json();
        const payload = data.payload || {};

        setStableData(payload.stable || {});
        const mergedDynamic = mergeDynamic(payload.dynamic || {});
        setDynamicData(mergedDynamic);
        setTemplateMeta(payload.meta || {});

        const annees = Array.isArray(
          mergedDynamic.economie?.donnees_financieres?.annees
        )
          ? mergedDynamic.economie.donnees_financieres.annees
          : [];
        if (annees.length > 0) {
          setFinanceYears(
            annees.map((item) => ({
              annee: item?.annee ? String(item.annee) : "",
              valeur: item?.valeur ? String(item.valeur) : "",
            }))
          );
        } else {
          setFinanceYears([
            { annee: new Date().getFullYear().toString(), valeur: "" },
          ]);
        }

        const varietesList =
          mergedDynamic.economie?.capacite_production?.varietes || [];
        setVarietes([
          varietesList[0] || "",
          varietesList[1] || "",
          varietesList[2] || "",
          varietesList[3] || "",
        ]);

        const defisList = mergedDynamic.defis?.principaux || [];
        setDefisText(defisList.join("\n"));
        setLastRenouvellement(data.lastRenouvellement || null);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadTemplate();
  }, [demandeId, navigate, token, user]);

  const handleNestedChange = (path, value) => {
    setDynamicData((prev) => {
      const clone = JSON.parse(JSON.stringify(prev || defaultDynamic()));
      const segments = path.split(".");
      let cursor = clone;
      for (let i = 0; i < segments.length - 1; i += 1) {
        const key = segments[i];
        if (cursor[key] === undefined || cursor[key] === null) {
          cursor[key] = {};
        }
        cursor = cursor[key];
      }
      cursor[segments[segments.length - 1]] = value;
      return clone;
    });
  };

  const addFinanceYear = () => {
    setFinanceYears((prev) => [
      ...prev,
      { annee: "", valeur: "" },
    ]);
  };

  const updateFinanceYear = (index, key, value) => {
    setFinanceYears((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
  };

  const removeFinanceYear = (index) => {
    setFinanceYears((prev) => {
      if (prev.length === 1) {
        return [{ annee: "", valeur: "" }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleVarieteChange = (index, value) => {
    setVarietes((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSignatureDataUrl(null);
      setSignatureFilename("");
      return;
    }
    if (!/^image\/|application\/pdf$/.test(file.type)) {
      message.error("Veuillez sélectionner une image (PNG/JPG) ou un PDF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSignatureDataUrl(e.target.result);
      setSignatureFilename(file.name);
    };
    reader.onerror = () => {
      message.error("Impossible de lire le fichier sélectionné.");
    };
    reader.readAsDataURL(file);
  };

  const canSubmit = useMemo(() => {
    if (!dynamicData) return false;
    const employ = dynamicData.emplois || {};
    const econ = dynamicData.economie || {};
    const capacite = econ.capacite_production || {};
    return (
      employ.nombre_crees &&
      employ.nationalites &&
      employ.administratifs &&
      employ.techniciens &&
      employ.ouvriers &&
      econ.description_unite &&
      econ.capital_social &&
      econ.matieres_premieres &&
      capacite.production_estimee &&
      capacite.production_effective
    );
  }, [dynamicData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      message.error("Session expirée. Veuillez vous reconnecter.");
      return;
    }
    if (!dynamicData) {
      message.error("Données du formulaire incomplètes.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const annees = financeYears
        .map((item) => ({
          annee: item?.annee ? String(item.annee).trim() : "",
          valeur: item?.valeur ? String(item.valeur).trim() : "",
        }))
        .filter(({ annee, valeur }) => annee && valeur);

      const varietesNonVides = varietes
        .map((v) => v.trim())
        .filter((v) => v !== "");

      const defisPrincipaux = defisText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const dynamicPayload = {
        ...dynamicData,
        economie: {
          ...dynamicData.economie,
          donnees_financieres: {
            ...dynamicData.economie.donnees_financieres,
            annees,
          },
          capacite_production: {
            ...dynamicData.economie.capacite_production,
            varietes: varietesNonVides,
          },
        },
        defis: {
          principaux: defisPrincipaux,
        },
      };

      const response = await fetch(
        `${baseUrl}/api/demandeur/demandes/${demandeId}/renouvellement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stable: stableData,
            dynamic: dynamicPayload,
            signatureDataUrl: signatureDataUrl || null,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer le renouvellement.");
      }

      message.success("Renouvellement soumis avec succès.");
      setLastRenouvellement(data.renouvellement || null);
      setTemplateMeta((prev) => ({
        ...(prev || {}),
        stableReadOnly: true,
      }));
    } catch (err) {
      console.error(err);
      setError(err.message);
      message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="renewal-page-wrapper">
        <div className="renewal-container">
          <div className="renewal-card">
            <div className="renewal-header">
              <h1>Formulaire de Renouvellement d'Enregistrement d'Entreprise Industrielle</h1>
              <p>République Islamique de Mauritanie – Ministère des Mines et de l'Industrie – Direction Générale de l'Industrie / DDPI</p>
            </div>

            {error && (
              <Alert
                type="error"
                showIcon
                message="Erreur"
                description={error}
                style={{ marginBottom: 16 }}
              />
            )}

            {templateMeta?.hasPending && (
              <div className="renewal-statusBox">
                Un renouvellement a déjà été soumis et reste en cours d'instruction. Toute nouvelle soumission mettra à jour le dossier existant.
                {lastRenouvellement && (
                  <div className="renewal-last-info">
                    Statut actuel : <strong>{lastRenouvellement.statut}</strong> — Dernière mise à jour le{" "}
                    {lastRenouvellement.date_soumission
                      ? new Date(lastRenouvellement.date_soumission).toLocaleString("fr-FR")
                      : "N/A"}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" tip="Chargement du formulaire...">
                  <div style={{ minHeight: 120 }} />
                </Spin>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="renewal-pages">
                  <div className="renewal-page">
                    <h2>Page 1 / 2</h2>

                    <div className="section">
                      <div className="section-title">I. Identification de l'entreprise</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Numéro d'enregistrement de l'usine</label>
                          <input
                            className="renewal-input readonly"
                            value={
                              stableData?.identification?.numero_enregistrement_usine || ""
                            }
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de création</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_creation || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de début de production</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_debut_production || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de démarrage de l'unité</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_demarrage_unite || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre d'arrêts</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.nombre_arrets || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">II. Adresse et contact de l'entreprise</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Localisation du siège</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.localisation || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Coordonnées GPS</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.coordonnees_gps || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">B.P</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.bp || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Téléphone</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.telephone || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">E-mail</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.email || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Site web</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.site_web || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Moyen de contact favorisé</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.contact?.moyen_contact || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">III. Informations du gestionnaire</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Nom du premier responsable</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.responsable?.nom || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">NNI & N° Passeport</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.responsable?.nni_passeport || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nationalité</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.responsable?.nationalite || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Téléphone</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.responsable?.telephone || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">IV. Environnement juridique</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Forme juridique</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.forme_juridique || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Statut</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.statut || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Registre du commerce (N°)</label>
                          <input
                            className="renewal-input readonly"
                            value={
                              stableData?.statut_legal?.registre_commerce?.numero || ""
                            }
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Registre du commerce (date)</label>
                          <input
                            className="renewal-input readonly"
                            value={
                              stableData?.statut_legal?.registre_commerce?.date || ""
                            }
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">N.I.F</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.nif?.numero || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">N.I.F (date)</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.nif?.date || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">CNSS</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.cnss?.numero || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">CNSS (date)</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.statut_legal?.cnss?.date || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">V. Environnement administratif</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Numéro d'enregistrement de l'unité</label>
                          <input
                            className="renewal-input readonly"
                            value={
                              stableData?.identification?.numero_enregistrement_usine || ""
                            }
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de la création</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_creation || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de début de production</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_debut_production || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Date de démarrage</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.date_demarrage_unite || ""}
                            readOnly
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre d'arrêts</label>
                          <input
                            className="renewal-input readonly"
                            value={stableData?.identification?.nombre_arrets || ""}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="renewal-page">
                    <h2>Page 2 / 2</h2>

                    <div className="section">
                      <div className="section-title">VI. Données d'emploi</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre d'emplois créés</label>
                          <input
                            className="renewal-input"
                            type="number"
                            min="0"
                            value={dynamicData.emplois?.nombre_crees || ""}
                            onChange={(e) =>
                              handleNestedChange("emplois.nombre_crees", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre d'employés administratifs</label>
                          <input
                            className="renewal-input"
                            type="number"
                            min="0"
                            value={dynamicData.emplois?.administratifs || ""}
                            onChange={(e) =>
                              handleNestedChange("emplois.administratifs", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre de techniciens</label>
                          <input
                            className="renewal-input"
                            type="number"
                            min="0"
                            value={dynamicData.emplois?.techniciens || ""}
                            onChange={(e) =>
                              handleNestedChange("emplois.techniciens", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Nombre d'ouvriers</label>
                          <input
                            className="renewal-input"
                            type="number"
                            min="0"
                            value={dynamicData.emplois?.ouvriers || ""}
                            onChange={(e) =>
                              handleNestedChange("emplois.ouvriers", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div className="renewal-field renewal-grid full">
                          <label className="renewal-label">Nationalités des employés</label>
                          <textarea
                            className="renewal-textarea"
                            value={dynamicData.emplois?.nationalites || ""}
                            onChange={(e) =>
                              handleNestedChange("emplois.nationalites", e.target.value)
                            }
                            placeholder="Détaillez les nationalités et répartitions..."
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">VI. Environnement économique</div>
                      <div className="renewal-field">
                        <label className="renewal-label">Description de l'unité de production</label>
                        <textarea
                          className="renewal-textarea"
                          value={dynamicData.economie?.description_unite || ""}
                          onChange={(e) =>
                            handleNestedChange("economie.description_unite", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Capital social (MRU)</label>
                          <input
                            className="renewal-input"
                            value={dynamicData.economie?.capital_social || ""}
                            onChange={(e) =>
                              handleNestedChange("economie.capital_social", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="renewal-subtitle">Financement</div>
                      <div className="renewal-checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.financement?.fonds_propres}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.financement.fonds_propres",
                                e.target.checked
                              )
                            }
                          />
                          Fonds propres
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.financement?.mru}
                            onChange={(e) =>
                              handleNestedChange("economie.financement.mru", e.target.checked)
                            }
                          />
                          MRU
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.financement?.emprunt}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.financement.emprunt",
                                e.target.checked
                              )
                            }
                          />
                          Emprunt
                        </label>
                        <label>
                          Autre :
                          <input
                            className="renewal-input"
                            style={{ width: "180px" }}
                            value={dynamicData.economie?.financement?.autre || ""}
                            onChange={(e) =>
                              handleNestedChange("economie.financement.autre", e.target.value)
                            }
                            placeholder="Précisez"
                          />
                        </label>
                      </div>

                      <div className="renewal-subtitle">Origine de l'investissement</div>
                      <div className="renewal-checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.origine_investissement?.national}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.origine_investissement.national",
                                e.target.checked
                              )
                            }
                          />
                          National
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={
                              !!dynamicData.economie?.origine_investissement?.international
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.origine_investissement.international",
                                e.target.checked
                              )
                            }
                          />
                          International
                        </label>
                      </div>

                      <div className="renewal-subtitle">Nature de l'investissement</div>
                      <div className="renewal-checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.nature_investissement?.nouvelle_creation}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.nature_investissement.nouvelle_creation",
                                e.target.checked
                              )
                            }
                          />
                          Nouvelle création
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.nature_investissement?.extension}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.nature_investissement.extension",
                                e.target.checked
                              )
                            }
                          />
                          Extension
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!dynamicData.economie?.nature_investissement?.modernisation}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.nature_investissement.modernisation",
                                e.target.checked
                              )
                            }
                          />
                          Modernisation
                        </label>
                      </div>

                      <div className="renewal-subtitle">Données états financiers</div>
                      {financeYears.map((item, index) => (
                        <div className="renewal-flex" key={`finance-year-${index}`}>
                          <div className="renewal-field">
                            <label className="renewal-label">Année</label>
                            <input
                              className="renewal-input"
                              value={item.annee}
                              onChange={(e) =>
                                updateFinanceYear(index, "annee", e.target.value)
                              }
                              placeholder="Ex : 2025"
                            />
                          </div>
                          <div className="renewal-field">
                            <label className="renewal-label">Montant / Production</label>
                            <input
                              className="renewal-input"
                              value={item.valeur}
                              onChange={(e) =>
                                updateFinanceYear(index, "valeur", e.target.value)
                              }
                              placeholder="Ex : 12 000 Tonnes ou 45 M MRU"
                            />
                          </div>
                          <button
                            type="button"
                            className="renewal-btn secondary"
                            onClick={() => removeFinanceYear(index)}
                          >
                            Retirer
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="renewal-btn secondary"
                        onClick={addFinanceYear}
                        style={{ marginTop: 10 }}
                      >
                        Ajouter une année
                      </button>

                      <div className="renewal-field">
                        <label className="renewal-label">Commentaires financiers</label>
                        <textarea
                          className="renewal-textarea"
                          value={
                            dynamicData.economie?.donnees_financieres?.commentaires || ""
                          }
                          onChange={(e) =>
                            handleNestedChange(
                              "economie.donnees_financieres.commentaires",
                              e.target.value
                            )
                          }
                          placeholder="Observations sur les exercices 2023 et 2024..."
                        />
                      </div>

                      <div className="renewal-field">
                        <label className="renewal-label">Matières premières</label>
                        <textarea
                          className="renewal-textarea"
                          value={dynamicData.economie?.matieres_premieres || ""}
                          onChange={(e) =>
                            handleNestedChange("economie.matieres_premieres", e.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="renewal-subtitle">Capacité de production</div>
                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Production estimée (Tonnes/jour)</label>
                          <input
                            className="renewal-input"
                            value={
                              dynamicData.economie?.capacite_production?.production_estimee || ""
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.capacite_production.production_estimee",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Production effective (Tonnes/jour)</label>
                          <input
                            className="renewal-input"
                            value={
                              dynamicData.economie?.capacite_production?.production_effective || ""
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.capacite_production.production_effective",
                                e.target.value
                              )
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="renewal-grid">
                        <div className="renewal-field">
                          <label className="renewal-label">Stock</label>
                          <input
                            className="renewal-input"
                            value={dynamicData.economie?.capacite_production?.stock || ""}
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.capacite_production.stock",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Capacité de production estimée</label>
                          <input
                            className="renewal-input"
                            value={
                              dynamicData.economie?.capacite_production?.capacite_estimee || ""
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.capacite_production.capacite_estimee",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="renewal-field">
                          <label className="renewal-label">Capacité d'augmentation</label>
                          <input
                            className="renewal-input"
                            value={
                              dynamicData.economie?.capacite_production?.capacite_augmentation || ""
                            }
                            onChange={(e) =>
                              handleNestedChange(
                                "economie.capacite_production.capacite_augmentation",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="renewal-subtitle">Variétés de production</div>
                      <div className="renewal-grid">
                        {varietes.map((val, idx) => (
                          <div className="renewal-field" key={`variete-${idx}`}>
                            <label className="renewal-label">Varieté {idx + 1}</label>
                            <input
                              className="renewal-input"
                              value={val}
                              onChange={(e) => handleVarieteChange(idx, e.target.value)}
                              placeholder="Précisez la variété..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">VII. Défis et difficultés</div>
                      <div className="renewal-field">
                        <label className="renewal-label">Principales difficultés rencontrées</label>
                        <textarea
                          className="renewal-textarea"
                          value={defisText}
                          onChange={(e) => setDefisText(e.target.value)}
                          placeholder="Listez chaque difficulté sur une ligne distincte..."
                          required
                        />
                        <div className="renewal-note">
                          Exemple : accès au financement, coût de l'énergie, disponibilité de la main d'œuvre qualifiée, réglementation...
                        </div>
                      </div>
                    </div>

                    <div className="section">
                      <div className="section-title">Signature du demandeur</div>
                      <div className="signature-upload">
                        <div>
                          Importez la signature du demandeur (image ou PDF). Taille max recommandée : 5 Mo.
                        </div>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,application/pdf"
                          onChange={handleSignatureUpload}
                        />
                        {signatureFilename && (
                          <div className="renewal-note">Fichier sélectionné : {signatureFilename}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="renewal-actions">
                  <button
                    type="button"
                    className="renewal-btn secondary"
                    onClick={() => navigate(-1)}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    className="renewal-btn primary"
                    disabled={submitting || !canSubmit}
                  >
                    {submitting ? "Enregistrement..." : "Soumettre le renouvellement"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default RenouvellementUsine;

