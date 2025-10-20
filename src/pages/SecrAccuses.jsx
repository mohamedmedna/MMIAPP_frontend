import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Tag, Spin, message, Divider, Alert, Badge, Card, Row, Col, Statistic } from 'antd';
import {
  FileTextOutlined,
  SendOutlined,
  ReloadOutlined,
  HomeOutlined,
  LogoutOutlined,
  BellOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  AimOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/DashboardSecretaireCentral.css';

const STATUT_COLORS = {
  DEPOSEE: 'gold',
  RECEPTIONNEE: 'blue',
  TRANSMISE_AU_SG: 'cyan',
  TRANSMISE_AU_DGI: 'purple',
  REJETEE: 'red'
};
const baseUrl = window.__APP_CONFIG__.API_BASE;


function SecretaireSidebar({ onGotoDashboard, onGotoAccuses, onGotoTransmissions, onLogout, notifCount = 0 }) {
  return (
    <nav className="secretaire-sidebar">
      <div className="sidebar-header">Secrétariat Central</div>
      <div className="sidebar-link" onClick={onGotoDashboard}>
        <HomeOutlined /> Tableau de bord
      </div>
      <div className="sidebar-link active" onClick={onGotoAccuses}>
        <FileTextOutlined /> Mes accusés de réception
      </div>
      <div className="sidebar-link" onClick={onGotoTransmissions}>
        <SendOutlined /> Mes transmissions
      </div>
      <div className="sidebar-link" onClick={onGotoAccuses}>
        <BellOutlined /> Notifications <Badge count={notifCount} style={{ backgroundColor: '#faad14', marginLeft: 8 }} />
      </div>
      <div className="sidebar-link logout" onClick={onLogout}>
        <LogoutOutlined /> Déconnexion
      </div>
    </nav>
  );
}

export default function SecrAccuses() {
  const navigate = useNavigate();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [historique, setHistorique] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [stats, setStats] = useState({
    enAttente: 0,
    accusees: 0,
    autorisations: 0,
    pretesSG: 0
  });

  const fetchDemandes = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    const url = `${baseUrl}/api/demandes/accuses-reception`;
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.demandes || data.items || []);
      setDemandes(list);
    } catch (err) {
      setError(err.message);
      message.error('Erreur lors du chargement des accusés');
    } finally {
      setLoading(false);
    }
  };

  // Recalculer les statistiques quand demandes change
  useEffect(() => {
    const newStats = {
      enAttente: demandes.filter(d => d.statut === 'DEPOSEE').length,
      accusees: demandes.filter(d => d.statut === 'RECEPTIONNEE').length,
      autorisations: demandes.filter(d => d.statut === 'AUTORISATION_SIGNEE').length,
      pretesSG: demandes.filter(d => d.statut === 'RECEPTIONNEE').length
    };
    setStats(newStats);
  }, [demandes]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchHistorique = async (demandeId) => {
    setHistLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      const res = await fetch(`${baseUrl}/api/demandes/${demandeId}/historique`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setHistorique(data.historique || data || []);
    } catch (err) {
      message.error("Erreur lors du chargement de l'historique");
    } finally {
      setHistLoading(false);
    }
  };

  // Fonction pour télécharger l'accusé de réception avec le nouveau tampon
  const handleDownloadAccuse = async (demandeId) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      message.loading({ content: 'Téléchargement en cours...', key: 'download' });
      
      const response = await fetch(`${baseUrl}/api/demandes/${demandeId}/telecharger-accuse-secretaire`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `accuse_reception_${demandeId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success({ content: 'Accusé téléchargé avec succès !', key: 'download' });
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      message.error({ content: 'Erreur lors du téléchargement', key: 'download' });
    }
  };



  const transmettreSG = async (demandeId) => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      message.loading({ content: 'Transmission SG...', key: 'transmission' });
      const res = await fetch(`${baseUrl}/api/demandes/${demandeId}/transmettre-sg`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchDemandes();
      message.success({ content: 'Demande transmise au SG', key: 'transmission', duration: 3 });
    } catch (err) {
      message.error({ content: `Erreur: ${err.message}`, key: 'transmission', duration: 5 });
    }
  };

  const showDetails = (demande) => {
    setSelectedDemande(demande);
    fetchHistorique(demande.id);
    setModalVisible(true);
  };

  const columns = [
    { title: 'Référence', dataIndex: 'reference', key: 'reference', render: (t) => t || <Tag color="default">N/A</Tag> },
    { title: 'Demandeur', dataIndex: 'demandeur_nom', key: 'demandeur_nom' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
    {
      title: 'Statut', dataIndex: 'statut', key: 'statut',
      render: (s) => (<Tag color={STATUT_COLORS[s] || 'default'}>{s}</Tag>)
    },
    {
      title: 'Actions', key: 'actions',
      render: (_, record) => (
        <div className="table-actions">
          <Button icon={<FileTextOutlined />} onClick={() => showDetails(record)} size="small" type="default" style={{ marginRight: 6 }}>Détails</Button>
          
          {/* Bouton Télécharger Accusé - visible pour toutes les demandes avec accusé */}
          {record.fichier_accuse && (
            <Button 
              icon={<FileTextOutlined />} 
              onClick={() => handleDownloadAccuse(record.id)} 
              size="small" 
              type="primary"
              style={{ marginRight: 6, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            >
              Télécharger Accusé
            </Button>
          )}
          

          
          {/* Bouton Transmettre SG - visible pour les demandes RECEPTIONNEE */}
          {record.statut === 'RECEPTIONNEE' && (
            <Button icon={<SendOutlined />} onClick={() => transmettreSG(record.id)} size="small" type="primary">Transmettre SG</Button>
          )}
        </div>
      )
    }
  ];

  const notifCount = demandes.filter(d => d.statut === 'RECEPTIONNEE').length;

  const onLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login-secretaire');
  };

  return (
    <div className="dashboard-layout">
      <Header />
      <SecretaireSidebar
        onGotoDashboard={() => navigate('/dashboard-secretaire?tab=nouvelles')}
        onGotoAccuses={() => navigate('/dashboard-secretaire/accuses')}
        onGotoTransmissions={() => navigate('/dashboard-secretaire?tab=transmissions')}
        onLogout={onLogout}
        notifCount={notifCount}
      />
      <div className="dashboard-container">
        <main className="dashboard-main">
          <div className="dashboard-header" style={{ marginBottom: 16 }}>
            <h1>Mes accusés de réception</h1>
            <Button icon={<ReloadOutlined />} onClick={fetchDemandes} loading={loading}>Actualiser</Button>
          </div>
          <Divider />
          
          {/* Section des statistiques */}
          <div className="stats-section" style={{ marginBottom: 24 }}>
            <div className="stats-grid">
              <div className="stat-card">
                <Statistic
                  title="En Attente"
                  value={stats.enAttente}
                  prefix={<ClockCircleOutlined style={{ color: '#1890ff', fontSize: '2em' }} />}
                  suffix="déposées"
                  valueStyle={{ color: '#1890ff' }}
                />
              </div>
              <div className="stat-card">
                <Statistic
                  title="Accusées"
                  value={stats.accusees}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '2em' }} />}
                  suffix="réceptionnée"
                  valueStyle={{ color: '#52c41a' }}
                />
              </div>
              <div className="stat-card">
                <Statistic
                  title="Autorisations"
                  value={stats.autorisations}
                  prefix={<CheckSquareOutlined style={{ color: '#722ed1', fontSize: '2em' }} />}
                  suffix="signées"
                  valueStyle={{ color: '#722ed1' }}
                />
              </div>
            </div>

            {/* Section Actions Prioritaires */}
            <div className="priority-actions">
              <h3>
                <AimOutlined />
                Actions Prioritaires
              </h3>
              <div className="content">
                {stats.pretesSG > 0 ? (
                  <span>{stats.pretesSG} demande{stats.pretesSG > 1 ? 's' : ''} prête{stats.pretesSG > 1 ? 's' : ''} à être transmise{stats.pretesSG > 1 ? 's' : ''} au SG</span>
                ) : (
                  <span>Aucune action prioritaire pour le moment</span>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <Alert message="Erreur" description={error} type="error" showIcon />
            </div>
          )}
          
          <div className="table-centered">
            <Table
              columns={columns}
              dataSource={demandes}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'Aucun accusé pour le moment' }}
            />
          </div>

          <Modal
            title={`Détails de la demande ${selectedDemande?.reference}`}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={700}
          >
            {selectedDemande && (
              <div className="demande-details">
                <div className="detail-row"><span className="detail-label">Demandeur:</span><span>{selectedDemande.demandeur_nom}</span></div>
                <div className="detail-row"><span className="detail-label">Email:</span><span>{selectedDemande.demandeur_email}</span></div>
                <div className="detail-row"><span className="detail-label">Téléphone:</span><span>{selectedDemande.demandeur_telephone}</span></div>
                <div className="detail-row"><span className="detail-label">Adresse:</span><span>{selectedDemande.demandeur_adresse}</span></div>
                <div className="detail-row"><span className="detail-label">Date:</span><span>{new Date(selectedDemande.date).toLocaleString()}</span></div>
                <div className="detail-row"><span className="detail-label">Statut:</span><Tag color={STATUT_COLORS[selectedDemande.statut] || 'default'}>{selectedDemande.statut}</Tag></div>
                <Divider>Historique</Divider>
                {histLoading ? (
                  <Spin />
                ) : historique.length > 0 ? (
                  <ul className="historique-list">
                    {historique.map((item, index) => (
                      <li key={index}>
                        <div className="historique-date">{new Date(item.date_action).toLocaleString()}</div>
                        <div className="historique-action">{item.action} - {item.message}</div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun historique disponible</p>
                )}
              </div>
            )}
          </Modal>
        </main>
      </div>
      <Footer />
    </div>
  );
}