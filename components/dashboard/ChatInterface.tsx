'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFanverseStore } from '@/lib/store';
import { Send, Mic, MicOff, AlertCircle } from 'lucide-react';
import type { ChatMessage } from '@/types';

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

export default function ChatInterface() {
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

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);

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
        rec.lang = userProfile.language === 'ar' ? 'ar-SA' : 'en-US';

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError(null);
        };

        rec.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
        };

        rec.onerror = (event: { error: string }) => {
          console.error('Speech recognition error:', event.error);
          setSpeechError(`Voice error: ${event.error}`);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [userProfile.language]);

  const toggleVoiceInput = () => {
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

  // Quick Action chips
  const suggestionChips = [
    { label: 'Nearest restroom?', query: 'Find the nearest restroom with the shortest wait time.' },
    { label: 'Halftime food recommendations?', query: 'Suggest food vendors with low wait times that fit my profile.' },
    { label: 'Where is my seat?', query: 'Show me directions to my seat and which gate I should enter.' },
    { label: 'Best post-match exit route?', query: 'What is the exit plan and transport suggestion after full time?' },
    { label: 'I lost my child / Emergency assistance', query: 'EMERGENCY: I need medical support or safety assistance.' },
  ];

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
      setIsTyping(true);

      try {
        const history = chatMessages.slice(-6); // Send last 6 messages to keep context window small

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            stadiumState,
            userProfile,
            history,
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
        const errorMsgString = err instanceof Error ? err.message : String(err);
        console.error('Chat interface fetch error:', err);
        const errorMsg: ChatMessage = {
          id: `chat-${Date.now() + 1}`,
          role: 'assistant',
          content: `⚠️ Failed to fetch response: ${errorMsgString || 'Gemini quota limits reached.'}. Please retry or check network settings.`,
          timestamp: Date.now(),
          type: 'text',
        };
        addMessage(errorMsg);
      } finally {
        setIsTyping(false);
      }
    },
    [chatMessages, stadiumState, userProfile, addMessage]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-400" />

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                {/* Parse Markdown bold and bullet points manually for a neat layout */}
                <div className="space-y-1 whitespace-pre-wrap">
                  {msg.content.split('\n').map((line, lIdx) => {
                    // Match bullet points starting with • or *
                    if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
                      return (
                        <div key={lIdx} className="flex items-start gap-1.5 ml-2">
                          <span className={isUser ? 'text-[#0A0E27]/70' : 'text-cyan-400'}>•</span>
                          <span>{line.substring(2)}</span>
                        </div>
                      );
                    }
                    
                    // Match bold markdown tags **text**
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const parts = line.split(boldRegex);
                    if (parts.length > 1) {
                      return (
                        <div key={lIdx}>
                          {parts.map((part, pIdx) =>
                            pIdx % 2 === 1 ? (
                              <strong key={pIdx} className="font-extrabold text-white">
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </div>
                      );
                    }

                    return <p key={lIdx}>{line}</p>;
                  })}
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
        />

        <button
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim()}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#0A0E27] font-bold shrink-0 disabled:opacity-40 disabled:hover:bg-cyan-500 disabled:scale-100 active:scale-95 transition-all"
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
