"use client";
import React from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  message,
  Button,
} from "antd";
import ru_RU from "antd/locale/ru_RU";
import moment from "moment";
import useAuthStore from "../../stores/authStore";
import { getRandomCloseIncidentFields } from "../../utils/magicFill";

export default function CloseIncidentModal({
  visible,
  onCancel,
  incidentId,
  onSuccess,
}) {
  const [form] = Form.useForm();
  const { token } = useAuthStore();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      const end_date = values.end_date.format("YYYY-MM-DD");
      const end_time = values.end_time.format("HH:mm") + ":00.000";

      const closure_description = [
        {
          type: "paragraph",
          children: [{ type: "text", text: values.closure_description || "" }],
        },
      ];

      const payload = {
        data: {
          end_date,
          end_time,
          closure_description,
          status_incident: "выполнена",
        },
      };

      const response = await fetch(
        `http://localhost:1337/api/incidents/${incidentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка при обновлении: ${response.status}`);
      }

      const result = await response.json();
      console.log("Ответ Strapi при закрытии ТН:", result);
      message.success(
        "ТН переведена в статус 'Выполнена'! Отличная работа, Morty!"
      );
      onCancel();
      form.resetFields();
      onSuccess();
    } catch (err) {
      console.error("Ошибка закрытия ТН:", err);
      message.error(
        "Не удалось перевести ТН в статус 'Выполнена'. Что-то пошло не так, Morty!"
      );
    }
  };

  // Кнопка "Волшебство" — чтобы быстро заполнить форму закрытия
  const handleMagic = () => {
    const randomValues = getRandomCloseIncidentFields();
    form.setFieldsValue(randomValues);
    message.info("Волшебство сработало! Поля заполнены случайными значениями.");
  };

  return (
    <Modal
      title="Закрыть ТН"
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Отправить"
      cancelText="Отмена"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="end_date"
          label="Дата окончания"
          rules={[{ required: true, message: "Укажите дату окончания" }]}
        >
          <DatePicker
            locale={ru_RU.DatePicker}
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <Form.Item
          name="end_time"
          label="Время окончания"
          rules={[{ required: true, message: "Укажите время окончания" }]}
        >
          <TimePicker
            format="HH:mm"
            style={{ width: "100%" }}
            placeholder="Выберите время"
          />
        </Form.Item>

        <Form.Item
          name="closure_description"
          label="Описание закрытия"
          rules={[{ required: true, message: "Укажите описание закрытия" }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Что было сделано для устранения?"
          />
        </Form.Item>
      </Form>

      <div style={{ textAlign: "right", marginTop: 10 }}>
        <Button onClick={handleMagic}>Волшебство</Button>
      </div>
    </Modal>
  );
}

// "use client";
// import React from "react";
// import { Modal, Form, Input, DatePicker, TimePicker, message, Button } from "antd";
// import ru_RU from "antd/locale/ru_RU";
// import moment from "moment";
// import useAuthStore from "../../stores/authStore";

// // Функция для получения случайного целого числа в диапазоне [min, max]
// function randomBetween(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// export default function CloseIncidentModal({
//   visible,
//   onCancel,
//   incidentId, // documentId (строка) для PUT-запроса
//   onSuccess,
// }) {
//   const [form] = Form.useForm();
//   const { token } = useAuthStore();

//   // Обработчик «Отправить»
//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();

//       // end_date в формате "YYYY-MM-DD"
//       const end_date = values.end_date.format("YYYY-MM-DD");
//       // end_time в формате "HH:mm:00.000"
//       const end_time = values.end_time.format("HH:mm") + ":00.000";

//       // closure_description в формате Rich Text
//       const closure_description = [
//         {
//           type: "paragraph",
//           children: [
//             {
//               type: "text",
//               text: values.closure_description || "",
//             },
//           ],
//         },
//       ];

//       // Собираем данные для PUT-запроса
//       const payload = {
//         data: {
//           end_date,
//           end_time,
//           closure_description,
//           status_incident: "выполнена",
//         },
//       };

//       // Запрос на обновление (PUT) по documentId
//       const response = await fetch(
//         `http://localhost:1337/api/incidents/${incidentId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Ошибка при обновлении: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("Ответ Strapi при закрытии ТН:", result);

//       message.success("ТН переведена в статус 'Выполнена'!");
//       onCancel();
//       form.resetFields();
//       onSuccess(); // Сообщаем родителю, что всё ок
//     } catch (err) {
//       console.error("Ошибка закрытия ТН:", err);
//       message.error("Не удалось перевести ТН в статус 'Выполнена'");
//     }
//   };

//   // Обработчик «Волшебство»
//   const handleMagic = () => {
//     // Генерируем случайные дату и время (например, в феврале 2025)
//     const randomDay = randomBetween(20, 28); // 20-28 февраля
//     const randomHour = randomBetween(0, 23);
//     const randomMinute = randomBetween(0, 59);

//     // Заполняем описание
//     const randomDesc = `Устранили за ${randomBetween(10, 60)} минут. Все довольны!`;

//     // Устанавливаем значения в форму
//     form.setFieldsValue({
//       end_date: moment(`2025-02-${randomDay}`, "YYYY-MM-DD"),
//       end_time: moment(`${randomHour}:${randomMinute}`, "HH:mm"),
//       closure_description: randomDesc,
//     });
//   };

//   return (
//     <Modal
//       title="Закрыть ТН"
//       open={visible}
//       onOk={handleOk}
//       onCancel={() => {
//         form.resetFields();
//         onCancel();
//       }}
//       okText="Отправить"
//       cancelText="Отмена"
//     >
//       <Form form={form} layout="vertical">
//         <Form.Item
//           name="end_date"
//           label="Дата окончания"
//           rules={[{ required: true, message: "Укажите дату окончания" }]}
//         >
//           <DatePicker
//             locale={ru_RU.DatePicker}
//             format="DD.MM.YYYY"
//             style={{ width: "100%" }}
//             placeholder="Выберите дату"
//           />
//         </Form.Item>

//         <Form.Item
//           name="end_time"
//           label="Время окончания"
//           rules={[{ required: true, message: "Укажите время окончания" }]}
//         >
//           <TimePicker
//             format="HH:mm"
//             style={{ width: "100%" }}
//             placeholder="Выберите время"
//           />
//         </Form.Item>

//         <Form.Item
//           name="closure_description"
//           label="Описание закрытия"
//           rules={[{ required: true, message: "Укажите описание закрытия" }]}
//         >
//           <Input.TextArea
//             rows={3}
//             placeholder="Что было сделано для устранения?"
//           />
//         </Form.Item>
//       </Form>

//       {/* Кнопка "Волшебство" внутри контента модалки */}
//       <div style={{ textAlign: "right", marginTop: 10 }}>
//         <Button onClick={handleMagic}>Волшебство</Button>
//       </div>
//     </Modal>
//   );
// }

// "use client";
// import React from "react";
// import { Modal, Form, Input, DatePicker, TimePicker, message } from "antd";
// import ru_RU from "antd/locale/ru_RU";
// import moment from "moment";
// import useAuthStore from "../../stores/authStore";

// export default function CloseIncidentModal({
//   visible,
//   onCancel,
//   incidentId,
//   onSuccess,
// }) {
//   const [form] = Form.useForm();
//   const { token } = useAuthStore();

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();

//       // end_date в формате "YYYY-MM-DD"
//       const end_date = values.end_date.format("YYYY-MM-DD");
//       // end_time в формате "HH:mm:00.000"
//       const end_time = values.end_time.format("HH:mm") + ":00.000";

//       // closure_description в формате Rich Text
//       const closure_description = [
//         {
//           type: "paragraph",
//           children: [
//             {
//               type: "text",
//               text: values.closure_description || "",
//             },
//           ],
//         },
//       ];

//       // Собираем данные для PUT-запроса
//       const payload = {
//         data: {
//           end_date,
//           end_time,
//           closure_description,
//           status_incident: "выполнена",
//         },
//       };

//       // Запрос на обновление (PUT)
//       //   const response = await fetch(
//       //     `http://localhost:1337/api/incidents/${incident.documentId}`, // <-- обновляем конкретный инцидент
//       //     {
//       //       method: "PUT",
//       //       headers: {
//       //         "Content-Type": "application/json",
//       //         Authorization: `Bearer ${token}`,
//       //       },
//       //       body: JSON.stringify(payload),
//       //     }
//       //   );
//       const response = await fetch(
//         `http://localhost:1337/api/incidents/${incidentId}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Ошибка при обновлении: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("Ответ Strapi при закрытии ТН:", result);

//       message.success("ТН переведена в статус 'Выполнена'!");
//       onCancel();
//       form.resetFields();
//       onSuccess(); // Сообщаем родителю, что всё ок
//     } catch (err) {
//       console.error("Ошибка закрытия ТН:", err);
//       message.error("Не удалось перевести ТН в статус 'Выполнена'");
//     }
//   };

//   return (
//     <Modal
//       title="Закрыть ТН"
//       open={visible}
//       onOk={handleOk}
//       onCancel={() => {
//         form.resetFields();
//         onCancel();
//       }}
//       okText="Отправить"
//       cancelText="Отмена"
//     >
//       <Form form={form} layout="vertical">
//         <Form.Item
//           name="end_date"
//           label="Дата окончания"
//           rules={[{ required: true, message: "Укажите дату окончания" }]}
//         >
//           <DatePicker
//             locale={ru_RU.DatePicker}
//             format="DD.MM.YYYY"
//             style={{ width: "100%" }}
//             placeholder="Выберите дату"
//           />
//         </Form.Item>

//         <Form.Item
//           name="end_time"
//           label="Время окончания"
//           rules={[{ required: true, message: "Укажите время окончания" }]}
//         >
//           <TimePicker
//             format="HH:mm"
//             style={{ width: "100%" }}
//             placeholder="Выберите время"
//           />
//         </Form.Item>

//         <Form.Item
//           name="closure_description"
//           label="Описание закрытия"
//           rules={[{ required: true, message: "Укажите описание закрытия" }]}
//         >
//           <Input.TextArea
//             rows={3}
//             placeholder="Что было сделано для устранения?"
//           />
//         </Form.Item>
//       </Form>
//     </Modal>
//   );
// }
