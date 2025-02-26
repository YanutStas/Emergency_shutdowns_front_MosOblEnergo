"use client";
import { Layout } from "antd";
import AppFooter from "../components/AppFooter";

export default function ClientLayout({ children }) {
  return (
    <Layout>
      <Layout.Content>{children}</Layout.Content>
      <Layout.Footer>
        <AppFooter />
      </Layout.Footer>
    </Layout>
  );
}
