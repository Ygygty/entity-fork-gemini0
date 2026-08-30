import React, { useState, useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Sparkles,
  Save,
  CheckCircle2,
  RotateCcw,
  RotateCw,
  Download,
  BookOpen,
  Feather,
  Bookmark,
  FileText,
  Copy,
  Check,
  X,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Footnote, PoetryBayt, QuranVerse } from '../../types';

interface EditorPaneProps {
  initialContent: string;
  entityTitle: string;
  nodeTitle?: string;
  onSave: (content: string) => void;
  lang: 'ar' | 'en';
  onOpenAI: (textSnippet?: string) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  initialContent,
  entityTitle,
  nodeTitle,
  onSave,
  lang,
  onOpenAI,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());
  const [hasChanges, setHasChanges] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Modals state
  const [showQuranModal, setShowQuranModal] = useState(false);
  const [showPoetryModal, setShowPoetryModal] = useState(false);
  const [showFootnoteModal, setShowFootnoteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Form states for modals
  const [quranSurah, setQuranSurah] = useState('سورة الحجرات');
  const [quranAyahNum, setQuranAyahNum] = useState('١٣');
  const [quranText, setQuranText] = useState('يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ');

  const [poetryShatr1, setPoetryShatr1] = useState('وَما المَرءُ إِلّا بِإِخوانِهِ');
  const [poetryShatr2, setPoetryShatr2] = useState('كَما يَقبِضُ الكَفَّ بِالمِعصَمِ');
  const [poetryMeter, setPoetryMeter] = useState('بحر الطويل');

  const [footnoteContent, setFootnoteContent] = useState('');
  const [footnoteSource, setFootnoteSource] = useState('');

  // Revisions history
  const [revisions, setRevisions] = useState<Array<{ time: string; snippet: string }>>([
    { time: 'منذ ١٠ دقائق', snippet: 'النسخة الأولية بعد استخراج النص من المخطوط' },
  ]);

  const isAr = lang === 'ar';

  // Sync content when initialContent changes
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Execute rich text commands on editable div
  const execCmd = (cmd: string, val: string | undefined = undefined) => {
    document.execCommand(cmd, false, val);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setContent(html);
      setHasChanges(true);
    }
  };

  // Auto-save logic (debounced)
  useEffect(() => {
    if (!hasChanges) return;
    setIsSaving(true);
    const timer = setTimeout(() => {
      onSave(content);
      setIsSaving(false);
      setLastSaved(new Date());
      setHasChanges(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [content, hasChanges, onSave]);

  const handleManualSave = () => {
    setIsSaving(true);
    onSave(content);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      setHasChanges(false);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }, 400);
  };

  // Insert specialized heritage snippets
  const insertQuranAyah = () => {
    if (!quranText) return;
    const ayahHtml = `
      <div class="my-4 p-4 rounded-xl bg-stone-900/90 border border-emerald-500/40 text-center font-quran select-text">
        <p class="text-emerald-300 text-xl leading-loose">
          ﴿ ${quranText} ﴾
          <span class="ayah-num">${quranAyahNum}</span>
        </p>
        <p class="text-xs text-stone-400 mt-1 font-arabic-sans">[${quranSurah} : الآية ${quranAyahNum}]</p>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, ayahHtml);
    setShowQuranModal(false);
    handleEditorInput();
  };

  const insertPoetry = () => {
    if (!poetryShatr1 || !poetryShatr2) return;
    const poetryHtml = `
      <div class="poetry-bayt my-3 p-3 bg-stone-900/70 rounded-xl border-r-4 border-amber-500 flex items-center justify-between gap-4 font-heritage text-lg select-text">
        <div class="poetry-shatr flex-1 text-center text-stone-100">${poetryShatr1}</div>
        <div class="text-amber-500 font-bold px-2">❖</div>
        <div class="poetry-shatr flex-1 text-center text-stone-100">${poetryShatr2}</div>
      </div>
      <p><br></p>
    `;
    document.execCommand('insertHTML', false, poetryHtml);
    setShowPoetryModal(false);
    handleEditorInput();
  };

  const insertFootnote = () => {
    if (!footnoteContent) return;
    const fnNumber = (document.querySelectorAll('.footnote-ref').length + 1);
    const fnHtml = `<span class="footnote-ref text-amber-400 font-bold align-super text-xs px-1 cursor-pointer bg-amber-500/10 rounded" title="${footnoteContent}">[${fnNumber}]</span>&nbsp;`;
    document.execCommand('insertHTML', false, fnHtml);
    setShowFootnoteModal(false);
    setFootnoteContent('');
    setFootnoteSource('');
    handleEditorInput();
  };

  return (
    <div className="h-full flex flex-col bg-stone-900 overflow-hidden relative">
      {/* Top Toolbar */}
      <div className="p-2 bg-stone-950 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2 z-10">
        {/* Formatting Group */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => execCmd('bold')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="غامق (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCmd('italic')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="مائل (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCmd('underline')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="تسطير"
          >
            <Underline className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-stone-800 mx-1" />

          {/* Headings */}
          <button
            onClick={() => execCmd('formatBlock', '<h3>')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="عنوان رئيسي (H1)"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCmd('formatBlock', '<h4>')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="عنوان فرعي (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-stone-800 mx-1" />

          {/* Lists */}
          <button
            onClick={() => execCmd('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="قائمة نقطية"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCmd('insertOrderedList')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="قائمة مرقمة"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => execCmd('formatBlock', '<blockquote>')}
            className="p-1.5 rounded hover:bg-stone-800 text-stone-300 text-xs cursor-pointer"
            title="اقتباس نصي"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-stone-800 mx-1" />

          {/* Heritage Specific Buttons */}
          <button
            onClick={() => setShowQuranModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold cursor-pointer transition-colors"
            title="إدراج آية قرآنية كريمة بالرسم العثماني"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>آية قرآنية</span>
          </button>

          <button
            onClick={() => setShowPoetryModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-semibold cursor-pointer transition-colors"
            title="إدراج بيت شعر عربي منظم (صدر وعجز)"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>بيت شعر</span>
          </button>

          <button
            onClick={() => setShowFootnoteModal(true)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-500/40 text-sky-300 text-xs font-semibold cursor-pointer transition-colors"
            title="إدراج حاشية وهوامش تحقيق علمي"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>هامش تحقيق</span>
          </button>

          {/* AI Assistance in Editor */}
          <button
            onClick={() => onOpenAI(content.slice(0, 300))}
            className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-amber-500/20 to-purple-500/20 hover:from-amber-500/30 hover:to-purple-500/30 text-amber-300 border border-amber-500/30 text-xs cursor-pointer"
            title="مساعد الذكاء الاصطناعي لتحليل النص وتخريج الشواهد"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">مساعد التحقيق</span>
          </button>
        </div>

        {/* Right Status and Actions */}
        <div className="flex items-center gap-2">
          {/* Auto-save Status */}
          <div className="flex items-center gap-1.5 text-xs text-stone-400 font-mono">
            {isSaving ? (
              <span className="flex items-center gap-1 text-amber-400 animate-pulse">
                <Save className="w-3 h-3 animate-spin" />
                <span>جاري الحفظ...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span className="hidden md:inline">محفوظ تلقائياً</span>
              </span>
            )}
          </div>

          <button
            onClick={handleManualSave}
            className="p-1.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs cursor-pointer shadow"
            title="حفظ التعديلات يدوياً"
          >
            <Save className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs cursor-pointer"
            title="تصدير النص (PDF / Word / Markdown)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Canvas */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full">
        {/* Document Header Breadcrumb */}
        <div className="mb-6 pb-4 border-b border-stone-800">
          <div className="text-xs text-amber-400 font-semibold mb-1">{entityTitle}</div>
          <h2 className="text-2xl font-bold text-stone-100 font-heritage">{nodeTitle || 'محرر التحقيق والنصوص'}</h2>
        </div>

        {/* Editable Rich-Text Area */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          dangerouslySetInnerHTML={{ __html: content }}
          className="min-h-[500px] outline-none text-stone-100 leading-loose text-lg font-heritage selection:bg-amber-500/30 selection:text-amber-200 focus:ring-0"
        />
      </div>

      {/* Quran Modal */}
      {showQuranModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-emerald-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="text-emerald-400 font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                إدراج آية قرآنية كريمة
              </h3>
              <button onClick={() => setShowQuranModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">اسم السورة:</label>
                  <input
                    type="text"
                    value={quranSurah}
                    onChange={(e) => setQuranSurah(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-400 mb-1">رقم الآية:</label>
                  <input
                    type="text"
                    value={quranAyahNum}
                    onChange={(e) => setQuranAyahNum(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">نص الآية الكريمة (بالرسم العثماني):</label>
                <textarea
                  rows={3}
                  value={quranText}
                  onChange={(e) => setQuranText(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-quran text-lg"
                />
              </div>

              {/* Preview */}
              <div className="p-3 bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-center">
                <span className="text-xs text-emerald-400 block mb-1">معاينة التنسيق:</span>
                <p className="font-quran text-emerald-300 text-lg">﴿ {quranText} ﴾ [{quranAyahNum}]</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowQuranModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={insertQuranAyah}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  إدراج في المحرر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Poetry Modal */}
      {showPoetryModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="text-amber-400 font-bold text-base flex items-center gap-2">
                <Feather className="w-5 h-5" />
                إدراج بيت شعر عربي منظوم
              </h3>
              <button onClick={() => setShowPoetryModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-stone-400 mb-1">الصدر (الشطر الأول):</label>
                <input
                  type="text"
                  value={poetryShatr1}
                  onChange={(e) => setPoetryShatr1(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-heritage text-lg"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">العجز (الشطر الثاني):</label>
                <input
                  type="text"
                  value={poetryShatr2}
                  onChange={(e) => setPoetryShatr2(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-heritage text-lg"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">بحر الشعر والوزن:</label>
                <select
                  value={poetryMeter}
                  onChange={(e) => setPoetryMeter(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-300"
                >
                  <option value="بحر الطويل">بحر الطويل (فعولن مفاعيلن فعولن مفاعلن)</option>
                  <option value="بحر البسيط">بحر البسيط (مستفعلن فاعلن مستفعلن فعلن)</option>
                  <option value="بحر الكامل">بحر الكامل (متفاعلن متفاعلن متفاعلن)</option>
                  <option value="بحر الوافر">بحر الوافر (مفاعلتن مفاعلتن فعولن)</option>
                  <option value="بحر الخفيف">بحر الخفيف (فاعلاتن مستفعلن فاعلاتن)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowPoetryModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={insertPoetry}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  إدراج البيت المنظوم
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footnote Modal */}
      {showFootnoteModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-sky-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="text-sky-400 font-bold text-base flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                إدراج حاشية وهوامش تحقيق علمي
              </h3>
              <button onClick={() => setShowFootnoteModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-stone-400 mb-1">نص الحاشية / التخريج:</label>
                <textarea
                  rows={3}
                  value={footnoteContent}
                  onChange={(e) => setFootnoteContent(e.target.value)}
                  placeholder="مثال: أخرجه البخاري في صحيحه، كتاب بدء الوحي، باب كيف كان بدء الوحي، رقم (١)..."
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-100 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-400 mb-1">المصدر / المخطوط المعتمد (اختياري):</label>
                <input
                  type="text"
                  value={footnoteSource}
                  onChange={(e) => setFootnoteSource(e.target.value)}
                  placeholder="مثال: نسخة الظاهرية ورقة ١٢ب، أو طبعة بولاق ١٢٨٤هـ"
                  className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowFootnoteModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={insertFootnote}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow cursor-pointer"
                >
                  إدراج الهامش
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
              <h3 className="text-stone-100 font-bold text-base flex items-center gap-2">
                <Download className="w-5 h-5 text-amber-400" />
                تصدير النص المحقق
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed">
              اختر الصيغة المناسبة لتصدير نص التحقيق مع كامل الهوامش والشواهد المخرجة:
            </p>

            <div className="space-y-2.5">
              {[
                {
                  id: 'pdf',
                  name: 'ملف PDF محقق ومنسق',
                  desc: 'تنسيق طباعي فاخر بالخطوط التراثية وهوامش سفلية مرقمة',
                  badge: 'موصى به',
                },
                {
                  id: 'docx',
                  name: 'مستند Word (.docx)',
                  desc: 'مستند قابل للتعديل مع دعم الحواشي السفلية Word Footnotes',
                  badge: 'DOCX',
                },
                {
                  id: 'md',
                  name: 'نص Markdown (.md)',
                  desc: 'نص خفيف ومتوافق مع محركات التوثيق وGitHub',
                  badge: 'MD',
                },
                {
                  id: 'json',
                  name: 'بيانات مهيكلة JSON Schema',
                  desc: 'تصدير شجرة العقد والمقاطع للأرشفة البرمجية',
                  badge: 'JSON',
                },
              ].map((format) => (
                <button
                  key={format.id}
                  onClick={() => {
                    // Trigger download simulation
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${entityTitle || 'entity-export'}.${format.id === 'pdf' ? 'html' : format.id}`;
                    a.click();
                    setShowExportModal(false);
                    confetti({ particleCount: 40 });
                  }}
                  className="w-full text-right p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800/40 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-semibold text-stone-200 group-hover:text-amber-300 text-sm">
                      {format.name}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">{format.desc}</div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                    {format.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
