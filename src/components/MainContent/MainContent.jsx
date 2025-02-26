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
  Switch,
  Button,
} from "antd";
import useAuthStore from "../../stores/authStore";
import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";
import NewIncidentModal from "./NewIncidentModal";

const { Title, Text } = Typography;

export default function MainContent() {
  const { token } = useAuthStore();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const {
    extractText,
    formatTime,
    formatDate,
    formatDateTime,
    getPanelHeader,
  } = useIncidentsUtilsStore();

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

  const activeItems = activeIncidents.map((incident) => ({
    key: incident.id,
    label: getPanelHeader(incident),
    children: <IncidentDetails incident={incident} />,
  }));

  const completedItems = completedIncidents.map((incident) => ({
    key: incident.id,
    label: getPanelHeader(incident),
    children: <IncidentDetails incident={incident} />,
  }));

  const tabItems = [
    {
      key: "1",
      label: `Начало ТН (${activeIncidents.length})`,
      children: <Collapse items={activeItems} />,
    },
    {
      key: "2",
      label: `Окончание ТН (${completedIncidents.length})`,
      children: <Collapse items={completedItems} />,
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* Заголовок и кнопка "Новое ТН" */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 15,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          Технологические нарушения
        </Title>
        <Button type="primary" onClick={() => setModalVisible(true)}>
          Новое ТН
        </Button>
      </div>
      <Tabs
        defaultActiveKey="1"
        items={tabItems}
        style={{ marginTop: 10, width: "100%" }}
      />
      <NewIncidentModal
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
}

function IncidentDetails({ incident }) {
  const { extractText, formatTime, formatDate, formatDateTime } =
    useIncidentsUtilsStore();
  let durationHours = null;
  if (incident.end_date && incident.end_time) {
    const start = new Date(`${incident.start_date}T${incident.start_time}`);
    const end = new Date(`${incident.end_date}T${incident.end_time}`);
    if (!isNaN(start) && !isNaN(end)) {
      durationHours = Math.round((end - start) / (1000 * 60 * 60));
    }
  }

  return (
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Title level={5}>Основная информация</Title>
        <p>
          <strong>Статус:</strong> {incident.status_incident || "нет"}
        </p>
        <p>
          <strong>Дата начала:</strong> {formatDate(incident.start_date)}{" "}
          {formatTime(incident.start_time)}
        </p>
        <p>
          <strong>Прогноз восстановления:</strong>{" "}
          {incident.estimated_restoration_time
            ? formatDateTime(incident.estimated_restoration_time)
            : "нет"}
        </p>
        {incident.end_date && incident.end_time && (
          <p>
            <strong>Дата окончания:</strong> {formatDate(incident.end_date)}{" "}
            {formatTime(incident.end_time)}
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
        <Text>{extractText(incident.description)}</Text>
      </Col>
      {incident.closure_description && (
        <Col span={24}>
          <Title level={5}>Описание закрытия</Title>
          <Text>{extractText(incident.closure_description)}</Text>
        </Col>
      )}
      {incident.AddressInfo && (
        <Col span={24}>
          <Title level={5}>Адресная информация</Title>
          <p>
            <strong>Тип поселения:</strong>{" "}
            {incident.AddressInfo.settlement_type || "нет"}
          </p>
          <p>
            <strong>Улицы:</strong> {incident.AddressInfo.streets || "нет"}
          </p>
          <p>
            <strong>Тип застройки:</strong>{" "}
            {incident.AddressInfo.building_type || "нет"}
          </p>
        </Col>
      )}
      {incident.DisruptionStats && (
        <Col span={24}>
          <Title level={5}>Статистика отключения</Title>
          <p>
            <strong>Отключено населенных пунктов:</strong>{" "}
            {incident.DisruptionStats.affected_settlements || "0"}
          </p>
          <p>
            <strong>Отключено жителей:</strong>{" "}
            {incident.DisruptionStats.affected_residents || "0"}
          </p>
          <p>
            <strong>Отключено МКД:</strong>{" "}
            {incident.DisruptionStats.affected_mkd || "0"}
          </p>
          <p>
            <strong>Отключено больниц:</strong>{" "}
            {incident.DisruptionStats.affected_hospitals || "0"}
          </p>
          <p>
            <strong>Отключено поликлиник:</strong>{" "}
            {incident.DisruptionStats.affected_clinics || "0"}
          </p>
          <p>
            <strong>Отключено школ:</strong>{" "}
            {incident.DisruptionStats.affected_schools || "0"}
          </p>
          <p>
            <strong>Отключено детсадов:</strong>{" "}
            {incident.DisruptionStats.affected_kindergartens || "0"}
          </p>
          <p>
            <strong>boiler_shutdown:</strong>{" "}
            {incident.DisruptionStats.boiler_shutdown || "0"}
          </p>
        </Col>
      )}
      <Col span={24}>
        <Title level={5}>Отправка данных</Title>
        <p>
          <strong>Отправлено в Telegram:</strong>{" "}
          <Switch checked={!!incident.sent_to_telegram} disabled />
        </p>
        <p>
          <strong>Отправлено в АРМ ЕДДС:</strong>{" "}
          <Switch checked={!!incident.sent_to_arm_edds} disabled />
        </p>
        <p>
          <strong>Отправлено на сайт Мособлэнерго:</strong>{" "}
          <Switch checked={!!incident.sent_to_moenergo} disabled />
        </p>
        <p>
          <strong>Отправлено на сайт Минэнерго:</strong>{" "}
          <Switch checked={!!incident.sent_to_minenergo} disabled />
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
//   Switch,
// } from "antd";
// import useAuthStore from "../../stores/authStore";
// import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";

// const { Title, Text } = Typography;

// export default function MainContent() {
//   const { token } = useAuthStore();
//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Деструктурируем функции из нашего store
//   const {
//     extractText,
//     formatTime,
//     formatDate,
//     formatDateTime,
//     getPanelHeader,
//   } = useIncidentsUtilsStore();

//   // Запрос данных со Strapi с populate=*
//   useEffect(() => {
//     async function fetchIncidents() {
//       try {
//         const response = await fetch(
//           "http://localhost:1337/api/incidents?populate=*",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const result = await response.json();
//         setIncidents(result.data || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchIncidents();
//   }, [token]);

//   // Фильтрация по статусу
//   const activeIncidents = incidents.filter(
//     (item) => item.status_incident?.trim() === "в работе"
//   );
//   const completedIncidents = incidents.filter(
//     (item) => item.status_incident?.trim() === "выполнена"
//   );

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

//   // Формируем элементы Collapse с помощью нового синтаксиса
//   const activeItems = activeIncidents.map((incident) => ({
//     key: incident.id,
//     label: getPanelHeader(incident),
//     children: <IncidentDetails incident={incident} />,
//   }));

//   const completedItems = completedIncidents.map((incident) => ({
//     key: incident.id,
//     label: getPanelHeader(incident),
//     children: <IncidentDetails incident={incident} />,
//   }));

//   const tabItems = [
//     {
//       key: "1",
//       label: `Начало ТН (${activeIncidents.length})`,
//       children: <Collapse items={activeItems} />,
//     },
//     {
//       key: "2",
//       label: `Окончание ТН (${completedIncidents.length})`,
//       children: <Collapse items={completedItems} />,
//     },
//   ];

//   return (
//     <div style={{ padding: 20 }}>
//       <Title level={2} style={{ margin: 0 }}>
//         Технологические нарушения
//       </Title>
//       <Tabs
//         defaultActiveKey="1"
//         items={tabItems}
//         style={{ marginTop: 10, width: "100%" }}
//       />
//     </div>
//   );
// }

// function IncidentDetails({ incident }) {
//   const { extractText, formatTime, formatDate, formatDateTime } =
//     useIncidentsUtilsStore();
//   let durationHours = null;
//   if (incident.end_date && incident.end_time) {
//     const start = new Date(`${incident.start_date}T${incident.start_time}`);
//     const end = new Date(`${incident.end_date}T${incident.end_time}`);
//     if (!isNaN(start) && !isNaN(end)) {
//       durationHours = Math.round((end - start) / (1000 * 60 * 60));
//     }
//   }

//   return (
//     <Row gutter={[0, 16]}>
//       <Col span={24}>
//         <Title level={5}>Основная информация</Title>
//         <p>
//           <strong>Статус:</strong> {incident.status_incident || "нет"}
//         </p>
//         <p>
//           <strong>Дата начала:</strong> {formatDate(incident.start_date)}{" "}
//           {formatTime(incident.start_time)}
//         </p>
//         <p>
//           <strong>Прогноз восстановления:</strong>{" "}
//           {incident.estimated_restoration_time
//             ? formatDateTime(incident.estimated_restoration_time)
//             : "нет"}
//         </p>
//         {incident.end_date && incident.end_time && (
//           <p>
//             <strong>Дата окончания:</strong> {formatDate(incident.end_date)}{" "}
//             {formatTime(incident.end_time)}
//           </p>
//         )}
//         {durationHours !== null && (
//           <p>
//             <strong>Продолжительность:</strong> {durationHours} часов
//           </p>
//         )}
//       </Col>
//       <Col span={24}>
//         <Title level={5}>Описание</Title>
//         <Text>{extractText(incident.description)}</Text>
//       </Col>
//       {incident.closure_description && (
//         <Col span={24}>
//           <Title level={5}>Описание закрытия</Title>
//           <Text>{extractText(incident.closure_description)}</Text>
//         </Col>
//       )}
//       {incident.AddressInfo && (
//         <Col span={24}>
//           <Title level={5}>Адресная информация</Title>
//           <p>
//             <strong>Тип поселения:</strong>{" "}
//             {incident.AddressInfo.settlement_type || "нет"}
//           </p>
//           <p>
//             <strong>Улицы:</strong> {incident.AddressInfo.streets || "нет"}
//           </p>
//           <p>
//             <strong>Тип застройки:</strong>{" "}
//             {incident.AddressInfo.building_type || "нет"}
//           </p>
//         </Col>
//       )}
//       {incident.DisruptionStats && (
//         <Col span={24}>
//           <Title level={5}>Статистика отключения</Title>
//           <p>
//             <strong>Отключено населенных пунктов:</strong>{" "}
//             {incident.DisruptionStats.affected_settlements || "0"}
//           </p>
//           <p>
//             <strong>Отключено жителей:</strong>{" "}
//             {incident.DisruptionStats.affected_residents || "0"}
//           </p>
//           <p>
//             <strong>Отключено МКД:</strong>{" "}
//             {incident.DisruptionStats.affected_mkd || "0"}
//           </p>
//           <p>
//             <strong>Отключено больниц:</strong>{" "}
//             {incident.DisruptionStats.affected_hospitals || "0"}
//           </p>
//           <p>
//             <strong>Отключено поликлиник:</strong>{" "}
//             {incident.DisruptionStats.affected_clinics || "0"}
//           </p>
//           <p>
//             <strong>Отключено школ:</strong>{" "}
//             {incident.DisruptionStats.affected_schools || "0"}
//           </p>
//           <p>
//             <strong>Отключено детсадов:</strong>{" "}
//             {incident.DisruptionStats.affected_kindergartens || "0"}
//           </p>
//           <p>
//             <strong>boiler_shutdown:</strong>{" "}
//             {incident.DisruptionStats.boiler_shutdown || "0"}
//           </p>
//         </Col>
//       )}
//       <Col span={24}>
//         <Title level={5}>Отправка данных</Title>
//         <p>
//           <strong>Отправлено в Telegram:</strong>{" "}
//           <Switch checked={!!incident.sent_to_telegram} disabled />
//         </p>
//         <p>
//           <strong>Отправлено в АРМ ЕДДС:</strong>{" "}
//           <Switch checked={!!incident.sent_to_arm_edds} disabled />
//         </p>
//         <p>
//           <strong>Отправлено на сайт Мособлэнерго:</strong>{" "}
//           <Switch checked={!!incident.sent_to_moenergo} disabled />
//         </p>
//         <p>
//           <strong>Отправлено на сайт Минэнерго:</strong>{" "}
//           <Switch checked={!!incident.sent_to_minenergo} disabled />
//         </p>
//       </Col>
//     </Row>
//   );
// }
