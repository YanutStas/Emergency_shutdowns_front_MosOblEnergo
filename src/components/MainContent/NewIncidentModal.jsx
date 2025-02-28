"use client";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Button,
} from "antd";
import ru_RU from "antd/locale/ru_RU";
import moment from "moment";
import useAuthStore from "../../stores/authStore";
import { getRandomNewIncidentFields } from "../../utils/magicFill";

const { Option } = Select;

export default function NewIncidentModal({ visible, onCancel }) {
  const [form] = Form.useForm();
  const { token } = useAuthStore();

  // Устанавливаем начальные значения при открытии модалки
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        start_date: moment(),
        start_time: moment(),
        estimated_restoration_date: moment().add(1, 'day'),
        estimated_restoration_time: moment().add(2, 'hours'),
      });
    }
  }, [visible, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Преобразуем даты и время
      const start_date = values.start_date.format("YYYY-MM-DD");
      const start_time = values.start_time.format("HH:mm") + ":00.000";

      const est_date = values.estimated_restoration_date.format("YYYY-MM-DD");
      const est_time =
        values.estimated_restoration_time.format("HH:mm") + ":00.000";
      const estimated_restoration_time = moment(
        `${est_date}T${est_time}`
      ).toISOString();

      const description = [
        {
          type: "paragraph",
          children: [{ type: "text", text: values.description }],
        },
      ];

      const payload = {
        data: {
          start_date,
          start_time,
          // Статус всегда "в работе", редактирование скрыто
          status_incident: "в работе",
          estimated_restoration_time,
          description,
          AddressInfo: {
            settlement_type: values.addressInfo?.settlement_type,
            streets: values.addressInfo?.streets,
            building_type: values.addressInfo?.building_type,
          },
          sent_to_telegram: false,
          sent_to_arm_edds: false,
          sent_to_moenergo: false,
          sent_to_minenergo: false,
        },
      };

      const response = await fetch("http://localhost:1337/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Ошибка при отправке данных: ${response.status}`);
      }

      const result = await response.json();
      console.log("Ответ Strapi:", result);
      message.success("ТН успешно создана! Wubba lubba dub dub!");
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error("Ошибка при создании ТН:", error);
      message.error("Ошибка при создании ТН. Что-то пошло не так, Morty!");
    }
  };

  const handleMagic = () => {
    const randomValues = getRandomNewIncidentFields();
    form.setFieldsValue(randomValues);
    message.info("Волшебство сработало! Форма заполнена случайными данными.");
  };
  
  return (
    <Modal
      title="Создать новое ТН"
      open={visible}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Отправить"
      cancelText="Отмена"
    >

<Form form={form} layout="vertical">
        <Form.Item
          name="start_date"
          label="Дата начала ТН"
          rules={[{ required: true, message: "Укажите дату начала ТН" }]}
        >
          <DatePicker
            locale={ru_RU.DatePicker}
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <Form.Item
          name="start_time"
          label="Время начала ТН"
          rules={[{ required: true, message: "Укажите время начала ТН" }]}
        >
          <TimePicker
            format="HH:mm"
            style={{ width: "100%" }}
            placeholder="Выберите время"
          />
        </Form.Item>

        {/* Скрытое поле для статуса, всегда "в работе" */}
        <Form.Item
          name="status_incident"
          initialValue="в работе"
          style={{ display: "none" }}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="estimated_restoration_date"
          label="Прогноз восстановления (дата)"
          rules={[{ required: true, message: "Укажите дату восстановления" }]}
        >
          <DatePicker
            locale={ru_RU.DatePicker}
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
            placeholder="Выберите дату"
          />
        </Form.Item>

        <Form.Item
          name="estimated_restoration_time"
          label="Прогноз восстановления (время)"
          rules={[{ required: true, message: "Укажите время восстановления" }]}
        >
          <TimePicker
            format="HH:mm"
            style={{ width: "100%" }}
            placeholder="Выберите время"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание ТН"
          rules={[{ required: true, message: "Укажите описание ТН" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          name={["addressInfo", "settlement_type"]}
          label="Тип поселения"
          initialValue="городской"
          rules={[{ required: true, message: "Выберите тип поселения" }]}
        >
          <Select placeholder="Выберите тип поселения">
            <Option value="городской">городской</Option>
            <Option value="сельский">сельский</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name={["addressInfo", "streets"]}
          label="Отключенные улицы"
          rules={[{ required: true, message: "Укажите улицы" }]}
        >
          <Input placeholder="Введите улицы, разделённые запятыми" />
        </Form.Item>

        <Form.Item
          name={["addressInfo", "building_type"]}
          label="Тип застройки"
          initialValue="жилой сектор"
          rules={[{ required: true, message: "Выберите тип застройки" }]}
        >
          <Select placeholder="Выберите тип застройки">
            <Option value="жилой сектор">жилой сектор</Option>
            <Option value="частный сектор">частный сектор</Option>
            <Option value="СНТ">СНТ</Option>
            <Option value="промзона">промзона</Option>
            <Option value="СЗО">СЗО</Option>
          </Select>
        </Form.Item>
      </Form>

      <div style={{ textAlign: "right", marginTop: 10 }}>
        <Button onClick={handleMagic}>Заполнить</Button>
      </div>
    </Modal>
  );
}



// "use client";
// import React from "react";
// import {
//   Modal,
//   Form,
//   Input,
//   DatePicker,
//   TimePicker,
//   Select,
//   message,
//   Button,
// } from "antd";
// import ru_RU from "antd/locale/ru_RU";
// import moment from "moment";
// import useAuthStore from "../../stores/authStore";
// import { getRandomNewIncidentFields } from "../../utils/magicFill";

// const { Option } = Select;

// export default function NewIncidentModal({ visible, onCancel }) {
//   const [form] = Form.useForm();
//   const { token } = useAuthStore();

//   const handleOk = async () => {
//     try {
//       const values = await form.validateFields();

//       // Преобразуем даты и время
//       const start_date = values.start_date.format("YYYY-MM-DD");
//       const start_time = values.start_time.format("HH:mm") + ":00.000";

//       const est_date = values.estimated_restoration_date.format("YYYY-MM-DD");
//       const est_time =
//         values.estimated_restoration_time.format("HH:mm") + ":00.000";
//       const estimated_restoration_time = moment(
//         `${est_date}T${est_time}`
//       ).toISOString();

//       const description = [
//         {
//           type: "paragraph",
//           children: [{ type: "text", text: values.description }],
//         },
//       ];

//       const payload = {
//         data: {
//           start_date,
//           start_time,
//           // Статус всегда "в работе", редактирование скрыто
//           status_incident: "в работе",
//           estimated_restoration_time,
//           description,
//           AddressInfo: {
//             settlement_type: values.addressInfo?.settlement_type,
//             streets: values.addressInfo?.streets,
//             building_type: values.addressInfo?.building_type,
//           },
//           sent_to_telegram: false,
//           sent_to_arm_edds: false,
//           sent_to_moenergo: false,
//           sent_to_minenergo: false,
//         },
//       };

//       const response = await fetch("http://localhost:1337/api/incidents", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         throw new Error(`Ошибка при отправке данных: ${response.status}`);
//       }

//       const result = await response.json();
//       console.log("Ответ Strapi:", result);
//       message.success("ТН успешно создана! Wubba lubba dub dub!");
//       onCancel();
//       form.resetFields();
//     } catch (error) {
//       console.error("Ошибка при создании ТН:", error);
//       message.error("Ошибка при создании ТН. Что-то пошло не так, Morty!");
//     }
//   };

//   const handleMagic = () => {
//     const randomValues = getRandomNewIncidentFields();
//     form.setFieldsValue(randomValues);
//     message.info("Волшебство сработало! Форма заполнена случайными данными.");
//   };

//   return (
//     <Modal
//       title="Создать новое ТН"
//       open={visible}
//       onOk={handleOk}
//       onCancel={onCancel}
//       okText="Отправить"
//       cancelText="Отмена"
//     >
//       <Form form={form} layout="vertical">
//         <Form.Item
//           name="start_date"
//           label="Дата начала ТН"
//           rules={[{ required: true, message: "Укажите дату начала ТН" }]}
//         >
//           <DatePicker
//             locale={ru_RU.DatePicker}
//             format="DD.MM.YYYY"
//             style={{ width: "100%" }}
//             placeholder="Выберите дату"
//           />
//         </Form.Item>

//         <Form.Item
//           name="start_time"
//           label="Время начала ТН"
//           rules={[{ required: true, message: "Укажите время начала ТН" }]}
//         >
//           <TimePicker
//             format="HH:mm"
//             style={{ width: "100%" }}
//             placeholder="Выберите время"
//           />
//         </Form.Item>

//         {/* Скрытое поле для статуса, всегда "в работе" */}
//         <Form.Item
//           name="status_incident"
//           initialValue="в работе"
//           style={{ display: "none" }}
//         >
//           <Input />
//         </Form.Item>

//         <Form.Item
//           name="estimated_restoration_date"
//           label="Прогноз восстановления (дата)"
//           rules={[{ required: true, message: "Укажите дату восстановления" }]}
//         >
//           <DatePicker
//             locale={ru_RU.DatePicker}
//             format="DD.MM.YYYY"
//             style={{ width: "100%" }}
//             placeholder="Выберите дату"
//           />
//         </Form.Item>

//         <Form.Item
//           name="estimated_restoration_time"
//           label="Прогноз восстановления (время)"
//           rules={[{ required: true, message: "Укажите время восстановления" }]}
//         >
//           <TimePicker
//             format="HH:mm"
//             style={{ width: "100%" }}
//             placeholder="Выберите время"
//           />
//         </Form.Item>

//         <Form.Item
//           name="description"
//           label="Описание ТН"
//           rules={[{ required: true, message: "Укажите описание ТН" }]}
//         >
//           <Input.TextArea rows={3} />
//         </Form.Item>

//         <Form.Item
//           name={["addressInfo", "settlement_type"]}
//           label="Тип поселения"
//           initialValue="городской"
//           rules={[{ required: true, message: "Выберите тип поселения" }]}
//         >
//           <Select placeholder="Выберите тип поселения">
//             <Option value="городской">городской</Option>
//             <Option value="сельский">сельский</Option>
//           </Select>
//         </Form.Item>

//         <Form.Item
//           name={["addressInfo", "streets"]}
//           label="Отключенные улицы"
//           rules={[{ required: true, message: "Укажите улицы" }]}
//         >
//           <Input placeholder="Введите улицы, разделённые запятыми" />
//         </Form.Item>

//         <Form.Item
//           name={["addressInfo", "building_type"]}
//           label="Тип застройки"
//           initialValue="жилой сектор"
//           rules={[{ required: true, message: "Выберите тип застройки" }]}
//         >
//           <Select placeholder="Выберите тип застройки">
//             <Option value="жилой сектор">жилой сектор</Option>
//             <Option value="частный сектор">частный сектор</Option>
//             <Option value="СНТ">СНТ</Option>
//             <Option value="промзона">промзона</Option>
//             <Option value="СЗО">СЗО</Option>
//           </Select>
//         </Form.Item>
//       </Form>

//       <div style={{ textAlign: "right", marginTop: 10 }}>
//         <Button onClick={handleMagic}>Волшебство</Button>
//       </div>
//     </Modal>
//   );
// }
