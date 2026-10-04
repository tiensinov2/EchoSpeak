import React from 'react';
import { X, Volume2, Mic, Zap, User, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voiceName: string;
  onSelectVoice: (voice: string) => void;
  pace: 'normal' | 'slow';
  onSelectPace: (pace: 'normal' | 'slow') => void;
  isContinuousCall: boolean;
  onToggleContinuousCall: () => void;
  onTestVoice: (voice: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  voiceName,
  onSelectVoice,
  pace,
  onSelectPace,
  isContinuousCall,
  onToggleContinuousCall,
  onTestVoice,
}) => {
  if (!isOpen) return null;

  const COACH_VOICES = [
    {
      id: 'Kore',
      name: 'Coach Emma (Nữ - Giọng Mỹ)',
      desc: 'Giọng nữ ấm áp, rõ ràng, rất dễ nghe cho trình độ A1-A2',
      gender: 'Nữ',
      accent: 'US English',
    },
    {
      id: 'Puck',
      name: 'Coach Liam (Nam - Giọng Mỹ)',
      desc: 'Giọng nam tự nhiên, thân thiện, ngữ điệu vui tươi',
      gender: 'Nam',
      accent: 'US English',
    },
    {
      id: 'Zephyr',
      name: 'Coach Sophia (Nữ - Giọng Anh)',
      desc: 'Giọng nữ chuẩn Anh, phát âm tròn vành rõ chữ',
      gender: 'Nữ',
      accent: 'UK English',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Cài Đặt Giọng Nói & Tương Tác
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Coach Voice Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chọn giáo viên AI & Giọng đọc:
            </label>
            <div className="space-y-2">
              {COACH_VOICES.map((coach) => {
                const isSelected = voiceName === coach.id;
                return (
                  <div
                    key={coach.id}
                    onClick={() => onSelectVoice(coach.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {coach.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {coach.accent}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{coach.desc}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTestVoice(coach.id);
                      }}
                      title="Nghe thử giọng"
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition shrink-0"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Speaking Pace */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Tốc độ nói của giáo viên:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onSelectPace('slow')}
                className={`p-3 rounded-2xl border text-left transition ${
                  pace === 'slow'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>0.75x Chậm & Rõ ràng</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Khuyên dùng cho người mới bắt đầu (A1), phát âm từng từ chi tiết.
                </p>
              </button>

              <button
                onClick={() => onSelectPace('normal')}
                className={`p-3 rounded-2xl border text-left transition ${
                  pace === 'normal'
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>1.0x Tự nhiên chuẩn</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Tốc độ đàm thoại đời thường như người bản xứ.
                </p>
              </button>
            </div>
          </div>

          {/* Interaction Flow Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Phương thức tương tác giọng nói:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => isContinuousCall && onToggleContinuousCall()}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  !isContinuousCall
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-400 mb-1">
                  <Mic className="w-4 h-4" />
                  <span>Push-to-Talk (Bấm để nói)</span>
                </div>
                <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded mb-1">
                  Khuyên dùng cho A1-A2
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Bấm giữ để nói, thả ra để gửi. Chủ động thời gian suy nghĩ từ vựng, không lo bị ngắt lời.
                </p>
              </div>

              <div
                onClick={() => !isContinuousCall && onToggleContinuousCall()}
                className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                  isContinuousCall
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-300 mb-1">
                  <Volume2 className="w-4 h-4" />
                  <span>Live Call (Rảnh tay liên tục)</span>
                </div>
                <span className="inline-block text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded mb-1">
                  Gọi điện tự do
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tự động bật mic ngay khi AI nói xong. Thích hợp khi muốn luyện phản xạ nhanh.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition active:scale-95"
          >
            Đóng & Lưu thiết lập
          </button>
        </div>
      </div>
    </div>
  );
};
