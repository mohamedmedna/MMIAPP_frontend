import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ArrowLeftOutlined,
  ReloadOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { 
  Card, 
  Steps, 
  Button, 
  List, 
  Tag, 
  Spin, 
  Typography, 
  Space, 
  Divider,
  Modal,
  Descriptions,
  Empty,
  Progress
} from 'antd';
import '../Styles/SuiviDemandes.css';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Step } = Steps;

export default function SuiviDemandes({ user, logout }) {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fonction pour charger les demandes
  const loadDemandes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    if (!showLoading) setRefreshing(true);
    
    try {
      const response = await fetch(`http://localhost:4000/api/mes-demandes?user_id=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDemandes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
      setDemandes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDemandes();
  }, [user.id]);

  const handleRefresh = () => {
    loadDemandes(false);
  };

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return { color: '#faad14', backgroundColor: '#fff7e6' };
      case 'EN_COURS':
        return { color: '#1890ff', backgroundColor: '#e6f7ff' };
      case 'APPROUVEE':
        return { color: '#52c41a', backgroundColor: '#f6ffed' };
      case 'REFUSEE':
        return { color: '#ff4d4f', backgroundColor: '#fff2f0' };
      case 'COMPLETEE':
        return { color: '#722ed1', backgroundColor: '#f9f0ff' };
      default:
        return { color: '#8c8c8c', backgroundColor: '#f5f5f5' };
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE':
        return 'En attente';
      case 'EN_COURS':
        return 'En cours de traitement';
      case 'APPROUVEE':
        return 'Approuvée';
      case 'REFUSEE':
        return 'Refusée';
      case 'COMPLETEE':
        return 'Complétée';
      default:
        return statut;
    }
  };

  const getStepsForDemande = (demande) => {
    const steps = [
      {
        title: 'Soumission',
        description: 'Demande soumise',
        status: 'finish',
        icon: <CheckCircleOutlined />
      },
      {
        title: 'Accusé de réception',
        description: demande.fichier_accuse ? 'Reçu' : 'En attente',
        status: demande.fichier_accuse ? 'finish' : 'wait',
        icon: demande.fichier_accuse ? <CheckCircleOutlined /> : <ClockCircleOutlined />
      },
      {
        title: 'Examen',
        description: demande.statut === 'EN_COURS' ? 'En cours' : 'En attente',
        status: demande.statut === 'EN_COURS' ? 'process' : 'wait',
        icon: demande.statut === 'EN_COURS' ? <ClockCircleOutlined /> : <ClockCircleOutlined />
      },
      {
        title: 'Décision',
        description: demande.statut === 'APPROUVEE' || demande.statut === 'REFUSEE' ? 'Terminé' : 'En attente',
        status: demande.statut === 'APPROUVEE' || demande.statut === 'REFUSEE' ? 'finish' : 'wait',
        icon: demande.statut === 'APPROUVEE' || demande.statut === 'REFUSEE' ? <CheckCircleOutlined /> : <ClockCircleOutlined />
      }
    ];

    if (demande.statut === 'APPROUVEE' && demande.fichier_autorisation) {
      steps.push({
        title: 'Autorisation',
        description: 'Document disponible',
        status: 'finish',
        icon: <CheckCircleOutlined />
      });
    }

    return steps;
  };

  const getProgressPercentage = (demande) => {
    const steps = getStepsForDemande(demande);
    const completedSteps = steps.filter(step => step.status === 'finish').length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const handleViewDetails = (demande) => {
    setSelectedDemande(demande);
    setModalVisible(true);
  };

  const handleDownloadAccuse = async (reference) => {
    try {
      const response = await fetch(`http://localhost:4000/api/download-accuse/${reference}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accuse_${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const handleDownloadAutorisation = async (reference) => {
    try {
      const response = await fetch(`http://localhost:4000/api/download-autorisation/${reference}`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autorisation_${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (loading) {
    return (
      <>
        <Header user={user} logout={logout} />
        <div className="suivi-demandes-container">
          <div className="left-panel">
            <div className="sidebar-header">
              <h3>Suivi des Demandes</h3>
              <p>Suivi et progression</p>
            </div>
          </div>
          <div className="main-section">
            <div className="loading-container">
              <Spin size="large" />
              <Text>Chargement du suivi des demandes...</Text>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header user={user} logout={logout} />
      
      <div className="suivi-demandes-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Suivi des Demandes</h3>
            <p>Suivi et progression</p>
          </div>
          
          <nav className="sidebar-nav">
            <button 
              className="nav-item"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-arrow-left" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
            
            <button className="nav-item active">
              <i className="fa fa-road" style={{ marginRight: '8px' }}></i>
              Suivi des demandes
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/nouvelle-demande')}
            >
              <i className="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Nouvelle demande
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/mes-demandes')}
            >
              <i className="fa fa-list" style={{ marginRight: '8px' }}></i>
              Mes demandes
            </button>
            
            <button 
              className="nav-item"
              onClick={() => navigate('/notifications')}
            >
              <i className="fa fa-bell" style={{ marginRight: '8px' }}></i>
              Notifications
            </button>
          </nav>

          {/* Bouton de déconnexion */}
          <div className="sidebar-footer">
            <button
              className="nav-item deconnexion-btn"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fa fa-sign-out" style={{ marginRight: '8px' }}></i>
              Retour au Dashboard
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
          <div className="dashboard-header">
            <h1 className="dashboard-title">🛣️ Suivi des Demandes</h1>
          </div>
          
          <div className="dashboard-content">
            <div className="suivi-demandes-page">
              <div className="page-header">
                <Button 
                  type="link" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/dashboard')}
                  className="back-button"
                >
                  Retour au dashboard
                </Button>
                
                <Title level={2} className="page-title">
                  Mes demandes d'autorisation
                </Title>
                
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={handleRefresh}
                  loading={refreshing}
                  type="primary"
                >
                  Actualiser
                </Button>
              </div>

              <div className="demandes-content">
                {demandes.length === 0 ? (
                  <Card className="empty-state-card">
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Aucune demande déposée."
                    />
                  </Card>
                ) : (
                  <List
                    dataSource={demandes}
                    renderItem={(demande, index) => (
                      <List.Item key={demande.id} className="demande-item">
                        <Card className="demande-card">
                          <div className="demande-header">
                            <div className="demande-title-row">
                              <Title level={4} className="demande-title">
                                Demande {demande.reference}
                              </Title>
                              <Tag style={getStatutStyle(demande.statut)}>
                                {getStatutLabel(demande.statut)}
                              </Tag>
                            </div>
                            
                            <Text type="secondary">
                              Soumise le {new Date(demande.created_at).toLocaleDateString('fr-FR')}
                            </Text>
                          </div>

                          <div className="demande-progress">
                            <Progress 
                              percent={getProgressPercentage(demande)} 
                              status="active"
                              strokeColor="#1890ff"
                            />
                          </div>

                          <div className="demande-steps">
                            <Steps 
                              direction="horizontal" 
                              size="small"
                              current={getStepsForDemande(demande).findIndex(step => step.status === 'process')}
                            >
                              {getStepsForDemande(demande).map((step, index) => (
                                <Step
                                  key={index}
                                  title={step.title}
                                  description={step.description}
                                  status={step.status}
                                  icon={step.icon}
                                />
                              ))}
                            </Steps>
                          </div>

                          <div className="demande-actions">
                            <Space>
                              <Button 
                                type="primary" 
                                icon={<EyeOutlined />}
                                onClick={() => handleViewDetails(demande)}
                              >
                                Voir détails
                              </Button>
                              
                              {demande.fichier_accuse && (
                                <Button 
                                  icon={<DownloadOutlined />}
                                  onClick={() => handleDownloadAccuse(demande.reference)}
                                >
                                  Télécharger accusé
                                </Button>
                              )}
                              
                              {(demande.statut === 'AUTORISATION_SIGNEE' || demande.statut === 'CLOTUREE') && demande.autorisation_pdf && (
                                <Button 
                                  type="success"
                                  icon={<DownloadOutlined />}
                                  onClick={() => handleDownloadAutorisation(demande.reference)}
                                >
                                  Télécharger autorisation
                                </Button>
                              )}
                            </Space>
                          </div>
                        </Card>
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour les détails de la demande */}
      <Modal
        title={`Détails de la demande ${selectedDemande?.reference}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Fermer
          </Button>
        ]}
        width={800}
      >
        {selectedDemande && (
          <div className="demande-details">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Référence" span={2}>
                {selectedDemande.reference}
              </Descriptions.Item>
              <Descriptions.Item label="Statut">
                <Tag style={getStatutStyle(selectedDemande.statut)}>
                  {getStatutLabel(selectedDemande.statut)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Date de soumission">
                {new Date(selectedDemande.created_at).toLocaleDateString('fr-FR')}
              </Descriptions.Item>
              <Descriptions.Item label="Type de projet" span={2}>
                {selectedDemande.type_projet || 'Non spécifié'}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {selectedDemande.description || 'Aucune description'}
              </Descriptions.Item>
              <Descriptions.Item label="Documents soumis" span={2}>
                {selectedDemande.documents ? (
                  <ul>
                    {selectedDemande.documents.split(',').map((doc, index) => (
                      <li key={index}>{doc.trim()}</li>
                    ))}
                  </ul>
                ) : 'Aucun document'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
      
      <Footer />
    </>
  );
}
