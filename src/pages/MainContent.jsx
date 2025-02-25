"use client";
import React, { useEffect, useState } from "react";
import {
  Spin,
  Alert,
  Tabs,
  Collapse,
  Typography,
  Row,
  Col,
  Button,
} from "antd";
import useAuthStore from "../stores/authStore";
import Container from "../components/Container";
import styles from "./Incidents.module.css";

const { Title } = Typography;
const { Panel } = Collapse;

const MainContent = () => {
  const { token, logout } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/incidents", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data } = await response.json();
        setIncidents(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [token]);

  const activeIncidents = incidents.filter(
    (incident) => incident.status_incident?.trim() === "в работе"
  );
  const completedIncidents = incidents.filter(
    (incident) => incident.status_incident === "выполнена"
  );

  const formatDate = (dateString, timeString) => {
    if (!dateString || !timeString) return "Нет данных";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Некорректная дата";

    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds))
      return "Некорректное время";

    date.setHours(hours, minutes, seconds);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const formattedHours = String(date.getHours()).padStart(2, "0");
    const formattedMinutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${formattedHours}:${formattedMinutes}`;
  };

  const extractText = (field) => {
    if (!field || !Array.isArray(field)) return "Нет данных";
    return (
      field[0]?.children?.map((child) => child.text).join(" ") || "Нет данных"
    );
  };

  const renderActiveIncidents = () => {
    return (
      <Collapse className={styles.tabContent}>
        {activeIncidents.map((incident) => (
          <Panel
            key={incident.id}
            header={`ТН №${incident.id}`}
            className={styles.panelHeader}
          >
            <div className={styles.panelBody}>
              <Row gutter={[0, 10]}>
                <Col span={24}>
                  <strong>Дата начала:</strong>{" "}
                  {formatDate(incident.start_date, incident.start_time)}
                </Col>
                <Col span={24}>
                  <strong>Описание:</strong> {extractText(incident.description)}
                </Col>
                <Col span={24}>
                  <strong>Прогноз восстановления:</strong>{" "}
                  {formatDate(
                    incident.estimated_restoration_time?.split("T")[0],
                    incident.estimated_restoration_time?.split("T")[1]
                  )}
                </Col>
              </Row>
            </div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const renderCompletedIncidents = () => {
    return (
      <Collapse className={styles.tabContent}>
        {completedIncidents.map((incident) => {
          const start = new Date(
            `${incident.start_date}T${incident.start_time}`
          );
          const end = new Date(`${incident.end_date}T${incident.end_time}`);
          const durationHours = Math.round((end - start) / (1000 * 60 * 60));

          return (
            <Panel
              key={incident.id}
              header={`ТН №${incident.id}`}
              className={styles.panelHeader}
            >
              <div className={styles.panelBody}>
                <Row gutter={[0, 10]}>
                  <Col span={24}>
                    <strong>Дата начала:</strong>{" "}
                    {formatDate(incident.start_date, incident.start_time)}
                  </Col>
                  <Col span={24}>
                    <strong>Описание:</strong>{" "}
                    {extractText(incident.description)}
                  </Col>
                  <Col span={24}>
                    <strong>Дата окончания:</strong>{" "}
                    {formatDate(incident.end_date, incident.end_time)}
                  </Col>
                  <Col span={24}>
                    <strong>Продолжительность:</strong> {durationHours} часов
                  </Col>
                  <Col span={24}>
                    <strong>Описание закрытия:</strong>{" "}
                    {extractText(incident.closure_description)}
                  </Col>
                </Row>
              </div>
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 50 }}>
        <Alert
          message="Ошибка загрузки данных"
          description={error}
          type="error"
        />
      </div>
    );
  }

  return (
    <Container>
      <div style={{ textAlign: "right", marginTop: 20, marginBottom: 20 }}>
        <Button type="primary" danger onClick={logout}>
          Выйти
        </Button>
      </div>
      <Title level={1} className={styles.title}>
        Технологические нарушения
      </Title>
      <Tabs defaultActiveKey="1" className={styles.tabContent}>
        <Tabs.TabPane tab={`Начало ТН (${activeIncidents.length})`} key="1">
          {renderActiveIncidents()}
        </Tabs.TabPane>
        <Tabs.TabPane
          tab={`Окончание ТН (${completedIncidents.length})`}
          key="2"
        >
          {renderCompletedIncidents()}
        </Tabs.TabPane>
      </Tabs>
    </Container>
  );
};

export default MainContent;
