/**
 * chat.js
 * Handles additional chat features, prompt history, and local storage.
 */

const ChatManager = {
    history: [],

    saveToHistory(prompt, response, type) {
        const item = {
            id: Date.now(),
            prompt,
            response,
            type, // 'chat' or 'image'
            timestamp: new Date().toISOString()
        };
        this.history.push(item);
        this.updateLocalStorage();
    },

    updateLocalStorage() {
        localStorage.setItem('ai_studio_history', JSON.stringify(this.history));
    },

    loadHistory() {
        const stored = localStorage.getItem('ai_studio_history');
        if (stored) {
            try {
                this.history = JSON.parse(stored);
            } catch (e) {
                console.error('Failed to load history:', e);
                this.history = [];
            }
        }
    },

    clearHistory() {
        this.history = [];
        this.updateLocalStorage();
    },

    getHistory(type = null) {
        if (type) {
            return this.history.filter(item => item.type === type);
        }
        return this.history;
    }
};

// Initialize history on load
document.addEventListener('DOMContentLoaded', () => {
    ChatManager.loadHistory();
});
