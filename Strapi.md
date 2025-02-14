Incident
start_time (Time) — время начала ТН.
start_date (Date) — дата начала ТН.
status (Enum: «в работе», «выполнена»).
estimated_restoration_time (DateTime) — прогнозируемое время включения.
end_time (DateTime) — время окончания ТН (заполняется при закрытии).
end_date (Date) — дата окончания ТН (заполняется при закрытии).
description (Rich Text) — описание ТН (блок начала).
closure_description (Rich Text) — описание закрытия ТН (блок окончания).
sent_to_telegram (Boolean) — отправлено в Telegram.
sent_to_arm_edds (Boolean) — отправлено в АРМ ЕДДС.
sent_to_moenergo (Boolean) — отправлено на сайт Мособлэнерго.
sent_to_minenergo (Boolean) — отправлено на сайт Минэнерго.

компонент «AddressInfo»
city_district (Relation → коллекция «CityDistrict»).
settlement_type (Enum: «городской», «сельский»). Значение по умолчанию: «городской».
streets (Text) — отключенные улицы (привязка к ФИАС, текстовое поле с автодополнением).
building_type (Enum: «жилой сектор», «частный сектор», «СНТ», «промзона», «СЗО»). Значение по умолчанию: «жилой сектор».

компонент «DisruptionStats»
affected_settlements (Number) — отключено населенных пунктов. Значение по умолчанию: 1.
affected_residents (Number) — количество жителей.
affected_mkd (Number) — отключено МКД.
affected_hospitals (Number) — отключено больниц.
affected_clinics (Number) — отключено поликлиник.
affected_schools (Number) — отключено школ.
affected_kindergartens (Number) — отключено детских садов.
boiler_shutdown (Boolean) — отключение котельных.