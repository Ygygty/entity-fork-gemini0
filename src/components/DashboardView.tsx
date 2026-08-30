import React from 'react';
import {
  BookOpen,
  Scroll,
  Headphones,
  Video,
  PenTool,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FolderSync,
  Layers,
  CheckCircle2,
  FileText,
  Activity,
  Compass,
} from 'lucide-react';
import {
  Book,
  Manuscript,
  AudioItem,
  VideoItem,
  ActivityLog,
  EntityType,
} from '../types';

interface DashboardViewProps {
  books: Book[];
  manuscripts: Manuscript[];
  audios: AudioItem[];
  videos: VideoItem[];
  activities: ActivityLog[];
  onOpenEntity: (type: EntityType, id: string, mode?: 'reader' | 'studio' | 'manuscripter' | 'player') => void;
  onNavigateTab: (tab: string) => void;
  onOpenAI: () => void;
  lang: 'ar' | 'en';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  books,
  manuscripts,
  audios,
  videos,
  activities,
  onOpenEntity,
  onNavigateTab,
  onOpenAI,
  lang,
}) => {
  const isAr = lang === 'ar';

  const stats = [
    {
      title: isAr ? 'المصنفات والكتب' : 'Books & Volumes',
      count: books.length,
      unit: isAr ? 'مجلدات محققة' : 'volumes',
      icon: BookOpen,
      color: 'from-emerald-500/20 to-emerald-950/20 text-emerald-400 border-emerald-500/30',
      actionTab: 'reader',
    },
    {
      title: isAr ? 'المخطوطات الأثرية' : 'Rare Manuscripts',
      count: manuscripts.length,
      unit: isAr ? 'نسخ خطية نادرة' : 'facsimiles',
      icon: Scroll,
      color: 'from-amber-500/20 to-amber-950/20 text-amber-400 border-amber-500/30',
      actionTab: 'manuscripter',
    },
    {
      title: isAr ? 'المسموعات والشروح' : 'Audio Recordings',
      count: audios.length,
      unit: isAr ? 'تسجيلات ومقاطع' : 'tracks',
      icon: Headphones,
      color: 'from-purple-500/20 to-purple-950/20 text-purple-400 border-purple-500/30',
      actionTab: 'player',
    },
    {
      title: isAr ? 'المرئيات والوثائقيات' : 'Video Series',
      count: videos.length,
      unit: isAr ? 'مشاهد موثقة' : 'scenes',
      icon: Video,
      color: 'from-blue-500/20 to-blue-950/20 text-blue-400 border-blue-500/30',
      actionTab: 'player',
    },
  ];

  return (
    <div id="dashboard-view-container" className="h-[calc(100vh-62px)] overflow-y-auto p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-stone-900/90 to-amber-950/30 border border-stone-800 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>منظومة الكيان للتحقيق والنشر الرقمي</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-heritage text-stone-100 leading-snug">
            {isAr
              ? 'مرحباً بك في منصة «كِيَان» للأصول الرقمية والتحقيق التراثي'
              : 'Welcome to Entity Digital Humanities Platform'}
          </h1>
          <p className="text-stone-400 text-xs md:text-sm mt-2 leading-relaxed">
            {isAr
              ? 'بيئة متكاملة تجمع بين القارئ التفاعلي المتدرج، مختبر فحص المخطوطات بالأشعة المعززة، مشغل الوسائط المقسمة زمنياً، واستوديو التحقيق المزدوج المدعوم بالذكاء الاصطناعي.'
              : 'An integrated workspace pairing hierarchical readers, facsimile labs, media scene segmentation, and dual-pane AI-assisted editorial studios.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('studio')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all active:scale-95"
            >
              <PenTool className="w-4 h-4" />
              <span>{isAr ? 'فتح استوديو التحقيق المزدوج' : 'Open Entity Studio'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('ingest')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium border border-stone-700 cursor-pointer transition-all"
            >
              <FolderSync className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'مزامنة وتوريد ملفات جديدة' : 'Storage Sync'}</span>
            </button>
          </div>
        </div>

        {/* Decorative Arabesque / Subtle Glow Pattern */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(stat.actionTab)}
              className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all hover:shadow-lg cursor-pointer group flex items-center justify-between"
            >
              <div>
                <span className="text-xs text-stone-400 font-medium block mb-1">
                  {stat.title}
                </span>
                <div className="text-2xl font-bold font-mono text-stone-100 group-hover:text-amber-300 transition-colors">
                  {stat.count}
                </div>
                <span className="text-[10px] text-stone-500 mt-0.5 block">{stat.unit}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} border flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Highlighted Workspace Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects / Featured Facsimiles */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
              <Scroll className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'المشاريع والنوادر المتاحة للتحقيق' : 'Featured Facsimiles & Texts'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('library')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'عرض المكتبة كاملة' : 'View Library'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Featured Manuscript Card */}
            {manuscripts[0] && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-stone-950 relative">
                    <img
                      src={manuscripts[0].cover_image}
                      alt={manuscripts[0].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-amber-300 font-mono">
                      مخطوط أصلي
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-100 font-heritage line-clamp-1">
                    {manuscripts[0].title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                    {manuscripts[0].description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onOpenEntity('manuscript', manuscripts[0].id, 'manuscripter')}
                    className="flex-1 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-center"
                  >
                    فحص الألواح
                  </button>
                  <button
                    onClick={() => onOpenEntity('manuscript', manuscripts[0].id, 'studio')}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-center"
                  >
                    فتح بالاستوديو
                  </button>
                </div>
              </div>
            )}

            {/* Featured Book Card */}
            {books[0] && (
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 bg-stone-950 relative">
                    <img
                      src={books[0].cover_image}
                      alt={books[0].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-emerald-300 font-mono">
                      مصنف محقق
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-stone-100 font-heritage line-clamp-1">
                    {books[0].title}
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                    {books[0].description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-stone-800 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onOpenEntity('book', books[0].id, 'reader')}
                    className="flex-1 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-center"
                  >
                    قراءة متدرجة
                  </button>
                  <button
                    onClick={() => onOpenEntity('book', books[0].id, 'studio')}
                    className="flex-1 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-center"
                  >
                    استوديو النص
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2 mb-4 pb-2 border-b border-stone-800">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'سجل العمليات والتحقيق الحديث' : 'Recent Activities'}</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-200">{act.user_name}</span>
                      <span className="text-[10px] text-stone-500">{act.timestamp}</span>
                    </div>
                    <p className="text-stone-300 font-heritage mt-0.5">{act.entity_title}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{act.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Consultation trigger */}
          <div className="pt-4 mt-4 border-t border-stone-800">
            <button
              onClick={onOpenAI}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>استشارة مساعد التحقيق الذكي</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
