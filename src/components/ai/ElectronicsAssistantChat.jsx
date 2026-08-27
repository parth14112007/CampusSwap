import React, { useState, useEffect, useRef } from 'react';
import { electronicsAiService, SUGGESTED_PROMPTS } from '../../services/electronicsAiService';

/**
 * Lightweight helper to format markdown-like text (headers, bold, code blocks, lists, math)
 */
function FormattedAiText({ text }) {
  if (!text) return null;

  // Split by code blocks first
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2.5 text-body-sm leading-relaxed text-on-surface select-text">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const content = part.slice(3, -3).replace(/^[a-zA-Z0-9_-]+\n/, '');
          return (
            <div key={idx} className="my-2 rounded-xl bg-surface-container-highest border border-outline-variant/30 overflow-hidden font-mono text-[12px]">
              <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-high border-b border-outline-variant/20 text-[11px] text-on-surface-variant font-semibold">
                <span>Circuit / Code</span>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(content)}
                  className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  title="Copy to clipboard"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  Copy
                </button>
              </div>
              <pre className="p-3 overflow-x-auto text-on-surface whitespace-pre">
                {content}
              </pre>
            </div>
          );
        }

        // Standard markdown lines
        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Header 3 / 4
              if (trimmed.startsWith('#### ')) {
                return (
                  <h5 key={lIdx} className="font-heading-lg text-[13px] font-bold text-primary mt-2 flex items-center gap-1.5">
                    {formatInline(trimmed.replace('#### ', ''))}
                  </h5>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="font-heading-lg text-[15px] font-bold text-on-surface mt-2.5 flex items-center gap-1.5 border-b border-outline-variant/20 pb-1">
                    {formatInline(trimmed.replace('### ', ''))}
                  </h4>
                );
              }

              // Bullet items
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                    <span className="text-primary mt-1 text-[12px]">•</span>
                    <span className="flex-1">{formatInline(trimmed.replace(/^[-*]\s+/, ''))}</span>
                  </div>
                );
              }

              // Numbered items
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+)\.\s+(.*)$/);
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1.5">
                    <span className="font-bold text-primary text-[12px]">{match[1]}.</span>
                    <span className="flex-1">{formatInline(match[2])}</span>
                  </div>
                );
              }

              // Math display block ($$...$$)
              if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
                const mathContent = trimmed.slice(2, -2).trim();
                return (
                  <div key={lIdx} className="my-2 p-2.5 bg-primary/5 rounded-xl border border-primary/15 text-center font-mono text-[13px] font-semibold text-primary overflow-x-auto">
                    {mathContent}
                  </div>
                );
              }

              return <p key={lIdx}>{formatInline(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInline(str) {
  if (!str) return '';

  // Process bold (**bold**) and inline code (`code`) and inline math ($...$)
  const tokens = str.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);
  return tokens.map((token, i) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={i} className="font-bold text-on-surface">{token.slice(2, -2)}</strong>;
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[11px] font-semibold">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('$') && token.endsWith('$') && token.length > 2) {
      return (
        <span key={i} className="px-1 py-0.5 font-mono text-[12px] text-primary font-bold bg-primary/10 rounded">
          {token.slice(1, -1)}
        </span>
      );
    }
    return token;
  });
}

