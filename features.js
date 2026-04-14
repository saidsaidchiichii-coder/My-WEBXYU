/* ==================== ADVANCED FEATURES STYLES ==================== */

/* ==================== GAMIFICATION UI ==================== */
.gamification-widget {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(29, 155, 240, 0.1);
    border: 1px solid rgba(29, 155, 240, 0.3);
    border-radius: 16px;
    padding: 16px;
    backdrop-filter: blur(10px);
    z-index: 50;
    min-width: 200px;
    animation: slideInRight 0.4s ease-out;
}

.gamification-widget.hidden {
    display: none;
}

.gamification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
}

.gamification-title {
    font-size: 14px;
    font-weight: 600;
    color: #e7e9ea;
}

.gamification-toggle {
    background: transparent;
    border: none;
    color: #71767b;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s;
}

.gamification-toggle:hover {
    color: #1d9bf0;
    transform: rotate(20deg);
}

.level-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1d9bf0, #1a7bc0);
    border-radius: 50%;
    font-weight: 700;
    font-size: 20px;
    color: white;
    box-shadow: 0 4px 12px rgba(29, 155, 240, 0.3);
    margin-bottom: 12px;
}

.points-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px;
}

.points-value {
    font-weight: 600;
    color: #1d9bf0;
}

.streak-display {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #71767b;
    margin-bottom: 12px;
}

.streak-flame {
    font-size: 16px;
    animation: flameFlicker 0.6s infinite;
}

@keyframes flameFlicker {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #1d9bf0, #71d5ff);
    border-radius: 3px;
    transition: width 0.3s ease;
    animation: progressPulse 1s infinite;
}

@keyframes progressPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
}

.level-up-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #1d9bf0, #1a7bc0);
    border-radius: 20px;
    padding: 40px;
    text-align: center;
    z-index: 1000;
    animation: levelUpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 20px 60px rgba(29, 155, 240, 0.4);
}

@keyframes levelUpPop {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
    }
    100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
    }
}

.level-up-content h2 {
    font-size: 32px;
    color: white;
    margin-bottom: 12px;
    animation: bounce 0.6s ease;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

.level-up-content p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.9);
}

/* ==================== PERSONALITY INDICATOR ==================== */
.personality-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(29, 155, 240, 0.1);
    border-radius: 12px;
    font-size: 12px;
    color: #71767b;
    margin-bottom: 12px;
}

.personality-emoji {
    font-size: 16px;
}

.personality-name {
    font-weight: 500;
    color: #e7e9ea;
}

/* ==================== BIAS DETECTION ALERT ==================== */
.bias-detection-alert {
    background: rgba(255, 193, 7, 0.1);
    border-left: 3px solid #ffc107;
    padding: 12px;
    border-radius: 8px;
    margin: 12px 0;
    animation: slideInLeft 0.3s ease-out;
}

.bias-detection-alert.error {
    background: rgba(244, 67, 54, 0.1);
    border-left-color: #f44336;
}

.bias-detection-alert.success {
    background: rgba(76, 175, 80, 0.1);
    border-left-color: #4caf50;
}

.bias-title {
    font-size: 12px;
    font-weight: 600;
    color: #ffc107;
    margin-bottom: 6px;
}

.bias-detection-alert.error .bias-title {
    color: #f44336;
}

.bias-detection-alert.success .bias-title {
    color: #4caf50;
}

.bias-message {
    font-size: 13px;
    color: #e7e9ea;
    line-height: 1.4;
}

/* ==================== DECISION MAKER UI ==================== */
.decision-maker {
    background: rgba(22, 24, 28, 0.8);
    border: 1px solid rgba(29, 155, 240, 0.3);
    border-radius: 16px;
    padding: 16px;
    margin: 12px 0;
    animation: slideIn 0.3s ease-out;
}

.decision-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
}

.decision-option {
    background: rgba(29, 155, 240, 0.05);
    border: 1px solid rgba(29, 155, 240, 0.2);
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 13px;
    color: #e7e9ea;
    text-align: center;
}

.decision-option:hover {
    background: rgba(29, 155, 240, 0.15);
    border-color: rgba(29, 155, 240, 0.5);
    transform: translateY(-2px);
}

.decision-option.selected {
    background: rgba(29, 155, 240, 0.3);
    border-color: #1d9bf0;
    box-shadow: 0 0 12px rgba(29, 155, 240, 0.3);
}

.decision-recommendation {
    background: rgba(76, 175, 80, 0.1);
    border-left: 3px solid #4caf50;
    padding: 12px;
    border-radius: 8px;
    font-size: 13px;
    color: #e7e9ea;
}

