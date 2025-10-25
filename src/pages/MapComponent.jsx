import React, { useState, useEffect, useMemo } from "react";
import { MapPin, X, BarChart3, CheckCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_BASE = window.__APP_CONFIG__?.API_BASE;

function MapComponent() {
  const [allLocations, setAllLocations] = useState([]); // Toutes les demandes pour les stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const [L, setL] = useState(null);
  const { t, i18n } = useTranslation();

  // Définir les couleurs pour chaque type de demande
  const typeColors = {
    usine: '#3B82F6',      // Bleu
    boulangerie: '#F59E0B', // Orange
    eaux: '#06B6D4',       // Cyan
    pnme: '#8B5CF6',       // Violet
    extension: '#10B981'   // Vert
  };

  // Fonction pour obtenir la couleur selon le type
  const getColorByType = (type) => {
    return typeColors[type?.toLowerCase()] || '#667eea'; // Couleur par défaut si type inconnu
  };

  // Fonction pour créer une icône personnalisée avec couleur
  const createCustomIcon = (color) => {
    if (!L) return null;
    
    const svgIcon = `
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z" 
              fill="${color}" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="6" fill="white"/>
      </svg>
    `;
    
    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42]
    });
  };

  // Filtrer les demandes pour la carte (avec GPS + autorisées)
  const mapLocations = useMemo(() => {
    return allLocations.filter(
      (loc) =>
        loc.latitude &&
        loc.longitude 
        // si je veux seulement afficher les demandes autorisées sur la carte decommente la ligne suivante 
        //&& (loc.statut === 'AUTORISATION_SIGNEE' || loc.statut === 'CLOTUREE')
    );
  }, [allLocations]);

  // Calculer les statistiques sur TOUTES les demandes
  const statistics = useMemo(() => {
    const stats = {
      total: allLocations.length,
      byType: {},
      accepted: allLocations.filter(loc => 
        loc.statut === 'AUTORISATION_SIGNEE' || loc.statut === 'CLOTUREE'
      ).length
    };

    // Compter par type
    Object.keys(typeColors).forEach(type => {
      stats.byType[type] = allLocations.filter(
        loc => loc.type?.toLowerCase() === type
      ).length;
    });

    return stats;
  }, [allLocations]);

  // Charger Leaflet
  useEffect(() => {
    // Charger le CSS de Leaflet
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    // Charger le JS de Leaflet
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => {
      setL(window.L);
    };
    document.body.appendChild(script);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        console.log(
          "🔍 Tentative de chargement des localisations depuis:",
          `${API_BASE}/api/localisations`
        );
        const response = await fetch(`${API_BASE}/api/localisations`);
        console.log("📡 Réponse reçue:", response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📦 Données brutes reçues:", data);
        console.log("📊 Nombre de localisations:", data.length);

        // Formater TOUTES les demandes (pas de filtre ici)
        const formattedLocations = data.map((item) => ({
          id: item.id,
          nom:
            item.nom ||
            `${item.type?.toUpperCase() || "Demande"} - ${
              item.reference || ""
            }`,
          description: item.description || `Type: ${item.type || "N/A"}`,
          latitude: item.latitude ? parseFloat(item.latitude) : null,
          longitude: item.longitude ? parseFloat(item.longitude) : null,
          type: item.type,
          reference: item.reference,
          statut: item.statut,
          telephone: item.telephone,
          email: item.email,
          adresse: item.adresse,
        }));

        console.log("✅ Toutes les demandes reçues:", formattedLocations.length);
        console.log("📍 Demandes avec GPS:", formattedLocations.filter(l => l.latitude && l.longitude).length);
        console.log("✅ Demandes autorisées avec GPS:", formattedLocations.filter(l => l.latitude && l.longitude && (l.statut === 'AUTORISATION_SIGNEE' || l.statut === 'CLOTUREE')).length);
        setAllLocations(formattedLocations);
      } catch (err) {
        console.error("❌ Erreur lors du chargement:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    console.log("🗺️ Tentative d'initialisation de la carte...");
    console.log("  - mapRef.current:", mapRef.current);
    console.log("  - mapLocations.length:", mapLocations.length);
    console.log("  - L (Leaflet):", L);

    if (!mapRef.current) {
      console.warn("⚠️ mapRef.current n'est pas défini");
      return;
    }
    if (mapLocations.length === 0) {
      console.warn("⚠️ Aucune localisation autorisée disponible pour la carte");
      return;
    }
    if (!L) {
      console.warn("⚠️ Leaflet (L) n'est pas encore chargé");
      return;
    }

    console.log(
      "✅ Toutes les conditions sont remplies, initialisation de la carte..."
    );

    // Nettoyer l'ancienne instance si elle existe
    if (mapInstanceRef.current) {
      console.log("🔄 Suppression de l'ancienne instance de carte");
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (e) {
        console.warn("⚠️ Erreur lors du nettoyage:", e);
      }
    }

    // Nettoyer le contenu du conteneur
    if (mapRef.current) {
      mapRef.current.innerHTML = "";
      mapRef.current._leaflet_id = null;
    }

    try {
      const map = L.map(mapRef.current, {
        center: [21.0835, -10.9692],
        zoom: 6,
        scrollWheelZoom: false, // DÉSACTIVER le zoom avec la molette de la souris
        doubleClickZoom: true, // Zoom avec double-clic
        touchZoom: false, // DÉSACTIVER le zoom tactile (deux doigts)
        dragging: true, // Permettre de déplacer la carte
        zoomControl: true, // Afficher les boutons +/- de zoom
      });
      console.log("✅ Carte créée avec succès");

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);
      console.log("✅ Tuiles ajoutées");

      let markersAdded = 0;
      mapLocations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          // Obtenir la couleur pour ce type
          const markerColor = getColorByType(loc.type);
          
          // Créer le contenu HTML du popup avec toutes les informations
          const popupContent = `
            <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <h3 style="margin: 0 0 10px 0; color: ${markerColor}; font-size: 1.1rem; border-bottom: 2px solid ${markerColor}; padding-bottom: 8px;">
                📍 ${(loc?.nom && String(loc.nom).trim()) || t("map.loc")}

              </h3>
              
              <div style="margin-bottom: 8px;">
                <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Description</strong>
                <p style="margin: 4px 0 0 0; color: #333;">${
                  loc.description || "N/A"
                }</p>
              </div>
              
              <div style="margin-bottom: 8px;">
                <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Coordonnées GPS</strong>
                <p style="margin: 4px 0 0 0; color: #333;">${loc.latitude}, ${
            loc.longitude
          }</p>
              </div>
              
              ${
                loc.type
                  ? `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Type</strong>
                  <p style="margin: 4px 0 0 0; color: #333;">${loc.type}</p>
                </div>
              `
                  : ""
              }
              
              ${
                loc.statut
                  ? `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Statut</strong>
                  <p style="margin: 4px 0 0 0; color: #333;">${loc.statut}</p>
                </div>
              `
                  : ""
              }
              
              ${
                loc.telephone
                  ? `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Téléphone</strong>
                  <p style="margin: 4px 0 0 0;">
                    <a href="tel:${loc.telephone}" style="color: #667eea; text-decoration: none;">${loc.telephone}</a>
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                loc.email
                  ? `
                <div style="margin-bottom: 8px;">
                  <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Email</strong>
                  <p style="margin: 4px 0 0 0;">
                    <a href="mailto:${loc.email}" style="color: #667eea; text-decoration: none;">${loc.email}</a>
                  </p>
                </div>
              `
                  : ""
              }
              
              ${
                loc.adresse
                  ? `
                <div style="margin-bottom: 0;">
                  <strong style="color: #666; font-size: 0.85rem; text-transform: uppercase;">Adresse</strong>
                  <p style="margin: 4px 0 0 0; color: #333;">${loc.adresse}</p>
                </div>
              `
                  : ""
              }
            </div>
          `;

          // Créer le marqueur avec l'icône personnalisée
          const customIcon = createCustomIcon(markerColor);
          const marker = L.marker(
            [parseFloat(loc.latitude), parseFloat(loc.longitude)],
            customIcon ? { icon: customIcon } : {}
          )
            .bindPopup(popupContent, {
              maxWidth: 350,
              className: "custom-popup",
            })
            .addTo(map);

          markersAdded++;
        }
      });
      console.log(`✅ ${markersAdded} marqueurs ajoutés sur la carte`);

      mapInstanceRef.current = map;
    } catch (error) {
      console.error("❌ Erreur lors de l'initialisation de la carte:", error);
    }

    return () => {
      if (mapInstanceRef.current) {
        console.log("🧹 Nettoyage de la carte");
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        } catch (e) {
          console.warn("⚠️ Erreur lors du nettoyage final:", e);
        }
      }
    };
  }, [mapLocations, L]);

  return (
    <div className="map-container-wrapper">
      <style>{`
        .map-container-wrapper {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 20px;
        }

        .map-stats-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 20px;
          width: 100%;
        }

        .map-display-area {
          width: 100%;
          height: 600px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          position: relative;
          background: white;
        }

        .stats-panel {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 24px;
          height: 600px;
          overflow-y: auto;
        }

        .stats-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 3px solid #667eea;
        }

        .stats-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #333;
          font-weight: 700;
        }

        .stats-section {
          margin-bottom: 24px;
        }

        .stats-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #555;
          margin-bottom: 16px;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          padding: 20px;
          color: white;
          margin-bottom: 16px;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .stat-card-label {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 8px;
        }

        .stat-card-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0;
        }

        .type-stat-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }

        .type-stat-item:hover {
          transform: translateX(5px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .type-stat-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .type-stat-color {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .type-stat-name {
          font-weight: 600;
          color: #333;
          text-transform: capitalize;
        }

        .type-stat-count {
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
          background: white;
          padding: 4px 12px;
          border-radius: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .accepted-stat {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          border-radius: 10px;
          padding: 20px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .accepted-stat-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .accepted-stat-label {
          font-size: 1rem;
          font-weight: 600;
        }

        .accepted-stat-value {
          font-size: 2rem;
          font-weight: 700;
        }

        #map {
          width: 100%;
          height: 100%;
        }

        /* Style personnalisé pour les popups Leaflet */
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .leaflet-popup-content {
          margin: 0;
        }

        /* Style pour les icônes personnalisées */
        .custom-marker-icon {
          background: none;
          border: none;
        }

        .loading-state, .error-state {
          width: 100%;
          height: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 12px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-text {
          color: #667eea;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .error-text {
          color: #d32f2f;
          font-size: 1.2rem;
          font-weight: 500;
        }

        .locations-counter {
          position: absolute;
          bottom: 20px;
          left: 20px;
          background: white;
          padding: 10px 16px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 999;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
        }

        .map-legend {
          position: absolute;
          top: 20px;
          right: 20px;
          background: white;
          padding: 12px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          z-index: 999;
          min-width: 150px;
        }

        .legend-title {
          font-weight: 700;
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e5e7eb;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .legend-item:last-child {
          margin-bottom: 0;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .legend-label {
          font-size: 0.85rem;
          color: #555;
          font-weight: 500;
        }

        @media (max-width: 1200px) {
          .map-stats-layout {
            grid-template-columns: 1fr;
          }

          .stats-panel {
            height: auto;
            max-height: 500px;
          }
        }

        @media (max-width: 768px) {
          .map-container-wrapper {
            padding: 10px;
          }

          .map-display-area {
            height: 500px;
          }

          .locations-counter {
            bottom: 10px;
            left: 10px;
            font-size: 0.85rem;
            padding: 8px 12px;
          }

          .map-legend {
            top: 10px;
            right: 10px;
            padding: 10px;
            min-width: 130px;
          }

          .legend-title {
            font-size: 0.8rem;
          }

          .legend-label {
            font-size: 0.75rem;
          }

          .legend-color {
            width: 14px;
            height: 14px;
          }

          .stats-header h2 {
            font-size: 1.2rem;
          }

          .stat-card-value {
            font-size: 2rem;
          }
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
          {/* Carte */}
          <div className="map-display-area">
            <div id="map" ref={mapRef}></div>

            <div className="locations-counter">
              <MapPin size={18} />
              {mapLocations.length} localisation{mapLocations.length > 1 ? "s" : ""} autorisée{mapLocations.length > 1 ? "s" : ""}
            </div>

            {/* Légende des couleurs */}
            {/* <div className="map-legend">
              <div className="legend-title">Types de demandes</div>
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: color }}></div>
                  <span className="legend-label">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              ))}
            </div> */}
          </div>

          {/* Panneau de statistiques */}
          <div className="stats-panel">
            <div className="stats-header">
              <BarChart3 size={28} color="#667eea" />
              <h2>Statistiques</h2>
            </div>

            {/* Total des demandes */}
            <div className="stat-card">
              <div className="stat-card-label">Total des demandes</div>
              <div className="stat-card-value">{statistics.total}</div>
            </div>

            {/* Demandes par type */}
            <div className="stats-section">
              <div className="stats-section-title">
                <FileText size={20} />
                Demandes par type
              </div>
              {Object.entries(typeColors).map(([type, color]) => (
                <div key={type} className="type-stat-item">
                  <div className="type-stat-left">
                    <div 
                      className="type-stat-color" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="type-stat-name">{type}</span>
                  </div>
                  <div className="type-stat-count">
                    {statistics.byType[type] || 0}
                  </div>
                </div>
              ))}
            </div>

            {/* Demandes acceptées */}
            <div className="stats-section">
              <div className="stats-section-title">
                <CheckCircle size={20} />
                Demandes acceptées
              </div>
              <div className="accepted-stat">
                <div className="accepted-stat-left">
                  <CheckCircle size={32} />
                  <span className="accepted-stat-label">Autorisées</span>
                </div>
                <div className="accepted-stat-value">
                  {statistics.accepted}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;
