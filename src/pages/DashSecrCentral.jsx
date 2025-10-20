import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Tag, Spin, message, Divider, Alert, Badge } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  SendOutlined,
  ReloadOutlined,
  HomeOutlined,
  LogoutOutlined,
  BellOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DashboardStats from '../components/DashboardStats';
import SessionWarning from '../components/SessionWarning';
import '../Styles/DashboardSecretaireCentral.css';

const STATUT_COLORS = {
  DEPOSEE: 'gold',
  RECEPTIONNEE: 'blue',
  TRANSMISE_AU_SG: 'cyan',
  TRANSMISE_AU_DGI: 'purple',
  REJETEE: 'red'
};
const baseUrl = window.__APP_CONFIG__.API_BASE;


function SecretaireSidebar({ activeTab, onTabChange, onLogout, notifCount = 0, onGotoAccuses }) {
  return (
    <nav className="secretaire-sidebar">
      <div className="sidebar-header">Secrétariat Central</div>
      <div
        className={`sidebar-link${activeTab === 'nouvelles' ? ' active' : ''}`}
        onClick={() => onTabChange('nouvelles')}
      >
        <HomeOutlined /> Tableau de bord
      </div>
      <div
        className={`sidebar-link${activeTab === 'accuses' ? ' active' : ''}`}
        onClick={onGotoAccuses}
      >
        <FileTextOutlined /> Mes accusés de réception
      </div>
      <div
        className={`sidebar-link${activeTab === 'transmissions' ? ' active' : ''}`}
        onClick={() => onTabChange('transmissions')}
      >
        <SendOutlined /> Mes transmissions
      </div>
      <div
        className={`sidebar-link${activeTab === 'notifications' ? ' active' : ''}`}
        onClick={() => onTabChange('notifications')}
      >
        <BellOutlined /> Notifications <Badge count={notifCount} style={{ backgroundColor: '#faad14', marginLeft: 8 }} />
      </div>
      <div
        className="sidebar-link logout"
        onClick={onLogout}
      >
        <LogoutOutlined /> Déconnexion
      </div>
    </nav>
  );
}

