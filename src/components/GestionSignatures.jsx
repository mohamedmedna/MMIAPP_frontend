import React, { useState, useEffect } from 'react';
import { Button, message, Card, List, Avatar, Space, Modal, Form, Input, Select, Popconfirm, Typography, Divider, Row, Col, Statistic } from 'antd';
import { UploadOutlined, FileTextOutlined, DeleteOutlined, EyeOutlined, SignatureOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import '../Styles/GestionSignatures.css';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const GestionSignatures = ({ user }) => {
  const { t } = useTranslation();
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  const fetchSignatures = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/ministere/signatures', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSignatures(data.signatures || []);
      } else {
        message.error(t('gestionSignatures.errors.fetchError'));
      }
    } catch (error) {
      console.error('Erreur:', error);
      message.error(t('gestionSignatures.errors.connectionError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignatures();
  }, []);

  const handleUpload = async (values) => {
    setUploading(true);
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const formData = new FormData();
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput && fileInput.files[0]) {
        formData.append('signature', fileInput.files[0]);
        formData.append('type_signature', values.type_signature);
        formData.append('commentaire', values.commentaire || '');
      } else {
        message.error(t('gestionSignatures.errors.fileRequired'));
        setUploading(false);
        return;
      }

      const response = await fetch('http://localhost:4000/api/ministere/signatures/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        message.success(t('gestionSignatures.success.uploadSuccess'));
        setUploadModalVisible(false);
        uploadForm.resetFields();
        fetchSignatures();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || t('gestionSignatures.errors.uploadError'));
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      message.error(t('gestionSignatures.errors.connectionError'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (signatureId) => {
    try {
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/ministere/signatures/${signatureId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        message.success(t('gestionSignatures.success.deleteSuccess'));
        fetchSignatures();
      } else {
        const errorData = await response.json();
        message.error(errorData.error || t('gestionSignatures.errors.deleteError'));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
      message.error(t('gestionSignatures.errors.connectionError'));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return t('gestionSignatures.fileSize.zeroBytes');
    const k = 1024;
    const sizes = [t('gestionSignatures.fileSize.bytes'), t('gestionSignatures.fileSize.kb'), t('gestionSignatures.fileSize.mb'), t('gestionSignatures.fileSize.gb')];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSignatureIcon = (type) => {
    switch (type) {
      case 'AUTORISATION':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'ACCUSE':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'DOCUMENT_OFFICIEL':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      default:
        return <SignatureOutlined style={{ color: '#666' }} />;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'ACTIVE':
        return '#52c41a';
      case 'INACTIVE':
        return '#faad14';
      case 'ARCHIVED':
        return '#666';
      default:
        return '#666';
    }
  };

  return (
    <div className="gestion-signatures">
      <Title level={2}>
        <SignatureOutlined /> {t('gestionSignatures.title')}
      </Title>
      
      <Text type="secondary">
        {t('gestionSignatures.description')}
      </Text>

      <Divider />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('gestionSignatures.stats.totalSignatures')}
              value={signatures.length}
              prefix={<SignatureOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('gestionSignatures.stats.activeSignatures')}
              value={signatures.filter(s => s.statut === 'ACTIVE').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('gestionSignatures.stats.differentTypes')}
              value={new Set(signatures.map(s => s.type_signature)).size}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Button
        type="primary"
        icon={<UploadOutlined />}
        size="large"
        onClick={() => setUploadModalVisible(true)}
        style={{ marginBottom: 24 }}
      >
        {t('gestionSignatures.actions.uploadNew')}
      </Button>

      <Card title={t('gestionSignatures.mySignatures')} loading={loading}>
        {signatures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <SignatureOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: 16 }} />
            <Text type="secondary">{t('gestionSignatures.empty.noSignatures')}</Text>
            <br />
            <Text type="secondary">{t('gestionSignatures.empty.startUpload')}</Text>
          </div>
        ) : (
          <List
            dataSource={signatures}
            renderItem={(signature) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => window.open(`http://localhost:4000/uploads/${signature.fichier_signature}`, '_blank')}
                  >
                    {t('gestionSignatures.actions.view')}
                  </Button>,
                  <Popconfirm
                    title={t('gestionSignatures.confirm.deleteTitle')}
                    onConfirm={() => handleDelete(signature.id)}
                    okText={t('gestionSignatures.confirm.yes')}
                    cancelText={t('gestionSignatures.confirm.no')}
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                    >
                      {t('gestionSignatures.actions.delete')}
                    </Button>
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getSignatureIcon(signature.type_signature)}
                      size="large"
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{signature.nom_fichier_original}</Text>
                      <span
                        style={{
                          backgroundColor: getStatusColor(signature.statut),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}
                      >
                        {signature.statut}
                      </span>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">
                        {t('gestionSignatures.details.type')}: {signature.type_signature}
                      </Text>
                      <Text type="secondary">
                        {t('gestionSignatures.details.size')}: {formatFileSize(signature.taille_fichier)}
                      </Text>
                      <Text type="secondary">
                        {t('gestionSignatures.details.uploadDate')}: {new Date(signature.date_creation).toLocaleDateString('fr-FR')}
                      </Text>
                      {signature.commentaire && (
                        <Text type="secondary">
                          {t('gestionSignatures.details.comment')}: {signature.commentaire}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      <Modal
        title={t('gestionSignatures.modal.uploadTitle')}
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={handleUpload}
        >
          <Form.Item
            name="type_signature"
            label={t('gestionSignatures.form.typeLabel')}
            rules={[{ required: true, message: t('gestionSignatures.form.typeRequired') }]}
          >
            <Select placeholder={t('gestionSignatures.form.typePlaceholder')}>
              <Option value="AUTORISATION">{t('gestionSignatures.types.autorisation')}</Option>
              <Option value="ACCUSE">{t('gestionSignatures.types.accuse')}</Option>
              <Option value="DOCUMENT_OFFICIEL">{t('gestionSignatures.types.documentOfficiel')}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="signature_file"
            label={t('gestionSignatures.form.fileLabel')}
            rules={[{ required: true, message: t('gestionSignatures.form.fileRequired') }]}
          >
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.gif,.svg,.pdf"
              style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px' }}
            />
            <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
              {t('gestionSignatures.form.acceptedFormats')}
            </Text>
          </Form.Item>

          <Form.Item
            name="commentaire"
            label={t('gestionSignatures.form.commentLabel')}
          >
            <TextArea
              rows={3}
              placeholder={t('gestionSignatures.form.commentPlaceholder')}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={uploading}
                icon={<UploadOutlined />}
              >
                {uploading ? t('gestionSignatures.form.uploading') : t('gestionSignatures.form.uploadButton')}
              </Button>
              <Button onClick={() => setUploadModalVisible(false)}>
                {t('gestionSignatures.form.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GestionSignatures;
