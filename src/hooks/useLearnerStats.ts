import { useState, useEffect, useCallback } from 'react';
import { LearnerStats, VocabWord } from '../types';

const STATS_KEY = 'echospeak_learner_stats_v1';

const getTodayString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const getInitialStats = (): LearnerStats => {
  const today = getTodayString();
  const saved = localStorage.getItem(STATS_KEY);
  if (saved) {
    try {
      const parsed: LearnerStats = JSON.parse(saved);
      // Check streak date
      const lastDate = parsed.lastActiveDate;
      let newStreak = parsed.dailyStreak || 1;
      let todaySecs = parsed.todaySpeakingSeconds || 0;

      if (lastDate !== today) {
        // Calculate difference in days
        const last = new Date(lastDate);
        const current = new Date(today);
        const diffDays = Math.round((current.getTime() - last.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          // Continuous day! Keep or increment
          newStreak += 1;
        } else if (diffDays > 1) {
          // Missed a day
          newStreak = 1;
        }
        todaySecs = 0; // Reset today counter on new day
      }

      return {
        dailyStreak: newStreak,
        lastActiveDate: today,
        todaySpeakingSeconds: todaySecs,
        totalSpeakingSeconds: parsed.totalSpeakingSeconds || 0,
        totalExchanges: parsed.totalExchanges || 0,
        averageFluency: parsed.averageFluency || 85,
        savedVocab: parsed.savedVocab || [],
      };
    } catch (e) {
      console.error('Failed to parse learner stats', e);
    }
  }

  return {
    dailyStreak: 1,
    lastActiveDate: today,
    todaySpeakingSeconds: 0,
    totalSpeakingSeconds: 0,
    totalExchanges: 0,
    averageFluency: 85,
    savedVocab: [
      {
        word: 'usually',
        type: 'adv',
        meaningVi: 'thường xuyên, theo thói quen',
        ipa: '/ˈjuː.ʒu.ə.li/',
        example: 'I usually drink coffee in the morning.',
        dateAdded: getTodayString(),
      },
      {
        word: 'delicious',
        type: 'adj',
        meaningVi: 'ngon miệng',
        ipa: '/dɪˈlɪʃ.əs/',
        example: 'Vietnamese Pho is very delicious!',
        dateAdded: getTodayString(),
      },
    ],
  };
};

export function useLearnerStats() {
  const [stats, setStats] = useState<LearnerStats>(getInitialStats);

  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save learner stats to localStorage', e);
    }
  }, [stats]);

  const addSpeakingTime = useCallback((seconds: number) => {
    setStats((prev) => {
      const today = getTodayString();
      const isNewDay = prev.lastActiveDate !== today;
      return {
        ...prev,
        lastActiveDate: today,
        todaySpeakingSeconds: (isNewDay ? 0 : prev.todaySpeakingSeconds) + seconds,
        totalSpeakingSeconds: prev.totalSpeakingSeconds + seconds,
      };
    });
  }, []);

  const recordExchange = useCallback((score: number) => {
    setStats((prev) => {
      const newTotal = prev.totalExchanges + 1;
      const newAvg = Math.round((prev.averageFluency * prev.totalExchanges + score) / newTotal);
      return {
        ...prev,
        totalExchanges: newTotal,
        averageFluency: newAvg,
      };
    });
  }, []);

  const saveVocabWord = useCallback((vocab: VocabWord) => {
    setStats((prev) => {
      const exists = prev.savedVocab.some((v) => v.word.toLowerCase() === vocab.word.toLowerCase());
      if (exists) return prev;
      const updated = [
        {
          ...vocab,
          dateAdded: getTodayString(),
        },
        ...prev.savedVocab,
      ];
      return {
        ...prev,
        savedVocab: updated,
      };
    });
  }, []);

  const removeVocabWord = useCallback((word: string) => {
    setStats((prev) => ({
      ...prev,
      savedVocab: prev.savedVocab.filter((v) => v.word.toLowerCase() !== word.toLowerCase()),
    }));
  }, []);

  const isWordSaved = useCallback(
    (word: string) => {
      return stats.savedVocab.some((v) => v.word.toLowerCase() === word.toLowerCase());
    },
    [stats.savedVocab]
  );

  return {
    stats,
    addSpeakingTime,
    recordExchange,
    saveVocabWord,
    removeVocabWord,
    isWordSaved,
  };
}
