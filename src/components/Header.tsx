import React from 'react';
import { Flame, Clock, BookOpen, Settings, Sparkles, Volume2 } from 'lucide-react';
import { LearnerStats } from '../types';

interface HeaderProps {
  stats: LearnerStats;
  onOpenVocab: () => void;
  onOpenSettings: () => void;
  isCalling: boolean;
  onEndCall?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenVocab,
  onOpenSettings,
  isCalling,
  onEndCall,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold">
            <Volume2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                EchoSpeak
              </span>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                Level A1 - A2
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              AI Voice English Coach for Beginners
            </p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak */}
          <div
            title="Chuỗi ngày học liên tục"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs font-semibold shadow-xs"
          >
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
            <span>{stats.dailyStreak} ngày</span>
          </div>

          {/* Today's Speaking Time */}
          <div
            title="Thời gian đã luyện nói hôm nay"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 text-xs font-semibold"
          >
            <Clock className="w-4 h-4 text-blue-500" />
            <span>{formatTime(stats.todaySpeakingSeconds)}</span>
          </div>

          {/* Vocabulary Vault Button */}
          <button
            onClick={onOpenVocab}
            title="Sổ từ vựng đã lưu"
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Từ vựng</span>
            {stats.savedVocab.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                {stats.savedVocab.length}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Cài đặt giọng đọc & tốc độ"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* End Call Button if in call */}
          {isCalling && onEndCall && (
            <button
              onClick={onEndCall}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>Kết thúc</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
