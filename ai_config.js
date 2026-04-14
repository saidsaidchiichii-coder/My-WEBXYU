/**
 * ============================================================================
 * ✨ FEATURES - ADVANCED FUNCTIONALITY & UTILITY FUNCTIONS
 * ============================================================================
 * 
 * This module provides:
 * 1. File upload and preview
 * 2. Image analysis
 * 3. Voice recording and playback
 * 4. Keyboard shortcuts
 * 5. Search functionality
 * 6. Theme management
 * 7. Settings panel
 * 8. Advanced utilities
 * 
 * ============================================================================
 */

// ==================== FILE UPLOAD SYSTEM ====================
/**
 * Setup file upload functionality
 * @param {string} inputId - File input element ID
 * @param {string} previewId - Preview container element ID
 */
function setupFileUpload(inputId, previewId) {
  const fileInput = document.getElementById(inputId);
  const previewContainer = document.getElementById(previewId);

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    previewContainer.innerHTML = '';

    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.createElement('div');
          preview.className = 'file-preview-item';
          preview.innerHTML = `
            <img src="${event.target.result}" alt="${file.name}" class="preview-image">
            <div class="preview-info">
              <span class="preview-name">${file.name}</span>
              <span class="preview-size">${(file.size / 1024).toFixed(2)} KB</span>
            </div>
            <button class="preview-remove" onclick="removeFilePreview(this, '${inputId}', ${index})">✕</button>
          `;
          previewContainer.appendChild(preview);
        };
        reader.readAsDataURL(file);
      } else {
        const preview = document.createElement('div');
        preview.className = 'file-preview-item file-preview-document';
        preview.innerHTML = `
          <div class="preview-icon">📄</div>
          <div class="preview-info">
            <span class="preview-name">${file.name}</span>
            <span class="preview-size">${(file.size / 1024).toFixed(2)} KB</span>
          </div>
          <button class="preview-remove" onclick="removeFilePreview(this, '${inputId}', ${index})">✕</button>
        `;
        previewContainer.appendChild(preview);
      }
    });
  });
}

/**
 * Remove file preview
 * @param {element} element - Remove button element
 * @param {string} inputId - File input element ID
 * @param {number} index - File index
 */
function removeFilePreview(element, inputId, index) {
  element.closest('.file-preview-item').remove();
  
  const fileInput = document.getElementById(inputId);
  const dataTransfer = new DataTransfer();
  const files = Array.from(fileInput.files);
  
  files.forEach((file, i) => {
    if (i !== index) {
      dataTransfer.items.add(file);
    }
  });
  
  fileInput.files = dataTransfer.files;
}

// ==================== KEYBOARD SHORTCUTS ====================
/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Enter to send message
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      const activeInput = document.activeElement;
      if (activeInput && (activeInput.id === 'chatInput' || activeInput.id === 'homeInput')) {
        if (activeInput.id === 'homeInput') {
          startChat();
        } else {
          send();
        }
      }
    }

    // Ctrl+K to focus search
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.focus();
    }

    // Ctrl+L to clear chat
    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      if (confirm('Clear all messages?')) {
        document.getElementById('messages').innerHTML = '';
      }
    }

    // Ctrl+D for dictation
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      if (typeof AI !== 'undefined' && AI.toggleMic) {
        AI.toggleMic();
      }
    }

    // Escape to close modals
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal, .mode-menu');
      modals.forEach(modal => modal.remove());
    }
  });
}

// ==================== THEME MANAGEMENT ====================
/**
 * Theme manager
 */
