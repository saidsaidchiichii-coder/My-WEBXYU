/**
 * 🔔 NOTIFICATION SYSTEM
 * نظام الإشعارات مع RGB Animation
 */

const NotificationSystem = {
  // ==================== CONFIGURATION ====================
  config: {
    notificationDelay: 3600000, // ساعة واحدة بالميلي ثانية
    storageKey: 'ai_usage_start_time',
    notificationShownKey: 'ai_notification_shown',
    trackingInterval: 5000 // تحديث التتبع كل 5 ثواني
  },

  // ==================== STATE ====================
  state: {
    usageStartTime: null,
    notificationShown: false,
    trackingActive: false
  },

  // ==================== INITIALIZE ====================
  init() {
    this.loadState();
    this.startTracking();
    this.setupStyles();
  },

  // ==================== LOAD STATE ====================
  loadState() {
    const startTime = localStorage.getItem(this.config.storageKey);
    const notificationShown = localStorage.getItem(this.config.notificationShownKey);

    if (startTime) {
      this.state.usageStartTime = parseInt(startTime);
    } else {
      this.state.usageStartTime = Date.now();
      localStorage.setItem(this.config.storageKey, this.state.usageStartTime);
    }

    this.state.notificationShown = notificationShown === 'true';
  },

  // ==================== START TRACKING ====================
  startTracking() {
    if (this.state.trackingActive) return;

    this.state.trackingActive = true;

    setInterval(() => {
      if (!this.state.notificationShown && this.state.usageStartTime) {
        const elapsed = Date.now() - this.state.usageStartTime;

        if (elapsed >= this.config.notificationDelay) {
          this.showNotification();
          this.state.notificationShown = true;
          localStorage.setItem(this.config.notificationShownKey, 'true');
        }
      }
    }, this.config.trackingInterval);
  },

  // ==================== SHOW NOTIFICATION ====================
  showNotification() {
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

    // إزالة تلقائية بعد 8 ثواني
    setTimeout(() => {
      if (notification.parentElement) {
        this.closeNotification(notification);
      }
    }, 8000);
  },

  // ==================== CLOSE NOTIFICATION ====================
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

  // ==================== RESET TRACKING ====================
  resetTracking() {
    this.state.usageStartTime = Date.now();
    this.state.notificationShown = false;
    localStorage.setItem(this.config.storageKey, this.state.usageStartTime);
    localStorage.removeItem(this.config.notificationShownKey);
  },

  // ==================== SETUP STYLES ====================
  setupStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* ==================== NOTIFICATION STYLES ==================== */
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

      /* ==================== ANIMATIONS ==================== */
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
        0% {
          background-position: 0% 50%;
        }
        25% {
          background-position: 50% 100%;
        }
        50% {
          background-position: 100% 50%;
        }
        75% {
          background-position: 50% 0%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes bounceIcon {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-10px);
        }
      }

      @keyframes shimmerNotification {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }

      /* ==================== RESPONSIVE ==================== */
      @media (max-width: 640px) {
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

        .notification-text {
          order: 2;
        }

        .notification-icon {
          order: 1;
          font-size: 28px;
        }

        .notification-close {
          order: 3;
          position: absolute;
          top: 10px;
          right: 10px;
        }
      }
    `;

    document.head.appendChild(style);
  }
};

// تهيئة النظام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    NotificationSystem.init();
  }, 500);
});
