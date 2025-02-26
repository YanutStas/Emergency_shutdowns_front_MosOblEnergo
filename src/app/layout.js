import ClientLayout from "./ClientLayout"; 

export const metadata = {
  title: "МосОблЭнерго ТН",
  description: "Технологические нарушения",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
