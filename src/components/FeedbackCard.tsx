import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Volume2, Bookmark, BookmarkCheck, Sparkles, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { FeedbackData, VocabWord } from '../types';

interface FeedbackCardProps {
  userSpeech: string;
  feedback: FeedbackData;
  keyVocab?: VocabWord[];
  onSaveVocab: (word: VocabWord) => void;
  isVocabSaved: (word: string) => boolean;
  onPlaySentenceAudio: (text: string) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  userSpeech,
  feedback,
  keyVocab = [],
  onSaveVocab,
  isVocabSaved,
  onPlaySentenceAudio,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-xs transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-4 py-2.5 flex items-center justify-between cursor-pointer select-none border-b transition-colors ${
          feedback.isCorrect
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40 text-amber-800 dark:text-amber-300'
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          {feedback.isCorrect ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          )}
          <span>
            {feedback.isCorrect
              ? 'Phản hồi: Rất chuẩn xác & tự nhiên!'
              : 'Gợi ý sửa lỗi & Cách nói tự nhiên hơn'}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/80 dark:bg-slate-800/80 shadow-2xs">
            {feedback.fluencyScore} điểm
          </span>
        </div>

        <button className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
          {/* Comparison */}
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 w-16 shrink-0 mt-0.5">
                Bạn nói:
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-medium italic">
                "{userSpeech}"
              </span>
            </div>

            <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:text-emerald-200">
              <div className="flex items-start gap-2">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 w-16 shrink-0 mt-0.5">
                  Nên nói:
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                  "{feedback.betterVersion}"
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaySentenceAudio(feedback.betterVersion);
                }}
                title="Nghe mẫu câu chuẩn"
                className="p-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 transition shrink-0 active:scale-90"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vietnamese Explanation */}
          {feedback.explanationVi && (
            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 mb-1">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Giải thích ngữ pháp & cách dùng:</span>
              </div>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-xs">
                {feedback.explanationVi}
              </p>
            </div>
          )}

          {/* Pronunciation & IPA Tips */}
          {feedback.pronunciationTips && feedback.pronunciationTips.length > 0 && (
            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
              <span className="font-semibold text-blue-700 dark:text-blue-400 block mb-1">
                🗣 Mẹo phát âm & phiên âm IPA:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 text-[11px]">
                {feedback.pronunciationTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement Praise */}
          {feedback.praiseVi && (
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>{feedback.praiseVi}</span>
            </div>
          )}

          {/* Key Vocabulary from this turn */}
          {keyVocab && keyVocab.length > 0 && (
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Từ vựng mới nổi bật (A1 - A2):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {keyVocab.map((item, idx) => {
                  const saved = isVocabSaved(item.word);
                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between gap-2"
                    >
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {item.word}
                          </span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {item.type}
                          </span>
                          <span className="text-[10px] text-slate-400 italic">
                            {item.ipa}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                          {item.meaningVi}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onPlaySentenceAudio(item.word)}
                          title="Nghe phát âm"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSaveVocab(item)}
                          title={saved ? 'Đã lưu trong Sổ từ vựng' : 'Lưu vào Sổ từ vựng'}
                          className={`p-1 rounded transition ${
                            saved
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'text-slate-400 hover:text-emerald-600'
                          }`}
                        >
                          {saved ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
