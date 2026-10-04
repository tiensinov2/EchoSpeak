import React, { useState } from 'react';
import {
  Sun,
  UtensilsCrossed,
  Palmtree,
  Users,
  Music,
  ShoppingBag,
  Briefcase,
  Sparkles,
  PhoneCall,
  Volume2,
  PlusCircle,
  HelpCircle,
  Mic,
} from 'lucide-react';
import { Topic } from '../types';
import { PRACTICE_TOPICS } from '../data/topics';

interface TopicSelectorProps {
  onSelectTopic: (topic: Topic) => void;
  onPreviewSpeech: (text: string) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  onSelectTopic,
  onPreviewSpeech,
}) => {
  const [customTopicTitle, setCustomTopicTitle] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Map icon string to Lucide icon
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-5 h-5 text-emerald-500" />;
      case 'Palmtree':
        return <Palmtree className="w-5 h-5 text-cyan-500" />;
      case 'Users':
        return <Users className="w-5 h-5 text-rose-500" />;
      case 'Music':
        return <Music className="w-5 h-5 text-violet-500" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-teal-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-500" />;
    }
  };

  const handleStartCustomTopic = () => {
    if (!customTopicTitle.trim()) return;
    const customTopic: Topic = {
      id: `custom-${Date.now()}`,
      titleEn: customTopicTitle.trim(),
      titleVi: customTopicTitle.trim(),
      descriptionVi: 'Chủ đề tự chọn theo sở thích của bạn.',
      level: 'A1-A2',
      icon: 'Sparkles',
      starterPromptEn: `Let's have a friendly conversation about "${customTopicTitle.trim()}".`,
      starterPromptVi: `Cùng trò chuyện về chủ đề "${customTopicTitle.trim()}".`,
      starterAiMessageEn: `Hello! I would love to talk about ${customTopicTitle.trim()} with you. What do you think about it?`,
      starterAiMessageVi: `Xin chào! Mình rất hào hứng được trò chuyện về ${customTopicTitle.trim()} cùng bạn. Bạn thấy thế nào về chủ đề này?`,
      sampleKeywords: ['interesting', 'like', 'opinion', 'share'],
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    };
    setShowCustomModal(false);
    onSelectTopic(customTopic);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Welcome Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-4">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Luyện Nói Tiếng Anh Phản Xạ Tự Do (Free Conversation A1 - A2)</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          Chọn một chủ đề để bắt đầu{' '}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
            cuộc gọi thoại với AI Coach
          </span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Tương tác thoại Push-to-Talk: Bấm giữ để nói, thả ra để gửi giúp bạn thoải mái chuẩn bị câu từ mà không lo bị ngắt lời.
          AI sửa lỗi ngữ pháp song ngữ tức thì và giải thích bằng tiếng Việt dễ hiểu.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {PRACTICE_TOPICS.map((topic) => (
          <div
            key={topic.id}
            className="group relative flex flex-col justify-between p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div>
              {/* Header Icon + Level Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getIcon(topic.icon)}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {topic.level}
                </span>
              </div>

              {/* Titles */}
              <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition mb-1">
                {topic.titleVi}
              </h3>
              <p className="text-xs font-medium text-slate-400 mb-2.5">
                {topic.titleEn}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                {topic.descriptionVi}
              </p>

              {/* Starter Question Box */}
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Câu hỏi mở đầu từ Coach:
                  </span>
                  <button
                    onClick={() => onPreviewSpeech(topic.starterAiMessageEn)}
                    title="Nghe thử giọng mẫu"
                    className="p-1 rounded text-slate-400 hover:text-emerald-600 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 italic">
                  "{topic.starterAiMessageEn}"
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                  ({topic.starterAiMessageVi})
                </p>
              </div>

              {/* Key Vocab tags */}
              <div className="flex flex-wrap gap-1 mb-5">
                {topic.sampleKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Start Call Button */}
            <button
              onClick={() => onSelectTopic(topic)}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <Mic className="w-4 h-4" />
              <span>Bắt đầu luyện nói (Push-to-Talk)</span>
            </button>
          </div>
        ))}

        {/* Custom Topic Card */}
        <div
          onClick={() => setShowCustomModal(true)}
          className="group cursor-pointer flex flex-col items-center justify-center p-6 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all text-center min-h-[300px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
            Tạo chủ đề tự do của riêng bạn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mb-4">
            Bạn muốn nói về một chủ đề cụ thể (như chuẩn bị phỏng vấn, kể về thú cưng, đi xem phim)?
          </p>
          <span className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-600 group-hover:text-white text-slate-700 dark:text-slate-200 text-xs font-semibold transition">
            + Nhập chủ đề bất kỳ
          </span>
        </div>
      </div>

      {/* Custom Topic Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Chủ đề bạn muốn trò chuyện:
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập bằng tiếng Anh hoặc tiếng Việt (Ví dụ: "My favorite football club", "How I met my best friend", "Planning my trip to Da Nang")
            </p>

            <input
              type="text"
              value={customTopicTitle}
              onChange={(e) => setCustomTopicTitle(e.target.value)}
              placeholder="Nhập tên chủ đề..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleStartCustomTopic()}
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleStartCustomTopic}
                disabled={!customTopicTitle.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition"
              >
                Bắt đầu gọi ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
