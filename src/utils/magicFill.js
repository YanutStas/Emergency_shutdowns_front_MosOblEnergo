import moment from "moment";

/**
 * Генерирует случайное целое число в диапазоне [min, max]
 */
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Примерный список улиц (100 штук)
 */
const streetNames = Array.from({ length: 100 }, (_, i) => `Улица ${i + 1}`);

/**
 * Функция, выбирающая случайное количество улиц (1..10) из массива,
 * и возвращающая их через запятую.
 */
function getRandomStreets() {
  const count = randomBetween(1, 10);
  const copy = [...streetNames];

  // Перемешиваем массив (Fisher–Yates shuffle)
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomBetween(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  // Берём первые count улиц и соединяем через запятую
  return copy.slice(0, count).join(", ");
}

// Массив «причин» (описание ТН при создании)
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

// Массив «устранения» (описание при закрытии)
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

const settlementTypes = ["городской", "сельский"];
const buildingTypes = [
  "жилой сектор",
  "частный сектор",
  "СНТ",
  "промзона",
  "СЗО",
];

/**
 * Генерирует случайные поля для формы "Новый ТН".
 * День выбирается из диапазона 20..25 (февраль 2025).
 */
export function getRandomNewIncidentFields() {
  const startDay = randomBetween(20, 25);
  const startHour = randomBetween(0, 23);
  const startMin = randomBetween(0, 59);

  // Прогноз восстановления – на 1..3 дней позже startDay
  const restDay = randomBetween(startDay + 1, startDay + 3);
  const restHour = randomBetween(0, 23);
  const restMin = randomBetween(0, 59);

  const desc = randomCauses[randomBetween(0, randomCauses.length - 1)];

  return {
    // Дата начала
    start_date: moment(`2025-02-${startDay}`, "YYYY-MM-DD"),
    start_time: moment(`${startHour}:${startMin}`, "HH:mm"),
    // Всегда "в работе", поле скрыто
    status_incident: "в работе",
    // Прогноз восстановления
    estimated_restoration_date: moment(`2025-02-${restDay}`, "YYYY-MM-DD"),
    estimated_restoration_time: moment(`${restHour}:${restMin}`, "HH:mm"),
    description: desc,
    addressInfo: {
      settlement_type:
        settlementTypes[randomBetween(0, settlementTypes.length - 1)],
      streets: getRandomStreets(),
      building_type: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
    },
  };
}

/**
 * Генерирует случайные поля для формы "Закрыть ТН".
 * День выбирается из диапазона 26..28 (февраль 2025),
 * чтобы гарантированно идти после 20..25 (хоть и не 100%).
 */
export function getRandomCloseIncidentFields() {
  const endDay = randomBetween(26, 28);
  const endHour = randomBetween(0, 23);
  const endMin = randomBetween(0, 59);

  const desc = randomFixes[randomBetween(0, randomFixes.length - 1)];

  return {
    end_date: moment(`2025-02-${endDay}`, "YYYY-MM-DD"),
    end_time: moment(`${endHour}:${endMin}`, "HH:mm"),
    closure_description: desc,
  };
}

// import moment from "moment";

// // Генератор случайного целого числа в диапазоне [min, max]
// function randomBetween(min, max) {
//   return Math.floor(Math.random() * (max - min + 1)) + min;
// }

// // Примеры случайных описаний
// const randomDescriptions = [
//   "Ворона села на провода",
//   "Сильный ветер сорвал провода",
//   "Обрыв линии из-за грозы",
//   "Поваленное дерево оборвало провода",
//   "Оборудование перегрелось и отключилось",
//   "Птица на трансформаторе вызвала КЗ",
// ];

// const randomClosureDescriptions = [
//   "Бригада всё починила за 15 минут",
//   "Заменили повреждённый кабель, система запущена",
//   "Устранили неполадку, все довольны",
//   "Провода заизолированы, подача электроэнергии восстановлена",
//   "Произведён аварийный ремонт, инцидент закрыт",
// ];

// const settlementTypes = ["городской", "сельский"];
// const buildingTypes = [
//   "жилой сектор",
//   "частный сектор",
//   "СНТ",
//   "промзона",
//   "СЗО",
// ];
// const statuses = ["в работе", "выполнена"];

// /**
//  * Генерирует случайные поля для формы "Новый ТН"
//  */
// export function getRandomNewIncidentFields() {
//   // Даты (просто рандомно в феврале 2025)
//   const startDay = randomBetween(20, 28);
//   const startHour = randomBetween(0, 23);
//   const startMin = randomBetween(0, 59);

//   // Прогноз восстановления (берём дату в диапазоне 1-3 дня от начала)
//   const restDay = randomBetween(startDay, startDay + 3);
//   const restHour = randomBetween(0, 23);
//   const restMin = randomBetween(0, 59);

//   const desc =
//     randomDescriptions[randomBetween(0, randomDescriptions.length - 1)];

//   return {
//     start_date: moment(`2025-02-${startDay}`, "YYYY-MM-DD"),
//     start_time: moment(`${startHour}:${startMin}`, "HH:mm"),
//     status_incident: statuses[randomBetween(0, statuses.length - 1)], // иногда "в работе", иногда "выполнена"
//     estimated_restoration_date: moment(`2025-02-${restDay}`, "YYYY-MM-DD"),
//     estimated_restoration_time: moment(`${restHour}:${restMin}`, "HH:mm"),
//     description: desc,
//     addressInfo: {
//       settlement_type:
//         settlementTypes[randomBetween(0, settlementTypes.length - 1)],
//       streets: "Ленина, Пржевальского", // Можно усложнить рандом
//       building_type: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
//     },
//   };
// }

// /**
//  * Генерирует случайные поля для формы "Закрыть ТН"
//  */
// export function getRandomCloseIncidentFields() {
//   const endDay = randomBetween(20, 28);
//   const endHour = randomBetween(0, 23);
//   const endMin = randomBetween(0, 59);

//   const desc =
//     randomClosureDescriptions[
//       randomBetween(0, randomClosureDescriptions.length - 1)
//     ];

//   return {
//     end_date: moment(`2025-02-${endDay}`, "YYYY-MM-DD"),
//     end_time: moment(`${endHour}:${endMin}`, "HH:mm"),
//     closure_description: desc,
//   };
// }
