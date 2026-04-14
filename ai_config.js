/**
 * ============================================================================
 * ⚙️ AI CONFIGURATION - SYSTEM SETTINGS & ADVANCED FEATURES
 * ============================================================================
 * 
 * This module provides:
 * 1. Syntax highlighting for code blocks
 * 2. Thinking animation and loading states
 * 3. Emoji injection and dynamic content
 * 4. Streaming response rendering
 * 5. Message scrolling and UI updates
 * 6. Configuration management
 * 7. Feature flags and settings
 * 8. Performance optimization
 * 
 * ============================================================================
 */

const AI = {
  // ==================== CORE CONFIGURATION ====================
  messagesBox: null,
  API_URL: null,
  currentMode: 'auto',

  // ==================== FEATURE FLAGS ====================
  features: {
    syntaxHighlighting: true,
    emojiInjection: true,
    streamingRender: true,
    voiceSupport: true,
    imageAnalysis: true,
    codeExecution: false,
    advancedAnalytics: true,
    darkMode: true,
    rtlSupport: true,
    offlineMode: false
  },

  // ==================== PERFORMANCE SETTINGS ====================
  performance: {
    streamingDelay: 15,
    maxStreamingDelay: 25,
    scrollBehavior: 'smooth',
    animationDuration: 300,
    debounceDelay: 300,
    cacheSize: 50,
    maxConcurrentRequests: 3
  },

  // ==================== CODE HIGHLIGHTING CONFIGURATION ====================
  highlighting: {
    languages: [
      'javascript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby',
      'go', 'rust', 'kotlin', 'swift', 'typescript', 'html', 'css',
      'sql', 'bash', 'shell', 'yaml', 'json', 'xml'
    ],
    theme: 'dark',
    lineNumbers: true,
    copyButton: true
  },

  // ==================== EMOJI CONFIGURATION ====================
  emojis: {
    enabled: true,
    keywords: ['✨', '🚀', '🤖', '💡', '🧠', '🔥', '✅', '⚡', '🌟', '🛡️'],
    probability: 0.3,
    maxPerResponse: 5
  },

  // ==================== ANIMATION SETTINGS ====================
  animations: {
    enabled: true,
    thinkingAnimation: 'dots',
    messageEntrance: 'slideIn',
    messageDuration: 300,
    typingSpeed: 'normal' // fast, normal, slow
  },

  // ==================== LANGUAGE SETTINGS ====================
  languages: {
    default: 'english',
    supported: ['english', 'arabic', 'darija', 'french', 'spanish'],
    rtlLanguages: ['arabic', 'darija'],
    current: 'english'
  },

  // ==================== SYNTAX HIGHLIGHTING ====================
  /**
   * Highlight code syntax
   * @param {string} code - Code to highlight
   * @returns {string} - Highlighted HTML
   */
  highlight(code) {
    if (!this.features.syntaxHighlighting) return code;

    return code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // Comments
      .replace(/(\/\/.*?)$/gm, '<span class="cmt">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="cmt">$1</span>')
      .replace(/<!--[\s\S]*?-->/g, '<span class="cmt">$&</span>')
      // Strings
      .replace(/(["'`])((?:\\.|(?!\1).)*?)\1/g, '<span class="str">$1$2$1</span>')
      // Numbers
      .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>')
      // Keywords
      .replace(/\b(int|bool|return|if|else|for|while|function|const|let|var|class|new|async|await|try|catch|fetch|throw|import|export|from|as|default|extends|implements|interface|enum|type|namespace|public|private|protected|static|readonly|abstract|final|synchronized|volatile|transient|native|strictfp|def|lambda|yield|with|assert|break|continue|pass|raise|except|finally|elif|switch|case|do|goto|register|union|struct|typedef|unsigned|signed|short|long|double|float|void|char|wchar_t|bool|complex|imaginary|restrict|inline|auto|volatile|const|static|extern|thread_local|alignof|sizeof|_Pragma|_Generic|_Noreturn|_Static_assert|_Thread_local|_Alignas|_Bool|_Complex|_Imaginary)\b/g, '<span class="kw">$1</span>')
      // Functions
      .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="fn">$1</span>(')
      // HTML/XML tags
      .replace(/&lt;(\/?[a-zA-Z][a-zA-Z0-9]*)\b[^&]*?&gt;/g, '<span class="tag">&lt;$1&gt;</span>')
      // Attributes
      .replace(/([a-zA-Z_][a-zA-Z0-9_]*)=/g, '<span class="attr">$1</span>=');
  },

  // ==================== THINKING ANIMATION ====================
  /**
   * Create thinking animation
   * @returns {element} - Thinking element
   */
  thinking() {
    const wrapper = document.createElement('div');
    wrapper.className = 'msg-wrapper ai';
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'thinking-container';
    
    if (this.animations.thinkingAnimation === 'dots') {
      thinkingDiv.innerHTML = `
        <div class="loader-dots">
          <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">Grok is analyzing...</span>
      `;
    } else if (this.animations.thinkingAnimation === 'spinner') {
      thinkingDiv.innerHTML = `
        <div class="loader-spinner"></div>
        <span class="thinking-text">Processing your request...</span>
      `;
    } else {
      thinkingDiv.innerHTML = `
        <div class="loader-pulse"></div>
        <span class="thinking-text">Thinking...</span>
      `;
    }
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  // ==================== EMOJI INJECTION ====================
  /**
   * Inject emojis into response
   * @param {string} text - Response text
   * @returns {string} - Text with emojis
   */
  injectEmojis(text) {
    if (!this.features.emojiInjection || !this.emojis.enabled) return text;

    let lines = text.split('\n');
    let emojiCount = 0;
    
    return lines.map(line => {
      if (line.trim().length > 20 && !line.match(/[\u{1F300}-\u{1F6FF}]/u) && emojiCount < this.emojis.maxPerResponse) {
        if (Math.random() < this.emojis.probability) {
          const randomEmoji = this.emojis.keywords[Math.floor(Math.random() * this.emojis.keywords.length)];
          emojiCount++;
          return line + ' ' + randomEmoji;
        }
      }
      return line;
    }).join('\n');
  },

  // ==================== INITIALIZE ====================
  /**
   * Initialize AI configuration
   * @param {string} box - Messages box element ID
   * @param {string} api - API endpoint URL
   */
  init(box, api) {
    this.messagesBox = document.getElementById(box);
    this.API_URL = api;
    this.loadConfiguration();
    this.setupPerformanceOptimizations();
    console.log('⚙️ AI Configuration Initialized');
    console.log('🎯 Features:', this.features);
    console.log('⚡ Performance:', this.performance);
  },

  // ==================== LOAD CONFIGURATION ====================
  /**
   * Load configuration from localStorage
   */
  loadConfiguration() {
    try {
      const saved = localStorage.getItem('ai_config');
      if (saved) {
        const config = JSON.parse(saved);
        this.features = { ...this.features, ...config.features };
        this.performance = { ...this.performance, ...config.performance };
        this.languages.current = config.language || 'english';
      }
    } catch (e) {
      console.error('Error loading configuration:', e);
    }
  },

  // ==================== SAVE CONFIGURATION ====================
  /**
   * Save configuration to localStorage
   */
  saveConfiguration() {
    try {
      const config = {
        features: this.features,
        performance: this.performance,
        language: this.languages.current
      };
      localStorage.setItem('ai_config', JSON.stringify(config));
    } catch (e) {
      console.error('Error saving configuration:', e);
    }
  },

  // ==================== SETUP PERFORMANCE OPTIMIZATIONS ====================
  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.optimizePerformance();
      }, this.performance.debounceDelay);
    });

    // Optimize animations based on device
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.animations.enabled = false;
    }
  },

  // ==================== OPTIMIZE PERFORMANCE ====================
  /**
   * Optimize performance
   */
  optimizePerformance() {
    // Remove old messages if too many
    const messages = this.messagesBox.querySelectorAll('.msg-wrapper');
    if (messages.length > 100) {
      for (let i = 0; i < messages.length - 50; i++) {
        messages[i].remove();
      }
    }
  },

  // ==================== USER MESSAGE ====================
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

  // ==================== ASK WITH CONFIGURATION ====================
  /**
   * Ask AI with configuration
   * @param {string} message - User message
   */
  async ask(message) {
    const load = this.thinking();

    try {
      const res = await fetch(this.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          config: {
            features: this.features,
            language: this.languages.current
          }
        })
      });

      const data = await res.json();
      load.remove();
      
      let reply = data?.reply || 'I encountered a glitch in the matrix. 🛸';
      
      // Apply Emoji Magic if enabled
      if (this.features.emojiInjection) {
        reply = this.injectEmojis(reply);
      }

      this.streamRender(reply);

    } catch (e) {
      load.remove();
      const err = document.createElement('div');
      err.className = 'msg ai error';
      err.style.color = '#f91880';
      err.textContent = '❌ Connection Lost. Re-establishing link... 📡';
      this.messagesBox.appendChild(err);
    }
  },

  // ==================== STREAMING RENDER ====================
  /**
   * Stream render response
   * @param {string} fullText - Full response text
   */
  async streamRender(fullText) {
    if (!this.features.streamingRender) {
      const container = document.createElement('div');
      container.className = 'msg ai';
      container.textContent = fullText;
      this.messagesBox.appendChild(container);
      this.scroll();
      return;
    }

    const container = document.createElement('div');
    container.className = 'msg ai';
    this.messagesBox.appendChild(container);
    
    const parts = fullText.split('```');
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      // CODE BLOCK
      if (i % 2 === 1) {
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
      } 
      // TEXT WITH SMOOTH TYPING
      else {
        const textDiv = document.createElement('div');
        textDiv.className = 'ai-text';
        container.appendChild(textDiv);
        
        const paragraphs = part.split('\n');
        for (const para of paragraphs) {
          if (para.trim()) {
            const p = document.createElement('p');
            p.style.marginBottom = '1.25rem';
            textDiv.appendChild(p);
            
            const words = para.trim().split(' ');
            for (const word of words) {
              p.textContent += word + ' ';
              this.scroll();
              
              // Calculate streaming delay based on performance settings
              let delay = this.performance.streamingDelay;
              if (this.performance.typingSpeed === 'fast') delay = 5;
              if (this.performance.typingSpeed === 'slow') delay = 30;
              
              await new Promise(r => setTimeout(r, delay + Math.random() * this.performance.maxStreamingDelay));
            }
          }
        }
      }
      this.scroll();
    }
  },

  // ==================== SCROLL TO BOTTOM ====================
  /**
   * Scroll to bottom of messages
   */
  scroll() {
    if (!this.messagesBox) return;
    
    const box = this.messagesBox;
    box.scrollTo({
      top: box.scrollHeight,
      behavior: this.performance.scrollBehavior
    });
  },

  // ==================== TOGGLE FEATURE ====================
  /**
   * Toggle feature on/off
   * @param {string} feature - Feature name
   */
  toggleFeature(feature) {
    if (feature in this.features) {
      this.features[feature] = !this.features[feature];
      this.saveConfiguration();
      console.log(`✅ ${feature} toggled to ${this.features[feature]}`);
    }
  },

  // ==================== SET LANGUAGE ====================
  /**
   * Set current language
   * @param {string} language - Language code
   */
  setLanguage(language) {
    if (this.languages.supported.includes(language)) {
      this.languages.current = language;
      this.saveConfiguration();
      
      // Update RTL if needed
      if (this.languages.rtlLanguages.includes(language)) {
        document.body.dir = 'rtl';
        document.body.classList.add('rtl');
      } else {
        document.body.dir = 'ltr';
        document.body.classList.remove('rtl');
      }
      
      console.log(`✅ Language set to ${language}`);
    }
  },

  // ==================== GET CONFIGURATION ====================
  /**
   * Get current configuration
   * @returns {object} - Configuration object
   */
  getConfiguration() {
    return {
      features: this.features,
      performance: this.performance,
      languages: this.languages,
      animations: this.animations,
      highlighting: this.highlighting,
      emojis: this.emojis
    };
  },

  // ==================== RESET CONFIGURATION ====================
  /**
   * Reset configuration to defaults
   */
  resetConfiguration() {
    localStorage.removeItem('ai_config');
    location.reload();
  }
};

console.log('⚙️ AI Configuration Module Loaded');
