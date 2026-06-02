import React, { useState, useRef, useEffect } from 'react';
import { useSelection } from '../context/SelectionContext';
import AudioWave from './AudioWave';
import { Flame, Volume2, VolumeX } from 'lucide-react';
import { API_BASE } from '../lib/utils';

export default function CoachPanel({ activities }) {
  const [loading, setLoading] = useState(false);
  const [coachText, setCoachText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const audioRef = useRef(null);
  const typewriterRef = useRef(null);
  
  const { selection, currentMonth } = useSelection();

  // Typewriter effect
  useEffect(() => {
    if (!coachText) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    let i = 0;
    typewriterRef.current = setInterval(() => {
      if (i < coachText.length) {
        setDisplayedText(coachText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typewriterRef.current);
      }
    }, 30);

    return () => clearInterval(typewriterRef.current);
  }, [coachText]);

  const handleAnalyze = async () => {
    setLoading(true);
    setCoachText('');
    setIsPlaying(false);

    try {
      let currentActivities = activities || [];
      if (currentActivities.length === 0) {
        if (selection.type === 'day' && selection.date) {
          const res = await fetch(`${API_BASE}/activities/${selection.date}`);
          const data = await res.json();
          currentActivities = data.activities || [];
        } else if (selection.type === 'week' && selection.week) {
          const year = currentMonth.year;
          const month = currentMonth.month;
          const firstDay = new Date(year, month, 1);
          const startOffset = (selection.week - 1) * 7 - firstDay.getDay();
          const startDate = new Date(year, month, 1 + startOffset);
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 6);
          const start = startDate.toISOString().split('T')[0];
          const end = endDate.toISOString().split('T')[0];
          const res = await fetch(`${API_BASE}/activities/range/${start}/${end}`);
          const data = await res.json();
          currentActivities = data.flatMap((d) => d.activities || []);
        } else if (selection.type === 'month') {
          const year = selection.year;
          const month = selection.month;
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
          const res = await fetch(`${API_BASE}/activities/range/${start}/${end}`);
          const data = await res.json();
          currentActivities = data.flatMap((d) => d.activities || []);
        }
      }

      if (currentActivities.length === 0) {
        setLoading(false);
        setCoachText("No activities found for this period. Add some first.");
        return;
      }

      const res = await fetch(`${API_BASE}/coach/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: currentActivities }),
      });

      if (!res.ok) throw new Error('Analysis failed');

      const data = await res.json();
      setCoachText(data.text);

      if (data.audio) {
        const audioBlob = new Blob(
          [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
          { type: data.audioType }
        );
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsPlaying(false);
          fallbackSpeak(data.text);
        };

        audio.play().catch(() => fallbackSpeak(data.text));
      } else {
        fallbackSpeak(data.text);
      }
    } catch (err) {
      console.error('Coach analysis failed:', err);
      setCoachText("Connection failed. But excuses don't build champions. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const fallbackSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 0.8;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="w-full h-11 rounded-lg bg-neon-purple hover:bg-neon-purple/90 text-white text-sm font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-200 active-spring disabled:opacity-60 cursor-pointer btn-pulse"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Flame className="h-4 w-4" />
            Analyze Performance
          </>
        )}
      </button>

      {/* Audio Wave */}
      {isPlaying && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-neon-purple/5 border border-neon-purple/20">
          <AudioWave isPlaying={isPlaying} className="flex-1" />
          <button
            onClick={stopAudio}
            className="p-1.5 rounded-md hover:bg-sheet-bg text-slate-muted hover:text-slate-primary transition-colors cursor-pointer"
          >
            <VolumeX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Coach Text */}
      {displayedText && (
        <div className="p-4 rounded-lg bg-sheet-bg border border-sheet-border animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-lg mt-0.5">🐍</span>
            <div>
              <p className="text-xs font-semibold text-neon-purple uppercase tracking-wider mb-2">
                Mamba Coach
              </p>
              <p className="text-sm text-slate-secondary leading-relaxed font-mono">
                {displayedText}
                {displayedText.length < coachText.length && (
                  <span className="inline-block w-1.5 h-4 bg-accent-teal ml-0.5 animate-pulse" />
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
