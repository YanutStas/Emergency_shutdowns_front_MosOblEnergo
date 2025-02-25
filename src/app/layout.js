import "./globals.css";
import ClientLayout from "./ClientLayout"; // Импортируем клиентский компонент

export const metadata = {
  title: "МосОблЭнерго ТН",
  description: "Технологические нарушения",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, padding: 0 }}>
        {/* Внутри server layout мы вызываем client layout */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "МосОблЭнерго ТН",
//   description: "Технологические нарушения",
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className={`${geistSans.variable} ${geistMono.variable}`}>
//         {children}
//       </body>
//     </html>
//   );
// }
