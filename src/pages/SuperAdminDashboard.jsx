import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "../Styles/SuperAdminDashboard.css";
import { useTranslation } from "react-i18next";

function SuperAdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, actifs: 0, roles: {} });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    role: "",
    password: "",
  });
  const [notif, setNotif] = useState("");
  const [error, setError] = useState("");

  const baseUrl = window.__APP_CONFIG__?.API_BASE;

  // Déconnexion (SPA redirect to respect basename)
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/superadmin-login");
  };

  // Libellé du rôle
  const getRoleLabel = (roleId) => {
    const roleMap = {
      1: "SuperAdmin",
      2: "Secrétariat Central",
      3: "Secrétariat Général",
      4: "Chef de Service",
      5: "DDPI",
      6: "DGI",
      7: "Commission",
      8: "Comité",
      9: "MMI",
      10: "Demandeur",
      11: "PNME",
    };
    return roleMap[roleId] || "Inconnu";
  };

  // Activer/Désactiver utilisateur
  const handleToggleUserStatus = async (userId, userName, currentStatus) => {
    const action = currentStatus === "ACTIF" ? "désactiver" : "activer";
    if (
      !window.confirm(
        `Êtes-vous sûr de vouloir ${action} l'utilisateur ${userName} ?`
      )
    )
      return;

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, statut: data.user.statut } : user
          )
        );
        setNotif(data.message || `Utilisateur ${action} avec succès`);
        setTimeout(() => setNotif(""), 5000);
      } else {
        setError(data.error || `Erreur lors du changement de statut`);
        setTimeout(() => setError(""), 5000);
      }
    } catch {
      setError("Erreur réseau lors du changement de statut");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Renvoyer l’email d’activation
  const handleResendActivation = async (userId, userName) => {
    if (!window.confirm(`Renvoyer l'email d'activation à ${userName} ?`))
      return;

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/users/${userId}/resend-activation`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setNotif(data.message || "Email d'activation renvoyé avec succès");
        setTimeout(() => setNotif(""), 5000);
      } else {
        setError(data.error || "Erreur lors du renvoi de l'activation");
        setTimeout(() => setError(""), 5000);
      }
    } catch {
      setError("Erreur réseau lors du renvoi");
      setTimeout(() => setError(""), 5000);
    }
  };

  // Charger utilisateurs & stats
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${baseUrl}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });
        const data = await res.json();
        setUsers(data.users || []);
        setStats(data.stats || { total: 0, actifs: 0, roles: {} });
      } catch {
        // Optionnel : gestion d'erreur de chargement
      }
    })();
  }, [baseUrl]);

  // Form handlers
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotif("");
    try {
      const response = await fetch(`${baseUrl}/api/admin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif("Utilisateur créé et email envoyé !");
        setShowForm(false);
        setForm({ nom: "", prenom: "", email: "", role: "", password: "" });
        setUsers((prev) => [...prev, data.newUser]);
        setTimeout(() => setNotif(""), 5000);
      } else {
        setError(data.error || "Erreur lors de la création.");
        setTimeout(() => setError(""), 5000);
      }
    } catch {
      setError("Erreur réseau ou serveur.");
      setTimeout(() => setError(""), 5000);
    }
  };

  return (
    <>
      <Header />
      <div className="super-admin-dashboard">
        <div className="dashboard-title-row">
          <h1 className="dashboard-title">{t("superAdminDashboard.title")}</h1>
          <button className="logout-button" onClick={handleLogout}>
            {t("superAdminDashboard.logout")}
          </button>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card stat-total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">{t("superAdminDashboard.users")}</div>
          </div>
          <div className="stat-card stat-approuvees">
            <div className="stat-number">{stats.actifs}</div>
            <div className="stat-label">{t("superAdminDashboard.active")}</div>
          </div>
          {stats.roles &&
            Object.entries(stats.roles).map(([role, count]) => (
              <div className="stat-card" key={role}>
                <div className="stat-number">{count}</div>
                <div className="stat-label">{role}</div>
              </div>
            ))}
        </div>

        <div className="admin-actions">
          <button
            className="auth-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm
              ? t("superAdminDashboard.cancel")
              : t("superAdminDashboard.createUser")}
          </button>
        </div>

        {/* Gestion du portail */}
        <div className="access-code-section">
          <h2 className="section-title">
            {t("superAdminDashboard.portalManagement.title")}
          </h2>
          <div className="access-code-content">
            <div className="access-code-info">
              <p>
                <strong>
                  {t("superAdminDashboard.portalManagement.description")}
                </strong>
              </p>
              <p className="access-code-requirements">
                {t("superAdminDashboard.portalManagement.subtext")}
              </p>
            </div>

            {/* SPA navigation instead of window.location.href */}
            <button
              className="access-code-btn"
              onClick={() => navigate("/admin-portail")}
            >
              <i className="fa-solid fa-newspaper"></i>
              {t("superAdminDashboard.portalManagement.button")}
            </button>
          </div>
        </div>

        {/* Gestion du code d'accès */}
        <div className="access-code-section">
          <h2 className="section-title">
            {t("superAdminDashboard.accessCode.title")}
          </h2>
          <div className="access-code-content">
            <div className="access-code-info">
              <p>
                <strong>
                  {t("superAdminDashboard.accessCode.description")}
                </strong>
              </p>
              <p className="access-code-requirements">
                {t("superAdminDashboard.accessCode.subtext")}
              </p>
            </div>

            {/* SPA navigation instead of window.location.href */}
            <button
              className="access-code-btn"
              onClick={() => navigate("/admin-access-code")}
            >
              <i className="fa-solid fa-key"></i>
              {t("superAdminDashboard.accessCode.button")}
            </button>
          </div>
        </div>

        {showForm && (
          <div className="form-container">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-title">
                {t("superAdminDashboard.newUser")}
              </div>

              <div className="form-group">
                <label className="auth-label">
                  {t("superAdminDashboard.nom")}
                </label>
                <input
                  className="auth-input"
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="auth-label">
                  {t("superAdminDashboard.prenom")}
                </label>
                <input
                  className="auth-input"
                  name="prenom"
                  value={form.prenom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="auth-label">
                  {t("superAdminDashboard.email")}
                </label>
                <input
                  className="auth-input"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  type="email"
                />
              </div>

              <div className="form-group">
                <label className="auth-label">
                  {t("superAdminDashboard.role")}
                </label>
                <select
                  className="auth-input"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {t("superAdminDashboard.selectRole")}
                  </option>
                  <option value="Secrétariat Central">
                    {t("superAdminDashboard.roles.Secrétariat Central")}
                  </option>
                  <option value="Secrétariat Général">
                    {t("superAdminDashboard.roles.Secrétariat Général")}
                  </option>
                  <option value="Chef de Service">
                    {t("superAdminDashboard.roles.Chef de Service")}
                  </option>
                  <option value="DDPI">
                    {t("superAdminDashboard.roles.DDPI")}
                  </option>
                  <option value="DGI">
                    {t("superAdminDashboard.roles.DGI")}
                  </option>
                  <option value="Commission">
                    {t("superAdminDashboard.roles.Commission")}
                  </option>
                  <option value="Comité">
                    {t("superAdminDashboard.roles.Comité")}
                  </option>
                  <option value="MMI">
                    {t("superAdminDashboard.roles.MMI")}
                  </option>
                  <option value="PNME">
                    {t("superAdminDashboard.roles.PNME")}
                  </option>
                  <option value="SuperAdmin">
                    {t("superAdminDashboard.roles.SuperAdmin")}
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label className="auth-label">
                  {t("superAdminDashboard.password")}
                </label>
                <input
                  className="auth-input"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  type="text"
                />
              </div>

              <button type="submit" className="auth-button">
                {t("superAdminDashboard.createAndSend")}
              </button>
            </form>
          </div>
        )}

        {/* Notifications */}
        {notif && <div className="form-success global-notif">{notif}</div>}
        {error && <div className="form-error global-notif">{error}</div>}

        <h2>{t("superAdminDashboard.userList")}</h2>
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>{t("superAdminDashboard.nom")}</th>
              <th>{t("superAdminDashboard.prenom")}</th>
              <th>{t("superAdminDashboard.email")}</th>
              <th>{t("superAdminDashboard.role")}</th>
              <th>{t("superAdminDashboard.status")}</th>
              <th>{t("superAdminDashboard.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.email}</td>
                <td>{u.role || getRoleLabel(u.role_id)}</td>
                <td>
                  <span
                    className={`status-badge ${
                      u.statut === "ACTIF"
                        ? "status-active"
                        : u.statut === "INACTIF"
                        ? "status-inactive"
                        : "status-pending"
                    }`}
                  >
                    {u.statut}
                  </span>
                </td>
                <td>
                  {u.statut === "EN_ATTENTE" ? (
                    <button
                      className="admin-user-action action-resend"
                      onClick={() =>
                        handleResendActivation(u.id, `${u.nom} ${u.prenom}`)
                      }
                    >
                      {t("superAdminDashboard.resendEmail")}
                    </button>
                  ) : (
                    <button
                      className={`admin-user-action ${
                        u.statut === "ACTIF"
                          ? "action-deactivate"
                          : "action-activate"
                      }`}
                      onClick={() =>
                        handleToggleUserStatus(
                          u.id,
                          `${u.nom} ${u.prenom}`,
                          u.statut
                        )
                      }
                    >
                      {u.statut === "ACTIF"
                        ? t("superAdminDashboard.deactivate")
                        : t("superAdminDashboard.activate")}
                    </button>
                  )}
                  <button
                    className="admin-user-action action-delete"
                    onClick={() => {
                      if (
                        window.confirm(
                          `${t("superAdminDashboard.delete")} ${u.nom} ${
                            u.prenom
                          } ?`
                        )
                      ) {
                        fetch(`${baseUrl}/api/admin/users/${u.id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem(
                              "adminToken"
                            )}`,
                          },
                        })
                          .then((res) => res.json())
                          .then((data) => {
                            if (data.success) {
                              setUsers((prev) =>
                                prev.filter((user) => user.id !== u.id)
                              );
                              setNotif(
                                t("superAdminDashboard.userDeleted") ||
                                  "Utilisateur supprimé !"
                              );
                              setTimeout(() => setNotif(""), 5000);
                            } else {
                              setError(
                                data.error || "Erreur lors de la suppression"
                              );
                              setTimeout(() => setError(""), 5000);
                            }
                          })
                          .catch(() => {
                            setError("Erreur réseau lors de la suppression");
                            setTimeout(() => setError(""), 5000);
                          });
                      }
                    }}
                  >
                    {t("superAdminDashboard.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </>
  );
}

export default SuperAdminDashboard;
