import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TopicSelector } from './components/TopicSelector';
import { LiveCallView } from './components/LiveCallView';
import { VocabularyVaultModal } from './components/VocabularyVaultModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { useLearnerStats } from './hooks/useLearnerStats';
import { useVoiceInteraction } from './hooks/useVoiceInteraction';
import { Topic, Message, SessionReport, VocabWord } from './types';

export default function App() {
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Modals
  const [isVocabModalOpen, setIsVocabModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);

  // Settings
  const [voiceName, setVoiceName] = useState<string>('Kore');
  const [pace, setPace] = useState<'normal' | 'slow'>('normal');
  const [isContinuousCall, setIsContinuousCall] = useState<boolean>(false); // Push-to-Talk is now default as requested

  // Stats & Gamification hook
  const {
    stats,
    addSpeakingTime,
    recordExchange,
    saveVocabWord,
    removeVocabWord,
    isWordSaved,
  } = useLearnerStats();

  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  // Active call duration timer for gamification
  useEffect(() => {
    let interval: any = null;
    if (activeTopic) {
      interval = setInterval(() => {
        addSpeakingTime(1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTopic, addSpeakingTime]);

  // Voice Interaction Hook
  const {
    isListening,
    interimTranscript,
    recordingSeconds,
    isAiSpeaking,
    micVolume,
    speechSupported,
    isMicrophoneDenied,
    startListening,
    stopListening,
    cancelListening,
    handleCompleteSpeech,
    speakText,
    stopAiSpeaking,
  } = useVoiceInteraction({
    voiceName,
    pace,
    isLiveCallMode: isContinuousCall,
    onUserSpoken: (userSpeech: string) => {
      handleUserSpokenMessage(userSpeech);
    },
  });

  // Handle incoming user speech & AI conversation
  const handleUserSpokenMessage = useCallback(
    async (userSpeech: string) => {
      if (!userSpeech.trim() || !activeTopic) return;

      const userMsgId = `user-${Date.now()}`;
      const newUserMessage: Message = {
        id: userMsgId,
        role: 'user',
        textEn: userSpeech,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setIsProcessing(true);

      try {
        const historyPayload = messagesRef.current.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          text: m.textEn,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: activeTopic.titleEn,
            history: historyPayload,
            userMessage: userSpeech,
            voiceName,
            pace,
          }),
        });

        if (!res.ok) {
          throw new Error('API conversation call failed');
        }

        const data = await res.json();

        // Update the user's message with feedback & vocab
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMsgId
              ? {
                  ...msg,
                  feedback: data.feedback,
                  keyVocab: data.keyVocab,
                }
              : msg
          )
        );

        // Record learner score
        if (data.feedback?.fluencyScore) {
          recordExchange(data.feedback.fluencyScore);
        }

        // Add AI's reply message
        const aiMsgId = `ai-${Date.now()}`;
        const newAiMessage: Message = {
          id: aiMsgId,
          role: 'assistant',
          textEn: data.aiReplyEn,
          textVi: data.aiReplyVi,
          timestamp: Date.now(),
          suggestedReplies: data.suggestedReplies,
        };

        setMessages((prev) => [...prev, newAiMessage]);
        setIsProcessing(false);

        // Speak AI reply in English
        await speakText(data.aiReplyEn);
      } catch (err) {
        console.error('Conversation error:', err);
        setIsProcessing(false);
        const errorMsg: Message = {
          id: `ai-err-${Date.now()}`,
          role: 'assistant',
          textEn: "I'm having a little trouble hearing you. Could you say that again?",
          textVi: 'Mình đang gặp chút trục trặc kết nối. Bạn có thể nói lại câu vừa rồi được không?',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
        speakText(errorMsg.textEn);
      }
    },
    [activeTopic, voiceName, pace, recordExchange, speakText]
  );

  // Start Call with selected Topic
  const handleSelectTopic = (topic: Topic) => {
    setActiveTopic(topic);
    setSessionStartTime(Date.now());

    const initialAiMsg: Message = {
      id: `ai-init-${Date.now()}`,
      role: 'assistant',
      textEn: topic.starterAiMessageEn,
      textVi: topic.starterAiMessageVi,
      timestamp: Date.now(),
      suggestedReplies: [
        'I would like to tell you about that.',
        'That sounds interesting!',
        'Can you give me an example?',
      ],
    };

    setMessages([initialAiMsg]);

    // AI initiates call by speaking starter message
    setTimeout(() => {
      speakText(topic.starterAiMessageEn);
    }, 500);
  };

  // End Call & Generate Pedagogical Summary Report
  const handleEndCall = async () => {
    stopAiSpeaking();
    stopListening();

    const durationSeconds = sessionStartTime
      ? Math.max(10, Math.round((Date.now() - sessionStartTime) / 1000))
      : 30;

    const currentTopic = activeTopic;
    const currentMsgs = [...messages];

    // Reset call state
    setActiveTopic(null);
    setSessionStartTime(null);

    // Filter exchanges
    const exchanges = [];
    for (let i = 0; i < currentMsgs.length; i++) {
      if (currentMsgs[i].role === 'user') {
        exchanges.push({
          user: currentMsgs[i].textEn,
          feedback: currentMsgs[i].feedback,
        });
      }
    }

    if (exchanges.length === 0) {
      return;
    }

    // Call summary API
    try {
      const res = await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentTopic?.titleEn || 'General English',
          exchanges,
          durationSeconds,
        }),
      });

      if (res.ok) {
        const reportData = await res.json();
        setSessionReport({
          ...reportData,
          durationSeconds,
          exchangesCount: exchanges.length,
        });
        setIsSummaryModalOpen(true);
      }
    } catch (e) {
      console.error('Error generating summary:', e);
    }
  };

  const handleTestVoice = (voice: string) => {
    speakText('Hello! I am your AI English coach. Let us practice speaking English together!', pace);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Header bar */}
      <Header
        stats={stats}
        onOpenVocab={() => setIsVocabModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        isCalling={!!activeTopic}
        onEndCall={handleEndCall}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col">
        {!speechSupported && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs px-4 py-2 text-center">
            Trình duyệt của bạn không hỗ trợ Web Speech API tự động. Chúng tôi khuyên bạn dùng Google Chrome để có trải nghiệm giọng nói 2 chiều tốt nhất!
          </div>
        )}

        {isMicrophoneDenied && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs px-4 py-2 text-center">
            ⚠️ Quyền truy cập Micro bị chặn. Vui lòng cấp quyền Micro trên thanh địa chỉ trình duyệt để bắt đầu nói!
          </div>
        )}

        {activeTopic ? (
          <LiveCallView
            topic={activeTopic}
            messages={messages}
            isAiSpeaking={isAiSpeaking}
            isListening={isListening}
            interimTranscript={interimTranscript}
            recordingSeconds={recordingSeconds}
            micVolume={micVolume}
            coachVoiceName={voiceName}
            currentPace={pace}
            onTogglePace={() => setPace((prev) => (prev === 'normal' ? 'slow' : 'normal'))}
            onUserSpeakFinal={(text) => handleCompleteSpeech(text)}
            onStartListening={startListening}
            onStopListening={stopListening}
            onCancelListening={cancelListening}
            onEndCall={handleEndCall}
            onPlayAudio={(text) => speakText(text, pace)}
            onSaveVocab={saveVocabWord}
            isVocabSaved={isWordSaved}
            isProcessing={isProcessing}
          />
        ) : (
          <TopicSelector
            onSelectTopic={handleSelectTopic}
            onPreviewSpeech={(text) => speakText(text, pace)}
          />
        )}
      </main>

      {/* Vocabulary Vault Modal */}
      <VocabularyVaultModal
        isOpen={isVocabModalOpen}
        onClose={() => setIsVocabModalOpen(false)}
        savedVocab={stats.savedVocab}
        onRemoveWord={removeVocabWord}
        onPlayAudio={(text) => speakText(text, pace)}
      />

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        report={sessionReport}
        onSaveVocabBatch={(words) => words.forEach((w) => saveVocabWord(w as VocabWord))}
        onPlayAudio={(text) => speakText(text, pace)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        voiceName={voiceName}
        onSelectVoice={(v) => setVoiceName(v)}
        pace={pace}
        onSelectPace={(p) => setPace(p)}
        isContinuousCall={isContinuousCall}
        onToggleContinuousCall={() => setIsContinuousCall((prev) => !prev)}
        onTestVoice={handleTestVoice}
      />
    </div>
  );
}
