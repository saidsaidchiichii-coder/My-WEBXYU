/**
 * schema.ts
 * Data type definitions for the AI Image Generation System.
 * Ensures compatibility between frontend and backend.
 */

export interface ChatRequest {
    message: string;
    mode: 'chat' | 'image';
}

export interface ChatResponse {
    reply: string;
    image_url?: string;
    error?: string;
}

export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
    type: 'text' | 'image';
    image_url?: string;
}

export interface PromptHistoryItem {
    id: number;
    originalPrompt: string;
    refinedPrompt: string;
    imageUrl?: string;
    timestamp: string;
}