const ThemeManager = {
  // ==================== CONFIGURATION ====================
  config: {
    storageKey: 'ai_theme',
    defaultTheme: 'dark'
  },

  // ==================== THEMES ====================
  themes: {
    dark: {
      name: 'Dark',
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        primary: '#1d9bf0',
        secondary: '#71767b',
        text: '#e7e9ea',
        textSecondary: '#71767b',
        border: 'rgba(255, 255, 255, 0.1)',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800'
      }
    },
    light: {
      name: 'Light',
      colors: {
        background: '#ffffff',
        surface: '#f5f5f5',
        primary: '#1d9bf0',
        secondary: '#657786',
        text: '#0f1419',
        textSecondary: '#657786',
        border: 'rgba(0, 0, 0, 0.1)',
        error: '#f44336',
        success: '#4caf50',
        warning: '#ff9800'
      }
    },
    midnight: {
      name: 'Midnight',
      colors: {
        background: '#0a0e27',
        surface: '#16213e',
        primary: '#00d4ff',
        secondary: '#6c757d',
        text: '#e0e0e0',
        textSecondary: '#9ca3af',
        border: 'rgba(0, 212, 255, 0.1)',
        error: '#ff6b6b',
        success: '#51cf66',
        warning: '#ffd93d'
      }
    },
    ocean: {
      name: 'Ocean',
      colors: {
        background: '#0d1b2a',
        surface: '#1b263b',
        primary: '#415a77',
        secondary: '#778da9',
        text: '#e0e1dd',
        textSecondary: '#a8dadc',
        border: 'rgba(168, 218, 220, 0.1)',
        error: '#e63946',
        success: '#06d6a0',
        warning: '#f4a261'
      }
    }
  },

  // ==================== INITIALIZE ====================
  init() {
    this.loadTheme();
    this.setupThemeSelector();
  },

  // ==================== LOAD THEME ====================
  loadTheme() {
    const saved = localStorage.getItem(this.config.storageKey);
    const theme = saved || this.config.defaultTheme;
    this.applyTheme(theme);
  },

  // ==================== APPLY THEME ====================
  applyTheme(themeName) {
    const theme = this.themes[themeName];
    if (!theme) return;

    const root = document.documentElement;
    const colors = theme.colors;

    root.style.setProperty('--bg-primary', colors.background);
    root.style.setProperty('--bg-secondary', colors.surface);
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--color-error', colors.error);
    root.style.setProperty('--color-success', colors.success);
    root.style.setProperty('--color-warning', colors.warning);

    localStorage.setItem(this.config.storageKey, themeName);
    document.body.setAttribute('data-theme', themeName);
  },

  // ==================== SETUP THEME SELECTOR ====================
  setupThemeSelector() {
    const selector = document.querySelector('.theme-selector');
    if (!selector) return;

    Object.keys(this.themes).forEach(themeName => {
      const option = document.createElement('div');
      option.className = 'theme-option';
      option.textContent = this.themes[themeName].name;
      option.onclick = () => this.applyTheme(themeName);
      selector.appendChild(option);
    });
  },

  // ==================== TOGGLE THEME ====================
  toggleTheme() {
    const current = localStorage.getItem(this.config.storageKey) || this.config.defaultTheme;
    const themes = Object.keys(this.themes);
    const nextIndex = (themes.indexOf(current) + 1) % themes.length;
    this.applyTheme(themes[nextIndex]);
  }
};

// ==================== SETTINGS PANEL ====================
/**
 * Settings panel manager
 */
