import React from 'react';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { SessionReport, VocabWord } from '../types';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SessionReport | null;
  onSaveVocabBatch: (words: VocabWord[]) => void;
  onPlayAudio: (text: string) => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  isOpen,
  onClose,
  report,
  onSaveVocabBatch,
  onPlayAudio,
}) => {
  if (!isOpen || !report) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Celebration Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 text-3xl shadow-lg ring-4 ring-white/30">
            🏆
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Tổng Kết Buổi Luyện Nói Thoại
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Bạn đã hoàn thành xuất sắc {report.exchangesCount} lượt hội thoại trong {formatDuration(report.durationSeconds)}!
          </p>

          {/* Score badges */}
          <div className="grid grid-cols-3 gap-2 mt-5 max-w-md mx-auto">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="block text-2xl font-extrabold">{report.overallScore}</span>
              <span className="text-[10px] text-emerald-100 uppercase font-semibold">
                Tổng thể
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="block text-2xl font-extrabold">{report.grammarScore}</span>
              <span className="text-[10px] text-emerald-100 uppercase font-semibold">
                Ngữ pháp
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="block text-2xl font-extrabold">{report.vocabScore}</span>
              <span className="text-[10px] text-emerald-100 uppercase font-semibold">
                Từ vựng
              </span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Coach's Message */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Lời khuyên từ AI Coach Emma:</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {report.overallFeedbackVi}
            </p>
          </div>

          {/* Strengths */}
          {report.strengths && report.strengths.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Những điểm bạn đã làm rất tốt:</span>
              </h3>
              <div className="space-y-1.5">
                {report.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2"
                  >
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mistakes to Remember (Pedagogy) */}
          {report.improvements && report.improvements.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Các lỗi cần chú ý khắc phục:</span>
              </h3>
              <div className="space-y-2">
                {report.improvements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="line-through text-slate-400">"{item.mistake}"</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        "{item.correction}"
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      💡 {item.explanationVi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Words Learned */}
          {report.keyWordsLearned && report.keyWordsLearned.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Từ vựng đã gặp trong buổi nói:</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {report.keyWordsLearned.map((kw, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {kw.word}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {kw.ipa}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        {kw.meaningVi}
                      </span>
                    </div>
                    <button
                      onClick={() => onPlayAudio(kw.word)}
                      title="Nghe phát âm"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition active:scale-95"
          >
            Tiếp tục luyện tập chủ đề mới
          </button>
        </div>
      </div>
    </div>
  );
};
