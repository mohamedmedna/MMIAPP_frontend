import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Input, 
  Select, 
  message, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Tag, 
  Space,
  Typography,
  Divider,
  Badge
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  SendOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../Styles/DashboardDRMNE.css';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function DashboardDRMNE() {
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('nouvelles');
  
  // États pour les modals
  const [modalComplement, setModalComplement] = useState(false);
  const [modalRejet, setModalRejet] = useState(false);
  const [modalTransmission, setModalTransmission] = useState(false);
  const [modalValidation, setModalValidation] = useState(false);
  const [modalHistorique, setModalHistorique] = useState(false);
  
  // États pour les actions
  const [demandeAction, setDemandeAction] = useState(null);
  const [messageComplement, setMessageComplement] = useState('');
  const [motifRejet, setMotifRejet] = useState('');
  const [cibleTransmission, setCibleTransmission] = useState('MMI');
  const [observationsTransmission, setObservationsTransmission] = useState('');
  const [observationsValidation, setObservationsValidation] = useState('');
  const [historique, setHistorique] = useState([]);

  // Récupérer le token DRMNE
  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  // Récupérer les demandes selon le statut
  const fetchDemandes = async (statut = 'TOUTES') => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes?statut=${statut}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemandes(data.demandes || []);
      } else {
        message.error('Erreur lors de la récupération des demandes');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/drmne/demandes?statut=TOUTES', {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const total = data.total || 0;
        const enCours = data.demandes?.filter(d => d.statut === 'EN_COURS_TRAITEMENT').length || 0;
        const piecesManquantes = data.demandes?.filter(d => d.statut === 'PIECES_MANQUANTES').length || 0;
        const validees = data.demandes?.filter(d => d.statut === 'EN_ATTENTE_SIGNATURE').length || 0;
        
        setStats({ total, enCours, piecesManquantes, validees });
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };

  useEffect(() => {
    fetchDemandes(activeTab);
    fetchStats();
  }, [activeTab]);

  // Demander un complément
  const handleDemanderComplement = async () => {
    if (!messageComplement.trim()) {
      message.warning('Veuillez saisir un message');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes/${demandeAction.id}/demander-complement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ message: messageComplement })
      });

      if (response.ok) {
        message.success('Complément demandé avec succès');
        setModalComplement(false);
        setMessageComplement('');
        fetchDemandes(activeTab);
        fetchStats();
      } else {
        message.error('Erreur lors de la demande de complément');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    }
  };

  // Rejeter une demande
  const handleRejeter = async () => {
    if (!motifRejet.trim()) {
      message.warning('Veuillez saisir un motif de rejet');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes/${demandeAction.id}/rejeter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ motif: motifRejet })
      });

      if (response.ok) {
        message.success('Demande rejetée avec succès');
        setModalRejet(false);
        setMotifRejet('');
        fetchDemandes(activeTab);
        fetchStats();
      } else {
        message.error('Erreur lors du rejet');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    }
  };

  // Transmettre une demande
  const handleTransmettre = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes/${demandeAction.id}/transmettre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ 
          cible: cibleTransmission, 
          observations: observationsTransmission 
        })
      });

      if (response.ok) {
        message.success(`Demande transmise vers ${cibleTransmission} avec succès`);
        setModalTransmission(false);
        setCibleTransmission('MMI');
        setObservationsTransmission('');
        fetchDemandes(activeTab);
        fetchStats();
      } else {
        message.error('Erreur lors de la transmission');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    }
  };

  // Valider une demande
  const handleValider = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes/${demandeAction.id}/valider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ observations: observationsValidation })
      });

      if (response.ok) {
        message.success('Demande validée avec succès');
        setModalValidation(false);
        setObservationsValidation('');
        fetchDemandes(activeTab);
        fetchStats();
      } else {
        message.error('Erreur lors de la validation');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    }
  };

  // Récupérer l'historique
  const handleVoirHistorique = async (demande) => {
    try {
      const response = await fetch(`http://localhost:4000/api/drmne/demandes/${demande.id}/historique`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorique(data.historique || []);
        setDemandeAction(demande);
        setModalHistorique(true);
      } else {
        message.error('Erreur lors de la récupération de l\'historique');
      }
    } catch (error) {
      message.error('Erreur de connexion');
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Demandeur',
      dataIndex: 'demandeur',
      key: 'demandeur',
      render: (text) => <Text>{text}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'demandeur_email',
      key: 'demandeur_email',
      render: (text) => <Text copyable>{text}</Text>
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        const statusConfig = {
          'DEPOSEE': { color: 'blue', text: 'Déposée' },
          'EN_COURS_TRAITEMENT': { color: 'processing', text: 'En cours' },
          'PIECES_MANQUANTES': { color: 'warning', text: 'Pièces manquantes' },
          'EN_ATTENTE_SIGNATURE': { color: 'success', text: 'En attente signature' },
          'REJETEE': { color: 'error', text: 'Rejetée' },
          'TRANSMISE_AU_DGI': { color: 'cyan', text: 'Transmise DGI' },
          'TRANSMISE_AU_MINISTRE': { color: 'purple', text: 'Transmise Ministère' }
        };
        
        const config = statusConfig[statut] || { color: 'default', text: statut };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Date dépôt',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <Text>{new Date(date).toLocaleDateString('fr-FR')}</Text>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => handleVoirHistorique(record)}
          >
            Historique
          </Button>
          
          {record.statut === 'DEPOSEE' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDemandeAction(record);
                  setModalValidation(true);
                }}
              >
                Valider
              </Button>
              <Button 
                type="default" 
                size="small" 
                icon={<SendOutlined />}
                onClick={() => {
                  setDemandeAction(record);
                  setModalTransmission(true);
                }}
              >
                Transmettre
              </Button>
            </>
          )}
          
          {record.statut === 'EN_COURS_TRAITEMENT' && (
            <Button 
              type="warning" 
              size="small" 
              icon={<ExclamationCircleOutlined />}
              onClick={() => {
                setDemandeAction(record);
                setModalComplement(true);
              }}
            >
              Demander complément
            </Button>
          )}
          
          <Button 
            danger 
            size="small" 
            icon={<CloseCircleOutlined />}
            onClick={() => {
              setDemandeAction(record);
              setModalRejet(true);
            }}
          >
            Rejeter
          </Button>
        </Space>
      )
    }
  ];

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login-secretaire-central';
  };

  return (
    <div className="dashboard-drmne-page">
      <div className="dashboard-header">
        <Title level={2}>Dashboard DRMNE/PMNE</Title>
        <Button type="primary" danger onClick={handleLogout}>
          Déconnexion
        </Button>
      </div>

      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total demandes"
              value={stats.total || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="En cours"
              value={stats.enCours || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pièces manquantes"
              value={stats.piecesManquantes || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="En attente signature"
              value={stats.validees || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Onglets */}
      <div className="dashboard-tabs">
        <Button 
          type={activeTab === 'nouvelles' ? 'primary' : 'default'}
          onClick={() => setActiveTab('nouvelles')}
        >
          Nouvelles demandes
        </Button>
        <Button 
          type={activeTab === 'en_cours' ? 'primary' : 'default'}
          onClick={() => setActiveTab('en_cours')}
        >
          En cours
        </Button>
        <Button 
          type={activeTab === 'pieces_manquantes' ? 'primary' : 'default'}
          onClick={() => setActiveTab('pieces_manquantes')}
        >
          Pièces manquantes
        </Button>
        <Button 
          type={activeTab === 'validees' ? 'primary' : 'default'}
          onClick={() => setActiveTab('validees')}
        >
          Validées
        </Button>
      </div>

      {/* Tableau des demandes */}
      <Table
        columns={columns}
        dataSource={demandes}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} demandes`
        }}
      />

      {/* Modal Demander complément */}
      <Modal
        title="Demander des pièces complémentaires"
        open={modalComplement}
        onOk={handleDemanderComplement}
        onCancel={() => setModalComplement(false)}
        okText="Demander"
        cancelText="Annuler"
      >
        <TextArea
          rows={4}
          placeholder="Décrivez les pièces ou informations manquantes..."
          value={messageComplement}
          onChange={(e) => setMessageComplement(e.target.value)}
        />
      </Modal>

      {/* Modal Rejet */}
      <Modal
        title="Rejeter la demande"
        open={modalRejet}
        onOk={handleRejeter}
        onCancel={() => setModalRejet(false)}
        okText="Rejeter"
        cancelText="Annuler"
        okButtonProps={{ danger: true }}
      >
        <TextArea
          rows={4}
          placeholder="Motif du rejet..."
          value={motifRejet}
          onChange={(e) => setMotifRejet(e.target.value)}
        />
      </Modal>

      {/* Modal Transmission */}
      <Modal
        title="Transmettre la demande"
        open={modalTransmission}
        onOk={handleTransmettre}
        onCancel={() => setModalTransmission(false)}
        okText="Transmettre"
        cancelText="Annuler"
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Cible de transmission :</Text>
          <Select
            value={cibleTransmission}
            onChange={setCibleTransmission}
            style={{ width: '100%', marginTop: 8 }}
          >
            <Option value="MMI">Ministère (MMI)</Option>
            <Option value="DGI">Direction Générale de l'Industrie (DGI)</Option>
          </Select>
        </div>
        <div>
          <Text strong>Observations :</Text>
          <TextArea
            rows={3}
            placeholder="Observations ou commentaires..."
            value={observationsTransmission}
            onChange={(e) => setObservationsTransmission(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>

      {/* Modal Validation */}
      <Modal
        title="Valider la demande"
        open={modalValidation}
        onOk={handleValider}
        onCancel={() => setModalValidation(false)}
        okText="Valider"
        cancelText="Annuler"
      >
        <TextArea
          rows={4}
          placeholder="Observations de validation..."
          value={observationsValidation}
          onChange={(e) => setObservationsValidation(e.target.value)}
        />
      </Modal>

      {/* Modal Historique */}
      <Modal
        title={`Historique - ${demandeAction?.reference}`}
        open={modalHistorique}
        onCancel={() => setModalHistorique(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {historique.map((item, index) => (
            <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text strong>{item.action}</Text>
                <Text type="secondary">{new Date(item.date_action).toLocaleString('fr-FR')}</Text>
              </div>
              {item.utilisateur && (
                <Text type="secondary">Par: {item.utilisateur}</Text>
              )}
              {item.message && (
                <div style={{ marginTop: 8 }}>
                  <Text>{item.message}</Text>
                </div>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
