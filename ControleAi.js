/**
 * 🚀 ADVANCED AI SYSTEM
 * - Personal Learning & Memory
 * - Dual Voice (User + AI)
 * - Moroccan Dialect Support
 * - Points & Levels System
 * - Personality Detection & Switching
 * - Bias & Error Detection
 * - Smart Decision Making
 * - Critical Thinking Questions
 * - Real-life Problem Solving
 */

class AIAdvancedSystem {
  constructor() {
    // User Profile & Memory
    this.userProfile = {
      name: 'User',
      personality: 'neutral', // neutral, funny, serious, motivator, coach
      mood: 'neutral', // happy, sad, stressed, excited, neutral
      interests: [],
      communicationStyle: 'english', // english, arabic, darija
      conversationHistory: [],
      preferences: {},
      learningData: {}
    };

    // Points & Levels System
    this.gamification = {
      points: 0,
      level: 1,
      streak: 0,
      achievements: [],
      milestones: {
        1: 0,
        2: 100,
        3: 300,
        4: 600,
        5: 1000,
        10: 5000
      }
    };

    // AI Personality Modes
    this.personalities = {
      neutral: {
        tone: 'professional',
        emoji: '🤖',
        style: 'balanced'
      },
      funny: {
        tone: 'humorous',
        emoji: '😄',
        style: 'light-hearted'
      },
      serious: {
        tone: 'formal',
        emoji: '💼',
        style: 'professional'
      },
      motivator: {
        tone: 'inspiring',
        emoji: '🚀',
        style: 'encouraging'
      },
      coach: {
        tone: 'guiding',
        emoji: '🎯',
        style: 'questioning'
      }
    };

    // Bias Detection Keywords
    this.biasPatterns = {
      overthinking: ['always', 'never', 'impossible', 'can\'t', 'won\'t'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
      perfectionism: ['perfect', 'flawless', 'must', 'should', 'have to'],
      selfDoubt: ['not good enough', 'fail', 'stupid', 'useless', 'worthless']
    };

    // Language Support
    this.languages = {
      english: 'en',
      arabic: 'ar',
      darija: 'ar-MA'
    };

    this.loadUserProfile();
  }

  // ==================== PERSONAL LEARNING ====================
  loadUserProfile() {
    const saved = localStorage.getItem('aiUserProfile');
    if (saved) {
      this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
      this.gamification = JSON.parse(localStorage.getItem('aiGamification')) || this.gamification;
    }
  }

  saveUserProfile() {
    localStorage.setItem('aiUserProfile', JSON.stringify(this.userProfile));
    localStorage.setItem('aiGamification', JSON.stringify(this.gamification));
  }

  learnFromConversation(userMessage, aiResponse) {
    // Analyze user message for interests
    const keywords = this.extractKeywords(userMessage);
    keywords.forEach(keyword => {
      if (!this.userProfile.interests.includes(keyword)) {
        this.userProfile.interests.push(keyword);
      }
    });

    // Detect mood from message
    this.userProfile.mood = this.detectMood(userMessage);

    // Detect personality preference
    this.userProfile.personality = this.detectPersonality(userMessage);

    // Store conversation
    this.userProfile.conversationHistory.push({
      timestamp: new Date(),
      user: userMessage,
      ai: aiResponse,
      mood: this.userProfile.mood,
      personality: this.userProfile.personality
    });

    // Keep only last 100 conversations
    if (this.userProfile.conversationHistory.length > 100) {
      this.userProfile.conversationHistory.shift();
    }

    this.saveUserProfile();
  }

  extractKeywords(text) {
    // Simple keyword extraction (can be enhanced)
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    return words.filter(w => w.length > 3 && !stopWords.includes(w)).slice(0, 5);
  }

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
  }

  detectPersonality(text) {
    const textLower = text.toLowerCase();
    
    if (/\?{2,}|!!!|haha|lol|😂|funny/.test(textLower)) return 'funny';
    if (/serious|important|critical|urgent/.test(textLower)) return 'serious';
    if (/help|guide|teach|learn|question/.test(textLower)) return 'coach';
    if (/motivate|inspire|believe|can do|possible/.test(textLower)) return 'motivator';
    
    return 'neutral';
  }

  // ==================== PERSONALITY SWITCHING ====================
  switchPersonality(personality) {
    if (this.personalities[personality]) {
      this.userProfile.personality = personality;
      this.saveUserProfile();
      return this.personalities[personality];
    }
    return this.personalities.neutral;
  }

  getPersonalityResponse(baseResponse) {
    const personality = this.userProfile.personality;
    const mode = this.personalities[personality];

    let response = baseResponse;

    if (personality === 'funny') {
      response = this.addHumor(response);
    } else if (personality === 'motivator') {
      response = this.addMotivation(response);
    } else if (personality === 'coach') {
      response = this.addQuestions(response);
    }

    return `${mode.emoji} ${response}`;
  }

