'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Play, Pause, Square, X } from 'lucide-react';

interface TimerProps {
  initialMinutes?: number;
  onClose: () => void;
}

export default function Timer({ initialMinutes = 0, onClose }: TimerProps) {
  const [minutes, setMinutes] = useState(initialMinutes || 0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds > 0) {
            return prevSeconds - 1;
          } else if (minutes > 0) {
            setMinutes((prevMinutes) => prevMinutes - 1);
            return 59;
          } else {
            setIsRunning(false);
            setIsFinished(true);
            // Play notification sound
            if (audioRef.current) {
              audioRef.current.play().catch(() => {
                // Ignore audio play errors
              });
            }
            return 0;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, minutes, seconds]);

  const handleStart = () => {
    if (minutes === 0 && seconds === 0) {
      // If timer is at 0, set to 1 minute
      setMinutes(1);
      setSeconds(0);
    }
    setIsRunning(true);
    setIsFinished(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsFinished(false);
    setMinutes(initialMinutes || 0);
    setSeconds(0);
  };

  const handleSetTime = (newMinutes: number) => {
    if (!isRunning) {
      setMinutes(newMinutes);
      setSeconds(0);
      setIsFinished(false);
    }
  };

  const totalSeconds = minutes * 60 + seconds;
  const progress = initialMinutes > 0 
    ? ((initialMinutes * 60 - totalSeconds) / (initialMinutes * 60)) * 100 
    : 0;

  // Format time display
  const formatTime = (mins: number, secs: number) => {
    const total = mins * 60 + secs;
    const displayMins = Math.floor(total / 60);
    const displaySecs = total % 60;
    return `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center">
      <div 
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Clock size={24} className="text-purple-600" />
            Timer
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
            aria-label="Sluiten"
          >
            <X size={24} />
          </button>
        </div>

        {/* Timer Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-50 to-white">
          {/* Progress Ring */}
          <div className="relative w-64 h-64 mb-8">
            <svg className="transform -rotate-90 w-full h-full">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              {progress > 0 && (
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="#9333ea"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  className="transition-all duration-1000"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`text-center ${isFinished ? 'text-red-600' : 'text-gray-800'}`}>
                <div className="text-6xl font-bold mb-2">
                  {formatTime(minutes, seconds)}
                </div>
                {isFinished && (
                  <div className="text-lg font-semibold text-red-600 animate-pulse">
                    Klaar!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Time Buttons */}
          {!isRunning && (
            <div className="flex gap-2 mb-6 flex-wrap justify-center">
              {[1, 5, 10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleSetTime(mins)}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-purple-600 hover:text-purple-600 transition-colors touch-target"
                >
                  {mins}m
                </button>
              ))}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4">
            {!isRunning && !isFinished && (
              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors touch-target shadow-lg"
              >
                <Play size={24} fill="white" />
                Start
              </button>
            )}
            {isRunning && (
              <button
                onClick={handlePause}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-colors touch-target shadow-lg"
              >
                <Pause size={24} fill="white" />
                Pauzeer
              </button>
            )}
            {isFinished && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors touch-target shadow-lg"
              >
                Opnieuw
              </button>
            )}
            {(isRunning || (minutes === 0 && seconds === 0 && !isFinished)) && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors touch-target"
              >
                <Square size={20} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Hidden audio element for notification */}
        <audio ref={audioRef} preload="auto">
          <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrT356hVEApGn+DyvmwhBSuBzvLZiTYIGWi78OSfTQ8MUKfg8LZjHAY4kdfyzHksBSR3x/DdkEAKFF603+eoVRAKRp/g8r5sIQUrgc7y2Yk2CBlou/Dkn00PDFCn4PC2YxwGOJHX8sx5LAUkd8fw3ZBAC" type="audio/wav" />
        </audio>
      </div>
    </div>
  );
}


