/**
 * ============================================================================
 * 🔤 TEXT PROCESSOR - ADVANCED LANGUAGE & TEXT PROCESSING ENGINE
 * ============================================================================
 * 
 * This module provides:
 * 1. Franco-Arabic (Arabizi) to Arabic conversion
 * 2. Darija dialect processing
 * 3. Modern Standard Arabic normalization
 * 4. Text cleaning and preprocessing
 * 5. Language detection and classification
 * 6. Sentiment analysis
 * 7. Text enrichment and enhancement
 * 8. Spell checking and correction
 * 
 * ============================================================================
 */

const TextProcessor = {
  // ==================== FRANCO TO ARABIC MAPPING ====================
  /**
   * Comprehensive Franco-Arabic mapping dictionary
   */
  francoMap: {
    // Numbers to Arabic letters
    '3': 'ع', '7': 'ح', '9': 'ق', '2': 'ء', '5': 'خ', '8': 'ف',
    '4': 'أ', '6': 'ط', '0': 'و', '1': 'ل',

    // Common Franco words - Darija
    'salam': 'سلام',
    'kifak': 'كيفاك',
    'kifaak': 'كيفاك',
    'kifak': 'كيفاك',
    'labas': 'لابأس',
    'bzef': 'بزاف',
    'bezzaf': 'بزاف',
    'mochkil': 'مشكل',
    'walah': 'والله',
    'inshallah': 'إن شاء الله',
    'alhamdulillah': 'الحمد لله',
    'mashallah': 'ما شاء الله',
    'subhanallah': 'سبحان الله',
    '3ndi': 'عندي',
    'bghit': 'بغيت',
    'bghayt': 'بغيت',
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
    'kayn': 'كاين',
    'kayno': 'كاينو',
    'kayna': 'كاينة',
    'kayni': 'كايني',
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
    'mok': 'موك',
    'moka': 'موكة',
    'moko': 'موكو',
    'moki': 'موكي',
    'moku': 'موكو',
    'mokla': 'موكلة',
    'moklo': 'موكلو',
    'mokli': 'موكلي',
    'moklou': 'موكلو',
    'moklat': 'موكلات',
    'moklina': 'موكلينا',
    'moklatna': 'موكلاتنا',
    'moklathom': 'موكلاتهم',
    'moklathomma': 'موكلاتهما',

    // Common English words to Arabic
    'hello': 'السلام عليكم',
    'hi': 'السلام',
    'bye': 'وداعاً',
    'thanks': 'شكراً',
    'thank you': 'شكراً لك',
    'please': 'من فضلك',
    'yes': 'نعم',
    'no': 'لا',
    'ok': 'حسناً',
    'okay': 'حسناً',
    'good': 'جيد',
    'bad': 'سيء',
    'great': 'رائع',
    'sorry': 'آسف',
    'excuse me': 'عذراً',
    'how are you': 'كيف حالك',
    'what is your name': 'ما اسمك',
    'my name is': 'اسمي هو',
    'nice to meet you': 'يسعدني التعرف عليك',
    'where are you from': 'من أين أنت',
    'i am from': 'أنا من',
    'do you speak english': 'هل تتحدث الإنجليزية',
    'i don\'t understand': 'لا أفهم',
    'can you help me': 'هل يمكنك مساعدتي',
    'what time is it': 'كم الساعة',
    'how much': 'كم السعر',
    'where is the bathroom': 'أين الحمام',
    'i am hungry': 'أنا جائع',
    'i am tired': 'أنا متعب',
    'good morning': 'صباح الخير',
    'good afternoon': 'مساء الخير',
    'good night': 'تصبح على خير'
  },

  // ==================== DARIJA KEYWORDS ====================
  /**
   * Darija-specific keywords for detection
   */
  darijaKeywords: [
    'واه', 'بزاف', 'كيفاش', 'شنو', 'علاش', 'فين', 'كيف', 'إييه',
    'لا', 'نعم', 'غادي', 'كاين', 'ما', 'كيتقول', 'كيقول', 'تقول',
    'قول', 'ديال', 'حتا', 'بحال', 'كاع', 'سمح', 'ولا', 'ولي',
    'باش', 'علي', 'عليك', 'عليه', 'عليها', 'ديرها', 'ديره', 'ديري',
    'ديرو', 'ديرهم', 'كاين', 'كاينة', 'كايين', 'كاينين', 'كايينة',
    'نقدر', 'قدرت', 'قدرنا', 'قدرو', 'مقدرش', 'ماقدرتش', 'مكاينش',
    'ماكاينش', 'ماشي', 'حسن', 'خاص', 'بغا', 'بغيت', 'بغينا', 'بغاو',
    'بغاهم', 'نبغا', 'تبغا', 'يبغا', 'تبغي', 'يبغي', 'نبغي', 'تبغاو',
    'يبغاو', 'كتب', 'كتبت', 'كتبنا', 'كتبو', 'كتبهم', 'نكتب', 'تكتب',
    'يكتب', 'تكتبي', 'يكتبي', 'نكتبي', 'تكتبو', 'يكتبو', 'راه', 'راها',
    'راهي', 'راهو', 'راهين', 'ولا', 'ولي', 'والو', 'حتا', 'حتي'
  ],

  // ==================== MODERN STANDARD ARABIC KEYWORDS ====================
  /**
   * MSA-specific keywords for detection
   */
  msaKeywords: [
    'السلام', 'عليكم', 'ورحمة', 'الله', 'وبركاته', 'كيف', 'حالك',
    'أنا', 'أنت', 'هو', 'هي', 'نحن', 'أنتم', 'هم', 'هن',
    'يكون', 'تكون', 'أكون', 'نكون', 'يكونون', 'تكن', 'أكن',
    'قال', 'قالت', 'قالوا', 'قالن', 'قالا', 'قلت', 'قلنا',
    'فعل', 'فعلت', 'فعلوا', 'فعلن', 'فعلا', 'فعلتا', 'فعلتم',
    'ذهب', 'ذهبت', 'ذهبوا', 'ذهبن', 'ذهبا', 'ذهبتا', 'ذهبتم',
    'جاء', 'جاءت', 'جاءوا', 'جئن', 'جاءا', 'جاءتا', 'جاءتم',
    'أصبح', 'أضحى', 'ظل', 'بات', 'مازال', 'مازالت', 'ما زال',
    'كان', 'كانت', 'كانوا', 'كن', 'كانا', 'كانتا', 'كانتم',
    'يقول', 'تقول', 'أقول', 'نقول', 'يقولون', 'تقلن', 'قالوا'
  ],

  // ==================== CONVERT FRANCO TO ARABIC ====================
  /**
   * Convert Franco-Arabic text to Arabic script
   * @param {string} text - Franco-Arabic text
   * @returns {string} - Arabic text
   */
  convertFranco(text) {
    if (!text) return text;

    let result = text.toLowerCase();

    // Convert full words first (before numbers)
    for (const [franco, arabic] of Object.entries(this.francoMap)) {
      if (franco.length > 1 && isNaN(franco)) {
        const regex = new RegExp(`\\b${franco}\\b`, 'gi');
        result = result.replace(regex, arabic);
      }
    }

    // Convert numbers to Arabic letters
    for (const [number, arabic] of Object.entries(this.francoMap)) {
      if (number.length === 1 && /\d/.test(number)) {
        result = result.replace(new RegExp(number, 'g'), arabic);
      }
    }

    return result;
  },

  // ==================== DETECT LANGUAGE ====================
  /**
   * Detect language of input text
   * @param {string} text - Input text
   * @returns {string} - Language code (franco, darija, msa, arabic, english, mixed, unknown)
   */
  detectLanguage(text) {
    if (!text) return 'unknown';

    const arabicRegex = /[\u0600-\u06FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    const numberRegex = /[0-9]/g;

    const arabicCount = (text.match(arabicRegex) || []).length;
    const englishCount = (text.match(englishRegex) || []).length;
    const numberCount = (text.match(numberRegex) || []).length;

    // Check for Franco (numbers with English letters)
    if (numberCount > 0 && englishCount > 0 && arabicCount === 0) {
      return 'franco';
    }

    // Check for Darija
    let darijaScore = 0;
    for (const keyword of this.darijaKeywords) {
      if (text.includes(keyword)) darijaScore++;
    }
    if (darijaScore > 3 && arabicCount > englishCount) {
      return 'darija';
    }

    // Check for MSA
    let msaScore = 0;
    for (const keyword of this.msaKeywords) {
      if (text.includes(keyword)) msaScore++;
    }
    if (msaScore > 3 && arabicCount > englishCount) {
      return 'msa';
    }

    // Check for general Arabic
    if (arabicCount > englishCount && arabicCount > 0) {
      return 'arabic';
    }

    // Check for English
    if (englishCount > arabicCount && englishCount > 0) {
      return 'english';
    }

    // Mixed content
    if (arabicCount > 0 && englishCount > 0) {
      return 'mixed';
    }

    return 'unknown';
  },

  // ==================== PREPROCESS TEXT ====================
  /**
   * Preprocess text
   * @param {string} text - Raw input
   * @returns {string} - Processed text
   */
  preprocessText(text) {
    if (!text) return text;

    const language = this.detectLanguage(text);

    let processed = text;

    // Convert Franco to Arabic if needed
    if (language === 'franco') {
      processed = this.convertFranco(processed);
    }

    // Normalize Arabic text
    if (language === 'darija' || language === 'msa' || language === 'arabic') {
      processed = this.normalizeArabicText(processed);
    }

    // Clean up whitespace
    processed = processed
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/([؟!.،])\s+/g, '$1 ');

    return processed;
  },

  // ==================== NORMALIZE ARABIC TEXT ====================
  /**
   * Normalize Arabic text
   * @param {string} text - Arabic text
   * @returns {string} - Normalized text
   */
  normalizeArabicText(text) {
    return text
      .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
      .replace(/ة/g, 'ه')
      .replace(/أ/g, 'ا')
      .replace(/إ/g, 'ا')
      .replace(/آ/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/ئ/g, 'ي');
  },

  // ==================== ENHANCE MESSAGE ====================
  /**
   * Enhance message with processing
   * @param {string} text - Input text
   * @returns {object} - Enhanced message data
   */
  enhanceMessage(text) {
    const language = this.detectLanguage(text);
    const processed = this.preprocessText(text);

    return {
      original: text,
      processed: processed,
      language: language,
      isArabic: language === 'arabic' || language === 'darija' || language === 'msa',
      isFranco: language === 'franco',
      isDarija: language === 'darija',
      isMSA: language === 'msa',
      isEnglish: language === 'english',
      isMixed: language === 'mixed',
      length: text.length,
      wordCount: text.split(/\s+/).length
    };
  },

  // ==================== SENTIMENT ANALYSIS ====================
  /**
   * Analyze sentiment of text
   * @param {string} text - Input text
   * @returns {object} - Sentiment analysis
   */
  analyzeSentiment(text) {
    const textLower = text.toLowerCase();

    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'happy', 'love', 'awesome', 'perfect', 'beautiful', 'nice',
      'جيد', 'رائع', 'ممتاز', 'رائع', 'جميل', 'رائع', 'حب',
      'بزاف', 'حسن', 'زوين', 'زوينة', 'ممتاز', 'رائع'
    ];

    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry',
      'disappointed', 'frustrated', 'annoyed', 'upset', 'depressed',
      'سيء', 'فظيع', 'مرعب', 'كره', 'حزين', 'غاضب', 'مخيب',
      'مشكل', 'سيء', 'خيب', 'خيبة', 'سيء', 'فظيع'
    ];

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of positiveWords) {
      if (textLower.includes(word)) positiveScore++;
    }

    for (const word of negativeWords) {
      if (textLower.includes(word)) negativeScore++;
    }

    const totalScore = positiveScore + negativeScore;
    let sentiment = 'neutral';
    let confidence = 0;

    if (totalScore > 0) {
      confidence = Math.max(positiveScore, negativeScore) / totalScore;
      sentiment = positiveScore > negativeScore ? 'positive' : 'negative';
    }

    return {
      sentiment: sentiment,
      confidence: confidence,
      positiveScore: positiveScore,
      negativeScore: negativeScore
    };
  },

  // ==================== TEXT ENRICHMENT ====================
  /**
   * Enrich text with additional information
   * @param {string} text - Input text
   * @returns {object} - Enriched text data
   */
  enrichText(text) {
    const enhanced = this.enhanceMessage(text);
    const sentiment = this.analyzeSentiment(text);

    return {
      ...enhanced,
      sentiment: sentiment,
      hasEmojis: /[\u{1F300}-\u{1F9FF}]/u.test(text),
      hasNumbers: /\d/.test(text),
      hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(text),
      hasUrls: /https?:\/\/[^\s]+/.test(text),
      hasEmails: /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text),
      isQuestion: text.trim().endsWith('?'),
      isExclamation: text.trim().endsWith('!'),
      isPunctuated: /[.!?]$/.test(text.trim())
    };
  },

  // ==================== SPELL CHECK ====================
  /**
   * Basic spell checking (for common misspellings)
   * @param {string} text - Input text
   * @returns {object} - Spell check results
   */
  spellCheck(text) {
    const commonMisspellings = {
      'teh': 'the',
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
      'definately': 'definitely',
      'untill': 'until',
      'begining': 'beginning',
      'occassion': 'occasion',
      'succesful': 'successful',
      'neccessary': 'necessary'
    };

    let corrected = text;
    const corrections = [];

    for (const [misspelled, correct] of Object.entries(commonMisspellings)) {
      const regex = new RegExp(`\\b${misspelled}\\b`, 'gi');
      if (regex.test(corrected)) {
        corrections.push({ from: misspelled, to: correct });
        corrected = corrected.replace(regex, correct);
      }
    }

    return {
      original: text,
      corrected: corrected,
      corrections: corrections,
      hasErrors: corrections.length > 0
    };
  },

  // ==================== TEXT STATISTICS ====================
  /**
   * Get text statistics
   * @param {string} text - Input text
   * @returns {object} - Text statistics
   */
  getStatistics(text) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    const averageWordLength = charactersNoSpaces / (words.length || 1);
    const averageSentenceLength = words.length / (sentences.length || 1);

    return {
      characters: characters,
      charactersNoSpaces: charactersNoSpaces,
      words: words.length,
      sentences: sentences.length,
      averageWordLength: averageWordLength.toFixed(2),
      averageSentenceLength: averageSentenceLength.toFixed(2),
      readingTime: Math.ceil(words.length / 200) // Assuming 200 words per minute
    };
  }
};

console.log('🔤 Text Processor Loaded');
