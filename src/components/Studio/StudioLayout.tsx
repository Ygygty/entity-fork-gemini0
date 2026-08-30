import React, { useState } from 'react';
import {
  Columns2,
  Maximize,
  Minimize,
  PanelLeftClose,
  PanelRightClose,
  Sparkles,
  RotateCcw,
  BookOpen,
  Scroll,
  Headphones,
  Video,
  ChevronDown,
} from 'lucide-react';
import { ReferencePane } from './ReferencePane';
import { EditorPane } from './EditorPane';
import { Book, Manuscript, AudioItem, VideoItem, EntityType } from '../../types';

interface StudioLayoutProps {
  books: Book[];
  manuscripts: Manuscript[];
  audios: AudioItem[];
  videos: VideoItem[];
  selectedEntityType: EntityType;
  selectedEntityId: string;
  onSelectEntity: (type: EntityType, id: string) => void;
  lang: 'ar' | 'en';
  onOpenAI: (snippet?: string) => void;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({
  books,
  manuscripts,
  audios,
  videos,
  selectedEntityType,
  selectedEntityId,
  onSelectEntity,
  lang,
  onOpenAI,
}) => {
  const [splitRatio, setSplitRatio] = useState<number>(50); // 50% left, 50% right
  const [layoutMode, setLayoutMode] = useState<'split' | 'reference-only' | 'editor-only'>('split');
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const isAr = lang === 'ar';

  // Find active entity
  const currentManuscript = manuscripts.find((m) => m.id === selectedEntityId) || manuscripts[0];
  const currentAudio = audios.find((a) => a.id === selectedEntityId) || audios[0];
  const currentVideo = videos.find((v) => v.id === selectedEntityId) || videos[0];
  const currentBook = books.find((b) => b.id === selectedEntityId) || books[0];

  const getEntityTitle = () => {
    switch (selectedEntityType) {
      case 'manuscript':
        return currentManuscript.title;
      case 'audio':
        return currentAudio.title;
      case 'video':
        return currentVideo.title;
      case 'book':
        return currentBook.title;
    }
  };

  const getInitialEditorContent = () => {
    if (selectedEntityType === 'manuscript') {
      const p = currentManuscript.pages[currentPageIndex];
      return p
        ? `<h3>تفريغ وتحقيق لوحة: ${p.code}</h3><p class="leading-relaxed">${p.transcription || ''}</p><p class="mt-4 text-sm text-stone-400"><em>ملاحظة النسخ: ${p.notes || ''}</em></p>`
        : '<p>ابدأ تفريغ المخطوط هنا...</p>';
    }
    if (selectedEntityType === 'audio') {
      const seg = currentAudio.segments[0];
      return `<h3>تفريغ المقطع: ${seg?.title || currentAudio.title}</h3><p class="leading-relaxed">${seg?.transcription || 'ابدأ تفريغ المادة الصوتية...'}</p>`;
    }
    if (selectedEntityType === 'video') {
      const sc = currentVideo.segments[0];
      return `<h3>توثيق المشهد: ${sc?.title || currentVideo.title}</h3><p class="leading-relaxed">${sc?.transcription || 'ابدأ توثيق المشهد...'}</p>`;
    }
    const node = currentBook.nodes?.[0]?.children?.[0]?.children?.[0];
    return node?.content || '<p>محتوى التحقيق...</p>';
  };

  const handleSaveEditor = (newContent: string) => {
    // Save to local cache or sync
    console.log('Saved studio content for:', selectedEntityId, newContent.length);
  };

  return (
    <div id="entity-studio-container" className="h-[calc(100vh-62px)] flex flex-col bg-stone-950 overflow-hidden">
      {/* Studio Global Action Bar */}
      <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
        {/* Entity Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-stone-400 font-medium hidden sm:inline">
            {isAr ? 'مشروع التحقيق النشط:' : 'Active Project:'}
          </span>
          <div className="relative inline-flex items-center">
            <select
              value={`${selectedEntityType}:${selectedEntityId}`}
              onChange={(e) => {
                const [type, id] = e.target.value.split(':') as [EntityType, string];
                onSelectEntity(type, id);
                setCurrentPageIndex(0);
              }}
              className="bg-stone-950 border border-stone-700 text-amber-300 font-semibold px-3 py-1.5 rounded-lg pr-8 cursor-pointer text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
            >
              <optgroup label="المخطوطات الأثرية">
                {manuscripts.map((m) => (
                  <option key={m.id} value={`manuscript:${m.id}`}>
                    📜 {m.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المصنفات والكتب">
                {books.map((b) => (
                  <option key={b.id} value={`book:${b.id}`}>
                    📖 {b.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المسموعات والشروح">
                {audios.map((a) => (
                  <option key={a.id} value={`audio:${a.id}`}>
                    🎧 {a.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المرئيات والوثائقيات">
                {videos.map((v) => (
                  <option key={v.id} value={`video:${v.id}`}>
                    🎬 {v.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Layout Mode Controls */}
        <div className="flex items-center gap-1.5 bg-stone-950 p-1 rounded-lg border border-stone-800">
          <button
            onClick={() => {
              setLayoutMode('reference-only');
            }}
            className={`p-1.5 rounded transition-colors ${
              layoutMode === 'reference-only' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="عرض المرجع فقط"
          >
            <PanelRightClose className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setLayoutMode('split');
              setSplitRatio(50);
            }}
            className={`p-1.5 rounded transition-colors ${
              layoutMode === 'split' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="عرض مزدوج متوازن (٥٠/٥٠)"
          >
            <Columns2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setLayoutMode('editor-only');
            }}
            className={`p-1.5 rounded transition-colors ${
              layoutMode === 'editor-only' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-stone-200'
            }`}
            title="عرض المحرر فقط"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Split Work Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left / Reference Pane */}
        {layoutMode !== 'editor-only' && (
          <div
            style={{
              width: layoutMode === 'reference-only' ? '100%' : `${splitRatio}%`,
            }}
            className="h-full transition-all duration-75 ease-out"
          >
            <ReferencePane
              entityType={selectedEntityType}
              manuscript={selectedEntityType === 'manuscript' ? currentManuscript : undefined}
              audio={selectedEntityType === 'audio' ? currentAudio : undefined}
              video={selectedEntityType === 'video' ? currentVideo : undefined}
              book={selectedEntityType === 'book' ? currentBook : undefined}
              currentPageIndex={currentPageIndex}
              onChangePageIndex={setCurrentPageIndex}
              currentTime={currentTime}
              onSeek={(s) => setCurrentTime(s)}
              lang={lang}
            />
          </div>
        )}

        {/* Resizable Divider Handle */}
        {layoutMode === 'split' && (
          <div
            className="w-1.5 bg-stone-800 hover:bg-amber-500 cursor-col-resize active:bg-amber-400 transition-colors flex items-center justify-center select-none z-20"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startRatio = splitRatio;
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const containerWidth = window.innerWidth;
                const newRatio = Math.min(80, Math.max(20, startRatio + (deltaX / containerWidth) * 100));
                setSplitRatio(newRatio);
              };
              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };
              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div className="w-0.5 h-8 bg-stone-600 rounded-full" />
          </div>
        )}

        {/* Right / Editor Pane */}
        {layoutMode !== 'reference-only' && (
          <div
            style={{
              width: layoutMode === 'editor-only' ? '100%' : `${100 - splitRatio}%`,
            }}
            className="h-full transition-all duration-75 ease-out"
          >
            <EditorPane
              key={`${selectedEntityType}-${selectedEntityId}-${currentPageIndex}`}
              initialContent={getInitialEditorContent()}
              entityTitle={getEntityTitle()}
              nodeTitle={
                selectedEntityType === 'manuscript'
                  ? `لوحة ${currentManuscript.pages[currentPageIndex]?.code || ''}`
                  : undefined
              }
              onSave={handleSaveEditor}
              lang={lang}
              onOpenAI={onOpenAI}
            />
          </div>
        )}
      </div>
    </div>
  );
};
