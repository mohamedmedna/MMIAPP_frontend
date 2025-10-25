import React from "react";
import { Button } from "antd";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BanniereMinistere from "../components/BanniereMinistere";
import "../Styles/PMNE.css";
import { useTranslation } from "react-i18next";

function PMNE() {
  const { t, i18n } = useTranslation();

  const objectifs = t("pmne.objectives.items", { returnObjects: true });
  const adhesion = t("pmne.adhesion.cards", { returnObjects: true });

  return (
    <>
      <Header />
      <div className="full-width-banner-wrapper">
        <BanniereMinistere />
      </div>

      <div className="pmne-page" dir={i18n.dir()}>
        {/* Header Section */}
        <div className="pmne-header">
          <h1 className="pmne-title">{t("pmne.title")}</h1>
          <p className="pmne-description">{t("pmne.description")}</p>
        </div>

        {/* Objectifs */}
        <div className="objectifs-section">
          <h2 className="section-title">{t("pmne.objectives.title")}</h2>
          <ul className="objectifs-list">
            {Array.isArray(objectifs) &&
              objectifs.map((item, idx) => <li key={idx}>{item}</li>)}
          </ul>
        </div>

        {/* Types d'Adhésion */}
        <div className="adhesion-section">
          <h2 className="section-title">{t("pmne.adhesion.title")}</h2>
          <div className="adhesion-cards">
            {/* Entreprise */}
            <div className="adhesion-card entreprise">
              <div className="card-icon" aria-hidden>
                🏢
              </div>
              <h3 className="card-title">{adhesion?.enterprise?.title}</h3>
              <p className="card-description">
                {adhesion?.enterprise?.description}
              </p>
            </div>

            {/* Association */}
            <div className="adhesion-card association">
              <div className="card-icon" aria-hidden>
                👥
              </div>
              <h3 className="card-title">{adhesion?.association?.title}</h3>
              <p className="card-description">
                {adhesion?.association?.description}
              </p>
            </div>

            {/* Individuel */}
            <div className="adhesion-card individuel">
              <div className="card-icon" aria-hidden>
                👤
              </div>
              <h3 className="card-title">{adhesion?.individual?.title}</h3>
              <p className="card-description">
                {adhesion?.individual?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="cta-section">
          <Button className="cta-button">{t("pmne.cta")}</Button>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default PMNE;
