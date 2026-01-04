import React, { useState, useEffect, useMemo } from "react";
import { MapPin, BarChart3, CheckCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_BASE = window.__APP_CONFIG__?.API_BASE;

function MapComponent() {
  const [allLocations, setAllLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const [L, setL] = useState(null);
  const { t } = useTranslation();

  const typeBaseColors = {
    usine: "#10B981", // green
    boulangerie: "#F59E0B", // orange
  };

  const AUTHORIZED_COLOR = "#10B981";

  const normalizeType = (rawType) => {
    const t = String(rawType || "")
      .toLowerCase()
      .trim();
    if (
      t === "eaux_minérales" ||
      t === "eaux minerales" ||
      t === "eaux_minerales"
    )
      return "usine";
    if (t === "usine") return "usine";
    if (t === "boulangerie") return "boulangerie";
    return "usine";
  };

  const isAuthorized = (statut) =>
    statut === "AUTORISATION_SIGNEE" || statut === "CLOTUREE";

  const ICON_EMOJI = { usine: "🏭", boulangerie: "🥖" };

  const createCustomIcon = (type) => {
    if (!L) return null;
    const color = typeBaseColors[type] || "#667eea";
    const glyph = ICON_EMOJI[type] || "🏭";
    const svg = `
      <svg width="44" height="60" viewBox="0 0 44 60" xmlns="http://www.w3.org/2000/svg" aria-label="${type}">
        <defs>
          <filter id="d" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity="0.35"/>
          </filter>
        </defs>
        <g filter="url(#d)">
          <path d="M22 2C12 2 4 10 4 20c0 14 18 30 18 30s18-16 18-30C40 10 32 2 22 2z"
                fill="${color}" stroke="#111" stroke-width="2"/>
          <circle cx="22" cy="20" r="11.5" fill="white" stroke="rgba(0,0,0,.08)" stroke-width="1"/>
        </g>
        <text x="22" y="24" text-anchor="middle" dominant-baseline="middle"
              font-size="18" style="font-family: sans-serif;">${glyph}</text>
      </svg>
    `;
    return L.divIcon({
      html: svg,
      className: "custom-marker-icon",
      iconSize: [44, 60],
      iconAnchor: [22, 58],
      popupAnchor: [0, -50],
    });
  };

  // --- Helpers ---
  const clean = (v) => (v === null || v === undefined ? "" : String(v).trim());
  const coalesce = (...vals) => vals.find((v) => clean(v) !== "") ?? "";
  const safeNameFrom = (raw) => {
    const best = coalesce(
      raw?.nom,
      raw?.demandeNom,
      raw?.demande?.nom,
      raw?.nom_demande,
      raw?.name
    );
    if (best) return best;
    const type = normalizeType(raw?.type);
    const ref = clean(raw?.reference);
    return ref ? `${type.toUpperCase()} - ${ref}` : type.toUpperCase();
  };

  // ONLY authorized + with GPS for map
  const mapLocations = useMemo(
    () => allLocations.filter((loc) => loc.latitude && loc.longitude),
    [allLocations]
  );

  // Stats: authorized only
  const statistics = useMemo(() => {
    const stats = {
      acceptedTotal: allLocations.length,
      acceptedByType: { usine: 0, boulangerie: 0 },
    };
    for (const l of allLocations) {
      const t = normalizeType(l.type);
      stats.acceptedByType[t] = (stats.acceptedByType[t] || 0) + 1;
    }
    return stats;
  }, [allLocations]);

  // Types that actually have data (to avoid blanks)
  const typesWithData = useMemo(() => {
    return ["usine", "boulangerie"].filter(
      (t) => (statistics.acceptedByType[t] || 0) > 0
    );
  }, [statistics]);

  // Load Leaflet
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setL(window.L);
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Fetch (authorized only)
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/localisations`);
        if (!response.ok)
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        const data = await response.json();

        const formattedAll = data.map((item) => {
          const type = normalizeType(item.type);
          const nom = safeNameFrom(item);
          return {
            id: item.id,
            nom,
            description: clean(item.description) || `Type: ${type}`,
            latitude: item.latitude ? parseFloat(item.latitude) : null,
            longitude: item.longitude ? parseFloat(item.longitude) : null,
            type,
            reference: clean(item.reference),
            statut: item.statut,
            telephone: clean(item.telephone),
            email: clean(item.email),
            adresse: clean(item.adresse),
          };
        });

        const authorizedOnly = formattedAll.filter((l) =>
          isAuthorized(l.statut)
        );
        setAllLocations(authorizedOnly);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Init / update map
  useEffect(() => {
    if (!mapRef.current || mapLocations.length === 0 || !L) return;

    // cleanup old instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {}
      mapInstanceRef.current = null;
    }
    mapRef.current.innerHTML = "";
    mapRef.current._leaflet_id = null;

    try {
      const map = L.map(mapRef.current, {
        center: [21.0835, -10.9692],
        zoom: 6,
        scrollWheelZoom: false,
        doubleClickZoom: true,
        touchZoom: false,
        dragging: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapLocations.forEach((loc) => {
        const icon = createCustomIcon(loc.type);
        const popupContent = `
          <div style="padding:12px;min-width:250px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <h3 style="margin:0 0 10px;color:${
              typeBaseColors[loc.type] || "#667eea"
            };
                      
                       padding-bottom:6px;">
              📍 ${clean(loc.nom) || t("map.loc")}
            </h3>

           

            <div style="margin-bottom:6px;">
              <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Statut</strong>
              <p style="margin:3px 0 0;color:${AUTHORIZED_COLOR};">AUTORISÉE</p>
            </div>

            <div style="margin-bottom:6px;">
              <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Coordonnées GPS</strong>
              <p style="margin:3px 0 0;color:#333;">${loc.latitude}, ${
          loc.longitude
        }</p>
            </div>

          

            ${
              clean(loc.telephone)
                ? `<div style="margin-bottom:6px;">
                     <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Téléphone</strong>
                     <p style="margin:3px 0 0;">
                       <a href="tel:${loc.telephone}" style="color:#667eea;text-decoration:none;">${loc.telephone}</a>
                     </p>
                   </div>`
                : ""
            }

            ${
              clean(loc.email)
                ? `<div style="margin-bottom:6px;">
                     <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Email</strong>
                     <p style="margin:3px 0 0;">
                       <a href="mailto:${loc.email}" style="color:#667eea;text-decoration:none;">${loc.email}</a>
                     </p>
                   </div>`
                : ""
            }

            ${
              clean(loc.adresse)
                ? `<div style="margin-bottom:0;">
                     <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Adresse</strong>
                     <p style="margin:3px 0 0;color:#333;">${loc.adresse}</p>
                   </div>`
                : ""
            }
          </div>
        `;
        L.marker([+loc.latitude, +loc.longitude], icon ? { icon } : {})
          .bindPopup(popupContent, { maxWidth: 350, className: "custom-popup" })
          .addTo(map);
      });

      // Fit bounds to visible markers
      if (mapLocations.length > 0) {
        const bounds = L.latLngBounds(
          mapLocations.map((l) => [l.latitude, l.longitude])
        );
        try {
          map.fitBounds(bounds, { padding: [30, 30] });
        } catch {}
      }

      mapInstanceRef.current = map;
    } catch {}

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, [mapLocations, L, t]);

  return (
    <div className="map-container-wrapper">
      <style>{`
        .map-container-wrapper { width:100%; max-width:1600px; margin:0 auto; padding:20px; }
        .map-display-area { width:100%; height:560px; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.1); position:relative; background:white; }
        .map-stats-layout {
  display: grid;
  grid-template-columns: 1fr max-content; /* <- fit to content */
  gap: 12px;
  width: 100%;
  align-items: start;
}

.stats-panel {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0,0,0,.08);
  padding: 8px 10px;
  display: inline-flex;        
  flex-direction: column;
  gap: 8px;
  width: max-content;         
  max-width: 100%;
  justify-self: start;         
  align-self: start;           
}

@media (max-width: 1200px) {
  .map-stats-layout { grid-template-columns: 1fr; }
  .stats-panel { width: 100%; justify-self: stretch; }
}

@media (max-width: 768px) {
  .map-container-wrapper { padding: 12px; padding-bottom: 60px; }
  .map-display-area { height: 350px; }
  .stats-panel { margin-bottom: 20px; }
}

@media (max-width: 480px) {
  .map-container-wrapper { padding: 8px; padding-bottom: 80px; }
  .map-display-area { height: 280px; border-radius: 8px; }
  .stats-panel { padding: 6px 8px; margin-bottom: 16px; }
  .stats-header h2 { font-size: 1rem; }
  .metric-chip { padding: 8px 10px; }
  .metric-chip .label { font-size: 0.85rem; }
  .metric-chip .value { font-size: 1rem; }
  .locations-counter { padding: 6px 10px; font-size: 0.8rem; bottom: 10px; left: 10px; }
}

/* Leaflet popup responsive styles */
.custom-popup .leaflet-popup-content-wrapper {
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}
.custom-popup .leaflet-popup-content {
  margin: 8px 10px;
  font-size: 14px;
}
.custom-popup .leaflet-popup-tip {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .custom-popup .leaflet-popup-content-wrapper {
    max-width: 260px !important;
  }
  .custom-popup .leaflet-popup-content {
    margin: 6px 8px;
    font-size: 13px;
  }
  .custom-popup .leaflet-popup-content h3 {
    font-size: 14px !important;
  }
  .custom-popup .leaflet-popup-content p {
    font-size: 12px !important;
  }
  .custom-popup .leaflet-popup-content strong {
    font-size: 10px !important;
  }
}

@media (max-width: 480px) {
  .custom-popup .leaflet-popup-content-wrapper {
    max-width: 220px !important;
  }
  .custom-popup .leaflet-popup-content {
    margin: 4px 6px;
    font-size: 12px;
  }
  .custom-popup .leaflet-popup-content > div {
    padding: 6px !important;
    min-width: 180px !important;
  }
  .custom-popup .leaflet-popup-content h3 {
    font-size: 13px !important;
    margin-bottom: 6px !important;
  }
  .custom-popup .leaflet-popup-content p {
    font-size: 11px !important;
    margin: 2px 0 0 !important;
  }
  .custom-popup .leaflet-popup-content strong {
    font-size: 9px !important;
  }
  .custom-popup .leaflet-popup-content a {
    font-size: 11px !important;
  }
}

        .stats-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:2px solid #e5e7eb; }
        .stats-header h2 { margin:0; font-size:1.1rem; color:#333; font-weight:800; }

        #map { width:100%; height:100%; }
        .custom-marker-icon { background:none; border:none; }

        .loading-state, .error-state {
          width:100%; height:560px; display:flex; flex-direction:column; align-items:center; justify-content:center;
          background:linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%); border-radius:12px;
        }
        .spinner { border:4px solid #f3f3f3; border-top:4px solid #667eea; border-radius:50%; width:46px; height:46px; animation:spin 1s linear infinite; margin-bottom:12px; }
        @keyframes spin { 0%{ transform:rotate(0); } 100%{ transform:rotate(360deg); } }
        .loading-text { color:#667eea; font-size:1rem; font-weight:600; }
        .error-text { color:#d32f2f; font-size:1rem; font-weight:600; }
        .locations-counter {
          position:absolute; bottom:14px; left:14px; background:white; padding:8px 12px; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,.2);
          z-index:999; font-weight:700; color:#333; display:flex; align-items:center; gap:8px; font-size:.9rem;
        }

        /* Metrics */
        .metrics-grid {
          display:grid;
          grid-template-columns: 1fr;
          gap:10px;
          margin-bottom: ${
            /* collapses automatically if the next block is hidden */ ""
          } 0;
        }
        .metric-chip {
          background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:10px 12px;
          display:flex; align-items:center; justify-content:space-between; gap:10px;
        }
        .metric-chip .label { color:#065f46; font-weight:800; font-size:.95rem; display:flex; align-items:center; gap:6px; }
        .metric-chip .value { color:#065f46; font-weight:900; font-size:1.2rem; }

        .stats-group-title {
          display:flex; align-items:center; gap:8px;
          font-size:1rem; font-weight:800; color:#374151; margin:10px 0 8px;
        }

        .stat-grid {
          display:grid;
          gap:10px;
          margin-bottom:4px;
        }
        .stat-item {
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:10px 12px; background:#f8f9fa; border:1px solid #edf2f7; border-radius:10px;
        }
        .stat-left { display:flex; align-items:center; gap:10px; }
        .color-dot { width:14px; height:14px; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.15); }
        .count-chip { font-size:1.05rem; font-weight:800; color:#334155; background:#fff; padding:2px 10px; border-radius:999px; box-shadow:0 1px 2px rgba(0,0,0,.08); }

      `}</style>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <div className="loading-text">Chargement de la carte...</div>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-text">❌ {error}</div>
        </div>
      ) : (
        <div className="map-stats-layout">
          {/* MAP */}
          <div className="map-display-area">
            <div id="map" ref={mapRef}></div>
            <div className="locations-counter">
              <MapPin size={16} />
              {mapLocations.length} localisation
              {mapLocations.length > 1 ? "s" : ""} (GPS)
            </div>
          </div>

          {/* STATS — only shows what exists (no blanks) */}
          <div className="stats-panel">
            <div className="stats-header">
              <BarChart3 size={22} color="#667eea" />
              <h2>{t("statistics.title")}</h2>
            </div>

            {/* If no authorized data at all */}
            {statistics.acceptedTotal === 0 ? (
              <div style={{ color: "#6b7280", fontWeight: 700 }}>
                Aucune autorisation à afficher.
              </div>
            ) : (
              <>
                {/* Single top metric: Autorisées */}
                <div
                  className="metrics-grid"
                  style={{ marginBottom: typesWithData.length ? 12 : 0 }}
                >
                  <div className="metric-chip">
                    <span className="label">
                      <CheckCircle size={16} />
                      {t("statistics.authorized")}
                    </span>
                    <span className="value">{statistics.acceptedTotal}</span>
                  </div>
                </div>

                {/* Autorisées par type — render only for types that have data */}
                {typesWithData.length > 0 && (
                  <>
                    <div className="stats-group-title">
                      <FileText size={18} />
                      {t("statistics.authorizedByType")}
                    </div>
                    <div
                      className="stat-grid"
                      style={{
                        gridTemplateColumns:
                          typesWithData.length === 1 ? "1fr" : "1fr 1fr",
                      }}
                    >
                      {typesWithData.map((type) => (
                        <div key={`acc-${type}`} className="stat-item">
                          <div className="stat-left">
                            <div
                              className="color-dot"
                              style={{ background: typeBaseColors[type] }}
                            />
                            <span
                              style={{
                                fontWeight: 700,
                                textTransform: "capitalize",
                                color: "#111827",
                              }}
                            >
                              {t(`statistics.${type}`)}
                            </span>
                          </div>
                          <div className="count-chip">
                            {statistics.acceptedByType[type] || 0}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;
