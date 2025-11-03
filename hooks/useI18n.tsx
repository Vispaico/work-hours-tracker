import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '../types';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

type TranslationValue = string | TranslationRecord;
interface TranslationRecord {
  [key: string]: TranslationValue;
}

const STORAGE_KEY = 'app_language';
const defaultLanguage: Language = 'en';
const supportedLanguages: Language[] = ['en', 'de', 'vi', 'es'];

const languageOptions = [
  { code: 'en' as const, label: 'English' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'vi' as const, label: 'Tiếng Việt' },
  { code: 'es' as const, label: 'Español' },
];

const translations: Record<Language, TranslationRecord> = {
  en: {
    app: {
      title: 'Work Hours Tracker',
      addEntryAria: 'Add new work entry',
    },
    nav: {
      calendar: 'Calendar',
      dashboard: 'Dashboard',
      settings: 'Settings',
    },
    common: {
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      add: 'Add',
      error: 'An error occurred.',
      totalHours: 'Total: {hours} hours',
    },
    calendar: {
      deleteConfirm: 'Are you sure you want to delete this entry?',
      unknownJob: 'Unknown Job',
    },
    dashboard: {
      title: 'Dashboard',
      filters: {
        period: 'Time Period',
        job: 'Job',
        date: 'Select Date',
      },
      periodOptions: {
        day: 'Day',
        week: 'Week',
        month: 'Month',
        year: 'Year',
      },
      allJobs: 'All Jobs',
      stats: {
        totalHours: 'Total Hours',
        totalDays: 'Total Days Worked',
        totalEarnings: 'Total Earnings',
      },
      chart: {
        title: 'Hours per Job',
        hoursLabel: 'Hours',
      },
    },
    settings: {
      jobs: {
        title: 'Manage Jobs',
        schedule: 'Schedule',
        rateDisplay: '{amount} / hour',
        addTitle: 'Add New Job',
        nameLabel: 'Job Name',
        rateLabel: 'Hourly Rate',
        currencyLabel: 'Currency',
        addButton: 'Add Job',
      },
      notifications: {
        title: 'Notifications',
        reminderLabel: 'Daily Reminder: "Any work today to clock?"',
        reminderNote: 'Reminder scheduled for {time}. Keep this tab running or enable push notifications for best reliability.',
        permissionDenied: 'Notifications are blocked. Please allow notifications in your browser settings.',
        updateError: 'Could not update reminder settings. Please try again.',
      },
      language: {
        title: 'Language Preferences',
        label: 'App Language',
      },
      theme: {
        toggle: 'Toggle theme',
        switchToDark: 'Switch to dark theme',
        switchToLight: 'Switch to light theme',
        dark: 'Dark',
        light: 'Light',
      },
    },
    entryModal: {
      ai: {
        title: 'Smart Entry with AI',
        examples: 'Examples: "Worked on Job 1 from 9am to 5pm yesterday", "log 6 hours for Job 2", "holiday for Job 1"',
        placeholder: 'Describe your work...',
        parse: 'Parse',
        parsing: 'Parsing...',
        jobNotFound: 'Job "{job}" not found. Please add it in Settings or correct the name.',
        unrecognized: 'Could not understand the request. Please try rephrasing.',
      },
      header: '{title} for {date}',
      addTitle: 'Add Entry',
      editTitle: 'Edit Entry',
      job: 'Job',
      entryType: 'Entry Type',
      types: {
        timeRange: 'Time Range',
        duration: 'Duration',
        status: 'Status',
      },
      startTime: 'Start Time',
      endTime: 'End Time',
      duration: 'Duration (hours)',
      status: 'Status',
      selectJob: 'Select a job',
      selectJobError: 'Please select a job.',
      addButton: 'Add Entry',
      saveButton: 'Save Changes',
    },
    statuses: {
      worked: 'Worked',
      off: 'Off',
      holiday: 'Holiday',
      sick: 'Sick Day',
    },
    auth: {
      loading: 'Signing in...',
      title: 'Welcome back',
      subtitleSignIn: 'Sign in to continue tracking your hours.',
      subtitleSignUp: 'Create an account to sync your hours across devices.',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      submitting: 'Please wait…',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      switchToSignUp: "Don't have an account? Sign up",
      switchToSignIn: 'Already have an account? Sign in',
      signOut: 'Sign Out',
      checkEmail: 'Check your inbox to confirm your email before signing in.',
      heroEyebrow: 'Work Hours Tracker',
      heroHeadline: 'Own your time. Work smarter.',
      heroSubheadline: 'Log shifts, track earnings, and keep every device in sync with one beautiful workspace.',
      heroCta: 'Create your free account',
      features: {
        tracking: {
          title: 'Instant time tracking',
          description: 'Capture hours, notes, and job details in seconds with calendar and AI-assisted entry.',
        },
        schedule: {
          title: 'Smart scheduling',
          description: 'Visualize weekly plans, set reminders, and never miss a shift again.',
        },
        sync: {
          title: 'Cross-platform sync',
          description: 'Cloud sync keeps web, iOS, and Android perfectly aligned—online or offline.',
        },
      },
      downloadTitle: 'Mobile apps coming soon',
      downloadSubtitle: 'Scan the codes below once apps launch to download instantly.',
      downloadPlaceholder: 'Preview',
    },
  },
  de: {
    app: {
      title: 'Arbeitszeit-Tracker',
      addEntryAria: 'Neue Arbeitszeit erfassen',
    },
    nav: {
      calendar: 'Kalender',
      dashboard: 'Dashboard',
      settings: 'Einstellungen',
    },
    common: {
      cancel: 'Abbrechen',
      save: 'Speichern',
      edit: 'Bearbeiten',
      add: 'Hinzufügen',
      error: 'Es ist ein Fehler aufgetreten.',
      totalHours: 'Gesamt: {hours} Stunden',
    },
    calendar: {
      deleteConfirm: 'Möchten Sie diesen Eintrag wirklich löschen?',
      unknownJob: 'Unbekannter Job',
    },
    dashboard: {
      title: 'Dashboard',
      filters: {
        period: 'Zeitraum',
        job: 'Job',
        date: 'Datum auswählen',
      },
      periodOptions: {
        day: 'Tag',
        week: 'Woche',
        month: 'Monat',
        year: 'Jahr',
      },
      allJobs: 'Alle Jobs',
      stats: {
        totalHours: 'Gesamtstunden',
        totalDays: 'Gesamte Arbeitstage',
        totalEarnings: 'Gesamteinnahmen',
      },
      chart: {
        title: 'Stunden pro Job',
        hoursLabel: 'Stunden',
      },
    },
    settings: {
      jobs: {
        title: 'Jobs verwalten',
        schedule: 'Arbeitsplan',
        rateDisplay: '{amount} pro Stunde',
        addTitle: 'Neuen Job hinzufügen',
        nameLabel: 'Jobname',
        rateLabel: 'Stundensatz',
        currencyLabel: 'Währung',
        addButton: 'Job hinzufügen',
      },
      notifications: {
        title: 'Benachrichtigungen',
        reminderLabel: 'Tägliche Erinnerung: „Heute schon gearbeitet?"',
        reminderNote: 'Erinnerung für {time} geplant. Lasse den Tab geöffnet oder erlaube Push-Benachrichtigungen für beste Zuverlässigkeit.',
        permissionDenied: 'Benachrichtigungen sind blockiert. Bitte erlaube Benachrichtigungen in deinen Browser-Einstellungen.',
        updateError: 'Erinnerung konnte nicht aktualisiert werden. Bitte versuche es erneut.',
      },
      language: {
        title: 'Spracheinstellungen',
        label: 'App-Sprache',
      },
      theme: {
        toggle: 'Design umschalten',
        switchToDark: 'Zum dunklen Design wechseln',
        switchToLight: 'Zum hellen Design wechseln',
        dark: 'Dunkel',
        light: 'Hell',
      },
    },
    entryModal: {
      ai: {
        title: 'Intelligente Eingabe mit KI',
        examples: 'Beispiele: „Gestern von 9 bis 17 Uhr an Job 1 gearbeitet", „6 Stunden für Job 2 eintragen", „Urlaub für Job 1"',
        placeholder: 'Beschreibe deine Arbeit...',
        parse: 'Analysieren',
        parsing: 'Analysiere...',
        jobNotFound: 'Job „{job}“ wurde nicht gefunden. Bitte füge ihn in den Einstellungen hinzu oder korrigiere den Namen.',
        unrecognized: 'Anfrage konnte nicht verstanden werden. Bitte formuliere sie anders.',
      },
      header: '{title} am {date}',
      addTitle: 'Eintrag hinzufügen',
      editTitle: 'Eintrag bearbeiten',
      job: 'Job',
      entryType: 'Eintragstyp',
      types: {
        timeRange: 'Zeitspanne',
        duration: 'Dauer',
        status: 'Status',
      },
      startTime: 'Startzeit',
      endTime: 'Endzeit',
      duration: 'Dauer (Stunden)',
      status: 'Status',
      selectJob: 'Job auswählen',
      selectJobError: 'Bitte wähle einen Job aus.',
      addButton: 'Eintrag hinzufügen',
      saveButton: 'Änderungen speichern',
    },
    statuses: {
      worked: 'Gearbeitet',
      off: 'Frei',
      holiday: 'Urlaub',
      sick: 'Krankentag',
    },
    auth: {
      loading: 'Anmeldung läuft…',
      title: 'Willkommen zurück',
      subtitleSignIn: 'Melde dich an, um deine Stunden weiter zu verfolgen.',
      subtitleSignUp: 'Erstelle ein Konto, um deine Stunden zu synchronisieren.',
      emailLabel: 'E-Mail',
      passwordLabel: 'Passwort',
      submitting: 'Bitte warten…',
      signIn: 'Anmelden',
      signUp: 'Registrieren',
      switchToSignUp: 'Noch kein Konto? Registriere dich',
      switchToSignIn: 'Schon ein Konto? Anmelden',
      signOut: 'Abmelden',
      checkEmail: 'Sieh in deinem Postfach nach und bestätige deine E-Mail, bevor du dich anmeldest.',
      heroEyebrow: 'Arbeitszeit-Tracker',
      heroHeadline: 'Behalte deine Zeit im Griff.',
      heroSubheadline: 'Erfasse Schichten, verfolge Einnahmen und synchronisiere jedes Gerät in einer eleganten Oberfläche.',
      heroCta: 'Kostenlos registrieren',
      features: {
        tracking: {
          title: 'Schnelles Tracking',
          description: 'Erfasse Stunden, Notizen und Jobdetails sekundenschnell – mit Kalender und KI-Unterstützung.',
        },
        schedule: {
          title: 'Intelligente Planung',
          description: 'Visualisiere Wochenpläne, setze Erinnerungen und verpasst keinen Einsatz mehr.',
        },
        sync: {
          title: 'Plattformübergreifende Synchronisierung',
          description: 'Cloud-Sync hält Web, iOS und Android perfekt abgestimmt – online wie offline.',
        },
      },
      downloadTitle: 'Mobile Apps bald verfügbar',
      downloadSubtitle: 'Scanne die Codes, sobald die Apps starten, um sie sofort zu laden.',
      downloadPlaceholder: 'Vorschau',
    },
  },
  vi: {
    app: {
      title: 'Trình theo dõi giờ làm việc',
      addEntryAria: 'Thêm ca làm mới',
    },
    nav: {
      calendar: 'Lịch',
      dashboard: 'Bảng điều khiển',
      settings: 'Cài đặt',
    },
    common: {
      cancel: 'Hủy',
      save: 'Lưu',
      edit: 'Chỉnh sửa',
      add: 'Thêm',
      error: 'Đã xảy ra lỗi.',
      totalHours: 'Tổng: {hours} giờ',
    },
    calendar: {
      deleteConfirm: 'Bạn có chắc muốn xóa mục này không?',
      unknownJob: 'Công việc chưa xác định',
    },
    dashboard: {
      title: 'Bảng điều khiển',
      filters: {
        period: 'Khoảng thời gian',
        job: 'Công việc',
        date: 'Chọn ngày',
      },
      periodOptions: {
        day: 'Ngày',
        week: 'Tuần',
        month: 'Tháng',
        year: 'Năm',
      },
      allJobs: 'Tất cả công việc',
      stats: {
        totalHours: 'Tổng số giờ',
        totalDays: 'Tổng số ngày làm việc',
        totalEarnings: 'Tổng thu nhập',
      },
      chart: {
        title: 'Số giờ theo công việc',
        hoursLabel: 'Giờ',
      },
    },
    settings: {
      jobs: {
        title: 'Quản lý công việc',
        schedule: 'Lịch làm',
        rateDisplay: '{amount} mỗi giờ',
        addTitle: 'Thêm công việc mới',
        nameLabel: 'Tên công việc',
        rateLabel: 'Đơn giá theo giờ',
        currencyLabel: 'Tiền tệ',
        addButton: 'Thêm công việc',
      },
      notifications: {
        title: 'Thông báo',
        reminderLabel: 'Nhắc nhở hằng ngày: “Hôm nay có làm việc không?”',
        reminderNote: 'Đã lên lịch nhắc nhở lúc {time}. Hãy giữ tab mở hoặc bật thông báo đẩy để đảm bảo nhận được.',
        permissionDenied: 'Thông báo đã bị chặn. Vui lòng cho phép thông báo trong cài đặt trình duyệt.',
        updateError: 'Không thể cập nhật nhắc nhở. Vui lòng thử lại.',
      },
      language: {
        title: 'Tùy chọn ngôn ngữ',
        label: 'Ngôn ngữ ứng dụng',
      },
      theme: {
        toggle: 'Chuyển đổi giao diện',
        switchToDark: 'Chuyển sang giao diện tối',
        switchToLight: 'Chuyển sang giao diện sáng',
        dark: 'Tối',
        light: 'Sáng',
      },
    },
    entryModal: {
      ai: {
        title: 'Nhập thông minh bằng AI',
        examples: 'Ví dụ: "Làm Job 1 từ 9h đến 17h hôm qua", "ghi 6 giờ cho Job 2", "nghỉ lễ cho Job 1"',
        placeholder: 'Mô tả công việc của bạn...',
        parse: 'Phân tích',
        parsing: 'Đang phân tích...',
        jobNotFound: 'Không tìm thấy công việc "{job}". Vui lòng thêm trong Cài đặt hoặc kiểm tra lại tên.',
        unrecognized: 'Không thể hiểu yêu cầu. Vui lòng thử lại.',
      },
      header: '{title} vào {date}',
      addTitle: 'Thêm mục',
      editTitle: 'Chỉnh sửa mục',
      job: 'Công việc',
      entryType: 'Loại mục',
      types: {
        timeRange: 'Khoảng thời gian',
        duration: 'Thời lượng',
        status: 'Trạng thái',
      },
      startTime: 'Giờ bắt đầu',
      endTime: 'Giờ kết thúc',
      duration: 'Thời lượng (giờ)',
      status: 'Trạng thái',
      selectJob: 'Chọn công việc',
      selectJobError: 'Vui lòng chọn công việc.',
      addButton: 'Thêm',
      saveButton: 'Lưu thay đổi',
    },
    statuses: {
      worked: 'Đã làm',
      off: 'Nghỉ',
      holiday: 'Nghỉ lễ',
      sick: 'Nghỉ ốm',
    },
    auth: {
      loading: 'Đang đăng nhập…',
      title: 'Chào mừng bạn trở lại',
      subtitleSignIn: 'Đăng nhập để tiếp tục theo dõi giờ làm.',
      subtitleSignUp: 'Tạo tài khoản để đồng bộ giờ làm trên mọi thiết bị.',
      emailLabel: 'Email',
      passwordLabel: 'Mật khẩu',
      submitting: 'Vui lòng đợi…',
      signIn: 'Đăng nhập',
      signUp: 'Đăng ký',
      switchToSignUp: 'Chưa có tài khoản? Đăng ký',
      switchToSignIn: 'Đã có tài khoản? Đăng nhập',
      signOut: 'Đăng xuất',
      checkEmail: 'Hãy kiểm tra hộp thư và xác nhận email trước khi đăng nhập.',
      heroEyebrow: 'Ứng dụng chấm công',
      heroHeadline: 'Kiểm soát thời gian của bạn.',
      heroSubheadline: 'Ghi lại ca làm, theo dõi thu nhập và đồng bộ mọi thiết bị trong một không gian hiện đại.',
      heroCta: 'Tạo tài khoản miễn phí',
      features: {
        tracking: {
          title: 'Ghi giờ tức thì',
          description: 'Ghi lại giờ làm, ghi chú và chi tiết công việc trong vài giây với lịch và trợ lý AI.',
        },
        schedule: {
          title: 'Lịch làm thông minh',
          description: 'Nhìn toàn bộ tuần, đặt nhắc nhở và không bao giờ bỏ lỡ ca làm.',
        },
        sync: {
          title: 'Đồng bộ đa nền tảng',
          description: 'Đồng bộ đám mây giữ web, iOS và Android luôn khớp – dù online hay offline.',
        },
      },
      downloadTitle: 'Ứng dụng di động sắp ra mắt',
      downloadSubtitle: 'Quét mã bên dưới khi ứng dụng phát hành để tải ngay.',
      downloadPlaceholder: 'Xem trước',
    },
  },
  es: {
    app: {
      title: 'Registro de horas de trabajo',
      addEntryAria: 'Añadir nuevo registro de trabajo',
    },
    nav: {
      calendar: 'Calendario',
      dashboard: 'Panel',
      settings: 'Ajustes',
    },
    common: {
      cancel: 'Cancelar',
      save: 'Guardar',
      edit: 'Editar',
      add: 'Añadir',
      error: 'Ocurrió un error.',
      totalHours: 'Total: {hours} horas',
    },
    calendar: {
      deleteConfirm: '¿Seguro que deseas eliminar este registro?',
      unknownJob: 'Trabajo desconocido',
    },
    dashboard: {
      title: 'Panel',
      filters: {
        period: 'Periodo',
        job: 'Trabajo',
        date: 'Seleccionar fecha',
      },
      periodOptions: {
        day: 'Día',
        week: 'Semana',
        month: 'Mes',
        year: 'Año',
      },
      allJobs: 'Todos los trabajos',
      stats: {
        totalHours: 'Horas totales',
        totalDays: 'Días trabajados',
        totalEarnings: 'Ingresos totales',
      },
      chart: {
        title: 'Horas por trabajo',
        hoursLabel: 'Horas',
      },
    },
    settings: {
      jobs: {
        title: 'Gestionar trabajos',
        schedule: 'Horario',
        rateDisplay: '{amount} por hora',
        addTitle: 'Añadir nuevo trabajo',
        nameLabel: 'Nombre del trabajo',
        rateLabel: 'Tarifa por hora',
        currencyLabel: 'Moneda',
        addButton: 'Añadir trabajo',
      },
      notifications: {
        title: 'Notificaciones',
        reminderLabel: 'Recordatorio diario: "¿Hay trabajo hoy?"',
        reminderNote: 'Recordatorio programado para las {time}. Mantén esta pestaña abierta o permite notificaciones push para mayor fiabilidad.',
        permissionDenied: 'Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.',
        updateError: 'No se pudo actualizar el recordatorio. Inténtalo de nuevo.',
      },
      language: {
        title: 'Preferencias de idioma',
        label: 'Idioma de la aplicación',
      },
      theme: {
        toggle: 'Cambiar tema',
        switchToDark: 'Cambiar al tema oscuro',
        switchToLight: 'Cambiar al tema claro',
        dark: 'Oscuro',
        light: 'Claro',
      },
    },
    entryModal: {
      ai: {
        title: 'Registro inteligente con IA',
        examples: 'Ejemplos: "Trabajé en el Trabajo 1 de 9 a 17 ayer", "registrar 6 horas para el Trabajo 2", "feriado para el Trabajo 1"',
        placeholder: 'Describe tu trabajo...',
        parse: 'Analizar',
        parsing: 'Analizando...',
        jobNotFound: 'No se encontró el trabajo "{job}". Añádelo en Ajustes o corrige el nombre.',
        unrecognized: 'No se pudo entender la solicitud. Inténtalo de nuevo.',
      },
      header: '{title} para {date}',
      addTitle: 'Añadir registro',
      editTitle: 'Editar registro',
      job: 'Trabajo',
      entryType: 'Tipo de registro',
      types: {
        timeRange: 'Intervalo',
        duration: 'Duración',
        status: 'Estado',
      },
      startTime: 'Hora de inicio',
      endTime: 'Hora de fin',
      duration: 'Duración (horas)',
      status: 'Estado',
      selectJob: 'Selecciona un trabajo',
      selectJobError: 'Selecciona un trabajo.',
      addButton: 'Añadir',
      saveButton: 'Guardar cambios',
    },
    statuses: {
      worked: 'Trabajado',
      off: 'Libre',
      holiday: 'Festivo',
      sick: 'Baja médica',
    },
    auth: {
      loading: 'Iniciando sesión…',
      title: 'Bienvenido de nuevo',
      subtitleSignIn: 'Inicia sesión para seguir registrando tus horas.',
      subtitleSignUp: 'Crea una cuenta para sincronizar tus horas en todos tus dispositivos.',
      emailLabel: 'Correo',
      passwordLabel: 'Contraseña',
      submitting: 'Por favor espera…',
      signIn: 'Iniciar sesión',
      signUp: 'Registrarse',
      switchToSignUp: '¿No tienes cuenta? Regístrate',
      switchToSignIn: '¿Ya tienes cuenta? Inicia sesión',
      signOut: 'Cerrar sesión',
      checkEmail: 'Revisa tu bandeja de entrada y confirma tu correo antes de iniciar sesión.',
      heroEyebrow: 'Control de horas',
      heroHeadline: 'Toma el control de tu tiempo.',
      heroSubheadline: 'Registra turnos, monitorea ingresos y sincroniza cada dispositivo en una experiencia elegante.',
      heroCta: 'Crea tu cuenta gratis',
      features: {
        tracking: {
          title: 'Registro instantáneo',
          description: 'Captura horas, notas y detalles del trabajo en segundos con calendario y asistencia de IA.',
        },
        schedule: {
          title: 'Planificación inteligente',
          description: 'Visualiza agendas semanales, configura recordatorios y nunca pierdas un turno.',
        },
        sync: {
          title: 'Sincronización multiplataforma',
          description: 'La nube mantiene web, iOS y Android perfectamente alineados—en línea u offline.',
        },
      },
      downloadTitle: 'Apps móviles muy pronto',
      downloadSubtitle: 'Escanea los códigos cuando se lancen las apps para descargarlas al instante.',
      downloadPlaceholder: 'Vista previa',
    },
  },
};

