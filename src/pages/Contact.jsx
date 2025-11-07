import React, { useState } from "react";
import { Form, Input, Button, Alert, Typography, Select, message } from "antd";
import { UserOutlined, MailOutlined, PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";
import banniereMinistere from "../assets/banniere-ministere.jpg";
import "../Styles/Contact.css";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Contact() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const baseUrl = window.__APP_CONFIG__?.API_BASE;
  const primaryContact = t("contact.primary_contact", { returnObjects: true }) || {};
  const secondaryContact = t("contact.secondary_contact", { returnObjects: true }) || {};

  const onFinish = async (values) => {
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`${baseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        message.success(t("contact.success_message"));
        form.resetFields();
      } else {
        setError(data.error || t("contact.error_message"));
      }
    } catch (error) {
      setError(t("contact.error_network"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Header />
      
      <div className="banniere-ministere">
        <img src={banniereMinistere} alt="Bannière Ministère" />
      </div>

      <div className="contact-container">
        <div className="contact-intro">
          <Title level={2}>{t("contact.title")}</Title>
          <Paragraph className="contact-description">
            {t("contact.description")}
          </Paragraph>
        </div>

        <div className="contact-content">
          <div className="contact-info-section">
            <Title level={3}>{t("contact.info_title")}</Title>
            
            <div className="contact-info-item">
              <div className="contact-info-icon">
                <MailOutlined />
              </div>
              <div className="contact-info-content">
                <Text strong>{t("contact.email_label")}</Text>
              <Text>{t("contact.email_value")}</Text>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <PhoneOutlined />
              </div>
              <div className="contact-info-content">
                <Text strong>{t("contact.phone_label")}</Text>
              <Text>{t("contact.phone_value")}</Text>
              </div>
            </div>

          <div className="contact-info-item">
            <div className="contact-info-icon">
              <i className="fas fa-mail-bulk"></i>
            </div>
            <div className="contact-info-content">
              <Text strong>{t("contact.postal_label")}</Text>
              <Text>{t("contact.postal_value")}</Text>
            </div>
          </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <div className="contact-info-content">
                <Text strong>{t("contact.address_label")}</Text>
                <Text>{t("contact.address_value")}</Text>
              </div>
            </div>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="contact-info-content">
                <Text strong>{t("contact.hours_label")}</Text>
                <Text>{t("contact.hours_value")}</Text>
              </div>
            </div>

          <div className="contact-people">
            {[primaryContact, secondaryContact]
              .filter((contact) => contact && Object.keys(contact).length > 0)
              .map((contact, index) => (
                <div key={index} className="contact-person-card">
                  {contact.title && (
                    <h4 className="contact-person-title">{contact.title}</h4>
                  )}

                  {contact.name && (
                    <div className="contact-person-line">
                      <Text strong className="contact-person-label">
                        {t("contact.person_name_label")}
                      </Text>
                      <Text>{contact.name}</Text>
                    </div>
                  )}

                  {contact.role && (
                    <div className="contact-person-line">
                      <Text strong className="contact-person-label">
                        {t("contact.person_structure_label")}
                      </Text>
                      <Text>{contact.role}</Text>
                    </div>
                  )}

                  {Array.isArray(contact.phones) &&
                    contact.phones.map((phone, idx) => (
                      <div key={idx} className="contact-person-line">
                        <Text strong className="contact-person-label">
                          {t("contact.phone_with_index", { index: idx + 1 })}
                        </Text>
                        <Text>{phone}</Text>
                      </div>
                    ))}

                  {contact.email && (
                    <div className="contact-person-line">
                      <Text strong className="contact-person-label">
                        {t("contact.person_email_label")}
                      </Text>
                      <Text>{contact.email}</Text>
                    </div>
                  )}
                </div>
              ))}
          </div>

            <div className="contact-social">
              <Title level={4}>{t("contact.follow_us")}</Title>
              <div className="contact-social-icons">
                <a href="https://chk.me/yxMNFpF" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-facebook"></i>
                </a>
                <a href="https://chk.me/B2HR41P" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="https://mmi.gov.mr/fr/" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <i className="fas fa-globe"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <div className="contact-form-container">
              <Title level={3}>{t("contact.form_title")}</Title>
              
              {success && (
                <Alert
                  message={t("contact.success_title")}
                  description={t("contact.success_description")}
                  type="success"
                  showIcon
                  closable
                  onClose={() => setSuccess(false)}
                  style={{ marginBottom: 24 }}
                />
              )}

              {error && (
                <Alert
                  message={t("contact.error_title")}
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError("")}
                  style={{ marginBottom: 24 }}
                />
              )}

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  name="nom"
                  label={t("contact.name_label")}
                  rules={[
                    { required: true, message: t("contact.name_required") },
                    { min: 2, message: t("contact.name_min") }
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder={t("contact.name_placeholder")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label={t("contact.email_label")}
                  rules={[
                    { required: true, message: t("contact.email_required") },
                    { type: "email", message: t("contact.email_invalid") }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder={t("contact.email_placeholder")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="telephone"
                  label={t("contact.phone_label")}
                  rules={[
                    { required: false },
                    { pattern: /^[0-9+\s()-]+$/, message: t("contact.phone_invalid") }
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={t("contact.phone_placeholder")}
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="sujet"
                  label={t("contact.subject_label")}
                  rules={[
                    { required: true, message: t("contact.subject_required") }
                  ]}
                >
                  <Select
                    placeholder={t("contact.subject_placeholder")}
                    size="large"
                  >
                    <Option value="demande_info">{t("contact.subject_info")}</Option>
                    <Option value="assistance_technique">{t("contact.subject_technical")}</Option>
                    <Option value="probleme_demande">{t("contact.subject_request_issue")}</Option>
                    <Option value="suggestion">{t("contact.subject_suggestion")}</Option>
                    <Option value="autre">{t("contact.subject_other")}</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="message"
                  label={t("contact.message_label")}
                  rules={[
                    { required: true, message: t("contact.message_required") },
                    { min: 10, message: t("contact.message_min") }
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder={t("contact.message_placeholder")}
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="contact-submit-button"
                    size="large"
                    block
                    icon={<MessageOutlined />}
                  >
                    {t("contact.submit_button")}
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

