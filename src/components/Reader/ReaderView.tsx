import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  Type,
  Bookmark,
  Sparkles,
  Sliders,
  Sun,
  Moon,
  Share2,
  PenTool,
  BookmarkCheck,
  Headphones,
  Maximize2,
  AlignRight,
} from 'lucide-react';
import { Book, ContentNode, Footnote, ReadingPreferences } from '../../types';

interface ReaderViewProps {
  books: Book[];
  activeBookId: string;
  onSelectBook: (id: string) => void;
  onOpenInStudio: (bookId: string, nodeId?: string) => void;
  lang: 'ar' | 'en';
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  books,
  activeBookId,
  onSelectBook,
  onOpenInStudio,
  lang,
}) => {
  const isAr = lang === 'ar';
  const currentBook = books.find((b) => b.id === activeBookId) || books[0];

  // Flatten nodes for active selection
  const allFaslNodes: ContentNode[] = useMemo(() => {
    const list: ContentNode[] = [];
    currentBook.nodes?.forEach((vol) => {
      vol.children?.forEach((bab) => {
        bab.children?.forEach((fasl) => {
          list.push(fasl);
        });
      });
    });
    return list;
  }, [currentBook]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    allFaslNodes[0]?.id || 'node-1-1-1'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showTOC, setShowTOC] = useState(true);
  const [bookmarkedNodes, setBookmarkedNodes] = useState<string[]>([]);
  const [activeFootnotePopover, setActiveFootnotePopover] = useState<Footnote | null>(null);

  // Reading preferences
  const [prefs, setPrefs] = useState<ReadingPreferences>({
    fontSize: 20,
    fontFamily: 'amiri',
    lineHeight: 2.1,
    theme: 'dark',
    showFootnotes: true,
    showTOC: true,
    autoScroll: false,
  });

  const currentNode = allFaslNodes.find((n) => n.id === selectedNodeId) || allFaslNodes[0];

  const toggleBookmark = (id: string) => {
    setBookmarkedNodes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getThemeClasses = () => {
    switch (prefs.theme) {
      case 'light':
        return 'bg-stone-50 text-stone-900 border-stone-200';
      case 'sepia':
        return 'bg-[#f4ecd8] text-[#433422] border-[#e2d5bc]';
      case 'emerald':
        return 'bg-[#062419] text-[#e1f5ee] border-[#0c4a34]';
      default:
        return 'bg-stone-900 text-stone-100 border-stone-800';
    }
  };

  const getFontFamilyClass = () => {
    switch (prefs.fontFamily) {
      case 'amiri':
        return 'font-heritage';
      case 'scheherazade':
        return 'font-quran';
      default:
        return 'font-arabic-sans';
    }
  };

  return (
    <div id="reader-container" className={`h-[calc(100vh-62px)] flex overflow-hidden ${getThemeClasses()}`}>
      {/* Sidebar: Hierarchical Table of Contents */}
      {showTOC && (
        <aside
          id="reader-toc-sidebar"
          className="w-80 border-l border-stone-800 bg-stone-950/80 backdrop-blur flex flex-col shrink-0 text-stone-200 transition-all"
        >
          {/* TOC Header */}
          <div className="p-3.5 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs">{isAr ? 'فهرس المحتويات' : 'Table of Contents'}</span>
            </div>
            <select
              value={activeBookId}
              onChange={(e) => onSelectBook(e.target.value)}
              className="bg-stone-900 text-amber-300 border border-stone-800 rounded px-2 py-1 text-[11px] font-bold max-w-[140px] truncate"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          {/* Search TOC */}
          <div className="p-2 border-b border-stone-800/60">
            <div className="flex items-center gap-2 bg-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-800">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث في أبواب الكتاب...' : 'Search chapters...'}
                className="w-full bg-transparent text-xs text-stone-200 placeholder-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tree View */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
            {currentBook.nodes?.map((vol) => (
              <div key={vol.id} className="space-y-1">
                <div className="px-2 py-1.5 font-bold text-amber-400/90 text-[11px] bg-stone-900/40 rounded flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{vol.title}</span>
                </div>

                {vol.children?.map((bab) => (
                  <div key={bab.id} className="pr-3 space-y-0.5">
                    <div className="px-2 py-1 font-semibold text-stone-300 text-[11px] text-stone-400">
                      {bab.title}
                    </div>

                    {bab.children?.map((fasl) => {
                      const isSelected = fasl.id === selectedNodeId;
                      const isBookmarked = bookmarkedNodes.includes(fasl.id);
                      if (searchQuery && !fasl.title.includes(searchQuery)) return null;

                      return (
                        <button
                          key={fasl.id}
                          onClick={() => setSelectedNodeId(fasl.id)}
                          className={`w-full text-right px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/60'
                          }`}
                        >
                          <span className="truncate">{fasl.title}</span>
                          {isBookmarked && (
                            <BookmarkCheck className="w-3 h-3 text-amber-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Reading Top Bar */}
        <header className="px-6 py-2.5 border-b border-stone-800/80 bg-stone-950/40 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTOC(!showTOC)}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
              title="إظهار/إخفاء الفهرس"
            >
              <AlignRight className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[11px] text-amber-400 font-semibold">{currentBook.title}</span>
              <h2 className="text-sm font-bold text-stone-200 truncate max-w-md font-heritage">
                {currentNode?.title}
              </h2>
            </div>
          </div>

          {/* Reading Controls */}
          <div className="flex items-center gap-2">
            {/* Font family */}
            <div className="hidden sm:flex items-center bg-stone-900 rounded-lg p-1 border border-stone-800">
              <button
                onClick={() => setPrefs({ ...prefs, fontFamily: 'amiri' })}
                className={`px-2 py-0.5 rounded text-[11px] font-heritage ${
                  prefs.fontFamily === 'amiri' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                أميري
              </button>
              <button
                onClick={() => setPrefs({ ...prefs, fontFamily: 'scheherazade' })}
                className={`px-2 py-0.5 rounded text-[11px] font-quran ${
                  prefs.fontFamily === 'scheherazade' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                شهرزاد
              </button>
              <button
                onClick={() => setPrefs({ ...prefs, fontFamily: 'sans' })}
                className={`px-2 py-0.5 rounded text-[11px] font-arabic-sans ${
                  prefs.fontFamily === 'sans' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400'
                }`}
              >
                حديث
              </button>
            </div>

            {/* Font size */}
            <div className="flex items-center bg-stone-900 rounded-lg px-2 py-1 border border-stone-800 gap-1 text-stone-300">
              <button
                onClick={() => setPrefs({ ...prefs, fontSize: Math.max(14, prefs.fontSize - 2) })}
                className="hover:text-amber-300 font-bold px-1"
              >
                أ-
              </button>
              <span className="font-mono text-[11px] text-amber-400 w-6 text-center">{prefs.fontSize}</span>
              <button
                onClick={() => setPrefs({ ...prefs, fontSize: Math.min(32, prefs.fontSize + 2) })}
                className="hover:text-amber-300 font-bold px-1"
              >
                أ+
              </button>
            </div>

            {/* Theme switcher */}
            <div className="flex items-center bg-stone-900 rounded-lg p-1 border border-stone-800 gap-1">
              <button
                onClick={() => setPrefs({ ...prefs, theme: 'dark' })}
                className={`w-5 h-5 rounded-full bg-stone-900 border border-stone-700 ${
                  prefs.theme === 'dark' ? 'ring-2 ring-amber-400' : ''
                }`}
                title="داكن"
              />
              <button
                onClick={() => setPrefs({ ...prefs, theme: 'sepia' })}
                className={`w-5 h-5 rounded-full bg-[#e8d8b8] ${
                  prefs.theme === 'sepia' ? 'ring-2 ring-amber-400' : ''
                }`}
                title="عتيق (Sepia)"
              />
              <button
                onClick={() => setPrefs({ ...prefs, theme: 'emerald' })}
                className={`w-5 h-5 rounded-full bg-[#0c4a34] ${
                  prefs.theme === 'emerald' ? 'ring-2 ring-amber-400' : ''
                }`}
                title="زمردي تراثي"
              />
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => currentNode && toggleBookmark(currentNode.id)}
              className={`p-1.5 rounded border border-stone-800 transition-colors ${
                currentNode && bookmarkedNodes.includes(currentNode.id)
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-900 text-stone-300 hover:text-amber-300'
              }`}
              title="إضافة إشارة مرجعية"
            >
              <Bookmark className="w-4 h-4" />
            </button>

            {/* Open in Studio button */}
            <button
              onClick={() => onOpenInStudio(currentBook.id, currentNode?.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md cursor-pointer transition-all"
              title="فتح الفصل في استوديو التحقيق للتحرير والمقابلة"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>تحقيق واستوديو</span>
            </button>
          </div>
        </header>

        {/* Reader Text Body */}
        <div className="flex-1 overflow-y-auto px-6 py-10 max-w-4xl mx-auto w-full">
          {currentNode ? (
            <div
              className={`prose prose-invert max-w-none ${getFontFamilyClass()}`}
              style={{
                fontSize: `${prefs.fontSize}px`,
                lineHeight: prefs.lineHeight,
              }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: currentNode.content || '' }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const fnRef = target.closest('.footnote-ref') as HTMLElement;
                  if (fnRef) {
                    const fnId = fnRef.getAttribute('data-footnote-id');
                    const fn = currentNode.footnotes?.find((f) => f.id === fnId);
                    if (fn) {
                      setActiveFootnotePopover(fn);
                    }
                  }
                }}
              />

              {/* Bottom Footnotes Section */}
              {currentNode.footnotes && currentNode.footnotes.length > 0 && (
                <div className="mt-16 pt-6 border-t-2 border-amber-500/30 text-sm font-sans space-y-3 bg-stone-950/40 p-4 rounded-xl">
                  <h4 className="text-amber-400 font-bold text-xs flex items-center gap-1.5 mb-2 font-arabic-sans">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>هوامش وحواشي التحقيق:</span>
                  </h4>
                  {currentNode.footnotes.map((fn) => (
                    <div
                      key={fn.id}
                      className="flex items-start gap-2 text-stone-300 text-xs leading-relaxed"
                    >
                      <span className="font-bold text-amber-400 min-w-5">[{fn.number}]</span>
                      <div>
                        <p>{fn.content}</p>
                        {fn.author_note && (
                          <span className="text-[11px] text-stone-400 italic block mt-0.5">
                            {fn.author_note}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-stone-500">اختر فصلاً من الفهرس للبدء في القراءة</div>
          )}
        </div>

        {/* Footnote Active Popover Dialog */}
        {activeFootnotePopover && (
          <div className="fixed bottom-6 right-6 z-50 max-w-md bg-stone-900 border border-amber-500/50 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-2">
              <span className="text-xs font-bold text-amber-400">
                حاشية رقم [{activeFootnotePopover.number}]
              </span>
              <button
                onClick={() => setActiveFootnotePopover(null)}
                className="text-stone-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-stone-200 leading-relaxed font-serif">
              {activeFootnotePopover.content}
            </p>
            {activeFootnotePopover.author_note && (
              <p className="text-[10px] text-stone-400 mt-2 italic">
                {activeFootnotePopover.author_note}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
