"use client";
import React from "react";
import { Modal, Form, Input, DatePicker, TimePicker, message } from "antd";
import ru_RU from "antd/locale/ru_RU";
import moment from "moment";
import useAuthStore from "../../stores/authStore";

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

      // end_date в формате "YYYY-MM-DD"
      const end_date = values.end_date.format("YYYY-MM-DD");
      // end_time в формате "HH:mm:00.000"
      const end_time = values.end_time.format("HH:mm") + ":00.000";

      // closure_description в формате Rich Text
      const closure_description = [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              text: values.closure_description || "",
            },
          ],
        },
      ];

      // Собираем данные для PUT-запроса
      const payload = {
        data: {
          end_date,
          end_time,
          closure_description,
          status_incident: "выполнена",
        },
      };

      // Запрос на обновление (PUT)
      //   const response = await fetch(
      //     `http://localhost:1337/api/incidents/${incident.documentId}`, // <-- обновляем конкретный инцидент
      //     {
      //       method: "PUT",
      //       headers: {
      //         "Content-Type": "application/json",
      //         Authorization: `Bearer ${token}`,
      //       },
      //       body: JSON.stringify(payload),
      //     }
      //   );
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

      message.success("ТН переведена в статус 'Выполнена'!");
      onCancel();
      form.resetFields();
      onSuccess(); // Сообщаем родителю, что всё ок
    } catch (err) {
      console.error("Ошибка закрытия ТН:", err);
      message.error("Не удалось перевести ТН в статус 'Выполнена'");
    }
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
    </Modal>
  );
}