function DashSecrCentral() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('nouvelles');
  const [demandes, setDemandes] = useState([]); // Initialiser avec un tableau vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  // ==================== VÉRIFICATION AUTHENTIFICATION ====================
  useEffect(() => {
    const checkAuth = () => {
      // Accepter soit adminToken soit token normal
      const adminToken = localStorage.getItem('adminToken');
      const normalToken = localStorage.getItem('token');
      const token = adminToken || normalToken;
      
      const user = localStorage.getItem('user');
      
      console.log('🔒 DashSecrCentral - Vérification auth:', {
        hasAdminToken: !!adminToken,
        hasNormalToken: !!normalToken,
        hasToken: !!token,
        hasUser: !!user
      });
      
      if (!token || !user) {
        console.error('❌ [AUTH] Token ou utilisateur manquant - redirection vers login');
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return false;
      }

      try {
        const userData = JSON.parse(user);
        console.log('👤 Utilisateur connecté:', userData);
        
        if (userData.role_id !== 2) {
          console.error('❌ [AUTH] Rôle incorrect - redirection vers login');
          message.error('Accès non autorisé. Veuillez vous reconnecter.');
          // Supprimer seulement les données du rôle actuel
          localStorage.removeItem('token');
          localStorage.removeItem('adminToken');
          localStorage.removeItem('user');
          navigate('/login-secretaire');
          return false;
        }

        console.log('✅ [AUTH] Authentification réussie pour le Secrétariat Central');
        return true;
      } catch (error) {
        console.error('❌ [AUTH] Erreur parsing utilisateur:', error);
        message.error('Erreur d\'authentification. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return false;
      }
    };

    const isAuthenticated = checkAuth();
    if (!isAuthenticated) return;

    // Détecter l'onglet actif via l'URL (chemin et/ou query)
    const params = new URLSearchParams(location.search);
    const byQuery = params.get('tab');
    let byPath = 'nouvelles';
    const path = location.pathname || '';
    if (path.endsWith('/accuses')) byPath = 'accuses';
    else if (path.endsWith('/transmissions')) byPath = 'transmissions';
    setActiveTab(byQuery || byPath || 'nouvelles');
    
    // Charger les données initiales
    fetchDemandes();
  }, [navigate, location]);

  // Charger les demandes selon l'onglet
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && activeTab) {
      fetchDemandes();
    }
  }, [activeTab]);

  const fetchDemandes = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ [FETCH] Token manquant - redirection vers login');
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return;
    }

    let url = `${baseUrl}/api/demandes`;
    if (activeTab === 'accuses') url = `${baseUrl}/api/demandes/accuses-reception`;
    else if (activeTab === 'transmissions') url += '?statut=TRANSMISE';
    // Pour 'nouvelles': pas de paramètre → le serveur inclut DEPOSEE/RECEPTIONNEE/... par défaut

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        console.error('❌ [FETCH] Token expiré ou invalide - redirection vers login');
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.demandes || data.items || []);
        setDemandes(list);
      } else {
        const errorText = await res.text();
        setError(`Erreur ${res.status}: ${errorText}`);
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement des demandes:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const accuserReception = async (demandeId) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ [ACCUSE] Token manquant - redirection vers login');
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return;
    }
    
    try {
      const res = await fetch(`${baseUrl}/api/demandes/${demandeId}/accuser-reception`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        console.error('❌ [ACCUSE] Token expiré ou invalide - redirection vers login');
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return;
      }
      
      if (res.ok) {
        message.success('Accusé de réception enregistré');
        fetchDemandes();
      } else {
        const txt = await res.text();
        message.error(`Erreur lors de l'accusé: ${txt}`);
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'accusé:', err);
      message.error('Erreur de connexion');
    }
  };

  const transmettreSG = async (demandeId) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ [SG] Token manquant - redirection vers login');
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return;
    }
    
    try {
      message.loading({ content: 'Transmission au SG en cours...', key: 'transmission' });
      
      const res = await fetch(`${baseUrl}/api/demandes/${demandeId}/transmettre-sg`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.status === 401) {
        console.error('❌ [SG] Token expiré ou invalide - redirection vers login');
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        message.success({ 
          content: data.message || 'Demande transmise au SG avec succès', 
          key: 'transmission', 
          duration: 3 
        });
        fetchDemandes(); // Actualiser la liste
      } else {
        const errorData = await res.text();
        message.error({ 
          content: errorData || 'Erreur lors de la transmission', 
          key: 'transmission', 
          duration: 5 
        });
      }
    } catch (err) {
      console.error('❌ Erreur de transmission au SG:', err);
      message.error({ 
        content: 'Erreur de connexion lors de la transmission', 
        key: 'transmission', 
        duration: 5 
      });
    }
  };

  const showDetails = async (demande) => {
    setSelectedDemande(demande);
    setModalVisible(true);
    setHistLoading(true);
    
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ [DETAILS] Token manquant - redirection vers login');
      message.error('Session expirée. Veuillez vous reconnecter.');
      navigate('/login-secretaire');
      return;
    }
    
    try {
      const res = await fetch(`${baseUrl}/api/demandes/${demande.id}/historique`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        console.error('❌ [DETAILS] Token expiré ou invalide - redirection vers login');
        message.error('Session expirée. Veuillez vous reconnecter.');
        // Supprimer seulement les données du rôle actuel
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        navigate('/login-secretaire');
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setHistorique(data);
      } else {
        console.error('❌ Erreur lors du chargement de l\'historique:', res.status);
        message.error('Erreur lors du chargement de l\'historique');
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement de l\'historique:', err);
      message.error('Erreur de connexion lors du chargement de l\'historique');
    } finally {
      setHistLoading(false);
    }
  };

  const handleLogout = () => {
    console.log('🔓 [LOGOUT] Déconnexion du Secrétariat Central');
    
    // Supprimer seulement les données du rôle actuel
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    
    // Ne pas supprimer les autres données (comme les tokens d'autres rôles)
    message.success('Déconnexion réussie');
    navigate('/login-secretaire');
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Demandeur',
      dataIndex: 'demandeur_nom',
      key: 'demandeur_nom'
    },
    {
      title: 'Email',
      dataIndex: 'demandeur_email',
      key: 'demandeur_email'
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => (
        <Tag color={STATUT_COLORS[statut] || 'default'}>
          {statut}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="table-actions">
          <Button
            icon={<FileTextOutlined />}
            onClick={() => showDetails(record)}
            size="small"
            type="default"
            style={{ marginRight: 6 }}
          >
            Détails
          </Button>
          
          {/* Bouton Accuser de réception - visible pour les demandes DEPOSEE */}
          {record.statut === 'DEPOSEE' && (
            <Button
              icon={<CheckCircleOutlined />}
              onClick={() => accuserReception(record.id)}
              size="small"
              type="primary"
              style={{ marginRight: 6 }}
            >
              Accuser
            </Button>
          )}
          
          {/* Bouton Transmettre au SG - visible pour les demandes RECEPTIONNEE */}
          {record.statut === 'RECEPTIONNEE' && (
            <Button
              icon={<SendOutlined />}
              onClick={() => transmettreSG(record.id)}
              size="small"
              type="primary"
              style={{ marginRight: 6 }}
            >
              Transmettre SG
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="dashboard-layout">
      <Header />
      <SecretaireSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        notifCount={Array.isArray(demandes) ? demandes.filter(d => d.statut === 'RECEPTIONNEE' && d.fichier_accuse).length : 0}
        onGotoAccuses={() => navigate('/dashboard-secretaire/accuses')}
      />
      
      <div className="dashboard-container">
        <div className="dashboard-main">
          {/* Header du tableau de bord */}
          <div className="dashboard-header">
            <h1>Tableau de bord - Secrétariat Central</h1>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchDemandes}
              loading={loading}
              type="primary"
              size="large"
            >
              Actualiser
            </Button>
          </div>

          {/* Onglet Nouvelles - Tableau de bord avec statistiques */}
          {activeTab === 'nouvelles' && (
            <DashboardStats demandes={demandes} />
          )}

          {/* Onglets Accusés et Transmissions - Tableau des demandes */}
          {activeTab !== 'nouvelles' && (
            <>
              <h2 style={{ color: '#229954', marginBottom: 12, fontSize: '1.4em', textAlign: 'left' }}>
                {activeTab === 'accuses' && '📋 Mes accusés de réception'}
                {activeTab === 'transmissions' && '📤 Mes transmissions'}
                {activeTab !== 'accuses' && activeTab !== 'transmissions' && '📋 Liste'}
              </h2>
              <div className="table-centered">
                <Table
                  columns={columns}
                  dataSource={Array.isArray(demandes) ? demandes : []}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: 'Aucune donnée' }}
                />
              </div>
            </>
          )}

          {/* Modal des détails */}
          <Modal
            title={`Détails de la demande ${selectedDemande?.reference}`}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={700}
          >
            {selectedDemande && (
              <div className="demande-details">
                <div className="detail-row">
                  <span className="detail-label">Demandeur:</span>
                  <span>{selectedDemande.demandeur_nom}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span>{selectedDemande.demandeur_email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Téléphone:</span>
                  <span>{selectedDemande.demandeur_telephone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Adresse:</span>
                  <span>{selectedDemande.demandeur_adresse}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{new Date(selectedDemande.date).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Statut:</span>
                  <Tag color={STATUT_COLORS[selectedDemande.statut] || 'default'}>
                    {selectedDemande.statut}
                  </Tag>
                </div>
                <Divider>Historique</Divider>
                {histLoading ? (
                  <Spin />
                ) : historique.length > 0 ? (
                  <ul className="historique-list">
                    {historique.map((item, index) => (
                      <li key={index}>
                        <div className="historique-date">
                          {new Date(item.date_action).toLocaleString()}
                        </div>
                        <div className="historique-action">
                          {item.action} - {item.message}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun historique disponible</p>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>

      {/* Composant d'avertissement de session */}
      <SessionWarning warningThreshold={10 * 60 * 1000} />

      <footer>
        <p>© 2025 Ministère des Mines et de l'Industrie - République Islamique de Mauritanie</p>
      </footer>
    </div>
  );
}

export default DashSecrCentral;
