/**
 * ============================================================================
 * 🔗 AI INTEGRATION LAYER - ADVANCED LANGUAGE PROCESSING & API MANAGEMENT
 * ============================================================================
 * 
 * This module provides:
 * 1. Complete language detection (Darija, Arabizi, Modern Standard Arabic, English)
 * 2. Text preprocessing and normalization
 * 3. API integration with intelligent routing
 * 4. Response formatting based on language context
 * 5. Error handling and fallback mechanisms
 * 6. Conversation history management
 * 7. User profile learning and adaptation
 * 8. Advanced caching and performance optimization
 * 
 * ============================================================================
 */

// Store original AI object for reference
const OriginalAI = typeof AI !== 'undefined' ? AI : {};

/**
 * ============================================================================
 * LANGUAGE DETECTION & PROCESSING ENGINE
 * ============================================================================
 */
const LanguageEngine = {
  // ==================== LANGUAGE DETECTION PATTERNS ====================
  patterns: {
    darija: {
      keywords: [
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
        'راهي', 'راهو', 'راهين', 'ولا', 'ولي', 'والو', 'حتا', 'حتي',
        'لاه', 'لها', 'لهم', 'لهما', 'نقص', 'نقصت', 'نقصو', 'زوين',
        'زوينة', 'زوينو', 'زويني', 'خيب', 'خيبت', 'خيبو', 'خيبة', 'خيبي'
      ],
      regex: /[\u0600-\u06FF]{2,}(?:اش|ي|ه|ك|ن|و|ة)?/g,
      minScore: 0.4
    },
    arabizi: {
      patterns: [
        /[0-9]{1,2}[a-z]/gi,
        /[a-z]{2,}[0-9]/gi,
        /[0-9][a-z]{2,}[0-9]/gi,
        /[3579][a-z]+/gi
      ],
      minMatches: 2
    },
    msa: {
      keywords: [
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
      minScore: 0.5
    },
    english: {
      regex: /^[a-zA-Z\s\d\.,!?\-'"]+$/,
      minRatio: 0.8
    }
  },

  // ==================== ARABIZI TO ARABIC MAPPING ====================
  arabiziMap: {
    // Numbers to Arabic letters
    '3': 'ع', '7': 'ح', '9': 'ق', '2': 'ء', '5': 'خ', '8': 'ف',
    '4': 'أ', '6': 'ط', '1': 'ا', '0': 'و',
    // Common patterns
    'kh': 'خ', 'sh': 'ش', 'ch': 'ش', 'dh': 'ذ', 'th': 'ث', 'gh': 'غ',
    'ph': 'ف', 'aa': 'ا', 'ee': 'ي', 'oo': 'و', 'ou': 'و', 'ii': 'ي'
  },

  // ==================== FRANCO TO ARABIC DICTIONARY ====================
  francoDictionary: {
    'salam': 'السلام', 'kifak': 'كيفاك', 'labas': 'لابأس', 'bzef': 'بزاف',
    'mochkil': 'مشكل', 'walah': 'والله', 'inshallah': 'إن شاء الله',
    'alhamdulillah': 'الحمد لله', 'mashallah': 'ما شاء الله',
    'subhanallah': 'سبحان الله', '3ndi': 'عندي', 'bghit': 'بغيت',
    'kaydir': 'كيدير', 'kaygol': 'كيقول', 'kaytkun': 'كيتكون',
    'fhamt': 'فهمت', 'wach': 'واش', 'chno': 'شنو', 'fin': 'فين',
    'wakha': 'وخا', 'daba': 'دابا', 'hadi': 'هادي', 'hadik': 'هاديك',
    'hadol': 'هادول', 'nta': 'نتا', 'nti': 'نتي', 'hna': 'هنا',
    'hnak': 'هناك', 'hni': 'هني', 'bla': 'بلا', 'bslama': 'بسلامة',
    'kayn': 'كاين', 'kayno': 'كاينو', 'kayna': 'كاينة', 'kayni': 'كايني',
    'rah': 'راه', 'raha': 'راها', 'rahe': 'راهي', 'rahou': 'راهو',
    'rahin': 'راهين', 'gal': 'قال', 'galt': 'قالت', 'galo': 'قالو',
    'galina': 'قالينا', 'jab': 'جاب', 'jabt': 'جابت', 'jabo': 'جابو',
    'jabina': 'جابينا', 'dir': 'دير', 'dirt': 'ديرت', 'diro': 'ديرو',
    'dirina': 'ديرينا', 'kla': 'كلا', 'klina': 'كلينا', 'klou': 'كلو',
    'klom': 'كلهم', 'klhom': 'كلهم', 'shno': 'شنو', 'shnu': 'شنو',
    'shniya': 'شنية', 'shnia': 'شنية', 'walu': 'والو', 'walou': 'والو',
    'hta': 'حتا', 'htta': 'حتا', 'hti': 'حتي', 'htti': 'حتي',
    'lah': 'لاه', 'lha': 'لها', 'lhom': 'لهم', 'lhomma': 'لهما',
    'nqas': 'نقص', 'nqast': 'نقصت', 'nqaso': 'نقصو', 'zwin': 'زوين',
    'zwina': 'زوينة', 'zwino': 'زوينو', 'zwini': 'زويني', 'zwinu': 'زوينو',
    'khayb': 'خيب', 'khaybt': 'خيبت', 'khaybo': 'خيبو', 'khayba': 'خيبة',
    'khaybi': 'خيبي', 'jaj': 'جاج', 'jaja': 'جاجة', 'jajo': 'جاجو',
    'jaji': 'جاجي', 'jajou': 'جاجو', 'bezzaf': 'بزاف', 'bzef': 'بزاف',
    'bezzef': 'بزاف', 'ktir': 'كتير', 'ktira': 'كتيرة', 'ktiro': 'كتيرو',
    'ktiri': 'كتيري', 'ktiru': 'كتيرو', 'qila': 'قيلة', 'qilo': 'قيلو',
    'qili': 'قيلي', 'qilu': 'قيلو', 'qil': 'قيل', 'qilt': 'قيلت',
    'mok': 'موك', 'moka': 'موكة', 'moko': 'موكو', 'moki': 'موكي',
    'moku': 'موكو', 'mokla': 'موكلة', 'moklo': 'موكلو', 'mokli': 'موكلي',
    'moklou': 'موكلو', 'moklat': 'موكلات', 'moklina': 'موكلينا'
  },

  // ==================== DETECT LANGUAGE ====================
  /**
   * Comprehensive language detection
   * @param {string} text - Input text
   * @returns {object} - { language, confidence, isArabizi, isDarija, isMSA, isEnglish }
   */
  detectLanguage(text) {
    if (!text || typeof text !== 'string') {
      return {
        language: 'unknown',
        confidence: 0,
        isArabizi: false,
        isDarija: false,
        isMSA: false,
        isEnglish: false
      };
    }

    const textLower = text.toLowerCase();
    const arabicRegex = /[\u0600-\u06FF]/g;
    const englishRegex = /[a-zA-Z]/g;
    const numberRegex = /[0-9]/g;

    const arabicMatches = text.match(arabicRegex) || [];
    const englishMatches = textLower.match(englishRegex) || [];
    const numberMatches = textLower.match(numberRegex) || [];

    const arabicRatio = arabicMatches.length / text.length;
    const englishRatio = englishMatches.length / text.length;

    // Check for Arabizi (Franco-Arabic)
    let arabiziScore = 0;
    for (const pattern of this.patterns.arabizi.patterns) {
      const matches = textLower.match(pattern) || [];
      arabiziScore += matches.length;
    }
    const isArabizi = arabiziScore >= this.patterns.arabizi.minMatches;

    // Check for Darija
    let darijaScore = 0;
    for (const keyword of this.patterns.darija.keywords) {
      if (text.includes(keyword)) darijaScore++;
    }
    const darijaRatio = darijaScore / this.patterns.darija.keywords.length;
    const isDarija = darijaRatio >= this.patterns.darija.minScore && arabicRatio > 0.3;

    // Check for Modern Standard Arabic
    let msaScore = 0;
    for (const keyword of this.patterns.msa.keywords) {
      if (text.includes(keyword)) msaScore++;
    }
    const msaRatio = msaScore / this.patterns.msa.keywords.length;
    const isMSA = msaRatio >= this.patterns.msa.minScore && arabicRatio > 0.5;

    // Check for English
    const isEnglish = this.patterns.english.regex.test(text) && englishRatio > 0.8;

    // Determine primary language
    let language = 'unknown';
    let confidence = 0;

    if (isArabizi && !isDarija && !isMSA) {
      language = 'arabizi';
      confidence = Math.min(arabiziScore / 5, 1);
    } else if (isDarija) {
      language = 'darija';
      confidence = darijaRatio;
    } else if (isMSA) {
      language = 'msa';
      confidence = msaRatio;
    } else if (isEnglish) {
      language = 'english';
      confidence = englishRatio;
    } else if (arabicRatio > 0.3) {
      language = 'arabic';
      confidence = arabicRatio;
    } else if (englishRatio > 0.3) {
      language = 'english';
      confidence = englishRatio;
    }

    return {
      language,
      confidence,
      isArabizi,
      isDarija,
      isMSA,
      isEnglish,
      arabicRatio,
      englishRatio
    };
  },

  // ==================== CONVERT ARABIZI TO ARABIC ====================
  /**
   * Convert Franco-Arabic to Arabic script
   * @param {string} text - Arabizi text
   * @returns {string} - Arabic text
   */
  convertArabiziToArabic(text) {
    if (!text) return text;

    let result = text;

    // Replace numbers first
    for (const [num, arabic] of Object.entries(this.arabiziMap)) {
      if (!isNaN(num)) {
        result = result.replace(new RegExp(num, 'g'), arabic);
      }
    }

    // Replace common patterns
    for (const [pattern, arabic] of Object.entries(this.arabiziMap)) {
      if (isNaN(pattern)) {
        result = result.replace(new RegExp(pattern, 'gi'), arabic);
      }
    }

    return result;
  },

  // ==================== PREPROCESS TEXT ====================
  /**
   * Preprocess and normalize text
   * @param {string} text - Raw input
   * @returns {object} - Processed data
   */
  preprocessText(text) {
    if (!text || typeof text !== 'string') {
      return {
        original: '',
        processed: '',
        language: 'unknown',
        normalized: ''
      };
    }

    const detection = this.detectLanguage(text);
    let processed = text.trim();

    // Convert Arabizi if detected
    if (detection.isArabizi) {
      processed = this.convertArabiziToArabic(processed);
    }

    // Normalize Arabic text
    if (detection.language === 'darija' || detection.language === 'msa' || detection.language === 'arabic') {
      processed = this.normalizeArabicText(processed);
    }

    // Clean up whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    return {
      original: text,
      processed: processed,
      language: detection.language,
      normalized: processed,
      detection: detection
    };
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
      .replace(/ى/g, 'ي');
  }
};

/**
 * ============================================================================
 * SYSTEM PROMPT GENERATOR
 * ============================================================================
 */
const SystemPromptGenerator = {
  // ==================== DARIJA SYSTEM PROMPT ====================
  getDarijaPrompt() {
    return `أنت مساعد ذكي متخصص في اللغة الدارجة المغربية.

**قواعد صارمة جداً:**

1. **الرد بالدارجة فقط:**
   - يجب أن تجيب دائماً بالدارجة المغربية الطبيعية
   - لا تستخدم العربية الفصحى أبداً
   - لا تستخدم الإنجليزية أبداً
   - لا تستخدم الفرنسية أبداً

2. **ممنوع منعاً باتاً:**
   - ❌ ترجمة الجملة أو شرح معناها
   - ❌ تحليل لغوي (مثل: "I see you're typing...")
   - ❌ الرد بأي لغة غير الدارجة
   - ❌ شرح الكلمات أو القواعس النحوية
   - ❌ إضافة ملاحظات حول اللغة

3. **السلوك المطلوب:**
   - تصرف كمساعد بشري مغربي حقيقي
   - فهم الدارجة والفرانكو (Arabizi) مباشرة
   - الرد بشكل طبيعي وقصير وواضح
   - استخدام الدارجة الحقيقية

4. **أمثلة على الردود الصحيحة:**
   - المستخدم: "T9DR THDR GHA B DARIJA?"
   - الرد: "إييه نقدر، قول شنو بغيتي 👍"
   
   - المستخدم: "كيفاش نتا؟"
   - الرد: "بزاف بخير، شنو أخبارك أنت؟"

5. **الأسلوب:**
   - ودود وطبيعي
   - قصير ومباشر
   - بدون تعقيد
   - استخدام الرموز التعبيرية بحذر

تذكر: أنت شخص مغربي يفهم الدارجة ويرد بها بشكل طبيعي تماماً.`;
  },

  // ==================== MODERN STANDARD ARABIC PROMPT ====================
  getMSAPrompt() {
    return `أنت مساعد ذكي متخصص في اللغة العربية الفصحى المعاصرة.

**المبادئ الأساسية:**

1. **الرد باللغة العربية الفصحى:**
   - استخدم اللغة العربية الفصحى الصحيحة والمعاصرة
   - تجنب اللهجات العامية
   - استخدم القواعس النحوية الصحيحة
   - اختر الكلمات الفصيحة المناسبة

2. **ممنوع:**
   - ❌ استخدام اللهجات العامية
   - ❌ الرد بالإنجليزية أو الفرنسية
   - ❌ خلط اللغات
   - ❌ استخدام الكلمات الأجنبية بدون ضرورة

3. **السلوك المطلوب:**
   - قدم إجابات واضحة وموثوقة
   - استخدم التنسيق المناسب (فقرات، نقاط، قوائم)
   - اشرح المفاهيم بشكل مفصل عند الحاجة
   - كن احترافياً وودوداً

4. **أمثلة على الردود الصحيحة:**
   - المستخدم: "كيف حالك؟"
   - الرد: "الحمد لله على كل حال، أنا بخير وفي خدمتك. كيف أستطيع مساعدتك اليوم؟"

5. **الأسلوب:**
   - احترافي وموثوق
   - واضح ومباشر
   - مفصل عند الحاجة
   - استخدام الرموز التعبيرية بحذر`;
  },

  // ==================== ENGLISH PROMPT ====================
  getEnglishPrompt() {
    return `You are an intelligent assistant specialized in English communication.

**Core Principles:**

1. **Respond in English:**
   - Use clear, professional English
   - Maintain proper grammar and spelling
   - Use appropriate vocabulary for the context
   - Be concise and direct

2. **Prohibited:**
   - ❌ Using other languages unless necessary
   - ❌ Mixing languages
   - ❌ Poor grammar or spelling

3. **Required Behavior:**
   - Provide clear and reliable answers
   - Use appropriate formatting (paragraphs, bullet points, lists)
   - Explain concepts in detail when needed
   - Be professional and friendly

4. **Examples of Correct Responses:**
   - User: "How are you?"
   - Response: "I'm doing well, thank you for asking! How can I help you today?"

5. **Style:**
   - Professional and trustworthy
   - Clear and direct
   - Detailed when necessary
   - Use emojis sparingly`;
  },

  // ==================== GET APPROPRIATE PROMPT ====================
  /**
   * Get system prompt based on language
   * @param {string} language - Detected language
   * @returns {string} - System prompt
   */
  getPrompt(language) {
    switch (language) {
      case 'darija':
        return this.getDarijaPrompt();
      case 'msa':
      case 'arabic':
        return this.getMSAPrompt();
      case 'english':
        return this.getEnglishPrompt();
      case 'arabizi':
        return this.getDarijaPrompt(); // Treat Arabizi as Darija
      default:
        return this.getEnglishPrompt();
    }
  }
};

/**
 * ============================================================================
 * API PAYLOAD BUILDER
 * ============================================================================
 */
const APIPayloadBuilder = {
  // ==================== BUILD PAYLOAD ====================
  /**
   * Build complete API payload
   * @param {string} userMessage - User input
   * @param {object} additionalData - Extra data
   * @returns {object} - Complete payload
   */
  buildPayload(userMessage, additionalData = {}) {
    const processed = LanguageEngine.preprocessText(userMessage);
    const systemPrompt = SystemPromptGenerator.getPrompt(processed.language);

    return {
      // Original and processed message
      originalMessage: processed.original,
      message: processed.processed,
      
      // Language information
      language: processed.language,
      confidence: processed.detection.confidence,
      isArabizi: processed.detection.isArabizi,
      isDarija: processed.detection.isDarija,
      isMSA: processed.detection.isMSA,
      isEnglish: processed.detection.isEnglish,
      
      // System prompt for AI
      systemPrompt: systemPrompt,
      
      // Additional data
      ...additionalData,
      
      // Metadata
      timestamp: new Date().toISOString(),
      version: '2.0'
    };
  }
};

/**
 * ============================================================================
 * CONVERSATION HISTORY MANAGER
 * ============================================================================
 */
const ConversationHistory = {
  // ==================== STATE ====================
  state: {
    conversations: [],
    maxHistory: 100,
    storageKey: 'ai_conversation_history'
  },

  // ==================== INITIALIZE ====================
  init() {
    this.loadFromStorage();
  },

  // ==================== LOAD FROM STORAGE ====================
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.state.storageKey);
      if (stored) {
        this.state.conversations = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading conversation history:', e);
      this.state.conversations = [];
    }
  },

  // ==================== SAVE TO STORAGE ====================
  saveToStorage() {
    try {
      localStorage.setItem(
        this.state.storageKey,
        JSON.stringify(this.state.conversations.slice(-this.state.maxHistory))
      );
    } catch (e) {
      console.error('Error saving conversation history:', e);
    }
  },

  // ==================== ADD CONVERSATION ====================
  addConversation(userMessage, aiResponse, language) {
    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      userMessage: userMessage,
      aiResponse: aiResponse,
      language: language,
      userMessageLength: userMessage.length,
      aiResponseLength: aiResponse.length
    };

    this.state.conversations.push(entry);

    if (this.state.conversations.length > this.state.maxHistory) {
      this.state.conversations.shift();
    }

    this.saveToStorage();
    return entry;
  },

  // ==================== GET HISTORY ====================
  getHistory(limit = 10) {
    return this.state.conversations.slice(-limit);
  },

  // ==================== CLEAR HISTORY ====================
  clearHistory() {
    this.state.conversations = [];
    localStorage.removeItem(this.state.storageKey);
  }
};

