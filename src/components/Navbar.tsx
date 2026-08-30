import React from 'react';
import {
  BookOpen,
  Scroll,
  Headphones,
  Video,
  PenTool,
  Search,
  BookOpenCheck,
  Layers,
  FolderSync,
  Sun,
  Moon,
  Compass,
  Globe,
} from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenGuide?: () => void;
  onOpenAI?: () => void;
  theme?: 'dark' | 'light' | 'sepia';
  onToggleTheme?: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  activeTab,
  onSelectTab,
  onTabChange,
  onOpenSearch,
  onOpenGuide,
  onOpenAI,
  theme = 'dark',
  onToggleTheme = () => {},
  lang,
  onToggleLang,
}) => {
  const isAr = lang === 'ar';
  const effectiveTab = activeTab || currentTab || 'dashboard';

  const handleSelectTab = (tab: string) => {
    if (typeof onSelectTab === 'function') {
      onSelectTab(tab);
    }
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  const navItems = [
    {
      id: 'dashboard',
      label: isAr ? 'الاستكشاف' : 'Dashboard',
      icon: Compass,
      badge: undefined,
    },
    {
      id: 'studio',
      label: isAr ? 'استوديو الكيان' : 'Entity Studio',
      icon: PenTool,
      badge: 'الذكي',
      highlight: true,
    },
    {
      id: 'reader',
      label: isAr ? 'القارئ' : 'Reader',
      icon: BookOpen,
      badge: undefined,
    },
    {
      id: 'manuscripter',
      label: isAr ? 'المخطوطات' : 'Manuscripter',
      icon: Scroll,
      badge: undefined,
    },
    {
      id: 'player',
      label: isAr ? 'مشغّل الميديا' : 'Media Player',
      icon: Headphones,
      badge: undefined,
    },
    {
      id: 'library',
      label: isAr ? 'مكتبة الأصول' : 'Asset Library',
      icon: Layers,
      badge: undefined,
    },
    {
      id: 'ingest',
      label: isAr ? 'التوريد الذكي' : 'Storage Sync',
      icon: FolderSync,
      badge: undefined,
    },
  ];

  return (
    <header
      id="entity-main-navbar"
      className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md px-4 lg:px-6 py-2.5 transition-colors"
    >
      <div className="flex items-center justify-between gap-4 max-w-[1600px] mx-auto">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            id="brand-logo-btn"
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-heritage text-xl">ك</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wide text-stone-100 font-heritage">
                  {isAr ? 'كِـيَـان' : 'ENTITY'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                  v1.0.3
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans -mt-0.5 hidden sm:block">
                {isAr ? 'منصة التحقيق وإدارة الأصول الرقمية' : 'Digital Asset & Humanities Studio'}
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = effectiveTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-stone-950 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search trigger */}
          <button
            id="global-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700 text-xs transition-all cursor-pointer shadow-inner"
            title="بحث شامل في المكتبة والمخطوطات (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{isAr ? 'بحث في الكيان...' : 'Search Entity...'}</span>
            <kbd className="hidden sm:inline-block text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded border border-stone-700 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* User & Developer Guide Button */}
          <button
            id="user-guide-btn"
            onClick={onOpenGuide || onOpenAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title={isAr ? 'دليل المستخدم والتشغيل والتطوير والصيانة' : 'User, Deployment & Developer Guide'}
          >
            <BookOpenCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isAr ? 'دليل المستخدم والتشغيل' : 'Docs & Ops Guide'}</span>
          </button>

          {/* Theme switcher */}
          <button
            id="theme-toggle-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title="تبديل المظهر"
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Language switcher */}
          <button
            id="lang-toggle-btn"
            onClick={onToggleLang}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
            title="تبديل اللغة"
          >
            <Globe className="w-3.5 h-3.5 text-stone-400" />
            <span>{isAr ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex xl:hidden overflow-x-auto py-1.5 mt-1 border-t border-stone-800/80 gap-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = effectiveTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
