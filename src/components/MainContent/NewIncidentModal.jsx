"use client";
import React from "react";
import { Modal, Form, Input, DatePicker, TimePicker, Select } from "antd";
import ru_RU from "antd/locale/ru_RU";

const { Option } = Select;

export default function NewIncidentModal({ visible, onCancel }) {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      console.log("Новая ТН данные:", values);
      // Здесь можно добавить логику отправки в Strapi
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error("Ошибка валидации:", error);
    }
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
        {/* Данные инцидента */}
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

        <Form.Item
          name="status_incident"
          label="Статус ТН"
          initialValue="в работе"
          rules={[{ required: true, message: "Выберите статус ТН" }]}
        >
          <Select placeholder="Выберите статус">
            <Option value="в работе">в работе</Option>
            <Option value="выполнена">выполнена</Option>
          </Select>
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

        {/* AddressInfo */}
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
    </Modal>
  );
}
