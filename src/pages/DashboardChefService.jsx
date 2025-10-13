import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Tag, Spin, Input, notification, Tabs, Statistic, Row, Col } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  CommentOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BanniereMinistereCoupee from '../components/BanniereMinistereCoupee';
import '../Styles/DashboardChefService.css';

const { Content, Sider } = Layout;
const { TextArea } = Input;

export default function DashboardChefService() {
  const [stats, setStats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentaire, setCommentaire] = useState('');
  const [historique, setHistorique] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Récupérer le token depuis toutes les sources possibles
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token') || null;
  };
  
  const token = getToken();
  const [activeSidebarLink, setActiveSidebarLink] = useState('dashboard');

  useEffect(() => {
    console.log('🔍 [useEffect] Début du chargement initial');
    console.log('🔍 [useEffect] Token présent:', !!token);
    
    if (token) {
      // TEMPORAIRE: Charger directement les données sans vérification de token
      // pour identifier si le problème vient de la vérification
      console.log('⚠️ [Chef Service] Mode temporaire: chargement direct des données');
      loadDataDirectly();
      
      // ORIGINAL: checkTokenValidity();
    } else {
      console.error('❌ [useEffect] Pas de token, redirection vers login');
      window.location.href = '/login-chef-service';
    }
  }, [token]);

  // Fonction pour vérifier la validité du token
  const checkTokenValidity = async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        console.error('❌ [Chef Service] Aucun token trouvé, redirection vers login');
        window.location.href = '/login-chef-service';
        return;
      }

      const res = await fetch('http://localhost:4000/api/chef-service/verify-token', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      if (res.ok) {
        console.log('✅ [Chef Service] Token valide, chargement des données...');
        // Token valide, charger les données
        await Promise.all([fetchStats(), fetchNotifications(), fetchDemandes()]);
      } else {
        console.error('❌ [Chef Service] Token invalide, redirection vers login');
        // Nettoyer tous les tokens possibles
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login-chef-service';
      }
    } catch (error) {
      console.error('❌ [Chef Service] Erreur lors de la vérification du token:', error);
      // Nettoyer tous les tokens possibles
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login-chef-service';
    }
  };

  // Fonction temporaire pour charger les données directement
  const loadDataDirectly = async () => {
    try {
      console.log('🔄 [Chef Service] Chargement direct des données...');
      await Promise.all([fetchStats(), fetchNotifications(), fetchDemandes()]);
      console.log('✅ [Chef Service] Données chargées avec succès');
    } catch (error) {
      console.error('❌ [Chef Service] Erreur lors du chargement direct:', error);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 [fetchStats] Début de la requête');
      const currentToken = getToken();
      if (!currentToken) {
        console.error('❌ [Chef Service] Aucun token trouvé');
        return;
      }
      
      console.log('🔍 [fetchStats] Token:', currentToken ? 'Présent' : 'Absent');
      
      const res = await fetch('http://localhost:4000/api/chef-service/stats', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      console.log('🔍 [fetchStats] Status:', res.status);
      console.log('🔍 [fetchStats] OK:', res.ok);
      
      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      // pour identifier si le problème vient de la vérification
      if (res.status === 401) {
        console.error('❌ [Chef Service] Token expiré (mode debug - pas de redirection)');
        // Afficher des données factices pour le test
        setStats([
          { id: '1', label: 'À traiter', value: 0, icon: 'fas fa-clock', color: '#faad14' },
          { id: '2', label: 'Validées', value: 0, icon: 'fas fa-check', color: '#52c41a' },
          { id: '3', label: 'Retournées', value: 0, icon: 'fas fa-times', color: '#f5222d' },
        ]);
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ [fetchStats] Erreur:', errorText);
        notification.error({ message: 'Erreur', description: `Erreur ${res.status}: ${errorText}` });
        return;
      }
      
      const data = await res.json();
      console.log('🔍 [fetchStats] Données reçues:', data);
      
      setStats(data.stats || []);
      console.log('🔍 [fetchStats] Stats mises à jour:', data.stats || []);
    } catch (error) {
      console.error('❌ [fetchStats] Exception:', error);
      notification.error({ message: 'Erreur', description: `Erreur de connexion: ${error.message}` });
    }
  };

  const fetchNotifications = async () => {
    try {
      const currentToken = getToken();
      if (!currentToken) {
        console.error('❌ [Chef Service] Aucun token trouvé');
        return;
      }

      const res = await fetch('http://localhost:4000/api/chef-service/notifications', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      if (res.status === 401) {
        console.error('❌ [Chef Service] Token expiré (mode debug - pas de redirection)');
        // Afficher des notifications factices pour le test
        setNotifications([
          { id: 1, message: 'Aucune notification pour le moment', date: new Date().toISOString(), isNew: false }
        ]);
        return;
      }
      
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('❌ [fetchNotifications] Erreur:', error);
    }
  };

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const currentToken = getToken();
      if (!currentToken) {
        console.error('❌ [Chef Service] Aucun token trouvé');
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:4000/api/chef-service/demandes', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      // TEMPORAIRE: Ne pas rediriger automatiquement en cas d'erreur 401
      if (res.status === 401) {
        console.error('❌ [Chef Service] Token expiré (mode debug - pas de redirection)');
        // Afficher des demandes factices pour le test
        setDemandes([
          { 
            id: 1, 
            reference: 'DEM-001', 
            demandeur_nom: 'Test User', 
            demandeur_prenom: 'Test',
            type: 'Autorisation', 
            created_at: new Date().toISOString(), 
            statut: 'REÇUE' 
          }
        ]);
        return;
      }
      
      const data = await res.json();
      setDemandes(data.demandes || []);
    } catch (error) {
      console.error('❌ [fetchDemandes] Erreur:', error);
      setDemandes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistorique = async (demandeId) => {
    setHistLoading(true);
    const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demandeId}/historique`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setHistorique(data.historique || []);
    setHistLoading(false);
  };

  const handleConsulter = (demande) => {
    setSelectedDemande(demande);
    fetchHistorique(demande.id);
    setShowModal(true);
  };

  const handleCommenter = (demande) => {
    setSelectedDemande(demande);
    setCommentaire('');
    setShowCommentModal(true);
  };

  const submitCommentaire = async () => {
    if (!commentaire.trim()) {
      notification.warning({ message: 'Attention', description: 'Veuillez saisir un commentaire' });
      return;
    }
    const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${selectedDemande.id}/commentaire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ commentaire })
    });
    if (res.ok) {
      notification.success({ message: 'Succès', description: 'Commentaire ajouté' });
      setShowCommentModal(false);
      fetchDemandes();
      if (showModal) fetchHistorique(selectedDemande.id);
    } else {
      notification.error({ message: 'Erreur', description: 'Erreur lors de l\'ajout du commentaire' });
    }
  };

  const handleValider = async (demande) => {
    const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/valider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ commentaire: 'Validation Chef de Service' })
    });
    if (res.ok) {
      notification.success({ message: 'Succès', description: 'Demande validée' });
      fetchDemandes();
    } else {
      notification.error({ message: 'Erreur', description: 'Erreur lors de la validation' });
    }
  };

  const handleRetourner = (demande) => {
    Modal.confirm({
      title: 'Retourner la demande',
      content: (
        <TextArea rows={4} onChange={e => setCommentaire(e.target.value)} placeholder="Raison du retour" />
      ),
      onOk: async () => {
        if (!commentaire.trim()) {
          notification.warning({ message: 'Attention', description: 'Veuillez saisir un commentaire' });
          return;
        }
        const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/retour`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ commentaire })
        });
        if (res.ok) {
          notification.success({ message: 'Succès', description: 'Demande retournée' });
          fetchDemandes();
        } else {
          notification.error({ message: 'Erreur', description: 'Erreur lors du retour' });
        }
      }
    });
  };

  const handleTransmettre = async (demande) => {
    const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/transmettre`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      notification.success({ message: 'Succès', description: 'Demande transmise à la DDPI' });
      fetchDemandes();
    } else {
      notification.error({ message: 'Erreur', description: 'Erreur lors de la transmission' });
    }
  };

  const handleComplement = (demande) => {
    Modal.confirm({
      title: 'Demander un complément',
      content: (
        <TextArea rows={4} onChange={e => setCommentaire(e.target.value)} placeholder="Précisez les pièces manquantes" />
      ),
      onOk: async () => {
        if (!commentaire.trim()) {
          notification.warning({ message: 'Attention', description: 'Veuillez saisir un message' });
          return;
        }
        const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/complement`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message: commentaire })
        });
        if (res.ok) {
          notification.success({ message: 'Succès', description: 'Complément demandé' });
          fetchDemandes();
        } else {
          notification.error({ message: 'Erreur', description: 'Erreur lors de la demande de complément' });
        }
      }
    });
  };

  const handleRejeter = (demande) => {
    Modal.confirm({
      title: 'Rejeter la demande',
      content: (
        <TextArea rows={4} onChange={e => setCommentaire(e.target.value)} placeholder="Motif du rejet" />
      ),
      onOk: async () => {
        if (!commentaire.trim()) {
          notification.warning({ message: 'Attention', description: 'Veuillez saisir un motif' });
          return;
        }
        const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/rejeter`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ motif: commentaire })
        });
        if (res.ok) {
          notification.success({ message: 'Succès', description: 'Demande rejetée' });
          fetchDemandes();
        } else {
          notification.error({ message: 'Erreur', description: 'Erreur lors du rejet' });
        }
      }
    });
  };

  const handleReattribuer = (demande) => {
    Modal.confirm({
      title: 'Ré-attribuer la demande',
      content: (
        <Input onChange={e => setCommentaire(e.target.value)} placeholder="Email ou ID du nouvel agent" />
      ),
      onOk: async () => {
        if (!commentaire.trim()) {
          notification.warning({ message: 'Attention', description: 'Veuillez saisir un agent' });
          return;
        }
        const res = await fetch(`http://localhost:4000/api/chef-service/demandes/${demande.id}/reattribuer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ nouvel_agent: commentaire })
        });
        if (res.ok) {
          notification.success({ message: 'Succès', description: 'Demande ré-attribuée' });
          fetchDemandes();
        } else {
          notification.error({ message: 'Erreur', description: 'Erreur lors de la ré-attribution' });
        }
      }
    });
  };

  const handleLogout = () => {
    // Nettoyer tous les tokens possibles
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login-chef-service';
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: ref => ref || <Tag color="default">Aucune</Tag>,
    },
    {
      title: 'Demandeur',
      dataIndex: 'demandeur',
      key: 'demandeur',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: d => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: statut => {
        let color = 'default';
        if (statut === 'REÇUE' || statut === 'TRANSMISE_CHEF') color = 'gold';
        if (statut === 'VALIDEE_CHEF') color = 'green';
        if (statut === 'RETOURNEE') color = 'red';
        if (statut === 'TRANSMISE_A_DDPI') color = 'blue';
        return <Tag color={color}>{statut}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, demande) => (
        <>
          <Button icon={<FileTextOutlined />} onClick={() => handleConsulter(demande)} style={{ marginRight: 8 }}>Consulter</Button>
          <Button icon={<CommentOutlined />} onClick={() => handleCommenter(demande)} style={{ marginRight: 8 }}>Commenter</Button>
          <Button icon={<CheckCircleOutlined />} type="primary" onClick={() => handleValider(demande)} style={{ marginRight: 8 }} disabled={!(demande.statut === 'REÇUE' || demande.statut === 'TRANSMISE_CHEF')}>Valider</Button>
          <Button icon={<CloseCircleOutlined />} danger onClick={() => handleRetourner(demande)} style={{ marginRight: 8 }} disabled={!(demande.statut === 'REÇUE' || demande.statut === 'TRANSMISE_CHEF')}>Retourner</Button>
          <Button icon={<SendOutlined />} type="primary" onClick={() => handleTransmettre(demande)} disabled={demande.statut !== 'VALIDEE_CHEF'}>Transmettre DDPI</Button>
          <Button icon={<ExclamationCircleOutlined />} onClick={() => handleComplement(demande)} style={{ marginRight: 8 }} disabled={!(demande.statut === 'REÇUE' || demande.statut === 'TRANSMISE_CHEF')}>Complément</Button>
          <Button icon={<StopOutlined />} danger onClick={() => handleRejeter(demande)} style={{ marginRight: 8 }} disabled={!(demande.statut === 'REÇUE' || demande.statut === 'TRANSMISE_CHEF')}>Rejeter</Button>
          <Button icon={<UserSwitchOutlined />} onClick={() => handleReattribuer(demande)} style={{ marginRight: 8 }}>Ré-attribuer</Button>
        </>
      )
    }
  ];

  // Debug: Afficher les tokens dans la console
  useEffect(() => {
    console.log('🔍 [Chef Service Debug] Tokens dans localStorage:');
    console.log('adminToken:', localStorage.getItem('adminToken') ? 'Présent' : 'Absent');
    console.log('token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
    console.log('user:', localStorage.getItem('user') ? 'Présent' : 'Absent');
    console.log('Token actuel utilisé:', getToken());
  }, []);

  return (
    <>
      <Header />
      
      <div className="dashboard-chef-service-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Espace Chef de Service</h3>
            <p>Dashboard Chef de Service</p>
          </div>
          
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeSidebarLink === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSidebarLink('dashboard')}
            >
              <DashboardOutlined />
              Tableau de bord
            </button>
            
            <button
              className={`nav-item ${activeSidebarLink === 'mes-demandes' ? 'active' : ''}`}
              onClick={() => setActiveSidebarLink('mes-demandes')}
            >
              <FileTextOutlined />
              Mes demandes
            </button>
            
            <button
              className={`nav-item ${activeSidebarLink === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSidebarLink('notifications')}
            >
              <BellOutlined />
              Notifications
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={handleLogout}
            >
              <LogoutOutlined />
              Se déconnecter
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🏢 Tableau de bord Chef de Service</h1>
          </div>
          
          {activeSidebarLink === 'dashboard' && (
            <>
              {loading && <div style={{ textAlign: 'center', padding: '20px' }}><Spin size="large" /></div>}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                {console.log('🔍 [RENDER] Stats state:', stats)}
                {console.log('🔍 [RENDER] Stats length:', stats.length)}
                {stats.length > 0 ? (
                  stats.map(stat => {
                    console.log('🔍 [RENDER] Rendering stat:', stat);
                    return (
                      <Col span={6} key={stat.id}>
                        <Statistic title={stat.label} value={stat.value} valueStyle={{ color: stat.color }} />
                      </Col>
                    );
                  })
                ) : (
                  <Col span={24}>
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      Chargement des statistiques... (Stats: {JSON.stringify(stats)})
                    </div>
                  </Col>
                )}
              </Row>
            </>
          )}

          {activeSidebarLink === 'mes-demandes' && (
            <>
              <h2>Mes demandes</h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <div style={{ marginTop: '16px', color: '#666' }}>Chargement des demandes...</div>
                </div>
              ) : (
                <Table 
                  dataSource={demandes} 
                  columns={columns} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }}
                  locale={{ 
                    emptyText: demandes.length === 0 ? 'Aucune demande trouvée' : 'Chargement...' 
                  }}
                />
              )}
            </>
          )}

          {activeSidebarLink === 'notifications' && (
            <>
              <h2>Notifications</h2>
              <Table
                dataSource={notifications}
                columns={[
                  { title: 'Message', dataIndex: 'message', key: 'message' },
                  { title: 'Date', dataIndex: 'date', key: 'date', render: d => new Date(d).toLocaleString() },
                  { title: 'Statut', dataIndex: 'isNew', key: 'isNew', render: isNew => isNew ? <Tag color="red">Nouveau</Tag> : <Tag color="green">Lu</Tag> }
                ]}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            </>
          )}

          {/* Modals */}
          <Modal
            title="Détail de la demande"
            open={showModal}
            onCancel={() => setShowModal(false)}
            footer={null}
            width={800}
          >
            {selectedDemande && (
              <div>
                <h3>Référence: {selectedDemande.reference}</h3>
                <p><strong>Demandeur:</strong> {selectedDemande.demandeur}</p>
                <p><strong>Type:</strong> {selectedDemande.type}</p>
                <p><strong>Date:</strong> {new Date(selectedDemande.created_at).toLocaleString()}</p>
                <p><strong>Statut:</strong> {selectedDemande.statut}</p>
                <h4>Données de la demande</h4>
                <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
                  {JSON.stringify(selectedDemande.donnees, null, 2)}
                </pre>
                <h4>Historique</h4>
                {histLoading ? <Spin /> : (
                  <Table
                    dataSource={historique}
                    columns={[
                      { title: 'Action', dataIndex: 'action', key: 'action' },
                      { title: 'Message', dataIndex: 'message', key: 'message' },
                      { title: 'Date', dataIndex: 'date_action', key: 'date_action', render: d => new Date(d).toLocaleString() },
                      { title: 'Statut précédent', dataIndex: 'statut_precedent', key: 'statut_precedent' },
                      { title: 'Nouveau statut', dataIndex: 'nouveau_statut', key: 'nouveau_statut' }
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                  />
                )}
              </div>
            )}
          </Modal>

          <Modal
            title="Ajouter un commentaire"
            open={showCommentModal}
            onOk={submitCommentaire}
            onCancel={() => setShowCommentModal(false)}
          >
            <TextArea
              rows={4}
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              placeholder="Saisissez votre commentaire..."
            />
          </Modal>
        </div>
      </div>
      
      <Footer />
    </>
  );
}
