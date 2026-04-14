/**
 * ============================================================================
 * 🔔 NOTIFICATION SYSTEM - ADVANCED ALERTS & USER NOTIFICATIONS
 * ============================================================================
 * 
 * This module provides:
 * 1. Toast notifications with animations
 * 2. Modal alerts and confirmations
 * 3. Progress notifications
 * 4. Usage tracking and reminders
 * 5. Scheduled notifications
 * 6. Notification history
 * 7. Sound and visual alerts
 * 8. Customizable notification themes
 * 
 * ============================================================================
 */

const NotificationSystem = {
  // ==================== CONFIGURATION ====================
  config: {
    notificationDelay: 3600000, // 1 hour in milliseconds
    storageKey: 'ai_usage_start_time',
    notificationShownKey: 'ai_notification_shown',
    trackingInterval: 5000, // 5 seconds
    maxNotifications: 10,
    notificationDuration: 5000, // 5 seconds default
    soundEnabled: true,
    animationsEnabled: true
  },

  // ==================== STATE ====================
  state: {
    usageStartTime: null,
    notificationShown: false,
    trackingActive: false,
    notifications: [],
    soundVolume: 0.5,
    theme: 'dark'
  },

  // ==================== NOTIFICATION TYPES ====================
  types: {
    success: {
      icon: '✅',
      color: '#4caf50',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
      borderColor: '#4caf50'
    },
    error: {
      icon: '❌',
      color: '#f44336',
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderColor: '#f44336'
    },
    warning: {
      icon: '⚠️',
      color: '#ff9800',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
      borderColor: '#ff9800'
    },
    info: {
      icon: 'ℹ️',
      color: '#2196f3',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      borderColor: '#2196f3'
    },
    achievement: {
      icon: '🏆',
      color: '#ffc107',
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderColor: '#ffc107'
    },
    milestone: {
      icon: '🎉',
      color: '#9c27b0',
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
      borderColor: '#9c27b0'
    }
  },

  // ==================== INITIALIZE ====================
  /**
   * Initialize notification system
   */
  init() {
    this.loadState();
    this.startTracking();
    this.setupStyles();
    this.setupEventListeners();
    console.log('🔔 Notification System Initialized');
  },

  // ==================== LOAD STATE ====================
  /**
   * Load state from localStorage
   */
  loadState() {
    try {
      const startTime = localStorage.getItem(this.config.storageKey);
      const notificationShown = localStorage.getItem(this.config.notificationShownKey);
      const theme = localStorage.getItem('notification_theme');
      const soundEnabled = localStorage.getItem('notification_sound');

      if (startTime) {
        this.state.usageStartTime = parseInt(startTime);
      } else {
        this.state.usageStartTime = Date.now();
        localStorage.setItem(this.config.storageKey, this.state.usageStartTime);
      }

      this.state.notificationShown = notificationShown === 'true';
      this.state.theme = theme || 'dark';
      this.state.soundEnabled = soundEnabled !== 'false';
    } catch (e) {
      console.error('Error loading notification state:', e);
    }
  },

  // ==================== SETUP EVENT LISTENERS ====================
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseTracking();
      } else {
        this.resumeTracking();
      }
    });

    // Listen for page unload
    window.addEventListener('beforeunload', () => {
      this.saveState();
    });
  },

  // ==================== START TRACKING ====================
  /**
   * Start usage tracking
   */
  startTracking() {
    if (this.state.trackingActive) return;

    this.state.trackingActive = true;

    this.trackingInterval = setInterval(() => {
      if (!this.state.notificationShown && this.state.usageStartTime) {
        const elapsed = Date.now() - this.state.usageStartTime;

        if (elapsed >= this.config.notificationDelay) {
          this.showUsageNotification();
          this.state.notificationShown = true;
          localStorage.setItem(this.config.notificationShownKey, 'true');
        }
      }
    }, this.config.trackingInterval);
  },

  // ==================== PAUSE TRACKING ====================
  /**
   * Pause tracking
   */
  pauseTracking() {
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.state.trackingActive = false;
    }
  },

  // ==================== RESUME TRACKING ====================
  /**
   * Resume tracking
   */
  resumeTracking() {
    if (!this.state.trackingActive) {
      this.startTracking();
    }
  },

  // ==================== SHOW USAGE NOTIFICATION ====================
  /**
   * Show usage milestone notification
   */
  showUsageNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification-container';
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">🔥</div>
        <div class="notification-text">
          <h3>أحسنت!</h3>
          <p>لقد استخدمت الذكاء الاصطناعي لمدة ساعة. استمر في التقدم!</p>
        </div>
        <button class="notification-close" onclick="NotificationSystem.closeNotification(this.parentElement.parentElement)">
          ✕
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        this.closeNotification(notification);
      }
    }, 8000);
  },

  // ==================== SHOW TOAST NOTIFICATION ====================
  /**
   * Show toast notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info, achievement, milestone)
   * @param {number} duration - Duration in milliseconds
   */
  showToast(message, type = 'info', duration = null) {
    const notificationType = this.types[type] || this.types.info;
    const notificationDuration = duration || this.config.notificationDuration;

    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.style.cssText = `
      background: ${notificationType.backgroundColor};
      border: 1px solid ${notificationType.borderColor};
      color: ${notificationType.color};
    `;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${notificationType.icon}</span>
        <span class="toast-message">${message}</span>
      </div>
    `;

    const container = document.getElementById('toast-container') || this.createToastContainer();
    container.appendChild(toast);

    // Add to notifications history
    this.state.notifications.push({
      message: message,
      type: type,
      timestamp: new Date().toISOString()
    });

    if (this.state.notifications.length > this.config.maxNotifications) {
      this.state.notifications.shift();
    }

    // Play sound if enabled
    if (this.state.soundEnabled) {
      this.playNotificationSound(type);
    }

    // Auto-remove
    setTimeout(() => {
      toast.classList.add('toast-closing');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, notificationDuration);

    return toast;
  },

  // ==================== SHOW MODAL ALERT ====================
  /**
   * Show modal alert
   * @param {string} title - Alert title
   * @param {string} message - Alert message
   * @param {string} type - Alert type
   * @param {array} buttons - Action buttons
   */
  showAlert(title, message, type = 'info', buttons = null) {
    const notificationType = this.types[type] || this.types.info;

    const modal = document.createElement('div');
    modal.className = 'notification-modal';
    modal.innerHTML = `
      <div class="notification-modal-backdrop"></div>
      <div class="notification-modal-content">
        <div class="notification-modal-header">
          <span class="notification-modal-icon">${notificationType.icon}</span>
          <h2>${title}</h2>
          <button class="notification-modal-close" onclick="this.closest('.notification-modal').remove()">✕</button>
        </div>
        <div class="notification-modal-body">
          <p>${message}</p>
        </div>
        <div class="notification-modal-footer">
          ${buttons ? buttons.map(btn => `
            <button class="notification-modal-btn notification-modal-btn-${btn.type || 'default'}" onclick="${btn.action}">
              ${btn.label}
            </button>
          `).join('') : `
            <button class="notification-modal-btn notification-modal-btn-default" onclick="this.closest('.notification-modal').remove()">
              حسناً
            </button>
          `}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    return modal;
  },

  // ==================== SHOW PROGRESS NOTIFICATION ====================
  /**
   * Show progress notification
   * @param {string} message - Progress message
   * @param {number} progress - Progress percentage (0-100)
   */
  showProgress(message, progress = 0) {
    let progressNotif = document.getElementById('progress-notification');

    if (!progressNotif) {
      progressNotif = document.createElement('div');
      progressNotif.id = 'progress-notification';
      progressNotif.className = 'progress-notification';
      progressNotif.innerHTML = `
        <div class="progress-content">
          <div class="progress-message"></div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill"></div>
          </div>
          <div class="progress-percentage">0%</div>
        </div>
      `;
      document.body.appendChild(progressNotif);
    }

    progressNotif.querySelector('.progress-message').textContent = message;
    progressNotif.querySelector('.progress-bar-fill').style.width = progress + '%';
    progressNotif.querySelector('.progress-percentage').textContent = progress + '%';

    if (progress >= 100) {
      setTimeout(() => {
        progressNotif.classList.add('progress-closing');
        setTimeout(() => {
          if (progressNotif.parentElement) {
            progressNotif.remove();
          }
        }, 300);
      }, 500);
    }

    return progressNotif;
  },

  // ==================== CLOSE NOTIFICATION ====================
  /**
   * Close notification
   * @param {element} element - Notification element
   */
  closeNotification(element) {
    if (element) {
      element.classList.add('notification-closing');
      setTimeout(() => {
        if (element.parentElement) {
          element.remove();
        }
      }, 400);
    }
  },

  // ==================== CREATE TOAST CONTAINER ====================
  /**
   * Create toast container
   * @returns {element} - Toast container
   */
  createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
  },

  // ==================== PLAY NOTIFICATION SOUND ====================
  /**
   * Play notification sound
   * @param {string} type - Sound type
   */
  playNotificationSound(type = 'info') {
    if (!this.state.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different notification types
      const frequencies = {
        success: 800,
        error: 300,
        warning: 600,
        info: 500,
        achievement: 1000,
        milestone: 1200
      };

      oscillator.frequency.value = frequencies[type] || 500;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.error('Error playing notification sound:', e);
    }
  },

  // ==================== RESET TRACKING ====================
  /**
   * Reset usage tracking
   */
  resetTracking() {
    this.state.usageStartTime = Date.now();
    this.state.notificationShown = false;
    localStorage.setItem(this.config.storageKey, this.state.usageStartTime);
    localStorage.removeItem(this.config.notificationShownKey);
  },

  // ==================== SAVE STATE ====================
  /**
   * Save state to localStorage
   */
  saveState() {
    try {
      localStorage.setItem('notification_theme', this.state.theme);
      localStorage.setItem('notification_sound', this.state.soundEnabled);
    } catch (e) {
      console.error('Error saving notification state:', e);
    }
  },

  // ==================== GET NOTIFICATION HISTORY ====================
  /**
   * Get notification history
   * @param {number} limit - Number of notifications to return
   * @returns {array} - Notification history
   */
  getHistory(limit = 10) {
    return this.state.notifications.slice(-limit);
  },

  // ==================== CLEAR NOTIFICATION HISTORY ====================
  /**
   * Clear notification history
   */
  clearHistory() {
    this.state.notifications = [];
  },

  // ==================== SETUP STYLES ====================
  /**
   * Setup CSS styles for notifications
   */
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ==================== TOAST NOTIFICATIONS ==================== */
      .toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      }

      .toast-notification {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        border-left: 3px solid;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .toast-content {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .toast-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .toast-message {
        font-size: 14px;
        line-height: 1.4;
      }

      .toast-closing {
        animation: slideOutRight 0.3s ease-out forwards;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      /* ==================== MODAL NOTIFICATIONS ==================== */
      .notification-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
      }

      .notification-modal-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
      }

      .notification-modal-content {
        position: relative;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        animation: scaleIn 0.3s ease-out;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .notification-modal-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .notification-modal-icon {
        font-size: 24px;
      }

      .notification-modal-header h2 {
        margin: 0;
        flex: 1;
        font-size: 18px;
        color: #fff;
      }

      .notification-modal-close {
        background: none;
        border: none;
        color: #999;
        font-size: 24px;
        cursor: pointer;
        transition: color 0.2s;
      }

      .notification-modal-close:hover {
        color: #fff;
      }

      .notification-modal-body {
        padding: 20px;
        color: #ccc;
        line-height: 1.6;
      }

      .notification-modal-footer {
        display: flex;
        gap: 10px;
        padding: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        justify-content: flex-end;
      }

      .notification-modal-btn {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }

      .notification-modal-btn-default {
        background: #1d9bf0;
        color: white;
      }

      .notification-modal-btn-default:hover {
        background: #1a8cd8;
      }

      .notification-modal-btn-danger {
        background: #f44336;
        color: white;
      }

      .notification-modal-btn-danger:hover {
        background: #da190b;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes scaleIn {
        from {
          transform: scale(0.9);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      /* ==================== PROGRESS NOTIFICATION ==================== */
      .progress-notification {
        position: fixed;
        bottom: 30px;
        left: 30px;
        background: rgba(29, 155, 240, 0.1);
        border: 1px solid rgba(29, 155, 240, 0.3);
        border-radius: 12px;
        padding: 16px;
        min-width: 300px;
        z-index: 9000;
        backdrop-filter: blur(10px);
        animation: slideInLeft 0.3s ease-out;
      }

      .progress-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .progress-message {
        font-size: 14px;
        color: #e7e9ea;
        font-weight: 500;
      }

      .progress-bar-container {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
      }

      .progress-bar-fill {
        height: 100%;
        background: linear-gradient(90deg, #1d9bf0, #71d5ff);
        border-radius: 3px;
        transition: width 0.3s ease;
      }

      .progress-percentage {
        font-size: 12px;
        color: #71767b;
        text-align: right;
      }

      .progress-closing {
        animation: slideOutLeft 0.3s ease-out forwards;
      }

      @keyframes slideInLeft {
        from {
          transform: translateX(-400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutLeft {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(-400px);
          opacity: 0;
        }
      }

      /* ==================== ORIGINAL NOTIFICATION STYLES ==================== */
      .notification-container {
        position: fixed;
        bottom: 30px;
        right: 30px;
        z-index: 10000;
        animation: slideInNotification 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .notification-content {
        background: linear-gradient(135deg, #ff0000, #00ff00, #0000ff, #ff0000);
        background-size: 300% 300%;
        animation: rgbGradient 3s ease infinite;
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        min-width: 320px;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255, 255, 255, 0.2);
        position: relative;
        overflow: hidden;
      }

      .notification-content::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        animation: shimmerNotification 2s infinite;
        pointer-events: none;
      }

      .notification-icon {
        font-size: 32px;
        animation: bounceIcon 0.8s ease-in-out infinite;
        z-index: 1;
      }

      .notification-text {
        flex: 1;
        color: white;
        z-index: 1;
      }

      .notification-text h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 4px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .notification-text p {
        margin: 0;
        font-size: 14px;
        opacity: 0.95;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      }

      .notification-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        z-index: 1;
        flex-shrink: 0;
      }

      .notification-close:hover {
        background: rgba(255, 255, 255, 0.4);
        transform: scale(1.1) rotate(90deg);
      }

      .notification-closing {
        animation: slideOutNotification 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      @keyframes slideInNotification {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOutNotification {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }

      @keyframes rgbGradient {
        0% { background-position: 0% 50%; }
        25% { background-position: 50% 100%; }
        50% { background-position: 100% 50%; }
        75% { background-position: 50% 0%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes bounceIcon {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }

      @keyframes shimmerNotification {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }

      /* ==================== RESPONSIVE ==================== */
      @media (max-width: 640px) {
        .toast-container {
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .notification-container {
          bottom: 20px;
          right: 20px;
          left: 20px;
        }

        .notification-content {
          min-width: auto;
          flex-direction: column;
          text-align: center;
        }

        .notification-modal-content {
          width: 95%;
        }

        .progress-notification {
          bottom: 20px;
          left: 20px;
          right: 20px;
          min-width: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    NotificationSystem.init();
  }, 500);
});

console.log('🔔 Notification System Loaded');
