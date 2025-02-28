"use client";
import React, { useEffect, useState } from "react";
import {
  Spin,
  Alert,
  Collapse,
  Typography,
  Row,
  Col,
  Switch,
  Button,
  Space,
} from "antd";
import useAuthStore from "../../stores/authStore";
import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";
import NewIncidentModal from "./NewIncidentModal";
import CloseIncidentModal from "./CloseIncidentModal";

const { Title, Text } = Typography;

export default function MainContent() {
  const { token } = useAuthStore();

  // Список инцидентов и состояние загрузки
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Модалка "Новое ТН"
  const [newModalVisible, setNewModalVisible] = useState(false);

  // Фильтр по категориям: "all", "active", "completed"
  const [filter, setFilter] = useState("all");

  // Функции из zustand-store для форматирования
  const {
    extractText,
    formatTime,
    formatDate,
    formatDateTime,
    getPanelHeader,
  } = useIncidentsUtilsStore();

  // Функция загрузки инцидентов (используем и при обновлении)
  const fetchIncidents = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    if (token) {
      fetchIncidents();
    }
  }, [token]);

  // Фильтрация инцидентов по выбранной категории
  let filteredIncidents = [];
  if (filter === "all") {
    filteredIncidents = incidents;
  } else if (filter === "active") {
    filteredIncidents = incidents.filter(
      (item) => item.status_incident?.trim() === "в работе"
    );
  } else if (filter === "completed") {
    filteredIncidents = incidents.filter(
      (item) => item.status_incident?.trim() === "выполнена"
    );
  }

  // Сортировка по дате и времени начала (от новых к старым)
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const dateA = new Date(`${a.start_date}T${a.start_time}`);
    const dateB = new Date(`${b.start_date}T${b.start_time}`);
    return dateB - dateA;
  });

  // Подготовка данных для Collapse через items prop
  const collapseItems = sortedIncidents.map((incident) => ({
    key: incident.id,
    label: getPanelHeader(incident),
    children: <IncidentDetails incident={incident} onUpdate={fetchIncidents} />,
    style: {
      background:
        incident.status_incident === "в работе" ? "#fff1f0" : "#f6ffed",
      marginBottom: 8,
    },
  }));

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
        <Button type="primary" onClick={() => setNewModalVisible(true)}>
          Новое ТН
        </Button>
      </div>

      {/* Мини-фильтр по категориям */}
      <div style={{ marginBottom: 15 }}>
        <Space.Compact>
          <Button
            type={filter === "all" ? "primary" : "default"}
            onClick={() => setFilter("all")}
          >
            Все ТН
          </Button>
          <Button
            type={filter === "active" ? "primary" : "default"}
            onClick={() => setFilter("active")}
          >
            В работе
          </Button>
          <Button
            type={filter === "completed" ? "primary" : "default"}
            onClick={() => setFilter("completed")}
          >
            Выполненные
          </Button>
        </Space.Compact>
      </div>

      {loading ? (
        <Spin />
      ) : error ? (
        <Alert type="error" message={error} />
      ) : (
        <Collapse accordion items={collapseItems} />
      )}

      {/* Модалка создания нового ТН */}
      <NewIncidentModal
        visible={newModalVisible}
        onCancel={() => {
          setNewModalVisible(false);
          fetchIncidents();
        }}
      />
    </div>
  );
}

