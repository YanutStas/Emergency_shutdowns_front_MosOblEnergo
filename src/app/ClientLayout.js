"use client";
import { Layout } from "antd";
import AppFooter from "../components/AppFooter";

export default function ClientLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Content style={{ padding: 0 }}>{children}</Layout.Content>
      <Layout.Footer style={{ padding: 0 }}>
        <AppFooter />
      </Layout.Footer>
    </Layout>
  );
}
