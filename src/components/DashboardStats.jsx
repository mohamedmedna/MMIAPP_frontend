import React from "react"
import { Card, Row, Col, Statistic } from "antd"
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  AimOutlined,
} from "@ant-design/icons"
import { useTranslation } from "react-i18next"

const DashboardStats = ({ demandes }) => {
  const { t } = useTranslation()

  // Vérifier que demandes est un tableau
  const demandesArray = Array.isArray(demandes) ? demandes : []

  // Calcul des statistiques
  const stats = {
    enAttente: demandesArray.filter((d) => d.statut === "DEPOSEE").length,
    accusees: demandesArray.filter(
      (d) => d.statut === "RECEPTIONNEE" && d.fichier_accuse
    ).length,
    autorisations: demandesArray.filter(
      (d) => d.statut === "AUTORISATION_SIGNEE"
    ).length,
    pretesSG: demandesArray.filter(
      (d) => d.statut === "RECEPTIONNEE" && d.fichier_accuse
    ).length,
  }

  const statCards = [
    {
      title: t("dashboardStats.enAttente"),
      value: stats.enAttente,
      icon: <ClockCircleOutlined />,
      color: "#1890ff",
      suffix: t("dashboardStats.deposees"),
    },
    {
      title: t("dashboardStats.accusees"),
      value: stats.accusees,
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      suffix: t("dashboardStats.receptionnees"),
    },
    {
      title: t("dashboardStats.autorisations"),
      value: stats.autorisations,
      icon: <CheckSquareOutlined />,
      color: "#722ed1",
      suffix: t("dashboardStats.signees"),
    },
  ]

  return (
    <div className="stats-section">
      {/* Grille des statistiques */}
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <Statistic
              title={stat.title}
              value={stat.value}
              prefix={React.cloneElement(stat.icon, {
                style: { color: stat.color, fontSize: "2em" },
              })}
              suffix={stat.suffix}
              valueStyle={{ color: stat.color }}
            />
          </div>
        ))}
      </div>

      {/* Section Actions Prioritaires */}
      <div className="priority-actions">
        <h3>
          <AimOutlined />
          {t("dashboardStats.actionsPrioritaires")}
        </h3>
        <div className="content">
          {stats.pretesSG > 0 ? (
            <span>
              {t("dashboardStats.demandesPretesSG", { count: stats.pretesSG })}
            </span>
          ) : (
            <span>{t("dashboardStats.aucuneActionPrioritaire")}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
