import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import TimelineControls from './TimelineControls';

const ReplayPlayer = ({ recording, onClose }) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [code, setCode] = useState(recording?.initialCode || '');
  const [language, setLanguage] = useState(recording?.initialLanguage || 'javascript');
  const [currentEvent, setCurrentEvent] = useState(null);
  const playbackIntervalRef = useRef(null);
  const monacoEditorRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!editorContainerRef.current || monacoEditorRef.current) return;

    const initEditor = async () => {
      const monaco = window.monaco;
      if (!monaco) {
        console.warn('Monaco not available in replay view');
        return;
      }

      const editor = monaco.editor.create(editorContainerRef.current, {
        value: code,
        language,
        theme: 'vs-dark',
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      });

      monacoEditorRef.current = editor;
    };

    initEditor();

    return () => {
      if (monacoEditorRef.current) {
        monacoEditorRef.current.dispose();
        monacoEditorRef.current = null;
      }
    };
  }, []);

  // Update editor content
  useEffect(() => {
    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        model.setValue(code);
      }
    }
  }, [code]);

  // Update language
  useEffect(() => {
    if (monacoEditorRef.current) {
      const monaco = window.monaco;
      if (monaco) {
        const model = monacoEditorRef.current.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
        }
      }
    }
  }, [language]);

  // Handle playback
  useEffect(() => {
    if (!isPlaying || !recording) {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      return;
    }

    playbackIntervalRef.current = setInterval(() => {
      setCurrentTimestamp((prev) => {
        const duration = recording.duration || 60000;
        const next = prev + 16 * speed; // ~60fps * speed

        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }

        return next;
      });
    }, 16);

    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [isPlaying, recording, speed]);

  // Find and apply events at current timestamp
  useEffect(() => {
    if (!recording?.events) return;

    // Find all events up to current timestamp
    let latestCode = recording.initialCode || '';
    let latestLanguage = recording.initialLanguage || 'javascript';
    let eventAtTimestamp = null;

    for (const event of recording.events) {
      if (event.timestamp > currentTimestamp) break;

      if (event.type === 'code-change') {
        latestCode = event.code;
        eventAtTimestamp = event;
      } else if (event.type === 'language-change') {
        latestLanguage = event.language;
      }
    }

    setCode(latestCode);
    setLanguage(latestLanguage);
    setCurrentEvent(eventAtTimestamp);
  }, [currentTimestamp, recording]);

  const duration = recording?.duration || 0;
  const progress = duration > 0 ? (currentTimestamp / duration) * 100 : 0;

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-5 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-white">{recording?.title}</h1>
            <p className="text-xs text-gray-400">
              {recording?.participants?.length || 0} participants • {formatTime(duration)}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={editorContainerRef}
          className="w-full h-full"
          style={{ backgroundColor: '#1e1e1e' }}
        />
      </div>

      {/* Timeline Controls */}
      <TimelineControls
        duration={duration}
        currentTime={currentTimestamp}
        onTimeChange={setCurrentTimestamp}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        speed={speed}
        onSpeedChange={setSpeed}
        formatTime={formatTime}
        events={recording?.events || []}
      />

      {/* Event Info */}
      {currentEvent && (
        <div className="bg-[#0F172A] border-t border-white/10 px-5 py-2 text-xs text-gray-300">
          <span className="font-semibold text-white">{currentEvent.userName}</span> made a code change at{' '}
          <span className="text-green-400">{formatTime(currentEvent.timestamp)}</span>
        </div>
      )}
    </div>
  );
};

export default ReplayPlayer;
