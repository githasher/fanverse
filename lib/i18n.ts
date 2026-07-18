/**
 * FANVERSE AI — Internationalization (i18n) Translations dictionary
 * Support for 5 FIFA 2026 audience languages: English, Spanish, Arabic, French, Portuguese.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
] as const;

export type LocaleCode = 'en' | 'es' | 'fr' | 'pt' | 'ar';

export const translations = {
  en: {
    dashboardTitle: 'Stadium digital twin',
    operationsTitle: 'Operations Control Center',
    connectedSensors: 'Connected to Live Stadium Data',
    simulationPaused: 'Simulation Paused',
    gateStatus: 'Security & Gate Entrances',
    queueIntel: 'Queue Intel & Dining',
    weatherTitle: 'MetLife Weather Diagnostics',
    settingsTitle: 'Settings & Preferences',
    timelineTitle: 'Fan Matchday Timeline',
    interactiveMap: 'Launch Stadium Digital Twin',
    sustainabilityTitle: 'GreenGoal™ Sustainability Hub',
    transportTitle: 'Transit Connection Board',
    saveChanges: 'Save settings',
    chooseLanguage: 'Language Selector',
    accessibilityMode: 'Accessibility Overrides',
    dietaryRestrictions: 'Dietary Preferences',
    // Navigation labels
    navDashboard: 'Dashboard Overview',
    navChat: 'AI Assistant Chat',
    navMap: 'Stadium Digital twin',
    navTimeline: 'Match Timeline',
    navScanner: 'Ticket Scanner',
    navSettings: 'Preferences & i18n',
    // Chips
    chipRestroom: 'Nearest Restroom',
    chipFood: 'Short Wait Dining',
    chipSeat: 'Find My Seat',
    chipExit: 'Best Exit Plan',
    chipHelp: 'Request SOS Help',
  },
  es: {
    dashboardTitle: 'Gemelo digital del estadio',
    operationsTitle: 'Centro de Control de Operaciones',
    connectedSensors: 'Conectado a datos del estadio en vivo',
    simulationPaused: 'Simulación en pausa',
    gateStatus: 'Accesos y seguridad de puertas',
    queueIntel: 'Info de filas y restaurantes',
    weatherTitle: 'Diagnóstico del clima de MetLife',
    settingsTitle: 'Configuración y preferencias',
    timelineTitle: 'Cronología del partido del fan',
    interactiveMap: 'Iniciar gemelo digital del estadio',
    sustainabilityTitle: 'Centro de Sostenibilidad GreenGoal™',
    transportTitle: 'Tablero de conexiones de tránsito',
    saveChanges: 'Guardar configuración',
    chooseLanguage: 'Selector de idioma',
    accessibilityMode: 'Ajustes de accesibilidad',
    dietaryRestrictions: 'Preferencias alimenticias',
    // Navigation labels
    navDashboard: 'Vista de control',
    navChat: 'Chat de asistente AI',
    navMap: 'Mapa interactivo',
    navTimeline: 'Cronología del fan',
    navScanner: 'Escanear boleto',
    navSettings: 'Preferencias e i18n',
    // Chips
    chipRestroom: 'Baño Cercano',
    chipFood: 'Comida Sin Filas',
    chipSeat: 'Mi Asiento',
    chipExit: 'Plan de Salida',
    chipHelp: 'Ayuda de Emergencia',
  },
  fr: {
    dashboardTitle: 'Jumeau numérique du stade',
    operationsTitle: 'Centre de contrôle des opérations',
    connectedSensors: 'Connecté aux données du stade en direct',
    simulationPaused: 'Simulation en pause',
    gateStatus: 'Sécurité et entrées des portes',
    queueIntel: 'Infos files d\'attente & Restauration',
    weatherTitle: 'Diagnostics météo de MetLife',
    settingsTitle: 'Paramètres et préférences',
    timelineTitle: 'Chronologie du match du supporter',
    interactiveMap: 'Lancer le jumeau numérique',
    sustainabilityTitle: 'Pôle de durabilité GreenGoal™',
    transportTitle: 'Tableau des correspondances de transit',
    saveChanges: 'Enregistrer les paramètres',
    chooseLanguage: 'Sélecteur de langue',
    accessibilityMode: 'Paramètres d\'accessibilité',
    dietaryRestrictions: 'Préférences alimentaires',
    // Navigation labels
    navDashboard: 'Aperçu du tableau',
    navChat: 'Chat assistant IA',
    navMap: 'Plan interactif',
    navTimeline: 'Parcours du fan',
    navScanner: 'Numériser le billet',
    navSettings: 'Préférences & i18n',
    // Chips
    chipRestroom: 'Toilettes Proches',
    chipFood: 'Restauration Rapide',
    chipSeat: 'Trouver Mon Siège',
    chipExit: 'Plan de Sortie',
    chipHelp: 'Demande d\'Urgence',
  },
  pt: {
    dashboardTitle: 'Gêmeo digital do estádio',
    operationsTitle: 'Centro de Controle de Operações',
    connectedSensors: 'Conectado a dados ao vivo do estádio',
    simulationPaused: 'Simulação pausada',
    gateStatus: 'Segurança e entradas dos portões',
    queueIntel: 'Info de filas e alimentação',
    weatherTitle: 'Diagnósticos meteorológicos MetLife',
    settingsTitle: 'Configurações e preferências',
    timelineTitle: 'Linha do tempo do torcedor',
    interactiveMap: 'Iniciar gêmeo digital do estádio',
    sustainabilityTitle: 'Centro de Sustentabilidade GreenGoal™',
    transportTitle: 'Painel de conexões de trânsito',
    saveChanges: 'Salvar configurações',
    chooseLanguage: 'Seletor de idioma',
    accessibilityMode: 'Ajustes de acessibilidade',
    dietaryRestrictions: 'Preferências alimentares',
    // Navigation labels
    navDashboard: 'Visão do painel',
    navChat: 'Bate-papo assistente IA',
    navMap: 'Gêmeo digital do mapa',
    navTimeline: 'Jornada do torcedor',
    navScanner: 'Escanear ingresso',
    navSettings: 'Preferências e i18n',
    // Chips
    chipRestroom: 'Banheiro Próximo',
    chipFood: 'Comida Sem Fila',
    chipSeat: 'Encontrar Meu Assento',
    chipExit: 'Melhor Rota de Saída',
    chipHelp: 'Ajuda de Emergência',
  },
  ar: {
    dashboardTitle: 'التوأم الرقمي للاستاد',
    operationsTitle: 'مركز التحكم في العمليات',
    connectedSensors: 'متصل ببيانات الاستاد الحية',
    simulationPaused: 'المحاكاة متوقفة مؤقتاً',
    gateStatus: 'مداخل البوابات والأمن',
    queueIntel: 'معلومات الطوابير والمطاعم',
    weatherTitle: 'تشخيصات الطقس في ميتلايف',
    settingsTitle: 'الإعدادات والتفضيلات',
    timelineTitle: 'الجدول الزمني للمشجع',
    interactiveMap: 'تشغيل التوأم الرقمي للاستاد',
    sustainabilityTitle: 'مركز جرين جول™ للاستدامة',
    transportTitle: 'لوحة اتصالات النقل العام',
    saveChanges: 'حفظ الإعدادات',
    chooseLanguage: 'محدد اللغة',
    accessibilityMode: 'تجاوزات إمكانية الوصول',
    dietaryRestrictions: 'تفضيلات النظام الغذائي',
    // Navigation labels
    navDashboard: 'لوحة القيادة والمؤشرات',
    navChat: 'المساعد الذكي للدردشة',
    navMap: 'خريطة الاستاد التفاعلية',
    navTimeline: 'الجدول الزمني للمشجع',
    navScanner: 'ماسح التذاكر الضوئي',
    navSettings: 'التفضيلات واللغات',
    // Chips
    chipRestroom: 'أقرب دورة مياه',
    chipFood: 'وجبات انتظار قصير',
    chipSeat: 'البحث عن مقعدي',
    chipExit: 'أفضل خطة خروج',
    chipHelp: 'طلب المساعدة الطارئة',
  },
} as const;

/**
 * Translates UI label keys based on user language locale preferences.
 * Fallbacks to English if translation is missing.
 *
 * @param key Dictionary translations identifier.
 * @param locale Current active user locale (e.g. 'en', 'es').
 * @returns string translated label.
 */
export function t(key: keyof typeof translations['en'], locale?: string): string {
  const code = (locale && locale.toLowerCase() in translations ? locale.toLowerCase() : 'en') as LocaleCode;
  return translations[code][key] || translations['en'][key];
}