const resolvePath = (tree: TranslationRecord, key: string): TranslationValue | undefined => {
  return key.split('.').reduce<TranslationValue | undefined>((acc, segment) => {
    if (acc && typeof acc === 'object' && segment in acc) {
      return (acc as TranslationRecord)[segment];
    }
    return undefined;
  }, tree);
};

const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && supportedLanguages.includes(value as Language);

interface I18nContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  languageOptions: typeof languageOptions;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const stored = getFromStorage<string | Language>(STORAGE_KEY, defaultLanguage);
    return isLanguage(stored) ? stored : defaultLanguage;
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const active = translations[language] ?? translations[defaultLanguage];
    const fallback = translations[defaultLanguage];

    const translate = (key: string, replacements?: Record<string, string | number>) => {
      const entry = resolvePath(active, key) ?? resolvePath(fallback, key);
      if (typeof entry !== 'string') {
        return key;
      }
      if (!replacements) {
        return entry;
      }
      return Object.entries(replacements).reduce((acc, [placeholder, replacement]) => {
        const pattern = new RegExp(`\\{${placeholder}\\}`, 'g');
        return acc.replace(pattern, String(replacement));
      }, entry);
    };

    const changeLanguage = (next: Language) => {
      if (next !== language && supportedLanguages.includes(next)) {
        setLanguageState(next);
      }
    };

    return {
      language,
      setLanguage: changeLanguage,
      t: translate,
      languageOptions,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};
