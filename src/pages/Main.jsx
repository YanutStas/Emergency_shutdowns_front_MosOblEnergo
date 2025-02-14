"use client";

import React from "react";
import { Anchor } from "antd";

const Main = () => (
  <>
    <div
      style={{
        padding: "20px",
      }}
    >
      <Anchor
        direction="horizontal"
        items={[
          {
            key: "part-1",
            href: "#start",
            title: (
              <span style={{ fontSize: "2em", fontWeight: 500 }}>
                Начало ТН
              </span>
            ),
          },
          {
            key: "part-2",
            href: "#finish",
            title: (
              <span style={{ fontSize: "2em", fontWeight: 500 }}>
                Окончание ТН
              </span>
            ),
          },
        ]}
      />
    </div>
    <div>
      <div
        id="part-1"
        style={{
          width: "100vw",
          height: "100vh",
          textAlign: "center",
          background: "rgba(0,255,0,0.02)",
        }}
      />
      <div
        id="part-2"
        style={{
          width: "100vw",
          height: "100vh",
          textAlign: "center",
          background: "rgba(0,0,255,0.02)",
        }}
      />
    </div>
  </>
);
export default Main;
