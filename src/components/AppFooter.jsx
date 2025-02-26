"use client";
import React from "react";
import { Typography, Space } from "antd";

const { Link } = Typography;

const AppFooter = () => {
  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <Space direction="vertical" size="large" align="center">
        <Typography.Text>
          Copyright ©{" "}
          <Link
            href="https://mosoblenergo.ru/"
            target="_blank"
            rel="noopener noreferrer"
          >
            АО «Мособлэнерго»
          </Link>{" "}
          | Разработка сайта - Станислав Януть | 2025 год
        </Typography.Text>
      </Space>
    </div>
  );
};

export default AppFooter;
