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

  // --- TYPES & COLORS ---
  const typeBaseColors = {
    usine: "#3B82F6",
    boulangerie: "#F59E0B",
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
    ) {
      return "usine";
    }
    if (t === "usine") return "usine";
    if (t === "boulangerie") return "boulangerie";
    return "usine";
  };

  const isAuthorized = (statut) =>
    statut === "AUTORISATION_SIGNEE" || statut === "CLOTUREE";

  const ICON_EMOJI = { usine: "🏭", boulangerie: "🥖" };

  const createCustomIcon = (type, authorized) => {
    if (!L) return null;
    const color = authorized
      ? AUTHORIZED_COLOR
      : typeBaseColors[type] || "#667eea";
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

  // --- Helpers for clean strings / names ---
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

  // Map data (only those with GPS)
  const mapLocations = useMemo(
    () => allLocations.filter((loc) => loc.latitude && loc.longitude),
    [allLocations]
  );

  // Statistics (compact)
  const statistics = useMemo(() => {
    const stats = {
      total: allLocations.length,
      byType: { usine: 0, boulangerie: 0 },
      acceptedTotal: 0,
      acceptedByType: { usine: 0, boulangerie: 0 },
    };
    allLocations.forEach((l) => {
      const t = normalizeType(l.type);
      stats.byType[t] = (stats.byType[t] || 0) + 1;
      if (isAuthorized(l.statut)) {
        stats.acceptedTotal += 1;
        stats.acceptedByType[t] = (stats.acceptedByType[t] || 0) + 1;
      }
    });
    return stats;
  }, [allLocations]);

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

  // Fetch data
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/localisations`);
        if (!response.ok)
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        const data = await response.json();

        const formatted = data.map((item) => {
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

        setAllLocations(formatted);
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
        const authorized = isAuthorized(loc.statut);
        const icon = createCustomIcon(loc.type, authorized);

        const popupContent = `
          <div style="padding:12px;min-width:250px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
            <h3 style="margin:0 0 10px;color:${
              authorized
                ? AUTHORIZED_COLOR
                : typeBaseColors[loc.type] || "#667eea"
            };font-size:1.05rem;border-bottom:2px solid ${
          authorized ? AUTHORIZED_COLOR : typeBaseColors[loc.type] || "#667eea"
        };padding-bottom:6px;">
              📍 ${clean(loc.nom) || t("map.loc")}
            </h3>

            <div style="margin-bottom:6px;">
              <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Type</strong>
              <p style="margin:3px 0 0;color:#333;">${loc.type}</p>
            </div>

            ${
              loc.statut
                ? `<div style="margin-bottom:6px;">
                     <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Statut</strong>
                     <p style="margin:3px 0 0;color:${
                       authorized ? AUTHORIZED_COLOR : "#333"
                     };">${loc.statut}</p>
                   </div>`
                : ""
            }

            <div style="margin-bottom:6px;">
              <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Coordonnées GPS</strong>
              <p style="margin:3px 0 0;color:#333;">${loc.latitude}, ${
          loc.longitude
        }</p>
            </div>

            ${
              clean(loc.description)
                ? `<div style="margin-bottom:6px;">
                     <strong style="color:#666;font-size:.8rem;text-transform:uppercase;">Description</strong>
                     <p style="margin:3px 0 0;color:#333;">${loc.description}</p>
                   </div>`
                : ""
            }

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
        .map-stats-layout { display:grid; grid-template-columns:1fr 380px; gap:16px; width:100%; }
        .map-display-area { width:100%; height:560px; border-radius:12px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,.1); position:relative; background:white; }
        .stats-panel {
          background:white; border-radius:12px; box-shadow:0 8px 32px rgba(0,0,0,.1);
          padding:16px; height:auto; max-height:none; overflow:visible;
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

        /* ---------- Compact stats chips (no big cards, no scrolling) ---------- */
        .metrics-grid {
          display:grid;
          grid-template-columns: repeat(2, 1fr);
          gap:10px;
          margin-bottom:12px;
        }
        .metric-chip {
          background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px; padding:10px 12px;
          display:flex; align-items:center; justify-content:space-between; gap:10px;
        }
        .metric-chip .label { color:#374151; font-weight:700; font-size:.95rem; }
        .metric-chip .value { color:#111827; font-weight:800; font-size:1.2rem; }

        .stats-group-title {
          display:flex; align-items:center; gap:8px;
          font-size:1rem; font-weight:800; color:#374151; margin:10px 0 8px;
        }

        .stat-grid { display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:10px; }
        .stat-item {
          display:flex; align-items:center; justify-content:space-between; gap:12px;
          padding:10px 12px; background:#f8f9fa; border:1px solid #edf2f7; border-radius:10px;
        }
        .stat-left { display:flex; align-items:center; gap:10px; }
        .color-dot { width:14px; height:14px; border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.15); }
        .count-chip { font-size:1.05rem; font-weight:800; color:#334155; background:#fff; padding:2px 10px; border-radius:999px; box-shadow:0 1px 2px rgba(0,0,0,.08); }

        .accepted { background: linear-gradient(135deg,#10B981 0%,#059669 100%); color: #fff; border: none; }
        .count-chip.accepted-chip { background: rgba(255,255,255,.2); color: #fff; box-shadow: none; }

        /* ---- Legend (inside stats panel) ---- */
        .legend-panel { margin-top: 14px; border-top: 2px solid #e5e7eb; padding-top: 10px; }
        .legend-title { font-weight: 800; font-size: .95rem; color: #374151; margin-bottom: 8px; }
        .legend-row { display: flex; align-items: center; gap: 8px; margin: 6px 0; color: #4b5563; font-weight: 600; }
        .legend-marker { width: 16px; height: 16px; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,.2); }

        /* Responsive stack for narrow screens */
        @media (max-width:1200px) {
          .map-stats-layout { grid-template-columns: 1fr; }
        }
        @media (max-width:768px) {
          .map-display-area { height: 480px; }
          .stat-grid, .metrics-grid { grid-template-columns: 1fr; }
        }
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

          {/* STATS (compact + legend) */}
          <div className="stats-panel">
            <div className="stats-header">
              <BarChart3 size={22} color="#667eea" />
              <h2>Statistiques</h2>
            </div>

            {/* Top compact metrics */}
            <div className="metrics-grid">
              <div className="metric-chip">
                <span className="label">Total</span>
                <span className="value">{statistics.total}</span>
              </div>
              <div
                className="metric-chip"
                style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
              >
                <span className="label" style={{ color: "#065f46" }}>
                  Autorisées
                </span>
                <span className="value" style={{ color: "#065f46" }}>
                  {statistics.acceptedTotal}
                </span>
              </div>
            </div>

            {/* Totaux par type */}
            <div className="stats-group-title">
              <FileText size={18} />
              Total par type
            </div>
            <div className="stat-grid">
              {["usine", "boulangerie"].map((type) => (
                <div key={`total-${type}`} className="stat-item">
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
                      {type}
                    </span>
                  </div>
                  <div className="count-chip">
                    {statistics.byType[type] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Autorisées par type */}
            <div className="stats-group-title">
              <CheckCircle size={18} />
              Autorisées par type
            </div>
            <div className="stat-grid">
              {["usine", "boulangerie"].map((type) => (
                <div key={`acc-${type}`} className="stat-item accepted">
                  <div className="stat-left">
                    <div
                      className="color-dot"
                      style={{ background: "#ffffff" }}
                    />
                    <span
                      style={{ fontWeight: 800, textTransform: "capitalize" }}
                    >
                      {type}
                    </span>
                  </div>
                  <div className="count-chip accepted-chip">
                    {statistics.acceptedByType[type] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="legend-panel">
              <div className="legend-title">Légende</div>
              <div className="legend-row">
                <span
                  className="legend-marker"
                  style={{ background: typeBaseColors.usine }}
                ></span>
                <span>Usine (non autorisée / en cours)</span>
              </div>
              <div className="legend-row">
                <span
                  className="legend-marker"
                  style={{ background: typeBaseColors.boulangerie }}
                ></span>
                <span>Boulangerie (non autorisée / en cours)</span>
              </div>
              <div className="legend-row">
                <span
                  className="legend-marker"
                  style={{ background: AUTHORIZED_COLOR }}
                ></span>
                <span>Autorisée (tous types)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;