/* ==================== CRITICAL THINKING QUESTIONS ==================== */
.critical-thinking-section {
    background: rgba(22, 24, 28, 0.8);
    border: 1px solid rgba(29, 155, 240, 0.3);
    border-radius: 16px;
    padding: 16px;
    margin: 12px 0;
    animation: slideIn 0.3s ease-out;
}

.critical-thinking-title {
    font-size: 14px;
    font-weight: 600;
    color: #e7e9ea;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.question-item {
    background: rgba(29, 155, 240, 0.05);
    border-left: 3px solid #1d9bf0;
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 8px;
    font-size: 13px;
    color: #e7e9ea;
    line-height: 1.5;
    transition: all 0.3s ease;
}

.question-item:hover {
    background: rgba(29, 155, 240, 0.1);
    padding-left: 16px;
}

.question-number {
    display: inline-block;
    background: #1d9bf0;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    text-align: center;
    line-height: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-right: 8px;
}

/* ==================== PROBLEM SOLVING PLAN ==================== */
.problem-solving-plan {
    background: rgba(22, 24, 28, 0.8);
    border: 1px solid rgba(29, 155, 240, 0.3);
    border-radius: 16px;
    padding: 16px;
    margin: 12px 0;
    animation: slideIn 0.3s ease-out;
}

.plan-title {
    font-size: 14px;
    font-weight: 600;
    color: #e7e9ea;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.plan-steps {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.plan-step {
    background: rgba(29, 155, 240, 0.05);
    border-left: 3px solid #1d9bf0;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.plan-step:hover {
    background: rgba(29, 155, 240, 0.1);
    padding-left: 16px;
}

.step-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: #1d9bf0;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
}

.step-title {
    font-weight: 600;
    color: #e7e9ea;
    font-size: 13px;
}

.step-description {
    font-size: 12px;
    color: #71767b;
    margin-bottom: 6px;
}

.step-action {
    font-size: 12px;
    color: #1d9bf0;
    font-weight: 500;
}

/* ==================== RECORDING INDICATOR ==================== */
#recordingIndicator {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 68, 68, 0.2);
    border: 2px solid #ff4444;
    border-radius: 50px;
    padding: 12px 20px;
    display: none;
    align-items: center;
    gap: 12px;
    z-index: 100;
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        transform: translateX(-50%) translateY(-20px);
        opacity: 0;
    }
    to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
}

.recording-dot {
    width: 8px;
    height: 8px;
    background: #ff4444;
    border-radius: 50%;
    animation: recordingBlink 0.8s infinite;
}

@keyframes recordingBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}

.recording-text {
    font-size: 13px;
    color: #ff4444;
    font-weight: 600;
}

/* ==================== ANIMATIONS ==================== */
@keyframes slideInRight {
    from {
        transform: translateX(100px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideInLeft {
    from {
        transform: translateX(-20px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideIn {
    from {
        transform: translateY(10px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 640px) {
    .gamification-widget {
        bottom: 10px;
        right: 10px;
        min-width: 160px;
        padding: 12px;
    }

    .decision-options {
        grid-template-columns: 1fr;
    }

    .level-up-notification {
        padding: 30px;
        margin: 20px;
    }

    .level-up-content h2 {
        font-size: 24px;
    }

    .level-up-content p {
        font-size: 14px;
    }

    #recordingIndicator {
        padding: 10px 16px;
        font-size: 12px;
    }
}

/* ==================== DARK MODE SUPPORT ==================== */
@media (prefers-color-scheme: dark) {
    .gamification-widget {
        background: rgba(29, 155, 240, 0.08);
    }

    .decision-maker,
    .critical-thinking-section,
    .problem-solving-plan {
        background: rgba(22, 24, 28, 0.9);
    }
}

/* ==================== LANGUAGE SUPPORT ==================== */
.rtl {
    direction: rtl;
    text-align: right;
}

.rtl .gamification-header {
    flex-direction: row-reverse;
}

.rtl .bias-detection-alert {
    border-left: none;
    border-right: 3px solid #ffc107;
    padding-left: 0;
    padding-right: 12px;
}

.rtl .decision-option {
    text-align: center;
}

.rtl .plan-step {
    border-left: none;
    border-right: 3px solid #1d9bf0;
    padding-left: 0;
    padding-right: 12px;
}

.rtl .question-item {
    border-left: none;
    border-right: 3px solid #1d9bf0;
    padding-left: 0;
    padding-right: 12px;
}

/* ==================== ACCESSIBILITY ==================== */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
