"use client";
import React, { useEffect, useState } from "react";
import {
  Spin,
  Alert,
  Typography,
  Button,
  Space,
  Pagination,
  Switch,
  message,
  DatePicker,
  ConfigProvider,
} from "antd";

import ru_RU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/ru";

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);
dayjs.locale("ru");

import Link from "next/link";

import useAuthStore from "../../stores/authStore";
import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";

// Наш zustand-store для инцидентов
import { useIncidentsDataStore } from "../../stores/incidentsDataStore";

// Наш «чистый» компонент таблицы
import IncidentsTable from "../IncidentsTable";

// Модалки
import NewIncidentModal from "./NewIncidentModal";
import CloseIncidentModal from "./CloseIncidentModal";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function MainContent() {
  const { token } = useAuthStore();

  // Забираем состояния и метод загрузки из zustand
  const { incidents, loading, error, fetchIncidents } = useIncidentsDataStore();

  // Модалки
  const [newModalVisible, setNewModalVisible] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState(null);

  // Фильтр по статусу: "all", "active", "completed"
  const [filter, setFilter] = useState("all");

  // Фильтр по периоду (две даты Day.js)
  const [dateRange, setDateRange] = useState(null);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Форматирующие функции из вашего стора
  const { extractText, formatTime, formatDate, formatDateTime } =
    useIncidentsUtilsStore();

  // Загружаем инциденты при появлении токена
  useEffect(() => {
    if (token) {
      fetchIncidents(token);
    }
  }, [token, fetchIncidents]);

  // Если идёт загрузка
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Если ошибка
  if (error) {
    return (
      <div style={{ marginTop: 50 }}>
        <Alert type="error" message={error} />
      </div>
    );
  }

  // Фильтруем по статусу
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

  // Фильтрация по периоду
  if (dateRange && dateRange[0] && dateRange[1]) {
    const [start, end] = dateRange;
    filteredIncidents = filteredIncidents.filter((incident) => {
      const incidentDate = dayjs(incident.start_date, "YYYY-MM-DD");
      return incidentDate.isBetween(start, end, "day", "[]");
    });
  }

  // Сортировка от новых к старым
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const dateA = dayjs(
      `${a.start_date}T${a.start_time}`,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );
    const dateB = dayjs(
      `${b.start_date}T${b.start_time}`,
      "YYYY-MM-DDTHH:mm:ss.SSS"
    );
    return dateB.valueOf() - dateA.valueOf();
  });

  // Пагинация
  const totalCount = sortedIncidents.length;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageIncidents = sortedIncidents.slice(startIndex, endIndex);

  // Готовим dataSource для IncidentsTable
  const dataSource = pageIncidents.map((incident) => {
    const cityName = incident.AddressInfo?.city_district?.name || "Неизвестно";
    const streets = incident.AddressInfo?.streets || "-";

    const startDateTime = `${formatDate(incident.start_date)} ${formatTime(
      incident.start_time
    )}`;

    const endDate = incident.end_date ? formatDate(incident.end_date) : "-";
    const endTime = incident.end_time ? formatTime(incident.end_time) : "-";

    // Подсчёт часов до восстановления
    let restHours = "";
    if (incident.estimated_restoration_time) {
      const start = dayjs(`${incident.start_date}T${incident.start_time}`);
      const est = dayjs(incident.estimated_restoration_time);
      const diff = est.diff(start, "hour");
      restHours = diff >= 0 ? diff : 0;
    }

    return {
      key: incident.id,
      incident,
      cityName,
      streets,
      startDateTime,
      endDateTime: `${endDate} ${endTime}`,
      restHours,
      status_incident: incident.status_incident,
      documentId: incident.documentId,
    };
  });

  // Коллбэк, когда пользователь нажал "Выполнена" в таблице
  const handleCloseIncident = (documentId) => {
    setCurrentIncidentId(documentId);
    setCloseModalVisible(true);
  };

  return (
    <ConfigProvider locale={ru_RU}>
      <div style={{ padding: 20 }}>
        {/* Шапка с заголовком, кнопками "Новое ТН" и "Статистика" */}
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
          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="primary" onClick={() => setNewModalVisible(true)}>
              Новое ТН
            </Button>
            {/* Кнопка для перехода на страницу статистики */}
            <Link href="/Stat">
              <Button>Статистика</Button>
            </Link>
          </div>
        </div>

        {/* Блок фильтров */}
        <div
          style={{
            marginBottom: 15,
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <Space.Compact>
            <Button
              type={filter === "all" ? "primary" : "default"}
              onClick={() => {
                setFilter("all");
                setCurrentPage(1);
              }}
            >
              Все ТН
            </Button>
            <Button
              type={filter === "active" ? "primary" : "default"}
              onClick={() => {
                setFilter("active");
                setCurrentPage(1);
              }}
            >
              В работе
            </Button>
            <Button
              type={filter === "completed" ? "primary" : "default"}
              onClick={() => {
                setFilter("completed");
                setCurrentPage(1);
              }}
            >
              Выполненные
            </Button>
          </Space.Compact>

          <RangePicker
            format="DD.MM.YYYY"
            onChange={(dates) => {
              setDateRange(dates);
              setCurrentPage(1);
            }}
            allowClear
          />
        </div>

        {/* Тут используем нашу отдельную таблицу */}
        <IncidentsTable
          dataSource={dataSource}
          extractText={extractText}
          formatDate={formatDate}
          formatTime={formatTime}
          formatDateTime={formatDateTime}
          onCloseIncident={handleCloseIncident}
        />

        <div style={{ marginTop: 20, textAlign: "center" }}>
          <Pagination
            current={currentPage}
            total={totalCount}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>

        <NewIncidentModal
          visible={newModalVisible}
          onCancel={() => {
            setNewModalVisible(false);
            fetchIncidents(token); // после закрытия можем обновить список
          }}
        />
        <CloseIncidentModal
          visible={closeModalVisible}
          incidentId={currentIncidentId}
          onCancel={() => setCloseModalVisible(false)}
          onSuccess={() => {
            setCloseModalVisible(false);
            message.success("ТН переведена в статус 'Выполнена'!");
            // Обновляем список
            fetchIncidents(token);
          }}
        />

        <style jsx global>{`
          .active-row {
            background-color: #fff1f0 !important;
          }
          .completed-row {
            background-color: #f6ffed !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
}

// "use client";
// import React, { useEffect, useState } from "react";
// import {
//   Spin,
//   Alert,
//   Typography,
//   Button,
//   Space,
//   Pagination,
//   Table,
//   Switch,
//   message,
//   DatePicker,
//   ConfigProvider,
// } from "antd";

// import ru_RU from "antd/locale/ru_RU";
// import dayjs from "dayjs";
// import customParseFormat from "dayjs/plugin/customParseFormat";
// import isBetween from "dayjs/plugin/isBetween";
// import "dayjs/locale/ru";

// dayjs.extend(customParseFormat);
// dayjs.extend(isBetween);
// dayjs.locale("ru");

// import useAuthStore from "../../stores/authStore";
// import { useIncidentsUtilsStore } from "../../stores/incidentsUtilsStore";
// import NewIncidentModal from "./NewIncidentModal";
// import CloseIncidentModal from "./CloseIncidentModal";

// const { Title, Text } = Typography;
// const { RangePicker } = DatePicker;

// export default function MainContent() {
//   const { token } = useAuthStore();

//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Модалка «Новое ТН»
//   const [newModalVisible, setNewModalVisible] = useState(false);

//   // Модалка «Закрыть ТН»
//   const [closeModalVisible, setCloseModalVisible] = useState(false);
//   const [currentIncidentId, setCurrentIncidentId] = useState(null);

//   // Фильтр по статусу: "all", "active", "completed"
//   const [filter, setFilter] = useState("all");

//   // Фильтр по периоду (Day.js-объекты приходят из RangePicker)
//   const [dateRange, setDateRange] = useState(null);

//   // Пагинация
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 10;

//   const { extractText, formatTime, formatDate, formatDateTime } =
//     useIncidentsUtilsStore();

//   // Загрузка инцидентов
//   const fetchIncidents = async () => {
//     setLoading(true);
//     try {
//       const url =
//         "http://localhost:1337/api/incidents?" +
//         "populate[AddressInfo][populate]=city_district&populate=DisruptionStats";
//       const response = await fetch(url, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
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

//   // Фильтрация по статусу
//   let filteredIncidents = [];
//   if (filter === "all") {
//     filteredIncidents = incidents;
//   } else if (filter === "active") {
//     filteredIncidents = incidents.filter(
//       (item) => item.status_incident?.trim() === "в работе"
//     );
//   } else if (filter === "completed") {
//     filteredIncidents = incidents.filter(
//       (item) => item.status_incident?.trim() === "выполнена"
//     );
//   }

//   // Фильтрация по периоду
//   if (dateRange && dateRange[0] && dateRange[1]) {
//     const [start, end] = dateRange;
//     filteredIncidents = filteredIncidents.filter((incident) => {
//       // incident.start_date — строка "YYYY-MM-DD"
//       const incidentDate = dayjs(incident.start_date, "YYYY-MM-DD");
//       // Проверяем, попадает ли incidentDate в [start, end] включительно
//       const pass = incidentDate.isBetween(start, end, "day", "[]");

//       return pass;
//     });
//   }

//   // Сортировка от новых к старым
//   const sortedIncidents = [...filteredIncidents].sort((a, b) => {
//     const dateA = dayjs(
//       `${a.start_date}T${a.start_time}`,
//       "YYYY-MM-DDTHH:mm:ss.SSS"
//     );
//     const dateB = dayjs(
//       `${b.start_date}T${b.start_time}`,
//       "YYYY-MM-DDTHH:mm:ss.SSS"
//     );
//     return dateB.valueOf() - dateA.valueOf();
//   });

//   // Пагинация
//   const totalCount = sortedIncidents.length;
//   const startIndex = (currentPage - 1) * pageSize;
//   const endIndex = startIndex + pageSize;
//   const pageIncidents = sortedIncidents.slice(startIndex, endIndex);

//   // Формируем dataSource для таблицы
//   const dataSource = pageIncidents.map((incident) => {
//     const cityName = incident.AddressInfo?.city_district?.name || "Неизвестно";
//     const streets = incident.AddressInfo?.streets || "-";

//     // Форматируем «Дата и время отключения»
//     const startDateTime = `${formatDate(incident.start_date)} ${formatTime(
//       incident.start_time
//     )}`;

//     // Форматируем «Дата окончания»
//     const endDate = incident.end_date ? formatDate(incident.end_date) : "-";
//     const endTime = incident.end_time ? formatTime(incident.end_time) : "-";

//     // Подсчёт прогнозируемых часов до восстановления
//     let restHours = "";
//     if (incident.estimated_restoration_time) {
//       const start = dayjs(`${incident.start_date}T${incident.start_time}`);
//       const est = dayjs(incident.estimated_restoration_time);
//       const diff = est.diff(start, "hour");
//       restHours = diff >= 0 ? diff : 0;
//     }

//     return {
//       key: incident.id,
//       incident,
//       cityName,
//       streets,
//       startDateTime,
//       endDateTime: `${endDate} ${endTime}`,
//       restHours,
//       status_incident: incident.status_incident,
//       documentId: incident.documentId,
//     };
//   });

//   // Определяем колонки таблицы
//   const columns = [
//     {
//       title: "Городской округ",
//       dataIndex: "cityName",
//       key: "cityName",
//     },
//     {
//       title: "Улицы",
//       dataIndex: "streets",
//       key: "streets",
//     },
//     {
//       title: "Дата и время отключения",
//       dataIndex: "startDateTime",
//       key: "startDateTime",
//     },
//     {
//       title: "Дата окончания",
//       dataIndex: "endDateTime",
//       key: "endDateTime",
//       render: (text, record) =>
//         record.status_incident?.trim() === "выполнена" ? text : "-",
//     },
//     {
//       title: "Прогнозируемое время включения (ч)",
//       dataIndex: "restHours",
//       key: "restHours",
//     },
//     {
//       title: "Действие",
//       key: "action",
//       render: (_, record) => {
//         if (record.status_incident?.trim() === "в работе") {
//           return (
//             <Button
//               type="default"
//               onClick={() => {
//                 setCurrentIncidentId(record.documentId);
//                 setCloseModalVisible(true);
//               }}
//             >
//               Выполнена
//             </Button>
//           );
//         }
//         return null;
//       },
//     },
//   ];

//   const expandedRowRender = (record) => {
//     const incident = record.incident;

//     let durationHours = null;
//     if (incident.end_date && incident.end_time) {
//       const start = dayjs(`${incident.start_date}T${incident.start_time}`);
//       const end = dayjs(`${incident.end_date}T${incident.end_time}`);
//       if (start.isValid() && end.isValid()) {
//         durationHours = end.diff(start, "hour");
//       }
//     }

//     return (
//       <div style={{ background: "#fafafa", padding: 16 }}>
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

//         <Title level={5}>Описание</Title>
//         <Text>{extractText(incident.description)}</Text>
//         {incident.closure_description && (
//           <>
//             <Title level={5} style={{ marginTop: 16 }}>
//               Описание закрытия
//             </Title>
//             <Text>{extractText(incident.closure_description)}</Text>
//           </>
//         )}

//         {incident.AddressInfo && (
//           <>
//             <Title level={5} style={{ marginTop: 16 }}>
//               Адресная информация
//             </Title>
//             <p>
//               <strong>Тип поселения:</strong>{" "}
//               {incident.AddressInfo.settlement_type || "нет"}
//             </p>
//             {incident.AddressInfo.city_district && (
//               <p>
//                 <strong>Город:</strong>{" "}
//                 {incident.AddressInfo.city_district.name}
//               </p>
//             )}
//             <p>
//               <strong>Улицы:</strong> {incident.AddressInfo.streets || "нет"}
//             </p>
//             <p>
//               <strong>Тип застройки:</strong>{" "}
//               {incident.AddressInfo.building_type || "нет"}
//             </p>
//           </>
//         )}

//         {incident.DisruptionStats && (
//           <>
//             <Title level={5} style={{ marginTop: 16 }}>
//               Статистика отключения
//             </Title>
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
//               <strong>Отключено бойлерных/котельн:</strong>{" "}
//               {incident.DisruptionStats.boiler_shutdown || "0"}
//             </p>
//           </>
//         )}

//         <Title level={5} style={{ marginTop: 16 }}>
//           Отправка данных
//         </Title>
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
//       </div>
//     );
//   };

//   // Подсвечиваем строки
//   const rowClassName = (record) => {
//     return record.status_incident?.trim() === "в работе"
//       ? "active-row"
//       : "completed-row";
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
//         <Alert type="error" message={error} />
//       </div>
//     );
//   }

//   return (
//     <ConfigProvider locale={ru_RU}>
//       <div style={{ padding: 20 }}>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginBottom: 15,
//           }}
//         >
//           <Title level={2} style={{ margin: 0 }}>
//             Технологические нарушения
//           </Title>
//           <Button type="primary" onClick={() => setNewModalVisible(true)}>
//             Новое ТН
//           </Button>
//         </div>

//         <div
//           style={{
//             marginBottom: 15,
//             display: "flex",
//             flexWrap: "wrap",
//             gap: "10px",
//             alignItems: "center",
//           }}
//         >
//           <Space.Compact>
//             <Button
//               type={filter === "all" ? "primary" : "default"}
//               onClick={() => {
//                 setFilter("all");
//                 setCurrentPage(1);
//               }}
//             >
//               Все ТН
//             </Button>
//             <Button
//               type={filter === "active" ? "primary" : "default"}
//               onClick={() => {
//                 setFilter("active");
//                 setCurrentPage(1);
//               }}
//             >
//               В работе
//             </Button>
//             <Button
//               type={filter === "completed" ? "primary" : "default"}
//               onClick={() => {
//                 setFilter("completed");
//                 setCurrentPage(1);
//               }}
//             >
//               Выполненные
//             </Button>
//           </Space.Compact>

//           <RangePicker
//             format="DD.MM.YYYY"
//             onChange={(dates, dateStrings) => {
//               console.log("dates (Day.js) =", dates);
//               console.log("dateStrings =", dateStrings);
//               setDateRange(dates);
//               setCurrentPage(1);
//             }}
//             allowClear
//           />
//         </div>

//         <Table
//           columns={columns}
//           dataSource={dataSource}
//           pagination={false}
//           expandable={{ expandedRowRender }}
//           rowClassName={rowClassName}
//         />

//         <div style={{ marginTop: 20, textAlign: "center" }}>
//           <Pagination
//             current={currentPage}
//             total={totalCount}
//             pageSize={pageSize}
//             onChange={(page) => setCurrentPage(page)}
//           />
//         </div>

//         <NewIncidentModal
//           visible={newModalVisible}
//           onCancel={() => {
//             setNewModalVisible(false);
//             fetchIncidents();
//           }}
//         />
//         <CloseIncidentModal
//           visible={closeModalVisible}
//           incidentId={currentIncidentId}
//           onCancel={() => setCloseModalVisible(false)}
//           onSuccess={() => {
//             setCloseModalVisible(false);
//             message.success("ТН переведена в статус 'Выполнена'!");
//             fetchIncidents();
//           }}
//         />

//         <style jsx global>{`
//           .active-row {
//             background-color: #fff1f0 !important;
//           }
//           .completed-row {
//             background-color: #f6ffed !important;
//           }
//         `}</style>
//       </div>
//     </ConfigProvider>
//   );
// }
