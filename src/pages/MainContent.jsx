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
  Switch,
} from "antd";
import useAuthStore from "../stores/authStore";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Вспомогательные функции
function extractText(richText) {
  if (!richText || !Array.isArray(richText)) return "Нет данных";
  return richText
    .map((block) => block?.children?.map((child) => child.text).join(" "))
    .join("\n");
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : timeStr;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : dateStr;
}

function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return "";
  const dateObj = new Date(dateTimeStr);
  // Используем UTC для стабильного результата
  const dd = String(dateObj.getUTCDate()).padStart(2, "0");
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getUTCFullYear();
  const hh = String(dateObj.getUTCHours()).padStart(2, "0");
  const min = String(dateObj.getUTCMinutes()).padStart(2, "0");
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

export default function MainContent() {
  const { token, logout } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Запрос данных со Strapi с populate=*
  useEffect(() => {
    async function fetchIncidents() {
      try {
        const response = await fetch(
          "http://localhost:1337/api/incidents?populate=*",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setIncidents(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchIncidents();
  }, [token]);

  // Фильтрация по статусу
  const activeIncidents = incidents.filter(
    (item) => item.status_incident?.trim() === "в работе"
  );
  const completedIncidents = incidents.filter(
    (item) => item.status_incident?.trim() === "выполнена"
  );

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

  // Используем новую структуру Tabs с items
  const tabItems = [
    {
      key: "1",
      label: `Начало ТН (${activeIncidents.length})`,
      children: (
        <Collapse>
          {activeIncidents.map((incident) => (
            <Panel key={incident.id} header={`ТН №${incident.id}`}>
              <IncidentDetails incident={incident} />
            </Panel>
          ))}
        </Collapse>
      ),
    },
    {
      key: "2",
      label: `Окончание ТН (${completedIncidents.length})`,
      children: (
        <Collapse>
          {completedIncidents.map((incident) => (
            <Panel key={incident.id} header={`ТН №${incident.id}`}>
              <IncidentDetails incident={incident} />
            </Panel>
          ))}
        </Collapse>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <div style={{ textAlign: "right", marginBottom: 10 }}>
        <Button type="primary" danger onClick={logout}>
          Выйти
        </Button>
      </div>
      <Title level={2} style={{ margin: 0 }}>
        Технологические нарушения
      </Title>
      <Tabs defaultActiveKey="1" items={tabItems} style={{ marginTop: 10 }} />
    </div>
  );
}

function IncidentDetails({ incident }) {
  // Распаковка полей
  const {
    documentId,
    start_time,
    start_date,
    status_incident,
    estimated_restoration_time,
    end_time,
    end_date,
    description,
    closure_description,
    sent_to_telegram,
    sent_to_arm_edds,
    sent_to_moenergo,
    sent_to_minenergo,
    AddressInfo,
    DisruptionStats,
  } = incident;

  let durationHours = null;
  if (end_date && end_time) {
    const start = new Date(`${start_date}T${start_time}`);
    const end = new Date(`${end_date}T${end_time}`);
    if (!isNaN(start) && !isNaN(end)) {
      durationHours = Math.round((end - start) / (1000 * 60 * 60));
    }
  }

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Title level={5}>Основная информация</Title>
        {/* <p>
          <strong>documentId:</strong> {documentId || "нет"}
        </p> */}
        <p>
          <strong>Статус:</strong> {status_incident || "нет"}
        </p>
        <p>
          <strong>Дата начала:</strong> {formatDate(start_date)}{" "}
          {formatTime(start_time)}
        </p>
        <p>
          <strong>Прогноз восстановления:</strong>{" "}
          {estimated_restoration_time
            ? formatDateTime(estimated_restoration_time)
            : "нет"}
        </p>
        {end_date && end_time && (
          <p>
            <strong>Дата окончания:</strong> {formatDate(end_date)}{" "}
            {formatTime(end_time)}
          </p>
        )}
        {durationHours !== null && (
          <p>
            <strong>Продолжительность:</strong> {durationHours} часов
          </p>
        )}
      </Col>
      <Col span={24}>
        <Title level={5}>Описание</Title>
        <Text>{extractText(description)}</Text>
      </Col>
      {closure_description && (
        <Col span={24}>
          <Title level={5}>Описание закрытия</Title>
          <Text>{extractText(closure_description)}</Text>
        </Col>
      )}
      {AddressInfo && (
        <Col span={24}>
          <Title level={5}>Адресная информация</Title>
          <p>
            <strong>Тип поселения:</strong>{" "}
            {AddressInfo.settlement_type || "нет"}
          </p>
          <p>
            <strong>Улицы:</strong> {AddressInfo.streets || "нет"}
          </p>
          <p>
            <strong>Тип застройки:</strong> {AddressInfo.building_type || "нет"}
          </p>
        </Col>
      )}
      {DisruptionStats && (
        <Col span={24}>
          <Title level={5}>Статистика отключения</Title>
          <p>
            <strong>Отключено населенных пунктов:</strong>{" "}
            {DisruptionStats.affected_settlements || "0"}
          </p>
          <p>
            <strong>Отключено жителей:</strong>{" "}
            {DisruptionStats.affected_residents || "0"}
          </p>
          <p>
            <strong>Отключено МКД:</strong>{" "}
            {DisruptionStats.affected_mkd || "0"}
          </p>
          <p>
            <strong>Отключено больниц:</strong>{" "}
            {DisruptionStats.affected_hospitals || "0"}
          </p>
          <p>
            <strong>Отключено поликлиник:</strong>{" "}
            {DisruptionStats.affected_clinics || "0"}
          </p>
          <p>
            <strong>Отключено школ:</strong>{" "}
            {DisruptionStats.affected_schools || "0"}
          </p>
          <p>
            <strong>Отключено детсадов:</strong>{" "}
            {DisruptionStats.affected_kindergartens || "0"}
          </p>
          <p>
            <strong>boiler_shutdown:</strong>{" "}
            {DisruptionStats.boiler_shutdown || "0"}
          </p>
        </Col>
      )}
      <Col span={24}>
        <Title level={5}>Отправка данных</Title>
        <p>
          <strong>Отправлено в Telegram:</strong>{" "}
          <Switch checked={!!sent_to_telegram} disabled />
        </p>
        <p>
          <strong>Отправлено в АРМ ЕДДС:</strong>{" "}
          <Switch checked={!!sent_to_arm_edds} disabled />
        </p>
        <p>
          <strong>Отправлено на сайт Мособлэнерго:</strong>{" "}
          <Switch checked={!!sent_to_moenergo} disabled />
        </p>
        <p>
          <strong>Отправлено на сайт Минэнерго:</strong>{" "}
          <Switch checked={!!sent_to_minenergo} disabled />
        </p>
      </Col>
    </Row>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Spin,
//   Alert,
//   Tabs,
//   Collapse,
//   Typography,
//   Row,
//   Col,
//   Button,
// } from "antd";
// import useAuthStore from "../stores/authStore";
// import Container from "../components/Container";
// import styles from "./Incidents.module.css";

// const { Title } = Typography;
// const { Panel } = Collapse;

// const MainContent = () => {
//   const { token, logout } = useAuthStore();
//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchIncidents = async () => {
//       try {
//         const response = await fetch("http://localhost:1337/api/incidents", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const { data } = await response.json();
//         setIncidents(data || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchIncidents();
//   }, [token]);

//   const activeIncidents = incidents.filter(
//     (incident) => incident.status_incident?.trim() === "в работе"
//   );
//   const completedIncidents = incidents.filter(
//     (incident) => incident.status_incident === "выполнена"
//   );

//   const formatDate = (dateString, timeString) => {
//     if (!dateString || !timeString) return "Нет данных";
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return "Некорректная дата";

//     const [hours, minutes, seconds] = timeString.split(":").map(Number);
//     if (isNaN(hours) || isNaN(minutes) || isNaN(seconds))
//       return "Некорректное время";

//     date.setHours(hours, minutes, seconds);

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();
//     const formattedHours = String(date.getHours()).padStart(2, "0");
//     const formattedMinutes = String(date.getMinutes()).padStart(2, "0");

//     return `${day}.${month}.${year} ${formattedHours}:${formattedMinutes}`;
//   };

//   const extractText = (field) => {
//     if (!field || !Array.isArray(field)) return "Нет данных";
//     return (
//       field[0]?.children?.map((child) => child.text).join(" ") || "Нет данных"
//     );
//   };

//   const renderActiveIncidents = () => {
//     return (
//       <Collapse className={styles.tabContent}>
//         {activeIncidents.map((incident) => (
//           <Panel
//             key={incident.id}
//             header={`ТН №${incident.id}`}
//             className={styles.panelHeader}
//           >
//             <div className={styles.panelBody}>
//               <Row gutter={[0, 10]}>
//                 <Col span={24}>
//                   <strong>Дата начала:</strong>{" "}
//                   {formatDate(incident.start_date, incident.start_time)}
//                 </Col>
//                 <Col span={24}>
//                   <strong>Описание:</strong> {extractText(incident.description)}
//                 </Col>
//                 <Col span={24}>
//                   <strong>Прогноз восстановления:</strong>{" "}
//                   {formatDate(
//                     incident.estimated_restoration_time?.split("T")[0],
//                     incident.estimated_restoration_time?.split("T")[1]
//                   )}
//                 </Col>
//               </Row>
//             </div>
//           </Panel>
//         ))}
//       </Collapse>
//     );
//   };

//   const renderCompletedIncidents = () => {
//     return (
//       <Collapse className={styles.tabContent}>
//         {completedIncidents.map((incident) => {
//           const start = new Date(
//             `${incident.start_date}T${incident.start_time}`
//           );
//           const end = new Date(`${incident.end_date}T${incident.end_time}`);
//           const durationHours = Math.round((end - start) / (1000 * 60 * 60));

//           return (
//             <Panel
//               key={incident.id}
//               header={`ТН №${incident.id}`}
//               className={styles.panelHeader}
//             >
//               <div className={styles.panelBody}>
//                 <Row gutter={[0, 10]}>
//                   <Col span={24}>
//                     <strong>Дата начала:</strong>{" "}
//                     {formatDate(incident.start_date, incident.start_time)}
//                   </Col>
//                   <Col span={24}>
//                     <strong>Описание:</strong>{" "}
//                     {extractText(incident.description)}
//                   </Col>
//                   <Col span={24}>
//                     <strong>Дата окончания:</strong>{" "}
//                     {formatDate(incident.end_date, incident.end_time)}
//                   </Col>
//                   <Col span={24}>
//                     <strong>Продолжительность:</strong> {durationHours} часов
//                   </Col>
//                   <Col span={24}>
//                     <strong>Описание закрытия:</strong>{" "}
//                     {extractText(incident.closure_description)}
//                   </Col>
//                 </Row>
//               </div>
//             </Panel>
//           );
//         })}
//       </Collapse>
//     );
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: "center", marginTop: 50 }}>
//         <Spin size="large" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ marginTop: 50 }}>
//         <Alert
//           message="Ошибка загрузки данных"
//           description={error}
//           type="error"
//         />
//       </div>
//     );
//   }

//   return (
//     <Container>
//       <div style={{ textAlign: "right", marginTop: 20, marginBottom: 20 }}>
//         <Button type="primary" danger onClick={logout}>
//           Выйти
//         </Button>
//       </div>
//       <Title level={1} className={styles.title}>
//         Технологические нарушения
//       </Title>
//       <Tabs defaultActiveKey="1" className={styles.tabContent}>
//         <Tabs.TabPane tab={`Начало ТН (${activeIncidents.length})`} key="1">
//           {renderActiveIncidents()}
//         </Tabs.TabPane>
//         <Tabs.TabPane
//           tab={`Окончание ТН (${completedIncidents.length})`}
//           key="2"
//         >
//           {renderCompletedIncidents()}
//         </Tabs.TabPane>
//       </Tabs>
//     </Container>
//   );
// };

// export default MainContent;
