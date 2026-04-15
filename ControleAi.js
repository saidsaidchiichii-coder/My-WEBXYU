/**
 * ControleAi.js - Robust AI Chat & Image Generation Controller
 * Features: Multiple image generation methods, advanced fallback system, error handling
 * Lines: 500+
 */

const AI = {
  messagesBox: null,
  API_URL: '/api/chat',
  currentMode: 'chat', // 'chat' or 'image'
  imageGenerationAttempt: 0,
  maxGenerationAttempts: 5,
  
  conversations: {
    chat: [],
    image: []
  },

  // Image generation methods in priority order
  imageSources: [
    { name: 'DALLE3', method: 'dalle3' },
    { name: 'Pollinations', method: 'pollinations' },
    { name: 'Unsplash', method: 'unsplash' },
    { name: 'Lorem Flickr', method: 'flickr' },
    { name: 'PlaceIMG', method: 'placeimg' }
  ],

  /* =========================
     🎨 SYNTAX HIGHLIGHT
  ========================= */
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

  /**
   * Initialize AI controller
   */
  init(boxId) {
    this.messagesBox = document.getElementById(boxId);
    if (this.messagesBox) {
      this.loadInitialMessage();
    } else {
      console.error('Message box element not found:', boxId);
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

  /**
   * Switch between chat and image modes
   */
  setMode(mode) {
    if (this.currentMode === mode) return;

    this.currentMode = mode;
    this.messagesBox.innerHTML = '';
    this.imageGenerationAttempt = 0;
    
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.placeholder = mode === 'image' ? "What image do you want to create?" : "How can I help you today?";
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        const isImageBtn = btn.innerText.toLowerCase().includes('imagine');
        const isChatBtn = btn.innerText.toLowerCase().includes('chat');
        
        if ((mode === 'image' && isImageBtn) || (mode === 'chat' && isChatBtn)) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

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

  /**
   * Display user message
   */
  user(text, save = true) {
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
   */
  aiMessage(text, save = true) {
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
   * Display thinking animation
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
   * Handle send button click
   */
  handleSend() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (text) {
        this.user(text);
        input.value = '';
        this.ask(text);
    }
  },

  /**
   * Send message to backend API
   */
  async ask(message) {
    const load = this.thinking();

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, mode: this.currentMode })
      });

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
          this.aiMessage("DALL-E 3 unavailable. Trying alternative image generators...");
          this.generateImageWithFallbacks(refinedPrompt, message);
        }
      } else if (data.reply) {
        // Chat mode
        this.streamRender(data.reply);
      } else {
        this.aiMessage("The AI returned an empty response.");
      }
    } catch (e) {
      load.remove();
      console.error('API Error:', e);
      this.aiMessage("System Error: Could not connect to the backend server. Trying offline image generation...");
      if (this.currentMode === 'image') {
        this.generateImageWithFallbacks(message, message);
      }
    }
  },

  /**
   * Generate image using multiple fallback methods
   */
  async generateImageWithFallbacks(refinedPrompt, originalPrompt) {
    this.imageGenerationAttempt = 0;
    
    for (let i = 0; i < this.imageSources.length; i++) {
      const source = this.imageSources[i];
      this.imageGenerationAttempt++;
      
      try {
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
        }
        
        if (imageUrl) {
          this.aiMessage(`Generating with ${source.name}...`);
          this.renderImage(refinedPrompt, imageUrl);
          return; // Success, exit
        }
      } catch (e) {
        console.error(`${source.name} generation failed:`, e);
        continue; // Try next method
      }
    }
    
    // All methods failed, show error
    this.aiMessage("Image generation failed. Please try a different description.");
  },

  /**
   * Generate Pollinations AI URL
   */
  generatePollinationsURL(prompt) {
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;
  },

  /**
   * Generate Unsplash URL based on keywords
   */
  generateUnsplashURL(prompt) {
    // Extract keywords from prompt
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
  },

  /**
   * Generate Lorem Flickr URL
   */
  generateFlickrURL(prompt) {
    // Extract main keyword
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
  },

  /**
   * Generate PlaceIMG URL (category-based)
   */
  generatePlaceIMGURL(prompt) {
    const categories = ['any', 'nature', 'people', 'tech', 'animals'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const seed = Math.floor(Math.random() * 10000);
    return `https://placeimg.com/1024/1024/${randomCategory}?t=${seed}`;
  },

  /**
   * Render image card with advanced error handling
   */
  renderImage(text, url, save = true) {
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
    
    // Create image element
    const img = document.createElement("img");
    img.className = "generated-img";
    img.alt = "AI Artwork";
    img.style.cssText = "opacity: 0; transition: opacity 0.8s ease; width: 100%; height: auto; display: block;";
    
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
    
    // Load image with timeout and retry logic
    let loadTimeout = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptImageLoad = () => {
      img.onload = () => {
        clearTimeout(loadTimeout);
        img.style.opacity = '1';
        imageContainer.classList.remove('skeleton');
        this.scroll();
      };
      
      img.onerror = () => {
        clearTimeout(loadTimeout);
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Retry with different URL parameter
          const separator = url.includes('?') ? '&' : '?';
          img.src = url + separator + 'retry=' + retryCount + '&t=' + Date.now();
        } else {
          // Show error message
          imageContainer.innerHTML = `
            <div style="color: var(--text-muted); padding: 2rem; text-align: center; min-height: 300px; display: flex; align-items: center; justify-content: center;">
              <div>
                <p style="margin-bottom: 1rem;">Image generation in progress or temporarily unavailable.</p>
                <p style="font-size: 0.9rem;">Try refreshing or use a different description.</p>
              </div>
            </div>
          `;
          imageContainer.classList.remove('skeleton');
        }
      };
      
      // Set timeout for slow loading
      loadTimeout = setTimeout(() => {
        if (img.complete && img.naturalHeight === 0) {
          img.onerror();
        }
      }, 8000);
      
      img.src = url;
    };
    
    // Start loading
    attemptImageLoad();
    
    if (window.lucide) {
        window.lucide.createIcons();
    }
    
    this.scroll();
  },

  /**
   * Download image to user's device
   */
  async downloadImage(url) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `ai-studio-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        console.error('Download failed:', e);
        window.open(url, '_blank');
    }
  },

  /**
   * Stream render text response with typing effect
   */
  async streamRender(fullText, save = true) {
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
        // Text content
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
                await new Promise(r => setTimeout(r, 10 + Math.random() * 10));
            }
          }
        }
      }
      this.scroll();
    }
  },

  /**
   * Auto-scroll to latest message
   */
  scroll() {
    const box = this.messagesBox;
    if (box) {
        box.scrollTo({
            top: box.scrollHeight,
            behavior: 'smooth'
        });
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AI !== 'undefined') {
    console.log('AI Controller loaded successfully');
  }
});
