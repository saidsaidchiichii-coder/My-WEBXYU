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
            this.history = JSON.parse(stored);
        }
    },

    clearHistory() {
        this.history = [];
        this.updateLocalStorage();
    }
};

// Initialize history on load
document.addEventListener('DOMContentLoaded', () => {
    ChatManager.loadHistory();
});
