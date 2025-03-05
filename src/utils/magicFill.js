// /Users/yanutstas/Desktop/Project/Emergency_shutdowns_front_MosOblEnergo/src/utils/magicFill.js

import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Подключим плагины, если нужны
dayjs.extend(customParseFormat);

/**
 * Генерирует случайное целое число в диапазоне [min, max].
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Список улиц (100 штук).
 */
const streetNames = Array.from({ length: 100 }, (_, i) => `Улица ${i + 1}`);

/**
 * Перемешивание массива (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomBetween(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Функция, выбирающая случайное количество улиц (1..10) из массива,
 * и возвращающая их через запятую.
 */
function getRandomStreets() {
  const count = randomBetween(1, 10);
  const shuffled = shuffleArray(streetNames);
  return shuffled.slice(0, count).join(", ");
}

// Причины аварии
const randomCauses = [
  "Ворона села на провода.",
  "Сильный ветер сорвал провода.",
  "Обрыв линии из-за грозы.",
  "Поваленное дерево оборвало провода.",
  "Оборудование перегрелось и отключилось.",
  "Птица на трансформаторе вызвала короткое замыкание.",
  "Неисправный кабель привёл к аварийному отключению.",
  "Временный сбой оборудования на подстанции.",
  "Перегрузка сети вызвала отключение.",
  "Сбой системы автоматического восстановления питания.",
];

// Причины устранения (для закрытия ТН, если понадобится)
const randomFixes = [
  "Заменили повреждённый кабель, система запущена.",
  "Бригада всё починила, все довольны!",
  "Произведён аварийный ремонт, инцидент закрыт.",
  "Провода заизолированы, подача электроэнергии восстановлена.",
  "Сбой устранён путём замены трансформатора.",
  "Произвели срочный ремонт после дождя.",
  "Кабель просушен, подстанция перезапущена.",
  "Замена проводов и перезапуск сети успешно завершены.",
  "Дополнили оборудование защитой от птиц и перезапустили систему.",
  "Линия восстановлена, проверка проведена – всё ок!",
];

// Типы поселений
const settlementTypes = ["городской", "сельский"];
// Типы застройки
const buildingTypes = [
  "жилой сектор",
  "частный сектор",
  "СНТ",
  "промзона",
  "СЗО",
];

/**
 * Пример фиктивных ID городов.
 * В вашем коде вы берёте реальные ID (documentId) из запроса city-districts.
 * Но для случайных значений используем такой массив.
 */
const mockCityIds = [
  "ps44eajtjgumlhl96rfd7gyd",
  "hdxljaw89ytwq4q9o5mf8d30",
  "jjo9xy8rnmu5geg8d0su1nis",
];

/**
 * Генерирует случайные поля для формы "Новый ТН" (на Day.js).
 */
export function getRandomNewIncidentFields() {
  // Случайно выбираем, на сколько дней назад была дата начала (0..1)
  const daysAgo = randomBetween(0, 1);
  // Формируем start_date как день X дней назад
  const startDateDayjs = dayjs().subtract(daysAgo, "day").startOf("day");

  // Случайное время (часы, минуты)
  const startHour = randomBetween(0, 23);
  const startMin = randomBetween(0, 59);

  // Это объект Day.js для даты + времени начала
  const fullStartDayjs = startDateDayjs
    .hour(startHour)
    .minute(startMin)
    .second(0);

  // Прогноз восстановления: +1..3 дня от startDate
  const extraDays = randomBetween(1, 3);
  const restDateDayjs = fullStartDayjs.add(extraDays, "day");

  const restHour = randomBetween(0, 23);
  const restMin = randomBetween(0, 59);
  const fullRestDayjs = restDateDayjs.hour(restHour).minute(restMin).second(0);

  // Случайное описание
  const desc = randomCauses[randomBetween(0, randomCauses.length - 1)];

  // Случайный ID города
  const randomCityId = mockCityIds[randomBetween(0, mockCityIds.length - 1)];

  // Случайная статистика
  const randomStats = {
    affected_settlements: randomBetween(0, 1000),
    affected_residents: randomBetween(0, 1000),
    affected_mkd: randomBetween(0, 1000),
    affected_hospitals: randomBetween(0, 1000),
    affected_clinics: randomBetween(0, 1000),
    affected_schools: randomBetween(0, 1000),
    affected_kindergartens: randomBetween(0, 1000),
    boiler_shutdown: randomBetween(0, 1000),
  };

  return {
    // В модалке у вас datePicker/timePicker разделены,
    // поэтому разделим fullStartDayjs на "дата" и "время".
    start_date: fullStartDayjs.clone().startOf("day"), // Дата (00:00)
    start_time: fullStartDayjs.clone(), // Время (с часами и минутами)

    estimated_restoration_date: fullRestDayjs.clone().startOf("day"),
    estimated_restoration_time: fullRestDayjs.clone(),

    // Статус
    status_incident: "в работе",
    // Описание
    description: desc,

    // AddressInfo
    addressInfo: {
      city_district: randomCityId,
      settlement_type:
        settlementTypes[randomBetween(0, settlementTypes.length - 1)],
      streets: getRandomStreets(),
      building_type: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
    },

    // DisruptionStats
    disruptionStats: randomStats,
  };
}

/**
 * Генерирует случайные поля для формы "Закрыть ТН" (dayjs).
 */
export function getRandomCloseIncidentFields() {
  // Дата окончания: от сегодня до 2 дней назад
  const daysAgo = randomBetween(0, 2);
  const endDateDayjs = dayjs().subtract(daysAgo, "day").startOf("day");

  const endHour = randomBetween(0, 23);
  const endMin = randomBetween(0, 59);

  const fullEndDayjs = endDateDayjs.hour(endHour).minute(endMin).second(0);

  // Случайное описание закрытия
  const desc = randomFixes[randomBetween(0, randomFixes.length - 1)];

  return {
    end_date: fullEndDayjs.clone().startOf("day"),
    end_time: fullEndDayjs.clone(),
    closure_description: desc,
  };
}

