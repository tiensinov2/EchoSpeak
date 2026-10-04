import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  Languages,
  Sparkles,
  Lightbulb,
  ArrowRight,
  Zap,
  X,
  Send,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Topic, Message, VocabWord } from '../types';
import { FeedbackCard } from './FeedbackCard';

interface LiveCallViewProps {
  topic: Topic;
  messages: Message[];
  isAiSpeaking: boolean;
  isListening: boolean;
  interimTranscript: string;
  recordingSeconds: number;
  micVolume: number;
  coachVoiceName: string;
  currentPace: 'normal' | 'slow';
  onTogglePace: () => void;
  onUserSpeakFinal: (text: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancelListening: () => void;
  onEndCall: () => void;
  onPlayAudio: (text: string) => void;
  onSaveVocab: (word: VocabWord) => void;
  isVocabSaved: (word: string) => boolean;
  isProcessing: boolean;
}

export const LiveCallView: React.FC<LiveCallViewProps> = ({
  topic,
  messages,
  isAiSpeaking,
  isListening,
  interimTranscript,
  recordingSeconds,
  micVolume,
  coachVoiceName,
  currentPace,
  onTogglePace,
  onUserSpeakFinal,
  onStartListening,
  onStopListening,
  onCancelListening,
  onEndCall,
  onPlayAudio,
  onSaveVocab,
  isVocabSaved,
  isProcessing,
}) => {
  const [showTranslations, setShowTranslations] = useState<{ [id: string]: boolean }>({});
  const [showHints, setShowHints] = useState<boolean>(true);
  const [pushToTalkMode, setPushToTalkMode] = useState<'hold' | 'tap'>('hold');
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const isCanceledRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isProcessing]);

  const toggleTranslation = (id: string) => {
    setShowTranslations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Hold-to-Talk Mouse & Touch handlers
  const handleHoldStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isAiSpeaking || isProcessing) return;
    isCanceledRef.current = false;
    setIsPressing(true);
    onStartListening();
  };

  const handleHoldEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isPressing) return;
    setIsPressing(false);

    if (isCanceledRef.current) {
      isCanceledRef.current = false;
      return;
    }

    // Small delay to capture final phonemes
    setTimeout(() => {
      onStopListening();
      if (interimTranscript.trim().length > 0) {
        onUserSpeakFinal(interimTranscript);
      }
    }, 200);
  };

  const handleCancelHolding = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    isCanceledRef.current = true;
    setIsPressing(false);
    onCancelListening();
  };

  // Tap-to-Talk Click handler
  const handleTapToggle = () => {
    if (isAiSpeaking || isProcessing) return;

    if (isListening) {
      onStopListening();
      if (interimTranscript.trim().length > 0) {
        onUserSpeakFinal(interimTranscript);
      }
    } else {
      onStartListening();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const latestAiMessage = [...messages].reverse().find((m) => m.role === 'assistant');
  const suggestedReplies = latestAiMessage?.suggestedReplies || [
    'I agree with you.',
    'Could you please say that again?',
    'That sounds very interesting!',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto px-3 sm:px-4 py-3">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xs mb-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className={`w-11 h-11 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-md transition-transform duration-300 ${
                isAiSpeaking ? 'scale-110 ring-4 ring-emerald-400/40 animate-pulse' : ''
              }`}
            >
              👩‍🏫
            </div>
            {isAiSpeaking && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 items-center justify-center text-[9px] text-white">
                  ●
                </span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                Coach Emma
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold tracking-wide">
                Push-to-Talk (Bấm để nói)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-md">
              Chủ đề: <span className="font-semibold text-slate-700 dark:text-slate-300">{topic.titleVi}</span>
            </p>
          </div>
        </div>

        {/* Speed toggle & End Call */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePace}
            title={currentPace === 'slow' ? 'Tốc độ: 0.75x Chậm rõ' : 'Tốc độ: 1.0x Tự nhiên'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${
              currentPace === 'slow'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>{currentPace === 'slow' ? '0.75x Chậm' : '1.0x'}</span>
          </button>

          <button
            onClick={onEndCall}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tổng kết buổi nói</span>
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 rounded-2xl p-2 sm:p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const isTranslated = showTranslations[msg.id];

          return (
            <div
              key={msg.id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-3.5 shadow-xs transition-all ${
                  isUser
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200/80 dark:border-slate-700 rounded-bl-xs'
                }`}
              >
                {/* Speaker Header */}
                <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                  <span className="font-semibold">
                    {isUser ? 'Bạn' : 'Coach Emma'}
                  </span>
                  {!isUser && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onPlayAudio(msg.textEn)}
                        title="Nghe lại câu này"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>
                      {msg.textVi && (
                        <button
                          onClick={() => toggleTranslation(msg.id)}
                          title="Dịch nhanh sang tiếng Việt"
                          className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition ${
                            isTranslated
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:text-emerald-600'
                          }`}
                        >
                          <Languages className="w-3 h-3" />
                          <span>{isTranslated ? 'Ẩn dịch' : 'Dịch TV'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* English Message Text */}
                <p className="text-sm sm:text-base leading-relaxed font-normal">
                  {msg.textEn}
                </p>

                {/* Instant Vietnamese Translation (User Option 4) */}
                {isTranslated && msg.textVi && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl">
                    <span className="font-semibold block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
                      Bản dịch tiếng Việt:
                    </span>
                    {msg.textVi}
                  </div>
                )}
              </div>

              {/* Direct Bilingual Feedback Card under user messages (User Option 3) */}
              {isUser && msg.feedback && (
                <div className="w-full max-w-[95%] sm:max-w-[85%] mt-1 mb-2">
                  <FeedbackCard
                    userSpeech={msg.textEn}
                    feedback={msg.feedback}
                    keyVocab={msg.keyVocab}
                    onSaveVocab={onSaveVocab}
                    isVocabSaved={isVocabSaved}
                    onPlaySentenceAudio={onPlayAudio}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript when user is speaking */}
        {isListening && (
          <div className="flex flex-col items-end">
            <div className="max-w-[85%] rounded-2xl p-3.5 bg-emerald-500/20 border-2 border-emerald-500 text-emerald-950 dark:text-emerald-200 rounded-br-xs animate-pulse">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Đang thu âm giọng bạn ({formatTimer(recordingSeconds)})
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {pushToTalkMode === 'hold' ? 'Thả nút để gửi' : 'Bấm Gửi khi nói xong'}
                </span>
              </div>
              <p className="text-sm font-semibold italic">
                {interimTranscript ? `"${interimTranscript}"` : 'Đang lắng nghe... Hãy nói to rõ nhé!'}
              </p>
            </div>
          </div>
        )}

        {/* Thinking / AI Processing State */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 max-w-[60%] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-xs shadow-xs">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></div>
            </div>
            <span>Emma đang lắng nghe & đánh giá câu nói của bạn...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Reply Hints for A1-A2 (Scaffolding) */}
      {showHints && !isAiSpeaking && !isProcessing && (
        <div className="mt-2.5 px-1">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
              <Lightbulb className="w-3.5 h-3.5" />
              Gợi ý câu trả lời (Bí từ? Bấm để nghe mẫu hoặc nói theo nhé):
            </span>
            <button
              onClick={() => setShowHints(false)}
              className="text-[11px] hover:underline"
            >
              Ẩn
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {suggestedReplies.map((reply, i) => (
              <div
                key={i}
                className="flex items-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-2xs overflow-hidden"
              >
                <button
                  onClick={() => onUserSpeakFinal(reply)}
                  className="px-3 py-1.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600 text-xs font-medium text-left transition"
                >
                  "{reply}"
                </button>
                <button
                  onClick={() => onPlayAudio(reply)}
                  title="Nghe phát âm câu mẫu này"
                  className="px-2 py-1.5 border-l border-slate-100 dark:border-slate-700/60 text-slate-400 hover:text-emerald-600 transition"
                >
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom PUSH-TO-TALK Control Bar */}
      <div className="mt-3 p-3 sm:p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-md">
        {/* Mode Selector & Status info */}
        <div className="flex items-center justify-between mb-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              Chế độ nói:
            </span>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setPushToTalkMode('hold')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  pushToTalkMode === 'hold'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Bấm giữ để nói
              </button>
              <button
                onClick={() => setPushToTalkMode('tap')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  pushToTalkMode === 'tap'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Bấm 1 chạm bật/gửi
              </button>
            </div>
          </div>

          {/* Recording Timer or Ready State */}
          <div>
            {isListening ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Đang ghi âm: {formatTimer(recordingSeconds)}</span>
              </span>
            ) : isAiSpeaking ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                <span>Emma đang nói...</span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Sẵn sàng lắng nghe bạn
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div className="flex items-center justify-center gap-1 h-7 mb-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          {[20, 45, 75, 100, 60, 85, 40, 95, 50, 70, 30, 80, 55, 90, 35].map((h, i) => {
            const heightPercent = isListening
              ? Math.max(15, (micVolume / 100) * h)
              : isAiSpeaking
              ? Math.max(20, Math.sin(Date.now() / 180 + i) * 35 + 50)
              : 12;

            return (
              <div
                key={i}
                style={{ height: `${heightPercent}%` }}
                className={`w-1 rounded-full transition-all duration-75 ${
                  isListening
                    ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                    : isAiSpeaking
                    ? 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Main Push-To-Talk Button Action Area */}
        <div className="flex items-center justify-center gap-3">
          {/* Cancel button if currently recording */}
          {isListening && (
            <button
              onClick={handleCancelHolding}
              title="Hủy lượt nói này nếu bạn bị vấp từ"
              className="px-3.5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition active:scale-95 flex items-center gap-1.5 shadow-xs"
            >
              <X className="w-4 h-4" />
              <span>Hủy câu này</span>
            </button>
          )}

          {/* Primary Push-to-Talk Interactive Button */}
          {pushToTalkMode === 'hold' ? (
            <button
              onMouseDown={handleHoldStart}
              onMouseUp={handleHoldEnd}
              onTouchStart={handleHoldStart}
              onTouchEnd={handleHoldEnd}
              disabled={isAiSpeaking || isProcessing}
              className={`flex-1 max-w-md py-3.5 px-6 rounded-2xl font-bold text-sm select-none transition-all duration-150 flex items-center justify-center gap-3 shadow-lg active:scale-98 ${
                isPressing || isListening
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white ring-4 ring-rose-400/40 scale-102 shadow-rose-600/30'
                  : isAiSpeaking || isProcessing
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25 hover:shadow-xl'
              }`}
            >
              <Mic className={`w-5 h-5 ${isPressing || isListening ? 'animate-pulse' : ''}`} />
              <span>
                {isPressing || isListening
                  ? 'ĐANG THU ÂM... (THẢ RA ĐỂ GỬI CÂU)'
                  : 'BẤM & GIỮ ĐỂ NÓI (THẢ ĐỂ GỬI)'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleTapToggle}
              disabled={isAiSpeaking || isProcessing}
              className={`flex-1 max-w-md py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-150 flex items-center justify-center gap-3 shadow-lg active:scale-98 ${
                isListening
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white ring-4 ring-rose-400/40 shadow-rose-600/30'
                  : isAiSpeaking || isProcessing
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25'
              }`}
            >
              {isListening ? (
                <>
                  <Send className="w-5 h-5 animate-pulse" />
                  <span>BẤM VÀO ĐÂY ĐỂ GỬI CÂU NÓI</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>BẤM 1 CHẠM ĐỂ BẮT ĐẦU NÓI</span>
                </>
              )}
            </button>
          )}

          {/* Quick Send if Tap mode has transcript */}
          {pushToTalkMode === 'tap' && isListening && interimTranscript.trim().length > 0 && (
            <button
              onClick={() => {
                onStopListening();
                onUserSpeakFinal(interimTranscript);
              }}
              className="px-4 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Gửi ngay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
