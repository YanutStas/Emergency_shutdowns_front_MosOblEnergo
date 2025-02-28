import moment from "moment";

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const streetNames = Array.from({ length: 100 }, (_, i) => `Улица ${i + 1}`);

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

export function getRandomNewIncidentFields() {
  const startDate = moment().subtract(randomBetween(0, 1), "days");
  const startHour = randomBetween(0, 23);
  const startMin = randomBetween(0, 59);

  const restDate = startDate.clone().add(randomBetween(1, 3), "days");
  const restHour = randomBetween(0, 23);
  const restMin = randomBetween(0, 59);

  const desc = randomCauses[randomBetween(0, randomCauses.length - 1)];

  return {
    // Дата начала
    start_date: startDate,
    start_time: moment({ hour: startHour, minute: startMin }),
    estimated_restoration_date: restDate,
    estimated_restoration_time: moment({ hour: restHour, minute: restMin }),
    // Всегда "в работе", поле скрыто
    status_incident: "в работе",
    // Прогноз восстановления

    description: desc,
    addressInfo: {
      settlement_type:
        settlementTypes[randomBetween(0, settlementTypes.length - 1)],
      streets: getRandomStreets(),
      building_type: buildingTypes[randomBetween(0, buildingTypes.length - 1)],
    },
  };
}

export function getRandomCloseIncidentFields() {
  const endDate = moment().subtract(randomBetween(0, 2), "days");
  const endHour = randomBetween(0, 23);
  const endMin = randomBetween(0, 59);

  const desc = randomFixes[randomBetween(0, randomFixes.length - 1)];

  return {
    end_date: endDate,
    end_time: moment({ hour: endHour, minute: endMin }),
    closure_description: desc,
  };
}
