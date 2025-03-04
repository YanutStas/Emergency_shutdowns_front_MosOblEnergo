"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  message,
  Button,
  InputNumber,
  Switch as AntSwitch,
  Typography,
  Descriptions,
  Row,
  Col,
} from "antd";
import ru_RU from "antd/locale/ru_RU";
import moment from "moment";
import useAuthStore from "../../stores/authStore";
import { getRandomNewIncidentFields } from "../../utils/magicFill";

const { Option } = Select;
const { Title } = Typography;

export default function NewIncidentModal({ visible, onCancel }) {
  const [form] = Form.useForm();
  const { token } = useAuthStore();

  // Список городов (CityDistrict)
  const [cityDistricts, setCityDistricts] = useState([]);

  // При открытии модалки грузим список городов и ставим дефолтные поля
  useEffect(() => {
    const fetchCityDistricts = async () => {
      try {
        const res = await fetch("http://localhost:1337/api/city-districts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Ошибка при загрузке городов: ${res.status}`);
        }
        const data = await res.json();
        setCityDistricts(data.data || []);
      } catch (err) {
        console.error("Ошибка загрузки city-districts:", err);
      }
    };

    if (visible) {
      fetchCityDistricts();

      // Устанавливаем поля по умолчанию
      form.setFieldsValue({
        start_date: moment(),
        start_time: moment(),
        estimated_restoration_date: moment().add(1, "day"),
        estimated_restoration_time: moment().add(2, "hours"),
        disruptionStats: {
          affected_settlements: 0,
          affected_residents: 0,
          affected_mkd: 0,
          affected_hospitals: 0,
          affected_clinics: 0,
          affected_schools: 0,
          affected_kindergartens: 0,
          boiler_shutdown: 0,
        },
      });
    }
  }, [visible, form, token]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Дата/время начала
      const start_date = values.start_date.format("YYYY-MM-DD");
      const start_time = values.start_time.format("HH:mm") + ":00.000";

      // Прогноз восстановления
      const est_date = values.estimated_restoration_date.format("YYYY-MM-DD");
      const est_time =
        values.estimated_restoration_time.format("HH:mm") + ":00.000";
      const estimated_restoration_time = moment(
        `${est_date}T${est_time}`
      ).toISOString();

      // DisruptionStats
      const ds = values.disruptionStats || {};
      const disruptionStats = {
        affected_settlements: ds.affected_settlements || 0,
        affected_residents: ds.affected_residents || 0,
        affected_mkd: ds.affected_mkd || 0,
        affected_hospitals: ds.affected_hospitals || 0,
        affected_clinics: ds.affected_clinics || 0,
        affected_schools: ds.affected_schools || 0,
        affected_kindergartens: ds.affected_kindergartens || 0,
        boiler_shutdown: ds.boiler_shutdown || 0,
      };

      // Relation city_district
      const cityDistrictId = values.addressInfo?.city_district || null;

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
          status_incident: "в работе",
          estimated_restoration_time,
          description,
          AddressInfo: {
            city_district: cityDistrictId,
            settlement_type: values.addressInfo?.settlement_type,
            streets: values.addressInfo?.streets,
            building_type: values.addressInfo?.building_type,
          },
          DisruptionStats: disruptionStats,
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
      message.success("ТН успешно создана!");
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error("Ошибка при создании ТН:", error);
      message.error("Ошибка при создании ТН!");
    }
  };

  const handleMagic = () => {
    // Сначала получаем рандомные значения (дата, время, статистика и т.п.)
    const randomValues = getRandomNewIncidentFields();

    // Если нет disruptionStats в рандоме, добавляем
    if (!randomValues.disruptionStats) {
      randomValues.disruptionStats = {
        affected_settlements: 0,
        affected_residents: 0,
        affected_mkd: 0,
        affected_hospitals: 0,
        affected_clinics: 0,
        affected_schools: 0,
        affected_kindergartens: 0,
        boiler_shutdown: 0,
      };
    }

    // ВАЖНО: выбираем реальный город из загруженных cityDistricts (если массив не пуст)
    if (cityDistricts.length > 0) {
      const randomIndex = Math.floor(Math.random() * cityDistricts.length);
      const randomCity = cityDistricts[randomIndex];
      // Подставляем реальный ID города в addressInfo
      randomValues.addressInfo.city_district = randomCity.id;
    }

    // Устанавливаем значения в форму
    form.setFieldsValue(randomValues);

    message.info(
      "Заполнить сработало! Случайные данные, включая реальный город, установлены."
    );
  };

  const handleKeyDownForDigits = (e) => {
    if (
      !/^\d$/.test(e.key) &&
      e.key !== "Backspace" &&
      e.key !== "Delete" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "Tab"
    ) {
      e.preventDefault();
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
        {/* Дата и время начала */}
        <Form.Item
          name="start_date"
          label="Дата начала ТН"
          rules={[{ required: true, message: "Укажите дату начала ТН" }]}
        >
          <DatePicker
            locale={ru_RU.DatePicker}
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="start_time"
          label="Время начала ТН"
          rules={[{ required: true, message: "Укажите время начала ТН" }]}
        >
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        {/* Скрытое поле статус */}
        <Form.Item
          name="status_incident"
          initialValue="в работе"
          style={{ display: "none" }}
        >
          <Input />
        </Form.Item>

        {/* Прогноз восстановления */}
        <Form.Item
          name="estimated_restoration_date"
          label="Прогноз восстановления (дата)"
          rules={[{ required: true, message: "Укажите дату восстановления" }]}
        >
          <DatePicker
            locale={ru_RU.DatePicker}
            format="DD.MM.YYYY"
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          name="estimated_restoration_time"
          label="Прогноз восстановления (время)"
          rules={[{ required: true, message: "Укажите время восстановления" }]}
        >
          <TimePicker format="HH:mm" style={{ width: "100%" }} />
        </Form.Item>

        {/* Описание ТН */}
        <Form.Item
          name="description"
          label="Описание ТН"
          rules={[{ required: true, message: "Укажите описание ТН" }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        {/* AddressInfo */}
        <Title level={5} style={{ marginTop: 20 }}>
          Адресная информация
        </Title>

        <Form.Item
          name={["addressInfo", "city_district"]}
          label="Населенный пункт"
          rules={[{ required: true, message: "Выберите город" }]}
        >
          <Select placeholder="Выберите населенный пункт">
            {cityDistricts.map((city) => (
              <Option key={city.id} value={city.id}>
                {city.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name={["addressInfo", "settlement_type"]}
          label="Тип поселения"
          initialValue="городской"
          rules={[{ required: true, message: "Выберите тип поселения" }]}
        >
          <Select>
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
          <Select>
            <Option value="жилой сектор">жилой сектор</Option>
            <Option value="частный сектор">частный сектор</Option>
            <Option value="СНТ">СНТ</Option>
            <Option value="промзона">промзона</Option>
            <Option value="СЗО">СЗО</Option>
          </Select>
        </Form.Item>

        {/* Вот тут статистика */}
        <Descriptions
          bordered
          column={2}
          size="small"
          title="Статистика отключения"
        >
          {/* 1-я строка */}
          <Descriptions.Item label="Отключено населенных пунктов">
            <Form.Item
              name={["disruptionStats", "affected_settlements"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  // Запрещаем буквы
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Отключено жителей">
            <Form.Item
              name={["disruptionStats", "affected_residents"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          {/* 2-я строка */}
          <Descriptions.Item label="Отключено МКД">
            <Form.Item
              name={["disruptionStats", "affected_mkd"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Отключено больниц">
            <Form.Item
              name={["disruptionStats", "affected_hospitals"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          {/* 3-я строка */}
          <Descriptions.Item label="Отключено поликлиник">
            <Form.Item
              name={["disruptionStats", "affected_clinics"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Отключено школ">
            <Form.Item
              name={["disruptionStats", "affected_schools"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          {/* 4-я строка */}
          <Descriptions.Item label="Отключено детсадов">
            <Form.Item
              name={["disruptionStats", "affected_kindergartens"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>

          <Descriptions.Item label="Отключено бойлерных/котельн">
            <Form.Item
              name={["disruptionStats", "boiler_shutdown"]}
              initialValue={0}
              style={{ marginBottom: 0 }}
            >
              <InputNumber
                min={0}
                max={999999}
                onKeyDown={(e) => {
                  if (
                    !/^\d$/.test(e.key) &&
                    e.key !== "Backspace" &&
                    e.key !== "Delete" &&
                    e.key !== "ArrowLeft" &&
                    e.key !== "ArrowRight" &&
                    e.key !== "Tab"
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Descriptions.Item>
        </Descriptions>

        {/* Вот тут статистика */}
      </Form>

      <div style={{ textAlign: "right", marginTop: 10 }}>
        <Button onClick={handleMagic}>Заполнить</Button>
      </div>
    </Modal>
  );
}

// "use client";
// import React, { useEffect } from "react";
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

//   // Устанавливаем начальные значения при открытии модалки
//   useEffect(() => {
//     if (visible) {
//       form.setFieldsValue({
//         start_date: moment(),
//         start_time: moment(),
//         estimated_restoration_date: moment().add(1, 'day'),
//         estimated_restoration_time: moment().add(2, 'hours'),
//       });
//     }
//   }, [visible, form]);

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

// <Form form={form} layout="vertical">
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
//         <Button onClick={handleMagic}>Заполнить</Button>
//       </div>
//     </Modal>
//   );
// }
