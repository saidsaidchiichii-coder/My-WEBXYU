/**
 * ============================================================================
 * 🎮 CONTROL AI - ADVANCED FRONTEND LOGIC & USER INTERACTION
 * ============================================================================
 * 
 * This module handles:
 * 1. User message display and interaction
 * 2. AI response streaming and rendering
 * 3. Code syntax highlighting
 * 4. Thinking animations
 * 5. Voice recording and playback
 * 6. File handling and preview
 * 7. User profile management
 * 8. Gamification system
 * 9. Bias detection and correction
 * 10. Advanced UI interactions
 * 
 * ============================================================================
 */

const AI = {
  // ==================== CORE PROPERTIES ====================
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto',
  isRecording: false,
  currentLanguage: 'english',

  // ==================== USER PROFILE ====================
  userProfile: {
    name: 'User',
    personality: 'neutral',
    mood: 'neutral',
    interests: [],
    communicationStyle: 'english',
    conversationHistory: [],
    learningData: {},
    preferences: {
      soundEnabled: true,
      animationsEnabled: true,
      darkMode: true,
      compactMode: false
    }
  },

  // ==================== GAMIFICATION ====================
  gamification: {
    points: 0,
    level: 1,
    streak: 0,
    achievements: [],
    totalInteractions: 0,
    dailyStreak: 0,
    lastInteractionDate: null
  },

  // ==================== PERSONALITY MODES ====================
  personalities: {
    neutral: { tone: 'professional', emoji: '🤖', style: 'balanced' },
    funny: { tone: 'humorous', emoji: '😄', style: 'light-hearted' },
    serious: { tone: 'formal', emoji: '💼', style: 'professional' },
    motivator: { tone: 'inspiring', emoji: '🚀', style: 'encouraging' },
    coach: { tone: 'guiding', emoji: '🎯', style: 'questioning' },
    creative: { tone: 'imaginative', emoji: '✨', style: 'artistic' },
    analytical: { tone: 'logical', emoji: '🧠', style: 'detailed' }
  },

  // ==================== BIAS PATTERNS ====================
  biasPatterns: {
    overthinking: ['always', 'never', 'impossible', 'can\'t', 'won\'t', 'should not'],
    fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified'],
    perfectionism: ['perfect', 'flawless', 'must', 'should', 'have to', 'absolutely'],
    selfDoubt: ['not good enough', 'fail', 'stupid', 'useless', 'worthless', 'incompetent'],
    catastrophizing: ['worst', 'disaster', 'ruined', 'destroyed', 'hopeless', 'terrible']
  },

  // ==================== INITIALIZATION ====================
  /**
   * Initialize the AI system
   * @param {string} box - Messages box element ID
   * @param {string} api - API endpoint URL
   */
  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
    this.loadUserProfile();
    this.setupModeSelector();
    this.showGamificationWidget();
    this.setupEventListeners();
    this.detectBrowserLanguage();
    console.log('✅ AI System Initialized');
  },

  // ==================== EVENT LISTENERS ====================
  /**
   * Setup event listeners for UI interactions
   */
  setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl+D for dictation
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        this.toggleMic();
      }
      // Ctrl+L to clear history
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        this.clearConversationHistory();
      }
    });

    // Auto-save profile periodically
    setInterval(() => {
      this.saveUserProfile();
    }, 30000);
  },

  // ==================== LANGUAGE DETECTION ====================
  /**
   * Detect browser language
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('ar')) {
      this.switchLanguage('arabic');
    } else if (browserLang.startsWith('en')) {
      this.switchLanguage('english');
    } else if (browserLang.startsWith('fr')) {
      this.switchLanguage('english');
    }
  },

  // ==================== PROFILE MANAGEMENT ====================
  /**
   * Load user profile from localStorage
   */
  loadUserProfile() {
    try {
      const saved = localStorage.getItem('aiUserProfile');
      if (saved) {
        this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
      }
      const gamification = localStorage.getItem('aiGamification');
      if (gamification) {
        this.gamification = { ...this.gamification, ...JSON.parse(gamification) };
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  },

  /**
   * Save user profile to localStorage
   */
  saveUserProfile() {
    try {
      localStorage.setItem('aiUserProfile', JSON.stringify(this.userProfile));
      localStorage.setItem('aiGamification', JSON.stringify(this.gamification));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  },

  /**
   * Reset user profile
   */
  resetUserProfile() {
    this.userProfile = {
      name: 'User',
      personality: 'neutral',
      mood: 'neutral',
      interests: [],
      communicationStyle: 'english',
      conversationHistory: [],
      learningData: {},
      preferences: {
        soundEnabled: true,
        animationsEnabled: true,
        darkMode: true,
        compactMode: false
      }
    };
    this.gamification = {
      points: 0,
      level: 1,
      streak: 0,
      achievements: [],
      totalInteractions: 0,
      dailyStreak: 0,
      lastInteractionDate: null
    };
    this.saveUserProfile();
  },

  // ==================== LEARNING FROM CONVERSATION ====================
  /**
   * Learn from user conversation
   * @param {string} userMessage - User message
   * @param {string} aiResponse - AI response
   */
  learnFromConversation(userMessage, aiResponse) {
    const keywords = this.extractKeywords(userMessage);
    keywords.forEach(keyword => {
      if (!this.userProfile.interests.includes(keyword)) {
        this.userProfile.interests.push(keyword);
      }
    });

    this.userProfile.mood = this.detectMood(userMessage);
    this.userProfile.personality = this.detectPersonality(userMessage);

    this.userProfile.conversationHistory.push({
      timestamp: new Date(),
      user: userMessage,
      ai: aiResponse,
      mood: this.userProfile.mood,
      personality: this.userProfile.personality
    });

    if (this.userProfile.conversationHistory.length > 100) {
      this.userProfile.conversationHistory.shift();
    }

    this.saveUserProfile();
  },

  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @returns {array} - Keywords
   */
  extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
      'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which'
    ];
    return words
      .filter(w => w.length > 3 && !stopWords.includes(w))
      .slice(0, 5);
  },

  /**
   * Detect mood from text
   * @param {string} text - Input text
   * @returns {string} - Mood
   */
  detectMood(text) {
    const textLower = text.toLowerCase();
    
    const happyWords = ['happy', 'great', 'awesome', 'love', 'excellent', 'wonderful', 'fantastic'];
    const sadWords = ['sad', 'bad', 'terrible', 'hate', 'depressed', 'miserable', 'awful'];
    const stressedWords = ['stressed', 'anxious', 'worried', 'panic', 'overwhelmed', 'frustrated'];
    const excitedWords = ['excited', 'amazing', 'wow', 'incredible', 'fantastic', 'thrilled'];
    const confusedWords = ['confused', 'lost', 'unclear', 'don\'t understand', 'puzzled'];

    if (happyWords.some(w => textLower.includes(w))) return 'happy';
    if (sadWords.some(w => textLower.includes(w))) return 'sad';
    if (stressedWords.some(w => textLower.includes(w))) return 'stressed';
    if (excitedWords.some(w => textLower.includes(w))) return 'excited';
    if (confusedWords.some(w => textLower.includes(w))) return 'confused';
    return 'neutral';
  },

  /**
   * Detect personality from text
   * @param {string} text - Input text
   * @returns {string} - Personality
   */
  detectPersonality(text) {
    const textLower = text.toLowerCase();
    
    if (/\?{2,}|!!!|haha|lol|😂|funny|joke/.test(textLower)) return 'funny';
    if (/serious|important|critical|urgent|formal/.test(textLower)) return 'serious';
    if (/help|guide|teach|learn|question|how/.test(textLower)) return 'coach';
    if (/motivate|inspire|believe|can do|possible|achieve/.test(textLower)) return 'motivator';
    if (/create|imagine|design|build|invent/.test(textLower)) return 'creative';
    if (/analyze|think|reason|logic|explain/.test(textLower)) return 'analytical';
    return 'neutral';
  },

  // ==================== MODE SELECTOR ====================
  /**
   * Setup mode selector
   */
  setupModeSelector() {
    const modeSelectors = document.querySelectorAll('.mode-selector');
    modeSelectors.forEach(selector => {
      selector.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showModeMenu(selector);
      });
    });
  },

  /**
   * Show mode selection menu
   * @param {element} selector - Selector element
   */
  showModeMenu(selector) {
    const existingMenu = document.querySelector('.mode-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.className = 'mode-menu';
    menu.innerHTML = `
      <div class="mode-option ${this.currentMode === 'auto' ? 'active' : ''}" data-mode="auto">
        <span class="mode-name">Auto</span>
        <span class="mode-desc">Smart selection</span>
      </div>
      <div class="mode-option ${this.currentMode === 'fast' ? 'active' : ''}" data-mode="fast">
        <span class="mode-name">Faster AI 5.2</span>
        <span class="mode-desc">Quick responses</span>
      </div>
      <div class="mode-option ${this.currentMode === 'thinking' ? 'active' : ''}" data-mode="thinking">
        <span class="mode-name">Thinking Longer</span>
        <span class="mode-desc">Deep analysis (~3s)</span>
      </div>
      <div class="mode-option ${this.currentMode === 'creative' ? 'active' : ''}" data-mode="creative">
        <span class="mode-name">Creative Mode</span>
        <span class="mode-desc">Imaginative responses</span>
      </div>
    `;

    menu.querySelectorAll('.mode-option').forEach(option => {
      option.addEventListener('click', () => {
        this.currentMode = option.dataset.mode;
        selector.querySelector('span').textContent = option.querySelector('.mode-name').textContent;
        menu.remove();
      });
    });

    document.body.appendChild(menu);
    const rect = selector.getBoundingClientRect();
    menu.style.top = (rect.bottom + 8) + 'px';
    menu.style.left = (rect.left - 50) + 'px';
  },

  /**
   * Select appropriate mode for message
   * @param {string} message - User message
   * @param {boolean} hasImages - Has image files
   * @returns {string} - Selected mode
   */
  selectMode(message, hasImages) {
    if (this.currentMode === 'fast') return 'fast';
    if (this.currentMode === 'thinking') return 'thinking';
    if (this.currentMode === 'creative') return 'creative';

    const messageLength = message.length;
    const isComplex = /how|why|explain|analyze|compare|summarize|complex|design|create/i.test(message);
    const isImage = hasImages;

    if (isComplex || isImage || messageLength > 150) return 'thinking';
    return 'fast';
  },

  // ==================== MESSAGE DISPLAY ====================
  /**
   * Display user message
   * @param {string} text - Message text
   */
  user(text) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper';
    
    const div = document.createElement('div');
    div.className = 'msg user';
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  // ==================== THINKING ANIMATION ====================
  /**
   * Show thinking animation
   * @returns {element} - Thinking wrapper element
   */
  thinking() {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper ai';
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'thinking-container';
    thinkingDiv.innerHTML = `
      <div class="loader-dots">
        <span></span><span></span><span></span>
      </div>
      <span class="thinking-text">Analyzing your message...</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  // ==================== SYNTAX HIGHLIGHTING ====================
  /**
   * Highlight code syntax
   * @param {string} code - Code to highlight
   * @returns {string} - Highlighted HTML
   */
  highlight(code) {
    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["\'`].*?["\'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw|import|export|from|as|default|extends|implements|interface|enum|type|namespace|public|private|protected|static|readonly|abstract|final|synchronized|volatile|transient|native|strictfp)\b/g, '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  },

  // ==================== ASK WITH ENHANCEMENTS ====================
  /**
   * Send message to API with enhancements
   * @param {string} message - User message
   */
  async ask(message) {
    const load = this.thinking();

    try {
      // Learn from conversation
      this.learnFromConversation(message, '');

      // Detect bias
      const biases = this.detectBias(message);
      if (biases.length > 0) {
        const corrections = this.generateBiasCorrection(biases);
        this.showBiasAlert(corrections);
      }

      // Prepare payload
      const payload = {
        message: message,
        files: [],
        mode: this.currentMode,
        timestamp: new Date().toISOString(),
        userProfile: {
          mood: this.userProfile.mood,
          personality: this.userProfile.personality,
          interests: this.userProfile.interests
        }
      };

      // Get files if any
      const fileInput = document.getElementById('chatFileInput') || document.getElementById('homeFileInput');
      if (fileInput && fileInput.files.length > 0) {
        const images = await this.analyzeImages(Array.from(fileInput.files));
        
        for (let file of fileInput.files) {
          const reader = new FileReader();
          await new Promise((resolve) => {
            reader.onload = (e) => {
              payload.files.push({
                name: file.name,
                type: file.type,
                data: e.target.result,
                isImage: file.type.startsWith('image/')
              });
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }

        if (images.length > 0) {
          payload.hasImages = true;
          payload.imageCount = images.length;
          payload.imageInfo = images.map(img => ({
            name: img.name,
            type: img.type,
            size: img.size
          }));
        }
      }

      const selectedMode = this.selectMode(message, payload.hasImages);
      payload.selectedMode = selectedMode;

      const timeout = selectedMode === 'thinking' ? 30000 : 10000;

      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout)
      });

      const data = await res.json();
      load.remove();
      
      let reply = data?.reply || 'I encountered an error processing your request.';

      // Apply personality
      reply = this.getPersonalityResponse(reply);

      this.streamRender(reply);

      // Add points
      this.addPoints(5, 'Received response');

    } catch (e) {
      load.remove();
      const wrapper = document.createElement('div');
      wrapper.className = 'msg-wrapper ai';
      
      const err = document.createElement('div');
      err.className = 'msg ai error';
      err.textContent = e.name === 'AbortError' 
        ? 'Request timeout. Please try again.' 
        : 'System Error: API Connection Failed.';
      
      wrapper.appendChild(err);
      this.messagesBox.appendChild(wrapper);
      this.scroll();
    }
  },

  // ==================== PERSONALITY RESPONSE ====================
  /**
   * Apply personality to response
   * @param {string} baseResponse - Base response
   * @returns {string} - Personalized response
   */
  getPersonalityResponse(baseResponse) {
    const personality = this.userProfile.personality;
    const mode = this.personalities[personality];

    let response = baseResponse;

    if (personality === 'funny') {
      const jokes = [' 😄 (Just kidding, but seriously...)', ' 🤣 (Okay, let me be real...)', ' 😎 (Plot twist: ...)'];
      response = response + jokes[Math.floor(Math.random() * jokes.length)];
    } else if (personality === 'motivator') {
      const motivations = [' 💪 You got this!', ' 🚀 You\'re capable!', ' ⭐ Believe in yourself!'];
      response = response + motivations[Math.floor(Math.random() * motivations.length)];
    } else if (personality === 'coach') {
      const questions = [' 🤔 What do you think?', ' 💭 How would you approach this?', ' 🎯 What\'s your next step?'];
      response = response + questions[Math.floor(Math.random() * questions.length)];
    } else if (personality === 'creative') {
      const creative = [' ✨ Imagine the possibilities!', ' 🎨 Let\'s create something amazing!', ' 🌟 Think outside the box!'];
      response = response + creative[Math.floor(Math.random() * creative.length)];
    } else if (personality === 'analytical') {
      const analytical = [' 🧠 Based on the data...', ' 📊 The analysis shows...', ' 🔍 Looking deeper...'];
      response = response + analytical[Math.floor(Math.random() * analytical.length)];
    }

    return `${mode.emoji} ${response}`;
  },

  // ==================== BIAS DETECTION ====================
  /**
   * Detect cognitive biases in text
   * @param {string} text - Input text
   * @returns {array} - Detected biases
   */
  detectBias(text) {
    const detectedBiases = [];
    for (const [biasType, keywords] of Object.entries(this.biasPatterns)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        detectedBiases.push(biasType);
      }
    }
    return detectedBiases;
  },

  /**
   * Generate bias correction messages
   * @param {array} biases - Detected biases
   * @returns {array} - Correction messages
   */
  generateBiasCorrection(biases) {
    const corrections = {
      overthinking: '🧠 I notice absolute words. Remember, most situations have nuance.',
      fear: '💪 I sense fear. Let\'s break this down into manageable steps.',
      perfectionism: '✨ Perfection is the enemy of progress. Good enough is often good enough!',
      selfDoubt: '🌟 You\'re more capable than you think. Let\'s focus on what you CAN do.',
      catastrophizing: '🌈 I notice catastrophic thinking. Let\'s focus on realistic outcomes.'
    };
    return biases.map(bias => corrections[bias] || '').filter(c => c);
  },

  /**
   * Show bias detection alert
   * @param {array} corrections - Correction messages
   */
  showBiasAlert(corrections) {
    const container = this.messagesBox;
    const alert = document.createElement('div');
    alert.className = 'bias-detection-alert';
    alert.innerHTML = `
      <div class="bias-title">🧠 Thinking Pattern Detected</div>
      <div class="bias-message">${corrections.join(' ')}</div>
    `;
    container.appendChild(alert);
    this.scroll();
  },

  // ==================== IMAGE ANALYSIS ====================
  /**
   * Analyze uploaded images
   * @param {array} files - File list
   * @returns {array} - Image descriptions
   */
  async analyzeImages(files) {
    const imageDescriptions = [];
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          const imageData = await new Promise((resolve) => {
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          });
          imageDescriptions.push({
            name: file.name,
            type: file.type,
            data: imageData,
            size: file.size
          });
        } catch (err) {
          console.error('Error reading image:', err);
        }
      }
    }
    return imageDescriptions;
  },

  // ==================== STREAMING RENDER ====================
  /**
   * Stream render AI response
   * @param {string} fullText - Full response text
   */
  async streamRender(fullText) {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper ai';
    
    const container = document.createElement('div');
    container.className = 'msg ai';
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split('```');
    let textContent = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i % 2 === 1) {
        // Code block
        const codeBox = document.createElement('div');
        codeBox.className = 'code-box';
        
        const header = document.createElement('div');
        header.className = 'code-header';
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;
        
        const copyBtn = header.querySelector('.copy-btn');
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          copyBtn.textContent = 'Copied!';
          setTimeout(() => copyBtn.textContent = 'Copy', 1500);
        };

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.innerHTML = this.highlight(part.trim());
        
        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      } else {
        // Text content
        const textDiv = document.createElement('div');
        container.appendChild(textDiv);
        
        const paragraphs = part.split('\n');
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement('p');
            p.style.marginBottom = '0.5rem';
            textDiv.appendChild(p);
            
            const words = para.trim().split(' ');
            for (const word of words) {
              p.textContent += word + ' ';
              textContent += word + ' ';
              this.scroll();
              await new Promise(r => setTimeout(r, 15 + Math.random() * 20));
            }
          }
        }
      }
      this.scroll();
    }
    
    if (textContent.trim()) {
      this.addVoiceButton(container, textContent.trim());
    }
  },

  /**
   * Add voice button to message
   * @param {element} messageElement - Message element
   * @param {string} text - Text to speak
   */
  addVoiceButton(messageElement, text) {
    if (messageElement.querySelector('.voice-btn-play')) return;

    const voiceContainer = document.createElement('div');
    voiceContainer.className = 'voice-message';
    voiceContainer.style.animation = 'slideIn 0.3s ease-out';
    
    const playBtn = document.createElement('button');
    playBtn.className = 'voice-btn-play';
    playBtn.innerHTML = '<i data-lucide="volume-2"></i>';
    playBtn.onclick = () => this.speakText(text, playBtn);
    
    const duration = document.createElement('span');
    duration.className = 'voice-duration';
    duration.textContent = 'Listen';
    
    voiceContainer.appendChild(playBtn);
    voiceContainer.appendChild(duration);
    
    messageElement.appendChild(voiceContainer);
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  },

  /**
   * Speak text using text-to-speech
   * @param {string} text - Text to speak
   * @param {element} button - Button element
   */
  speakText(text, button) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = this.currentLanguage === 'arabic' ? 'ar-SA' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Apple')) || voices[0];
        utterance.voice = preferredVoice;
      }
      
      if (button) {
        button.style.opacity = '0.6';
        button.style.transform = 'scale(1.1)';
      }
      
      utterance.onstart = () => {
        if (button) {
          button.innerHTML = '<i data-lucide="volume-x"></i>';
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      };
      
      utterance.onend = () => {
        if (button) {
          button.innerHTML = '<i data-lucide="volume-2"></i>';
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        if (button) {
          button.innerHTML = '<i data-lucide="volume-2"></i>';
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        }
      };
      
      window.speechSynthesis.speak(utterance);
    }
  },

  // ==================== GAMIFICATION ====================
  /**
   * Add points to gamification
   * @param {number} amount - Points to add
   * @param {string} reason - Reason for points
   */
  addPoints(amount, reason) {
    this.gamification.points += amount;
    this.gamification.streak += 1;
    this.gamification.totalInteractions += 1;

    const currentLevel = this.gamification.level;
    const milestones = { 1: 0, 2: 100, 3: 300, 4: 600, 5: 1000, 10: 5000 };
    
    for (const [level, pointsNeeded] of Object.entries(milestones)) {
      if (this.gamification.points >= pointsNeeded && level > currentLevel) {
        this.gamification.level = parseInt(level);
        this.showLevelUpNotification(level);
      }
    }

    this.saveUserProfile();
    this.showGamificationWidget();
  },

  /**
   * Show level up notification
   * @param {number} level - New level
   */
  showLevelUpNotification(level) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
      <div class="level-up-content">
        <h2>🎉 Level ${level} Unlocked!</h2>
        <p>You're making amazing progress!</p>
      </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  },

  /**
   * Show gamification widget
   */
  showGamificationWidget() {
    let widget = document.getElementById('gamificationWidget');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'gamificationWidget';
      widget.className = 'gamification-widget';
      document.body.appendChild(widget);
    }

    const status = {
      points: this.gamification.points,
      level: this.gamification.level,
      streak: this.gamification.streak
    };

    widget.innerHTML = `
      <div class="gamification-header">
        <span class="gamification-title">Your Progress</span>
      </div>
      <div class="level-badge">${status.level}</div>
      <div class="points-display">
        <span>Points:</span>
        <span class="points-value">${status.points}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.min((status.points % 100), 100)}%"></div>
      </div>
      <div class="streak-display">
        <span class="streak-flame">🔥</span>
        <span>Streak: ${status.streak}</span>
      </div>
    `;
  },

  // ==================== LANGUAGE SWITCHING ====================
  /**
   * Switch communication language
   * @param {string} language - Language code
   */
  switchLanguage(language) {
    this.currentLanguage = language;
    this.userProfile.communicationStyle = language;
    this.saveUserProfile();
    
    if (language === 'arabic' || language === 'darija') {
      document.body.classList.add('rtl');
      document.body.setAttribute('dir', 'rtl');
    } else {
      document.body.classList.remove('rtl');
      document.body.setAttribute('dir', 'ltr');
    }
  },

  // ==================== VOICE RECORDING ====================
  /**
   * Toggle microphone recording
   */
  async toggleMic() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported in your browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = this.currentLanguage === 'arabic' ? 'ar-SA' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      this.isRecording = true;
      this.showRecordingIndicator(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const input = document.getElementById('chatInput') || document.getElementById('homeInput');
      if (input) {
        input.value = transcript;
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      this.isRecording = false;
      this.showRecordingIndicator(false);
    };

    recognition.start();
  },

  /**
   * Show recording indicator
   * @param {boolean} isRecording - Recording state
   */
  showRecordingIndicator(isRecording) {
    let indicator = document.getElementById('recordingIndicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'recordingIndicator';
      indicator.innerHTML = `
        <div class="recording-dot"></div>
        <span class="recording-text">Recording...</span>
      `;
      document.body.appendChild(indicator);
    }
    indicator.style.display = isRecording ? 'flex' : 'none';
  },

  // ==================== UTILITY FUNCTIONS ====================
  /**
   * Scroll to bottom of messages
   */
  scroll() {
    const box = this.messagesBox;
    box.scrollTo({
      top: box.scrollHeight,
      behavior: 'smooth'
    });
  },

  /**
   * Clear conversation history
   */
  clearConversationHistory() {
    this.userProfile.conversationHistory = [];
    this.saveUserProfile();
    this.messagesBox.innerHTML = '';
  },

  /**
   * Export conversation
   */
  exportConversation() {
    const history = this.userProfile.conversationHistory;
    const json = JSON.stringify(history, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${Date.now()}.json`;
    a.click();
  }
};

console.log('🎮 Control AI System Loaded');
