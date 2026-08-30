import React, { useState } from 'react';
import {
  FolderSync,
  FolderSearch,
  Database,
  Table2,
  FileCode,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PathScannerView } from './PathScannerView';
import { DatabaseSchemaView } from './DatabaseSchemaView';
import { DatabaseTableBrowser } from './DatabaseTableBrowser';
import { Book, EntityItem } from '../../types';

interface StorageSyncViewProps {
  onAddIngestedBook: (book: Book) => void;
  onAddIngestedEntity?: (entity: EntityItem) => void;
  lang: 'ar' | 'en';
}

export const StorageSyncView: React.FC<StorageSyncViewProps> = ({
  onAddIngestedBook,
  onAddIngestedEntity,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeSubTab, setActiveSubTab] = useState<'scanner' | 'schema' | 'tables' | 'parser'>('scanner');

  // Markdown Document Parser State
  const defaultSampleDoc = `# مقدمة في علم فقه اللغة وأسرار العربية
## الباب الأول: في نشأة اللغة واشتقاقاتها
### الفصل الأول: دلالات الألفاظ ومناسبتها للمعاني
اعلم أن لألفاظ العرب أسراراً عجيبة في ملاءمة أصواتها لمعانيها، كما بيّنه ابن جني في الخصائص[^1].

### الفصل الثاني: قياس العربية وتصريف الأفعال
إن التصريف هو ميزان العربية الذي تُعرف به أصول الكلم من الزوائد[^2].

## الباب الثاني: في فصاحة المتكلم وطرائق البيان
### الفصل الأول: شروط الفصاحة والبلاغة
الفصاحة خلوص الكلام من التعقيد اللفظي والمعنوي وتنافر الحروف.

[^1]: الخصائص، أبو الفتح عثمان بن جني، ج١، ص ٤٥.
[^2]: المفصل في صنعة الإعراب، الزمخشري، ص ١١٢.`;

  const [inputText, setInputText] = useState(defaultSampleDoc);
  const [docTitle, setDocTitle] = useState('مقدمة في علم فقه اللغة');
  const [authorName, setAuthorName] = useState('أبو الفتح ابن جني');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    volumes: number;
    babs: number;
    fasls: number;
    footnotes: number;
    tree: any[];
  } | null>(null);

  const [activeSyncStep, setActiveSyncStep] = useState<number>(1);

  const handleParseDocument = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const lines = inputText.split('\n');
      const tree: any[] = [];
      let currentVol: any = null;
      let currentBab: any = null;
      let currentFasl: any = null;
      let footnoteCount = 0;
      let babCount = 0;
      let faslCount = 0;

      lines.forEach((line) => {
        if (line.startsWith('# ')) {
          currentVol = {
            id: `vol-${Date.now()}`,
            title: line.replace('# ', '').trim(),
            type: 'volume',
            children: [],
          };
          tree.push(currentVol);
        } else if (line.startsWith('## ')) {
          babCount++;
          currentBab = {
            id: `bab-${Date.now()}-${babCount}`,
            title: line.replace('## ', '').trim(),
            type: 'bab',
            children: [],
          };
          if (!currentVol) {
            currentVol = { id: 'vol-root', title: docTitle, type: 'volume', children: [] };
            tree.push(currentVol);
          }
          currentVol.children.push(currentBab);
        } else if (line.startsWith('### ')) {
          faslCount++;
          currentFasl = {
            id: `fasl-${Date.now()}-${faslCount}`,
            title: line.replace('### ', '').trim(),
            type: 'fasl',
            content: '',
            footnotes: [],
          };
          if (!currentBab) {
            currentBab = { id: 'bab-default', title: 'الباب الأول', type: 'bab', children: [] };
            if (!currentVol) {
              currentVol = { id: 'vol-root', title: docTitle, type: 'volume', children: [] };
              tree.push(currentVol);
            }
            currentVol.children.push(currentBab);
          }
          currentBab.children.push(currentFasl);
        } else if (line.startsWith('[^') && line.includes(']:')) {
          footnoteCount++;
        } else if (currentFasl) {
          currentFasl.content += line + '\n';
        }
      });

      setParsedResult({
        volumes: tree.length || 1,
        babs: babCount || 1,
        fasls: faslCount || 1,
        footnotes: footnoteCount,
        tree,
      });
      setIsProcessing(false);
      setActiveSyncStep(2);
    }, 500);
  };

  const handleCommitParsedBook = async () => {
    if (!parsedResult) return;

    const newBook: Book = {
      id: `book-ingest-${Date.now()}`,
      title: docTitle,
      title_en: 'Ingested Scholarly Book',
      slug: `ingest-${Date.now()}`,
      type: 'book',
      description: `تمت المزامنة والاستيراد الآلي بواسطة خوارزمية Entity Header Hierarchy Parser مع استخراج ${parsedResult.fasls} فصول و ${parsedResult.footnotes} حاشية.`,
      author: {
        id: `auth-${Date.now()}`,
        name: authorName,
        entities_count: 1,
      },
      category: {
        id: 'cat-4',
        name: 'الأدب والشعر العربي',
        color: '#ec4899',
      },
      volumes_count: parsedResult.volumes,
      pages_count: 120,
      publisher: 'مستودع الكيان الرقمي (Entity Storage)',
      publication_year: 2026,
      edition: 'نسخة رقمية محققة آلياً',
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      nodes: parsedResult.tree,
    };

    try {
      await fetch('/api/db/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook),
      });
    } catch (err) {
      console.warn('Backend DB persist notice:', err);
    }

    if (onAddIngestedEntity) {
      onAddIngestedEntity(newBook);
    } else {
      onAddIngestedBook(newBook);
    }
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
    setActiveSyncStep(3);
  };

  return (
    <div
      id="storage-sync-container"
      className="h-[calc(100vh-62px)] flex flex-col bg-stone-950 text-stone-100 overflow-y-auto p-4 lg:p-6 max-w-[1500px] mx-auto space-y-6"
    >
      {/* Primary Sub-Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/90 border border-stone-800 p-2 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'scanner'
                ? 'bg-emerald-500 text-stone-950 shadow-md shadow-emerald-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <FolderSearch className="w-4 h-4" />
            <span>{isAr ? 'فحص المسارات وتضمين الميديا' : 'Filesystem Path Scanner'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'schema'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{isAr ? 'مخطط وبنية قاعدة البيانات (Schema)' : 'Database Relational Schema'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tables')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'tables'
                ? 'bg-sky-500 text-stone-950 shadow-md shadow-sky-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Table2 className="w-4 h-4" />
            <span>{isAr ? 'مستكشف الجداول الحية' : 'Live Table Browser'}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('parser')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeSubTab === 'parser'
                ? 'bg-purple-500 text-stone-950 shadow-md shadow-purple-500/20'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>{isAr ? 'محلل العناوين والهوامش' : 'Header & Footnote Parser'}</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-stone-500 font-mono px-3">
          <span>Entity Core Engine</span>
          <span>•</span>
          <span className="text-emerald-400">Online & Synced</span>
        </div>
      </div>

      {/* Sub-Tab 1: Filesystem Path Scanner */}
      {activeSubTab === 'scanner' && (
        <PathScannerView
          onAddIngestedEntity={(entity) => {
            if (onAddIngestedEntity) {
              onAddIngestedEntity(entity);
            } else if (entity.type === 'book') {
              onAddIngestedBook(entity);
            }
          }}
          lang={lang}
        />
      )}

      {/* Sub-Tab 2: Database Relational Schema */}
      {activeSubTab === 'schema' && <DatabaseSchemaView lang={lang} />}

      {/* Sub-Tab 3: Live Table Browser */}
      {activeSubTab === 'tables' && <DatabaseTableBrowser lang={lang} />}

      {/* Sub-Tab 4: Document Header Parser */}
      {activeSubTab === 'parser' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-200 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  محرر ومحلل وسوم العناوين التراثية (Header Hierarchy Parser)
                </h3>
                <span className="text-[11px] text-stone-400">يدعم # و ## و ### و [^1]</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-400 block mb-1">عنوان المصنف / الكتاب:</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 block mb-1">المؤلف / المحقق:</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-xs text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-stone-400 block mb-1">محتوى النص الموسوم:</label>
                <textarea
                  rows={10}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3 text-xs font-mono text-stone-300 leading-relaxed focus:outline-none focus:border-purple-500"
                />
              </div>

              <button
                onClick={handleParseDocument}
                disabled={isProcessing || !inputText.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-stone-100 font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <FolderSync className="w-4 h-4 animate-spin" />
                    <span>جاري تحليل التراكيب واستخراج الهوامش...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>بدء التحليل وبناء الشجرة الهرمية آلياً</span>
                  </>
                )}
              </button>
            </div>

            {/* Feature Info */}
            <div className="space-y-4">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
                <h3 className="font-bold text-xs text-purple-400 uppercase tracking-wider mb-3">
                  مخرجات التحليل الهرمي
                </h3>
                {parsedResult ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-stone-400">المجلدات:</span>
                        <span className="font-bold text-amber-300">{parsedResult.volumes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">الأبواب:</span>
                        <span className="font-bold text-amber-300">{parsedResult.babs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">الفصول:</span>
                        <span className="font-bold text-amber-300">{parsedResult.fasls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">الهوامش والتخريجات:</span>
                        <span className="font-bold text-emerald-400">{parsedResult.footnotes}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCommitParsedBook}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-stone-100 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وضم المصنف للمكتبة</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400 leading-relaxed">
                    قم بإدخال النص الموسوم والضغط على "بدء التحليل" لاستخراج البنية الشجرية والحواشي تلقائياً.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
