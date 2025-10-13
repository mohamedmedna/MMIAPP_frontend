import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/SuperAdminDashboard.css';

function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ total: 0, actifs: 0, roles: {} });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', role: '', password: ''
  });
  const [notif, setNotif] = useState('');
  const [error, setError] = useState('');

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    window.location.href = '/superadmin-login';
  };

  // Fonction pour obtenir le label du rôle
  const getRoleLabel = (roleId) => {
    const roleMap = {
      1: 'SuperAdmin',
      2: 'Secrétariat Central',
      3: 'Secrétariat Général',
      4: 'Chef de Service',
      5: 'DDPI',
      6: 'DGI',
      7: 'Commission',
      8: 'Comité',
      9: 'MMI',
      10: 'Demandeur',
      11: 'PNME'
    };
    return roleMap[roleId] || 'Inconnu';
  };

  // Désactiver/Activer un utilisateur
  const handleToggleUserStatus = async (userId, userName, currentStatus) => {
    const action = currentStatus === 'ACTIF' ? 'désactiver' : 'activer';
    if (!window.confirm(`Êtes-vous sûr de vouloir ${action} l'utilisateur ${userName} ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // Mettre à jour l'utilisateur dans la liste
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, statut: data.user.statut } : user
        ));
        setNotif(data.message || `Utilisateur ${action} avec succès`);
      } else {
        setError(data.error || `Erreur lors du changement de statut`);
      }
    } catch (err) {
      setError('Erreur réseau lors du changement de statut');
    }
  };

  // Renvoyer l'email d'activation
  const handleResendActivation = async (userId, userName) => {
    if (!window.confirm(`Renvoyer l'email d'activation à ${userName} ?`)) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:4000/api/admin/users/${userId}/resend-activation`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setNotif(data.message || 'Email d\'activation renvoyé avec succès');
        // Clear notification after 5 seconds
        setTimeout(() => setNotif(''), 5000);
      } else {
        setError(data.error || 'Erreur lors du renvoi de l\'activation');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      setError('Erreur réseau lors du renvoi');
      setTimeout(() => setError(''), 5000);
    }
  };

  // Charger la liste des utilisateurs et statistiques
  useEffect(() => {
    fetch('http://localhost:4000/api/admin/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setStats(data.stats || {});
      });
  }, []);

  // Gestion du formulaire
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Création d'un nouvel utilisateur
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setNotif('');
    try {
      const response = await fetch('http://localhost:4000/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setNotif('Utilisateur créé et email envoyé !');
        setShowForm(false);
        setForm({ nom: '', prenom: '', email: '', role: '', password: '' });
        // Recharge la liste
        setUsers(prev => [...prev, data.newUser]);
      } else {
        setError(data.error || 'Erreur lors de la création.');
      }
    } catch {
      setError('Erreur réseau ou serveur.');
    }
  };

  return (
    <React.Fragment>
      <Header />
      <div className="super-admin-dashboard">
        <div className="dashboard-title-row">
          <h1 className="dashboard-title">Administration - SuperAdmin</h1>
          <button className="logout-button" onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
        <div className="dashboard-stats">
          <div className="stat-card stat-total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Utilisateurs</div>
          </div>
          <div className="stat-card stat-approuvees">
            <div className="stat-number">{stats.actifs}</div>
            <div className="stat-label">Actifs</div>
          </div>
          {/* Affiche les rôles dynamiquement */}
          {stats.roles && Object.entries(stats.roles).map(([role, count]) => (
            <div className="stat-card" key={role}>
              <div className="stat-number">{count}</div>
              <div className="stat-label">{role}</div>
            </div>
          ))}
        </div>
        <div className="admin-actions">
          <button className="auth-button" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : 'Créer un utilisateur'}
          </button>
        </div>

        {/* Section de gestion du code d'accès */}
        <div className="access-code-section">
          <h2 className="section-title">Gestion du Code d'Accès Administration</h2>
          <div className="access-code-content">
            <div className="access-code-info">
              <p><strong>Gérez le code d'accès requis pour entrer dans l'espace administration</strong></p>
              <p className="access-code-requirements">
                Le code doit contenir 8 caractères avec majuscule, minuscule, chiffre et caractère spécial
              </p>
            </div>
            
            <button 
              className="access-code-btn"
              onClick={() => window.location.href = '/admin-access-code'}
            >
              <i className="fa-solid fa-key"></i>
              Gérer le Code d'Accès
            </button>
          </div>
        </div>

        {showForm && (
          <div className="form-container">
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-title">Nouvel Utilisateur</div>
              <div className="form-group">
                <label className="auth-label">Nom</label>
                <input 
                  className="auth-input" 
                  name="nom" 
                  value={form.nom} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="auth-label">Prénom</label>
                <input 
                  className="auth-input" 
                  name="prenom" 
                  value={form.prenom} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="auth-label">Email</label>
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
                <label className="auth-label">Rôle</label>
                <select 
                  className="auth-input" 
                  name="role" 
                  value={form.role} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Sélectionnez un rôle</option>
                  <option value="Secrétariat Central">Secrétariat Central</option>
                  <option value="Secrétariat Général">Secrétariat Général</option>
                  <option value="Chef de Service">Chef de Service</option>
                  <option value="DDPI">DDPI</option>
                  <option value="DGI">DGI</option>
                  <option value="Commission">Commission</option>
                  <option value="Comité">Comité</option>
                  <option value="MMI">MMI (Ministère)</option>
                  <option value="PNME">PNME</option>
                  <option value="SuperAdmin">SuperAdmin</option>
                </select>
              </div>
              <div className="form-group">
                <label className="auth-label">Mot de passe initial</label>
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
                Créer et Envoyer Email
              </button>
            </form>
          </div>
        )}

        {/* Notifications */}
        {notif && <div className="form-success global-notif">{notif}</div>}
        {error && <div className="form-error global-notif">{error}</div>}

        <h2>Liste des utilisateurs</h2>
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.nom}</td>
                <td>{u.prenom}</td>
                <td>{u.email}</td>
                <td>{u.role || getRoleLabel(u.role_id)}</td>
                <td>
                  <span className={`status-badge ${
                    u.statut === 'ACTIF' ? 'status-active' : 
                    u.statut === 'INACTIF' ? 'status-inactive' : 
                    'status-pending'
                  }`}>
                    {u.statut}
                  </span>
                </td>
                <td>
                  {u.statut === 'EN_ATTENTE' ? (
                    <button 
                      className="admin-user-action action-resend"
                      onClick={() => handleResendActivation(u.id, `${u.nom} ${u.prenom}`)}
                    >
                      Renvoyer Email
                    </button>
                  ) : (
                    <button 
                      className={`admin-user-action ${u.statut === 'ACTIF' ? 'action-deactivate' : 'action-activate'}`}
                      onClick={() => handleToggleUserStatus(u.id, `${u.nom} ${u.prenom}`, u.statut)}
                    >
                      {u.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                    </button>
                  )}
                  <button 
                    className="admin-user-action action-delete"
                    onClick={() => {
                      if (window.confirm(`Supprimer ${u.nom} ${u.prenom} ?`)) {
                        fetch(`http://localhost:4000/api/admin/users/${u.id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                        })
                        .then(res => res.json())
                        .then(data => {
                          if (data.success) {
                            setUsers(users.filter(user => user.id !== u.id));
                            setNotif('Utilisateur supprimé !');
                          } else {
                            setError(data.error || 'Erreur lors de la suppression');
                          }
                        });
                      }
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </React.Fragment>
  );
}

export default SuperAdminDashboard; 