import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Card, Space, message } from 'antd';
import { LockOutlined, EyeOutlined, EyeInvisibleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../Styles/AdminCodeVerification.css';

const { Title, Text } = Typography;

export default function AdminCodeVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:4000/api/verify-admin-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessCode: values.accessCode }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(t('adminCodeVerification.success'));
        // Marquer que le code a été vérifié pour cette session
        localStorage.setItem('adminCodeVerified', 'true');
        // Rediriger vers AdminSpace
        navigate('/adminspace');
      } else {
        setError(data.message || t('adminCodeVerification.error_invalid'));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setError(t('adminCodeVerification.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="admin-code-verification-page">
      <Header />
      
      <div className="verification-container">
        <Card className="verification-card">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <LockOutlined style={{ fontSize: '3rem', color: '#1890ff', marginBottom: '20px' }} />
              <Title level={2} style={{ color: '#1890ff', marginBottom: '10px' }}>
                {t('adminCodeVerification.title')}
              </Title>
              <Text type="secondary" style={{ fontSize: '1rem' }}>
                {t('adminCodeVerification.description')}
              </Text>
            </div>

            {error && (
              <Alert
                message={error}
                type="error"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}

            <Form
              form={form}
              name="verification"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="accessCode"
                rules={[
                  { required: true, message: t('adminCodeVerification.error_required') }
                ]}
              >
                <Input.Password
                  placeholder={t('adminCodeVerification.placeholder')}
                  prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                  suffix={
                    <Button
                      type="text"
                      icon={showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ border: 'none' }}
                    />
                  }
                  size="large"
                  onPressEnter={() => form.submit()}
                  autoFocus
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    width: '100%',
                    height: '45px',
                    background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  {loading ? t('adminCodeVerification.verifying') : t('adminCodeVerification.verify')}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center' }}>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToHome}
                style={{ color: '#666' }}
              >
                {t('adminCodeVerification.back_home')}
              </Button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                {t('adminCodeVerification.help')}
              </Text>
            </div>
          </Space>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}
