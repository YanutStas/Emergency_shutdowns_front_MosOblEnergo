"use client";
import Image from "next/image";
import useAuthStore from "../stores/authStore";
import AuthForm from "../components/AuthForm";
import MainContent from "../components/MainContent/MainContent";

const Main = () => {
  const { token } = useAuthStore();

  return <>{!token ? <AuthForm /> : <MainContent />}</>;
};

export default Main;