const SettingsPanel = {
  // ==================== STATE ====================
  isOpen: false,

  // ==================== INITIALIZE ====================
  init() {
    this.setupSettingsButton();
    this.createSettingsPanel();
  },

  // ==================== SETUP SETTINGS BUTTON ====================
  setupSettingsButton() {
    const settingsBtn = document.getElementById('settingsTrigger');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.toggle());
    }
  },

  // ==================== CREATE SETTINGS PANEL ====================
  createSettingsPanel() {
    const panel = document.createElement('div');
    panel.id = 'settings-panel';
    panel.className = 'settings-panel';
    panel.innerHTML = `
      <div class="settings-header">
        <h2>Settings</h2>
        <button class="settings-close" onclick="SettingsPanel.close()">✕</button>
      </div>
      <div class="settings-content">
        <div class="settings-section">
          <h3>Appearance</h3>
          <div class="settings-option">
            <label>Theme</label>
            <select onchange="ThemeManager.applyTheme(this.value)">
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="midnight">Midnight</option>
              <option value="ocean">Ocean</option>
            </select>
          </div>
          <div class="settings-option">
            <label>
              <input type="checkbox" id="animations-toggle" checked onchange="toggleAnimations()">
              Enable Animations
            </label>
          </div>
          <div class="settings-option">
            <label>
              <input type="checkbox" id="sound-toggle" checked onchange="toggleSound()">
              Enable Sound
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Features</h3>
          <div class="settings-option">
            <label>
              <input type="checkbox" id="emoji-toggle" checked onchange="toggleEmoji()">
              Emoji Injection
            </label>
          </div>
          <div class="settings-option">
            <label>
              <input type="checkbox" id="syntax-toggle" checked onchange="toggleSyntax()">
              Syntax Highlighting
            </label>
          </div>
          <div class="settings-option">
            <label>
              <input type="checkbox" id="voice-toggle" checked onchange="toggleVoice()">
              Voice Support
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h3>Language</h3>
          <div class="settings-option">
            <label>Language</label>
            <select onchange="changeLanguage(this.value)">
              <option value="english">English</option>
              <option value="arabic">العربية</option>
              <option value="darija">الدارجة</option>
              <option value="french">Français</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>Data</h3>
          <button class="settings-btn" onclick="exportData()">Export Data</button>
          <button class="settings-btn" onclick="clearData()">Clear All Data</button>
        </div>
      </div>
    `;
    document.body.appendChild(panel);
  },

  // ==================== TOGGLE PANEL ====================
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  },

  // ==================== OPEN PANEL ====================
  open() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
      panel.classList.add('open');
      this.isOpen = true;
    }
  },

  // ==================== CLOSE PANEL ====================
  close() {
    const panel = document.getElementById('settings-panel');
    if (panel) {
      panel.classList.remove('open');
      this.isOpen = false;
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================
/**
 * Toggle animations
 */
function toggleAnimations() {
  if (typeof AI !== 'undefined' && AI.features) {
    AI.features.animationsEnabled = !AI.features.animationsEnabled;
    AI.saveUserProfile();
  }
}

/**
 * Toggle sound
 */
function toggleSound() {
  if (typeof NotificationSystem !== 'undefined') {
    NotificationSystem.state.soundEnabled = !NotificationSystem.state.soundEnabled;
    NotificationSystem.saveState();
  }
}

/**
 * Toggle emoji injection
 */
function toggleEmoji() {
  if (typeof AI !== 'undefined' && AI.features) {
    AI.features.emojiInjection = !AI.features.emojiInjection;
    AI.saveConfiguration();
  }
}

/**
 * Toggle syntax highlighting
 */
function toggleSyntax() {
  if (typeof AI !== 'undefined' && AI.features) {
    AI.features.syntaxHighlighting = !AI.features.syntaxHighlighting;
    AI.saveConfiguration();
  }
}

/**
 * Toggle voice support
 */
function toggleVoice() {
  if (typeof AI !== 'undefined' && AI.features) {
    AI.features.voiceSupport = !AI.features.voiceSupport;
    AI.saveConfiguration();
  }
}

/**
 * Change language
 * @param {string} language - Language code
 */
function changeLanguage(language) {
  if (typeof AI !== 'undefined' && AI.switchLanguage) {
    AI.switchLanguage(language);
  }
}

/**
 * Export data
 */
function exportData() {
  const data = {
    userProfile: localStorage.getItem('aiUserProfile'),
    gamification: localStorage.getItem('aiGamification'),
    config: localStorage.getItem('ai_config'),
    theme: localStorage.getItem('ai_theme'),
    conversationHistory: localStorage.getItem('ai_conversation_history')
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Clear all data
 */
function clearData() {
  if (confirm('Are you sure? This will clear all data permanently.')) {
    localStorage.clear();
    location.reload();
  }
}

// ==================== SEARCH FUNCTIONALITY ====================
/**
 * Search in messages
 * @param {string} query - Search query
 */
function searchMessages(query) {
  const messages = document.querySelectorAll('.msg');
  let results = [];

  messages.forEach((msg, index) => {
    if (msg.textContent.toLowerCase().includes(query.toLowerCase())) {
      results.push({ index, element: msg });
      msg.classList.add('search-highlight');
    } else {
      msg.classList.remove('search-highlight');
    }
  });

  return results;
}

/**
 * Clear search highlights
 */
function clearSearchHighlights() {
  document.querySelectorAll('.msg.search-highlight').forEach(msg => {
    msg.classList.remove('search-highlight');
  });
}

// ==================== INITIALIZATION ====================
/**
 * Initialize all features on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Setup keyboard shortcuts
  setupKeyboardShortcuts();

  // Initialize theme manager
  ThemeManager.init();

  // Initialize settings panel
  SettingsPanel.init();

  // Setup file uploads
  setupFileUpload('homeFileInput', 'homeFilePreview');
  setupFileUpload('chatFileInput', 'chatFilePreview');

  console.log('✨ Features Module Loaded');
  console.log('🎮 Keyboard Shortcuts: Ctrl+Enter (send), Ctrl+K (search), Ctrl+L (clear), Ctrl+D (dictate), Esc (close)');
});

console.log('✨ Features System Initialized');