function IncidentDetails({ incident, onUpdate }) {
  const { extractText, formatTime, formatDate, formatDateTime } =
    useIncidentsUtilsStore();

  const [closeModalVisible, setCloseModalVisible] = useState(false);

  // Рассчитываем длительность
  let durationHours = null;
  if (incident.end_date && incident.end_time) {
    const start = new Date(`${incident.start_date}T${incident.start_time}`);
    const end = new Date(`${incident.end_date}T${incident.end_time}`);
    if (!isNaN(start) && !isNaN(end)) {
      durationHours = Math.round((end - start) / (1000 * 60 * 60));
    }
  }

  return (
    <>
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

          {/* Кнопка "Выполнена" (открывает модалку) */}
          {incident.status_incident?.trim() === "в работе" && (
            <Button
              type="default"
              style={{ marginTop: 10 }}
              onClick={() => setCloseModalVisible(true)}
            >
              Выполнена
            </Button>
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

        {/* AddressInfo */}
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

        {/* DisruptionStats */}
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

      {/* Модалка "Закрыть ТН" */}
      <CloseIncidentModal
        visible={closeModalVisible}
        onCancel={() => setCloseModalVisible(false)}
        incidentId={incident.documentId} // <-- передаём documentId
        onSuccess={() => {
          setCloseModalVisible(false);
          onUpdate();
        }}
      />
    </>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Spin,
//   Alert,
//   Collapse,
//   Typography,
//   Row,
//   Col,
//   Switch,
//   Button,
// } from "antd";
// import useAuthStore from "../../stores/authStore";
// import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";
// import NewIncidentModal from "./NewIncidentModal";
// import CloseIncidentModal from "./CloseIncidentModal";

// const { Title, Text } = Typography;
// const { Panel } = Collapse;

// export default function MainContent() {
//   const { token } = useAuthStore();

//   // Список инцидентов и состояние загрузки
//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Модалка "Новое ТН"
//   const [newModalVisible, setNewModalVisible] = useState(false);

//   // Функции из zustand-store для форматирования
//   const {
//     extractText,
//     formatTime,
//     formatDate,
//     formatDateTime,
//     getPanelHeader,
//   } = useIncidentsUtilsStore();

//   // Функция загрузки инцидентов (используем и при обновлении)
//   const fetchIncidents = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:1337/api/incidents?populate=*",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const result = await response.json();
//       setIncidents(result.data || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchIncidents();
//     }
//   }, [token]);

//   const activeIncidents = incidents.filter(
//     (item) => item.status_incident?.trim() === "в работе"
//   );
//   const completedIncidents = incidents.filter(
//     (item) => item.status_incident?.trim() === "выполнена"
//   );

//   const allIncidents = [...activeIncidents, ...completedIncidents]
//     .sort((a, b) => {
//       const dateA = new Date(`${a.start_date}T${a.start_time}`);
//       const dateB = new Date(`${b.start_date}T${b.start_time}`);
//       return dateB - dateA;
//     });

//   return (
//     <div style={{ padding: 20 }}>
//       {/* Заголовок и кнопка "Новое ТН" */}
//       <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
//         <Title level={2} style={{ margin: 0 }}>Технологические нарушения</Title>
//         <Button type="primary" onClick={() => setNewModalVisible(true)}>Новое ТН</Button>
//       </div>

//       <Collapse accordion>
//         {allIncidents.map((incident) => (
//           <Panel
//             key={incident.id}
//             header={getPanelHeader(incident)}
//             style={{
//               background: incident.status_incident === 'в работе'
//                 ? '#fff1f0'
//                 : '#f6ffed',
//               marginBottom: 8
//             }}
//           >
//             <IncidentDetails incident={incident} onUpdate={fetchIncidents} />
//           </Panel>
//         ))}
//       </Collapse>

//       {/* Модалка создания нового ТН */}
//       <NewIncidentModal
//         visible={newModalVisible}
//         onCancel={() => {
//           setNewModalVisible(false);
//           fetchIncidents();
//         }}
//       />
//     </div>
//   );
// }

// function IncidentDetails({ incident, onUpdate }) {
//   const { extractText, formatTime, formatDate, formatDateTime } =
//     useIncidentsUtilsStore();

//   const [closeModalVisible, setCloseModalVisible] = useState(false);

//   // Рассчитываем длительность
//   let durationHours = null;
//   if (incident.end_date && incident.end_time) {
//     const start = new Date(`${incident.start_date}T${incident.start_time}`);
//     const end = new Date(`${incident.end_date}T${incident.end_time}`);
//     if (!isNaN(start) && !isNaN(end)) {
//       durationHours = Math.round((end - start) / (1000 * 60 * 60));
//     }
//   }

//   return (
//     <>
//       <Row gutter={[0, 16]}>
//         <Col span={24}>
//           <Title level={5}>Основная информация</Title>
//           <p>
//             <strong>Статус:</strong> {incident.status_incident || "нет"}
//           </p>
//           <p>
//             <strong>Дата начала:</strong> {formatDate(incident.start_date)}{" "}
//             {formatTime(incident.start_time)}
//           </p>
//           <p>
//             <strong>Прогноз восстановления:</strong>{" "}
//             {incident.estimated_restoration_time
//               ? formatDateTime(incident.estimated_restoration_time)
//               : "нет"}
//           </p>
//           {incident.end_date && incident.end_time && (
//             <p>
//               <strong>Дата окончания:</strong> {formatDate(incident.end_date)}{" "}
//               {formatTime(incident.end_time)}
//             </p>
//           )}
//           {durationHours !== null && (
//             <p>
//               <strong>Продолжительность:</strong> {durationHours} часов
//             </p>
//           )}

//           {/* Кнопка "Выполнена" (открывает модалку) */}
//           {incident.status_incident?.trim() === "в работе" && (
//             <Button
//               type="default"
//               style={{ marginTop: 10 }}
//               onClick={() => setCloseModalVisible(true)}
//             >
//               Выполнена
//             </Button>
//           )}
//         </Col>

//         <Col span={24}>
//           <Title level={5}>Описание</Title>
//           <Text>{extractText(incident.description)}</Text>
//         </Col>

//         {incident.closure_description && (
//           <Col span={24}>
//             <Title level={5}>Описание закрытия</Title>
//             <Text>{extractText(incident.closure_description)}</Text>
//           </Col>
//         )}

//         {/* AddressInfo */}
//         {incident.AddressInfo && (
//           <Col span={24}>
//             <Title level={5}>Адресная информация</Title>
//             <p>
//               <strong>Тип поселения:</strong>{" "}
//               {incident.AddressInfo.settlement_type || "нет"}
//             </p>
//             <p>
//               <strong>Улицы:</strong> {incident.AddressInfo.streets || "нет"}
//             </p>
//             <p>
//               <strong>Тип застройки:</strong>{" "}
//               {incident.AddressInfo.building_type || "нет"}
//             </p>
//           </Col>
//         )}

//         {/* DisruptionStats */}
//         {incident.DisruptionStats && (
//           <Col span={24}>
//             <Title level={5}>Статистика отключения</Title>
//             <p>
//               <strong>Отключено населенных пунктов:</strong>{" "}
//               {incident.DisruptionStats.affected_settlements || "0"}
//             </p>
//             <p>
//               <strong>Отключено жителей:</strong>{" "}
//               {incident.DisruptionStats.affected_residents || "0"}
//             </p>
//             <p>
//               <strong>Отключено МКД:</strong>{" "}
//               {incident.DisruptionStats.affected_mkd || "0"}
//             </p>
//             <p>
//               <strong>Отключено больниц:</strong>{" "}
//               {incident.DisruptionStats.affected_hospitals || "0"}
//             </p>
//             <p>
//               <strong>Отключено поликлиник:</strong>{" "}
//               {incident.DisruptionStats.affected_clinics || "0"}
//             </p>
//             <p>
//               <strong>Отключено школ:</strong>{" "}
//               {incident.DisruptionStats.affected_schools || "0"}
//             </p>
//             <p>
//               <strong>Отключено детсадов:</strong>{" "}
//               {incident.DisruptionStats.affected_kindergartens || "0"}
//             </p>
//             <p>
//               <strong>boiler_shutdown:</strong>{" "}
//               {incident.DisruptionStats.boiler_shutdown || "0"}
//             </p>
//           </Col>
//         )}

//         <Col span={24}>
//           <Title level={5}>Отправка данных</Title>
//           <p>
//             <strong>Отправлено в Telegram:</strong>{" "}
//             <Switch checked={!!incident.sent_to_telegram} disabled />
//           </p>
//           <p>
//             <strong>Отправлено в АРМ ЕДДС:</strong>{" "}
//             <Switch checked={!!incident.sent_to_arm_edds} disabled />
//           </p>
//           <p>
//             <strong>Отправлено на сайт Мособлэнерго:</strong>{" "}
//             <Switch checked={!!incident.sent_to_moenergo} disabled />
//           </p>
//           <p>
//             <strong>Отправлено на сайт Минэнерго:</strong>{" "}
//             <Switch checked={!!incident.sent_to_minenergo} disabled />
//           </p>
//         </Col>
//       </Row>

//       {/* Модалка "Закрыть ТН" */}
//       <CloseIncidentModal
//         visible={closeModalVisible}
//         onCancel={() => setCloseModalVisible(false)}
//         incidentId={incident.documentId} // <-- передаём documentId
//         onSuccess={() => {
//           setCloseModalVisible(false);
//           onUpdate();
//         }}
//       />

//     </>
//   );
// }

///

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
//   Button,
// } from "antd";
// import useAuthStore from "../../stores/authStore";
// import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";
// import NewIncidentModal from "./NewIncidentModal";
// import CloseIncidentModal from "./CloseIncidentModal";

// const { Title, Text } = Typography;

// export default function MainContent() {
//   const { token } = useAuthStore();

//   // Список инцидентов и состояние загрузки
//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Модалка "Новое ТН"
//   const [newModalVisible, setNewModalVisible] = useState(false);

//   // Функции из zustand-store для форматирования
//   const {
//     extractText,
//     formatTime,
//     formatDate,
//     formatDateTime,
//     getPanelHeader,
//   } = useIncidentsUtilsStore();

//   // Функция загрузки инцидентов (используем и при обновлении)
//   const fetchIncidents = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:1337/api/incidents?populate=*",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const result = await response.json();
//       setIncidents(result.data || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchIncidents();
//     }
//   }, [token]);

//   // Фильтрация "в работе" / "выполнена"
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

//   // Формируем items для Collapse
//   const activeItems = activeIncidents.map((incident) => ({
//     key: incident.id,
//     label: getPanelHeader(incident),
//     children: (
//       <IncidentDetails
//         incident={incident}
//         onUpdate={fetchIncidents} // после закрытия обновим список
//       />
//     ),
//   }));

//   const completedItems = completedIncidents.map((incident) => ({
//     key: incident.id,
//     label: getPanelHeader(incident),
//     children: (
//       <IncidentDetails
//         incident={incident}
//         onUpdate={fetchIncidents} // на всякий случай тоже передадим
//       />
//     ),
//   }));

//   // Вкладки
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
//       {/* Заголовок и кнопка "Новое ТН" */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 15,
//         }}
//       >
//         <Title level={2} style={{ margin: 0 }}>
//           Технологические нарушения
//         </Title>
//         <Button type="primary" onClick={() => setNewModalVisible(true)}>
//           Новое ТН
//         </Button>
//       </div>

//       <Tabs
//         defaultActiveKey="1"
//         items={tabItems}
//         style={{ marginTop: 10, width: "100%" }}
//       />

//       {/* Модалка создания нового ТН */}
//       <NewIncidentModal
//         visible={newModalVisible}
//         onCancel={() => {
//           setNewModalVisible(false);
//           fetchIncidents(); // после создания тоже обновим список
//         }}
//       />
//     </div>
//   );
// }

// function IncidentDetails({ incident, onUpdate }) {
//   const { extractText, formatTime, formatDate, formatDateTime } =
//     useIncidentsUtilsStore();

//   const [closeModalVisible, setCloseModalVisible] = useState(false);

//   // Рассчитываем длительность
//   let durationHours = null;
//   if (incident.end_date && incident.end_time) {
//     const start = new Date(`${incident.start_date}T${incident.start_time}`);
//     const end = new Date(`${incident.end_date}T${incident.end_time}`);
//     if (!isNaN(start) && !isNaN(end)) {
//       durationHours = Math.round((end - start) / (1000 * 60 * 60));
//     }
//   }

//   return (
//     <>
//       <Row gutter={[0, 16]}>
//         <Col span={24}>
//           <Title level={5}>Основная информация</Title>
//           <p>
//             <strong>Статус:</strong> {incident.status_incident || "нет"}
//           </p>
//           <p>
//             <strong>Дата начала:</strong> {formatDate(incident.start_date)}{" "}
//             {formatTime(incident.start_time)}
//           </p>
//           <p>
//             <strong>Прогноз восстановления:</strong>{" "}
//             {incident.estimated_restoration_time
//               ? formatDateTime(incident.estimated_restoration_time)
//               : "нет"}
//           </p>
//           {incident.end_date && incident.end_time && (
//             <p>
//               <strong>Дата окончания:</strong> {formatDate(incident.end_date)}{" "}
//               {formatTime(incident.end_time)}
//             </p>
//           )}
//           {durationHours !== null && (
//             <p>
//               <strong>Продолжительность:</strong> {durationHours} часов
//             </p>
//           )}

//           {/* Кнопка "Выполнена" (открывает модалку) */}
//           {incident.status_incident?.trim() === "в работе" && (
//             <Button
//               type="default"
//               style={{ marginTop: 10 }}
//               onClick={() => setCloseModalVisible(true)}
//             >
//               Выполнена
//             </Button>
//           )}
//         </Col>

//         <Col span={24}>
//           <Title level={5}>Описание</Title>
//           <Text>{extractText(incident.description)}</Text>
//         </Col>

//         {incident.closure_description && (
//           <Col span={24}>
//             <Title level={5}>Описание закрытия</Title>
//             <Text>{extractText(incident.closure_description)}</Text>
//           </Col>
//         )}

//         {/* AddressInfo */}
//         {incident.AddressInfo && (
//           <Col span={24}>
//             <Title level={5}>Адресная информация</Title>
//             <p>
//               <strong>Тип поселения:</strong>{" "}
//               {incident.AddressInfo.settlement_type || "нет"}
//             </p>
//             <p>
//               <strong>Улицы:</strong> {incident.AddressInfo.streets || "нет"}
//             </p>
//             <p>
//               <strong>Тип застройки:</strong>{" "}
//               {incident.AddressInfo.building_type || "нет"}
//             </p>
//           </Col>
//         )}

//         {/* DisruptionStats */}
//         {incident.DisruptionStats && (
//           <Col span={24}>
//             <Title level={5}>Статистика отключения</Title>
//             <p>
//               <strong>Отключено населенных пунктов:</strong>{" "}
//               {incident.DisruptionStats.affected_settlements || "0"}
//             </p>
//             <p>
//               <strong>Отключено жителей:</strong>{" "}
//               {incident.DisruptionStats.affected_residents || "0"}
//             </p>
//             <p>
//               <strong>Отключено МКД:</strong>{" "}
//               {incident.DisruptionStats.affected_mkd || "0"}
//             </p>
//             <p>
//               <strong>Отключено больниц:</strong>{" "}
//               {incident.DisruptionStats.affected_hospitals || "0"}
//             </p>
//             <p>
//               <strong>Отключено поликлиник:</strong>{" "}
//               {incident.DisruptionStats.affected_clinics || "0"}
//             </p>
//             <p>
//               <strong>Отключено школ:</strong>{" "}
//               {incident.DisruptionStats.affected_schools || "0"}
//             </p>
//             <p>
//               <strong>Отключено детсадов:</strong>{" "}
//               {incident.DisruptionStats.affected_kindergartens || "0"}
//             </p>
//             <p>
//               <strong>boiler_shutdown:</strong>{" "}
//               {incident.DisruptionStats.boiler_shutdown || "0"}
//             </p>
//           </Col>
//         )}

//         <Col span={24}>
//           <Title level={5}>Отправка данных</Title>
//           <p>
//             <strong>Отправлено в Telegram:</strong>{" "}
//             <Switch checked={!!incident.sent_to_telegram} disabled />
//           </p>
//           <p>
//             <strong>Отправлено в АРМ ЕДДС:</strong>{" "}
//             <Switch checked={!!incident.sent_to_arm_edds} disabled />
//           </p>
//           <p>
//             <strong>Отправлено на сайт Мособлэнерго:</strong>{" "}
//             <Switch checked={!!incident.sent_to_moenergo} disabled />
//           </p>
//           <p>
//             <strong>Отправлено на сайт Минэнерго:</strong>{" "}
//             <Switch checked={!!incident.sent_to_minenergo} disabled />
//           </p>
//         </Col>
//       </Row>

//       {/* Модалка "Закрыть ТН" */}
//       <CloseIncidentModal
//         visible={closeModalVisible}
//         onCancel={() => setCloseModalVisible(false)}
//         incidentId={incident.documentId} // <-- передаём documentId
//         onSuccess={() => {
//           setCloseModalVisible(false);
//           onUpdate();
//         }}
//       />

//     </>
//   );
// }
