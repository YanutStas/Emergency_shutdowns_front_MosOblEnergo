"use client";
import React, { useEffect } from "react";
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

  // Устанавливаем начальные значения при открытии
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        end_date: moment(),
        end_time: moment(),
      });
    }
  }, [visible, form]);

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
        <Button onClick={handleMagic}>Заполнить</Button>
      </div>
    </Modal>
  );
}

//

// "use client";
// import React from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   DatePicker,
//   TimePicker,
//   message,
//   Button,
// } from "antd";
// import ru_RU from "antd/locale/ru_RU";
// import moment from "moment";
// import useAuthStore from "../../stores/authStore";
// import { getRandomCloseIncidentFields } from "../../utils/magicFill";

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

//       const end_date = values.end_date.format("YYYY-MM-DD");
//       const end_time = values.end_time.format("HH:mm") + ":00.000";

//       const closure_description = [
//         {
//           type: "paragraph",
//           children: [{ type: "text", text: values.closure_description || "" }],
//         },
//       ];

//       const payload = {
//         data: {
//           end_date,
//           end_time,
//           closure_description,
//           status_incident: "выполнена",
//         },
//       };

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
//       message.success(
//         "ТН переведена в статус 'Выполнена'! Отличная работа, Morty!"
//       );
//       onCancel();
//       form.resetFields();
//       onSuccess();
//     } catch (err) {
//       console.error("Ошибка закрытия ТН:", err);
//       message.error(
//         "Не удалось перевести ТН в статус 'Выполнена'. Что-то пошло не так, Morty!"
//       );
//     }
//   };

//   // Кнопка "Волшебство" — чтобы быстро заполнить форму закрытия
//   const handleMagic = () => {
//     const randomValues = getRandomCloseIncidentFields();
//     form.setFieldsValue(randomValues);
//     message.info("Волшебство сработало! Поля заполнены случайными значениями.");
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

//       <div style={{ textAlign: "right", marginTop: 10 }}>
//         <Button onClick={handleMagic}>Волшебство</Button>
//       </div>
//     </Modal>
//   );
// }
