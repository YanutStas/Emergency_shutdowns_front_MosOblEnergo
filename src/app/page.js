import Image from "next/image";
import styles from "./page.module.css";
import AppFooter from "@/components/AppFooter";
import Main from "@/pages/Main";

export default function Home() {
  return (
    <div className={styles.page}>
      <Main />
      {/* <AppFooter className={styles.footer} /> */}
    </div>
  );
}
