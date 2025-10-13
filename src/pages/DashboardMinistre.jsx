import React, { useState, useEffect } from 'react';
import { Layout, Menu, Table, Button, Modal, Tag, Spin, Input, notification, Row, Col, Upload, Radio, Space, Card, Statistic } from 'antd';
import { DashboardOutlined, FileTextOutlined, BellOutlined, LogoutOutlined, CheckCircleOutlined, CloseCircleOutlined, DownloadOutlined, EyeOutlined, SignatureOutlined, UploadOutlined, SendOutlined } from '@ant-design/icons';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BanniereMinistereCoupee from '../components/BanniereMinistereCoupee';
import '../Styles/DashboardMinistre.css';

const { Content, Sider } = Layout;
const { TextArea } = Input;

const safeParseJSON = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.warn('Impossible de parser le JSON:', value);
    return {};
  }
};

export default function DashboardMinistre() {
  const [activeSidebarLink, setActiveSidebarLink] = useState('dashboard');
  const [dossiers, setDossiers] = useState([]);
  const [dossiersSignes, setDossiersSignes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signatureType, setSignatureType] = useState('electronic');
  const [signatureFile, setSignatureFile] = useState(null);
  const [signatureText, setSignatureText] = useState('');
  const [stats, setStats] = useState({ total: 0, enAttente: 0, signees: 0 });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewPDF, setPreviewPDF] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const token = localStorage.getItem('adminToken');

  // Auth check
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role_id !== 9) {
      window.location.href = '/login-ministre';
      return;
    }
    
    // Charger les données seulement si authentifié
    fetchDossiers();
    fetchNotifications();
    fetchStats();
  }, [token]);

  const fetchDossiers = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:4000/api/ministere/dossiers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        window.location.href = '/login-ministre';
        return;
      }
      
      const data = await res.json();
      setDossiers(data.dossiers || []);
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Impossible de charger les dossiers' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDossiersSignes = async () => {
    if (!token) return;
    
    try {
      const res = await fetch('http://localhost:4000/api/ministere/dossiers-signes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        window.location.href = '/login-ministre';
        return;
      }
      
      const data = await res.json();
      setDossiersSignes(data.dossiers || []);
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Impossible de charger les dossiers signés' });
    }
  };

  const fetchNotifications = async () => {
    if (!token) return;
    
    try {
      const res = await fetch('http://localhost:4000/api/ministere/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        window.location.href = '/login-ministre';
        return;
      }
      
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Impossible de charger les notifications' });
    }
  };

  const fetchStats = async () => {
    if (!token) return;
    
    try {
      const res = await fetch('http://localhost:4000/api/ministere/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        window.location.href = '/login-ministre';
        return;
      }
      
      const data = await res.json();
      setStats(data.stats || { total: 0, enAttente: 0, signees: 0 });
    } catch (err) {
      // Stats optionnelles, pas d'erreur critique
    }
  };

  const handleConsulter = async (dossier) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ministere/dossiers/${dossier.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
      if (!res.ok) throw new Error('Erreur lors du chargement du dossier');
      const data = await res.json();
      setSelectedDossier({
        ...data,
        donnees: safeParseJSON(data.donnees),
        fichiers: safeParseJSON(data.fichiers)
      });
        setShowModal(true);
    } catch (err) {
      notification.error({ message: 'Erreur', description: err.message });
    }
  };

  const handleVoirDocuments = async (dossier) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ministere/dossiers/${dossier.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Erreur lors du chargement du dossier');
      const data = await res.json();
      
      // Ouvrir une nouvelle fenêtre pour afficher les documents
      const documentsWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      documentsWindow.document.write(`
        <html>
          <head>
            <title>Documents du dossier ${data.reference}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .document { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
              .document h3 { color: #1890ff; margin-top: 0; }
              .document a { display: inline-block; margin: 10px 10px 10px 0; padding: 8px 16px; background: #1890ff; color: white; text-decoration: none; border-radius: 4px; }
              .document a:hover { background: #40a9ff; }
              .no-docs { color: #666; font-style: italic; }
            </style>
          </head>
          <body>
            <h1>📄 Documents transmis par la DGI - ${data.reference}</h1>
            <p><strong>Demandeur:</strong> ${data.prenom} ${data.nom}</p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Statut:</strong> ${data.statut}</p>
            
            <h2>📁 Fichiers transmis</h2>
            ${data.fichiers && Object.keys(data.fichiers).length > 0 ? 
              Object.entries(data.fichiers).map(([key, filename]) => `
                <div class="document">
                  <h3>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                  <a href="http://localhost:4000/uploads/${filename}" target="_blank">📄 Voir le document</a>
                  <a href="http://localhost:4000/uploads/${filename}" download="${filename}">⬇️ Télécharger</a>
                </div>
              `).join('') :
              '<p class="no-docs">Aucun fichier transmis</p>'
            }
            
            <h2>📋 Données de la demande</h2>
            ${data.donnees && Object.keys(data.donnees).length > 0 ? 
              `<ul>${Object.entries(data.donnees).map(([key, value]) => 
                `<li><strong>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> ${value}</li>`
              ).join('')}</ul>` :
              '<p class="no-docs">Aucune donnée supplémentaire</p>'
            }
          </body>
        </html>
      `);
      documentsWindow.document.close();
    } catch (err) {
      notification.error({ message: 'Erreur', description: err.message });
    }
  };

  const handleSigner = (dossier) => {
    setSelectedDossier(dossier);
    setShowSignatureModal(true);
  };

  const submitSignature = async () => {
    if (!selectedDossier) return;

    let signatureData = null;
    
    if (signatureType === 'upload' && signatureFile) {
      // Convertir le fichier en base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        signatureData = e.target.result;
        await generatePreview(signatureData);
      };
      reader.readAsDataURL(signatureFile);
    } else if (signatureType === 'electronic' && signatureText.trim()) {
      signatureData = signatureText;
      await generatePreview(signatureData);
    } else {
      notification.warning({ message: 'Attention', description: 'Veuillez fournir une signature' });
      return;
    }
  };

  const generatePreview = async (signatureData) => {
    setPreviewLoading(true);
    try {
      console.log('🔍 [FRONTEND] Génération prévisualisation PDF...');
      
      const res = await fetch(`http://localhost:4000/api/ministere/dossiers/${selectedDossier.id}/preview-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          signature_type: signatureType,
          signature_data: signatureData
        })
      });

      console.log(`📡 [FRONTEND] Réponse reçue: ${res.status} ${res.statusText}`);
      console.log(`📋 [FRONTEND] Content-Type: ${res.headers.get('content-type')}`);
      
      if (res.ok) {
        // Vérifier le type de contenu
        const contentType = res.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
          // Réponse PDF binaire - convertir en base64
          const pdfBlob = await res.blob();
          const reader = new FileReader();
          
          reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Enlever le préfixe data:application/pdf;base64,
            setPreviewPDF(base64);
            setShowSignatureModal(false);
            setShowPreviewModal(true);
            console.log('✅ [FRONTEND] PDF converti en base64 et affiché');
          };
          
          reader.readAsDataURL(pdfBlob);
        } else {
          // Réponse JSON (erreur)
          const data = await res.json();
          notification.error({ 
            message: 'Erreur', 
            description: data.error || 'Format de réponse inattendu' 
          });
        }
      } else {
        // Erreur HTTP
        try {
          const data = await res.json();
          notification.error({ 
            message: 'Erreur', 
            description: data.error || `Erreur ${res.status}: ${res.statusText}` 
          });
        } catch (parseError) {
          notification.error({ 
            message: 'Erreur', 
            description: `Erreur ${res.status}: ${res.statusText}` 
          });
        }
      }
    } catch (err) {
      console.error('❌ [FRONTEND] Erreur réseau:', err);
      notification.error({ 
        message: 'Erreur réseau', 
        description: 'Erreur lors de la génération de la prévisualisation. Vérifiez la connexion au serveur.' 
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmAndSend = async () => {
    if (!selectedDossier) return;

    let signatureData = null;
    
    if (signatureType === 'upload' && signatureFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        signatureData = e.target.result;
        await processSignature(signatureData);
      };
      reader.readAsDataURL(signatureFile);
    } else if (signatureType === 'electronic' && signatureText.trim()) {
      signatureData = signatureText;
      await processSignature(signatureData);
    }
  };

  const processSignature = async (signatureData) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ministere/dossiers/${selectedDossier.id}/signer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          signature_type: signatureType,
          signature_data: signatureData
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        notification.success({ 
          message: 'Succès', 
          description: 'Autorisation signée avec succès. Le demandeur a été notifié.' 
        });
        setShowSignatureModal(false);
        setShowModal(false);
    setSelectedDossier(null);
        setSignatureFile(null);
        setSignatureText('');
    fetchDossiers();
    fetchNotifications();
        fetchStats();
      } else {
        notification.error({ message: 'Erreur', description: data.error || 'Erreur lors de la signature' });
      }
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Erreur réseau lors de la signature' });
    }
  };

  const handleDownload = async (reference) => {
    try {
      const res = await fetch(`http://localhost:4000/api/ministere/autorisations/${reference}/download`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reference}_autorisation.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        notification.error({ message: 'Erreur', description: 'Impossible de télécharger l\'autorisation' });
      }
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Erreur réseau' });
    }
  };

  const handleDownloadAutorisation = async (reference) => {
    try {
      const res = await fetch(`http://localhost:4000/api/download-autorisation/${reference}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autorisation_${reference}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        notification.success({ 
          message: 'Succès', 
          description: 'Autorisation téléchargée avec succès' 
        });
      } else {
        const errorData = await res.json();
        notification.error({ 
          message: 'Erreur', 
          description: errorData.error || 'Impossible de télécharger l\'autorisation' 
        });
      }
    } catch (err) {
      notification.error({ message: 'Erreur', description: 'Erreur réseau lors du téléchargement' });
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    window.location.href = '/login-ministre';
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: ref => <Tag color="blue">{ref}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Demandeur',
      dataIndex: 'demandeur_nom',
      key: 'demandeur',
      render: (_, record) => `${record.demandeur_nom} ${record.demandeur_prenom}`,
    },
    {
      title: 'Date Transmission',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: statut => {
        const getColor = (statut) => {
          switch (statut) {
            case 'AUTORISATION_SIGNEE': return 'green';
            case 'TRANSMISE_AU_MINISTRE': return 'orange';
            case 'TRANSMISE_MINISTERE': return 'orange';
            case 'EN_ATTENTE_SIGNATURE': return 'blue';
            default: return 'default';
          }
        };
        const getText = (statut) => {
          switch (statut) {
            case 'AUTORISATION_SIGNEE': return 'Signé';
            case 'TRANSMISE_AU_MINISTRE': return 'En attente';
            case 'TRANSMISE_MINISTERE': return 'En attente';
            case 'EN_ATTENTE_SIGNATURE': return 'À signer';
            default: return statut;
          }
        };
        return <Tag color={getColor(statut)}>{getText(statut)}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, dossier) => (
        <Space>
          <Button 
            icon={<FileTextOutlined />} 
            onClick={() => handleVoirDocuments(dossier)}
            size="small"
            type="default"
          >
            Documents
          </Button>
          <Button 
            icon={<SignatureOutlined />} 
            type="primary"
            onClick={() => handleSigner(dossier)}
            size="small"
          >
            Signer
          </Button>
        </Space>
      ),
    },
  ];

  const columnsSignes = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: ref => <Tag color="blue">{ref}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Demandeur',
      dataIndex: 'demandeur_nom',
      key: 'demandeur',
      render: (_, record) => `${record.demandeur_nom} ${record.demandeur_prenom}`,
    },
    {
      title: 'Date Signature',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: date => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: () => <Tag color="green">Signé</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, dossier) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            type="default"
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
            onClick={() => handleDownloadAutorisation(dossier.reference)}
            size="small"
          >
            Télécharger
          </Button>
        </Space>
      ),
    },
  ];

  const notificationColumns = [
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: ref => ref ? <Tag color="blue">{ref}</Tag> : '-',
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: date => new Date(date).toLocaleString(),
    },
    {
      title: 'Lu',
      dataIndex: 'lu',
      key: 'lu',
      render: lu => lu ? <Tag color="green">Lu</Tag> : <Tag color="orange">Non lu</Tag>,
    },
  ];

  return (
    <>
      <Header />
      
      <div className="dashboard-ministre-container">
        {/* Left Panel - Sidebar */}
        <div className="left-panel">
          <div className="sidebar-header">
            <h3>Espace Ministre</h3>
            <p>Dashboard Ministre</p>
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
              className={`nav-item ${activeSidebarLink === 'dossiers' ? 'active' : ''}`}
              onClick={() => setActiveSidebarLink('dossiers')}
            >
              <FileTextOutlined />
              Dossiers à signer
            </button>
            
            <button
              className={`nav-item ${activeSidebarLink === 'dossiers-signes' ? 'active' : ''}`}
              onClick={() => setActiveSidebarLink('dossiers-signes')}
            >
              <CheckCircleOutlined />
              Dossiers signés
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
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main Section - Contenu principal */}
        <div className="main-section">
            {activeSidebarLink === 'dashboard' && (
              <>
              <h1>Tableau de bord - Ministre</h1>
              <Row gutter={24} style={{ marginBottom: 30 }}>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Total Dossiers"
                      value={stats.total}
                      valueStyle={{ color: '#1e3a8a' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="En attente de signature"
                      value={stats.enAttente}
                      valueStyle={{ color: '#faad14' }}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card>
                    <Statistic
                      title="Autorisations signées"
                      value={stats.signees}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
              </Row>
              
              <Card title="Dernières notifications" style={{ marginTop: 20 }}>
                {notifications.slice(0, 5).map(n => (
                  <div key={n.id} style={{ 
                    padding: '10px 0', 
                    borderBottom: '1px solid #f0f0f0',
                    fontWeight: n.lu ? 'normal' : 'bold'
                  }}>
                    <div>{n.message}</div>
                    <small style={{ color: '#666' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </Card>
            </>
          )}

          {activeSidebarLink === 'dossiers' && (
            <>
              <h2>Dossiers transmis par la DGI</h2>
              {loading ? (
                <Spin size="large" />
              ) : (
                <Table 
                  columns={columns} 
                  dataSource={dossiers} 
                  rowKey="id" 
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: "Aucun dossier en attente de signature." }}
                />
                )}
              </>
            )}

          {activeSidebarLink === 'dossiers-signes' && (
            <>
              <h2>Dossiers signés</h2>
              <Button 
                onClick={fetchDossiersSignes}
                style={{ marginBottom: 16 }}
              >
                Actualiser
              </Button>
              <Table 
                columns={columnsSignes} 
                dataSource={dossiersSignes} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Aucun dossier signé." }}
              />
            </>
          )}

            {activeSidebarLink === 'notifications' && (
            <>
                <h2>Notifications</h2>
              <Table 
                columns={notificationColumns} 
                dataSource={notifications} 
                rowKey="id" 
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Aucune notification." }}
              />
            </>
          )}
        </div>
      </div>

      {/* Modal de détail du dossier */}
      <Modal
        title={`Détail du dossier ${selectedDossier?.reference || ''}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Fermer
          </Button>,
          ...(selectedDossier?.statut !== 'AUTORISATION_SIGNEE' ? [
            <Button 
              key="sign" 
              type="primary" 
              icon={<SignatureOutlined />}
              onClick={() => {
                setShowModal(false);
                setShowSignatureModal(true);
              }}
            >
              Signer l'autorisation
            </Button>
          ] : [
            <Button 
              key="info" 
              type="default" 
              disabled
              style={{ backgroundColor: '#52c41a', color: 'white', borderColor: '#52c41a' }}
            >
              ✅ Déjà signé
            </Button>
          ])
        ]}
        width={800}
      >
        {selectedDossier && (
          <div className="dossier-details">
            <h3>Informations du demandeur</h3>
            <ul>
              <li><strong>Nom :</strong> {selectedDossier.demandeur_nom} {selectedDossier.demandeur_prenom}</li>
              <li><strong>Email :</strong> {selectedDossier.demandeur_email}</li>
              <li><strong>Téléphone :</strong> {selectedDossier.demandeur_telephone || 'Non renseigné'}</li>
              <li><strong>Adresse :</strong> {selectedDossier.demandeur_adresse || 'Non renseignée'}</li>
            </ul>

            <h3>Informations de la demande</h3>
            <ul>
              <li><strong>Référence :</strong> {selectedDossier.reference}</li>
              <li><strong>Type :</strong> {selectedDossier.type}</li>
              <li><strong>Date de dépôt :</strong> {new Date(selectedDossier.created_at).toLocaleString()}</li>
            </ul>

            <h3>Données de la demande</h3>
            {selectedDossier.donnees && Object.keys(selectedDossier.donnees).length > 0 ? (
              <ul>
                {Object.entries(selectedDossier.donnees).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} :</strong> {value}
                    </li>
                  ))}
                </ul>
            ) : (
              <p>Aucune donnée spécifique.</p>
            )}

            <h3>Pièces jointes transmises par la DGI</h3>
            {selectedDossier.fichiers && Object.keys(selectedDossier.fichiers).length > 0 ? (
              <div>
                {Object.entries(selectedDossier.fichiers).map(([key, value]) => (
                  <a 
                    key={key}
                    href={`http://localhost:4000/uploads/${value}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="file-link"
                  >
                    <DownloadOutlined /> {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </a>
                ))}
              </div>
            ) : (
              <p>Aucune pièce jointe.</p>
            )}
          </div>
        )}
      </Modal>

      {/* Modal de signature */}
      <Modal
        title="Signature de l'autorisation"
        open={showSignatureModal}
        onCancel={() => setShowSignatureModal(false)}
        onOk={submitSignature}
        okText="Prévisualiser"
        cancelText="Annuler"
        width={600}
      >
        <div className="signature-section">
          <h3>Choisir le type de signature</h3>
          <Radio.Group value={signatureType} onChange={e => setSignatureType(e.target.value)}>
            <Space direction="vertical">
              <Radio value="electronic">Signature électronique</Radio>
              <Radio value="upload">Upload de signature</Radio>
            </Space>
          </Radio.Group>

          {signatureType === 'electronic' && (
            <div style={{ marginTop: 20 }}>
              <h4>Signature électronique</h4>
              <TextArea
                rows={4}
                placeholder="Saisissez votre signature électronique..."
                value={signatureText}
                onChange={e => setSignatureText(e.target.value)}
              />
            </div>
          )}

          {signatureType === 'upload' && (
            <div style={{ marginTop: 20 }}>
              <h4>Upload de signature</h4>
              <Upload
                beforeUpload={(file) => {
                  setSignatureFile(file);
                  return false;
                }}
                accept="image/*"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Sélectionner une image de signature</Button>
              </Upload>
              {signatureFile && (
                <p style={{ marginTop: 10, color: '#52c41a' }}>
                  ✓ Fichier sélectionné : {signatureFile.name}
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: 20, padding: 15, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
            <h4>Information</h4>
            <p>Cliquez sur "Prévisualiser" pour générer un aperçu de l'autorisation avec votre signature. 
            Vous pourrez ensuite valider et envoyer l'autorisation au demandeur.</p>
          </div>
        </div>
      </Modal>

      {/* Modal de prévisualisation PDF */}
      <Modal
        title="Prévisualisation de l'autorisation"
        open={showPreviewModal}
        onCancel={() => setShowPreviewModal(false)}
        onOk={confirmAndSend} // Utiliser confirmAndSend pour la validation
        okText="Signer et envoyer"
        cancelText="Annuler"
        width={800}
        footer={[
          <Button key="close" onClick={() => setShowPreviewModal(false)}>
            Fermer
          </Button>,
          <Button 
            key="sign" 
            type="primary" 
            icon={<SignatureOutlined />}
            onClick={confirmAndSend}
            loading={previewLoading}
          >
            {previewLoading ? 'Génération...' : 'Signer et envoyer'}
          </Button>
        ]}
      >
        {previewPDF ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <h3>Prévisualisation de l'autorisation signée</h3>
            <iframe
              src={`data:application/pdf;base64,${previewPDF}`}
              style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}
            ></iframe>
      </div>
        ) : (
          <Spin tip="Génération de la prévisualisation..." />
        )}
      </Modal>
      
      <Footer />
    </>
  );
}
