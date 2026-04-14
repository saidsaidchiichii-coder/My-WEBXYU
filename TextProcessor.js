/**
 * 🔤 TEXT PROCESSOR
 * معالج النصوص - تحويل الفرانكو والدارجة إلى عربية
 */

const TextProcessor = {
  // ==================== FRANCO TO ARABIC MAPPING ====================
  francoMap: {
    // أرقام إلى أحرف
    '3': 'ع',
    '7': 'ح',
    '9': 'ق',
    '5': 'خ',
    '8': 'ف',
    '2': 'ز',
    '4': 'أ',
    '6': 'ط',
    '0': 'و',
    '1': 'ل',

    // كلمات شائعة بالفرانكو
    'salam': 'سلام',
    'kifak': 'كيفاك',
    'labas': 'لابأس',
    'bzef': 'بزاف',
    'mochkil': 'مشكل',
    'walah': 'والله',
    'inshallah': 'إن شاء الله',
    'alhamdulillah': 'الحمد لله',
    'mashallah': 'ما شاء الله',
    'subhanallah': 'سبحان الله',
    '3ndi': 'عندي',
    'bghit': 'بغيت',
    'kaydir': 'كيدير',
    'kaygol': 'كيقول',
    'kaytkun': 'كيتكون',
    'fhamt': 'فهمت',
    'wach': 'واش',
    'chno': 'شنو',
    'fin': 'فين',
    'wakha': 'وخا',
    'daba': 'دابا',
    'hadi': 'هادي',
    'hadik': 'هاديك',
    'hadol': 'هادول',
    'nta': 'نتا',
    'nti': 'نتي',
    'hna': 'هنا',
    'hnak': 'هناك',
    'hni': 'هني',
    'bla': 'بلا',
    'bslama': 'بسلامة',
    'labas': 'لابأس',
    'kayn': 'كاين',
    'kayno': 'كاينو',
    'kayna': 'كاينة',
    'kayni': 'كايني',
    'kayno': 'كاينو',
    'rah': 'راه',
    'raha': 'راها',
    'rahe': 'راهي',
    'rahou': 'راهو',
    'rahin': 'راهين',
    'gal': 'قال',
    'galt': 'قالت',
    'galo': 'قالو',
    'galina': 'قالينا',
    'jab': 'جاب',
    'jabt': 'جابت',
    'jabo': 'جابو',
    'jabina': 'جابينا',
    'dir': 'دير',
    'dirt': 'ديرت',
    'diro': 'ديرو',
    'dirina': 'ديرينا',
    'kla': 'كلا',
    'klina': 'كلينا',
    'klou': 'كلو',
    'klom': 'كلهم',
    'klhom': 'كلهم',
    'shno': 'شنو',
    'shnu': 'شنو',
    'shniya': 'شنية',
    'shnia': 'شنية',
    'walu': 'والو',
    'walou': 'والو',
    'hta': 'حتا',
    'htta': 'حتا',
    'hti': 'حتي',
    'htti': 'حتي',
    'lah': 'لاه',
    'lha': 'لها',
    'lhom': 'لهم',
    'lhom': 'لهم',
    'lhomma': 'لهما',
    'nqas': 'نقص',
    'nqast': 'نقصت',
    'nqaso': 'نقصو',
    'zwin': 'زوين',
    'zwina': 'زوينة',
    'zwino': 'زوينو',
    'zwini': 'زويني',
    'zwinu': 'زوينو',
    'khayb': 'خيب',
    'khaybt': 'خيبت',
    'khaybo': 'خيبو',
    'khayba': 'خيبة',
    'khaybi': 'خيبي',
    'jaj': 'جاج',
    'jaja': 'جاجة',
    'jajo': 'جاجو',
    'jaji': 'جاجي',
    'jajou': 'جاجو',
    'bezzaf': 'بزاف',
    'bzef': 'بزاف',
    'bezzef': 'بزاف',
    'bzef': 'بزاف',
    'ktir': 'كتير',
    'ktira': 'كتيرة',
    'ktiro': 'كتيرو',
    'ktiri': 'كتيري',
    'ktiru': 'كتيرو',
    'qila': 'قيلة',
    'qilo': 'قيلو',
    'qili': 'قيلي',
    'qilu': 'قيلو',
    'qil': 'قيل',
    'qilt': 'قيلت',
    'qilo': 'قيلو',
    'qila': 'قيلة',
    'qili': 'قيلي',
    'qilu': 'قيلو',
    'qilou': 'قيلو',
    'mok': 'موك',
    'moka': 'موكة',
    'moko': 'موكو',
    'moki': 'موكي',
    'moku': 'موكو',
    'mokla': 'موكلة',
    'moklo': 'موكلو',
    'mokli': 'موكلي',
    'moklou': 'موكلو',
    'mokla': 'موكلة',
    'moklat': 'موكلات',
    'moklou': 'موكلو',
    'moklina': 'موكلينا',
    'moklatna': 'موكلاتنا',
    'moklathom': 'موكلاتهم',
    'moklathomma': 'موكلاتهما',
    'moklathom': 'موكلاتهم',
    'moklathomma': 'موكلاتهما',
    'moklathom': 'موكلاتهم',
    'moklathomma': 'موكلاتهما',
    'moklathom': 'موكلاتهم',
    'moklathomma': 'موكلاتهما',
  },

  // ==================== DARIJA COMMON WORDS ====================
  darijaMap: {
    'سلام': 'سلام',
    'كيفاش': 'كيفاش',
    'كيفاك': 'كيفاك',
    'لابأس': 'لابأس',
    'بزاف': 'بزاف',
    'مشكل': 'مشكل',
    'والله': 'والله',
    'إن شاء الله': 'إن شاء الله',
    'الحمد لله': 'الحمد لله',
    'ما شاء الله': 'ما شاء الله',
    'سبحان الله': 'سبحان الله',
  },

  // ==================== CONVERT FRANCO TO ARABIC ====================
  convertFranco(text) {
    if (!text) return text;

    let result = text.toLowerCase();

    // تحويل الكلمات الكاملة أولاً (قبل تحويل الأرقام)
    for (const [franco, arabic] of Object.entries(this.francoMap)) {
      if (franco.length > 1) {
        const regex = new RegExp(`\\b${franco}\\b`, 'gi');
        result = result.replace(regex, arabic);
      }
    }

    // تحويل الأرقام إلى أحرف
    for (const [number, arabic] of Object.entries(this.francoMap)) {
      if (number.length === 1 && /\d/.test(number)) {
        result = result.replace(new RegExp(number, 'g'), arabic);
      }
    }

    return result;
  },

  // ==================== DETECT LANGUAGE ====================
  detectLanguage(text) {
    if (!text) return 'unknown';

    const arabicRegex = /[\u0600-\u06FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    const numberRegex = /[0-9]/g;

    const arabicCount = (text.match(arabicRegex) || []).length;
    const englishCount = (text.match(englishRegex) || []).length;
    const numberCount = (text.match(numberRegex) || []).length;

    // إذا كان يحتوي على أرقام مع إنجليزية = فرانكو
    if (numberCount > 0 && englishCount > 0) {
      return 'franco';
    }

    // إذا كان يحتوي على عربية فقط
    if (arabicCount > englishCount) {
      return 'arabic';
    }

    // إذا كان يحتوي على إنجليزية فقط
    if (englishCount > arabicCount) {
      return 'english';
    }

    return 'mixed';
  },

  // ==================== PREPROCESS TEXT ====================
  preprocessText(text) {
    if (!text) return text;

    const language = this.detectLanguage(text);

    let processed = text;

    // إذا كان فرانكو، حوله إلى عربية
    if (language === 'franco') {
      processed = this.convertFranco(processed);
    }

    // تنظيف النص
    processed = processed
      .trim()
      .replace(/\s+/g, ' ') // إزالة المسافات الزائدة
      .replace(/([؟!.،])\s+/g, '$1 '); // تنسيق علامات الترقيم

    return processed;
  },

  // ==================== ENHANCE MESSAGE ====================
  enhanceMessage(text) {
    const processed = this.preprocessText(text);
    const language = this.detectLanguage(text);

    return {
      original: text,
      processed: processed,
      language: language,
      isArabic: language === 'arabic' || language === 'franco',
      isFranco: language === 'franco'
    };
  }
};
