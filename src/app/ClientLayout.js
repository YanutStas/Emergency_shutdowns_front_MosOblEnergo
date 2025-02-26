"use client";
import { Layout } from "antd";
import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";

export default function ClientLayout({ children }) {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
      }}
    >
      {/* Подключаем шапку */}
      <AppHeader />

      {/* Основной контент */}
      <Layout.Content
        style={{
          flex: 1,
          padding: "20px",
          background: "#fff",
        }}
      >
        {children}
      </Layout.Content>

      {/* Футер */}
      <Layout.Footer
        style={{
          background: "#fff",
          textAlign: "center",
        }}
      >
        <AppFooter />
      </Layout.Footer>
    </Layout>
  );
}

// "use client";
// import { Layout } from "antd";
// import AppFooter from "../components/AppFooter";

// export default function ClientLayout({ children }) {
//   return (
//     <Layout
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         background: "#fff",
//       }}
//     >
//       <Layout.Content
//         style={{
//           flex: 1,
//           padding: "20px",
//           background: "#fff",
//         }}
//       >
//         {children}
//       </Layout.Content>
//       <Layout.Footer
//         style={{
//           background: "#fff",
//           textAlign: "center",
//         }}
//       >
//         <AppFooter />
//       </Layout.Footer>
//     </Layout>
//   );
// }
