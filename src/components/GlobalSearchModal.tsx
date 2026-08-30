import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  X,
  BookOpen,
  Scroll,
  Headphones,
  Video,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Book, Manuscript, AudioItem, VideoItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  manuscripts: Manuscript[];
  audios: AudioItem[];
  videos: VideoItem[];
  onOpenEntity: (type: string, id: string, mode?: 'reader' | 'studio' | 'manuscripter' | 'player') => void;
  lang: 'ar' | 'en';
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  books,
  manuscripts,
  audios,
  videos,
  onOpenEntity,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const isAr = lang === 'ar';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled externally
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const results: Array<{
      id: string;
      title: string;
      type: 'book' | 'manuscript' | 'audio' | 'video';
      subtitle: string;
      category?: string;
      author?: string;
      matchedSnippet?: string;
    }> = [];

    // Search books
    if (filterType === 'all' || filterType === 'book') {
      books.forEach((b) => {
        const matchesTitle = b.title.toLowerCase().includes(q) || (b.title_en?.toLowerCase().includes(q));
        const matchesAuthor = b.author?.name.toLowerCase().includes(q);
        const matchesDesc = b.description?.toLowerCase().includes(q);

        if (matchesTitle || matchesAuthor || matchesDesc) {
          results.push({
            id: b.id,
            title: b.title,
            type: 'book',
            subtitle: b.author?.name || 'مؤلف غير معروف',
            category: b.category?.name,
            author: b.author?.name,
          });
        }

        // Search nodes
        b.nodes?.forEach((vol) => {
          vol.children?.forEach((bab) => {
            bab.children?.forEach((fasl) => {
              if (fasl.title.toLowerCase().includes(q) || fasl.content?.toLowerCase().includes(q)) {
                results.push({
                  id: b.id,
                  title: `${b.title} ❯ ${fasl.title}`,
                  type: 'book',
                  subtitle: `ضمن: ${vol.title} - ${bab.title}`,
                  category: b.category?.name,
                  matchedSnippet: fasl.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...',
                });
              }
            });
          });
        });
      });
    }

    // Search manuscripts
    if (filterType === 'all' || filterType === 'manuscript') {
      manuscripts.forEach((m) => {
        const matchesTitle = m.title.toLowerCase().includes(q) || (m.title_en?.toLowerCase().includes(q));
        const matchesLibrary = m.library?.toLowerCase().includes(q);
        if (matchesTitle || matchesLibrary) {
          results.push({
            id: m.id,
            title: m.title,
            type: 'manuscript',
            subtitle: `${m.library} | ${m.shelf_mark}`,
            category: m.category?.name,
          });
        }
        m.pages.forEach((p) => {
          if (p.transcription?.toLowerCase().includes(q) || p.notes?.toLowerCase().includes(q)) {
            results.push({
              id: m.id,
              title: `${m.title} [لوحة ${p.code}]`,
              type: 'manuscript',
              subtitle: p.notes || 'نص محقق من المخطوط',
              matchedSnippet: p.transcription?.slice(0, 120) + '...',
            });
          }
        });
      });
    }

    // Search audio
    if (filterType === 'all' || filterType === 'audio') {
      audios.forEach((a) => {
        if (a.title.toLowerCase().includes(q) || a.album_name?.toLowerCase().includes(q)) {
          results.push({
            id: a.id,
            title: a.title,
            type: 'audio',
            subtitle: `${a.reciter_or_speaker || ''} - ${a.album_name || ''}`,
            category: a.category?.name,
          });
        }
        a.segments.forEach((s) => {
          if (s.title.toLowerCase().includes(q) || s.transcription?.toLowerCase().includes(q)) {
            results.push({
              id: a.id,
              title: `${a.title} ❯ ${s.title}`,
              type: 'audio',
              subtitle: `مقطع زمني (${Math.floor(s.start_time / 60)}:${(s.start_time % 60).toString().padStart(2, '0')})`,
              matchedSnippet: s.transcription,
            });
          }
        });
      });
    }

    // Search video
    if (filterType === 'all' || filterType === 'video') {
      videos.forEach((v) => {
        if (v.title.toLowerCase().includes(q) || v.series_name?.toLowerCase().includes(q)) {
          results.push({
            id: v.id,
            title: v.title,
            type: 'video',
            subtitle: `${v.series_name || ''} - حلقة ${v.episode_number || 1}`,
            category: v.category?.name,
          });
        }
      });
    }

    return results;
  }, [query, filterType, books, manuscripts, audios, videos]);

  if (!isOpen) return null;

  return (
    <div
      id="global-search-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-16 px-4"
      onClick={onClose}
    >
      <div
        id="global-search-modal-container"
        className="w-full max-w-2xl bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isAr ? 'ابحث في الكتب، المخطوطات، الصوتيات، النصوص وهوامش التحقيق...' : 'Search books, manuscripts, transcripts, footnotes...'}
            className="w-full bg-transparent border-none text-stone-100 placeholder-stone-500 text-sm focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-400 hover:text-stone-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[11px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded border border-stone-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-stone-950/50 border-b border-stone-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'book', label: isAr ? 'الكتب والمصنفات' : 'Books' },
            { id: 'manuscript', label: isAr ? 'المخطوطات' : 'Manuscripts' },
            { id: 'audio', label: isAr ? 'المسموعات' : 'Audio' },
            { id: 'video', label: isAr ? 'المرئيات' : 'Video' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                filterType === f.id
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800/80 text-stone-400 hover:text-stone-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-stone-800/50">
          {!query.trim() ? (
            <div className="py-12 text-center text-stone-500">
              <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
              <p className="text-sm">
                {isAr
                  ? 'اكتب للبحث في المتون، المخطوطات الأثرية، الشروح وهوامش التحقيق'
                  : 'Type to search texts, facsimiles, commentary, and footnotes'}
              </p>
              <div className="mt-4 flex justify-center gap-2 flex-wrap text-xs text-stone-400">
                <span className="text-stone-500">{isAr ? 'مقترحات:' : 'Suggestions:'}</span>
                {['ابن خلدون', 'معلقة امرئ القيس', 'العمران', 'الشفا', 'النية'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-300/80 cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-stone-500 text-sm">
              {isAr ? 'لم يتم العثور على نتائج مطابقة لكلمة البحث' : 'No results found for this query'}
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon =
                item.type === 'book'
                  ? BookOpen
                  : item.type === 'manuscript'
                  ? Scroll
                  : item.type === 'audio'
                  ? Headphones
                  : Video;

              const mode =
                item.type === 'book'
                  ? 'reader'
                  : item.type === 'manuscript'
                  ? 'manuscripter'
                  : 'player';

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="p-3 hover:bg-stone-800/60 rounded-xl transition-colors group flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => {
                    onOpenEntity(item.type, item.id, mode);
                    onClose();
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-800 text-amber-400 group-hover:bg-amber-500/20 transition-colors mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-stone-200 group-hover:text-amber-300 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-400">{item.subtitle}</p>
                      {item.matchedSnippet && (
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2 bg-stone-950/60 p-1.5 rounded border border-stone-800/60 font-serif">
                          "{item.matchedSnippet}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenEntity(item.type, item.id, 'studio');
                        onClose();
                      }}
                      className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-medium transition-colors"
                      title="فتح في الاستوديو المزدوج"
                    >
                      استوديو
                    </button>
                    <button
                      onClick={() => {
                        onOpenEntity(item.type, item.id, mode);
                        onClose();
                      }}
                      className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
