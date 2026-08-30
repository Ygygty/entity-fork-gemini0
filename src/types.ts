export type EntityType = 'book' | 'manuscript' | 'audio' | 'video';

export type ContentNodeType =
  | 'sub_book'
  | 'part'
  | 'volume'
  | 'bab'
  | 'chapter'
  | 'fasl'
  | 'masalah'
  | 'section'
  | 'folio'
  | 'page'
  | 'track'
  | 'segment'
  | 'scene';

export type MimeCategory = 'audio' | 'video' | 'image' | 'document' | 'other';

export interface DBColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  foreignTable?: string;
  foreignColumn?: string;
  isNullable: boolean;
  defaultValue?: string;
  description: string;
}

export interface DBTable {
  name: string;
  name_ar: string;
  description: string;
  columns: DBColumn[];
  indexes: string[];
  relations: {
    type: 'one-to-many' | 'many-to-one' | 'many-to-many';
    targetTable: string;
    foreignKey: string;
    description: string;
  }[];
}

export interface MediaAsset {
  id: string;
  entity_id: string;
  node_id?: string | null;
  storage_source_id?: string;
  disk: 'local' | 's3' | 'cloud' | 'archive';
  file_name: string;
  file_path: string;
  relative_path: string;
  mime_type: string;
  mime_category: MimeCategory;
  file_size: number; // in bytes
  file_size_formatted: string;
  duration_seconds?: number;
  duration_formatted?: string;
  dimensions?: { width: number; height: number };
  bitrate_kbps?: number;
  checksum_md5?: string;
  checksum_sha256?: string;
  scanned_at: string;
  metadata?: Record<string, any>;
}

export interface StorageScanSource {
  id: string;
  name: string;
  disk: string;
  base_path: string;
  scan_status: 'idle' | 'scanning' | 'synced' | 'error';
  auto_sync: boolean;
  recursive: boolean;
  file_patterns: string[];
  last_scanned_at?: string;
  total_files_count: number;
  total_size_bytes: number;
  media_counts: {
    audio: number;
    video: number;
    images: number;
    documents: number;
  };
}

export interface ScannedFileItem {
  id: string;
  name: string;
  full_path: string;
  relative_path: string;
  parent_folder: string;
  extension: string;
  category: MimeCategory;
  mime_type: string;
  size_bytes: number;
  size_human: string;
  checksum_md5: string;
  inferred_node_type: ContentNodeType;
  inferred_title: string;
  inferred_hierarchy: string[]; // e.g. ['Volume 1', 'Bab 02', 'Fasl 01']
  duration_seconds?: number;
  dimensions?: { width: number; height: number };
  folio_code?: string;
  status: 'discovered' | 'matched' | 'imported' | 'skipped';
}

export interface ScanJobResult {
  job_id: string;
  source_path: string;
  scanned_at: string;
  duration_ms: number;
  total_files_found: number;
  categories_summary: {
    audio: number;
    video: number;
    images: number;
    documents: number;
  };
  total_size_formatted: string;
  inferred_entity: {
    title: string;
    type: EntityType;
    estimated_nodes_count: number;
    structure_preview: Array<{
      level: number;
      type: ContentNodeType;
      title: string;
      file_path?: string;
      children_count: number;
    }>;
  };
  files: ScannedFileItem[];
}

export interface Author {
  id: string;
  name: string;
  name_en?: string;
  bio?: string;
  death_year_hijri?: number;
  death_year_gregorian?: number;
  avatar?: string;
  entities_count?: number;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  color?: string;
  icon?: string;
  count?: number;
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Footnote {
  id: string;
  number: number;
  content: string;
  author_note?: string;
}

export interface PoetryBayt {
  id: string;
  shatr1: string;
  shatr2: string;
  meter?: string; // Bahr (e.g. الطويل, البسيط, الكامل, الخفيف)
  poet?: string;
}

export interface QuranVerse {
  surah: string;
  surahNumber: number;
  ayahNumber: number;
  text: string;
}

export interface ContentNode {
  id: string;
  entity_id: string;
  parent_id?: string | null;
  title: string;
  slug: string;
  type: ContentNodeType;
  order: number;
  content?: string;
  html_content?: string;
  page_number?: number;
  folio_code?: string; // e.g. '1a', '1b'
  image_url?: string;
  start_time?: number; // seconds for media
  end_time?: number;
  children?: ContentNode[];
  footnotes?: Footnote[];
}

export interface BaseEntity {
  id: string;
  title: string;
  title_en?: string;
  slug: string;
  type: EntityType;
  description?: string;
  author?: Author;
  author_id?: string;
  category?: Category;
  category_id?: string;
  topics?: Topic[];
  tags?: Tag[];
  cover_image?: string;
  created_at: string;
  updated_at: string;
  status: 'published' | 'draft' | 'archived';
  is_bundle?: boolean;
}

export interface Book extends BaseEntity {
  type: 'book';
  volumes_count: number;
  pages_count: number;
  publisher?: string;
  publication_year?: number;
  edition?: string;
  nodes?: ContentNode[];
}

export interface ManuscriptPage {
  id: string;
  manuscript_id: string;
  folio_number: number;
  side: 'a' | 'b'; // Recto / Verso
  code: string; // '1a', '1b'
  image_url: string;
  thumbnail_url?: string;
  transcription?: string;
  notes?: string;
  width?: number;
  height?: number;
}

export interface Manuscript extends BaseEntity {
  type: 'manuscript';
  library?: string; // e.g. دار الكتب والوثائق القومية
  shelf_mark?: string; // رقم الحفظ / الرف
  script_type?: string; // e.g. خط النسخ، الثلث، الكوفي، المغربي
  scribal_date?: string; // تاريخ النسخ
  pages_count: number;
  pages: ManuscriptPage[];
}

export interface MediaSegment {
  id: string;
  media_id: string;
  title: string;
  slug: string;
  type: 'track' | 'segment' | 'scene';
  start_time: number;
  end_time: number;
  order: number;
  transcription?: string;
  notes?: string;
}

export interface AudioItem extends BaseEntity {
  type: 'audio';
  file_url: string;
  duration: number; // in seconds
  reciter_or_speaker?: string;
  bitrate?: string;
  segments: MediaSegment[];
  album_name?: string;
}

export interface VideoItem extends BaseEntity {
  type: 'video';
  file_url: string;
  duration: number;
  speaker_or_director?: string;
  resolution?: string;
  segments: MediaSegment[];
  series_name?: string;
  episode_number?: number;
}

export type EntityItem = Book | Manuscript | AudioItem | VideoItem;

export interface ActivityLog {
  id: string;
  user_name: string;
  action: 'create' | 'update' | 'delete' | 'ingest' | 'export';
  entity_type: EntityType;
  entity_title: string;
  timestamp: string;
  details?: string;
}

export interface ReadingPreferences {
  fontSize: number; // in px, e.g. 18
  fontFamily: 'ibm-arabic' | 'amiri' | 'scheherazade' | 'sans';
  lineHeight: number; // e.g. 1.8
  theme: 'dark' | 'light' | 'sepia' | 'emerald';
  showFootnotes: boolean;
  showTOC: boolean;
  autoScroll: boolean;
}

export interface StudioSaveState {
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasUnsavedChanges: boolean;
}
