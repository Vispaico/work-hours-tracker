import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Language } from '../types';
import { getFromStorage, saveToStorage } from '../utils/localStorage';

type TranslationValue = string | TranslationRecord;
interface TranslationRecord {
  [key: string]: TranslationValue;
}

const STORAGE_KEY = 'app_language';
const defaultLanguage: Language = 'en';
const supportedLanguages: Language[] = [
  'en', 'de', 'vi', 'es', 'fr', 'it', 'pt', 'ru', 'tr', 'pl', 'nl',
  'zh', 'ja', 'ko', 'hi', 'th', 'id', 'ar', 'sv', 'fi', 'da', 'no'
];

const languageOptions = [
  { code: 'en' as const, label: 'English' },
  { code: 'de' as const, label: 'Deutsch' },
  { code: 'vi' as const, label: 'Tiếng Việt' },
  { code: 'es' as const, label: 'Español' },
  { code: 'fr' as const, label: 'Français' },
  { code: 'it' as const, label: 'Italiano' },
  { code: 'pt' as const, label: 'Português' },
  { code: 'ru' as const, label: 'Русский' },
  { code: 'tr' as const, label: 'Türkçe' },
  { code: 'pl' as const, label: 'Polski' },
  { code: 'nl' as const, label: 'Nederlands' },
  { code: 'zh' as const, label: '中文' },
  { code: 'ja' as const, label: '日本語' },
  { code: 'ko' as const, label: '한국어' },
  { code: 'hi' as const, label: 'हिन्दी' },
  { code: 'th' as const, label: 'ไทย' },
  { code: 'id' as const, label: 'Bahasa Indonesia' },
  { code: 'ar' as const, label: 'العربية' },
  { code: 'sv' as const, label: 'Svenska' },
  { code: 'fi' as const, label: 'Suomi' },
  { code: 'da' as const, label: 'Dansk' },
  { code: 'no' as const, label: 'Norsk' },
].sort((a, b) => a.label.localeCompare(b.label));

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
      delete: 'Delete',
      error: 'An error occurred.',
      totalHours: 'Total: {hours} hours',
    },
    calendar: {
      deleteConfirm: 'Are you sure you want to delete this entry?',
      unknownJob: 'Unknown Job',
      noEntries: 'No entries for this day yet.',
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
        notSupported: 'Notifications are not supported on this device or browser.',
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
      heroHeadline: 'Track multiple gigs without spreadsheet headaches.',
      heroSubheadline: 'Stop losing money to manual math. See every shift, rate, and payout in one workspace with totals you can trust.',
      heroCta: 'Create your free account',
      metrics: {
        multiJobs: {
          label: 'Gigs tracked per day',
          value: '3+',
          detail: 'Color-coded dots keep overlapping shifts obvious.'
        },
        accuracy: {
          label: 'Pay accuracy',
          value: '98%',
          detail: 'Automated totals eliminate spreadsheet errors.'
        },
        sync: {
          label: 'Platforms covered',
          value: 'Web · iOS · Android',
          detail: 'One sign-in, every device up to date.'
        },
      },
      socialProofHeadline: 'Join 1,000+ freelancers tracking multiple gigs.',
      socialProofDetail: 'Studios, contractors, and agencies trust Work Hours Tracker every week.',
      demoLabel: 'Product tour',
      demoDuration: '60 sec',
      demoSubtitle: 'Watch a quick walkthrough of multi-gig tracking, auto-calculated earnings, and exports.',
      demoFallbackTitle: 'Quick product tour',
      demoFallbackSubtitle: 'Your demo video will play here.',
      previewBadge: 'Preview',
      previewNote: 'Sample data for illustration only.',
      previewTitle: 'Calendar preview',
      previewHeadline: 'Today',
      whatTitle: 'What you get on day one',
      what: {
        planner: {
          title: 'Visual shift planner',
          description: 'A calendar that shows every job at once so you always know where time goes.'
        },
        capture: {
          title: 'Frictionless capture',
          description: 'Tap, drag or type natural language and let AI turn it into structured entries.'
        },
        earnings: {
          title: 'Automatic earnings math',
          description: 'Hourly rates, currencies and overtime roll up instantly for every job.'
        },
        export: {
          title: 'Export to Excel',
          description: 'Export easy to excel either per job or combined. Several options are available.'
        },
      },
      whyTitle: 'Why crews track hours with Work Hours Tracker',
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
      delete: 'Löschen',
      error: 'Es ist ein Fehler aufgetreten.',
      totalHours: 'Gesamt: {hours} Stunden',
    },
    calendar: {
      deleteConfirm: 'Möchten Sie diesen Eintrag wirklich löschen?',
      unknownJob: 'Unbekannter Job',
      noEntries: 'Für diesen Tag liegen noch keine Einträge vor.',
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
        notSupported: 'Benachrichtigungen werden auf diesem Gerät oder Browser nicht unterstützt.',
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
      whatTitle: 'Das bekommst du ab Tag eins',
      what: {
        planner: {
          title: 'Visueller Schichtplaner',
          description: 'Ein Kalender zeigt alle Jobs gleichzeitig, damit du immer weißt, wohin deine Zeit geht.'
        },
        capture: {
          title: 'Reibungslose Erfassung',
          description: 'Tippen, ziehen oder in Alltagssprache schreiben – die KI macht daraus strukturierte Einträge.'
        },
        earnings: {
          title: 'Automatische Verdienstberechnung',
          description: 'Stundensätze, Währungen und Überstunden werden pro Job sofort zusammengerechnet.'
        },
        export: {
          title: 'Export nach Excel',
          description: 'Exportiere Jobs einzeln oder gesammelt nach Excel – mehrere Optionen stehen bereit.'
        },
      },
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
      delete: 'Xóa',
      error: 'Đã xảy ra lỗi.',
      totalHours: 'Tổng: {hours} giờ',
    },
    calendar: {
      deleteConfirm: 'Bạn có chắc muốn xóa mục này không?',
      unknownJob: 'Công việc chưa xác định',
      noEntries: 'Chưa có mục nào cho ngày này.',
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
        notSupported: 'Thiết bị hoặc trình duyệt này không hỗ trợ thông báo.',
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
      whatTitle: 'Bạn nhận được gì ngay ngày đầu',
      what: {
        planner: {
          title: 'Lịch ca trực trực quan',
          description: 'Một lịch hiển thị mọi công việc cùng lúc để bạn luôn biết thời gian dùng cho việc gì.'
        },
        capture: {
          title: 'Ghi chép siêu nhanh',
          description: 'Chạm, kéo hoặc gõ ngôn ngữ tự nhiên và để AI biến thành mục dữ liệu chuẩn.'
        },
        earnings: {
          title: 'Tính thu nhập tự động',
          description: 'Đơn giá giờ, tiền tệ và tăng ca được tổng hợp tức thì cho từng công việc.'
        },
        export: {
          title: 'Xuất Excel linh hoạt',
          description: 'Xuất theo từng công việc hoặc gộp chung ra Excel với nhiều tùy chọn.'
        },
      },
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
      delete: 'Eliminar',
      error: 'Ocurrió un error.',
      totalHours: 'Total: {hours} horas',
    },
    calendar: {
      deleteConfirm: '¿Seguro que deseas eliminar este registro?',
      unknownJob: 'Trabajo desconocido',
      noEntries: 'Aún no hay registros para este día.',
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
        notSupported: 'Las notificaciones no son compatibles con este dispositivo o navegador.',
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
      whatTitle: 'Lo que recibes desde el primer día',
      what: {
        planner: {
          title: 'Planificador visual de turnos',
          description: 'Un calendario que muestra todos los trabajos a la vez para saber siempre dónde va tu tiempo.'
        },
        capture: {
          title: 'Captura sin fricción',
          description: 'Toca, arrastra o escribe en lenguaje natural y deja que la IA cree registros estructurados.'
        },
        earnings: {
          title: 'Cálculo automático de ingresos',
          description: 'Tarifas horarias, monedas y horas extra se suman al instante para cada trabajo.'
        },
        export: {
          title: 'Exportación a Excel',
          description: 'Exporta fácilmente a Excel por trabajo o combinado, con varias opciones disponibles.'
        },
      },
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
  fr: {
    app: { title: 'Suivi des heures', addEntryAria: 'Ajouter une entrée' },
    nav: { calendar: 'Calendrier', dashboard: 'Tableau de bord', settings: 'Paramètres' },
    common: { cancel: 'Annuler', save: 'Enregistrer', edit: 'Modifier', add: 'Ajouter', delete: 'Supprimer', error: 'Une erreur est survenue.', totalHours: 'Total: {hours} heures' },
    calendar: { deleteConfirm: 'Voulez-vous vraiment supprimer cette entrée ?', unknownJob: 'Job inconnu', noEntries: 'Aucune entrée pour ce jour.' },
    dashboard: { title: 'Tableau de bord', filters: { period: 'Période', job: 'Job', date: 'Date' }, periodOptions: { day: 'Jour', week: 'Semaine', month: 'Mois', year: 'Année' }, allJobs: 'Tous les jobs', stats: { totalHours: 'Heures totales', totalDays: 'Jours travaillés', totalEarnings: 'Gains totaux' }, chart: { title: 'Heures par job', hoursLabel: 'Heures' } },
    settings: { jobs: { title: 'Gérer les jobs', schedule: 'Horaire', rateDisplay: '{amount} / heure', addTitle: 'Ajouter un job', nameLabel: 'Nom du job', rateLabel: 'Taux horaire', currencyLabel: 'Devise', addButton: 'Ajouter' }, notifications: { title: 'Notifications', reminderLabel: 'Rappel quotidien', reminderNote: 'Rappel prévu à {time}.', permissionDenied: 'Notifications bloquées.', notSupported: 'Non supporté.', updateError: 'Erreur de mise à jour.' }, language: { title: 'Langue', label: 'Langue de l\'app' }, theme: { toggle: 'Changer de thème', switchToDark: 'Mode sombre', switchToLight: 'Mode clair', dark: 'Sombre', light: 'Clair' } },
    entryModal: { ai: { title: 'Entrée intelligente IA', examples: 'Ex: "Travaillé sur Job 1 de 9h à 17h"', placeholder: 'Décrivez votre travail...', parse: 'Analyser', parsing: 'Analyse...', jobNotFound: 'Job non trouvé', unrecognized: 'Non reconnu' }, header: '{title} pour {date}', addTitle: 'Ajouter', editTitle: 'Modifier', job: 'Job', entryType: 'Type', types: { timeRange: 'Plage horaire', duration: 'Durée', status: 'Statut' }, startTime: 'Début', endTime: 'Fin', duration: 'Durée (h)', status: 'Statut', selectJob: 'Choisir un job', selectJobError: 'Sélectionnez un job', addButton: 'Ajouter', saveButton: 'Enregistrer' },
    statuses: { worked: 'Travaillé', off: 'Repos', holiday: 'Vacances', sick: 'Maladie' },
    auth: { loading: 'Connexion...', title: 'Bienvenue', subtitleSignIn: 'Connectez-vous', subtitleSignUp: 'Créer un compte', emailLabel: 'Email', passwordLabel: 'Mot de passe', submitting: 'Patientez...', signIn: 'Connexion', signUp: 'Inscription', switchToSignUp: 'Pas de compte ?', switchToSignIn: 'Déjà un compte ?', signOut: 'Déconnexion', checkEmail: 'Vérifiez votre email', heroEyebrow: 'Suivi d\'heures', heroHeadline: 'Maîtrisez votre temps', heroSubheadline: 'Suivez vos heures et gains', heroCta: 'Compte gratuit',
      whatTitle: 'Ce que vous obtenez dès le premier jour',
      what: {
        planner: {
          title: 'Planificateur visuel de shifts',
          description: 'Un calendrier affiche tous vos jobs d’un coup pour savoir où passe votre temps.'
        },
        capture: {
          title: 'Capture sans friction',
          description: 'Touchez, faites glisser ou écrivez en langage naturel et laissez l’IA structurer vos entrées.'
        },
        earnings: {
          title: 'Calcul automatique des gains',
          description: 'Taux horaires, devises et heures sup’ sont consolidés instantanément par job.'
        },
        export: {
          title: 'Export vers Excel',
          description: 'Exportez facilement vers Excel par job ou combiné, avec plusieurs options.'
        },
      },
      features: { tracking: { title: 'Suivi instantané', description: 'Capturez vos heures rapidement' }, schedule: { title: 'Planning intelligent', description: 'Visualisez votre semaine' }, sync: { title: 'Synchro cloud', description: 'Web, iOS et Android' } }, downloadTitle: 'Apps mobiles bientôt', downloadSubtitle: 'Scannez pour télécharger', downloadPlaceholder: 'Aperçu' }
  },
  it: {
    app: { title: 'Tracciamento Ore', addEntryAria: 'Aggiungi voce' },
    nav: { calendar: 'Calendario', dashboard: 'Dashboard', settings: 'Impostazioni' },
    common: { cancel: 'Annulla', save: 'Salva', edit: 'Modifica', add: 'Aggiungi', delete: 'Elimina', error: 'Errore.', totalHours: 'Totale: {hours} ore' },
    calendar: { deleteConfirm: 'Eliminare questa voce?', unknownJob: 'Lavoro sconosciuto', noEntries: 'Nessuna voce.' },
    dashboard: { title: 'Dashboard', filters: { period: 'Periodo', job: 'Lavoro', date: 'Data' }, periodOptions: { day: 'Giorno', week: 'Settimana', month: 'Mese', year: 'Anno' }, allJobs: 'Tutti i lavori', stats: { totalHours: 'Ore totali', totalDays: 'Giorni lavorati', totalEarnings: 'Guadagni totali' }, chart: { title: 'Ore per lavoro', hoursLabel: 'Ore' } },
    settings: { jobs: { title: 'Gestisci lavori', schedule: 'Orario', rateDisplay: '{amount} / ora', addTitle: 'Nuovo lavoro', nameLabel: 'Nome', rateLabel: 'Tariffa oraria', currencyLabel: 'Valuta', addButton: 'Aggiungi' }, notifications: { title: 'Notifiche', reminderLabel: 'Promemoria giornaliero', reminderNote: 'Promemoria alle {time}.', permissionDenied: 'Notifiche bloccate.', notSupported: 'Non supportato.', updateError: 'Errore aggiornamento.' }, language: { title: 'Lingua', label: 'Lingua app' }, theme: { toggle: 'Cambia tema', switchToDark: 'Modo scuro', switchToLight: 'Modo chiaro', dark: 'Scuro', light: 'Chiaro' } },
    entryModal: { ai: { title: 'Input Smart AI', examples: 'Es: "Lavorato su Job 1 dalle 9 alle 17"', placeholder: 'Descrivi il lavoro...', parse: 'Analizza', parsing: 'Analisi...', jobNotFound: 'Lavoro non trovato', unrecognized: 'Non riconosciuto' }, header: '{title} per {date}', addTitle: 'Aggiungi', editTitle: 'Modifica', job: 'Lavoro', entryType: 'Tipo', types: { timeRange: 'Orario', duration: 'Durata', status: 'Stato' }, startTime: 'Inizio', endTime: 'Fine', duration: 'Durata (h)', status: 'Stato', selectJob: 'Seleziona lavoro', selectJobError: 'Seleziona un lavoro', addButton: 'Aggiungi', saveButton: 'Salva' },
    statuses: { worked: 'Lavorato', off: 'Riposo', holiday: 'Ferie', sick: 'Malattia' },
    auth: { loading: 'Accesso...', title: 'Bentornato', subtitleSignIn: 'Accedi', subtitleSignUp: 'Registrati', emailLabel: 'Email', passwordLabel: 'Password', submitting: 'Attendi...', signIn: 'Accedi', signUp: 'Registrati', switchToSignUp: 'Non hai un account?', switchToSignIn: 'Hai già un account?', signOut: 'Esci', checkEmail: 'Controlla email', heroEyebrow: 'Tracciamento Ore', heroHeadline: 'Gestisci il tuo tempo', heroSubheadline: 'Traccia ore e guadagni', heroCta: 'Account gratuito',
      whatTitle: 'Cosa ottieni dal primo giorno',
      what: {
        planner: {
          title: 'Planner turni visivo',
          description: 'Un calendario mostra tutti i lavori insieme così sai sempre dove va il tuo tempo.'
        },
        capture: {
          title: 'Acquisizione senza attriti',
          description: 'Tocca, trascina o scrivi in linguaggio naturale e lascia che l’IA crei voci strutturate.'
        },
        earnings: {
          title: 'Calcolo automatico dei guadagni',
          description: 'Tariffe orarie, valute e straordinari vengono sommati in modo immediato per ogni lavoro.'
        },
        export: {
          title: 'Esporta in Excel',
          description: 'Esporta facilmente in Excel per singolo lavoro o combinato, con diverse opzioni disponibili.'
        },
      },
      features: { tracking: { title: 'Tracciamento istantaneo', description: 'Cattura le ore rapidamente' }, schedule: { title: 'Pianificazione smart', description: 'Visualizza la settimana' }, sync: { title: 'Sync cloud', description: 'Web, iOS e Android' } }, downloadTitle: 'App mobili presto', downloadSubtitle: 'Scansiona per scaricare', downloadPlaceholder: 'Anteprima' }
  },
  pt: {
    app: { title: 'Rastreador de Horas', addEntryAria: 'Adicionar entrada' },
    nav: { calendar: 'Calendário', dashboard: 'Painel', settings: 'Configurações' },
    common: { cancel: 'Cancelar', save: 'Salvar', edit: 'Editar', add: 'Adicionar', delete: 'Excluir', error: 'Erro.', totalHours: 'Total: {hours} horas' },
    calendar: { deleteConfirm: 'Excluir esta entrada?', unknownJob: 'Trabalho desconhecido', noEntries: 'Sem entradas.' },
    dashboard: { title: 'Painel', filters: { period: 'Período', job: 'Trabalho', date: 'Data' }, periodOptions: { day: 'Dia', week: 'Semana', month: 'Mês', year: 'Ano' }, allJobs: 'Todos os trabalhos', stats: { totalHours: 'Horas totais', totalDays: 'Dias trabalhados', totalEarnings: 'Ganhos totais' }, chart: { title: 'Horas por trabalho', hoursLabel: 'Horas' } },
    settings: { jobs: { title: 'Gerenciar trabalhos', schedule: 'Horário', rateDisplay: '{amount} / hora', addTitle: 'Novo trabalho', nameLabel: 'Nome', rateLabel: 'Taxa horária', currencyLabel: 'Moeda', addButton: 'Adicionar' }, notifications: { title: 'Notificações', reminderLabel: 'Lembrete diário', reminderNote: 'Lembrete às {time}.', permissionDenied: 'Bloqueado.', notSupported: 'Não suportado.', updateError: 'Erro.' }, language: { title: 'Idioma', label: 'Idioma do app' }, theme: { toggle: 'Alternar tema', switchToDark: 'Modo escuro', switchToLight: 'Modo claro', dark: 'Escuro', light: 'Claro' } },
    entryModal: { ai: { title: 'Entrada Inteligente IA', examples: 'Ex: "Trabalhei no Job 1 das 9 às 17"', placeholder: 'Descreva o trabalho...', parse: 'Analisar', parsing: 'Analisando...', jobNotFound: 'Trabalho não encontrado', unrecognized: 'Não reconhecido' }, header: '{title} para {date}', addTitle: 'Adicionar', editTitle: 'Editar', job: 'Trabalho', entryType: 'Tipo', types: { timeRange: 'Horário', duration: 'Duração', status: 'Status' }, startTime: 'Início', endTime: 'Fim', duration: 'Duração (h)', status: 'Status', selectJob: 'Selecione um trabalho', selectJobError: 'Selecione um trabalho', addButton: 'Adicionar', saveButton: 'Salvar' },
    statuses: { worked: 'Trabalhado', off: 'Folga', holiday: 'Férias', sick: 'Doença' },
    auth: { loading: 'Entrando...', title: 'Bem-vindo', subtitleSignIn: 'Entrar', subtitleSignUp: 'Criar conta', emailLabel: 'Email', passwordLabel: 'Senha', submitting: 'Aguarde...', signIn: 'Entrar', signUp: 'Cadastrar', switchToSignUp: 'Sem conta?', switchToSignIn: 'Já tem conta?', signOut: 'Sair', checkEmail: 'Verifique seu email', heroEyebrow: 'Rastreador de Horas', heroHeadline: 'Controle seu tempo', heroSubheadline: 'Rastreie horas e ganhos', heroCta: 'Conta grátis',
      whatTitle: 'O que você recebe no primeiro dia',
      what: {
        planner: {
          title: 'Planejador visual de turnos',
          description: 'Um calendário mostra todos os trabalhos de uma vez para você saber para onde vai o tempo.'
        },
        capture: {
          title: 'Captura sem atrito',
          description: 'Toque, arraste ou digite em linguagem natural e deixe a IA gerar entradas estruturadas.'
        },
        earnings: {
          title: 'Cálculo automático de ganhos',
          description: 'Taxas horárias, moedas e horas extras são consolidadas instantaneamente por trabalho.'
        },
        export: {
          title: 'Exportar para Excel',
          description: 'Exporte facilmente para Excel por trabalho ou combinado, com várias opções.'
        },
      },
      features: { tracking: { title: 'Rastreamento instantâneo', description: 'Capture horas rapidamente' }, schedule: { title: 'Agendamento inteligente', description: 'Visualize a semana' }, sync: { title: 'Sync nuvem', description: 'Web, iOS e Android' } }, downloadTitle: 'Apps móveis em breve', downloadSubtitle: 'Escaneie para baixar', downloadPlaceholder: 'Prévia' }
  },
  ru: {
    app: { title: 'Трекер часов', addEntryAria: 'Добавить запись' },
    nav: { calendar: 'Календарь', dashboard: 'Дашборд', settings: 'Настройки' },
    common: { cancel: 'Отмена', save: 'Сохранить', edit: 'Изменить', add: 'Добавить', delete: 'Удалить', error: 'Ошибка.', totalHours: 'Всего: {hours} ч' },
    calendar: { deleteConfirm: 'Удалить запись?', unknownJob: 'Неизвестная работа', noEntries: 'Нет записей.' },
    dashboard: { title: 'Дашборд', filters: { period: 'Период', job: 'Работа', date: 'Дата' }, periodOptions: { day: 'День', week: 'Неделя', month: 'Месяц', year: 'Год' }, allJobs: 'Все работы', stats: { totalHours: 'Всего часов', totalDays: 'Дней', totalEarnings: 'Заработок' }, chart: { title: 'Часы по работе', hoursLabel: 'Часы' } },
    settings: { jobs: { title: 'Управление работами', schedule: 'График', rateDisplay: '{amount} / час', addTitle: 'Новая работа', nameLabel: 'Название', rateLabel: 'Ставка', currencyLabel: 'Валюта', addButton: 'Добавить' }, notifications: { title: 'Уведомления', reminderLabel: 'Ежедневное напоминание', reminderNote: 'Напоминание в {time}.', permissionDenied: 'Заблокировано.', notSupported: 'Не поддерживается.', updateError: 'Ошибка.' }, language: { title: 'Язык', label: 'Язык приложения' }, theme: { toggle: 'Сменить тему', switchToDark: 'Тёмная тема', switchToLight: 'Светлая тема', dark: 'Тёмная', light: 'Светлая' } },
    entryModal: { ai: { title: 'Умный ввод (AI)', examples: 'Пример: "Работал на Job 1 с 9 до 17"', placeholder: 'Опишите работу...', parse: 'Разобрать', parsing: 'Анализ...', jobNotFound: 'Работа не найдена', unrecognized: 'Не распознано' }, header: '{title} на {date}', addTitle: 'Добавить', editTitle: 'Изменить', job: 'Работа', entryType: 'Тип', types: { timeRange: 'Время', duration: 'Длительность', status: 'Статус' }, startTime: 'Начало', endTime: 'Конец', duration: 'Длительность (ч)', status: 'Статус', selectJob: 'Выберите работу', selectJobError: 'Выберите работу', addButton: 'Добавить', saveButton: 'Сохранить' },
    statuses: { worked: 'Работал', off: 'Выходной', holiday: 'Отпуск', sick: 'Болезнь' },
    auth: { loading: 'Вход...', title: 'Добро пожаловать', subtitleSignIn: 'Войти', subtitleSignUp: 'Регистрация', emailLabel: 'Email', passwordLabel: 'Пароль', submitting: 'Ждите...', signIn: 'Войти', signUp: 'Регистрация', switchToSignUp: 'Нет аккаунта?', switchToSignIn: 'Есть аккаунт?', signOut: 'Выйти', checkEmail: 'Проверьте email', heroEyebrow: 'Трекер часов', heroHeadline: 'Управляй временем', heroSubheadline: 'Следи за часами и доходом', heroCta: 'Бесплатно',
      whatTitle: 'Что вы получаете уже в первый день',
      what: {
        planner: {
          title: 'Визуальный планировщик смен',
          description: 'Календарь показывает все задания сразу, чтобы вы знали, куда уходит время.'
        },
        capture: {
          title: 'Ввод без лишних действий',
          description: 'Нажмите, перетащите или напишите простым языком — ИИ создаст структурированные записи.'
        },
        earnings: {
          title: 'Автоматический расчет дохода',
          description: 'Почасовые ставки, валюты и переработки мгновенно суммируются по каждому заданию.'
        },
        export: {
          title: 'Экспорт в Excel',
          description: 'Легко экспортируйте по отдельным работам или суммарно в Excel — доступно несколько вариантов.'
        },
      },
      features: { tracking: { title: 'Мгновенный трекинг', description: 'Быстрый ввод' }, schedule: { title: 'Умный график', description: 'План на неделю' }, sync: { title: 'Облачная синхронизация', description: 'Web, iOS, Android' } }, downloadTitle: 'Скоро на мобильных', downloadSubtitle: 'Сканируй для загрузки', downloadPlaceholder: 'Превью' }
  },
  tr: {
    app: { title: 'İş Saati Takibi', addEntryAria: 'Yeni giriş ekle' },
    nav: { calendar: 'Takvim', dashboard: 'Panel', settings: 'Ayarlar' },
    common: { cancel: 'İptal', save: 'Kaydet', edit: 'Düzenle', add: 'Ekle', delete: 'Sil', error: 'Hata oluştu.', totalHours: 'Toplam: {hours} saat' },
    calendar: { deleteConfirm: 'Silmek istiyor musunuz?', unknownJob: 'Bilinmeyen İş', noEntries: 'Giriş yok.' },
    dashboard: { title: 'Panel', filters: { period: 'Dönem', job: 'İş', date: 'Tarih' }, periodOptions: { day: 'Gün', week: 'Hafta', month: 'Ay', year: 'Yıl' }, allJobs: 'Tüm İşler', stats: { totalHours: 'Toplam Saat', totalDays: 'Çalışılan Gün', totalEarnings: 'Toplam Kazanç' }, chart: { title: 'İşe göre saatler', hoursLabel: 'Saat' } },
    settings: { jobs: { title: 'İşleri Yönet', schedule: 'Program', rateDisplay: '{amount} / saat', addTitle: 'Yeni İş Ekle', nameLabel: 'İş Adı', rateLabel: 'Saatlik Ücret', currencyLabel: 'Para Birimi', addButton: 'Ekle' }, notifications: { title: 'Bildirimler', reminderLabel: 'Günlük Hatırlatıcı', reminderNote: '{time} için ayarlandı.', permissionDenied: 'Engellendi.', notSupported: 'Desteklenmiyor.', updateError: 'Hata.' }, language: { title: 'Dil', label: 'Uygulama Dili' }, theme: { toggle: 'Temayı Değiştir', switchToDark: 'Koyu Mod', switchToLight: 'Açık Mod', dark: 'Koyu', light: 'Açık' } },
    entryModal: { ai: { title: 'AI ile Akıllı Giriş', examples: 'Ör: "Dün 9-17 arası İş 1\'de çalıştım"', placeholder: 'Çalışmanı anlat...', parse: 'Ayrıştır', parsing: 'Ayrıştırılıyor...', jobNotFound: 'İş bulunamadı', unrecognized: 'Anlaşılamadı' }, header: '{date} için {title}', addTitle: 'Ekle', editTitle: 'Düzenle', job: 'İş', entryType: 'Tür', types: { timeRange: 'Zaman Aralığı', duration: 'Süre', status: 'Durum' }, startTime: 'Başlangıç', endTime: 'Bitiş', duration: 'Süre (saat)', status: 'Durum', selectJob: 'İş seç', selectJobError: 'Bir iş seçin', addButton: 'Ekle', saveButton: 'Kaydet' },
    statuses: { worked: 'Çalışıldı', off: 'İzin', holiday: 'Tatil', sick: 'Hastalık' },
    auth: { loading: 'Giriş yapılıyor...', title: 'Hoşgeldiniz', subtitleSignIn: 'Giriş yap', subtitleSignUp: 'Kayıt ol', emailLabel: 'E-posta', passwordLabel: 'Şifre', submitting: 'Bekleyin...', signIn: 'Giriş Yap', signUp: 'Kayıt Ol', switchToSignUp: 'Hesabın yok mu?', switchToSignIn: 'Hesabın var mı?', signOut: 'Çıkış Yap', checkEmail: 'E-postanı kontrol et', heroEyebrow: 'İş Saati Takibi', heroHeadline: 'Zamanını Yönet', heroSubheadline: 'Saatleri ve kazancı takip et', heroCta: 'Ücretsiz Hesap',
      whatTitle: 'İlk günden elde edecekleriniz',
      what: {
        planner: {
          title: 'Görsel vardiya planlayıcısı',
          description: 'Tüm işleri aynı anda gösteren takvimle zamanınızın nereye gittiğini bilirsiniz.'
        },
        capture: {
          title: 'Sürtünmesiz kayıt',
          description: 'Dokunun, sürükleyin veya doğal dilde yazın; yapay zekâ bunu yapılandırılmış kayıtlara dönüştürür.'
        },
        earnings: {
          title: 'Otomatik kazanç hesabı',
          description: 'Saatlik ücretler, para birimleri ve mesailer her iş için anında toplanır.'
        },
        export: {
          title: 'Excel’e aktarım',
          description: 'Excel’e işi bazında veya toplu halde kolayca aktarın; birden fazla seçenek vardır.'
        },
      },
      features: { tracking: { title: 'Hızlı Takip', description: 'Saniyeler içinde kaydet' }, schedule: { title: 'Akıllı Program', description: 'Haftanı planla' }, sync: { title: 'Bulut Senkronizasyon', description: 'Web, iOS, Android' } }, downloadTitle: 'Mobil Uygulamalar Yakında', downloadSubtitle: 'İndirmek için tara', downloadPlaceholder: 'Önizleme' }
  },
  pl: {
    app: { title: 'Licznik Godzin', addEntryAria: 'Dodaj wpis' },
    nav: { calendar: 'Kalendarz', dashboard: 'Pulpit', settings: 'Ustawienia' },
    common: { cancel: 'Anuluj', save: 'Zapisz', edit: 'Edytuj', add: 'Dodaj', delete: 'Usuń', error: 'Błąd.', totalHours: 'Razem: {hours} godz.' },
    calendar: { deleteConfirm: 'Usunąć ten wpis?', unknownJob: 'Nieznana praca', noEntries: 'Brak wpisów.' },
    dashboard: { title: 'Pulpit', filters: { period: 'Okres', job: 'Praca', date: 'Data' }, periodOptions: { day: 'Dzień', week: 'Tydzień', month: 'Miesiąc', year: 'Rok' }, allJobs: 'Wszystkie', stats: { totalHours: 'Godziny łącznie', totalDays: 'Dni pracy', totalEarnings: 'Zarobki' }, chart: { title: 'Godziny wg pracy', hoursLabel: 'Godziny' } },
    settings: { jobs: { title: 'Zarządzaj pracami', schedule: 'Grafik', rateDisplay: '{amount} / godz.', addTitle: 'Nowa praca', nameLabel: 'Nazwa', rateLabel: 'Stawka', currencyLabel: 'Waluta', addButton: 'Dodaj' }, notifications: { title: 'Powiadomienia', reminderLabel: 'Codzienne przypomnienie', reminderNote: 'Przypomnienie o {time}.', permissionDenied: 'Zablokowane.', notSupported: 'Nieobsługiwane.', updateError: 'Błąd.' }, language: { title: 'Język', label: 'Język aplikacji' }, theme: { toggle: 'Zmień motyw', switchToDark: 'Ciemny', switchToLight: 'Jasny', dark: 'Ciemny', light: 'Jasny' } },
    entryModal: { ai: { title: 'Inteligentne wprowadzanie AI', examples: 'Np: "Praca 1 od 9 do 17"', placeholder: 'Opisz pracę...', parse: 'Analizuj', parsing: 'Analiza...', jobNotFound: 'Nie znaleziono pracy', unrecognized: 'Nie rozpoznano' }, header: '{title} - {date}', addTitle: 'Dodaj', editTitle: 'Edytuj', job: 'Praca', entryType: 'Typ', types: { timeRange: 'Zakres czasu', duration: 'Czas trwania', status: 'Status' }, startTime: 'Start', endTime: 'Koniec', duration: 'Czas (h)', status: 'Status', selectJob: 'Wybierz pracę', selectJobError: 'Wybierz pracę', addButton: 'Dodaj', saveButton: 'Zapisz' },
    statuses: { worked: 'Praca', off: 'Wolne', holiday: 'Urlop', sick: 'Chorobowe' },
    auth: { loading: 'Logowanie...', title: 'Witaj', subtitleSignIn: 'Zaloguj się', subtitleSignUp: 'Zarejestruj się', emailLabel: 'Email', passwordLabel: 'Hasło', submitting: 'Czekaj...', signIn: 'Zaloguj', signUp: 'Rejestracja', switchToSignUp: 'Brak konta?', switchToSignIn: 'Masz konto?', signOut: 'Wyloguj', checkEmail: 'Sprawdź email', heroEyebrow: 'Licznik Godzin', heroHeadline: 'Twoje godziny', heroSubheadline: 'Śledź czas i zarobki', heroCta: 'Darmowe konto',
      whatTitle: 'Co otrzymujesz już pierwszego dnia',
      what: {
        planner: {
          title: 'Wizualny planer zmian',
          description: 'Kalendarz pokazuje wszystkie prace naraz, więc zawsze wiesz, gdzie znika czas.'
        },
        capture: {
          title: 'Bezproblemowe dodawanie',
          description: 'Dotknij, przeciągnij lub wpisz naturalnym językiem, a AI ułoży to w uporządkowane wpisy.'
        },
        earnings: {
          title: 'Automatyczne liczenie zarobków',
          description: 'Stawki godzinowe, waluty i nadgodziny są natychmiast sumowane dla każdego zlecenia.'
        },
        export: {
          title: 'Eksport do Excela',
          description: 'Eksportuj do Excela per praca lub łącznie – dostępnych jest kilka opcji.'
        },
      },
      features: { tracking: { title: 'Szybkie śledzenie', description: 'Zapisuj godziny' }, schedule: { title: 'Grafik', description: 'Planuj tydzień' }, sync: { title: 'Chmura', description: 'Web, iOS, Android' } }, downloadTitle: 'Aplikacje mobilne wkrótce', downloadSubtitle: 'Zeskanuj aby pobrać', downloadPlaceholder: 'Podgląd' }
  },
  nl: {
    app: { title: 'Urenregistratie', addEntryAria: 'Nieuwe invoer' },
    nav: { calendar: 'Kalender', dashboard: 'Dashboard', settings: 'Instellingen' },
    common: { cancel: 'Annuleren', save: 'Opslaan', edit: 'Bewerken', add: 'Toevoegen', delete: 'Verwijderen', error: 'Fout.', totalHours: 'Totaal: {hours} uur' },
    calendar: { deleteConfirm: 'Verwijderen?', unknownJob: 'Onbekend', noEntries: 'Geen invoer.' },
    dashboard: { title: 'Dashboard', filters: { period: 'Periode', job: 'Baan', date: 'Datum' }, periodOptions: { day: 'Dag', week: 'Week', month: 'Maand', year: 'Jaar' }, allJobs: 'Alle banen', stats: { totalHours: 'Totaal uren', totalDays: 'Dagen gewerkt', totalEarnings: 'Totaal inkomsten' }, chart: { title: 'Uren per baan', hoursLabel: 'Uren' } },
    settings: { jobs: { title: 'Banen beheren', schedule: 'Rooster', rateDisplay: '{amount} / uur', addTitle: 'Nieuwe baan', nameLabel: 'Naam', rateLabel: 'Uurtarief', currencyLabel: 'Valuta', addButton: 'Toevoegen' }, notifications: { title: 'Meldingen', reminderLabel: 'Dagelijkse herinnering', reminderNote: 'Herinnering om {time}.', permissionDenied: 'Geblokkeerd.', notSupported: 'Niet ondersteund.', updateError: 'Fout.' }, language: { title: 'Taal', label: 'App taal' }, theme: { toggle: 'Thema wisselen', switchToDark: 'Donker', switchToLight: 'Licht', dark: 'Donker', light: 'Licht' } },
    entryModal: { ai: { title: 'Slimme invoer AI', examples: 'Bijv: "Gewerkt aan Baan 1 van 9 tot 17"', placeholder: 'Beschrijf je werk...', parse: 'Analyseren', parsing: 'Bezig...', jobNotFound: 'Baan niet gevonden', unrecognized: 'Niet herkend' }, header: '{title} op {date}', addTitle: 'Toevoegen', editTitle: 'Bewerken', job: 'Baan', entryType: 'Type', types: { timeRange: 'Tijdsbestek', duration: 'Duur', status: 'Status' }, startTime: 'Start', endTime: 'Eind', duration: 'Duur (u)', status: 'Status', selectJob: 'Kies een baan', selectJobError: 'Kies een baan', addButton: 'Toevoegen', saveButton: 'Opslaan' },
    statuses: { worked: 'Gewerkt', off: 'Vrij', holiday: 'Vakantie', sick: 'Ziek' },
    auth: { loading: 'Inloggen...', title: 'Welkom', subtitleSignIn: 'Log in', subtitleSignUp: 'Registreren', emailLabel: 'Email', passwordLabel: 'Wachtwoord', submitting: 'Wachten...', signIn: 'Inloggen', signUp: 'Registreren', switchToSignUp: 'Geen account?', switchToSignIn: 'Heb je een account?', signOut: 'Uitloggen', checkEmail: 'Check je email', heroEyebrow: 'Urenregistratie', heroHeadline: 'Beheer je tijd', heroSubheadline: 'Volg uren en inkomsten', heroCta: 'Gratis account',
      whatTitle: 'Dit krijg je vanaf dag één',
      what: {
        planner: {
          title: 'Visuele dienstplanner',
          description: 'Een kalender toont alle banen tegelijk zodat je weet waar je tijd naartoe gaat.'
        },
        capture: {
          title: 'Frictieloze invoer',
          description: 'Tik, sleep of typ in gewone taal en laat de AI er gestructureerde invoer van maken.'
        },
        earnings: {
          title: 'Automatische inkomstenberekening',
          description: 'Uurtarieven, valuta en overuren worden direct samengevoegd per baan.'
        },
        export: {
          title: 'Exporteren naar Excel',
          description: 'Exporteer eenvoudig naar Excel per baan of gecombineerd, met meerdere opties.'
        },
      },
      features: { tracking: { title: 'Direct volgen', description: 'Leg uren vast' }, schedule: { title: 'Slim rooster', description: 'Plan je week' }, sync: { title: 'Cloud sync', description: 'Web, iOS, Android' } }, downloadTitle: 'Mobiele apps binnenkort', downloadSubtitle: 'Scan om te downloaden', downloadPlaceholder: 'Voorbeeld' }
  },
  zh: {
    app: { title: '工时追踪', addEntryAria: '添加记录' },
    nav: { calendar: '日历', dashboard: '仪表盘', settings: '设置' },
    common: { cancel: '取消', save: '保存', edit: '编辑', add: '添加', delete: '删除', error: '发生错误。', totalHours: '共 {hours} 小时' },
    calendar: { deleteConfirm: '确认删除？', unknownJob: '未知工作', noEntries: '无记录。' },
    dashboard: { title: '仪表盘', filters: { period: '周期', job: '工作', date: '日期' }, periodOptions: { day: '天', week: '周', month: '月', year: '年' }, allJobs: '所有工作', stats: { totalHours: '总工时', totalDays: '工作天数', totalEarnings: '总收入' }, chart: { title: '工时统计', hoursLabel: '小时' } },
    settings: { jobs: { title: '工作管理', schedule: '排班', rateDisplay: '{amount} / 小时', addTitle: '添加新工作', nameLabel: '名称', rateLabel: '时薪', currencyLabel: '货币', addButton: '添加' }, notifications: { title: '通知', reminderLabel: '每日提醒', reminderNote: '定于 {time} 提醒。', permissionDenied: '通知被阻止。', notSupported: '不支持。', updateError: '更新失败。' }, language: { title: '语言', label: '应用语言' }, theme: { toggle: '切换主题', switchToDark: '深色模式', switchToLight: '浅色模式', dark: '深色', light: '浅色' } },
    entryModal: { ai: { title: 'AI 智能输入', examples: '例如："昨天9点到5点做工作1"', placeholder: '描述工作...', parse: '解析', parsing: '解析中...', jobNotFound: '未找到工作', unrecognized: '无法识别' }, header: '{date} {title}', addTitle: '添加', editTitle: '编辑', job: '工作', entryType: '类型', types: { timeRange: '时间段', duration: '时长', status: '状态' }, startTime: '开始', endTime: '结束', duration: '时长 (小时)', status: '状态', selectJob: '选择工作', selectJobError: '请选择工作', addButton: '添加', saveButton: '保存' },
    statuses: { worked: '工作', off: '休息', holiday: '假期', sick: '病假' },
    auth: { loading: '登录中...', title: '欢迎', subtitleSignIn: '登录', subtitleSignUp: '注册', emailLabel: '邮箱', passwordLabel: '密码', submitting: '请稍候...', signIn: '登录', signUp: '注册', switchToSignUp: '没有账号？', switchToSignIn: '已有账号？', signOut: '退出', checkEmail: '请检查邮箱', heroEyebrow: '工时追踪', heroHeadline: '掌控时间', heroSubheadline: '追踪工时与收入', heroCta: '免费注册',
      whatTitle: '第一天就能拥有的功能',
      what: {
        planner: {
          title: '可视化排班表',
          description: '一个同时展示所有工作的日历，让你随时掌握时间流向。'
        },
        capture: {
          title: '无阻力记录',
          description: '点击、拖拽或输入自然语言，由 AI 自动生成结构化记录。'
        },
        earnings: {
          title: '自动收益计算',
          description: '小时费率、货币与加班即时汇总，按工作清晰呈现。'
        },
        export: {
          title: '导出到 Excel',
          description: '可按单个工作或合并导出至 Excel，提供多种选项。'
        },
      },
      features: { tracking: { title: '即时追踪', description: '快速记录' }, schedule: { title: '智能排班', description: '周计划' }, sync: { title: '云同步', description: 'Web, iOS, Android' } }, downloadTitle: '移动端即将推出', downloadSubtitle: '扫码下载', downloadPlaceholder: '预览' }
  },
  ja: {
    app: { title: '勤務時間トラッカー', addEntryAria: '新規追加' },
    nav: { calendar: 'カレンダー', dashboard: 'ダッシュボード', settings: '設定' },
    common: { cancel: 'キャンセル', save: '保存', edit: '編集', add: '追加', delete: '削除', error: 'エラーが発生しました。', totalHours: '合計: {hours} 時間' },
    calendar: { deleteConfirm: '削除しますか？', unknownJob: '不明な仕事', noEntries: '記録なし' },
    dashboard: { title: 'ダッシュボード', filters: { period: '期間', job: '仕事', date: '日付' }, periodOptions: { day: '日', week: '週', month: '月', year: '年' }, allJobs: '全ての仕事', stats: { totalHours: '総労働時間', totalDays: '労働日数', totalEarnings: '総収入' }, chart: { title: '仕事別時間', hoursLabel: '時間' } },
    settings: { jobs: { title: '仕事管理', schedule: 'スケジュール', rateDisplay: '{amount} / 時間', addTitle: '新規追加', nameLabel: '仕事名', rateLabel: '時給', currencyLabel: '通貨', addButton: '追加' }, notifications: { title: '通知', reminderLabel: 'デイリーリマインダー', reminderNote: '{time} に通知します。', permissionDenied: 'ブロックされています。', notSupported: '非対応です。', updateError: 'エラー。' }, language: { title: '言語', label: 'アプリの言語' }, theme: { toggle: 'テーマ切替', switchToDark: 'ダークモード', switchToLight: 'ライトモード', dark: 'ダーク', light: 'ライト' } },
    entryModal: { ai: { title: 'AIスマート入力', examples: '例：「昨日9時から17時まで仕事1」', placeholder: '内容を入力...', parse: '解析', parsing: '解析中...', jobNotFound: '仕事が見つかりません', unrecognized: '認識できませんでした' }, header: '{date} {title}', addTitle: '追加', editTitle: '編集', job: '仕事', entryType: 'タイプ', types: { timeRange: '時間帯', duration: '時間数', status: 'ステータス' }, startTime: '開始', endTime: '終了', duration: '時間 (h)', status: 'ステータス', selectJob: '仕事を選択', selectJobError: '仕事を選択してください', addButton: '追加', saveButton: '保存' },
    statuses: { worked: '出勤', off: '休み', holiday: '休暇', sick: '病欠' },
    auth: { loading: 'ログイン中...', title: 'ようこそ', subtitleSignIn: 'ログイン', subtitleSignUp: '登録', emailLabel: 'メール', passwordLabel: 'パスワード', submitting: 'お待ちください...', signIn: 'ログイン', signUp: '登録', switchToSignUp: 'アカウントがない場合', switchToSignIn: 'アカウントがある場合', signOut: 'ログアウト', checkEmail: 'メールを確認してください', heroEyebrow: '勤務時間トラッカー', heroHeadline: '時間を管理', heroSubheadline: '時間と収入を記録', heroCta: '無料登録',
      whatTitle: '初日から手に入るもの',
      what: {
        planner: {
          title: 'ビジュアルシフトプランナー',
          description: 'すべての仕事を一目で確認でき、時間の使い道がすぐ分かります。'
        },
        capture: {
          title: 'ストレスのない入力',
          description: 'タップ・ドラッグ・自然文入力をAIが構造化された記録に変換します。'
        },
        earnings: {
          title: '自動収益計算',
          description: '時給・通貨・残業が仕事ごとに即座に集計されます。'
        },
        export: {
          title: 'Excel へエクスポート',
          description: '仕事別またはまとめて簡単にExcelに出力でき、複数のオプションがあります。'
        },
      },
      features: { tracking: { title: '即時記録', description: '素早く記録' }, schedule: { title: 'スマート予定', description: '週間予定' }, sync: { title: 'クラウド同期', description: 'Web, iOS, Android' } }, downloadTitle: 'モバイルアプリ近日公開', downloadSubtitle: 'スキャンしてダウンロード', downloadPlaceholder: 'プレビュー' }
  },
  ko: {
    app: { title: '근무 시간 트래커', addEntryAria: '새 항목 추가' },
    nav: { calendar: '캘린더', dashboard: '대시보드', settings: '설정' },
    common: { cancel: '취소', save: '저장', edit: '편집', add: '추가', delete: '삭제', error: '오류 발생.', totalHours: '총 {hours} 시간' },
    calendar: { deleteConfirm: '삭제하시겠습니까?', unknownJob: '알 수 없는 직업', noEntries: '기록 없음.' },
    dashboard: { title: '대시보드', filters: { period: '기간', job: '직업', date: '날짜' }, periodOptions: { day: '일', week: '주', month: '월', year: '년' }, allJobs: '모든 직업', stats: { totalHours: '총 근무 시간', totalDays: '근무 일수', totalEarnings: '총 수입' }, chart: { title: '직업별 시간', hoursLabel: '시간' } },
    settings: { jobs: { title: '직업 관리', schedule: '일정', rateDisplay: '{amount} / 시간', addTitle: '새 직업 추가', nameLabel: '이름', rateLabel: '시급', currencyLabel: '통화', addButton: '추가' }, notifications: { title: '알림', reminderLabel: '일일 알림', reminderNote: '{time}에 알림.', permissionDenied: '차단됨.', notSupported: '지원되지 않음.', updateError: '오류.' }, language: { title: '언어', label: '앱 언어' }, theme: { toggle: '테마 전환', switchToDark: '다크 모드', switchToLight: '라이트 모드', dark: '다크', light: '라이트' } },
    entryModal: { ai: { title: 'AI 스마트 입력', examples: '예: "어제 9시부터 5시까지 직업1"', placeholder: '작업 설명...', parse: '분석', parsing: '분석 중...', jobNotFound: '직업을 찾을 수 없음', unrecognized: '인식 불가' }, header: '{date} {title}', addTitle: '추가', editTitle: '편집', job: '직업', entryType: '유형', types: { timeRange: '시간 범위', duration: '시간', status: '상태' }, startTime: '시작', endTime: '종료', duration: '시간 (h)', status: '상태', selectJob: '직업 선택', selectJobError: '직업을 선택하세요', addButton: '추가', saveButton: '저장' },
    statuses: { worked: '근무', off: '휴무', holiday: '휴가', sick: '병가' },
    auth: { loading: '로그인 중...', title: '환영합니다', subtitleSignIn: '로그인', subtitleSignUp: '가입', emailLabel: '이메일', passwordLabel: '비밀번호', submitting: '잠시만요...', signIn: '로그인', signUp: '가입', switchToSignUp: '계정이 없나요?', switchToSignIn: '계정이 있나요?', signOut: '로그아웃', checkEmail: '이메일을 확인하세요', heroEyebrow: '근무 시간 트래커', heroHeadline: '시간 관리', heroSubheadline: '시간과 수입 추적', heroCta: '무료 가입',
      whatTitle: '첫날부터 누리는 기능',
      what: {
        planner: {
          title: '시각적 근무 일정표',
          description: '모든 일을 한눈에 보여 주어 시간이 어디에 쓰였는지 바로 파악합니다.'
        },
        capture: {
          title: '마찰 없는 기록',
          description: '탭하거나 드래그하고 자연어로 입력하면 AI가 구조화된 항목으로 바꿔 줍니다.'
        },
        earnings: {
          title: '자동 수익 계산',
          description: '시급, 통화, 초과근무가 작업별로 즉시 합산됩니다.'
        },
        export: {
          title: 'Excel로 내보내기',
          description: '작업별 또는 통합해 손쉽게 Excel로 내보낼 수 있으며 여러 옵션을 제공합니다.'
        },
      },
      features: { tracking: { title: '즉시 추적', description: '빠른 기록' }, schedule: { title: '스마트 일정', description: '주간 계획' }, sync: { title: '클라우드 동기화', description: 'Web, iOS, Android' } }, downloadTitle: '모바일 앱 출시 예정', downloadSubtitle: '스캔하여 다운로드', downloadPlaceholder: '미리보기' }
  },
  hi: {
    app: { title: 'काम के घंटे ट्रैकर', addEntryAria: 'नई प्रविष्टि जोड़ें' },
    nav: { calendar: 'कैलेंडर', dashboard: 'डैशबोर्ड', settings: 'सेटिंग्स' },
    common: { cancel: 'रद्द करें', save: 'सहेजें', edit: 'संपादित करें', add: 'जोड़ें', delete: 'हटाएं', error: 'त्रुटि हुई।', totalHours: 'कुल: {hours} घंटे' },
    calendar: { deleteConfirm: 'क्या आप इसे हटाना चाहते हैं?', unknownJob: 'अज्ञात कार्य', noEntries: 'कोई प्रविष्टि नहीं।' },
    dashboard: { title: 'डैशबोर्ड', filters: { period: 'अवधि', job: 'कार्य', date: 'दिनांक' }, periodOptions: { day: 'दिन', week: 'सप्ताह', month: 'महीना', year: 'वर्ष' }, allJobs: 'सभी कार्य', stats: { totalHours: 'कुल घंटे', totalDays: 'कार्य दिवस', totalEarnings: 'कुल कमाई' }, chart: { title: 'कार्य के अनुसार घंटे', hoursLabel: 'घंटे' } },
    settings: { jobs: { title: 'कार्य प्रबंधित करें', schedule: 'अनुसूची', rateDisplay: '{amount} / घंटा', addTitle: 'नया कार्य जोड़ें', nameLabel: 'नाम', rateLabel: 'दर', currencyLabel: 'मुद्रा', addButton: 'जोड़ें' }, notifications: { title: 'सूचनाएं', reminderLabel: 'दैनिक अनुस्मारक', reminderNote: '{time} पर अनुस्मारक।', permissionDenied: 'अवरुद्ध।', notSupported: 'समर्थित नहीं।', updateError: 'त्रुटि।' }, language: { title: 'भाषा', label: 'ऐप भाषा' }, theme: { toggle: 'थीम बदलें', switchToDark: 'डार्क मोड', switchToLight: 'लाइट मोड', dark: 'डार्क', light: 'लाइट' } },
    entryModal: { ai: { title: 'AI स्मार्ट एंट्री', examples: 'उदा: "कल 9 से 5 तक कार्य 1"', placeholder: 'कार्य का वर्णन करें...', parse: 'पार्स', parsing: 'पार्सिंग...', jobNotFound: 'कार्य नहीं मिला', unrecognized: 'पहचाना नहीं गया' }, header: '{date} के लिए {title}', addTitle: 'जोड़ें', editTitle: 'संपादित करें', job: 'कार्य', entryType: 'प्रकार', types: { timeRange: 'समय सीमा', duration: 'अवधि', status: 'स्थिति' }, startTime: 'प्रारंभ', endTime: 'समाप्त', duration: 'अवधि (घंटे)', status: 'स्थिति', selectJob: 'कार्य चुनें', selectJobError: 'कार्य चुनें', addButton: 'जोड़ें', saveButton: 'सहेजें' },
    statuses: { worked: 'कार्य किया', off: 'छुट्टी', holiday: 'अवकाश', sick: 'बीमारी' },
    auth: { loading: 'लॉगिन हो रहा है...', title: 'स्वागत है', subtitleSignIn: 'साइन इन करें', subtitleSignUp: 'साइन अप करें', emailLabel: 'ईमेल', passwordLabel: 'पासवर्ड', submitting: 'प्रतीक्षा करें...', signIn: 'साइन इन', signUp: 'साइन अप', switchToSignUp: 'खाता नहीं है?', switchToSignIn: 'खाता है?', signOut: 'साइन आउट', checkEmail: 'ईमेल जांचें', heroEyebrow: 'काम के घंटे ट्रैकर', heroHeadline: 'समय प्रबंधित करें', heroSubheadline: 'घंटे और कमाई ट्रैक करें', heroCta: 'मुफ्त खाता',
      whatTitle: 'पहले ही दिन आपको क्या मिलता है',
      what: {
        planner: {
          title: 'दृश्य शिफ्ट प्लानर',
          description: 'एक कैलेंडर सभी काम एक साथ दिखाता है ताकि आप जान सकें समय कहाँ जा रहा है।'
        },
        capture: {
          title: 'बिना रुकावट प्रविष्टि',
          description: 'टैप करें, ड्रैग करें या सामान्य भाषा में लिखें और AI उसे संरचित प्रविष्टियों में बदल दे।'
        },
        earnings: {
          title: 'स्वचालित कमाई गणना',
          description: 'घंटेवार दरें, मुद्राएँ और ओवरटाइम हर काम के लिए तुरंत जोड़े जाते हैं।'
        },
        export: {
          title: 'Excel में निर्यात',
          description: 'प्रत्येक काम या संयुक्त रूप से आसानी से Excel में निर्यात करें; कई विकल्प उपलब्ध हैं।'
        },
      },
      features: { tracking: { title: 'त्वरित ट्रैकिंग', description: 'तेजी से लॉग करें' }, schedule: { title: 'स्मार्ट अनुसूची', description: 'सप्ताह की योजना बनाएं' }, sync: { title: 'क्लाउड सिंक', description: 'Web, iOS, Android' } }, downloadTitle: 'मोबाइल ऐप्स जल्द आ रहे हैं', downloadSubtitle: 'डाउनलोड करने के लिए स्कैन करें', downloadPlaceholder: 'पूर्वावलोकन' }
  },
  th: {
    app: { title: 'ตัวติดตามชั่วโมงทำงาน', addEntryAria: 'เพิ่มรายการใหม่' },
    nav: { calendar: 'ปฏิทิน', dashboard: 'แดชบอร์ด', settings: 'การตั้งค่า' },
    common: { cancel: 'ยกเลิก', save: 'บันทึก', edit: 'แก้ไข', add: 'เพิ่ม', delete: 'ลบ', error: 'เกิดข้อผิดพลาด', totalHours: 'รวม: {hours} ชั่วโมง' },
    calendar: { deleteConfirm: 'ลบรายการนี้หรือไม่?', unknownJob: 'งานที่ไม่รู้จัก', noEntries: 'ไม่มีรายการ' },
    dashboard: { title: 'แดชบอร์ด', filters: { period: 'ช่วงเวลา', job: 'งาน', date: 'วันที่' }, periodOptions: { day: 'วัน', week: 'สัปดาห์', month: 'เดือน', year: 'ปี' }, allJobs: 'งานทั้งหมด', stats: { totalHours: 'ชั่วโมงรวม', totalDays: 'วันที่ทำงาน', totalEarnings: 'รายได้รวม' }, chart: { title: 'ชั่วโมงต่องาน', hoursLabel: 'ชั่วโมง' } },
    settings: { jobs: { title: 'จัดการงาน', schedule: 'ตารางงาน', rateDisplay: '{amount} / ชั่วโมง', addTitle: 'เพิ่มงานใหม่', nameLabel: 'ชื่อ', rateLabel: 'อัตรา', currencyLabel: 'สกุลเงิน', addButton: 'เพิ่ม' }, notifications: { title: 'การแจ้งเตือน', reminderLabel: 'เตือนความจำรายวัน', reminderNote: 'เตือนเวลา {time}', permissionDenied: 'ถูกบล็อก', notSupported: 'ไม่รองรับ', updateError: 'ข้อผิดพลาด' }, language: { title: 'ภาษา', label: 'ภาษาแอป' }, theme: { toggle: 'เปลี่ยนธีม', switchToDark: 'โหมดมืด', switchToLight: 'โหมดสว่าง', dark: 'มืด', light: 'สว่าง' } },
    entryModal: { ai: { title: 'การป้อนข้อมูลอัจฉริยะ AI', examples: 'ตัวอย่าง: "ทำงาน 1 เมื่อวาน 9 โมงถึง 5 โมงเย็น"', placeholder: 'อธิบายงาน...', parse: 'วิเคราะห์', parsing: 'กำลังวิเคราะห์...', jobNotFound: 'ไม่พบงาน', unrecognized: 'ไม่รู้จัก' }, header: '{title} สำหรับ {date}', addTitle: 'เพิ่ม', editTitle: 'แก้ไข', job: 'งาน', entryType: 'ประเภท', types: { timeRange: 'ช่วงเวลา', duration: 'ระยะเวลา', status: 'สถานะ' }, startTime: 'เริ่ม', endTime: 'สิ้นสุด', duration: 'ระยะเวลา (ชม.)', status: 'สถานะ', selectJob: 'เลือกงาน', selectJobError: 'เลือกงาน', addButton: 'เพิ่ม', saveButton: 'บันทึก' },
    statuses: { worked: 'ทำงาน', off: 'หยุด', holiday: 'วันหยุด', sick: 'ป่วย' },
    auth: { loading: 'กำลังเข้าสู่ระบบ...', title: 'ยินดีต้อนรับ', subtitleSignIn: 'เข้าสู่ระบบ', subtitleSignUp: 'ลงทะเบียน', emailLabel: 'อีเมล', passwordLabel: 'รหัสผ่าน', submitting: 'กรุณารอ...', signIn: 'เข้าสู่ระบบ', signUp: 'ลงทะเบียน', switchToSignUp: 'ไม่มีบัญชี?', switchToSignIn: 'มีบัญชีแล้ว?', signOut: 'ออกจากระบบ', checkEmail: 'ตรวจสอบอีเมล', heroEyebrow: 'ตัวติดตามชั่วโมงทำงาน', heroHeadline: 'จัดการเวลาของคุณ', heroSubheadline: 'ติดตามชั่วโมงและรายได้', heroCta: 'บัญชีฟรี',
      whatTitle: 'สิ่งที่คุณได้ตั้งแต่วันแรก',
      what: {
        planner: {
          title: 'ตัววางแผนกะงานแบบเห็นภาพ',
          description: 'ปฏิทินแสดงทุกงานพร้อมกันเพื่อให้คุณรู้ว่าเวลาถูกใช้ไปกับอะไรเสมอ.'
        },
        capture: {
          title: 'บันทึกแบบไร้แรงเสียดทาน',
          description: 'แตะ ลาก หรือพิมพ์ภาษาธรรมชาติแล้วให้ AI แปลงเป็นรายการที่มีโครงสร้าง.'
        },
        earnings: {
          title: 'คำนวณรายได้อัตโนมัติ',
          description: 'อัตรารายชั่วโมง สกุลเงิน และโอทีถูกสรุปทันทีแยกตามงาน.'
        },
        export: {
          title: 'ส่งออกเป็น Excel',
          description: 'ส่งออกเป็น Excel ได้ง่าย ทั้งรายงานเป็นงานหรือรวมกัน พร้อมหลายตัวเลือก.'
        },
      },
      features: { tracking: { title: 'ติดตามทันที', description: 'บันทึกรวดเร็ว' }, schedule: { title: 'ตารางงานอัจฉริยะ', description: 'วางแผนสัปดาห์' }, sync: { title: 'ซิงค์คลาวด์', description: 'Web, iOS, Android' } }, downloadTitle: 'แอปมือถือเร็วๆ นี้', downloadSubtitle: 'สแกนเพื่อดาวน์โหลด', downloadPlaceholder: 'ตัวอย่าง' }
  },
  id: {
    app: { title: 'Pelacak Jam Kerja', addEntryAria: 'Tambah entri baru' },
    nav: { calendar: 'Kalender', dashboard: 'Dasbor', settings: 'Pengaturan' },
    common: { cancel: 'Batal', save: 'Simpan', edit: 'Ubah', add: 'Tambah', delete: 'Hapus', error: 'Terjadi kesalahan.', totalHours: 'Total: {hours} jam' },
    calendar: { deleteConfirm: 'Hapus entri ini?', unknownJob: 'Pekerjaan Tak Dikenal', noEntries: 'Tidak ada entri.' },
    dashboard: { title: 'Dasbor', filters: { period: 'Periode', job: 'Pekerjaan', date: 'Tanggal' }, periodOptions: { day: 'Hari', week: 'Minggu', month: 'Bulan', year: 'Tahun' }, allJobs: 'Semua Pekerjaan', stats: { totalHours: 'Total Jam', totalDays: 'Hari Kerja', totalEarnings: 'Total Pendapatan' }, chart: { title: 'Jam per Pekerjaan', hoursLabel: 'Jam' } },
    settings: { jobs: { title: 'Kelola Pekerjaan', schedule: 'Jadwal', rateDisplay: '{amount} / jam', addTitle: 'Tambah Pekerjaan Baru', nameLabel: 'Nama', rateLabel: 'Tarif', currencyLabel: 'Mata Uang', addButton: 'Tambah' }, notifications: { title: 'Notifikasi', reminderLabel: 'Pengingat Harian', reminderNote: 'Pengingat pada {time}.', permissionDenied: 'Diblokir.', notSupported: 'Tidak didukung.', updateError: 'Kesalahan.' }, language: { title: 'Bahasa', label: 'Bahasa Aplikasi' }, theme: { toggle: 'Ganti Tema', switchToDark: 'Mode Gelap', switchToLight: 'Mode Terang', dark: 'Gelap', light: 'Terang' } },
    entryModal: { ai: { title: 'Input Cerdas AI', examples: 'Cth: "Kerja di Job 1 dari jam 9 sampai 5 kemarin"', placeholder: 'Jelaskan pekerjaan...', parse: 'Urai', parsing: 'Mengurai...', jobNotFound: 'Pekerjaan tidak ditemukan', unrecognized: 'Tidak dikenali' }, header: '{title} untuk {date}', addTitle: 'Tambah', editTitle: 'Ubah', job: 'Pekerjaan', entryType: 'Tipe', types: { timeRange: 'Rentang Waktu', duration: 'Durasi', status: 'Status' }, startTime: 'Mulai', endTime: 'Selesai', duration: 'Durasi (jam)', status: 'Status', selectJob: 'Pilih pekerjaan', selectJobError: 'Pilih pekerjaan', addButton: 'Tambah', saveButton: 'Simpan' },
    statuses: { worked: 'Kerja', off: 'Libur', holiday: 'Cuti', sick: 'Sakit' },
    auth: { loading: 'Masuk...', title: 'Selamat Datang', subtitleSignIn: 'Masuk', subtitleSignUp: 'Daftar', emailLabel: 'Email', passwordLabel: 'Kata Sandi', submitting: 'Tunggu...', signIn: 'Masuk', signUp: 'Daftar', switchToSignUp: 'Belum punya akun?', switchToSignIn: 'Sudah punya akun?', signOut: 'Keluar', checkEmail: 'Periksa email', heroEyebrow: 'Pelacak Jam Kerja', heroHeadline: 'Kuasai Waktumu', heroSubheadline: 'Lacak jam dan pendapatan', heroCta: 'Akun Gratis',
      whatTitle: 'Yang kamu dapat sejak hari pertama',
      what: {
        planner: {
          title: 'Perencana shift visual',
          description: 'Kalender menampilkan semua pekerjaan sekaligus agar kamu tahu ke mana waktu terpakai.'
        },
        capture: {
          title: 'Pencatatan tanpa hambatan',
          description: 'Ketuk, seret, atau ketik dengan bahasa alami dan biarkan AI membuat entri terstruktur.'
        },
        earnings: {
          title: 'Perhitungan pendapatan otomatis',
          description: 'Tarif per jam, mata uang, dan lembur dijumlahkan seketika untuk tiap pekerjaan.'
        },
        export: {
          title: 'Ekspor ke Excel',
          description: 'Mudah ekspor ke Excel per pekerjaan atau gabungan dengan banyak opsi.'
        },
      },
      features: { tracking: { title: 'Pelacakan Instan', description: 'Catat cepat' }, schedule: { title: 'Jadwal Cerdas', description: 'Rencanakan minggu' }, sync: { title: 'Sinkronisasi Cloud', description: 'Web, iOS, Android' } }, downloadTitle: 'Aplikasi Seluler Segera', downloadSubtitle: 'Pindai untuk unduh', downloadPlaceholder: 'Pratinjau' }
  },
  ar: {
    app: { title: 'متتبع ساعات العمل', addEntryAria: 'إضافة إدخال جديد' },
    nav: { calendar: 'التقويم', dashboard: 'لوحة التحكم', settings: 'الإعدادات' },
    common: { cancel: 'إلغاء', save: 'حفظ', edit: 'تعديل', add: 'إضافة', delete: 'حذف', error: 'حدث خطأ.', totalHours: 'الإجمالي: {hours} ساعة' },
    calendar: { deleteConfirm: 'حذف هذا الإدخال؟', unknownJob: 'وظيفة غير معروفة', noEntries: 'لا توجد إدخالات.' },
    dashboard: { title: 'لوحة التحكم', filters: { period: 'الفترة', job: 'الوظيفة', date: 'التاريخ' }, periodOptions: { day: 'يوم', week: 'أسبوع', month: 'شهر', year: 'سنة' }, allJobs: 'كل الوظائف', stats: { totalHours: 'إجمالي الساعات', totalDays: 'أيام العمل', totalEarnings: 'إجمالي الأرباح' }, chart: { title: 'الساعات لكل وظيفة', hoursLabel: 'ساعات' } },
    settings: { jobs: { title: 'إدارة الوظائف', schedule: 'الجدول', rateDisplay: '{amount} / ساعة', addTitle: 'إضافة وظيفة جديدة', nameLabel: 'الاسم', rateLabel: 'المعدل', currencyLabel: 'العملة', addButton: 'إضافة' }, notifications: { title: 'الإشعارات', reminderLabel: 'تذكير يومي', reminderNote: 'تذكير في {time}.', permissionDenied: 'محظور.', notSupported: 'غير مدعوم.', updateError: 'خطأ.' }, language: { title: 'اللغة', label: 'لغة التطبيق' }, theme: { toggle: 'تغيير السمة', switchToDark: 'الوضع الداكن', switchToLight: 'الوضع الفاتح', dark: 'داكن', light: 'فاتح' } },
    entryModal: { ai: { title: 'إدخال ذكي بالذكاء الاصطناعي', examples: 'مثال: "عملت في وظيفة 1 من 9 إلى 5 أمس"', placeholder: 'صف عملك...', parse: 'تحليل', parsing: 'جاري التحليل...', jobNotFound: 'الوظيفة غير موجودة', unrecognized: 'لم يتم التعرف عليه' }, header: '{title} لـ {date}', addTitle: 'إضافة', editTitle: 'تعديل', job: 'الوظيفة', entryType: 'النوع', types: { timeRange: 'نطاق زمني', duration: 'مدة', status: 'حالة' }, startTime: 'البدء', endTime: 'الانتهاء', duration: 'المدة (ساعة)', status: 'الحالة', selectJob: 'اختر وظيفة', selectJobError: 'اختر وظيفة', addButton: 'إضافة', saveButton: 'حفظ' },
    statuses: { worked: 'عمل', off: 'عطلة', holiday: 'إجازة', sick: 'مرضي' },
    auth: { loading: 'جاري الدخول...', title: 'مرحباً', subtitleSignIn: 'دخول', subtitleSignUp: 'تسجيل', emailLabel: 'البريد', passwordLabel: 'كلمة المرور', submitting: 'انتظر...', signIn: 'دخول', signUp: 'تسجيل', switchToSignUp: 'لا يوجد حساب؟', switchToSignIn: 'لديك حساب؟', signOut: 'خروج', checkEmail: 'افحص بريدك', heroEyebrow: 'متتبع ساعات العمل', heroHeadline: 'تحكم في وقتك', heroSubheadline: 'تتبع الساعات والأرباح', heroCta: 'حساب مجاني',
      whatTitle: 'ما الذي تحصل عليه من اليوم الأول',
      what: {
        planner: {
          title: 'مخطط مناوبات مرئي',
          description: 'تقويم يعرض جميع الوظائف في آن واحد لتعرف دائماً أين يذهب وقتك.'
        },
        capture: {
          title: 'إدخال بلا احتكاك',
          description: 'انقر أو اسحب أو اكتب بلغة طبيعية ودع الذكاء الاصطناعي يحولها إلى سجلات منظمة.'
        },
        earnings: {
          title: 'حساب الأرباح تلقائياً',
          description: 'يتم جمع الأجرة بالساعة والعملات وساعات العمل الإضافية فوراً لكل وظيفة.'
        },
        export: {
          title: 'تصدير إلى Excel',
          description: 'صدّر بسهولة إلى Excel لكل وظيفة أو بشكل مجمع مع عدة خيارات متاحة.'
        },
      },
      features: { tracking: { title: 'تتبع فوري', description: 'سجل بسرعة' }, schedule: { title: 'جدول ذكي', description: 'خطط لأسبوعك' }, sync: { title: 'مزامنة سحابية', description: 'ويب، iOS، أندرويد' } }, downloadTitle: 'تطبيقات الجوال قريباً', downloadSubtitle: 'امسح للتنزيل', downloadPlaceholder: 'معاينة' }
  },
  sv: {
    app: { title: 'Arbetstidsspårare', addEntryAria: 'Lägg till post' },
    nav: { calendar: 'Kalender', dashboard: 'Översikt', settings: 'Inställningar' },
    common: { cancel: 'Avbryt', save: 'Spara', edit: 'Redigera', add: 'Lägg till', delete: 'Ta bort', error: 'Ett fel uppstod.', totalHours: 'Totalt: {hours} timmar' },
    calendar: { deleteConfirm: 'Ta bort denna post?', unknownJob: 'Okänt jobb', noEntries: 'Inga poster.' },
    dashboard: { title: 'Översikt', filters: { period: 'Period', job: 'Jobb', date: 'Datum' }, periodOptions: { day: 'Dag', week: 'Vecka', month: 'Månad', year: 'År' }, allJobs: 'Alla jobb', stats: { totalHours: 'Totala timmar', totalDays: 'Arbetsdagar', totalEarnings: 'Total inkomst' }, chart: { title: 'Timmar per jobb', hoursLabel: 'Timmar' } },
    settings: { jobs: { title: 'Hantera jobb', schedule: 'Schema', rateDisplay: '{amount} / timme', addTitle: 'Nytt jobb', nameLabel: 'Namn', rateLabel: 'Timlön', currencyLabel: 'Valuta', addButton: 'Lägg till' }, notifications: { title: 'Aviseringar', reminderLabel: 'Daglig påminnelse', reminderNote: 'Påminnelse kl {time}.', permissionDenied: 'Blockerad.', notSupported: 'Stöds ej.', updateError: 'Fel.' }, language: { title: 'Språk', label: 'Appspråk' }, theme: { toggle: 'Växla tema', switchToDark: 'Mörkt läge', switchToLight: 'Ljust läge', dark: 'Mörkt', light: 'Ljust' } },
    entryModal: { ai: { title: 'Smart inmatning (AI)', examples: 'T.ex: "Jobbade på Jobb 1 från 9 till 17 igår"', placeholder: 'Beskriv arbetet...', parse: 'Analysera', parsing: 'Analyserar...', jobNotFound: 'Jobb hittades inte', unrecognized: 'Okänt' }, header: '{title} för {date}', addTitle: 'Lägg till', editTitle: 'Redigera', job: 'Jobb', entryType: 'Typ', types: { timeRange: 'Tidsintervall', duration: 'Varaktighet', status: 'Status' }, startTime: 'Start', endTime: 'Slut', duration: 'Tid (h)', status: 'Status', selectJob: 'Välj jobb', selectJobError: 'Välj ett jobb', addButton: 'Lägg till', saveButton: 'Spara' },
    statuses: { worked: 'Arbetat', off: 'Ledig', holiday: 'Semester', sick: 'Sjuk' },
    auth: { loading: 'Loggar in...', title: 'Välkommen', subtitleSignIn: 'Logga in', subtitleSignUp: 'Registrera', emailLabel: 'E-post', passwordLabel: 'Lösenord', submitting: 'Vänta...', signIn: 'Logga in', signUp: 'Registrera', switchToSignUp: 'Inget konto?', switchToSignIn: 'Har konto?', signOut: 'Logga ut', checkEmail: 'Kolla e-post', heroEyebrow: 'Arbetstidsspårare', heroHeadline: 'Äg din tid', heroSubheadline: 'Spåra timmar och inkomst', heroCta: 'Gratis konto',
      whatTitle: 'Det här får du redan dag ett',
      what: {
        planner: {
          title: 'Visuell skiftsplanerare',
          description: 'En kalender visar alla jobb samtidigt så att du vet vart tiden tar vägen.'
        },
        capture: {
          title: 'Friktionsfri registrering',
          description: 'Tryck, dra eller skriv på naturligt språk och låt AI göra strukturerade poster.'
        },
        earnings: {
          title: 'Automatisk intäktsberäkning',
          description: 'Timpriser, valutor och övertid summeras direkt per jobb.'
        },
        export: {
          title: 'Exportera till Excel',
          description: 'Exportera enkelt till Excel per jobb eller samlat, med flera alternativ.'
        },
      },
      features: { tracking: { title: 'Direkt spårning', description: 'Logga snabbt' }, schedule: { title: 'Smart schema', description: 'Planera veckan' }, sync: { title: 'Molnsynk', description: 'Webb, iOS, Android' } }, downloadTitle: 'Mobilappar snart', downloadSubtitle: 'Skanna för att ladda ner', downloadPlaceholder: 'Förhandsvisning' }
  },
  fi: {
    app: { title: 'Työajanseuranta', addEntryAria: 'Lisää merkintä' },
    nav: { calendar: 'Kalenteri', dashboard: 'Kojelauta', settings: 'Asetukset' },
    common: { cancel: 'Peruuta', save: 'Tallenna', edit: 'Muokkaa', add: 'Lisää', delete: 'Poista', error: 'Virhe.', totalHours: 'Yhteensä: {hours} tuntia' },
    calendar: { deleteConfirm: 'Poista tämä merkintä?', unknownJob: 'Tuntematon työ', noEntries: 'Ei merkintöjä.' },
    dashboard: { title: 'Kojelauta', filters: { period: 'Jakso', job: 'Työ', date: 'Päivämäärä' }, periodOptions: { day: 'Päivä', week: 'Viikko', month: 'Kuukausi', year: 'Vuosi' }, allJobs: 'Kaikki työt', stats: { totalHours: 'Tunnit yhteensä', totalDays: 'Työpäivät', totalEarnings: 'Ansio yhteensä' }, chart: { title: 'Tunnit töittäin', hoursLabel: 'Tunnit' } },
    settings: { jobs: { title: 'Hallitse töitä', schedule: 'Aikataulu', rateDisplay: '{amount} / tunti', addTitle: 'Uusi työ', nameLabel: 'Nimi', rateLabel: 'Tuntipalkka', currencyLabel: 'Valuutta', addButton: 'Lisää' }, notifications: { title: 'Ilmoitukset', reminderLabel: 'Päivittäinen muistutus', reminderNote: 'Muistutus klo {time}.', permissionDenied: 'Estetty.', notSupported: 'Ei tuettu.', updateError: 'Virhe.' }, language: { title: 'Kieli', label: 'Sovelluksen kieli' }, theme: { toggle: 'Vaihda teemaa', switchToDark: 'Tumma tila', switchToLight: 'Vaalea tila', dark: 'Tumma', light: 'Vaalea' } },
    entryModal: { ai: { title: 'Älykäs syöttö (AI)', examples: 'Esim: "Työskentelin työssä 1 klo 9-17 eilen"', placeholder: 'Kuvaile työtä...', parse: 'Jäsennä', parsing: 'Jäsennetään...', jobNotFound: 'Työtä ei löytynyt', unrecognized: 'Ei tunnistettu' }, header: '{title} {date}', addTitle: 'Lisää', editTitle: 'Muokkaa', job: 'Työ', entryType: 'Tyyppi', types: { timeRange: 'Aikaväli', duration: 'Kesto', status: 'Tila' }, startTime: 'Alku', endTime: 'Loppu', duration: 'Kesto (h)', status: 'Tila', selectJob: 'Valitse työ', selectJobError: 'Valitse työ', addButton: 'Lisää', saveButton: 'Tallenna' },
    statuses: { worked: 'Työssä', off: 'Vapaa', holiday: 'Loma', sick: 'Sairas' },
    auth: { loading: 'Kirjaudutaan...', title: 'Tervetuloa', subtitleSignIn: 'Kirjaudu', subtitleSignUp: 'Rekisteröidy', emailLabel: 'Sähköposti', passwordLabel: 'Salasana', submitting: 'Odota...', signIn: 'Kirjaudu', signUp: 'Rekisteröidy', switchToSignUp: 'Ei tiliä?', switchToSignIn: 'Onko tili?', signOut: 'Kirjaudu ulos', checkEmail: 'Tarkista sähköposti', heroEyebrow: 'Työajanseuranta', heroHeadline: 'Hallitse aikaasi', heroSubheadline: 'Seuraa tunteja ja tuloja', heroCta: 'Ilmainen tili',
      whatTitle: 'Tämän saat käyttöösi heti ensimmäisenä päivänä',
      what: {
        planner: {
          title: 'Visuaalinen vuorosuunnittelija',
          description: 'Kalenteri näyttää kaikki työt kerralla, joten tiedät aina mihin aika kuluu.'
        },
        capture: {
          title: 'Kitkaton kirjaus',
          description: 'Napauta, vedä tai kirjoita luonnollista kieltä ja anna tekoälyn muodostaa rakenteiset merkinnät.'
        },
        earnings: {
          title: 'Automaattinen ansiolaskenta',
          description: 'Tuntihinnat, valuutat ja ylityöt lasketaan hetkessä joka työlle.'
        },
        export: {
          title: 'Vie Exceliin',
          description: 'Vie helposti Exceliin työkohtaisesti tai yhdistettynä – vaihtoehtoja on useita.'
        },
      },
      features: { tracking: { title: 'Välitön seuranta', description: 'Kirjaa nopeasti' }, schedule: { title: 'Älykäs aikataulu', description: 'Suunnittele viikko' }, sync: { title: 'Pilvisynkronointi', description: 'Web, iOS, Android' } }, downloadTitle: 'Mobiilisovellukset pian', downloadSubtitle: 'Skannaa ladataksesi', downloadPlaceholder: 'Esikatselu' }
  },
  da: {
    app: { title: 'Arbejdstidsregistrering', addEntryAria: 'Tilføj post' },
    nav: { calendar: 'Kalender', dashboard: 'Oversigt', settings: 'Indstillinger' },
    common: { cancel: 'Annuller', save: 'Gem', edit: 'Rediger', add: 'Tilføj', delete: 'Slet', error: 'Der opstod en fejl.', totalHours: 'I alt: {hours} timer' },
    calendar: { deleteConfirm: 'Slet denne post?', unknownJob: 'Ukendt job', noEntries: 'Ingen poster.' },
    dashboard: { title: 'Oversigt', filters: { period: 'Periode', job: 'Job', date: 'Dato' }, periodOptions: { day: 'Dag', week: 'Uge', måned: 'Måned', year: 'År' }, allJobs: 'Alle jobs', stats: { totalHours: 'Timer i alt', totalDays: 'Arbejdsdage', totalEarnings: 'Samlet indtjening' }, chart: { title: 'Timer pr. job', hoursLabel: 'Timer' } },
    settings: { jobs: { title: 'Administrer jobs', schedule: 'Skema', rateDisplay: '{amount} / time', addTitle: 'Nyt job', nameLabel: 'Navn', rateLabel: 'Timeløn', currencyLabel: 'Valuta', addButton: 'Tilføj' }, notifications: { title: 'Notifikationer', reminderLabel: 'Daglig påmindelse', reminderNote: 'Påmindelse kl. {time}.', permissionDenied: 'Blokeret.', notSupported: 'Ikke understøttet.', updateError: 'Fejl.' }, language: { title: 'Sprog', label: 'App sprog' }, theme: { toggle: 'Skift tema', switchToDark: 'Mørk tilstand', switchToLight: 'Lys tilstand', dark: 'Mørk', light: 'Lys' } },
    entryModal: { ai: { title: 'Smart input (AI)', examples: 'F.eks.: "Arbejdede på Job 1 fra 9 til 17 i går"', placeholder: 'Beskriv arbejdet...', parse: 'Analyser', parsing: 'Analyserer...', jobNotFound: 'Job ikke fundet', unrecognized: 'Ikke genkendt' }, header: '{title} for {date}', addTitle: 'Tilføj', editTitle: 'Rediger', job: 'Job', entryType: 'Type', types: { timeRange: 'Tidsrum', duration: 'Varighed', status: 'Status' }, startTime: 'Start', endTime: 'Slut', duration: 'Tid (t)', status: 'Status', selectJob: 'Vælg job', selectJobError: 'Vælg et job', addButton: 'Tilføj', saveButton: 'Gem' },
    statuses: { worked: 'Arbejdet', off: 'Fri', holiday: 'Ferie', sick: 'Syg' },
    auth: { loading: 'Logger ind...', title: 'Velkommen', subtitleSignIn: 'Log ind', subtitleSignUp: 'Tilmeld', emailLabel: 'Email', passwordLabel: 'Adgangskode', submitting: 'Vent venligst...', signIn: 'Log ind', signUp: 'Tilmeld', switchToSignUp: 'Ingen konto?', switchToSignIn: 'Har konto?', signOut: 'Log ud', checkEmail: 'Tjek email', heroEyebrow: 'Arbejdstidsregistrering', heroHeadline: 'Styr din tid', heroSubheadline: 'Spor timer og indtjening', heroCta: 'Gratis konto',
      whatTitle: 'Det får du allerede på dag ét',
      what: {
        planner: {
          title: 'Visuel vagtplanlægger',
          description: 'En kalender viser alle jobs på én gang, så du altid ved hvor tiden forsvinder.'
        },
        capture: {
          title: 'Registrering uden friktion',
          description: 'Tryk, træk eller skriv på naturligt sprog, og lad AI lave strukturerede poster.'
        },
        earnings: {
          title: 'Automatisk lønberegning',
          description: 'Timeløn, valuta og overarbejde samles med det samme for hvert job.'
        },
        export: {
          title: 'Eksportér til Excel',
          description: 'Eksportér nemt til Excel pr. job eller samlet med flere muligheder.'
        },
      },
      features: { tracking: { title: 'Direkte sporing', description: 'Log hurtigt' }, schedule: { title: 'Smart skema', description: 'Planlæg ugen' }, sync: { title: 'Cloud sync', description: 'Web, iOS, Android' } }, downloadTitle: 'Mobilapps snart', downloadSubtitle: 'Scan for at downloade', downloadPlaceholder: 'Forhåndsvisning' }
  },
  no: {
    app: { title: 'Arbeidstidssporing', addEntryAria: 'Legg til oppføring' },
    nav: { calendar: 'Kalender', dashboard: 'Oversikt', settings: 'Innstillinger' },
    common: { cancel: 'Avbryt', save: 'Lagre', edit: 'Rediger', add: 'Legg til', delete: 'Slett', error: 'En feil oppsto.', totalHours: 'Totalt: {hours} timer' },
    calendar: { deleteConfirm: 'Slett denne oppføringen?', unknownJob: 'Ukjent jobb', noEntries: 'Ingen oppføringer.' },
    dashboard: { title: 'Oversikt', filters: { period: 'Periode', job: 'Jobb', date: 'Dato' }, periodOptions: { day: 'Dag', week: 'Uke', month: 'Måned', year: 'År' }, allJobs: 'Alle jobber', stats: { totalHours: 'Totale timer', totalDays: 'Arbeidsdager', totalEarnings: 'Total inntjening' }, chart: { title: 'Timer per jobb', hoursLabel: 'Timer' } },
    settings: { jobs: { title: 'Administrer jobber', schedule: 'Timeplan', rateDisplay: '{amount} / time', addTitle: 'Ny jobb', nameLabel: 'Navn', rateLabel: 'Timelønn', currencyLabel: 'Valuta', addButton: 'Legg til' }, notifications: { title: 'Varsler', reminderLabel: 'Daglig påminnelse', reminderNote: 'Påminnelse kl {time}.', permissionDenied: 'Blokkert.', notSupported: 'Ikke støttet.', updateError: 'Feil.' }, language: { title: 'Språk', label: 'Appspråk' }, theme: { toggle: 'Bytt tema', switchToDark: 'Mørk modus', switchToLight: 'Lys modus', dark: 'Mørk', light: 'Lys' } },
    entryModal: { ai: { title: 'Smart inndata (AI)', examples: 'F.eks: "Jobbet på Jobb 1 fra 9 til 17 i går"', placeholder: 'Beskriv arbeidet...', parse: 'Analyser', parsing: 'Analyserer...', jobNotFound: 'Jobb ikke funnet', unrecognized: 'Ikke gjenkjent' }, header: '{title} for {date}', addTitle: 'Legg til', editTitle: 'Rediger', job: 'Jobb', entryType: 'Type', types: { timeRange: 'Tidsrom', duration: 'Varighet', status: 'Status' }, startTime: 'Start', endTime: 'Slutt', duration: 'Tid (t)', status: 'Status', selectJob: 'Velg jobb', selectJobError: 'Velg en jobb', addButton: 'Legg til', saveButton: 'Lagre' },
    statuses: { worked: 'Jobbet', off: 'Fri', holiday: 'Ferie', sick: 'Syk' },
    auth: { loading: 'Logger inn...', title: 'Velkommen', subtitleSignIn: 'Logg inn', subtitleSignUp: 'Registrer', emailLabel: 'E-post', passwordLabel: 'Passord', submitting: 'Vent...', signIn: 'Logg inn', signUp: 'Registrer', switchToSignUp: 'Ingen konto?', switchToSignIn: 'Har konto?', signOut: 'Logg ut', checkEmail: 'Sjekk e-post', heroEyebrow: 'Arbeidstidssporing', heroHeadline: 'Ta kontroll over tiden', heroSubheadline: 'Spor timer og inntjening', heroCta: 'Gratis konto',
      whatTitle: 'Dette får du fra dag én',
      what: {
        planner: {
          title: 'Visuell vaktplan',
          description: 'En kalender viser alle jobber samtidig, så du alltid vet hvor tiden går.'
        },
        capture: {
          title: 'Sømløs registrering',
          description: 'Trykk, dra eller skriv på naturlig språk, og la KI gjøre det til strukturerte føringer.'
        },
        earnings: {
          title: 'Automatisk inntektsberegning',
          description: 'Timesatser, valuta og overtid summeres umiddelbart per jobb.'
        },
        export: {
          title: 'Eksporter til Excel',
          description: 'Eksporter enkelt til Excel per jobb eller samlet, med flere valg.'
        },
      },
      features: { tracking: { title: 'Direkte sporing', description: 'Logg raskt' }, schedule: { title: 'Smart timeplan', description: 'Planlegg uken' }, sync: { title: 'Skysynkronisering', description: 'Web, iOS, Android' } }, downloadTitle: 'Mobilapper snart', downloadSubtitle: 'Skann for å laste ned', downloadPlaceholder: 'Forhåndsvisning' }
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
