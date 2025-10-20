import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Notifications({ userId }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = window.__APP_CONFIG__?.API_BASE;

  useEffect(() => {
    fetch(`${API_BASE}/api/notifications?user_id=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifs(data);
        setLoading(false);
      });
  }, [userId]);

  return (
    <div className="notifications-container">
      <h3>Notifications</h3>
      {loading ? (
        <div>Chargement...</div>
      ) : notifs.length === 0 ? (
        <div>Aucune notification.</div>
      ) : (
        <ul className="notifications-list">
          {notifs.map((notif, idx) => (
            <li key={idx} className={notif.lu ? "notif-lue" : "notif-non-lue"}>
              <span style={{ fontWeight: "bold" }}>{notif.type}</span> :{" "}
              {notif.message}
              <br />
              <span style={{ fontSize: 12, color: "#888" }}>
                {new Date(notif.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
useEffect(() => {
  if (notifs.length > 0) {
    // Marquer comme lues
    fetch(`${API_BASE}/api/notifications/marquer-lues`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
  }
}, [notifs, userId]);
export default Notifications;
