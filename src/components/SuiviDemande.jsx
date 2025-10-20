import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function SuiviDemande({ demandeId }) {
  const { t } = useTranslation();
  const [suivi, setSuivi] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    fetch(`${API_BASE}/api/suivi?demande_id=${demandeId}`)
      .then((res) => res.json())
      .then((data) => {
        setSuivi(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [demandeId]);

  return (
    <div className="suivi-demande-container">
      <h3>{t("suiviDemande.title")}</h3>
      {loading ? (
        <div>{t("suiviDemande.loading")}</div>
      ) : suivi.length === 0 ? (
        <div>{t("suiviDemande.none")}</div>
      ) : (
        <ul className="suivi-list">
          {suivi.map((item, idx) => (
            <li key={idx} className="suivi-item">
              <div>
                <b style={{ color: "#1e6a8e" }}>{item.statut}</b>{" "}
                {t("suiviDemande.by")}{" "}
                <span style={{ color: "#7fa22b" }}>
                  {item.agent_nom || t("suiviDemande.system")}
                </span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "#888" }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              {item.message && (
                <div style={{ fontStyle: "italic", color: "#555" }}>
                  {item.message}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SuiviDemande;
