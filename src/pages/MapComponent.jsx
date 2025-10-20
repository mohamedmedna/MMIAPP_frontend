import React, { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { useTranslation } from "react-i18next";

const API_BASE = window.__APP_CONFIG__?.API_BASE;

function MapComponent() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = React.useRef(null);
  const mapInstanceRef = React.useRef(null);
  const [L, setL] = useState(null);
  const { t, i18n } = useTranslation();

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

        const formattedLocations = data
          .filter((item) => item.latitude && item.longitude)
          .map((item) => ({
            id: item.id,
            nom:
              item.nom ||
              `${item.type?.toUpperCase() || "Demande"} - ${
                item.reference || ""
              }`,
            description: item.description || `Type: ${item.type || "N/A"}`,
            latitude: parseFloat(item.latitude),
            longitude: parseFloat(item.longitude),
            type: item.type,
            reference: item.reference,
            statut: item.statut,
            telephone: item.telephone,
            email: item.email,
            adresse: item.adresse,
          }));

        console.log("✅ Localisations formatées:", formattedLocations);
        console.log("📍 Nombre après filtrage:", formattedLocations.length);
        setLocations(formattedLocations);
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
    console.log("  - locations.length:", locations.length);
    console.log("  - L (Leaflet):", L);

    if (!mapRef.current) {
      console.warn("⚠️ mapRef.current n'est pas défini");
      return;
    }
    if (locations.length === 0) {
      console.warn("⚠️ Aucune localisation disponible");
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
        center: [18.0735, -15.9582],
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
      locations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          // Créer le contenu HTML du popup avec toutes les informations
          const popupContent = `
            <div style="padding: 12px; min-width: 250px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
              <h3 style="margin: 0 0 10px 0; color: #667eea; font-size: 1.1rem; border-bottom: 2px solid #667eea; padding-bottom: 8px;">
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

          const marker = L.marker([
            parseFloat(loc.latitude),
            parseFloat(loc.longitude),
          ])
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
  }, [locations, L]);

  return (
    <div className="map-container-wrapper">
      <style>{`
        .map-container-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
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
        <div className="map-display-area">
          <div id="map" ref={mapRef}></div>

          <div className="locations-counter">
            <MapPin size={18} />
            {locations.length} localisation{locations.length > 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;
