import { useState, useEffect, useRef, useCallback } from 'react';

// Declarations for browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceOptions {
  voiceName: string;
  pace: 'normal' | 'slow';
  isLiveCallMode: boolean; // Continuous loop
  onUserSpoken: (transcript: string) => void;
}

export function useVoiceInteraction({
  voiceName,
  pace,
  isLiveCallMode,
  onUserSpoken,
}: VoiceOptions) {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isMicrophoneDenied, setIsMicrophoneDenied] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const durationTimerRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const fullTranscriptAccumulator = useRef<string>('');
  const shouldListenRef = useRef<boolean>(false);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      if (final) {
        fullTranscriptAccumulator.current += (fullTranscriptAccumulator.current ? ' ' : '') + final.trim();
      }

      const activeText = fullTranscriptAccumulator.current + (interim ? ' ' + interim.trim() : '');
      setInterimTranscript(activeText);

      // In Live Call Mode (Continuous loop): reset silence timer when speech is detected
      if (isLiveCallMode && activeText.trim().length > 0) {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        // If user pauses for 1800ms in live continuous mode, automatically submit
        silenceTimerRef.current = setTimeout(() => {
          const toSend = fullTranscriptAccumulator.current.trim() || interim.trim();
          if (toSend.length > 1) {
            handleCompleteSpeech(toSend);
          }
        }, 1800);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      if (event.error === 'not-allowed') {
        setIsMicrophoneDenied(true);
        setIsListening(false);
        shouldListenRef.current = false;
      }
    };

    recognition.onend = () => {
      // If we should still be listening and AI is not speaking, auto-restart (keep-alive)
      if (shouldListenRef.current && !isAiSpeaking) {
        try {
          recognition.start();
        } catch (e) {
          // already started or stopped
        }
      } else {
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, [isLiveCallMode, isAiSpeaking]);

  // Audio level meter using Web Audio API
  const startAudioMeter = useCallback(async () => {
    try {
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
      }
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(micStreamRef.current);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0 - 100
        setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Microphone meter access error:', err);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setMicVolume(0);
  }, []);

  // Complete user speech & emit callback
  const handleCompleteSpeech = useCallback(
    (textToSend?: string) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      setRecordingSeconds(0);

      const spokenText = textToSend || fullTranscriptAccumulator.current.trim() || interimTranscript.trim();
      fullTranscriptAccumulator.current = '';
      setInterimTranscript('');

      if (spokenText.length > 0) {
        // Stop listening while AI thinks & responds
        shouldListenRef.current = false;
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        setIsListening(false);
        onUserSpoken(spokenText);
      }
    },
    [interimTranscript, onUserSpoken]
  );

  // Cancel recording without sending (helpful if user stumbles or mispronounced)
  const cancelListening = useCallback(() => {
    shouldListenRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setRecordingSeconds(0);
    fullTranscriptAccumulator.current = '';
    setInterimTranscript('');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }
    setIsListening(false);
    stopAudioMeter();
  }, [stopAudioMeter]);

  // Start listening to the microphone
  const startListening = useCallback(() => {
    if (isAiSpeaking) {
      stopAiSpeaking();
    }
    fullTranscriptAccumulator.current = '';
    setInterimTranscript('');
    setRecordingSeconds(0);
    shouldListenRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        // If already active, it's fine
        setIsListening(true);
      }
    }
    startAudioMeter();

    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    durationTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  }, [isAiSpeaking, startAudioMeter]);

  // Stop listening
  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    setRecordingSeconds(0);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    stopAudioMeter();
  }, [stopAudioMeter]);

  // Stop AI speech if currently speaking
  const stopAiSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsAiSpeaking(false);
  }, []);

  // Speak text using Gemini TTS with graceful browser SpeechSynthesis fallback
  const speakText = useCallback(
    async (text: string, overridePace?: 'normal' | 'slow'): Promise<void> => {
      stopAiSpeaking();
      stopListening();
      setIsAiSpeaking(true);

      const targetPace = overridePace || pace;
      const playbackRate = targetPace === 'slow' ? 0.8 : 1.0;

      // Try Gemini TTS server endpoint first
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voiceName,
            pace: targetPace,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.audioBase64) {
            const audioSrc = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
            const audio = new Audio(audioSrc);
            audio.playbackRate = playbackRate;
            currentAudioRef.current = audio;

            await new Promise<void>((resolve) => {
              audio.onended = () => {
                setIsAiSpeaking(false);
                currentAudioRef.current = null;
                resolve();
              };
              audio.onerror = () => {
                setIsAiSpeaking(false);
                currentAudioRef.current = null;
                resolve();
              };
              audio.play().catch(() => {
                setIsAiSpeaking(false);
                resolve();
              });
            });

            // If in continuous Live Call mode, resume listening after speaking
            if (isLiveCallMode) {
              setTimeout(() => {
                startListening();
              }, 400);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini TTS failed, falling back to Web Speech Synthesis:', err);
      }

      // Browser Web Speech fallback
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = targetPace === 'slow' ? 0.75 : 0.95;
        utterance.pitch = 1.0;

        // Choose a natural English voice if present
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(
          (v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))
        ) || voices.find((v) => v.lang.startsWith('en'));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        await new Promise<void>((resolve) => {
          utterance.onend = () => {
            setIsAiSpeaking(false);
            resolve();
          };
          utterance.onerror = () => {
            setIsAiSpeaking(false);
            resolve();
          };
          window.speechSynthesis.speak(utterance);
        });

        if (isLiveCallMode) {
          setTimeout(() => {
            startListening();
          }, 400);
        }
      } else {
        setIsAiSpeaking(false);
      }
    },
    [voiceName, pace, isLiveCallMode, stopAiSpeaking, stopListening, startListening]
  );

  return {
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
  };
}
