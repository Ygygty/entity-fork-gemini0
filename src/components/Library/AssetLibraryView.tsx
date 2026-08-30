import React, { useState, useMemo } from 'react';
import {
  Layers,
  BookOpen,
  Scroll,
  Headphones,
  Video,
  Users,
  FolderTree,
  Tag,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit3,
  ExternalLink,
  PenTool,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import {
  Book,
  Manuscript,
  AudioItem,
  VideoItem,
  Author,
  Category,
  Topic,
  Tag as TagType,
  EntityType,
} from '../../types';

interface AssetLibraryViewProps {
  books: Book[];
  manuscripts: Manuscript[];
  audios: AudioItem[];
  videos: VideoItem[];
  authors: Author[];
  categories: Category[];
  topics: Topic[];
  tags: TagType[];
  onOpenEntity: (type: EntityType, id: string, mode?: 'reader' | 'studio' | 'manuscripter' | 'player') => void;
  lang: 'ar' | 'en';
}

export const AssetLibraryView: React.FC<AssetLibraryViewProps> = ({
  books,
  manuscripts,
  audios,
  videos,
  authors,
  categories,
  topics,
  tags,
  onOpenEntity,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'books' | 'manuscripts' | 'audios' | 'videos' | 'authors' | 'categories'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isAr = lang === 'ar';

  const allAssets = useMemo(() => {
    return [
      ...books.map((b) => ({ ...b, itemType: 'book' as EntityType })),
      ...manuscripts.map((m) => ({ ...m, itemType: 'manuscript' as EntityType })),
      ...audios.map((a) => ({ ...a, itemType: 'audio' as EntityType })),
      ...videos.map((v) => ({ ...v, itemType: 'video' as EntityType })),
    ];
  }, [books, manuscripts, audios, videos]);

  const filteredAssets = useMemo(() => {
    return allAssets.filter((item) => {
      if (activeTab === 'books' && item.itemType !== 'book') return false;
      if (activeTab === 'manuscripts' && item.itemType !== 'manuscript') return false;
      if (activeTab === 'audios' && item.itemType !== 'audio') return false;
      if (activeTab === 'videos' && item.itemType !== 'video') return false;

      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesAuthor = item.author?.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        return matchesTitle || matchesAuthor || matchesDesc;
      }

      return true;
    });
  }, [allAssets, activeTab, selectedCategory, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAssets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAssets.map((a) => a.id));
    }
  };

  return (
    <div id="asset-library-container" className="h-[calc(100vh-62px)] flex flex-col bg-stone-950 text-stone-100 overflow-hidden">
      {/* Top Filter & Search Header */}
      <header className="p-4 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800 overflow-x-auto">
          {[
            { id: 'all', label: isAr ? 'جميع الأصول' : 'All Assets', icon: Layers, count: allAssets.length },
            { id: 'books', label: isAr ? 'الكتب والمصنفات' : 'Books', icon: BookOpen, count: books.length },
            { id: 'manuscripts', label: isAr ? 'المخطوطات' : 'Manuscripts', icon: Scroll, count: manuscripts.length },
            { id: 'audios', label: isAr ? 'المسموعات' : 'Audio', icon: Headphones, count: audios.length },
            { id: 'videos', label: isAr ? 'المرئيات' : 'Video', icon: Video, count: videos.length },
            { id: 'authors', label: isAr ? 'الأعلام والمؤلفون' : 'Authors', icon: Users, count: authors.length },
            { id: 'categories', label: isAr ? 'التصنيفات' : 'Categories', icon: FolderTree, count: categories.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedIds([]);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800">
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'تصفية وبحث...' : 'Filter assets...'}
              className="bg-transparent text-xs text-stone-200 placeholder-stone-500 focus:outline-none w-40 sm:w-56"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-stone-300 rounded-xl px-3 py-1.5 text-xs cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Main Content View */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Authors Directory Tab */}
        {activeTab === 'authors' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {authors.map((author) => (
              <div
                key={author.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-12 h-12 rounded-xl object-cover border border-amber-500/30"
                  />
                  <div>
                    <h3 className="font-bold text-stone-100 text-sm font-heritage">{author.name}</h3>
                    <p className="text-[11px] text-amber-400 font-mono">
                      (توفي {author.death_year_hijri} هـ / {author.death_year_gregorian} م)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-stone-400 line-clamp-3 leading-relaxed mb-3">{author.bio}</p>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-800">
                  <span>الأصول المرتبطة:</span>
                  <span className="font-mono text-amber-400 font-bold">{author.entities_count} مصنفات</span>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'categories' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:border-amber-500/40 transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-stone-950 text-amber-400 border border-stone-800">
                    {cat.count} أصل
                  </span>
                </div>
                <h3 className="font-bold text-stone-100 text-base mb-1 font-heritage">{cat.name}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        ) : (
          /* General Digital Assets Grid / Table */
          <div className="space-y-4">
            {/* Batch Action Bar if items selected */}
            {selectedIds.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
                <span className="text-amber-300 font-bold">
                  تم تحديد {selectedIds.length} عنصر
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert('تم تصدير العناصر المحددة كحزمة أصول رقمية');
                      setSelectedIds([]);
                    }}
                    className="px-3 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg cursor-pointer"
                  >
                    تصدير الحزمة
                  </button>
                  <button
                    onClick={() => setSelectedIds([])}
                    className="px-2 py-1 text-stone-400 hover:text-stone-200"
                  >
                    إلغاء التحديد
                  </button>
                </div>
              </div>
            )}

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map((asset) => {
                const isSelected = selectedIds.includes(asset.id);
                const Icon =
                  asset.itemType === 'book'
                    ? BookOpen
                    : asset.itemType === 'manuscript'
                    ? Scroll
                    : asset.itemType === 'audio'
                    ? Headphones
                    : Video;

                return (
                  <div
                    key={asset.id}
                    className={`bg-stone-900 border rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all flex flex-col group ${
                      isSelected ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-stone-800'
                    }`}
                  >
                    {/* Card Cover Header */}
                    <div className="h-40 bg-stone-950 relative overflow-hidden">
                      <img
                        src={asset.cover_image}
                        alt={asset.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                      {/* Select Checkbox */}
                      <button
                        onClick={() => toggleSelect(asset.id)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-md bg-stone-950/80 text-stone-300 hover:text-amber-400"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      {/* Type Badge */}
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-stone-950/80 backdrop-blur text-[10px] font-bold text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Icon className="w-3 h-3" />
                        <span>
                          {asset.itemType === 'book'
                            ? 'كتاب'
                            : asset.itemType === 'manuscript'
                            ? 'مخطوط'
                            : asset.itemType === 'audio'
                            ? 'صوتي'
                            : 'مرئي'}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-stone-100 text-sm line-clamp-2 font-heritage mb-1">
                          {asset.title}
                        </h3>
                        <p className="text-xs text-amber-400/90 font-medium">
                          {asset.author?.name || (asset as any).speaker_or_director || (asset as any).reciter_or_speaker || 'مجهول'}
                        </p>
                        <p className="text-xs text-stone-400 line-clamp-2 mt-2 leading-relaxed">
                          {asset.description}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-4 mt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onOpenEntity(asset.itemType, asset.id, 'studio')}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <PenTool className="w-3 h-3" />
                          <span>استوديو</span>
                        </button>

                        <button
                          onClick={() => {
                            const mode =
                              asset.itemType === 'book'
                                ? 'reader'
                                : asset.itemType === 'manuscript'
                                ? 'manuscripter'
                                : 'player';
                            onOpenEntity(asset.itemType, asset.id, mode);
                          }}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>عرض</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
