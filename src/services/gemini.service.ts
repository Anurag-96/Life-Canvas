import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../env';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = environment.gemini.apiKey;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API key not configured in src/env.ts. AI features will be disabled.');
    } else {
        this.ai = new GoogleGenAI({ apiKey: apiKey });
    }
  }

  async generateReflection(
    title: string,
    content: string
  ): Promise<string> {
    if (!this.ai) {
        return 'AI features are not available. Please configure your Gemini API key in src/env.ts.';
    }
    
    const prompt = `You are a friendly and supportive journal assistant. Your goal is to offer a gentle, positive perspective. Read the following journal entry and provide a short (2-3 sentences), encouraging reflection. Do not give advice or ask questions.

    Journal Entry Title: "${title}"
    Journal Entry Content: "${content}"
    
    Your positive reflection:`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error generating reflection:', error);
      return 'Sorry, I was unable to generate a reflection at this time. Please try again later.';
    }
  }
}