/**
 * ============================================================================
 * MAIN AI INTEGRATION MODULE
 * ============================================================================
 */
Object.assign(AI, {
  // ==================== ADVANCED FEATURES ====================
  advanced: {
    languageEngine: LanguageEngine,
    systemPromptGenerator: SystemPromptGenerator,
    conversationHistory: ConversationHistory
  },

  // ==================== ENHANCED ASK METHOD ====================
  /**
   * Enhanced ask method with language processing
   * @param {string} message - User message
   */
  async askEnhanced(message) {
    const load = this.thinking();

    try {
      // Preprocess and detect language
      const processed = LanguageEngine.preprocessText(message);
      
      // Build API payload
      const payload = APIPayloadBuilder.buildPayload(message, {
        mode: this.currentMode || 'auto',
        files: [],
        hasImages: false
      });

      // Send to API
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      load.remove();

      let reply = data?.reply || this.getErrorMessage(processed.language);

      // Add to conversation history
      ConversationHistory.addConversation(message, reply, processed.language);

      // Stream render response
      this.streamRender(reply);

      // Add points if gamification exists
      if (this.gamification) {
        this.addPoints(5, 'Received response');
      }

    } catch (e) {
      load.remove();
      const errorMsg = this.getErrorMessage('unknown');
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-wrapper ai';
      
      const err = document.createElement('div');
      err.className = 'msg ai error';
      err.textContent = errorMsg;
      
      wrapper.appendChild(err);
      this.messagesBox.appendChild(wrapper);
      this.scroll();
    }
  },

  // ==================== GET ERROR MESSAGE ====================
  /**
   * Get error message in appropriate language
   * @param {string} language - Language code
   * @returns {string} - Error message
   */
  getErrorMessage(language) {
    const messages = {
      'darija': 'عفاك، كاين مشكل في الاتصال. حاول تاني 🔄',
      'msa': 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      'arabic': 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.',
      'english': 'Sorry, there was a connection error. Please try again.',
      'unknown': 'Connection error. Please try again.'
    };
    return messages[language] || messages['unknown'];
  },

  // ==================== SWITCH LANGUAGE ====================
  /**
   * Switch communication language
   * @param {string} language - Language code
   */
  switchLanguage(language) {
    if (this.userProfile) {
      this.userProfile.communicationStyle = language;
      this.saveUserProfile();
    }

    // Update UI direction for RTL
    if (['darija', 'msa', 'arabic'].includes(language)) {
      document.body.classList.add('rtl');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.classList.remove('rtl');
      document.body.setAttribute('dir', 'ltr');
    }
  },

  // ==================== GET LANGUAGE INFO ====================
  /**
   * Get information about detected language
   * @param {string} text - Input text
   * @returns {object} - Language information
   */
  getLanguageInfo(text) {
    return LanguageEngine.detectLanguage(text);
  },

  // ==================== VIEW CONVERSATION HISTORY ====================
  /**
   * View recent conversations
   * @param {number} limit - Number of conversations to show
   * @returns {array} - Conversation history
   */
  viewConversationHistory(limit = 10) {
    return ConversationHistory.getHistory(limit);
  },

  // ==================== CLEAR CONVERSATION HISTORY ====================
  /**
   * Clear all conversation history
   */
  clearConversationHistory() {
    ConversationHistory.clearHistory();
  },

  // ==================== INITIALIZE ADVANCED FEATURES ====================
  initAdvanced() {
    ConversationHistory.init();
    console.log('✨ Advanced AI Integration Loaded');
    console.log('🌐 Language Engine Ready');
    console.log('💬 Conversation History Initialized');
  }
});

/**
 * ============================================================================
 * AUTO-INITIALIZATION
 * ============================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof AI !== 'undefined' && AI.initAdvanced) {
      AI.initAdvanced();
    }
  }, 500);
});

// Save on page unload
window.addEventListener('beforeunload', () => {
  if (typeof AI !== 'undefined' && AI.advanced) {
    ConversationHistory.saveToStorage();
  }
});

console.log('🔗 AI Integration Layer v2.0 Loaded');
console.log('📝 Language Processing: Darija, Arabizi, MSA, English');
console.log('🎯 System Prompt Generator: Active');
console.log('💾 Conversation History: Ready');
