import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  Headphones,
  Video,
  Scroll,
  BookOpen,
  Volume2,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { Manuscript, AudioItem, VideoItem, Book, ManuscriptPage } from '../../types';

interface ReferencePaneProps {
  entityType: 'manuscript' | 'audio' | 'video' | 'book';
  manuscript?: Manuscript;
  audio?: AudioItem;
  video?: VideoItem;
  book?: Book;
  currentPageIndex: number;
  onChangePageIndex: (index: number) => void;
  currentTime?: number;
  onSeek?: (seconds: number) => void;
  lang: 'ar' | 'en';
}

export const ReferencePane: React.FC<ReferencePaneProps> = ({
  entityType,
  manuscript,
  audio,
  video,
  book,
  currentPageIndex,
  onChangePageIndex,
  currentTime = 0,
  onSeek,
  lang,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert' | 'sepia'>('normal');
  const [isPlaying, setIsPlaying] = useState(false);
  const [abLoop, setAbLoop] = useState<{ a: number | null; b: number | null }>({ a: null, b: null });

  const isAr = lang === 'ar';

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 50));
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'contrast':
        return 'contrast-150 brightness-110 saturate-125';
      case 'invert':
        return 'invert hue-rotate-180 brightness-90';
      case 'sepia':
        return 'sepia contrast-125';
      default:
        return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-950 border-r border-stone-800 select-none overflow-hidden">
      {/* Pane Header / Toolbar */}
      <div className="px-4 py-2.5 bg-stone-900/90 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {entityType === 'manuscript' && <Scroll className="w-4 h-4 text-amber-400" />}
          {entityType === 'audio' && <Headphones className="w-4 h-4 text-purple-400" />}
          {entityType === 'video' && <Video className="w-4 h-4 text-blue-400" />}
          {entityType === 'book' && <BookOpen className="w-4 h-4 text-emerald-400" />}
          <span className="text-xs font-bold text-stone-200">
            {isAr ? 'لوحة المرجع والأصل' : 'Reference Document'}
          </span>
        </div>

        {/* Manuscript Specific Controls */}
        {entityType === 'manuscript' && manuscript && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-stone-400 w-9 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs"
              title="تدوير ٩٠ درجة"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Filter mode button */}
            <button
              onClick={() => {
                const modes: Array<'normal' | 'contrast' | 'invert' | 'sepia'> = ['normal', 'contrast', 'invert', 'sepia'];
                const nextIndex = (modes.indexOf(filterMode) + 1) % modes.length;
                setFilterMode(modes[nextIndex]);
              }}
              className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[10px] text-amber-300 font-mono"
              title="تطبيق مرشحات بصرية لكشف الحبر الباهت"
            >
              {filterMode === 'normal'
                ? 'طبيعي'
                : filterMode === 'contrast'
                ? 'تباين عالي'
                : filterMode === 'invert'
                ? 'سالب (Invert)'
                : 'عتيق'}
            </button>
          </div>
        )}
      </div>

      {/* Pane Content */}
      <div className="flex-1 overflow-auto relative bg-stone-900/30 flex items-center justify-center p-4">
        {/* Manuscript View */}
        {entityType === 'manuscript' && manuscript && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {manuscript.pages[currentPageIndex] ? (
              <div
                className="relative overflow-hidden transition-transform duration-200 shadow-2xl rounded-lg border border-stone-800"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={manuscript.pages[currentPageIndex].image_url}
                  alt={`Folio ${manuscript.pages[currentPageIndex].code}`}
                  referrerPolicy="no-referrer"
                  className={`max-h-[68vh] object-contain rounded-lg transition-all ${getFilterStyle()}`}
                />
                <div className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-xs font-mono border border-amber-500/30">
                  لوحة: {manuscript.pages[currentPageIndex].code}
                </div>
              </div>
            ) : (
              <p className="text-stone-500 text-xs">لا توجد صفحة معروضة</p>
            )}
          </div>
        )}

        {/* Audio / Video View */}
        {(entityType === 'audio' || entityType === 'video') && (
          <div className="w-full max-w-md bg-stone-900/80 border border-stone-800 p-5 rounded-2xl shadow-xl flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              {entityType === 'audio' ? (
                <Headphones className="w-10 h-10 animate-bounce" />
              ) : (
                <Video className="w-10 h-10" />
              )}
            </div>

            <div className="text-center">
              <h3 className="font-bold text-stone-100 text-base">
                {audio?.title || video?.title}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                {audio?.reciter_or_speaker || video?.speaker_or_director}
              </p>
            </div>

            {/* Segments Tracker */}
            <div className="w-full bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
              <span className="text-[11px] text-amber-400 font-bold block mb-2">
                المقاطع والمشاهد الموثقة:
              </span>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {(audio?.segments || video?.segments || []).map((seg, idx) => (
                  <button
                    key={seg.id}
                    onClick={() => onSeek?.(seg.start_time)}
                    className="w-full text-right p-2 rounded-lg bg-stone-900 hover:bg-amber-500/20 text-xs text-stone-300 hover:text-amber-200 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{seg.title}</span>
                    <span className="font-mono text-[10px] text-stone-500">
                      {Math.floor(seg.start_time / 60)}:
                      {(seg.start_time % 60).toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Book Reference View */}
        {entityType === 'book' && book && (
          <div className="w-full h-full p-4 overflow-y-auto font-heritage text-stone-200 leading-relaxed text-sm bg-stone-950/40 rounded-xl border border-stone-800/50">
            <h3 className="text-base font-bold text-amber-400 mb-2 border-b border-stone-800 pb-2">
              {book.title}
            </h3>
            <p className="text-xs text-stone-400 mb-4">{book.description}</p>
            <div className="p-3 bg-stone-900/60 rounded-lg border border-stone-800">
              <span className="text-xs text-amber-400 font-bold block mb-1">بيانات الطبعة:</span>
              <p className="text-xs text-stone-300">{book.publisher} - {book.edition} ({book.publication_year})</p>
            </div>
          </div>
        )}
      </div>

      {/* Pane Footer (Page Navigation for Manuscripts) */}
      {entityType === 'manuscript' && manuscript && (
        <div className="px-4 py-2 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <button
            onClick={() => onChangePageIndex(Math.max(0, currentPageIndex - 1))}
            disabled={currentPageIndex === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-200"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{isAr ? 'السابق' : 'Prev'}</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-mono text-amber-400 font-bold">
              {currentPageIndex + 1}
            </span>
            <span>/</span>
            <span className="font-mono">{manuscript.pages.length}</span>
          </div>

          <button
            onClick={() => onChangePageIndex(Math.min(manuscript.pages.length - 1, currentPageIndex + 1))}
            disabled={currentPageIndex >= manuscript.pages.length - 1}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-stone-200"
          >
            <span>{isAr ? 'التالي' : 'Next'}</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
