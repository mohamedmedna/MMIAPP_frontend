import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Spin, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import banniereMinistere from '../assets/banniere-ministere.jpg';
import '../Styles/Login.css';

const { Title, Text } = Typography;

export default function LoginCommission() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/login/commission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          mot_de_passe: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success(t('login.success'));
        navigate('/dashboard/commission');
      } else {
        message.error(data.error || t('login.error_submit'));
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(t('login.error_network'));
    } finally {
      setLoading(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="login-container">
      <Header />
      <div className="banniere-ministere" style={{ height: '120px', overflow: 'hidden' }}>
        <img 
          src={banniereMinistere} 
          alt="Bannière Ministère" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      
      <div className="login-content">
        <Row justify="center" align="middle" style={{ minHeight: '70vh' }}>
          <Col xs={24} sm={20} md={16} lg={12} xl={8}>
            <Card className="login-card">
              <div className="login-header">
                <Title level={2} className="login-title">
                  {t('logincommission.title')}
                </Title>
                <Text type="secondary" className="login-subtitle">
                  {t('logincommission.accessDenied')}
                </Text>
              </div>

              <Form
                form={form}
                name="loginCommission"
                onFinish={onFinish}
                layout="vertical"
                className="login-form"
              >
                <Form.Item
                  name="email"
                  label={t('logincommission.email')}
                  rules={[
                    {
                      required: true,
                      message: t('logincommission.error_email'),
                    },
                    {
                      type: 'email',
                      message: t('logincommission.error_email_invalid'),
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t('logincommission.email')}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={t('logincommission.password')}
                  rules={[
                    {
                      required: true,
                      message: t('logincommission.error_password'),
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder={t('logincommission.password')}
                    size="large"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="login-button"
                    block
                  >
                    {loading ? <Spin size="small" /> : t('logincommission.submit')}
                  </Button>
                </Form.Item>

                <div className="login-footer">
                  <Button
                    type="link"
                    onClick={handleBackHome}
                    icon={<ArrowLeftOutlined />}
                    className="back-home-button"
                  >
                    {t('logincommission.back_home')}
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>

      <Footer />
    </div>
  );
}
