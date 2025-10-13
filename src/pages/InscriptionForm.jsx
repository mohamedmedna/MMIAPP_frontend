import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Divider, Select, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, IdcardOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/Inscription.css';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function InscriptionFormAntd() {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formeJuridique, setFormeJuridique] = useState('');
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(t('inscription.success'));
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || t('inscription.error_submit'));
      }
    } catch {
      setError(t('inscription.error_network'));
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="banniere-ministere" style={{ height: '120px', overflow: 'hidden' }}>
        <img 
          src={banniereMinistere} 
          alt="Bannière Ministère" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div className="inscription-container">
        <div className="inscription-intro">
          <Title level={2} style={{ color: '#1e6a8e', fontWeight: 'bold' }}>MMIAPP</Title>
          <Title level={4} style={{ color: '#7fa22b' }}>
            {t('homepage.subtitle')}
          </Title>
          <Text style={{ fontSize: 18, fontWeight: 500, color: '#333' }}>
            {t('homepage.title_ar')}
          </Text>
          <br />
          <Text style={{ fontSize: 14, fontWeight: 400, color: '#666' }}>
            {t('homepage.sous_titre')}
          </Text>
          <Divider style={{ borderColor: '#1e6a8e', margin: '24px 0' }} />
          <Title level={3} style={{ color: '#1e6a8e' }}>{t('inscription.create_account')}</Title>
        </div>

        <div className="inscription-antd-form-container">
          {message && <Alert message={message} type="success" showIcon style={{ marginBottom: 16 }} />}
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form
            layout="vertical"
            size="large"
            onFinish={onFinish}
            className="inscription-antd-form"
          >
            <Form.Item
              label={t('inscription.nom_entreprise')}
              name="nom_entreprise"
              rules={[{ required: true, message: t('inscription.error_nom_entreprise') }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('inscription.nom_entreprise')} />
            </Form.Item>
            <Form.Item
              label={t('inscription.nom_responsable')}
              name="nom_responsable"
              rules={[{ required: true, message: t('inscription.error_nom_responsable') }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('inscription.nom_responsable')} />
            </Form.Item>
            <Form.Item
              label={t('inscription.prenom_responsable')}
              name="prenom_responsable"
              rules={[{ required: true, message: t('inscription.error_prenom_responsable') }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t('inscription.prenom_responsable')} />
            </Form.Item>
            <Form.Item
              label={t('inscription.email')}
              name="email"
              rules={[
                { required: true, message: t('inscription.error_email') },
                { type: 'email', message: t('inscription.error_email_invalid') }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder={t('inscription.email')} />
            </Form.Item>
            <Form.Item
              label={t('inscription.mot_de_passe')}
              name="mot_de_passe"
              rules={[{ required: true, message: t('inscription.error_mot_de_passe') }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('inscription.mot_de_passe')} />
            </Form.Item>
            
            <Form.Item
              label={t('inscription.confirmation_mot_de_passe')}
              name="confirmation_mot_de_passe"
              dependencies={['mot_de_passe']}
              rules={[
                { required: true, message: t('inscription.error_confirmation_mot_de_passe') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('mot_de_passe') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error(t('inscription.error_mots_de_passe_differents')));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t('inscription.confirmation_mot_de_passe')} />
            </Form.Item>
            
            <Form.Item
              label={t('inscription.email_recuperation')}
              name="email_recuperation"
              rules={[
                { required: true, message: t('inscription.error_email_recuperation') },
                { type: 'email', message: t('inscription.error_email_invalid') }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder={t('inscription.email_recuperation')} />
            </Form.Item>
            
            <Form.Item
              label={t('inscription.telephone')}
              name="telephone"
              rules={[{ required: true, message: t('inscription.error_telephone') }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder={t('inscription.telephone')} />
            </Form.Item>
            
            <Form.Item
              label={t('inscription.nif')}
              name="nif"
              rules={[{ required: true, message: t('inscription.error_nif') }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder={t('inscription.nif')} />
            </Form.Item>
            
            <Form.Item
              label={t('inscription.forme_juridique')}
              name="forme_juridique"
              rules={[{ required: true, message: t('inscription.error_forme_juridique') }]}
            >
              <Select 
                placeholder={t('inscription.select_forme_juridique')}
                onChange={(value) => setFormeJuridique(value)}
              >
                <Select.Option value="SA">SA</Select.Option>
                <Select.Option value="SARL">SARL</Select.Option>
                <Select.Option value="SUARL">SUARL</Select.Option>
                <Select.Option value="AUTRES">AUTRES</Select.Option>
              </Select>
            </Form.Item>
            
            {formeJuridique === 'AUTRES' && (
              <Form.Item
                label={t('inscription.forme_juridique_autre')}
                name="forme_juridique_autre"
                rules={[{ required: true, message: t('inscription.error_forme_juridique_autre') }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder={t('inscription.forme_juridique_autre_placeholder')}
                />
              </Form.Item>
            )}
            <Form.Item
              label={t('inscription.adresse_siege')}
              name="adresse_siege"
              rules={[{ required: true, message: t('inscription.error_adresse_siege') }]}
            >
              <Input prefix={<HomeOutlined />} placeholder={t('inscription.adresse_siege')} />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="inscription-antd-button"
              >
                {t('inscription.submit')}
              </Button>
            </Form.Item>
          </Form>
          <div className="inscription-antd-links">
            <Link to="/login" className="inscription-antd-link">{t('inscription.already_account')}</Link>
            <span> | </span>
            <Link to="/" className="inscription-antd-link home">{t('inscription.back_home')}</Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
