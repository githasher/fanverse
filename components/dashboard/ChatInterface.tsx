'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import { Send, Mic, MicOff, AlertCircle } from 'lucide-react';
import type { ChatMessage, StadiumState } from '@/types';
import { logger } from '@/lib/logger';
import { CHAT_HISTORY_WINDOW, MAX_MESSAGE_LENGTH } from '@/lib/constants';
import { t } from '@/lib/i18n';

interface WebSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

/**
 * Prunes visual and metadata fields from stadium state to minimize payload transit size.
 *
 * @param state The live Zustand StadiumState object.
 * @returns A pruned StadiumState structure matching backend tool schema needs.
 */
function pruneStadiumState(state: StadiumState): Record<string, unknown> {
  return {
    weather: state.weather,
    transport: state.transport,
    gates: state.gates.map((g) => ({
      name: g.name,
      status: g.status,
      crowdLevel: g.crowdLevel,
      waitMinutes: g.waitMinutes,
    })),
    zones: state.zones.map((z) => ({
      name: z.name,
      crowdDensity: z.crowdDensity,
      temperature: z.temperature,
    })),
    facilities: state.facilities.map((f) => ({
      name: f.name,
      type: f.type,
      zone: f.zone,
      open: f.open,
      queueLength: f.queueLength,
      waitMinutes: f.waitMinutes,
    })),
    foodVendors: state.foodVendors.map((v) => ({
      name: v.name,
      cuisine: v.cuisine,
      zone: v.zone,
      open: v.open,
      waitMinutes: v.waitMinutes,
      dietaryTags: v.dietaryTags,
    })),
  } as unknown as Record<string, unknown>;
}

/**
 * ChatInterface Component.
 * Full screen or floating AI assistant chat interface that coordinates telemetry questions.
 *
 * @returns React.JSX.Element representing the AI chatbot interface.
 */
