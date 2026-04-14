/**
 * 🔗 AI INTEGRATION LAYER
 * Connects AIAdvanced with existing ControleAi system
 * No changes to original code - just extensions
 */

// Store original AI object
const OriginalAI = AI;

// Extend AI object with advanced features
Object.assign(AI, {
  advanced: AIAdvanced,
  
  // ==================== ENHANCED ASK METHOD ====================
  async askEnhanced(message) {
    // Learn from this conversation
    this.advanced.learnFromConversation(message, '');
    
    // Detect bias before sending
    const biases = this.advanced.detectBias(message);
    if (biases.length > 0) {
      const corrections = this.advanced.generateBiasCorrection(biases);
      this.showBiasAlert(corrections);
    }
    
    // Check if this is a decision request
    if (this.isDecisionRequest(message)) {
      return this.handleDecision(message);
    }
    
    // Check if this is a problem-solving request
    if (this.isProblemSolvingRequest(message)) {
      return this.handleProblemSolving(message);
    }
    
    // Check if this is a critical thinking request
    if (this.isCriticalThinkingRequest(message)) {
      return this.handleCriticalThinking(message);
    }
    
    // Regular ask with personality
    return this.ask(message);
  },

  // ==================== DECISION HANDLING ====================
  isDecisionRequest(message) {
    return /choose|decide|option|which|better|should i|a or b|pick|select/i.test(message);
  },

  handleDecision(message) {
    // Extract options from message (A or B format)
    const optionMatch = message.match(/(?:option\s+)?([a-z])\s*(?:or|\/)\s*(?:option\s+)?([a-z])/i);
    
    if (optionMatch) {
      const optionA = optionMatch[1];
      const optionB = optionMatch[2];
      
      const analysis = this.advanced.makeDecision(optionA, optionB);
      this.showDecisionAnalysis(analysis);
      
      // Add points for decision making
      this.advanced.addPoints(10, 'Made a decision');
    }
    
    return this.ask(message);
  },

  // ==================== PROBLEM SOLVING HANDLING ====================
  isProblemSolvingRequest(message) {
    return /problem|issue|stuck|help|solve|how to|can't|struggling/i.test(message);
  },

  handleProblemSolving(message) {
    const plan = this.advanced.generateProblemSolvingPlan(message);
    this.showProblemSolvingPlan(plan);
    
    // Add points for problem solving
    this.advanced.addPoints(15, 'Started problem-solving');
    
    return this.ask(message);
  },

  // ==================== CRITICAL THINKING HANDLING ====================
  isCriticalThinkingRequest(message) {
    return /think|analyze|why|reason|understand|explain|reflect/i.test(message);
  },

  handleCriticalThinking(message) {
    const questions = this.advanced.generateCriticalThinkingQuestions(message);
    this.showCriticalThinkingQuestions(questions);
    
    // Add points for critical thinking
    this.advanced.addPoints(12, 'Engaged in critical thinking');
    
    return this.ask(message);
  },

  // ==================== VOICE ENHANCEMENTS ====================
  async askWithVoice(message) {
    // Record user voice
    const userVoice = await this.advanced.recordUserVoice();
    
    if (userVoice.error) {
      console.error('Voice recording error:', userVoice.error);
      return this.ask(message);
    }
    
    // Use recorded text if available
    const finalMessage = userVoice.text || message;
    
    // Ask with enhanced features
    await this.askEnhanced(finalMessage);
    
    // Get AI response (simulated)
    const response = 'This is where the AI response would be spoken';
    
    // Speak AI response
    await this.advanced.speakAIResponse(response);
    
    // Add points for voice interaction
    this.advanced.addPoints(8, 'Voice interaction');
  },

  // ==================== PERSONALITY SWITCHING ====================
  switchPersonality(personality) {
    const mode = this.advanced.switchPersonality(personality);
    this.showPersonalityChange(mode);
    
    // Add points for personality exploration
    this.advanced.addPoints(5, `Switched to ${personality} mode`);
  },

  // ==================== LANGUAGE SWITCHING ====================
  switchLanguage(language) {
    this.advanced.userProfile.communicationStyle = language;
    this.advanced.saveUserProfile();
    
    // Update UI direction for RTL languages
    if (language === 'arabic' || language === 'darija') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  },

  // ==================== UI DISPLAY METHODS ====================
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

  showDecisionAnalysis(analysis) {
    const container = this.messagesBox;
    const decisionUI = document.createElement('div');
    decisionUI.className = 'decision-maker';
    decisionUI.innerHTML = `
      <div class="decision-options">
        <div class="decision-option">Option A</div>
        <div class="decision-option">Option B</div>
      </div>
      <div class="decision-recommendation">
        ✅ Recommendation: ${analysis.recommendation}
      </div>
    `;
    container.appendChild(decisionUI);
    this.scroll();
  },

  showCriticalThinkingQuestions(questions) {
    const container = this.messagesBox;
    const section = document.createElement('div');
    section.className = 'critical-thinking-section';
    section.innerHTML = `
      <div class="critical-thinking-title">🤔 Critical Thinking Questions</div>
      ${questions.map((q, i) => `
        <div class="question-item">
          <span class="question-number">${i + 1}</span>
          ${q.question}
        </div>
      `).join('')}
    `;
    container.appendChild(section);
    this.scroll();
  },

  showProblemSolvingPlan(steps) {
    const container = this.messagesBox;
    const plan = document.createElement('div');
    plan.className = 'problem-solving-plan';
    plan.innerHTML = `
      <div class="plan-title">🎯 Problem-Solving Plan</div>
      <div class="plan-steps">
        ${steps.map(step => `
          <div class="plan-step">
            <div class="step-header">
              <div class="step-number">${step.step}</div>
              <div class="step-title">${step.title}</div>
            </div>
            <div class="step-description">${step.description}</div>
            <div class="step-action">→ ${step.action}</div>
          </div>
        `).join('')}
      </div>
    `;
    container.appendChild(plan);
    this.scroll();
  },

  showPersonalityChange(mode) {
    const container = this.messagesBox;
    const indicator = document.createElement('div');
    indicator.className = 'personality-indicator';
    indicator.innerHTML = `
      <span class="personality-emoji">${mode.emoji}</span>
      <span class="personality-name">Mode: ${mode.tone}</span>
    `;
    container.appendChild(indicator);
    this.scroll();
  },

  // ==================== GAMIFICATION DISPLAY ====================
  showGamificationWidget() {
    let widget = document.getElementById('gamificationWidget');
    
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'gamificationWidget';
      widget.className = 'gamification-widget';
      document.body.appendChild(widget);
    }

    const status = this.advanced.getGamificationStatus();
    const nextLevelPoints = status.nextLevelPoints === 'Max' 
      ? 'Max Level' 
      : `${status.nextLevelPoints - status.points} to next`;

    widget.innerHTML = `
      <div class="gamification-header">
        <span class="gamification-title">Your Progress</span>
        <button class="gamification-toggle" onclick="AI.toggleGamificationWidget()">×</button>
      </div>
      <div class="level-badge">${status.level}</div>
      <div class="points-display">
        <span>Points:</span>
        <span class="points-value">${status.points}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${Math.min((status.points % 100), 100)}%"></div>
      </div>
      <div style="font-size: 12px; color: #71767b; margin-bottom: 8px;">${nextLevelPoints}</div>
      <div class="streak-display">
        <span class="streak-flame">🔥</span>
        <span>Streak: ${status.streak}</span>
      </div>
    `;
  },

  toggleGamificationWidget() {
    const widget = document.getElementById('gamificationWidget');
    if (widget) {
      widget.classList.toggle('hidden');
    }
  },

  // ==================== CONVERSATION MANAGEMENT ====================
  exportConversations() {
    this.advanced.exportConversationHistory();
  },

  viewConversationHistory() {
    const history = this.advanced.getConversationHistory(10);
    console.log('Recent Conversations:', history);
    return history;
  },

  // ==================== ENHANCED STREAMING ====================
  async streamRenderEnhanced(fullText) {
    // Learn from AI response
    this.advanced.learnFromConversation('', fullText);

    // Apply personality to response
    const personalityText = this.advanced.getPersonalityResponse(fullText);

    // Stream the enhanced response
    await this.streamRender(personalityText);

    // Add points for conversation
    this.advanced.addPoints(5, 'Received AI response');

    // Update gamification widget
    this.showGamificationWidget();
  },

  // ==================== INITIALIZATION ====================
  initAdvanced() {
    // Load user profile
    this.advanced.loadUserProfile();

    // Show gamification widget
    this.showGamificationWidget();

    // Detect language from browser
    const browserLang = navigator.language;
    if (browserLang.startsWith('ar')) {
      this.switchLanguage('arabic');
    }

    // Log initialization
    console.log('✨ Advanced AI System Initialized');
    console.log('User Profile:', this.advanced.userProfile);
    console.log('Gamification:', this.advanced.gamification);
  }
});

// ==================== HELPER FUNCTIONS ====================
function getAIStatus() {
  return AI.advanced.getFullUserProfile();
}

function resetAIData() {
  AI.advanced.resetUser();
}

function exportAIData() {
  AI.advanced.exportConversationHistory();
}

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    if (typeof AI !== 'undefined' && AI.initAdvanced) {
      AI.initAdvanced();
    }
  }, 500);
});

// Save user profile before leaving
window.addEventListener('beforeunload', () => {
  if (typeof AI !== 'undefined' && AI.advanced) {
    AI.advanced.saveUserProfile();
  }
});

console.log('🔗 AI Integration Layer Loaded');
