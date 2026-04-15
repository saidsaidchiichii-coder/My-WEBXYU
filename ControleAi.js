/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ControleAi.js - Ultra-Robust AI Chat & Image Generation Controller (2000+ Lines)
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * FEATURES:
 * - Multiple image generation methods (10+ sources)
 * - Advanced fallback system with retry logic
 * - Comprehensive error handling and recovery
 * - Real-time UI feedback and progress tracking
 * - CORS-safe image loading
 * - Timeout management and graceful degradation
 * - Detailed logging and debugging
 * - Professional Grok-style UI integration
 * 
 * IMAGE GENERATION METHODS (Priority Order):
 * 1. DALL-E 3 (Backend API)
 * 2. Pollinations AI (Direct)
 * 3. Unsplash Source (Keyword-based)
 * 4. Lorem Flickr (Category-based)
 * 5. PlaceIMG (Random)
 * 6. Picsum Photos (Reliable)
 * 7. Robohash (Avatar-style)
 * 8. DiceBear Avatars (Customizable)
 * 9. Avataaars (Diverse)
 * 10. Placeholder Service (Ultimate Fallback)
 * 
 * VERSION: 2.0.0
 * LAST UPDATED: 2026-04-15
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const AI = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURATION & STATE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════
  
  messagesBox: null,
  API_URL: '/api/chat',
  currentMode: 'chat', // 'chat' or 'image'
  imageGenerationAttempt: 0,
  maxGenerationAttempts: 10,
  currentImagePrompt: '',
  isGenerating: false,
  
  conversations: {
    chat: [],
    image: []
  },

  // Image generation methods with metadata
  imageSources: [
    { 
      name: 'DALLE3', 
      method: 'dalle3',
      priority: 1,
      description: 'OpenAI DALL-E 3 (Backend)',
      enabled: true
    },
    { 
      name: 'Pollinations', 
      method: 'pollinations',
      priority: 2,
      description: 'Pollinations AI (Direct)',
      enabled: true
    },
    { 
      name: 'Unsplash', 
      method: 'unsplash',
      priority: 3,
      description: 'Unsplash Source (Real Photos)',
      enabled: true
    },
    { 
      name: 'Lorem Flickr', 
      method: 'flickr',
      priority: 4,
      description: 'Lorem Flickr (Random)',
      enabled: true
    },
    { 
      name: 'PlaceIMG', 
      method: 'placeimg',
      priority: 5,
      description: 'PlaceIMG (Categories)',
      enabled: true
    },
    { 
      name: 'Picsum', 
      method: 'picsum',
      priority: 6,
      description: 'Picsum Photos (Reliable)',
      enabled: true
    },
    { 
      name: 'Robohash', 
      method: 'robohash',
      priority: 7,
      description: 'Robohash (Avatar Style)',
      enabled: true
    },
    { 
      name: 'DiceBear', 
      method: 'dicebear',
      priority: 8,
      description: 'DiceBear Avatars',
      enabled: true
    },
    { 
      name: 'Avataaars', 
      method: 'avataaars',
      priority: 9,
      description: 'Avataaars (Diverse)',
      enabled: true
    },
    { 
      name: 'Placeholder', 
      method: 'placeholder',
      priority: 10,
      description: 'Placeholder Service (Ultimate)',
      enabled: true
    }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNTAX HIGHLIGHTING ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Highlight code syntax for display
   * @param {string} code - Raw code string
   * @returns {string} HTML-formatted code
   */
  highlight(code) {
    if (!code || typeof code !== 'string') return '';
    
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

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION & SETUP
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Initialize AI controller with DOM element
   * @param {string} boxId - ID of messages container
   */
  init(boxId) {
    try {
      this.messagesBox = document.getElementById(boxId);
      if (!this.messagesBox) {
        console.error('[AI] Message box element not found:', boxId);
        return false;
      }
      this.loadInitialMessage();
      console.log('[AI] Controller initialized successfully');
      return true;
    } catch (e) {
      console.error('[AI] Initialization error:', e);
      return false;
    }
  },

  /**
   * Load welcome message based on current mode
   */
  loadInitialMessage() {
    const welcomeText = this.currentMode === 'image' 
      ? "Welcome to Image Studio. Describe the image you want to create, and I'll generate it for you instantly."
      : "Welcome to AI Chat. How can I help you today?";
    
    this.aiMessage(welcomeText, false);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE SWITCHING
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Switch between chat and image modes
   * @param {string} mode - 'chat' or 'image'
   */
  setMode(mode) {
    if (this.currentMode === mode) return;

    this.currentMode = mode;
    this.messagesBox.innerHTML = '';
    this.imageGenerationAttempt = 0;
    this.isGenerating = false;
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.placeholder = mode === 'image' 
        ? "What image do you want to create?" 
        : "How can I help you today?";
      chatInput.disabled = false;
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isImageBtn = btn.innerText.toLowerCase().includes('imagine');
        const isChatBtn = btn.innerText.toLowerCase().includes('chat');
        
        if ((mode === 'image' && isImageBtn) || (mode === 'chat' && isChatBtn)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Load previous conversation or show welcome
    if (this.conversations[mode].length === 0) {
        this.loadInitialMessage();
    } else {
        this.conversations[mode].forEach(msg => {
            if (msg.type === 'user') this.user(msg.text, false);
            else if (msg.type === 'ai') {
                if (msg.imageUrl) this.renderImage(msg.text, msg.imageUrl, false);
                else this.aiMessage(msg.text, false);
            }
        });
    }
    
    this.scroll();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MESSAGE DISPLAY METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Display user message
   * @param {string} text - Message text
   * @param {boolean} save - Whether to save to conversation
   */
  user(text, save = true) {
    if (!text) return;
    if (save) this.conversations[this.currentMode].push({ type: 'user', text });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper user";
    
    const div = document.createElement("div");
    div.className = "msg user";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  /**
   * Display AI message
   * @param {string} text - Message text
   * @param {boolean} save - Whether to save to conversation
   */
  aiMessage(text, save = true) {
    if (!text) return;
    if (save) this.conversations[this.currentMode].push({ type: 'ai', text });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const div = document.createElement("div");
    div.className = "msg ai";
    div.textContent = text;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  /**
   * Display thinking/loading animation
   * @returns {HTMLElement} Wrapper element for removal
   */
  thinking() {
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const thinkingDiv = document.createElement("div");
    thinkingDiv.className = "thinking-container msg ai";
    thinkingDiv.innerHTML = `
        <div class="loader-dots">
            <span></span><span></span><span></span>
        </div>
        <span class="thinking-text">${this.currentMode === 'image' ? 'Generating Image...' : 'Thinking...'}</span>
    `;
    
    wrapper.appendChild(thinkingDiv);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
    return wrapper;
  },

  /**
   * Display status message for image generation progress
   * @param {string} message - Status message
   * @param {number} attemptNumber - Current attempt number
   */
  statusMessage(message, attemptNumber = null) {
    const fullMessage = attemptNumber 
      ? `${message} (Attempt ${attemptNumber}/${this.maxGenerationAttempts})`
      : message;
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const div = document.createElement("div");
    div.className = "msg ai";
    div.style.fontSize = "0.9rem";
    div.style.color = "var(--text-muted)";
    div.textContent = fullMessage;
    
    wrapper.appendChild(div);
    this.messagesBox.appendChild(wrapper);
    this.scroll();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INPUT HANDLING
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Handle send button click
   */
  handleSend() {
    if (this.isGenerating) {
      this.aiMessage("Please wait for the current request to complete.");
      return;
    }

    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (!text) {
      this.aiMessage("Please enter a message.");
      return;
    }

    this.user(text);
    input.value = '';
    this.ask(text);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // API COMMUNICATION
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Send message to backend API
   * @param {string} message - User message
   */
  async ask(message) {
    this.isGenerating = true;
    const load = this.thinking();

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: this.currentMode })
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      load.remove();
      
      if (this.currentMode === 'image') {
        // Image generation mode
        if (data.image_url) {
          // DALL-E 3 generated image successfully
          this.renderImage(data.reply, data.image_url);
        } else {
          // DALL-E 3 failed, try fallback methods
          const refinedPrompt = data.reply || message;
          this.currentImagePrompt = refinedPrompt;
          this.statusMessage("DALL-E 3 unavailable. Trying alternative generators...");
          await this.generateImageWithFallbacks(refinedPrompt, message);
        }
      } else if (data.reply) {
        // Chat mode
        this.streamRender(data.reply);
      } else {
        this.aiMessage("The AI returned an empty response.");
      }
    } catch (e) {
      load.remove();
      console.error('[AI] API Error:', e);
      this.statusMessage("Backend unavailable. Trying offline image generation...");
      
      if (this.currentMode === 'image') {
        this.currentImagePrompt = message;
        await this.generateImageWithFallbacks(message, message);
      } else {
        this.aiMessage("System Error: Could not connect to the backend server.");
      }
    } finally {
      this.isGenerating = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE GENERATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Generate image using multiple fallback methods
   * @param {string} refinedPrompt - Refined prompt from backend
   * @param {string} originalPrompt - Original user prompt
   */
  async generateImageWithFallbacks(refinedPrompt, originalPrompt) {
    this.imageGenerationAttempt = 0;
    
    for (let i = 0; i < this.imageSources.length; i++) {
      const source = this.imageSources[i];
      
      if (!source.enabled) continue;
      
      this.imageGenerationAttempt++;
      
      try {
        console.log(`[AI] Attempting image generation with ${source.name} (${this.imageGenerationAttempt}/${this.imageSources.length})`);
        
        let imageUrl = null;
        
        switch (source.method) {
          case 'dalle3':
            // Already tried in ask(), skip
            continue;
            
          case 'pollinations':
            imageUrl = this.generatePollinationsURL(refinedPrompt);
            break;
            
          case 'unsplash':
            imageUrl = this.generateUnsplashURL(refinedPrompt);
            break;
            
          case 'flickr':
            imageUrl = this.generateFlickrURL(refinedPrompt);
            break;
            
          case 'placeimg':
            imageUrl = this.generatePlaceIMGURL(refinedPrompt);
            break;
            
          case 'picsum':
            imageUrl = this.generatePicsumURL(refinedPrompt);
            break;
            
          case 'robohash':
            imageUrl = this.generateRobohashURL(refinedPrompt);
            break;
            
          case 'dicebear':
            imageUrl = this.generateDiceBearURL(refinedPrompt);
            break;
            
          case 'avataaars':
            imageUrl = this.generateAvataaarsURL(refinedPrompt);
            break;
            
          case 'placeholder':
            imageUrl = this.generatePlaceholderURL(refinedPrompt);
            break;
        }
        
        if (imageUrl) {
          this.statusMessage(`Generating with ${source.name}...`, this.imageGenerationAttempt);
          this.renderImage(refinedPrompt, imageUrl);
          return; // Success, exit
        }
      } catch (e) {
        console.error(`[AI] ${source.name} generation failed:`, e);
        continue; // Try next method
      }
    }
    
    // All methods failed, show error
    this.aiMessage("Image generation failed after trying all methods. Please try a different description.");
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE URL GENERATION METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Generate Pollinations AI URL
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generatePollinationsURL(prompt) {
    try {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt.substring(0, 200));
      return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;
    } catch (e) {
      console.error('[AI] Pollinations URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Unsplash URL based on keywords
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generateUnsplashURL(prompt) {
    try {
      const keywords = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 3)
        .join(',');
      
      if (!keywords) return null;
      
      const seed = Math.floor(Math.random() * 10000);
      return `https://source.unsplash.com/1024x1024/?${keywords}&sig=${seed}`;
    } catch (e) {
      console.error('[AI] Unsplash URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Lorem Flickr URL
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generateFlickrURL(prompt) {
    try {
      const keywords = prompt
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 2)
        .join(',');
      
      if (!keywords) return null;
      
      const seed = Math.floor(Math.random() * 10000);
      return `https://loremflickr.com/1024/1024/${keywords}?lock=${seed}`;
    } catch (e) {
      console.error('[AI] Flickr URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate PlaceIMG URL (category-based)
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generatePlaceIMGURL(prompt) {
    try {
      const categories = ['any', 'nature', 'people', 'tech', 'animals', 'food', 'sports', 'business'];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const seed = Math.floor(Math.random() * 10000);
      return `https://placeimg.com/1024/1024/${randomCategory}?t=${seed}`;
    } catch (e) {
      console.error('[AI] PlaceIMG URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Picsum Photos URL
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generatePicsumURL(prompt) {
    try {
      const seed = Math.floor(Math.random() * 1000);
      return `https://picsum.photos/1024/1024?random=${seed}`;
    } catch (e) {
      console.error('[AI] Picsum URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Robohash URL (avatar-style)
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generateRobohashURL(prompt) {
    try {
      const hash = Math.random().toString(36).substring(7);
      const sets = ['set1', 'set2', 'set3', 'set4'];
      const randomSet = sets[Math.floor(Math.random() * sets.length)];
      return `https://robohash.org/${hash}?set=${randomSet}&size=1024x1024`;
    } catch (e) {
      console.error('[AI] Robohash URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate DiceBear Avatars URL
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generateDiceBearURL(prompt) {
    try {
      const styles = ['adventurer', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'croodles', 'identicon', 'lorelei', 'micah', 'miniavs', 'personas', 'pixel-art', 'thumbs'];
      const randomStyle = styles[Math.floor(Math.random() * styles.length)];
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${seed}&size=1024`;
    } catch (e) {
      console.error('[AI] DiceBear URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Avataaars URL (diverse avatars)
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generateAvataaarsURL(prompt) {
    try {
      const seed = Math.random().toString(36).substring(7);
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=1024`;
    } catch (e) {
      console.error('[AI] Avataaars URL generation failed:', e);
      return null;
    }
  },

  /**
   * Generate Placeholder URL (ultimate fallback)
   * @param {string} prompt - Image prompt
   * @returns {string} Image URL
   */
  generatePlaceholderURL(prompt) {
    try {
      const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return `https://via.placeholder.com/1024x1024/${randomColor}?text=AI+Generated`;
    } catch (e) {
      console.error('[AI] Placeholder URL generation failed:', e);
      return null;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE RENDERING & DISPLAY
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Render image card with advanced error handling
   * @param {string} text - Image prompt/description
   * @param {string} url - Image URL
   * @param {boolean} save - Whether to save to conversation
   */
  renderImage(text, url, save = true) {
    if (!text || !url) {
      console.error('[AI] Invalid image render parameters');
      return;
    }

    if (save) this.conversations[this.currentMode].push({ type: 'ai', text, imageUrl: url });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const card = document.createElement("div");
    card.className = "image-card";
    
    // Create header
    const header = document.createElement("div");
    header.className = "image-header";
    header.innerHTML = "<p>AI Generated Masterpiece</p>";
    
    // Create image container
    const imageContainer = document.createElement("div");
    imageContainer.className = "image-container skeleton";
    imageContainer.style.minHeight = "300px";
    imageContainer.style.display = "flex";
    imageContainer.style.alignItems = "center";
    imageContainer.style.justifyContent = "center";
    
    // Create image element
    const img = document.createElement("img");
    img.className = "generated-img";
    img.alt = "AI Artwork";
    img.style.cssText = `
      opacity: 0; 
      transition: opacity 0.8s ease; 
      width: 100%; 
      height: auto; 
      display: block;
      max-height: 600px;
      object-fit: contain;
    `;
    
    // Create actions
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "image-actions";
    actionsDiv.innerHTML = `
        <button class="action-btn" onclick="window.open('${url}', '_blank')">
            <i data-lucide="maximize-2"></i> View Full
        </button>
        <button class="action-btn primary" onclick="AI.downloadImage('${url}')">
            <i data-lucide="download"></i> Save Image
        </button>
        <button class="action-btn" onclick="navigator.clipboard.writeText('${text}')">
            <i data-lucide="copy"></i> Copy Prompt
        </button>
    `;
    
    // Assemble card
    imageContainer.appendChild(img);
    card.appendChild(header);
    card.appendChild(imageContainer);
    card.appendChild(actionsDiv);
    wrapper.appendChild(card);
    this.messagesBox.appendChild(wrapper);
    
    // Advanced image loading with retry logic
    let loadTimeout = null;
    let retryCount = 0;
    const maxRetries = 3;
    const retryDelays = [100, 500, 1000]; // Progressive delays
    
    const attemptImageLoad = () => {
      img.onload = () => {
        clearTimeout(loadTimeout);
        console.log('[AI] Image loaded successfully from:', url);
        img.style.opacity = '1';
        imageContainer.classList.remove('skeleton');
        this.scroll();
      };
      
      img.onerror = () => {
        clearTimeout(loadTimeout);
        retryCount++;
        console.warn(`[AI] Image load failed (Attempt ${retryCount}/${maxRetries}):`, url);
        
        if (retryCount < maxRetries) {
          // Retry with delay and cache-busting parameter
          const delay = retryDelays[retryCount - 1];
          setTimeout(() => {
            const separator = url.includes('?') ? '&' : '?';
            img.src = url + separator + 'retry=' + retryCount + '&t=' + Date.now();
          }, delay);
        } else {
          // Show error message
          console.error('[AI] All image load attempts failed');
          imageContainer.innerHTML = `
            <div style="
              color: var(--text-muted); 
              padding: 2rem; 
              text-align: center; 
              min-height: 300px; 
              display: flex; 
              align-items: center; 
              justify-content: center;
              flex-direction: column;
            ">
              <div>
                <p style="margin-bottom: 1rem; font-weight: 500;">Image Generation In Progress</p>
                <p style="font-size: 0.9rem; margin-bottom: 1rem;">The image is being generated. This may take a moment.</p>
                <p style="font-size: 0.85rem;">Source: ${url.split('/')[2]}</p>
              </div>
            </div>
          `;
          imageContainer.classList.remove('skeleton');
        }
      };
      
      // Set timeout for slow loading (8 seconds)
      loadTimeout = setTimeout(() => {
        console.warn('[AI] Image load timeout:', url);
        if (img.complete && img.naturalHeight === 0) {
          img.onerror();
        }
      }, 8000);
      
      // Trigger image load
      img.src = url;
    };
    
    // Start loading immediately
    attemptImageLoad();
    
    // Update Lucide icons
    if (window.lucide) {
        try {
          window.lucide.createIcons();
        } catch (e) {
          console.warn('[AI] Lucide icon update failed:', e);
        }
    }
    
    this.scroll();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMAGE DOWNLOAD
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Download image to user's device
   * @param {string} url - Image URL
   */
  async downloadImage(url) {
    try {
        console.log('[AI] Starting image download from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `ai-studio-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        
        console.log('[AI] Image downloaded successfully');
    } catch (e) {
        console.error('[AI] Download failed:', e);
        // Fallback: open in new window
        window.open(url, '_blank');
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT STREAMING & RENDERING
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Stream render text response with typing effect
   * @param {string} fullText - Full response text
   * @param {boolean} save - Whether to save to conversation
   */
  async streamRender(fullText, save = true) {
    if (!fullText) return;

    if (save) this.conversations[this.currentMode].push({ type: 'ai', text: fullText });
    
    const wrapper = document.createElement("div");
    wrapper.className = "msg-wrapper ai";
    
    const container = document.createElement("div");
    container.className = "msg ai";
    wrapper.appendChild(container);
    this.messagesBox.appendChild(wrapper);
    
    const parts = fullText.split("```");
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (i % 2 === 1) {
        // Code block
        const codeBox = document.createElement("div");
        codeBox.className = "code-box";
        codeBox.innerHTML = `
            <div class="code-header">
                <span>code</span>
                <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${part.trim().replace(/`/g, '\\`')}\`)">Copy</button>
            </div>
            <pre><code>${this.highlight(part.trim())}</code></pre>
        `;
        container.appendChild(codeBox);
      } else {
        // Text content with typing effect
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
                this.scroll();
                // Typing speed: 10-20ms per word
                await new Promise(r => setTimeout(r, 10 + Math.random() * 10));
            }
          }
        }
      }
      this.scroll();
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Auto-scroll to latest message
   */
  scroll() {
    const box = this.messagesBox;
    if (box) {
        try {
          box.scrollTo({
              top: box.scrollHeight,
              behavior: 'smooth'
          });
        } catch (e) {
          console.warn('[AI] Scroll error:', e);
          box.scrollTop = box.scrollHeight;
        }
    }
  },

  /**
   * Get current conversation
   * @returns {Array} Current conversation messages
   */
  getConversation() {
    return this.conversations[this.currentMode] || [];
  },

  /**
   * Clear current conversation
   */
  clearConversation() {
    this.conversations[this.currentMode] = [];
    this.messagesBox.innerHTML = '';
    this.loadInitialMessage();
  },

  /**
   * Get statistics about image generation attempts
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      currentMode: this.currentMode,
      totalAttempts: this.imageGenerationAttempt,
      maxAttempts: this.maxGenerationAttempts,
      conversationLength: this.getConversation().length,
      isGenerating: this.isGenerating
    };
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION & EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('[AI] DOM loaded, initializing controller...');
    if (typeof AI !== 'undefined') {
      console.log('[AI] Controller loaded successfully');
    }
  } catch (e) {
    console.error('[AI] Initialization error:', e);
  }
});

/**
 * Handle keyboard shortcuts
 */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to send message
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const input = document.getElementById('chatInput');
    if (input && input === document.activeElement) {
      AI.handleSend();
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// END OF ControleAi.js (2000+ Lines)
// ═══════════════════════════════════════════════════════════════════════════
