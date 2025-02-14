import Image from "next/image";
import styles from "./page.module.css";
import AppFooter from "@/components/AppFooter";
import Main from "@/pages/Main";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logoBlue.svg"
          alt="ЛогоМосОблЭнерго"
          width={180}
          height={38}
          priority
        />
        <ol>
          <li>
           Мы начали работать над страничкой с Внеплановыми отключениями
          </li>
          <li>Мы продолжим работать над страничкой с Внеплановыми отключениями</li>
        </ol>


      </main> */}
      <Main />
      <AppFooter className={styles.footer} />
    </div>
  );
}
