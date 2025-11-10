import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Table, 
  Tag, 
  Space, 
  Modal, 
  Form, 
  Input, 
  message, 
  Alert, 
  Spin, 
  Row, 
  Col, 
  Statistic,
  Descriptions,
  Divider,
  Timeline,
  Badge,
  Tooltip
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BuildingOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  DownloadOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/AdminRenouvellements.css';
import { useTranslation } from 'react-i18next';

const { TextArea } = Input;

function AdminRenouvellements({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const baseUrl = window.__APP_CONFIG__.API_BASE;
  
  const [renouvellements, setRenouvellements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRenouvellement, setSelectedRenouvellement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [form] = Form.useForm();
  const [processingAction, setProcessingAction] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    soumis: 0,
    en_cours_dgi: 0,
    chez_ddpi: 0,
    valides: 0,
    rejetes: 0
  });

  useEffect(() => {
    loadRenouvellements();
  }, []);

  const loadRenouvellements = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/api/admin/renouvellements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRenouvellements(data.renouvellements || []);
        calculateStats(data.renouvellements || []);
      } else {
        message.error('Erreur lors du chargement des renouvellements');
      }
    } catch (error) {
      console.error('Erreur chargement renouvellements:', error);
      message.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const statsData = {
      total: data.length,
      soumis: data.filter(r => r.statut === 'SOUMIS').length,
      en_cours_dgi: data.filter(r => r.statut === 'EN_COURS_DGI').length,
      chez_ddpi: data.filter(r => r.statut === 'TRANSMIS_DDPI').length,
      valides: data.filter(r => r.statut === 'AUTORISE').length,
      rejetes: data.filter(r => r.statut === 'REJETE').length
    };
    setStats(statsData);
  };

  const getStatutTag = (statut) => {
    const statuts = {
      'SOUMIS': { color: 'blue', text: 'Soumis', icon: <ClockCircleOutlined /> },
      'EN_COURS_DGI': { color: 'orange', text: 'Chez DGI', icon: <BuildingOutlined /> },
      'TRANSMIS_DDPI': { color: 'cyan', text: 'Chez DDPI', icon: <BuildingOutlined /> },
      'VALIDE_DDPI': { color: 'green', text: 'Validé DDPI', icon: <CheckCircleOutlined /> },
      'TRANSMIS_MINISTRE': { color: 'purple', text: 'Chez Ministre', icon: <UserOutlined /> },
      'AUTORISE': { color: 'success', text: 'Autorisé', icon: <CheckCircleOutlined /> },
      'REJETE': { color: 'error', text: 'Rejeté', icon: <CloseCircleOutlined /> }
    };
    
    const config = statuts[statut] || { color: 'default', text: statut, icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getActionsForStatut = (statut, roleId) => {
    const actions = [];
    
    if (statut === 'SOUMIS' && roleId === 6) { // DGI
      actions.push(
        <Button 
          key="transmettre" 
          type="primary" 
          size="small"
          onClick={() => handleAction('transmettre', 'TRANSMIS_DDPI')}
        >
          Transmettre à DDPI
        </Button>
      );
    }
    
    if (statut === 'TRANSMIS_DDPI' && roleId === 7) { // DDPI
      actions.push(
        <Button 
          key="valider" 
          type="primary" 
          size="small"
          onClick={() => handleAction('valider', 'VALIDE_DDPI')}
        >
          Valider
        </Button>
      );
    }
    
    if (['SOUMIS', 'EN_COURS_DGI', 'TRANSMIS_DDPI'].includes(statut) && [6, 7].includes(roleId)) {
      actions.push(
        <Button 
          key="rejeter" 
          danger 
          size="small"
          onClick={() => handleAction('rejeter', 'REJETE')}
        >
          Rejeter
        </Button>
      );
    }
    
    if (statut === 'VALIDE_DDPI' && roleId === 6) { // DGI peut transmettre au ministre
      actions.push(
        <Button 
          key="transmettre_ministre" 
          type="primary" 
          size="small"
          onClick={() => handleAction('transmettre_ministre', 'TRANSMIS_MINISTRE')}
        >
          Transmettre au Ministre
        </Button>
      );
    }
    
    return actions;
  };

  const handleAction = (action, newStatut) => {
    setActionType(action);
    setActionModalVisible(true);
    form.setFieldsValue({ newStatut });
  };

  const handleVoirDetails = async (renouvellementId) => {
    try {
      const response = await fetch(`${baseUrl}/api/renouvellement/details/${renouvellementId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedRenouvellement(data);
        setModalVisible(true);
      } else {
        message.error('Erreur lors du chargement des détails');
      }
    } catch (error) {
      console.error('Erreur chargement détails:', error);
      message.error('Erreur de connexion');
    }
  };

  const handleConfirmAction = async () => {
    setProcessingAction(true);
    try {
      const values = await form.validateFields();
      
      let endpoint = '';
      if (actionType === 'valider') {
        endpoint = `/api/admin/renouvellement/${selectedRenouvellement.id}/valider`;
      } else if (actionType === 'rejeter') {
        endpoint = `/api/admin/renouvellement/${selectedRenouvellement.id}/rejeter`;
      } else {
        // Pour les transmissions
        endpoint = `/api/admin/renouvellement/${selectedRenouvellement.id}/transmettre`;
      }

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('Action effectuée avec succès');
        setActionModalVisible(false);
        setModalVisible(false);
        loadRenouvellements();
      } else {
        const data = await response.json();
        message.error(data.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error('Erreur action:', error);
      message.error('Erreur lors de l\'action');
    } finally {
      setProcessingAction(false);
    }
  };

  const handleImprimer = async (renouvellement) => {
    try {
      const response = await fetch(`${baseUrl}/api/admin/renouvellement/${renouvellement.id}/impression`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Erreur lors de la génération du PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `renouvellement-${renouvellement.reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success('PDF généré avec succès');
    } catch (error) {
      console.error('Erreur impression:', error);
      message.error(error.message || 'Impossible de générer le PDF');
    }
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text) => <strong>{text}</strong>,
      width: 150
    },
    {
      title: 'Demande Originale',
      dataIndex: ['demande', 'reference'],
      key: 'demande_reference',
      render: (text) => <code>{text}</code>,
      width: 150
    },
    {
      title: 'Entreprise',
      dataIndex: ['entreprise', 'denomination'],
      key: 'denomination',
      render: (text) => text || 'Non spécifié',
      width: 200
    },
    {
      title: 'Demandeur',
      dataIndex: ['demandeur', 'nom'],
      key: 'demandeur',
      render: (_, record) => (
        <div>
          <div>{record.demandeur?.prenom} {record.demandeur?.nom}</div>
          <small style={{ color: '#666' }}>{record.demandeur?.email}</small>
        </div>
      ),
      width: 180
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => getStatutTag(statut),
      width: 120
    },
    {
      title: 'Date Soumission',
      dataIndex: 'date_soumission',
      key: 'date_soumission',
      render: (date) => new Date(date).toLocaleDateString('fr-FR'),
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Voir les détails">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleVoirDetails(record.id)}
            />
          </Tooltip>
          {user?.role_id === 6 && (
            <Tooltip title="Imprimer le formulaire">
              <Button
                icon={<PrinterOutlined />}
                size="small"
                onClick={() => handleImprimer(record)}
              />
            </Tooltip>
          )}
          {getActionsForStatut(record.statut, user.role_id).map(action => 
            React.cloneElement(action, { 
              key: `${action.key}-${record.id}`,
              onClick: () => {
                setSelectedRenouvellement(record);
                action.props.onClick();
              }
            })
          )}
        </Space>
      ),
      width: 200
    }
  ];

  if (loading) {
    return (
      <div className="admin-renouvellements-container">
        <Header />
        <div className="loading-container">
          <Spin size="large" />
          <p>Chargement des renouvellements...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="admin-renouvellements-container">
      <Header />
      
      <div className="admin-renouvellements-content">
        <div className="page-header">
          <h1>🔄 Gestion des Renouvellements</h1>
          <p>Administration des renouvellements d'enregistrement d'usines</p>
          
          <Space>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={loadRenouvellements}
            >
              Actualiser
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={() => message.info('Export en cours de développement')}
            >
              Exporter
            </Button>
          </Space>
        </div>

        {/* Statistiques */}
        <Row gutter={16} style={{ marginBottom: '30px' }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="Total"
                value={stats.total}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Soumis"
                value={stats.soumis}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Chez DGI"
                value={stats.en_cours_dgi}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Chez DDPI"
                value={stats.chez_ddpi}
                valueStyle={{ color: '#06b6d4' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Validés"
                value={stats.valides}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="Rejetés"
                value={stats.rejetes}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table des renouvellements */}
        <Card title="📋 Liste des Renouvellements" className="renouvellements-table">
          <Table
            columns={columns}
            dataSource={renouvellements}
            rowKey="id"
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} sur ${total} renouvellements`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Modal de détails */}
        <Modal
          title="Détails du Renouvellement"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          width={800}
          footer={[
            <Button key="close" onClick={() => setModalVisible(false)}>
              Fermer
            </Button>
          ]}
        >
          {selectedRenouvellement && (
            <div>
              <Descriptions title="Informations Générales" bordered column={2}>
                <Descriptions.Item label="Référence" span={2}>
                  <strong>{selectedRenouvellement.reference}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Demande Originale">
                  {selectedRenouvellement.demande?.reference}
                </Descriptions.Item>
                <Descriptions.Item label="Statut">
                  {getStatutTag(selectedRenouvellement.statut)}
                </Descriptions.Item>
                <Descriptions.Item label="Date Soumission">
                  {new Date(selectedRenouvellement.date_soumission).toLocaleString('fr-FR')}
                </Descriptions.Item>
                <Descriptions.Item label="Date Validation">
                  {selectedRenouvellement.date_validation ? 
                    new Date(selectedRenouvellement.date_validation).toLocaleString('fr-FR') : 
                    'Non validé'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Demandeur" span={2}>
                  {selectedRenouvellement.demandeur?.prenom} {selectedRenouvellement.demandeur?.nom}
                  <br />
                  <small>{selectedRenouvellement.demandeur?.email}</small>
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <h4>📋 Données du Formulaire</h4>
              <div className="form-data-preview">
                {selectedRenouvellement.donnees_formulaire && (
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '15px', 
                    borderRadius: '8px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedRenouvellement.donnees_formulaire, null, 2)}
                  </pre>
                )}
              </div>

              {selectedRenouvellement.motif_rejet && (
                <>
                  <Divider />
                  <Alert
                    message="Motif du Rejet"
                    description={selectedRenouvellement.motif_rejet}
                    type="error"
                    showIcon
                  />
                </>
              )}

              {selectedRenouvellement.observations && (
                <>
                  <Divider />
                  <Alert
                    message="Observations"
                    description={selectedRenouvellement.observations}
                    type="info"
                    showIcon
                  />
                </>
              )}
            </div>
          )}
        </Modal>

        {/* Modal d'action */}
        <Modal
          title={`${actionType === 'valider' ? 'Valider' : actionType === 'rejeter' ? 'Rejeter' : 'Transmettre'} le Renouvellement`}
          open={actionModalVisible}
          onCancel={() => setActionModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setActionModalVisible(false)}>
              Annuler
            </Button>,
            <Button 
              key="confirm" 
              type="primary" 
              loading={processingAction}
              onClick={handleConfirmAction}
            >
              Confirmer
            </Button>
          ]}
        >
          <Form form={form} layout="vertical">
            {actionType === 'rejeter' && (
              <Form.Item
                label="Motif du Rejet"
                name="motif_rejet"
                rules={[{ required: true, message: 'Le motif du rejet est obligatoire' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Expliquez les raisons du rejet..."
                />
              </Form.Item>
            )}
            
            {(actionType === 'valider' || actionType.includes('transmettre')) && (
              <Form.Item
                label="Observations"
                name="observations"
              >
                <TextArea 
                  rows={3} 
                  placeholder="Ajoutez des observations (optionnel)..."
                />
              </Form.Item>
            )}
          </Form>
        </Modal>
      </div>

      <Footer />
    </div>
  );
}

export default AdminRenouvellements;


