import React, { useState } from 'react';
import {
  Scroll,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sliders,
  Grid,
  Columns,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Copy,
  Check,
  Eye,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';
import { Manuscript, ManuscriptPage } from '../../types';

interface ManuscriptViewProps {
  manuscripts: Manuscript[];
  activeManuscriptId: string;
  onSelectManuscript: (id: string) => void;
  onOpenInStudio: (manuscriptId: string, pageIndex?: number) => void;
  lang: 'ar' | 'en';
}

export const ManuscriptView: React.FC<ManuscriptViewProps> = ({
  manuscripts,
  activeManuscriptId,
  onSelectManuscript,
  onOpenInStudio,
  lang,
}) => {
  const isAr = lang === 'ar';
  const currentManuscript =
    manuscripts.find((m) => m.id === activeManuscriptId) || manuscripts[0];

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [comparePageIndex, setComparePageIndex] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'single' | 'compare' | 'grid'>('single');
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'normal' | 'contrast' | 'invert' | 'sepia'>('normal');
  const [copied, setCopied] = useState(false);
  const [showTranscriptionDrawer, setShowTranscriptionDrawer] = useState(true);

  const currentPage = currentManuscript.pages[currentPageIndex] || currentManuscript.pages[0];
  const comparePage = currentManuscript.pages[comparePageIndex] || currentManuscript.pages[1] || currentPage;

  const handleCopyTranscription = () => {
    if (currentPage?.transcription) {
      navigator.clipboard.writeText(currentPage.transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFilterClass = () => {
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
    <div id="manuscripter-container" className="h-[calc(100vh-62px)] flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      {/* Top Header Controls Bar */}
      <header className="px-4 py-2.5 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Manuscript Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-amber-400" />
            <span className="font-bold hidden sm:inline">
              {isAr ? 'مختبر المخطوطات والنوادر' : 'Manuscript Facsimile Lab'}
            </span>
          </div>

          <select
            value={activeManuscriptId}
            onChange={(e) => {
              onSelectManuscript(e.target.value);
              setCurrentPageIndex(0);
            }}
            className="bg-stone-950 border border-stone-700 text-amber-300 font-semibold px-3 py-1 rounded-lg text-xs cursor-pointer focus:ring-1 focus:ring-amber-500"
          >
            {manuscripts.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title} ({m.library})
              </option>
            ))}
          </select>
        </div>

        {/* Center View Switcher */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => setViewMode('single')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'single' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'صفحة مفردة' : 'Single'}</span>
          </button>
          <button
            onClick={() => setViewMode('compare')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'compare' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'مقابلة نسختين' : 'Compare'}</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isAr ? 'شبكة الألواح' : 'Gallery'}</span>
          </button>
        </div>

        {/* Right Manipulation Tools */}
        <div className="flex items-center gap-2">
          {viewMode !== 'grid' && (
            <>
              <div className="flex items-center gap-1 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
                <button
                  onClick={() => setZoom((z) => Math.max(50, z - 25))}
                  className="p-1 text-stone-400 hover:text-stone-200"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-amber-400 w-9 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom((z) => Math.min(300, z + 25))}
                  className="p-1 text-stone-400 hover:text-stone-200"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded bg-stone-950 border border-stone-800 hover:bg-stone-800 text-stone-300 cursor-pointer"
                title="تدوير"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  const modes: Array<'normal' | 'contrast' | 'invert' | 'sepia'> = [
                    'normal',
                    'contrast',
                    'invert',
                    'sepia',
                  ];
                  const nextIndex = (modes.indexOf(filterMode) + 1) % modes.length;
                  setFilterMode(modes[nextIndex]);
                }}
                className="px-2 py-1 rounded bg-stone-950 border border-stone-800 hover:bg-stone-800 text-amber-400 text-xs font-mono cursor-pointer"
                title="مرشحات بصرية"
              >
                {filterMode === 'normal'
                  ? 'طبيعي'
                  : filterMode === 'contrast'
                  ? 'تباين ✦'
                  : filterMode === 'invert'
                  ? 'سالب ◐'
                  : 'عتيق 📜'}
              </button>
            </>
          )}

          <button
            onClick={() => onOpenInStudio(currentManuscript.id, currentPageIndex)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md cursor-pointer transition-all"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فتح في استوديو التحقيق</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Single Page Mode */}
        {viewMode === 'single' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* High-res Image Canvas */}
            <div className="flex-1 bg-stone-950/80 p-6 flex flex-col items-center justify-center relative overflow-auto">
              <div
                className="relative max-h-[70vh] shadow-2xl rounded-xl border border-stone-800 transition-transform duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                }}
              >
                <img
                  src={currentPage.image_url}
                  alt={`Folio ${currentPage.code}`}
                  referrerPolicy="no-referrer"
                  className={`max-h-[70vh] object-contain rounded-xl select-none ${getFilterClass()}`}
                />
                <div className="absolute top-3 right-3 px-3 py-1 bg-stone-950/85 backdrop-blur border border-amber-500/40 rounded-lg text-amber-300 font-mono text-xs shadow-lg">
                  لوحة: {currentPage.code} (الورقة {currentPage.folio_number} {currentPage.side === 'a' ? 'وجه' : 'ظهر'})
                </div>
              </div>
            </div>

            {/* Transcription & Scholarly Notes Sidebar */}
            {showTranscriptionDrawer && (
              <div className="w-full md:w-96 border-t md:border-t-0 md:border-r border-stone-800 bg-stone-900 flex flex-col p-4 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                  <h3 className="font-bold text-sm text-stone-200 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-amber-400" />
                    بيانات وتحقيق اللوحة
                  </h3>
                  <button
                    onClick={handleCopyTranscription}
                    className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer bg-stone-950 px-2 py-1 rounded border border-stone-800"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'تم النسخ' : 'نسخ النص'}</span>
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-stone-500 font-medium block mb-1">المصدر والحفظ:</span>
                    <p className="text-stone-300 font-serif">{currentManuscript.library}</p>
                    <p className="text-stone-400 font-mono mt-0.5">{currentManuscript.shelf_mark}</p>
                  </div>

                  <div>
                    <span className="text-stone-500 font-medium block mb-1">نوع الخط وتاريخ النسخ:</span>
                    <p className="text-stone-300">{currentManuscript.script_type}</p>
                    <p className="text-amber-400/90 mt-0.5">{currentManuscript.scribal_date}</p>
                  </div>

                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800">
                    <span className="text-amber-400 font-bold block mb-1 font-arabic-sans">
                      التفريغ النصي المحقق:
                    </span>
                    <p className="text-stone-100 font-heritage text-sm leading-relaxed whitespace-pre-line">
                      {currentPage.transcription || 'لم يتم تفريغ هذه اللوحة بعد.'}
                    </p>
                  </div>

                  {currentPage.notes && (
                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/20">
                      <span className="text-amber-300 font-bold block mb-1">حواشي وتعليقات الناسخ:</span>
                      <p className="text-stone-300 italic text-[11px] leading-relaxed">
                        {currentPage.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compare View (Side by Side) */}
        {viewMode === 'compare' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-x-reverse divide-stone-800 overflow-hidden">
            {/* Left Copy */}
            <div className="p-4 flex flex-col items-center justify-center bg-stone-950/60 relative">
              <div className="absolute top-3 right-3 z-10">
                <select
                  value={currentPageIndex}
                  onChange={(e) => setCurrentPageIndex(Number(e.target.value))}
                  className="bg-stone-900 border border-stone-700 text-amber-300 rounded px-2 py-1 text-xs"
                >
                  {currentManuscript.pages.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      اللوحة الأولى: {p.code}
                    </option>
                  ))}
                </select>
              </div>
              <img
                src={currentPage.image_url}
                alt="Page 1"
                referrerPolicy="no-referrer"
                className={`max-h-[65vh] object-contain rounded-lg shadow-xl ${getFilterClass()}`}
              />
            </div>

            {/* Right Copy */}
            <div className="p-4 flex flex-col items-center justify-center bg-stone-950/90 relative">
              <div className="absolute top-3 right-3 z-10">
                <select
                  value={comparePageIndex}
                  onChange={(e) => setComparePageIndex(Number(e.target.value))}
                  className="bg-stone-900 border border-stone-700 text-amber-300 rounded px-2 py-1 text-xs"
                >
                  {currentManuscript.pages.map((p, idx) => (
                    <option key={p.id} value={idx}>
                      اللوحة المقابلة: {p.code}
                    </option>
                  ))}
                </select>
              </div>
              <img
                src={comparePage.image_url}
                alt="Page 2"
                referrerPolicy="no-referrer"
                className={`max-h-[65vh] object-contain rounded-lg shadow-xl ${getFilterClass()}`}
              />
            </div>
          </div>
        )}

        {/* Gallery / Grid Mode */}
        {viewMode === 'grid' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2">
              <Grid className="w-4 h-4" />
              <span>فهرس ألواح المخطوط ({currentManuscript.pages.length} لوحة)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {currentManuscript.pages.map((page, idx) => (
                <div
                  key={page.id}
                  onClick={() => {
                    setCurrentPageIndex(idx);
                    setViewMode('single');
                  }}
                  className={`group bg-stone-900 rounded-xl border overflow-hidden cursor-pointer hover:border-amber-500 transition-all ${
                    currentPageIndex === idx ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-stone-800'
                  }`}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-stone-950 relative">
                    <img
                      src={page.thumbnail_url || page.image_url}
                      alt={page.code}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/80 px-2 py-0.5 rounded text-[10px] text-amber-300 font-mono">
                      {page.code}
                    </div>
                  </div>
                  <div className="p-2 text-center">
                    <p className="text-xs font-semibold text-stone-200 truncate">ورقة {page.folio_number}</p>
                    <p className="text-[10px] text-stone-500">{page.side === 'a' ? 'وجه (Recto)' : 'ظهر (Verso)'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Folio Navigation Strip */}
      {viewMode === 'single' && (
        <footer className="px-4 py-2 bg-stone-900 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <button
            onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
            disabled={currentPageIndex === 0}
            className="flex items-center gap-1 px-3 py-1 rounded bg-stone-950 hover:bg-stone-800 text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{isAr ? 'اللوحة السابقة' : 'Previous Folio'}</span>
          </button>

          {/* Quick Folio Jump Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xl py-1 scrollbar-none">
            {currentManuscript.pages.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => setCurrentPageIndex(idx)}
                className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                  currentPageIndex === idx
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPageIndex((p) => Math.min(currentManuscript.pages.length - 1, p + 1))
            }
            disabled={currentPageIndex >= currentManuscript.pages.length - 1}
            className="flex items-center gap-1 px-3 py-1 rounded bg-stone-950 hover:bg-stone-800 text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{isAr ? 'اللوحة التالية' : 'Next Folio'}</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </footer>
      )}
    </div>
  );
};
