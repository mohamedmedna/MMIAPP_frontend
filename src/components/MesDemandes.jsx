import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BanniereMinistereCoupee from "../components/BanniereMinistereCoupee";
import "../Styles/MesDemandes.css";
import { useTranslation } from "react-i18next";

function BarreProgression({ statut }) {
  const { t } = useTranslation();
  const ETAPES = [
    t("mesDemandes.etapes.depot"),
    t("mesDemandes.etapes.validation"),
    t("mesDemandes.etapes.notification"),
    t("mesDemandes.etapes.telechargement"),
  ];
  // Trouver l'étape atteinte
  const indexActuel = ETAPES.findIndex((e) => e === statut);
  return (
    <div className="barre-progression">
      {ETAPES.map((etape, idx) => (
        <div
          key={etape}
          className={`etape ${idx <= indexActuel ? "active" : ""}`}
        >
          <div className="cercle">{idx + 1}</div>
          <div className="label">{etape}</div>
          {idx < ETAPES.length - 1 && <div className="trait" />}
        </div>
      ))}
    </div>
  );
}

export default function MesDemandes({ user }) {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetch(`${API_BASE}/api/mes-demandes?user_id=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setDemandes(data);
        setChargement(false);
      })
      .catch(() => setChargement(false));
  }, [user, navigate]);

  if (chargement) return <div>{t("mesDemandes.loading")}</div>;
  if (!user) return null;

  return (
    <>
      <Header />
      <div className="mes-demandes-container">
        <h2>{t("mesDemandes.title")}</h2>
        {demandes.length === 0 ? (
          <div className="no-demandes">{t("mesDemandes.noDemandes")}</div>
        ) : (
          <table className="table-demandes">
            <thead>
              <tr>
                <th>{t("mesDemandes.reference")}</th>
                <th>{t("mesDemandes.dateDepot")}</th>
                <th>{t("mesDemandes.type")}</th>
                <th>{t("mesDemandes.statut")}</th>
                <th>{t("mesDemandes.progression")}</th>
                <th>{t("mesDemandes.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id}>
                  <td>{demande.reference}</td>
                  <td>
                    {new Date(
                      demande.dateDepot || demande.created_at
                    ).toLocaleDateString()}
                  </td>
                  <td>{demande.type}</td>
                  <td>
                    <span
                      className={`statut-badge statut-${demande.statut
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                    >
                      {t(`mesDemandes.status.${demande.statut}`) ||
                        demande.statut}
                    </span>
                  </td>
                  <td>
                    <BarreProgression
                      statut={
                        t(`mesDemandes.status.${demande.statut}`) ||
                        demande.statut
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="btn-consulter"
                      onClick={() =>
                        alert(
                          `${t("mesDemandes.details")} ${demande.reference}`
                        )
                      }
                    >
                      {t("mesDemandes.consulter")}
                    </button>
                    {demande.statut ===
                      t("mesDemandes.etapes.telechargement") &&
                      demande.lienAutorisation && (
                        <a href={demande.lienAutorisation} download>
                          <button className="btn-telecharger">
                            {t("mesDemandes.download")}
                          </button>
                        </a>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Footer />
    </>
  );
}
