"use client";
import Image from "next/image";
import useAuthStore from "../stores/authStore";
import AuthForm from "../components/AuthForm";
import MainContent from "../components/MainContent/MainContent";

const Main = () => {
  const { token } = useAuthStore();

  return (
    <>
      <div
        style={{ textAlign: "center", marginTop: "20px", marginBottom: "20px" }}
      >
        <Image src="/logoBlue.svg" alt="Логотип" width={300} height={150} />
      </div>
      {!token ? <AuthForm /> : <MainContent />}
    </>
  );
};

export default Main;

// "use client";
// import { useEffect } from "react";
// import useAuthStore from "../stores/authStore";
// import AuthForm from "../components/AuthForm";
// import MainContent from "../components/MainContent/MainContent";

// const Main = () => {
//   const { token } = useAuthStore();

//   if (!token) return <AuthForm />;
//   return <MainContent />;
// };

// export default Main;
