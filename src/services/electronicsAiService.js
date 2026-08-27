/**
 * CampusSwap Electronics Expert AI Service
 * 
 * Frontend service to communicate with the secure server-side endpoint
 * (/api/electronics-assistant).
 * 
 * Key Principles:
 * - NO API secrets stored here.
 * - Handles offline fallback responses gracefully.
 * - Manages persistent conversation history in localStorage.
 * - Provides categorized electronics prompt suggestions.
 */

const STORAGE_CHAT_KEY = 'campusswap_electronics_ai_history';

export const SUGGESTED_PROMPTS = [
  {
    category: 'Troubleshoot',
    icon: 'build',
    label: 'MOSFET Overheating',
    prompt: 'My MOSFET is heating up when switching a 12V DC motor. Can you troubleshoot why and help me fix it?'
  },
  {
    category: 'Troubleshoot',
    icon: 'lightbulb',
    label: 'LED Not Turning On',
    prompt: 'My LED is not turning on when connected to a 5V supply. Give me a step-by-step diagnostic checklist.'
  },
  {
    category: 'Design',
    icon: 'electric_bolt',
    label: '12V to 5V Buck Supply',
    prompt: 'Design a 12V to 5V 1A power supply circuit. Compare linear regulator vs buck converter with component values.'
  },
  {
    category: 'Calculations',
    icon: 'calculate',
    label: '555 Timer Astable',
    prompt: 'Calculate the frequency and duty cycle for an NE555 astable circuit using R1=10kΩ, R2=47kΩ, and C=100nF.'
  },
  {
    category: 'Compare',
    icon: 'compare_arrows',
    label: 'MOSFET vs BJT',
    prompt: 'Compare MOSFET vs BJT for switching an inductive load. Which one should I choose for an Arduino/ESP32 project?'
  },
  {
    category: 'IC Specs',
    icon: 'memory',
    label: 'LM358 vs LM324',
    prompt: 'What is the difference between the LM358 and LM324 op-amp ICs? Explain their voltage limits and input ranges.'
  }
];

export const electronicsAiService = {
  /**
   * Check AI server status and whether API keys are configured
   */
  async checkStatus() {
    try {
      const res = await fetch('/api/electronics-assistant', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return { online: false, configured: false };
      const data = await res.json();
      return {
        online: true,
        configured: Boolean(data.configured),
        activeProvider: data.activeProvider || 'Unknown',
        requiredEnvVar: data.requiredEnvVar || 'GEMINI_API_KEY'
      };
    } catch {
      return { online: false, configured: false };
    }
  },

  /**
   * Send conversation to the secure server endpoint
   */
  async sendMessage(messages, imageBase64 = null) {
    const payload = {
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content
      })),
      image: imageBase64 || null
    };

    const res = await fetch('/api/electronics-assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`AI Service Error (${res.status}): ${errorText || res.statusText}`);
    }

    return await res.json();
  },

  /**
   * Get cached chat history
   */
  getStoredHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_CHAT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Save chat history to localStorage
   */
  saveHistory(messages) {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to cache chat history', e);
    }
  },

  /**
   * Clear chat history
   */
  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_CHAT_KEY);
    } catch (e) {
      console.warn('Failed to clear chat history', e);
    }
  },

  /**
   * Prompt suggestions
   */
  getSuggestedPrompts() {
    return SUGGESTED_PROMPTS;
  }
};
