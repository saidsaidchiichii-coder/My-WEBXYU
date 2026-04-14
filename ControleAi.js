const AI = {
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto',

  // ==================== ADVANCED FEATURES ====================
  // 1. Personal Learning & Memory
  userProfile: {
    name: 'User',
    personality: 'neutral',
    mood: 'neutral',
    interests: [],
    communicationStyle: 'arabic',
    conversationHistory: [],
    learningData: {}
  },

  // 3. Personality Modes
  personalities: {
    neutral: { tone: 'professional', emoji: '🤖', style: 'balanced' },
    funny: { tone: 'humorous', emoji: '😄', style: 'light-hearted' },
    serious: { tone: 'formal', emoji: '💼', style: 'professional' },
    motivator: { tone: 'inspiring', emoji: '🚀', style: 'encouraging' },
    coach: { tone: 'guiding', emoji: '🎯', style: 'questioning' }
  },

  // 4. Bias Detection
  biasPatterns: {
    overthinking: ['always', 'never', 'impossible', 'can\'t', 'won\'t'],
    fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
    perfectionism: ['perfect', 'flawless', 'must', 'should', 'have to'],
    selfDoubt: ['not good enough', 'fail', 'stupid', 'useless', 'worthless']
  },

  // ==================== INITIALIZATION ====================
  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
    this.loadUserProfile();
    this.setupModeSelector();
  },

  // ==================== 1. PERSONAL LEARNING ====================
  loadUserProfile() {
    const saved = localStorage.getItem('aiUserProfile');
    if (saved) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
      this.gamification = JSON.parse(localStorage.getItem('aiGamification')) || this.gamification;
    }
  },

  saveUserProfile() {
    localStorage.setItem('aiUserProfile', JSON.stringify(this.userProfile));
    localStorage.setItem('aiGamification', JSON.stringify(this.gamification));
  },

  learnFromConversation(userMessage, aiResponse) {
    // معالجة النص باستخدام TextProcessor
    const processed = TextProcessor.enhanceMessage(userMessage);
    const finalMessage = processed.processed;

    const keywords = this.extractKeywords(finalMessage);
    keywords.forEach(keyword => {
      if (!this.userProfile.interests.includes(keyword)) {
        this.userProfile.interests.push(keyword);
      }
    });

    this.userProfile.mood = this.detectMood(finalMessage);
    this.userProfile.personality = this.detectPersonality(finalMessage);

    this.userProfile.conversationHistory.push({
      timestamp: new Date(),
      user: finalMessage,
      ai: aiResponse,
      mood: this.userProfile.mood,
      personality: this.userProfile.personality
    });

    if (this.userProfile.conversationHistory.length > 100) {
      this.userProfile.conversationHistory.shift();
    }

    this.saveUserProfile();
  },

  extractKeywords(text) {
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return words.filter(w => w.length > 3 && !stopWords.includes(w)).slice(0, 5);
  },

  detectMood(text) {
    const happyWords = ['happy', 'great', 'awesome', 'love', 'excellent', '😊', '😄', '🎉'];
    const sadWords = ['sad', 'bad', 'terrible', 'hate', 'depressed', '😢', '😞'];
    const stressedWords = ['stressed', 'anxious', 'worried', 'panic', 'overwhelmed', '😰'];
    const excitedWords = ['excited', 'amazing', 'wow', 'incredible', '🤩', '✨'];

    const textLower = text.toLowerCase();
    if (happyWords.some(w => textLower.includes(w))) return 'happy';
    if (sadWords.some(w => textLower.includes(w))) return 'sad';
    if (stressedWords.some(w => textLower.includes(w))) return 'stressed';
    if (excitedWords.some(w => textLower.includes(w))) return 'excited';
    return 'neutral';
  },

  detectPersonality(text) {
    const textLower = text.toLowerCase();
    if (/\?{2,}|!!!|haha|lol|😂|funny/.test(textLower)) return 'funny';
    if (/serious|important|critical|urgent/.test(textLower)) return 'serious';
    if (/help|guide|teach|learn|question/.test(textLower)) return 'coach';
    if (/motivate|inspire|believe|can do|possible/.test(textLower)) return 'motivator';
    return 'neutral';
  },

  // ==================== 2. DUAL VOICE SYSTEM ====================
  async recordUserVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return { error: 'Speech Recognition not supported' };

    return new Promise((resolve) => {
      const recognition = new SpeechRecognition();
      recognition.lang = this.userProfile.communicationStyle === 'darija' ? 'ar-MA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => this.showRecordingIndicator(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve({ text: transcript, confidence: event.results[0][0].confidence });
      };
      recognition.onerror = (event) => resolve({ error: event.error });
      recognition.onend = () => this.showRecordingIndicator(false);
      recognition.start();
    });
  },

  async speakAIResponse(text) {
    if (!('speechSynthesis' in window)) return { error: 'Text-to-Speech not supported' };

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.userProfile.communicationStyle === 'darija' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Apple')) || voices[0];
      utterance.voice = preferredVoice;
    }

    return new Promise((resolve) => {
      utterance.onend = () => resolve({ success: true });
      utterance.onerror = (event) => resolve({ error: event.error });
      window.speechSynthesis.speak(utterance);
    });
  },

  showRecordingIndicator(isRecording) {
    const indicator = document.getElementById('recordingIndicator');
    if (indicator) indicator.style.display = isRecording ? 'flex' : 'none';
  },

  // ==================== 3. MOROCCAN DIALECT ====================
  detectLanguage(text) {
    if (/[\u0600-\u06FF]/.test(text)) {
      if (/واه|بزاف|كيفاش|شنو|علاش|فين/.test(text)) return 'darija';
      return 'arabic';
    }
    return 'english';
  },

  translateToDarija(text) {
    const translations = {
      'hello': 'سلام', 'how are you': 'كيفاش نتا', 'good': 'بزاف',
      'thank you': 'شكرا بزاف', 'yes': 'واه', 'no': 'لا'
    };
    let result = text.toLowerCase();
    for (const [english, darija] of Object.entries(translations)) {
      result = result.replace(new RegExp(english, 'gi'), darija);
    }
    return result;
  },

  // ==================== 4. MODE SELECTOR ====================
  setupModeSelector() {
    const modeSelectors = document.querySelectorAll('.mode-selector');
    modeSelectors.forEach(selector => {
      selector.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showModeMenu(selector);
      });
    });
  },

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

  selectMode(message, hasImages) {
    if (this.currentMode === 'fast') return 'fast';
    if (this.currentMode === 'thinking') return 'thinking';

    const messageLength = message.length;
    const isComplex = /how|why|explain|analyze|compare|summarize|complex/i.test(message);
    const isImage = hasImages;

    if (isComplex || isImage || messageLength > 100) return 'thinking';
    return 'fast';
  },

  // ==================== 5. IMAGE ANALYSIS ====================
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

  // ==================== 6. SYNTAX HIGHLIGHT ====================
  highlight(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/(\/\/.*)/g, '<span class="cmt">$1</span>')
      .replace(/(["\'`].*?["\'`])/g, '<span class="str">$1</span>')
      .replace(/\b(\d+)\b/g, '<span class="num">$1</span>')
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw)\b/g, '<span class="kw">$1</span>')
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\(/g, '<span class="fn">$1</span>(');
  },

  // ==================== 7. USER MESSAGE ====================
  user(text) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper";
    
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  // ==================== 8. THINKING EFFECT ====================
  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container";
    thinkingDiv.innerHTML = `
        <div class="loader-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">Thinking...</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  // ==================== 9. ASK WITH ENHANCEMENTS ====================
  async ask(message) {
    const load = this.thinking();

    try {
      // معالجة النص
      const processed = TextProcessor.enhanceMessage(message);
      const finalMessage = processed.processed;

      // Learn from conversation
      this.learnFromConversation(finalMessage, '');

      // Detect bias
      const biases = this.detectBias(finalMessage);
      if (biases.length > 0) {
        const corrections = this.generateBiasCorrection(biases);
        this.showBiasAlert(corrections);
      }

      // Prepare payload
      const payload = {
        message: finalMessage,
        files: [],
        mode: this.currentMode,
        timestamp: new Date().toISOString(),
        systemPrompt: this.getSmartSystemPrompt()
      };

      // Get files
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeout)
      });

      const data = await res.json();
      load.remove();
      
      let reply = data?.reply || "I'm sorry, I couldn't process that.";

      // Apply personality
      reply = this.getPersonalityResponse(reply);

      this.streamRender(reply);

    } catch (e) {
      load.remove();
      const wrapper = document.createElement("div");
      wrapper.className = "msg-wrapper ai";
      
      const err = document.createElement("div");
      err.className = "msg ai";
      err.textContent = e.name === 'AbortError' 
        ? "Request timeout. Please try again." 
        : "System Error: API Connection Failed.";
      
      wrapper.appendChild(err);
      this.messagesBox.appendChild(wrapper);
    }
  },

  // ==================== 10. PERSONALITY RESPONSE ====================
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
    }

    return `${mode.emoji} ${response}`;
  },

  // ==================== 11. BIAS DETECTION ====================
  detectBias(text) {
    const detectedBiases = [];
    for (const [biasType, keywords] of Object.entries(this.biasPatterns)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        detectedBiases.push(biasType);
      }
    }
    return detectedBiases;
  },

  generateBiasCorrection(biases) {
    const corrections = {
      overthinking: '🧠 I notice absolute words. Remember, most situations have nuance.',
      fear: '💪 I sense fear. Let\'s break this down into manageable steps.',
      perfectionism: '✨ Perfection is the enemy of progress. Good enough is often good enough!',
      selfDoubt: '🌟 You\'re more capable than you think. Let\'s focus on what you CAN do.'
    };
    return biases.map(bias => corrections[bias] || '').filter(c => c);
  },

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

  // ==================== SMART SYSTEM PROMPT ====================
  getSmartSystemPrompt() {
    const personality = this.userProfile.personality;
    const mood = this.userProfile.mood;
    const interests = this.userProfile.interests.slice(0, 5).join(', ');

    let prompt = `أنت مساعد ذكي متقدم وودود. تتحدث بطريقة طبيعية وإنسانية.`;

    if (personality === 'funny') {
      prompt += ` استخدم الفكاهة والطرافة في ردودك.`;
    } else if (personality === 'serious') {
      prompt += ` كن احترافياً ورسمياً في ردودك.`;
    } else if (personality === 'motivator') {
      prompt += ` كن ملهماً وشجاعاً في ردودك.`;
    } else if (personality === 'coach') {
      prompt += ` اطرح أسئلة ذكية لتحفيز التفكير.`;
    }

    if (interests) {
      prompt += ` المستخدم مهتم بـ: ${interests}.`;
    }

    prompt += ` تجنب الرفض والقول 'لم أفهم'. حاول دائماً فهم السياق والإجابة بذكاء.`;
    prompt += ` لا تكرر نفس الجمل. كن متنوعاً وطبيعياً.`;

    return prompt;
  },

  // ==================== STREAMING & VOICE ====================
  async streamRender(fullText) {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const container = document.createElement("div");
    container.className = "msg ai";
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split("```");
    let textContent = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i % 2 === 1) {
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";
        
        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="code-lang">code</span><button class="copy-btn">Copy</button>`;
        
        const copyBtn = header.querySelector(".copy-btn");
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(part.trim());
          copyBtn.textContent = "Copied!";
          setTimeout(() => copyBtn.textContent = "Copy", 1500);
        };

        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.innerHTML = this.highlight(part.trim());
        
        pre.appendChild(code);
        codeBox.appendChild(header);
        codeBox.appendChild(pre);
        container.appendChild(codeBox);
      } else {
        const textDiv = document.createElement("div");
        container.appendChild(textDiv);
        
        const paragraphs = part.split("\n");
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement("p");
            p.style.marginBottom = "0.5rem";
            textDiv.appendChild(p);
            
            const words = para.trim().split(" ");
            for (const word of words) {
                p.textContent += word + " ";
                textContent += word + " ";
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
    lucide.createIcons();
  },

  speakText(text, button) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';
      
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
          lucide.createIcons();
        }
      };
      
      utterance.onend = () => {
        if (button) {
          button.innerHTML = '<i data-lucide="volume-2"></i>';
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
          lucide.createIcons();
        }
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        if (button) {
          button.innerHTML = '<i data-lucide="volume-2"></i>';
          button.style.opacity = '1';
          button.style.transform = 'scale(1)';
          lucide.createIcons();
        }
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-Speech not supported in your browser');
    }
  },

  scroll() {
    const box = this.messagesBox;
    box.scrollTo({
        top: box.scrollHeight,
        behavior: 'smooth'
    });
  }
};