export function ElectronicsAssistantChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState({ online: false, configured: false });
  const [selectedImage, setSelectedImage] = useState(null);
  const [showConfigNotice, setShowConfigNotice] = useState(true);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize and check server status
  useEffect(() => {
    const init = async () => {
      const status = await electronicsAiService.checkStatus();
      setServerStatus(status);

      const cached = electronicsAiService.getStoredHistory();
      if (cached && Array.isArray(cached) && cached.length > 0) {
        setMessages(cached);
      } else {
        setMessages([
          {
            role: 'assistant',
            content: `👋 **Welcome to the CampusSwap Full Electronics Expert AI Assistant!**\n\nI am your 24/7 senior hardware design engineer and lab tutor. Ask me virtually anything regarding:\n- ⚡ **Components & ICs:** Passives, MOSFETs, BJTs, Op-Amps (LM358/324), 555 timers, regulators, motor drivers, sensors.\n- 🔍 **Troubleshooting:** Systematic debugging for heating MOSFETs, unlit LEDs, ground loops, blown fuses, or MCU resets.\n- 🔌 **Circuit Design:** Step-down buck converters, amplifier stages, active filters, sensor conditioning, and H-bridges.\n- 📐 **Calculations:** Ohm's law, RC/RL time constants, heatsink thermal sizing, and divider formulas.\n\n*Choose a suggested topic below or type your circuit problem to begin!*`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    };
    init();
  }, []);

  // Save history on change
  useEffect(() => {
    if (messages.length > 1) {
      electronicsAiService.saveHistory(messages);
    }
  }, [messages]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  const handleSendMessage = async (textToSend = inputText) => {
    const trimmed = (textToSend || '').trim();
    if (!trimmed && !selectedImage) return;

    setError(null);
    const userMsg = {
      role: 'user',
      content: trimmed,
      image: selectedImage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    const imageToTransmit = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Filter out greeting from history payload if needed
      const payloadMessages = newMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await electronicsAiService.sendMessage(payloadMessages, imageToTransmit);

      const aiReply = {
        role: 'assistant',
        content: res.reply || 'I processed your request, but received an empty response.',
        model: res.model,
        provider: res.provider,
        configured: res.configured,
        notice: res.notice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiReply]);
      if (res.configured !== undefined) {
        setServerStatus((prev) => ({ ...prev, configured: res.configured }));
      }
    } catch (err) {
      setError(err.message || 'Failed to reach Electronics AI service. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation history with Electronics AI?')) {
      electronicsAiService.clearHistory();
      setMessages([
        {
          role: 'assistant',
          content: 'Conversation cleared. Ready for your next circuit or component question!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setError(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('Image size exceeds 4MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Floating Action Button (Bottom-Right) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-secondary via-secondary-container to-primary text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
          aria-label="Open CampusSwap Electronics AI Assistant"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[20px] text-white animate-pulse">
              smart_toy
            </span>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-secondary" />
          </div>
          <span className="font-heading-lg text-[13px] font-extrabold tracking-tight pr-1 hidden xs:inline sm:inline">
            🤖 CampusSwap Electronics AI
          </span>
        </button>
      )}

      {/* Minimized Pill Bar */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-4 py-2.5 bg-surface-container-lowest/95 backdrop-blur-xl border border-outline-variant/40 rounded-full shadow-2xl animate-scale-up">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMinimized(false)}>
            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">smart_toy</span>
            </div>
            <span className="text-[13px] font-bold text-on-surface">Electronics AI</span>
            {isLoading && (
              <span className="w-2 h-2 rounded-full bg-secondary animate-ping" />
            )}
          </div>
          <div className="flex items-center gap-1 border-l border-outline-variant/30 pl-2">
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              className="p-1 hover:text-primary rounded-full transition-colors cursor-pointer"
              title="Expand window"
            >
              <span className="material-symbols-outlined text-[18px]">open_in_full</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:text-error rounded-full transition-colors cursor-pointer"
              title="Close chat"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* Full Floating Chat Window */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[480px] h-[590px] max-h-[calc(100vh-6.5rem)] flex flex-col bg-surface-container-lowest/98 backdrop-blur-2xl rounded-[28px] border border-outline-variant/40 shadow-2xl overflow-hidden animate-scale-up">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-secondary via-secondary-container to-primary text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[22px] text-white">
                  smart_toy
                </span>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-secondary ${
                    serverStatus.configured ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  title={serverStatus.configured ? 'AI Provider Live' : 'Offline Knowledge Solver'}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-heading-lg text-[15px] font-extrabold tracking-tight leading-none text-white">
                    CampusSwap Electronics AI
                  </h3>
                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 text-white">
                    PRO
                  </span>
                </div>
                <span className="text-[11px] text-white/80 font-medium leading-normal mt-0.5">
                  Hardware, Circuits & Calculations Expert
                </span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1 text-white/90">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                title="Close chat"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Setup / Notice Banner (Only if server reports no API key configured) */}
          {!serverStatus.configured && showConfigNotice && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-3.5 py-2 flex items-start justify-between gap-2 text-[11px] text-amber-900 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[16px] shrink-0">info</span>
                <span>
                  <strong>Offline Knowledge Mode:</strong> Add <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">GEMINI_API_KEY</code> to server <code className="bg-amber-200/60 px-1 py-0.5 rounded font-mono font-bold">.env</code> for full generative reasoning.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfigNotice(false)}
                className="text-amber-700 hover:text-amber-950 font-bold p-0.5 cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          )}

          {/* Conversation Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-surface/50">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-medium px-1">
                    <span>{isUser ? 'You (Student Engineer)' : 'CampusSwap AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp || 'Now'}</span>
                  </div>

                  <div
                    className={`max-w-[90%] rounded-[20px] p-3.5 sm:p-4 shadow-xs ${
                      isUser
                        ? 'bg-primary text-white rounded-tr-xs'
                        : 'bg-surface-container-low border border-outline-variant/30 text-on-surface rounded-tl-xs'
                    }`}
                  >
                    {/* Attached Image if user sent one */}
                    {msg.image && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-white/20 max-w-[200px]">
                        <img src={msg.image} alt="User circuit upload" className="w-full h-auto object-cover" />
                      </div>
                    )}

                    {isUser ? (
                      <p className="text-body-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <FormattedAiText text={msg.content} />
                    )}

                    {/* Metadata pill for AI messages */}
                    {!isUser && (msg.provider || msg.model) && (
                      <div className="mt-2.5 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[10px] text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px] text-secondary">bolt</span>
                          {msg.provider || 'Electronics Expert Engine'}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="hover:text-primary transition-colors flex items-center gap-0.5 cursor-pointer font-semibold"
                        >
                          <span className="material-symbols-outlined text-[12px]">content_copy</span>
                          Copy Solution
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-surface-container-low border border-outline-variant/30 rounded-[20px] rounded-tl-xs p-3.5 flex items-center gap-3 shadow-xs">
                  <div className="w-4 h-4 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                  <span className="text-[12px] font-medium text-on-surface-variant animate-pulse">
                    Analyzing circuit topology & calculations...
                  </span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-error-container text-on-error-container border border-error/30 rounded-2xl flex items-center justify-between gap-2 text-[12px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">error</span>
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="font-bold underline hover:opacity-80 cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions Chips */}
          <div className="px-3 py-2 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[10px] font-extrabold uppercase text-on-surface-variant tracking-wider shrink-0 pl-1">
              ⚡ Quick:
            </span>
            {SUGGESTED_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-container hover:bg-primary/10 hover:text-primary border border-outline-variant/20 text-on-surface shrink-0 transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[13px] text-primary">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Image Preview Slot (Vision Ready) */}
          {selectedImage && (
            <div className="px-3 py-1.5 bg-primary/5 border-t border-primary/20 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <img src={selectedImage} alt="Attachment preview" className="w-8 h-8 rounded-lg object-cover border border-primary/30" />
                <span className="text-[11px] font-bold text-primary">Circuit Attachment (Vision Ready)</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="text-error hover:text-error/80 text-[12px] font-bold p-1 cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input & Action Bar */}
          <div className="p-3 bg-surface-container-lowest border-t border-outline-variant/30 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              {/* Vision Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer shrink-0"
                title="Attach circuit schematic or breadboard photo (Vision Ready)"
              >
                <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
              </button>

              {/* Text Input Area */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about any circuit, IC, component, or troubleshooting..."
                  rows={1}
                  className="w-full py-2.5 px-3.5 bg-surface-container-low border border-outline-variant/30 rounded-2xl text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none max-h-24 transition-all"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputText.trim() && !selectedImage) || isLoading}
                className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-secondary to-primary text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Send query"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isLoading ? 'hourglass_top' : 'send'}
                </span>
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
