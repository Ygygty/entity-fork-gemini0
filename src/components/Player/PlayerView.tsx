import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Repeat,
  Volume2,
  VolumeX,
  Sliders,
  Headphones,
  Video,
  Plus,
  Trash2,
  Edit2,
  Check,
  Sparkles,
  PenTool,
  Clock,
  Share2,
} from 'lucide-react';
import { AudioItem, VideoItem, MediaSegment } from '../../types';

interface PlayerViewProps {
  audios: AudioItem[];
  videos: VideoItem[];
  activeMediaId: string;
  activeMediaType: 'audio' | 'video';
  onSelectMedia: (type: 'audio' | 'video', id: string) => void;
  onOpenInStudio: (type: 'audio' | 'video', id: string) => void;
  lang: 'ar' | 'en';
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  audios,
  videos,
  activeMediaId,
  activeMediaType,
  onSelectMedia,
  onOpenInStudio,
  lang,
}) => {
  const isAr = lang === 'ar';
  const isAudio = activeMediaType === 'audio';

  const currentAudio = audios.find((a) => a.id === activeMediaId) || audios[0];
  const currentVideo = videos.find((v) => v.id === activeMediaId) || videos[0];
  const currentMedia = isAudio ? currentAudio : currentVideo;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentMedia?.duration || 300);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [abLoop, setAbLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });
  const [segments, setSegments] = useState<MediaSegment[]>(currentMedia?.segments || []);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(segments[0]?.id || null);

  // New Segment form
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [newSegTitle, setNewSegTitle] = useState('');
  const [newSegStart, setNewSegStart] = useState(0);
  const [newSegEnd, setNewSegEnd] = useState(60);
  const [newSegTranscript, setNewSegTranscript] = useState('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Update segments if media changes
  useEffect(() => {
    setSegments(currentMedia?.segments || []);
    setCurrentTime(0);
    setIsPlaying(false);
  }, [activeMediaId, activeMediaType]);

  // Handle Play/Pause
  const togglePlay = () => {
    const el = isAudio ? audioRef.current : videoRef.current;
    if (el) {
      if (isPlaying) {
        el.pause();
      } else {
        el.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    const el = isAudio ? audioRef.current : videoRef.current;
    if (el) {
      setCurrentTime(el.currentTime);
      if (el.duration && !isNaN(el.duration)) setDuration(el.duration);

      // A-B Loop check
      if (abLoop.a !== null && abLoop.b !== null && el.currentTime >= abLoop.b) {
        el.currentTime = abLoop.a;
      }
    }
  };

  const seekTo = (seconds: number) => {
    const el = isAudio ? audioRef.current : videoRef.current;
    if (el) {
      el.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddSegment = () => {
    if (!newSegTitle) return;
    const seg: MediaSegment = {
      id: `seg-${Date.now()}`,
      media_id: currentMedia.id,
      title: newSegTitle,
      slug: newSegTitle.toLowerCase().replace(/\s+/g, '-'),
      type: isAudio ? 'segment' : 'scene',
      start_time: newSegStart,
      end_time: newSegEnd,
      order: segments.length + 1,
      transcription: newSegTranscript,
    };
    setSegments([...segments, seg]);
    setShowAddSegment(false);
    setNewSegTitle('');
    setNewSegTranscript('');
  };

  return (
    <div id="media-player-container" className="h-[calc(100vh-62px)] flex flex-col md:flex-row bg-stone-950 text-stone-100 overflow-hidden">
      {/* Left Media Canvas & Player Controls */}
      <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-l border-stone-800 bg-stone-950/80">
        {/* Top Header */}
        <div className="p-3 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isAudio ? (
              <Headphones className="w-4 h-4 text-purple-400" />
            ) : (
              <Video className="w-4 h-4 text-blue-400" />
            )}
            <span className="font-bold">{currentMedia.title}</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={`${activeMediaType}:${activeMediaId}`}
              onChange={(e) => {
                const [t, id] = e.target.value.split(':') as ['audio' | 'video', string];
                onSelectMedia(t, id);
              }}
              className="bg-stone-950 border border-stone-700 text-amber-300 rounded px-2.5 py-1 text-xs cursor-pointer"
            >
              <optgroup label="المسموعات الصوتية">
                {audios.map((a) => (
                  <option key={a.id} value={`audio:${a.id}`}>
                    🎧 {a.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المرئيات والوثائقيات">
                {videos.map((v) => (
                  <option key={v.id} value={`video:${v.id}`}>
                    🎬 {v.title}
                  </option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={() => onOpenInStudio(activeMediaType, currentMedia.id)}
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>استوديو التوثيق</span>
            </button>
          </div>
        </div>

        {/* Media Screen Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-stone-950 relative overflow-hidden">
          {isAudio ? (
            <div className="w-full max-w-lg flex flex-col items-center gap-6">
              <audio
                ref={audioRef}
                src={currentAudio.file_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-purple-950 to-stone-900 border-2 border-purple-500/30 flex items-center justify-center shadow-2xl relative group">
                <Headphones className={`w-16 h-16 text-purple-400 ${isPlaying ? 'animate-pulse' : ''}`} />
                {isPlaying && (
                  <div className="absolute inset-0 rounded-3xl border border-purple-400/40 animate-ping" />
                )}
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-stone-100 font-heritage">{currentAudio.title}</h2>
                <p className="text-xs text-stone-400 mt-1">{currentAudio.album_name} • {currentAudio.reciter_or_speaker}</p>
              </div>

              {/* Simulated Audio Waveform */}
              <div className="w-full h-16 bg-stone-900/60 rounded-xl p-3 border border-stone-800 flex items-center gap-1 justify-between">
                {Array.from({ length: 48 }).map((_, i) => {
                  const progress = (i / 48) <= (currentTime / duration);
                  const height = 20 + Math.sin(i * 0.5) * 15 + ((i % 3) * 6);
                  return (
                    <div
                      key={i}
                      onClick={() => seekTo((i / 48) * duration)}
                      style={{ height: `${height}px` }}
                      className={`flex-1 rounded-full cursor-pointer transition-all ${
                        progress ? 'bg-amber-400' : 'bg-stone-800 hover:bg-stone-700'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="w-full max-w-2xl aspect-video bg-black rounded-2xl overflow-hidden border border-stone-800 shadow-2xl relative">
              <video
                ref={videoRef}
                src={currentVideo.file_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-contain"
                onClick={togglePlay}
              />
            </div>
          )}
        </div>

        {/* Custom Player Controls Bar */}
        <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-3">
          {/* Progress Timeline */}
          <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
            <span className="w-10 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
            <span className="w-10">{formatTime(duration)}</span>
          </div>

          {/* Main Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Play/Pause & Jumps */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => seekTo(Math.max(0, currentTime - 10))}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                title="تراجع ١٠ ثوانٍ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-500/20 font-bold transition-transform active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
                title="تقدم ١٠ ثوانٍ"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* A-B Loop Controls */}
            <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800 text-xs">
              <span className="text-stone-400 font-medium">تكرار A-B:</span>
              <button
                onClick={() => setAbLoop({ ...abLoop, a: currentTime })}
                className={`px-2 py-0.5 rounded font-mono ${
                  abLoop.a !== null ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-900 text-stone-300'
                }`}
              >
                A: {abLoop.a !== null ? formatTime(abLoop.a) : '--:--'}
              </button>
              <button
                onClick={() => setAbLoop({ ...abLoop, b: currentTime })}
                className={`px-2 py-0.5 rounded font-mono ${
                  abLoop.b !== null ? 'bg-amber-500 text-stone-950 font-bold' : 'bg-stone-900 text-stone-300'
                }`}
              >
                B: {abLoop.b !== null ? formatTime(abLoop.b) : '--:--'}
              </button>
              {(abLoop.a !== null || abLoop.b !== null) && (
                <button
                  onClick={() => setAbLoop({ a: null, b: null })}
                  className="text-stone-500 hover:text-stone-300 text-[10px] ml-1"
                >
                  إلغاء
                </button>
              )}
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800 text-xs">
              {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <button
                  key={rate}
                  onClick={() => {
                    setPlaybackRate(rate);
                    const el = isAudio ? audioRef.current : videoRef.current;
                    if (el) el.playbackRate = rate;
                  }}
                  className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
                    playbackRate === rate ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Segments & Transcription Sidebar */}
      <aside className="w-full md:w-96 bg-stone-900 flex flex-col overflow-hidden text-xs">
        {/* Sidebar Header */}
        <div className="p-3 border-b border-stone-800 flex items-center justify-between">
          <h3 className="font-bold text-stone-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>المقاطع والمشاهد المفرغة ({segments.length})</span>
          </h3>
          <button
            onClick={() => {
              setNewSegStart(Math.floor(currentTime));
              setNewSegEnd(Math.min(Math.floor(duration), Math.floor(currentTime + 60)));
              setShowAddSegment(true);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مقطع</span>
          </button>
        </div>

        {/* Add Segment Modal / Form */}
        {showAddSegment && (
          <div className="p-3 bg-stone-950 border-b border-stone-800 space-y-2.5 animate-in slide-in-from-top">
            <input
              type="text"
              placeholder="عنوان المقطع أو المشهد..."
              value={newSegTitle}
              onChange={(e) => setNewSegTitle(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-stone-500 block">البداية (ثوانٍ):</label>
                <input
                  type="number"
                  value={newSegStart}
                  onChange={(e) => setNewSegStart(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded p-1.5 text-stone-200 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 block">النهاية (ثوانٍ):</label>
                <input
                  type="number"
                  value={newSegEnd}
                  onChange={(e) => setNewSegEnd(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded p-1.5 text-stone-200 font-mono"
                />
              </div>
            </div>
            <textarea
              rows={2}
              placeholder="التفريغ النصي لهذا المقطع..."
              value={newSegTranscript}
              onChange={(e) => setNewSegTranscript(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddSegment(false)}
                className="px-3 py-1 rounded bg-stone-800 text-stone-300"
              >
                إلغاء
              </button>
              <button
                onClick={handleAddSegment}
                className="px-3 py-1 rounded bg-amber-500 text-stone-950 font-bold"
              >
                حفظ المقطع
              </button>
            </div>
          </div>
        )}

        {/* Segments List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {segments.map((seg) => {
            const isCurrent = currentTime >= seg.start_time && currentTime <= seg.end_time;
            return (
              <div
                key={seg.id}
                onClick={() => {
                  seekTo(seg.start_time);
                  setActiveSegmentId(seg.id);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500/15 border-amber-500/40 text-stone-100 shadow'
                    : 'bg-stone-950/60 border-stone-800/80 hover:bg-stone-800/50 text-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-xs text-amber-300">{seg.title}</h4>
                  <span className="font-mono text-[10px] text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                    {formatTime(seg.start_time)} - {formatTime(seg.end_time)}
                  </span>
                </div>
                {seg.transcription && (
                  <p className="text-[11px] text-stone-300 font-serif leading-relaxed line-clamp-3 mt-1 bg-stone-900/60 p-2 rounded-lg border border-stone-800/50">
                    {seg.transcription}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
};
