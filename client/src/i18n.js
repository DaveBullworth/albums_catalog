import i18n from "i18next"; // Импортируем библиотеку i18next для интернационализации
import Backend from "i18next-http-backend"; // Импортируем бекенд для загрузки переводов через HTTP
import LanguageDetector from "i18next-browser-languagedetector"; // Импортируем детектор языка для определения языка пользователя
import { initReactI18next } from "react-i18next"; // Импортируем интеграцию с React

// Получаем язык по умолчанию из локального хранилища (localStorage) или используем "ru" (русский)
const defaultLanguage = localStorage.getItem("lng") || "ru";

i18n
	.use(Backend) // Подключаем плагин для загрузки переводов через HTTP
	.use(LanguageDetector) // Подключаем плагин для определения языка пользователя
	.use(initReactI18next) // Подключаем интеграцию i18next с React
	.init({
		// Инициализируем i18n с необходимыми параметрами
		fallbackLng: "ru", // Язык по умолчанию, если текущий язык не найден
		debug: false, // Отключаем вывод отладочной информации в консоль
		detection: {
			order: ["queryString", "cookie"], // Порядок определения языка: сначала через строку запроса, затем через cookie
			cache: ["cookie"], // Кэшируем определенный язык в cookie
		},
		interpolation: {
			escapeValue: false, // Отключаем экранирование значений (не нужно для React)
			prefix: "{{", // открывающий тег для переменных
			suffix: "}}", // закрывающий тег для переменных
		},
		lng: defaultLanguage, // Устанавливаем язык по умолчанию
	});

export default i18n; // Экспортируем настроенный экземпляр i18n для использования в приложении
