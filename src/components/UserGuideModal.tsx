import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Terminal,
  Database,
  HardDrive,
  Cpu,
  Wrench,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Search,
  X,
  FileCode2,
  FolderSync,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  Server,
  AlertTriangle,
  RefreshCw,
  Zap,
  Code,
  FileText,
  Boxes,
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'ar' | 'en';
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<
    'quickstart' | 'storage' | 'database' | 'developer' | 'maintenance' | 'toolbox'
  >('quickstart');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Health State
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  const fetchHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (e) {
      console.warn('Could not fetch health:', e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadFile = (content: string, filename: string, mimeType: string = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    {
      id: 'quickstart' as const,
      label: isAr ? 'التشغيل المحلي الفعلي' : 'Local Deployment',
      icon: Terminal,
      badge: isAr ? 'الأهم' : 'Essential',
    },
    {
      id: 'storage' as const,
      label: isAr ? 'التخزين والملفات الحقيقية' : 'Physical Storage',
      icon: HardDrive,
    },
    {
      id: 'database' as const,
      label: isAr ? 'مخطط قواعد البيانات' : 'Database & SQL',
      icon: Database,
    },
    {
      id: 'developer' as const,
      label: isAr ? 'دليل التطوير والـ APIs' : 'Developer & APIs',
      icon: FileCode2,
    },
    {
      id: 'maintenance' as const,
      label: isAr ? 'الصيانة واستكشاف الأخطاء' : 'Maintenance & Ops',
      icon: Wrench,
    },
    {
      id: 'toolbox' as const,
      label: isAr ? 'صندوق أدوات التشغيل' : 'Ops Toolbox',
      icon: Cpu,
      badge: 'Live',
    },
  ];

  return (
    <div
      id="user-guide-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="user-guide-modal-container"
        className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-stone-950/60 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 font-bold shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-stone-100 font-heritage">
                  {isAr ? 'دليل التشغيل والتطوير والصيانة الشامل' : 'Entity Platform - Master Docs & Ops Guide'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  v1.0.3 Production-Ready
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {isAr
                  ? 'المرجع الرسمي لتشغيل المنصة محلياً مع قاعدة بيانات علائقية وتخزين فيزيائي حقيقي وتطويرها وصيانتها'
                  : 'Complete handbook for local setup, relational database engines, physical storage disks, and maintenance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
              title={isAr ? 'إغلاق الدليل' : 'Close Guide'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-4 py-2 bg-stone-950/90 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-stone-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-stone-900/50">
          {/* TAB 1: QUICKSTART & LOCAL DEPLOYMENT */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6 max-w-5xl">
              {/* Introduction Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-stone-900 to-emerald-500/15 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-stone-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'التشغيل المحلي الفعلي على جهازك' : 'Run Locally on Your Machine'}</span>
                  </h3>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    {isAr
                      ? 'التطبيق جاهز بالكامل للعمل محلياً بملفات وسائط فيزيائية حقيقية وقواعد بيانات علائقية كاملة مع دعم التخزين الدائم وبث الميديا السريع.'
                      : 'The platform is fully configured to run with physical filesystem storage, relational database backends, and streaming.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('toolbox')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فحص السيرفر المباشر' : 'Live Health Check'}</span>
                  </button>
                </div>
              </div>

              {/* Step by step installation */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-stone-200 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'خطوات التشغيل السريع (٣ خطوات فقط):' : 'Quickstart in 3 Steps:'}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Step 1 */}
                  <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                          1
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">npm install</span>
                      </div>
                      <h5 className="font-bold text-xs text-stone-200">
                        {isAr ? 'تثبيت حزم الاعتمادات' : 'Install Dependencies'}
                      </h5>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isAr
                          ? 'تنزيل حزم الخادم Express ومكتبات React 19 والواجهة البرمجية.'
                          : 'Download Express server, React 19, and UI libraries.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-900 flex items-center justify-between">
                      <code className="text-[11px] font-mono text-amber-300">npm install</code>
                      <button
                        onClick={() => copyToClipboard('npm install', 'step1')}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                        title="نسخ الأمر"
                      >
                        {copiedKey === 'step1' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                          2
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">setup:local</span>
                      </div>
                      <h5 className="font-bold text-xs text-stone-200">
                        {isAr ? 'تهيئة مجلدات التخزين والبيانات' : 'Bootstrap Storage & DB'}
                      </h5>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isAr
                          ? 'توليد مجلدات `/storage` والكتب والمخطوطات الفيزيائية على القرص.'
                          : 'Creates physical storage directories and seeds sample assets.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-900 flex items-center justify-between">
                      <code className="text-[11px] font-mono text-amber-300">npm run setup:local</code>
                      <button
                        onClick={() => copyToClipboard('npm run setup:local', 'step2')}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                        title="نسخ الأمر"
                      >
                        {copiedKey === 'step2' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center border border-amber-500/30">
                          3
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">:3000</span>
                      </div>
                      <h5 className="font-bold text-xs text-stone-200">
                        {isAr ? 'تشغيل الخادم والتطبيق' : 'Start Fullstack Dev Server'}
                      </h5>
                      <p className="text-[11px] text-stone-400 leading-relaxed">
                        {isAr
                          ? 'تشغيل السيرفر الموحد، ثم فتح المتصفح على localhost:3000.'
                          : 'Launches backend & frontend on http://localhost:3000.'}
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-stone-900 flex items-center justify-between">
                      <code className="text-[11px] font-mono text-amber-300">npm run dev</code>
                      <button
                        onClick={() => copyToClipboard('npm run dev', 'step3')}
                        className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200"
                        title="نسخ الأمر"
                      >
                        {copiedKey === 'step3' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Docker Option */}
              <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-stone-200">
                      {isAr ? 'خيار التشغيل عبر Docker Compose مع PostgreSQL 16' : 'Option: Run with Docker Compose & PostgreSQL 16'}
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/api/system/docker-compose')
                        .then((r) => r.text())
                        .then((txt) => downloadFile(txt, 'docker-compose.yml', 'text/yaml'));
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>docker-compose.yml</span>
                  </button>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl font-mono text-xs text-stone-300 flex items-center justify-between">
                  <code>docker compose up -d</code>
                  <button
                    onClick={() => copyToClipboard('docker compose up -d', 'docker')}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200"
                  >
                    {copiedKey === 'docker' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHYSICAL STORAGE & DISKS */}
          {activeTab === 'storage' && (
            <div className="space-y-6 max-w-5xl">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'هندسة التخزين الفيزيائي والأقراص المتعددة' : 'Physical Storage Disks & Directory Architecture'}</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isAr
                    ? 'يتم تخزين جميع ملفات المخطوطات والكتب والصوتيات والمرئيات في مجلدات فيزيائية حقيقية ترتبط مباشرة بسجلات قاعدة البيانات.'
                    : 'All manuscripts, books, audio files, and video lessons are saved to actual physical disk locations.'}
                </p>
              </div>

              {/* Directory Tree Visualization */}
              <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 font-mono text-xs text-stone-300 space-y-2">
                <div className="text-amber-400 font-bold mb-3 flex items-center gap-2">
                  <FolderSync className="w-4 h-4" />
                  <span>/storage (Physical Disk Root)</span>
                </div>
                <div className="pl-4 space-y-2 border-l border-stone-800">
                  <div className="text-emerald-400">
                    ├── 📁 <span className="font-bold text-stone-200">books/</span>{' '}
                    <span className="text-stone-500"># المصنفات والكتب المحققة بصيغ Markdown و PDF</span>
                    <div className="pl-6 text-stone-400 text-[11px]">
                      └── 📁 asrar_al-balaghah/Volume_1/01_Muqaddimah.md
                    </div>
                  </div>
                  <div className="text-blue-400">
                    ├── 📁 <span className="font-bold text-stone-200">manuscripts/</span>{' '}
                    <span className="text-stone-500"># صور المخطوطات واللوحات الأصلية عالية الدقة (Facsimiles)</span>
                    <div className="pl-6 text-stone-400 text-[11px]">
                      └── 📁 andalus_collection_ms42/folios/001a_unwan_fatiha.jpg
                    </div>
                  </div>
                  <div className="text-purple-400">
                    ├── 📁 <span className="font-bold text-stone-200">media/</span>{' '}
                    <span className="text-stone-500"># الأصول الصوتية والمرئية وشروح الدروس التراثية</span>
                    <div className="pl-6 text-stone-400 text-[11px]">
                      ├── 📁 audio/durus_al-alfiyyah/Vol_01/01_Bab_Al-Kalam.mp3<br />
                      └── 📁 video/makhtoutat_masterclass/Season_1/Episode_01.mp4
                    </div>
                  </div>
                  <div className="text-amber-400">
                    └── 📁 <span className="font-bold text-stone-200">uploads/</span>{' '}
                    <span className="text-stone-500"># مسار استقبال الملفات الجديدة المحملة عبر الاستوديو والتوريد</span>
                  </div>
                </div>
              </div>

              {/* Upload Flow Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'آلية البث وتدفق الوسائط (Media Streaming)' : 'Media Streaming Mechanism'}</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {isAr
                      ? 'يقوم الخادم بخدمة الملفات مباشرة من مجلد `/storage` عبر بروتوكول HTTP Range Requests مما يتيح التقديم والتأخير اللحظي في الملفات الصوتية والمرئية الكبيرة دون استهلاك الذاكرة.'
                      : 'Express serves /storage directly with HTTP Range headers support for smooth instant seeking in heavy audio/video.'}
                  </p>
                </div>

                <div className="bg-stone-950 border border-stone-800 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? 'سلامة الملفات والبصمة الرقمية (MD5 Checksum)' : 'Integrity & MD5 Checksums'}</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {isAr
                      ? 'يحسب النظام تلقائياً بصمة MD5 لكل لوحة ومسار صوتي عند المسح أو الرفع لمنع التكرار واكتشاف أي تلف في وسائط التخزين.'
                      : 'Every scanned file automatically receives an MD5 hash calculation for de-duplication and integrity verification.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE SCHEMA & SQL */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'مخطط قواعد البيانات العلائقي (Relational Schema DDL)' : 'Relational Database Schema (SQL DDL)'}</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isAr
                      ? 'متوافق تماماً مع PostgreSQL 14+ و SQLite 3.35+ مع تكامل المفاتيح الأجنبية والفهارس الذكية.'
                      : 'Fully compliant with PostgreSQL and SQLite with cascading foreign keys and indexes.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      fetch('/api/system/schema-sql')
                        .then((r) => r.text())
                        .then((sql) => copyToClipboard(sql, 'schema-sql'));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'schema-sql' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isAr ? 'نسخ كود SQL' : 'Copy SQL'}</span>
                  </button>

                  <button
                    onClick={() => {
                      fetch('/api/system/schema-sql')
                        .then((r) => r.text())
                        .then((sql) => downloadFile(sql, 'schema.sql', 'text/sql'));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تنزيل schema.sql' : 'Download schema.sql'}</span>
                  </button>
                </div>
              </div>

              {/* Table List Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { name: 'entities', ar: 'الأصول التراثية المركزية', desc: 'الكتب والمخطوطات والصوتيات والمرئيات' },
                  { name: 'content_nodes', ar: 'عقد الهيكلية الشجرية', desc: 'الأبواب والفصول واللوحات والمسارات والمشاهد' },
                  { name: 'media_files', ar: 'الملفات الفيزيائية', desc: 'مسارات الملفات والأحجام وبصمات MD5' },
                  { name: 'storage_sources', ar: 'مستودعات التخزين', desc: 'الأقراص ومسارات المسح وقواعد المزامنة' },
                  { name: 'authors', ar: 'المؤلفون والمحققون', desc: 'سير الأعلام والوفيات والعصور' },
                  { name: 'categories', ar: 'التصنيفات والعلوم', desc: 'العلوم الشرعية واللغوية والتراثية' },
                  { name: 'footnotes', ar: 'الحواشي والتخريجات', desc: 'التوثيقات العلمية المرتبطة بعقد النصوص' },
                  { name: 'scan_jobs', ar: 'سجلات عمليات المسح', desc: 'عمليات التوريد واكتشاف الملفات' },
                  { name: 'activity_logs', ar: 'سجل التتبع والعمليات', desc: 'سجل التدقيق والتعديل والتحقيق' },
                ].map((t) => (
                  <div key={t.name} className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-300 font-bold">{t.name}</span>
                      <span className="text-[10px] text-stone-500 font-heritage">{t.ar}</span>
                    </div>
                    <p className="text-[11px] text-stone-400">{t.desc}</p>
                  </div>
                ))}
              </div>

              {/* Quick SQL execution snippet */}
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-stone-200">
                  {isAr ? 'أمر استيراد قاعدة البيانات في PostgreSQL محلياً:' : 'PostgreSQL Local Import Command:'}
                </div>
                <div className="bg-stone-900 p-2.5 rounded-xl font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>psql -U postgres -d entity_db -f schema.sql</code>
                  <button
                    onClick={() => copyToClipboard('psql -U postgres -d entity_db -f schema.sql', 'psql-cmd')}
                    className="p-1 rounded bg-stone-800 text-stone-400 hover:text-stone-200"
                  >
                    {copiedKey === 'psql-cmd' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DEVELOPER GUIDE & APIS */}
          {activeTab === 'developer' && (
            <div className="space-y-6 max-w-5xl">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'دليل المطور والواجهات البرمجية (REST API Reference)' : 'Developer Handbook & REST APIs'}</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isAr
                    ? 'يوفر خادم Express مجموعة شاملة من مسارات REST API لإدارة الأصول والتخزين وعقد المحتوى.'
                    : 'Comprehensive REST APIs for querying entities, mutating nodes, scanning storage, and file uploads.'}
                </p>
              </div>

              {/* API Endpoints Table */}
              <div className="border border-stone-800 rounded-2xl overflow-hidden bg-stone-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                    <tr>
                      <th className="p-3">Method</th>
                      <th className="p-3">Endpoint</th>
                      <th className="p-3 font-sans">{isAr ? 'الوصف والغرض' : 'Description'}</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-300">
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">GET</td>
                      <td className="p-3 text-amber-300">/api/db/entities</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'جلب جميع الأصول المحققة مع العقد الفرعية' : 'List all entities with children tree'}</td>
                      <td className="p-3 text-stone-500">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-blue-400 font-bold">POST</td>
                      <td className="p-3 text-amber-300">/api/db/entities</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'حفظ وتثبيت أصل جديد وتوليد عقد المحتوى في قاعدة البيانات' : 'Persist new entity & relational nodes'}</td>
                      <td className="p-3 text-stone-500">201 Created</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">GET</td>
                      <td className="p-3 text-amber-300">/api/db/tables/:name</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'استعلام مباشر لسجلات أي جدول علائقي مع البحث' : 'Query raw table rows with search filters'}</td>
                      <td className="p-3 text-stone-500">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-purple-400 font-bold">POST</td>
                      <td className="p-3 text-amber-300">/api/scanner/scan</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'مسح مجلد فيزيائي واكتشاف الوسائط واللوحات شجرياً' : 'Scan filesystem path & infer metadata'}</td>
                      <td className="p-3 text-stone-500">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-blue-400 font-bold">POST</td>
                      <td className="p-3 text-amber-300">/api/storage/upload</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'رفع وتخزين ملف فيزيائي حقيقي على القرص المحلي' : 'Write physical file to local disk'}</td>
                      <td className="p-3 text-stone-500">200 OK</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-emerald-400 font-bold">GET</td>
                      <td className="p-3 text-amber-300">/api/system/health</td>
                      <td className="p-3 font-sans text-stone-300">{isAr ? 'فحص صحة السيرفر وحالة مسار التخزين وإحصائيات الجداول' : 'Live server, memory & storage diagnostic'}</td>
                      <td className="p-3 text-stone-500">200 OK</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: MAINTENANCE & TROUBLESHOOTING */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6 max-w-5xl">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'دليل الصيانة والنسخ الاحتياطي واستكشاف الأخطاء' : 'Maintenance, Backup & Troubleshooting Matrix'}</span>
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  {isAr
                    ? 'إرشادات عملية للحفاظ على أداء وسرعة النظام وإدارة النسخ الاحتياطية وحل أخطاء التخزين.'
                    : 'Practical runbook for managing storage backups, handling large assets, and server diagnostics.'}
                </p>
              </div>

              {/* Troubleshooting Matrix */}
              <div className="space-y-3">
                {[
                  {
                    title: isAr ? '١. خطأ في أذونات الكتابة في مجلد التخزين (EACCES: permission denied)' : '1. Storage Directory Permission Error',
                    cause: isAr ? 'عدم وجود صلاحيات كتابة في مجلد `/storage`.' : 'Node process lacks write permissions to /storage.',
                    fix: isAr ? 'تنفيذ الأمر: `chmod -R 755 ./storage` أو تشغيل `npm run setup:local`.' : 'Run `chmod -R 755 ./storage` or `npm run setup:local`.',
                  },
                  {
                    title: isAr ? '٢. استعادة قاعدة البيانات من النسخة الاحتياطية (Database Backup & Restore)' : '2. Database Backup & Restore',
                    cause: isAr ? 'الرغبة في استعادة حالة سابقة للمكتبة أو ترحيل البيانات لخادم آخر.' : 'Restoring library state or migrating to a new server.',
                    fix: isAr ? 'ملف `database_store.json` يحفظ السجلات تلقائياً. يمكنك عمل نسخة احتياطية بنسخه مباشرة أو عمل Dump لـ PostgreSQL.' : 'Copy database_store.json or use pg_dump for PostgreSQL exports.',
                  },
                  {
                    title: isAr ? '٣. تعليق أو بطء مسح المجلدات الكبيرة (Path Scanner Timeout)' : '3. Scanning Heavy Media Directories',
                    cause: isAr ? 'المجلد يحوي آلاف الملفات غير التراثية أو مجلدات متداخلة عميقة.' : 'Directory contains too many non-heritage files.',
                    fix: isAr ? 'استخدم خيار تحديد فلاتر الامتداد (مثل `*.jpg,*.mp3`) وفصّل المجلدات حسب المصنفات.' : 'Use specific file pattern filters (*.jpg, *.mp3).',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                    <h4 className="font-bold text-xs text-stone-200 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      <strong className="text-stone-300 font-semibold">{isAr ? 'السبب: ' : 'Cause: '}</strong>
                      {item.cause}
                    </p>
                    <div className="p-2.5 rounded-xl bg-stone-900 text-[11px] font-mono text-amber-300">
                      <strong className="text-emerald-400 font-sans">{isAr ? 'الحل: ' : 'Fix: '}</strong>
                      {item.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: OPS TOOLBOX & LIVE DIAGNOSTICS */}
          {activeTab === 'toolbox' && (
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-stone-100 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>{isAr ? 'صندوق أدوات التشغيل وفحص صحة النظام المباشر' : 'Live System Health & Ops Diagnostics'}</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {isAr ? 'فحص فوري لاتصال الخادم ومسار التخزين الفيزيائي وسجلات الجداول.' : 'Real-time inspection of server process, disk storage, and DB records.'}
                  </p>
                </div>

                <button
                  onClick={fetchHealth}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isAr ? 'إعادة الفحص' : 'Refresh'}</span>
                </button>
              </div>

              {/* Health Cards */}
              {systemHealth ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status */}
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">{isAr ? 'حالة السيرفر' : 'Server Status'}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">
                      {systemHealth.status.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      Uptime: {systemHealth.uptime_seconds}s • Node {systemHealth.node_version}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">{isAr ? 'التخزين الفيزيائي' : 'Physical Storage'}</span>
                      <HardDrive className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-lg font-bold text-stone-100 font-mono">
                      {systemHealth.storage.is_accessible ? (isAr ? 'جاهز ومتصل' : 'READY') : 'UNAVAILABLE'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono truncate" title={systemHealth.storage.root_path}>
                      {systemHealth.storage.root_path}
                    </div>
                  </div>

                  {/* DB Records */}
                  <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-400">{isAr ? 'إجمالي سجلات الجداول' : 'Database Records'}</span>
                      <Database className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-lg font-bold text-amber-400 font-mono">
                      {systemHealth.database.total_records} {isAr ? 'سجل' : 'records'}
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      Entities: {systemHealth.database.tables.entities} • Nodes: {systemHealth.database.tables.content_nodes}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-950 border border-stone-800 rounded-2xl text-xs text-stone-500">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                  <span>{isAr ? 'جاري فحص حالة السيرفر...' : 'Checking server health...'}</span>
                </div>
              )}

              {/* Quick Configuration Generators */}
              <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-stone-200 flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'تنزيل ملفات الإعداد والتشغيل بنقرة واحدة:' : '1-Click Config File Downloads:'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      fetch('/api/system/schema-sql')
                        .then((r) => r.text())
                        .then((sql) => downloadFile(sql, 'schema.sql', 'text/sql'));
                    }}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>schema.sql</span>
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => {
                      fetch('/api/system/docker-compose')
                        .then((r) => r.text())
                        .then((txt) => downloadFile(txt, 'docker-compose.yml', 'text/yaml'));
                    }}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>docker-compose.yml</span>
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </button>

                  <button
                    onClick={() => {
                      const envContent = `PORT=3000\nNODE_ENV=development\nDATABASE_URL=postgresql://entity_user:entity_password@localhost:5432/entity_db\nSTORAGE_ROOT=./storage\nAPP_URL=http://localhost:3000\n`;
                      downloadFile(envContent, '.env', 'text/plain');
                    }}
                    className="p-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 text-xs font-mono flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>.env template</span>
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between text-xs text-stone-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{isAr ? 'منصة كِـيَـان التراثية - نظام التشغيل المستقل' : 'Entity Platform - Self-Hosted Architecture'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق الدليل' : 'Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
