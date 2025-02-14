"use client";
import React, { useEffect, useState } from "react";
import { Spin, Alert, Card, List, Tabs } from "antd";

const Main = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Токен аутентификации (пример - должен браться из secure store)
  const API_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzM5NTMwOTE2LCJleHAiOjE3NDIxMjI5MTZ9.FoZ3TsJwZEp1_BpVNTjYTXC4Sk9VS1zppCjDikZAI7o";

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/incidents", {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setIncidents(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, []);

  // Фильтрация инцидентов по статусу
  const activeIncidents = incidents.filter(
    (incident) => incident.status_incident === "в работе"
  );
  const completedIncidents = incidents.filter(
    (incident) => incident.status_incident === "выполнена"
  );

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
    );
  if (error)
    return (
      <Alert
        message="Ошибка загрузки данных"
        description={error}
        type="error"
        style={{ margin: 20 }}
      />
    );

  // Функция для форматирования даты
  const formatDate = (dateString, timeString) => {
    const date = new Date(dateString);
    const time = timeString.split(":");
    date.setHours(time[0], time[1], time[2]);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  // Функция для извлечения текста из description или closure_description
  const extractText = (field) => {
    if (!field || !Array.isArray(field)) return "Нет данных";
    return (
      field[0]?.children?.map((child) => child.text).join(" ") || "Нет данных"
    );
  };

  return (
    <div style={{ padding: "10px", maxWidth: "100vw", overflowX: "auto" }}>
      {/* Вкладки */}
      <Tabs
        defaultActiveKey="1"
        style={{ marginBottom: 0 }}
        items={[
          {
            key: "1",
            label: (
              <span style={{ fontSize: "1.5em", fontWeight: 500 }}>
                Начало ТН ({activeIncidents.length})
              </span>
            ),
            children: (
              <section style={{ marginTop: 10 }}>
                <h2 style={{ fontSize: "1.8em", marginBottom: 10 }}>
                  Активные технологические нарушения
                </h2>
                <List
                  dataSource={activeIncidents}
                  renderItem={(incident) => (
                    <List.Item style={{ padding: "5px 0" }}>
                      <Card
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#fffbe6",
                          padding: "10px",
                          margin: 0,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong>ТН #{incident.documentId}</strong>
                        </div>
                        <div style={{ flex: 2 }}>
                          <p>
                            <strong>Дата начала:</strong>{" "}
                            {formatDate(
                              incident.start_date,
                              incident.start_time
                            )}
                          </p>
                        </div>
                        <div style={{ flex: 3 }}>
                          <p>
                            <strong>Описание:</strong>{" "}
                            {extractText(incident.description)}
                          </p>
                        </div>
                        <div style={{ flex: 2 }}>
                          <p>
                            <strong>Прогноз восстановления:</strong>{" "}
                            {formatDate(
                              incident.estimated_restoration_time.split("T")[0],
                              incident.estimated_restoration_time.split("T")[1]
                            )}
                          </p>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </section>
            ),
          },
          {
            key: "2",
            label: (
              <span style={{ fontSize: "1.5em", fontWeight: 500 }}>
                Окончание ТН ({completedIncidents.length})
              </span>
            ),
            children: (
              <section style={{ marginTop: 10 }}>
                <h2 style={{ fontSize: "1.8em", marginBottom: 10 }}>
                  Завершенные технологические нарушения
                </h2>
                <List
                  dataSource={completedIncidents}
                  renderItem={(incident) => (
                    <List.Item style={{ padding: "5px 0" }}>
                      <Card
                        style={{
                          width: "100%",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#f6ffed",
                          padding: "10px",
                          margin: 0,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong>ТН #{incident.documentId}</strong>
                        </div>
                        <div style={{ flex: 2 }}>
                          <p>
                            <strong>Дата окончания:</strong>{" "}
                            {formatDate(incident.end_date, incident.end_time)}
                          </p>
                        </div>
                        <div style={{ flex: 3 }}>
                          <p>
                            <strong>Описание закрытия:</strong>{" "}
                            {extractText(incident.closure_description)}
                          </p>
                        </div>
                        <div style={{ flex: 2 }}>
                          <p>
                            <strong>Продолжительность:</strong>{" "}
                            {Math.round(
                              (new Date(
                                `${incident.end_date}T${incident.end_time}`
                              ) -
                                new Date(
                                  `${incident.start_date}T${incident.start_time}`
                                )) /
                                (1000 * 60 * 60)
                            )}{" "}
                            часов
                          </p>
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </section>
            ),
          },
        ]}
      />
    </div>
  );
};

export default Main;