  addHumor(text) {
    const jokes = [
      ' 😄 (Just kidding, but seriously...)',
      ' 🤣 (Okay, let me be real with you...)',
      ' 😎 (Plot twist: ...)'
    ];
    return text + jokes[Math.floor(Math.random() * jokes.length)];
  }

  addMotivation(text) {
    const motivations = [
      ' 💪 You got this!',
      ' 🚀 You\'re capable of amazing things!',
      ' ⭐ Believe in yourself!'
    ];
    return text + motivations[Math.floor(Math.random() * motivations.length)];
  }

  addQuestions(text) {
    const questions = [
      ' 🤔 What do you think about this?',
      ' 💭 How would you approach this?',
      ' 🎯 What\'s your next step?'
    ];
    return text + questions[Math.floor(Math.random() * questions.length)];
  }

  // ==================== BIAS & ERROR DETECTION ====================
  detectBias(text) {
    const detectedBiases = [];

    for (const [biasType, keywords] of Object.entries(this.biasPatterns)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        detectedBiases.push(biasType);
      }
    }

    return detectedBiases;
  }

  generateBiasCorrection(biases) {
    const corrections = {
      overthinking: '🧠 I notice you\'re using absolute words. Remember, most situations have nuance and possibilities.',
      fear: '💪 I sense some fear here. Let\'s break this down into manageable steps.',
      perfectionism: '✨ Perfection is the enemy of progress. Good enough is often good enough!',
      selfDoubt: '🌟 You\'re more capable than you think. Let\'s focus on what you CAN do.'
    };

    return biases.map(bias => corrections[bias] || '').filter(c => c);
  }

  // ==================== POINTS & LEVELS ====================
  addPoints(amount, reason) {
    this.gamification.points += amount;
    this.gamification.streak += 1;

    // Check for level up
    const currentLevel = this.gamification.level;
    for (const [level, pointsNeeded] of Object.entries(this.gamification.milestones)) {
      if (this.gamification.points >= pointsNeeded && level > currentLevel) {
        this.gamification.level = parseInt(level);
        this.showLevelUpNotification(level);
      }
    }

    this.saveUserProfile();
    return {
      points: amount,
      reason: reason,
      total: this.gamification.points,
      level: this.gamification.level
    };
  }

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
  }

  getGamificationStatus() {
    return {
      points: this.gamification.points,
      level: this.gamification.level,
      streak: this.gamification.streak,
      nextLevelPoints: this.gamification.milestones[this.gamification.level + 1] || 'Max'
    };
  }

  // ==================== DECISION MAKING ====================
  makeDecision(optionA, optionB) {
    const analysis = {
      optionA: this.analyzeOption(optionA),
      optionB: this.analyzeOption(optionB),
      recommendation: this.recommendOption(optionA, optionB),
      reasoning: this.generateReasoning(optionA, optionB)
    };

    return analysis;
  }

  analyzeOption(option) {
    return {
      text: option,
      complexity: option.split(' ').length,
      sentiment: this.analyzeSentiment(option),
      risks: this.identifyRisks(option)
    };
  }

  analyzeSentiment(text) {
    const positive = ['good', 'better', 'great', 'positive', 'growth'];
    const negative = ['bad', 'worse', 'risk', 'negative', 'loss'];

    const posCount = positive.filter(w => text.toLowerCase().includes(w)).length;
    const negCount = negative.filter(w => text.toLowerCase().includes(w)).length;

    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  }

  identifyRisks(text) {
    const risks = [];
    if (text.toLowerCase().includes('unknown')) risks.push('Unknown factors');
    if (text.toLowerCase().includes('expensive')) risks.push('Financial risk');
    if (text.toLowerCase().includes('time')) risks.push('Time commitment');
    return risks;
  }

  recommendOption(optionA, optionB) {
    const sentimentA = this.analyzeSentiment(optionA);
    const sentimentB = this.analyzeSentiment(optionB);

    if (sentimentA === 'positive' && sentimentB !== 'positive') return 'A';
    if (sentimentB === 'positive' && sentimentA !== 'positive') return 'B';
    return 'Both have merit';
  }

  generateReasoning(optionA, optionB) {
    return `
    Option A: ${this.analyzeSentiment(optionA)} sentiment, ${this.identifyRisks(optionA).length} risks identified
    Option B: ${this.analyzeSentiment(optionB)} sentiment, ${this.identifyRisks(optionB).length} risks identified
    `;
  }

  // ==================== CRITICAL THINKING ====================
  generateCriticalThinkingQuestions(topic) {
    const questions = [
      `What evidence supports your view on ${topic}?`,
      `What would someone who disagrees with you say about ${topic}?`,
      `How might your perspective on ${topic} change in 5 years?`,
      `What assumptions are you making about ${topic}?`,
      `How does ${topic} affect others around you?`,
      `What would happen if the opposite of ${topic} were true?`
    ];

    return questions.slice(0, 3).map((q, i) => ({
      order: i + 1,
      question: q,
      type: 'reflection'
    }));
  }

  // ==================== PROBLEM SOLVING ====================
  generateProblemSolvingPlan(problem) {
    const steps = [
      {
        step: 1,
        title: 'Define the Problem',
        description: `What exactly is the issue with: ${problem}?`,
        action: 'Write it down clearly'
      },
      {
        step: 2,
        title: 'Identify Root Causes',
        description: 'Why is this happening?',
        action: 'Ask "why" 5 times'
      },
      {
        step: 3,
        title: 'Brainstorm Solutions',
        description: 'What are all possible solutions?',
        action: 'List at least 5 ideas'
      },
      {
        step: 4,
        title: 'Evaluate Options',
        description: 'Which solution is best?',
        action: 'Compare pros and cons'
      },
      {
        step: 5,
        title: 'Create Action Plan',
        description: 'How will you implement it?',
        action: 'Break into small tasks'
      },
      {
        step: 6,
        title: 'Take Action',
        description: 'Execute your plan',
        action: 'Start with the first task'
      },
      {
        step: 7,
        title: 'Review & Adjust',
        description: 'How is it working?',
        action: 'Measure progress'
      }
    ];

    return steps;
  }

  // ==================== DUAL VOICE SYSTEM ====================
  async recordUserVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return { error: 'Speech Recognition not supported' };
    }

    return new Promise((resolve) => {
      const recognition = new SpeechRecognition();
      recognition.lang = this.userProfile.communicationStyle === 'darija' ? 'ar-MA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        this.showRecordingIndicator(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve({ text: transcript, confidence: event.results[0][0].confidence });
      };

      recognition.onerror = (event) => {
        resolve({ error: event.error });
      };

      recognition.onend = () => {
        this.showRecordingIndicator(false);
      };

      recognition.start();
    });
  }

  async speakAIResponse(text) {
    if (!('speechSynthesis' in window)) {
      return { error: 'Text-to-Speech not supported' };
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.userProfile.communicationStyle === 'darija' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    return new Promise((resolve) => {
      utterance.onend = () => resolve({ success: true });
      utterance.onerror = (event) => resolve({ error: event.error });
      window.speechSynthesis.speak(utterance);
    });
  }

  showRecordingIndicator(isRecording) {
    const indicator = document.getElementById('recordingIndicator');
    if (indicator) {
      indicator.style.display = isRecording ? 'flex' : 'none';
    }
  }

  // ==================== MOROCCAN DIALECT SUPPORT ====================
  translateToDarija(text) {
    const translations = {
      'hello': 'سلام',
      'how are you': 'كيفاش نتا',
      'good': 'بزاف',
      'thank you': 'شكرا بزاف',
      'yes': 'واه',
      'no': 'لا',
      'sorry': 'سمح لي',
      'please': 'من فضلك',
      'what': 'شنو',
      'why': 'علاش',
      'how': 'كيفاش',
      'where': 'فين',
      'when': 'واقت'
    };

    let result = text.toLowerCase();
    for (const [english, darija] of Object.entries(translations)) {
      result = result.replace(new RegExp(english, 'gi'), darija);
    }
    return result;
  }

  detectLanguage(text) {
    if (/[\u0600-\u06FF]/.test(text)) {
      if (/واه|بزاف|كيفاش|شنو|علاش|فين/.test(text)) {
        return 'darija';
      }
      return 'arabic';
    }
    return 'english';
  }

  // ==================== CONVERSATION HISTORY ====================
  getConversationHistory(limit = 20) {
    return this.userProfile.conversationHistory.slice(-limit);
  }

  exportConversationHistory() {
    const data = {
      userProfile: this.userProfile,
      gamification: this.gamification,
      exportDate: new Date().toISOString()
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-conversation-${new Date().getTime()}.json`;
    a.click();
  }

  clearHistory() {
    if (confirm('Are you sure you want to clear all conversation history?')) {
      this.userProfile.conversationHistory = [];
      this.saveUserProfile();
      return true;
    }
    return false;
  }

  // ==================== UTILITY FUNCTIONS ====================
  getFullUserProfile() {
    return {
      profile: this.userProfile,
      gamification: this.gamification,
      personality: this.personalities[this.userProfile.personality]
    };
  }

  resetUser() {
    if (confirm('Reset all user data?')) {
      localStorage.removeItem('aiUserProfile');
      localStorage.removeItem('aiGamification');
      location.reload();
    }
  }
}

// Initialize the advanced AI system
const AIAdvanced = new AIAdvancedSystem();
