"use client";
import React, { useEffect, useState } from "react";
import { Spin, Alert, Card, List, Tabs, Button } from "antd";
import useAuthStore from "../stores/authStore";
import IdTN from "../components/CardComponent/Id";
import StartDate from "../components/CardComponent/StartDate";
import Description from "../components/CardComponent/Description";
import EstimatedRestorationTime from "../components/CardComponent/EstimatedRestorationTime";

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

        const { data } = await response.json(); // <-- Сначала получаем data
        console.log("Проверяем data", data); // <-- Потом выводим в консоль
        setIncidents(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    console.log("Проверяем token", token);
    fetchIncidents();
  }, [token, logout]);

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

  if (loading) return <Spin size="large" className="center-spinner" />;

  if (error)
    return (
      <Alert
        message="Ошибка загрузки данных"
        description={error}
        type="error"
        className="error-alert"
      />
    );

  return (
    <div className="main-container">
      <div className="logout-container">
        <Button type="primary" danger onClick={logout}>
          Выйти
        </Button>
      </div>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: `Начало ТН (${activeIncidents.length})`,
            children: (
              <IncidentList
                incidents={activeIncidents}
                type="active"
                formatDate={formatDate}
                extractText={extractText}
              />
            ),
          },
          {
            key: "2",
            label: `Окончание ТН (${completedIncidents.length})`,
            children: (
              <IncidentList
                incidents={completedIncidents}
                type="completed"
                formatDate={formatDate}
                extractText={extractText}
              />
            ),
          },
        ]}
      />
    </div>
  );
};

const IncidentList = ({ incidents, type, formatDate, extractText }) => (
  <section className="incident-section">
    <h2 className="section-title">
      {type === "active"
        ? "Активные технологические нарушения"
        : "Завершенные технологические нарушения"}
    </h2>

    <List
      dataSource={incidents}
      renderItem={(incident) => (
        <List.Item className="list-item">
          <Card className={`incident-card ${type}`}>
            <IdTN id={incident.id} />
            <StartDate
              date={formatDate(incident.start_date, incident.start_time)}
            />
            <Description text={extractText(incident.description)} />

            {type === "active" ? (
              <EstimatedRestorationTime
                date={formatDate(
                  incident.estimated_restoration_time?.split("T")[0],
                  incident.estimated_restoration_time?.split("T")[1]
                )}
              />
            ) : (
              <DurationInfo incident={incident} formatDate={formatDate} />
            )}
          </Card>
        </List.Item>
      )}
    />
  </section>
);

const DurationInfo = ({ incident, formatDate }) => {
  const start = new Date(`${incident.start_date}T${incident.start_time}`);

  const end = new Date(`${incident.end_date}T${incident.end_time}`);

  const durationHours = Math.round((end - start) / (1000 * 60 * 60));

  return (
    <div className="duration-info">
      <p>
        <strong>Продолжительность:</strong> {durationHours} часов
      </p>
    </div>
  );
};

export default MainContent;
