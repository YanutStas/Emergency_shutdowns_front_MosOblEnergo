"use client";
import { Layout, Button } from "antd";
import Image from "next/image";
import useAuthStore from "../stores/authStore";

const { Header } = Layout;

export default function AppHeader() {
  const { token, logout } = useAuthStore();

  return (
    <Header
      style={{
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
    
      <div style={{ display: "flex", alignItems: "center" }}>
        <Image
          src="/logoBlue.svg"
          alt="Логотип"
          width={300}   
          height={100}  
          style={{ objectFit: "contain" }}
        />
      </div>


      {token && (
        <Button type="primary" danger onClick={logout}>
          Выйти
        </Button>
      )}
    </Header>
  );
}
