"use client";
import React, { useEffect, useState } from "react";
import useAuthStore from "../stores/authStore";
import AuthForm from "../components/AuthForm";
import MainContent from "../components/MainContent/MainContent";

const Main = () => {
  const { token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // До монтирования ничего не рендерим – сервер и клиент будут совпадать
  if (!mounted) return null;

  return <>{!token ? <AuthForm /> : <MainContent />}</>;
};

export default Main;

// "use client";
// import Image from "next/image";
// import useAuthStore from "../stores/authStore";
// import AuthForm from "../components/AuthForm";
// import MainContent from "../components/MainContent/MainContent";

// const Main = () => {
//   const { token } = useAuthStore();

//   return <>{!token ? <AuthForm /> : <MainContent />}</>;
// };

// export default Main;