// import moment from "moment";

// /**
//  * Генерирует случайное целое число в диапазоне [min, max].
//  */
// function randomBetween(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// /**
//  * Список улиц (100 штук).
//  */
// const streetNames = Array.from({ length: 100 }, (_, i) => `Улица ${i + 1}`);

// /**
//  * Функция, выбирающая случайное количество улиц (1..10) из массива,
//  * и возвращающая их через запятую.
//  */
// function getRandomStreets() {
//   const count = randomBetween(1, 10);
//   const copy = [...streetNames];

//   // Перемешиваем массив (Fisher–Yates shuffle)
//   for (let i = copy.length - 1; i > 0; i--) {
//     const j = randomBetween(0, i);
//     [copy[i], copy[j]] = [copy[j], copy[i]];
//   }

//   // Берём первые count улиц и соединяем через запятую
//   return copy.slice(0, count).join(", ");
// }

// // Причины аварии
// const randomCauses = [
//   "Ворона села на провода.",
//   "Сильный ветер сорвал провода.",
//   "Обрыв линии из-за грозы.",
//   "Поваленное дерево оборвало провода.",
//   "Оборудование перегрелось и отключилось.",
//   "Птица на трансформаторе вызвала короткое замыкание.",
//   "Неисправный кабель привёл к аварийному отключению.",
//   "Временный сбой оборудования на подстанции.",
//   "Перегрузка сети вызвала отключение.",
//   "Сбой системы автоматического восстановления питания.",
// ];

// // Причины устранения
// const randomFixes = [
//   "Заменили повреждённый кабель, система запущена.",
//   "Бригада всё починила, все довольны!",
//   "Произведён аварийный ремонт, инцидент закрыт.",
//   "Провода заизолированы, подача электроэнергии восстановлена.",
//   "Сбой устранён путём замены трансформатора.",
//   "Произвели срочный ремонт после дождя.",
//   "Кабель просушен, подстанция перезапущена.",
//   "Замена проводов и перезапуск сети успешно завершены.",
//   "Дополнили оборудование защитой от птиц и перезапустили систему.",
//   "Линия восстановлена, проверка проведена – всё ок!",
// ];

// // Типы поселений
// const settlementTypes = ["городской", "сельский"];
// // Типы застройки
// const buildingTypes = [
//   "жилой сектор",
//   "частный сектор",
//   "СНТ",
//   "промзона",
//   "СЗО",
// ];

// /**
//  * Здесь указываем несколько фиктивных ID городов (CityDistrict).
//  * Если у вас есть реальный список ID из Strapi, подставьте их.
//  */
// const mockCityIds = [2, 3, 4, 5, 7, 10]; // Пример

// /**
//  * Генерирует случайные поля для формы "Новый ТН".
//  */
// export function getRandomNewIncidentFields() {
//   // Дата начала: от сегодня до 1 дня назад
//   const startDate = moment().subtract(randomBetween(0, 1), "days");
//   const startHour = randomBetween(0, 23);
//   const startMin = randomBetween(0, 59);

//   // Прогноз восстановления: +1..3 дня от startDate
//   const restDate = startDate.clone().add(randomBetween(1, 3), "days");
//   const restHour = randomBetween(0, 23);
//   const restMin = randomBetween(0, 59);

//   // Случайное описание
//   const desc = randomCauses[randomBetween(0, randomCauses.length - 1)];

//   // Случайный город (Relation ID)
//   const randomCityId = mockCityIds[randomBetween(0, mockCityIds.length - 1)];

//   // Случайная статистика (до 1000)
//   const randomStats = {
//     affected_settlements: randomBetween(0, 1000),
//     affected_residents: randomBetween(0, 1000),
//     affected_mkd: randomBetween(0, 1000),
//     affected_hospitals: randomBetween(0, 1000),
//     affected_clinics: randomBetween(0, 1000),
//     affected_schools: randomBetween(0, 1000),
//     affected_kindergartens: randomBetween(0, 1000),
//     boiler_shutdown: randomBetween(0, 1000), // число
//   };

//   return {
//     // Дата/время начала
//     start_date: startDate,
//     start_time: moment({ hour: startHour, minute: startMin }),
//     estimated_restoration_date: restDate,
//     estimated_restoration_time: moment({ hour: restHour, minute: restMin }),

//     // Статус
//     status_incident: "в работе",
//     // Описание
//     description: desc,

//     // AddressInfo
//     addressInfo: {
//       // Случайный город
//       city_district: randomCityId,
//       settlement_type:
//         settlementTypes[randomBetween(0, settlementTypes.length - 1)],
//       streets: getRandomStreets(),
//       building_type: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
//     },

//     // DisruptionStats
//     disruptionStats: randomStats,
//   };
// }

// /**
//  * Генерирует случайные поля для формы "Закрыть ТН".
//  */
// export function getRandomCloseIncidentFields() {
//   // Дата окончания: от сегодня до 2 дней назад
//   const endDate = moment().subtract(randomBetween(0, 2), "days");
//   const endHour = randomBetween(0, 23);
//   const endMin = randomBetween(0, 59);

//   // Случайное описание закрытия
//   const desc = randomFixes[randomBetween(0, randomFixes.length - 1)];

//   return {
//     end_date: endDate,
//     end_time: moment({ hour: endHour, minute: endMin }),
//     closure_description: desc,
//   };
// }
