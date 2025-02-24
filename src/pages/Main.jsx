"use client";
import { useEffect } from "react";
import useAuthStore from "../stores/authStore";
import AuthForm from "../components/AuthForm";
import MainContent from "./MainContent";

const Main = () => {
  const { token } = useAuthStore();

  if (!token) return <AuthForm />;
  return <MainContent />;
};

export default Main;

// "use client";
// import React, { useEffect, useState } from "react";
// import { Spin, Alert, Card, List, Tabs } from "antd";
// import IdTN from "../components/CardComponent/Id";
// import StartDate from "../components/CardComponent/StartDate";
// import Description from "../components/CardComponent/Description";
// import EstimatedRestorationTime from "../components/CardComponent/EstimatedRestorationTime";

// const Main = () => {
//   const [incidents, setIncidents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const API_TOKEN =
//     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzQwMzg5NjI1LCJleHAiOjE3NDI5ODE2MjV9.HAJOf5jjSMJT_srgpIy05hEiBCcnRNMnhhjQnMNd5Zc";

//   useEffect(() => {
//     const fetchIncidents = async () => {
//       try {
//         const response = await fetch("http://localhost:1337/api/incidents", {
//           headers: {
//             Authorization: `Bearer ${API_TOKEN}`,
//           },
//         });
//         if (!response.ok)
//           throw new Error(`HTTP error! status: ${response.status}`);
//         const data = await response.json();
//         setIncidents(data.data || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchIncidents();
//   }, []);

//   const activeIncidents = incidents.filter(
//     (incident) => incident.status_incident === "в работе"
//   );
//   const completedIncidents = incidents.filter(
//     (incident) => incident.status_incident === "выполнена"
//   );

//   if (loading)
//     return (
//       <Spin size="large" style={{ display: "block", margin: "40px auto" }} />
//     );
//   if (error)
//     return (
//       <Alert
//         message="Ошибка загрузки данных"
//         description={error}
//         type="error"
//         style={{ margin: 20 }}
//       />
//     );

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

//   return (
//     <div style={{ padding: "10px", maxWidth: "100vw", overflowX: "auto" }}>
//       <Tabs
//         defaultActiveKey="1"
//         style={{ marginBottom: 0 }}
//         items={[
//           {
//             key: "1",
//             label: (
//               <span style={{ fontSize: "1.5em", fontWeight: 500 }}>
//                 Начало ТН ({activeIncidents.length})
//               </span>
//             ),
//             children: (
//               <section style={{ marginTop: 10 }}>
//                 <h2 style={{ fontSize: "1.8em", marginBottom: 10 }}>
//                   Активные технологические нарушения
//                 </h2>
//                 <List
//                   dataSource={activeIncidents}
//                   renderItem={(incident) => (
//                     <List.Item style={{ padding: "5px 0" }}>
//                       <Card
//                         style={{
//                           width: "100%",
//                           display: "flex",
//                           flexDirection: "row",
//                           alignItems: "center",
//                           backgroundColor: "#fffbe6",
//                           padding: "10px",
//                           margin: 0,
//                         }}
//                       >
//                         <IdTN id={incident.id} />
//                         <StartDate
//                           date={formatDate(
//                             incident.start_date,
//                             incident.start_time
//                           )}
//                         />
//                         <Description text={extractText(incident.description)} />
//                         <EstimatedRestorationTime
//                           date={
//                             incident.estimated_restoration_time
//                               ? formatDate(
//                                   incident.estimated_restoration_time.split(
//                                     "T"
//                                   )[0],
//                                   incident.estimated_restoration_time.split(
//                                     "T"
//                                   )[1]
//                                 )
//                               : "Нет данных"
//                           }
//                         />
//                       </Card>
//                     </List.Item>
//                   )}
//                 />
//               </section>
//             ),
//           },
//           {
//             key: "2",
//             label: (
//               <span style={{ fontSize: "1.5em", fontWeight: 500 }}>
//                 Окончание ТН ({completedIncidents.length})
//               </span>
//             ),
//             children: (
//               <section style={{ marginTop: 10 }}>
//                 <h2 style={{ fontSize: "1.8em", marginBottom: 10 }}>
//                   Завершенные технологические нарушения
//                 </h2>
//                 <List
//                   dataSource={completedIncidents}
//                   renderItem={(incident) => (
//                     <List.Item style={{ padding: "5px 0" }}>
//                       <Card
//                         style={{
//                           width: "100%",
//                           display: "flex",
//                           flexDirection: "row",
//                           alignItems: "center",
//                           backgroundColor: "#f6ffed",
//                           padding: "10px",
//                           margin: 0,
//                         }}
//                       >
//                         <IdTN id={incident.id} />
//                         <StartDate
//                           date={formatDate(
//                             incident.end_date,
//                             incident.end_time
//                           )}
//                         />
//                         <Description
//                           text={extractText(incident.closure_description)}
//                         />
//                         <div style={{ flex: 2 }}>
//                           <p>
//                             <strong>Продолжительность:</strong>{" "}
//                             {Math.round(
//                               (new Date(
//                                 `${incident.end_date}T${incident.end_time}`
//                               ) -
//                                 new Date(
//                                   `${incident.start_date}T${incident.start_time}`
//                                 )) /
//                                 (1000 * 60 * 60)
//                             )}{" "}
//                             часов
//                           </p>
//                         </div>
//                       </Card>
//                     </List.Item>
//                   )}
//                 />
//               </section>
//             ),
//           },
//         ]}
//       />
//     </div>
//   );
// };

// export default Main;
