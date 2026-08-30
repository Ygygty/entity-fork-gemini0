import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReaderView } from './components/Reader/ReaderView';
import { ManuscriptView } from './components/Manuscripter/ManuscriptView';
import { PlayerView } from './components/Player/PlayerView';
import { StudioLayout } from './components/Studio/StudioLayout';
import { AssetLibraryView } from './components/Library/AssetLibraryView';
import { StorageSyncView } from './components/Ingest/StorageSyncView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AIAssistantModal } from './components/AI/AIAssistantModal';
import { UserGuideModal } from './components/UserGuideModal';

import {
  mockBooks as initialBooks,
  mockManuscripts as initialManuscripts,
  mockAudios as initialAudios,
  mockVideos as initialVideos,
  mockAuthors as initialAuthors,
  mockCategories as initialCategories,
  mockTopics as initialTopics,
  mockTags as initialTags,
  mockActivityLogs as recentActivities,
} from './data/mockData';
import { Book, Manuscript, AudioItem, VideoItem, EntityType, EntityItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [aiInitialSnippet, setAiInitialSnippet] = useState<string>('');

  // Collections state
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>(initialManuscripts);
  const [audios, setAudios] = useState<AudioItem[]>(initialAudios);
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);

  // Active selection states
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || 'book-1');
  const [selectedManuscriptId, setSelectedManuscriptId] = useState<string>(manuscripts[0]?.id || 'ms-1');
  const [selectedAudioId, setSelectedAudioId] = useState<string>(audios[0]?.id || 'audio-1');
  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || 'video-1');

  // Studio active entity
  const [studioEntityType, setStudioEntityType] = useState<EntityType>('manuscript');
  const [studioEntityId, setStudioEntityId] = useState<string>(manuscripts[0]?.id || 'ms-1');

  // Sync with persistent backend database on mount
  useEffect(() => {
    async function loadDatabaseEntities() {
      try {
        const res = await fetch('/api/db/entities');
        if (res.ok) {
          const entities: any[] = await res.json();
          if (Array.isArray(entities) && entities.length > 0) {
            const loadedBooks = entities.filter((e) => e.type === 'book');
            const loadedManuscripts = entities.filter((e) => e.type === 'manuscript');
            const loadedAudios = entities.filter((e) => e.type === 'audio');
            const loadedVideos = entities.filter((e) => e.type === 'video');

            if (loadedBooks.length > 0) setBooks(loadedBooks);
            if (loadedManuscripts.length > 0) setManuscripts(loadedManuscripts);
            if (loadedAudios.length > 0) setAudios(loadedAudios);
            if (loadedVideos.length > 0) setVideos(loadedVideos);
          }
        }
      } catch (e) {
        console.warn('Initial DB sync info: using default catalog state', e);
      }
    }
    loadDatabaseEntities();
  }, []);

  // Universal Navigation Bridge
  const handleOpenEntity = (
    type: EntityType,
    id: string,
    mode?: 'reader' | 'studio' | 'manuscripter' | 'player'
  ) => {
    if (mode === 'studio' || (!mode && type === 'manuscript')) {
      setStudioEntityType(type);
      setStudioEntityId(id);
      setActiveTab('studio');
      return;
    }

    if (type === 'book') {
      setSelectedBookId(id);
      setActiveTab('reader');
    } else if (type === 'manuscript') {
      setSelectedManuscriptId(id);
      setActiveTab('manuscripter');
    } else if (type === 'audio') {
      setSelectedAudioId(id);
      setActiveTab('player');
    } else if (type === 'video') {
      setSelectedVideoId(id);
      setActiveTab('player');
    }
  };

  const handleOpenInStudio = (typeOrBookId: string, secondaryId?: string | number) => {
    if (typeOrBookId === 'audio' || typeOrBookId === 'video') {
      setStudioEntityType(typeOrBookId as EntityType);
      setStudioEntityId(secondaryId as string);
    } else if (manuscripts.some((m) => m.id === typeOrBookId)) {
      setStudioEntityType('manuscript');
      setStudioEntityId(typeOrBookId);
    } else {
      setStudioEntityType('book');
      setStudioEntityId(typeOrBookId);
    }
    setActiveTab('studio');
  };

  const handleAddIngestedBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    setSelectedBookId(newBook.id);
    setActiveTab('reader');
  };

  const handleAddIngestedEntity = (newEntity: EntityItem) => {
    if (newEntity.type === 'book') {
      setBooks((prev) => [newEntity as Book, ...prev]);
      setSelectedBookId(newEntity.id);
      setActiveTab('reader');
    } else if (newEntity.type === 'manuscript') {
      setManuscripts((prev) => [newEntity as Manuscript, ...prev]);
      setSelectedManuscriptId(newEntity.id);
      setActiveTab('manuscripter');
    } else if (newEntity.type === 'audio') {
      setAudios((prev) => [newEntity as AudioItem, ...prev]);
      setSelectedAudioId(newEntity.id);
      setActiveTab('player');
    } else if (newEntity.type === 'video') {
      setVideos((prev) => [newEntity as VideoItem, ...prev]);
      setSelectedVideoId(newEntity.id);
      setActiveTab('player');
    }
  };

  const handleTriggerAI = (snippet?: string) => {
    if (snippet) setAiInitialSnippet(snippet);
    setIsAIOpen(true);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-arabic-sans antialiased selection:bg-amber-500 selection:text-stone-950">
      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        currentTab={activeTab}
        onTabChange={setActiveTab}
        onSelectTab={setActiveTab}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAI={() => handleTriggerAI()}
      />

      {/* Main Routed View */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView
            books={books}
            manuscripts={manuscripts}
            audios={audios}
            videos={videos}
            activities={recentActivities}
            onOpenEntity={handleOpenEntity}
            onNavigateTab={setActiveTab}
            onOpenAI={() => handleTriggerAI()}
            lang={lang}
          />
        )}

        {activeTab === 'reader' && (
          <ReaderView
            books={books}
            activeBookId={selectedBookId}
            onSelectBook={setSelectedBookId}
            onOpenInStudio={(bId) => handleOpenInStudio(bId)}
            lang={lang}
          />
        )}

        {activeTab === 'manuscripter' && (
          <ManuscriptView
            manuscripts={manuscripts}
            activeManuscriptId={selectedManuscriptId}
            onSelectManuscript={setSelectedManuscriptId}
            onOpenInStudio={(mId, pageIdx) => handleOpenInStudio(mId, pageIdx)}
            lang={lang}
          />
        )}

        {activeTab === 'player' && (
          <PlayerView
            audios={audios}
            videos={videos}
            activeMediaId={selectedAudioId}
            activeMediaType="audio"
            onSelectMedia={(t, id) => {
              if (t === 'audio') setSelectedAudioId(id);
              else setSelectedVideoId(id);
            }}
            onOpenInStudio={(t, id) => handleOpenInStudio(t, id)}
            lang={lang}
          />
        )}

        {activeTab === 'studio' && (
          <StudioLayout
            books={books}
            manuscripts={manuscripts}
            audios={audios}
            videos={videos}
            selectedEntityType={studioEntityType}
            selectedEntityId={studioEntityId}
            onSelectEntity={(type, id) => {
              setStudioEntityType(type);
              setStudioEntityId(id);
            }}
            lang={lang}
            onOpenAI={handleTriggerAI}
          />
        )}

        {activeTab === 'library' && (
          <AssetLibraryView
            books={books}
            manuscripts={manuscripts}
            audios={audios}
            videos={videos}
            authors={initialAuthors}
            categories={initialCategories}
            topics={initialTopics}
            tags={initialTags}
            onOpenEntity={handleOpenEntity}
            lang={lang}
          />
        )}

        {activeTab === 'ingest' && (
          <StorageSyncView
            onAddIngestedBook={handleAddIngestedBook}
            onAddIngestedEntity={handleAddIngestedEntity}
            lang={lang}
          />
        )}
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        books={books}
        manuscripts={manuscripts}
        audios={audios}
        videos={videos}
        onSelectResult={(item) => {
          handleOpenEntity(item.type, item.id);
        }}
        lang={lang}
      />

      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialSnippet={aiInitialSnippet}
        lang={lang}
      />
    </div>
  );
}