export default function ChatInterface(): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const chatMessages = useFanverseStore((state) => state.chatMessages);
  const addMessage = useFanverseStore((state) => state.addMessage);
  const stadiumState = useFanverseStore((state) => state.stadiumState);
  const userProfile = useFanverseStore((state) => state.userProfile);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  /**
   * Smoothly scrolls the chat message container down to the latest message.
   */
  const scrollToBottom = useCallback((): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping, scrollToBottom]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: new () => WebSpeechRecognition; webkitSpeechRecognition?: new () => WebSpeechRecognition }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: new () => WebSpeechRecognition; webkitSpeechRecognition?: new () => WebSpeechRecognition }).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = useFanverseStore.getState().userProfile.language === 'ar' ? 'ar-SA' : 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        rec.onresult = (event) => {
          const resultGroup = event.results[0];
          const result = resultGroup ? resultGroup[0] : null;
          if (result) {
            setInputValue(result.transcript);
          }
        };

        rec.onerror = (event) => {
          logger.error('SpeechRecognition', event.error);
          setSpeechError(`Voice error: ${event.error}`);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []); // Instantiate once

  // Dynamically update speech recognition locale lang inside the reference rather than re-creating the hook
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = userProfile.language === 'ar' ? 'ar-SA' : 'en-US';
    }
  }, [userProfile.language]);

  /**
   * Toggles Speech Recognition states.
   */
  const toggleVoiceInput = (): void => {
    if (!recognitionRef.current) {
      setSpeechError('Web Speech API is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  /**
   * Sends the user's message query to the server, and processes the streamable result.
   * Uses store-direct state to prevent recreation on every history update.
   */
  const fetchAIResponse = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      setIsTyping(true);
      try {
        // Retrieve chat history directly from Zustand state to keep useCallback dependencies pristine
        const currentHistory = useFanverseStore.getState().chatMessages;
        const historySnapshot = currentHistory.slice(-CHAT_HISTORY_WINDOW);

        // Strip coordinates / static visual detail to prune payload size
        const prunedTelemetry = pruneStadiumState(stadiumState);

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text.substring(0, MAX_MESSAGE_LENGTH),
            stadiumState: prunedTelemetry,
            userProfile,
            history: historySnapshot,
          }),
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMsg: ChatMessage = {
          id: `chat-${Date.now() + 1}`,
          role: 'assistant',
          content: data.response,
          timestamp: Date.now(),
          type: 'text',
        };

        addMessage(assistantMsg);
      } catch (err: unknown) {
        logger.error('ChatInterfaceSend', err);
        
        // Sanitize error output to avoid technical/stack leakage in production
        const sanitizedErrText =
          err instanceof Error && err.message.includes('rate limit')
            ? 'Rate limit exceeded. Please wait a moment before sending another message.'
            : 'Gemini server capacity limits reached. Please verify your connection and try again.';

        const errorMsg: ChatMessage = {
          id: `chat-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ ${sanitizedErrText}`,
          timestamp: Date.now(),
          type: 'text',
        };
        addMessage(errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [stadiumState, userProfile, addMessage]
  );

  /**
   * Adds the user message to history, then triggers the AI API call.
   */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Create user message
      const userMsg: ChatMessage = {
        id: `chat-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: Date.now(),
        type: 'text',
      };

      addMessage(userMsg);
      setInputValue('');
      await fetchAIResponse(text);
    },
    [addMessage, fetchAIResponse]
  );

  // Auto-trigger AI response logic for externally injected query messages (e.g. from maps/queue clicks)
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg && lastMsg.role === 'user' && !isTyping) {
      // Look for a corresponding assistant reply with a timestamp after this message
      const hasResponse = chatMessages.some(
        (m) => m.role === 'assistant' && m.timestamp > lastMsg.timestamp
      );
      if (!hasResponse) {
        setTimeout(() => {
          fetchAIResponse(lastMsg.content);
        }, 0);
      }
    }
  }, [chatMessages, isTyping, fetchAIResponse]);

  // Translated suggestion chips
  const suggestionChips = [
    { label: t('chipRestroom', userProfile.language), query: 'Find the nearest restroom with the shortest wait time.' },
    { label: t('chipFood', userProfile.language), query: 'Suggest food vendors with low wait times that fit my profile.' },
    { label: t('chipSeat', userProfile.language), query: 'Show me directions to my seat and which gate I should enter.' },
    { label: t('chipExit', userProfile.language), query: 'What is the exit plan and transport suggestion after full time?' },
    { label: t('chipHelp', userProfile.language), query: 'EMERGENCY: I need medical support or safety assistance.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400" />

      {/* Messages Window with aria-live updates */}
      <div 
        aria-live="polite" 
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-cyan-500 text-[#0A0E27] border-cyan-400 font-medium rounded-tr-none'
                    : 'bg-white/5 text-white border-white/10 rounded-tl-none'
                }`}
              >
                <div className="space-y-1 whitespace-pre-wrap">
                  {(() => {
                    const parseLineContent = (text: string) => {
                      const boldRegex = /\*\*(.*?)\*\*/g;
                      const parts = text.split(boldRegex);
                      return parts.map((part, pIdx) =>
                        pIdx % 2 === 1 ? (
                          <strong key={pIdx} className={isUser ? 'font-extrabold text-[#0A0E27]' : 'font-extrabold text-cyan-400'}>
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      );
                    };

                    return msg.content.split('\n').map((line, lIdx) => {
                      const trimmed = line.trim();
                      if (!trimmed) return <div key={lIdx} className="h-1" />;

                      // Match bullet points starting with •, *, or -
                      if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
                        const contentText = trimmed.replace(/^[•*-]\s*/, '');
                        if (!contentText) return null;

                        return (
                          <div key={lIdx} className="flex items-start gap-1.5 ml-2 my-0.5">
                            <span className={isUser ? 'text-[#0A0E27]/70' : 'text-cyan-400'}>•</span>
                            <span className="flex-1">{parseLineContent(contentText)}</span>
                          </div>
                        );
                      }

                      // Match markdown headings
                      if (trimmed.startsWith('#')) {
                        const headingText = trimmed.replace(/^#+\s*/, '');
                        return (
                          <h4 key={lIdx} className="font-bold text-white font-outfit mt-3 mb-1 text-[11px] md:text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                            {parseLineContent(headingText)}
                          </h4>
                        );
                      }

                      return <p key={lIdx} className="my-0.5">{parseLineContent(trimmed)}</p>;
                    });
                  })()}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 rounded-tl-none">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="p-3 border-t border-white/5 flex gap-2 overflow-x-auto select-none no-scrollbar">
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip.query)}
            className="px-3 py-1.5 rounded-full border border-white/10 hover:border-cyan-400 bg-white/5 text-white/70 hover:text-white text-[10px] md:text-xs whitespace-nowrap transition-colors flex items-center gap-1 active:scale-95 shrink-0"
            aria-label={chip.label}
          >
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 md:p-4 border-t border-white/10 bg-[#0A0E27]/50 backdrop-blur-md flex gap-2 items-center">
        <button
          onClick={toggleVoiceInput}
          className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
            isListening
              ? 'bg-rose-500 border-rose-400 text-white animate-pulse'
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Voice input"
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage(inputValue);
            }
          }}
          placeholder={isListening ? 'Listening...' : 'Ask about restrooms, lines, food, parking...'}
          className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 focus:border-cyan-400 bg-[#0A0E27] text-white text-xs md:text-sm focus:outline-none"
          aria-label="Ask FANVERSE AI a question"
        />

        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0A0E27] font-bold shrink-0 disabled:opacity-40 disabled:hover:bg-cyan-500 disabled:scale-100 active:scale-95 transition-all"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {speechError && (
        <div className="absolute bottom-16 left-4 right-4 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] md:text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{speechError}</span>
        </div>
      )}
    </div>
  );
}
