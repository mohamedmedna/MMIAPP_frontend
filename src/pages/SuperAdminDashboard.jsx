import React, { useState, useEffect, useCallback } from "react";
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
  const [contactMessages, setContactMessages] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState("");
  const [messageFilter, setMessageFilter] = useState("ALL");

  const baseUrl = window.__APP_CONFIG__?.API_BASE;
  const statusFilters = ["ALL", "NOUVEAU", "EN_COURS", "TRAITE"];

  const statusLabels = {
    NOUVEAU: t("superAdminDashboard.contactMessages.statuses.NOUVEAU"),
    EN_COURS: t("superAdminDashboard.contactMessages.statuses.EN_COURS"),
    TRAITE: t("superAdminDashboard.contactMessages.statuses.TRAITE"),
  };

  const filterLabels = {
    ALL: t("superAdminDashboard.contactMessages.filters.all"),
    NOUVEAU: statusLabels.NOUVEAU,
    EN_COURS: statusLabels.EN_COURS,
    TRAITE: statusLabels.TRAITE,
  };

  const getSubjectLabel = (subject) => {
    const mapping = {
      demande_info: t("contact.subject_info"),
      assistance_technique: t("contact.subject_technical"),
      probleme_demande: t("contact.subject_request_issue"),
      suggestion: t("contact.subject_suggestion"),
      autre: t("contact.subject_other"),
    };
    return mapping[subject] || subject;
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    try {
      return new Date(value).toLocaleString();
    } catch (err) {
      return value;
    }
  };

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

  const fetchContactMessages = useCallback(
    async (filter = messageFilter) => {
      setContactLoading(true);
      setContactError("");
      try {
        const query =
          filter && filter !== "ALL"
            ? `?statut=${encodeURIComponent(filter)}`
            : "";
        const response = await fetch(
          `${baseUrl}/api/admin/contact-messages${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        const data = await response.json();
        if (response.ok) {
          setContactMessages(data.messages || []);
        } else {
          setContactError(
            data.error ||
              t("superAdminDashboard.contactMessages.fetchError")
          );
        }
      } catch (err) {
        setContactError(
          t("superAdminDashboard.contactMessages.fetchError")
        );
      } finally {
        setContactLoading(false);
      }
    },
    [baseUrl, messageFilter, t]
  );

  useEffect(() => {
    fetchContactMessages(messageFilter);
  }, [fetchContactMessages, messageFilter]);

  const handleFilterChange = (filter) => {
    setMessageFilter(filter);
  };

  const handleRefreshMessages = () => {
    fetchContactMessages(messageFilter);
  };

  const updateContactMessage = async (id, payload) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/admin/contact-messages/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setContactMessages((prev) =>
          prev.map((msg) => (msg.id === id ? data.message : msg))
        );
        setContactError("");
        setNotif(t("superAdminDashboard.contactMessages.updateSuccess"));
        setTimeout(() => setNotif(""), 5000);
      } else {
        const errorMessage =
          data.error || t("superAdminDashboard.contactMessages.updateError");
        setError(errorMessage);
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(t("superAdminDashboard.contactMessages.updateError"));
      setTimeout(() => setError(""), 5000);
    }
  };

  const handleSetStatus = (message, nextStatus) => {
    updateContactMessage(message.id, { statut: nextStatus });
  };

  const handleEditNotes = (message) => {
    const note = window.prompt(
      t("superAdminDashboard.contactMessages.notesPrompt"),
      message.notes_admin || ""
    );
    if (note === null) return;
    updateContactMessage(message.id, { notes_admin: note });
  };

  const handleDeleteMessage = async (message) => {
    if (
      !window.confirm(
        t("superAdminDashboard.contactMessages.confirmDelete")
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/admin/contact-messages/${message.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setContactMessages((prev) =>
          prev.filter((msg) => msg.id !== message.id)
        );
        setNotif(t("superAdminDashboard.contactMessages.deleteSuccess"));
        setTimeout(() => setNotif(""), 5000);
      } else {
        setError(
          (data && data.error) ||
            t("superAdminDashboard.contactMessages.deleteError")
        );
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError(t("superAdminDashboard.contactMessages.deleteError"));
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

        <div className="contact-messages-section">
          <div className="contact-messages-header">
            <div>
              <h2>{t("superAdminDashboard.contactMessages.title")}</h2>
              <p className="contact-messages-description">
                {t("superAdminDashboard.contactMessages.description")}
              </p>
            </div>
            <button
              className="contact-refresh-btn"
              onClick={handleRefreshMessages}
              disabled={contactLoading}
            >
              {t("superAdminDashboard.contactMessages.refresh")}
            </button>
          </div>

          <div className="contact-message-filters">
            {statusFilters.map((filter) => (
              <button
                key={filter}
                className={`contact-filter-btn ${
                  messageFilter === filter ? "active" : ""
                }`}
                onClick={() => handleFilterChange(filter)}
                disabled={contactLoading && messageFilter === filter}
              >
                {filterLabels[filter] || filter}
              </button>
            ))}
          </div>

          {contactError && (
            <div className="contact-messages-error">{contactError}</div>
          )}

          {contactLoading ? (
            <div className="contact-messages-empty">
              {t("superAdminDashboard.contactMessages.loading")}
            </div>
          ) : contactMessages.length === 0 ? (
            <div className="contact-messages-empty">
              {t("superAdminDashboard.contactMessages.noData")}
            </div>
          ) : (
            <div className="contact-message-cards">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`contact-message-card status-${msg.statut.toLowerCase()}`}
                >
                  <div className="contact-message-header">
                    <div>
                      <div className="contact-message-name">{msg.nom}</div>
                      <div className="contact-message-email">{msg.email}</div>
                    </div>
                    <div className="contact-message-date">
                      {formatDateTime(msg.created_at)}
                    </div>
                  </div>

                  <div className="contact-message-meta">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.subjectLabel")}:
                    </span>
                    <span>{getSubjectLabel(msg.sujet)}</span>
                  </div>

                  <div className="contact-message-meta">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.phoneLabel")}:
                    </span>
                    <span>
                      {msg.telephone ||
                        t("superAdminDashboard.contactMessages.noPhone")}
                    </span>
                  </div>

                  <div className="contact-message-meta">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.statusLabel")}:
                    </span>
                    <span
                      className={`status-badge contact-status-badge status-${msg.statut.toLowerCase()}`}
                    >
                      {statusLabels[msg.statut] || msg.statut}
                    </span>
                  </div>

                  <div className="contact-message-text">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.messageLabel")}:
                    </span>
                    <p>{msg.message}</p>
                  </div>

                  <div className="contact-message-meta">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.notesLabel")}:
                    </span>
                    <span className="contact-message-notes">
                      {msg.notes_admin
                        ? msg.notes_admin
                        : t(
                            "superAdminDashboard.contactMessages.notesPlaceholder"
                          )}
                    </span>
                  </div>

                  <div className="contact-message-meta">
                    <span className="contact-message-label">
                      {t("superAdminDashboard.contactMessages.handledBy")}:
                    </span>
                    <span>
                      {msg.handled_by
                        ? msg.handled_by
                        : t(
                            "superAdminDashboard.contactMessages.notHandled"
                          )}
                    </span>
                  </div>

                  {msg.handled_at && (
                    <div className="contact-message-meta">
                      <span className="contact-message-label">
                        {t("superAdminDashboard.contactMessages.handledAt")}
                        :
                      </span>
                      <span>{formatDateTime(msg.handled_at)}</span>
                    </div>
                  )}

                  <div className="contact-message-actions">
                    <button
                      className="contact-message-action action-secondary"
                      onClick={() => handleSetStatus(msg, "NOUVEAU")}
                      disabled={contactLoading}
                    >
                      {t(
                        "superAdminDashboard.contactMessages.actions.markNew"
                      )}
                    </button>
                    <button
                      className="contact-message-action action-warning"
                      onClick={() => handleSetStatus(msg, "EN_COURS")}
                      disabled={contactLoading}
                    >
                      {t(
                        "superAdminDashboard.contactMessages.actions.markInProgress"
                      )}
                    </button>
                    <button
                      className="contact-message-action action-success"
                      onClick={() => handleSetStatus(msg, "TRAITE")}
                      disabled={contactLoading}
                    >
                      {t(
                        "superAdminDashboard.contactMessages.actions.markDone"
                      )}
                    </button>
                    <button
                      className="contact-message-action action-note"
                      onClick={() => handleEditNotes(msg)}
                    >
                      {t(
                        "superAdminDashboard.contactMessages.actions.editNotes"
                      )}
                    </button>
                    <button
                      className="contact-message-action action-danger"
                      onClick={() => handleDeleteMessage(msg)}
                      disabled={contactLoading}
                    >
                      {t(
                        "superAdminDashboard.contactMessages.actions.delete"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
