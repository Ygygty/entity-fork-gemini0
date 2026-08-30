-- ============================================================================
-- ENTITY PLATFORM (كِـيَـان) - RELATIONAL DATABASE SCHEMA & SEED SCRIPT
-- Compatible with PostgreSQL 14+ and SQLite 3.35+
-- ============================================================================

-- 1. AUTHORS TABLE (المؤلفون والمحققون)
CREATE TABLE IF NOT EXISTS authors (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255),
    slug VARCHAR(128) UNIQUE NOT NULL,
    death_year_hijri INTEGER,
    death_year_gregorian INTEGER,
    era VARCHAR(128),
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. CATEGORIES TABLE (التصنيفات والعلوم التراثية)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    name_en VARCHAR(128),
    slug VARCHAR(128) UNIQUE,
    color VARCHAR(32) DEFAULT '#d97706',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. STORAGE SOURCES TABLE (مستودعات التخزين والأقراص الفيزيائية)
CREATE TABLE IF NOT EXISTS storage_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    disk VARCHAR(32) DEFAULT 'local' CHECK (disk IN ('local', 'archive', 's3', 'nfs')),
    base_path TEXT NOT NULL,
    scan_status VARCHAR(32) DEFAULT 'synced' CHECK (scan_status IN ('synced', 'scanning', 'pending', 'error')),
    auto_sync BOOLEAN DEFAULT TRUE,
    recursive BOOLEAN DEFAULT TRUE,
    file_patterns VARCHAR(255) DEFAULT '*.*',
    total_files_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0,
    last_scanned_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ENTITIES TABLE (الأصول التراثية المركزية - كتب، مخطوطات، صوتيات، مرئيات)
CREATE TABLE IF NOT EXISTS entities (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(512) NOT NULL,
    title_en VARCHAR(512),
    type VARCHAR(32) NOT NULL CHECK (type IN ('book', 'manuscript', 'audio', 'video')),
    author_id VARCHAR(64) REFERENCES authors(id) ON DELETE SET NULL,
    category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    cover_path TEXT,
    status VARCHAR(32) DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'archived')),
    is_bundle BOOLEAN DEFAULT FALSE,
    volumes_count INTEGER DEFAULT 1,
    pages_count INTEGER DEFAULT 0,
    duration INTEGER DEFAULT 0, -- Duration in seconds for audio/video
    
    -- Specific attributes (Stored as columns or JSON)
    publisher VARCHAR(255),
    publication_year INTEGER,
    edition VARCHAR(128),
    library VARCHAR(255),
    shelf_mark VARCHAR(128),
    script_type VARCHAR(128),
    scribal_date VARCHAR(128),
    reciter_or_speaker VARCHAR(255),
    bitrate VARCHAR(64),
    resolution VARCHAR(64),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CONTENT NODES TABLE (عقد الهيكلية الشجرية - أجزاء، أبواب، فصول، لوحات، مسارات، مشاهد)
CREATE TABLE IF NOT EXISTS content_nodes (
    id VARCHAR(64) PRIMARY KEY,
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    parent_id VARCHAR(64) REFERENCES content_nodes(id) ON DELETE CASCADE,
    title VARCHAR(512) NOT NULL,
    slug VARCHAR(255),
    type VARCHAR(32) NOT NULL CHECK (type IN ('volume', 'bab', 'fasl', 'masalah', 'folio', 'track', 'scene', 'article')),
    sort_order INTEGER DEFAULT 1,
    level INTEGER DEFAULT 1,
    page_number INTEGER,
    folio_code VARCHAR(32),
    start_time_ms INTEGER,
    end_time_ms INTEGER,
    content TEXT, -- Markdown body or transcription text
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. MEDIA FILES TABLE (الملفات الفيزيائية وتخزين الوسائط الرقمية)
CREATE TABLE IF NOT EXISTS media_files (
    id VARCHAR(64) PRIMARY KEY,
    entity_id VARCHAR(64) NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    node_id VARCHAR(64) REFERENCES content_nodes(id) ON DELETE SET NULL,
    storage_source_id VARCHAR(64) REFERENCES storage_sources(id) ON DELETE SET NULL,
    disk VARCHAR(32) DEFAULT 'local',
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    extension VARCHAR(32) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    duration_seconds INTEGER,
    width INTEGER,
    height INTEGER,
    bitrate_kbps INTEGER,
    checksum_md5 VARCHAR(64) NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. FOOTNOTES & COMMENTARIES TABLE (الحواشي والتخريجات العلمية)
CREATE TABLE IF NOT EXISTS footnotes (
    id VARCHAR(64) PRIMARY KEY,
    node_id VARCHAR(64) NOT NULL REFERENCES content_nodes(id) ON DELETE CASCADE,
    number INTEGER NOT NULL,
    anchor_text VARCHAR(255),
    content TEXT NOT NULL,
    source_reference VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. SCAN JOBS TABLE (سجلات عمليات مسح المستودعات التلقائية)
CREATE TABLE IF NOT EXISTS scan_jobs (
    id VARCHAR(64) PRIMARY KEY,
    storage_source_id VARCHAR(64) REFERENCES storage_sources(id) ON DELETE SET NULL,
    source_path TEXT NOT NULL,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER DEFAULT 0,
    total_files INTEGER DEFAULT 0,
    total_bytes BIGINT DEFAULT 0,
    status VARCHAR(32) DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed'))
);

-- 9. ACTIVITY LOGS TABLE (سجل تتبع تدقيق وتعديل المحتوى)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_name VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(32),
    entity_title VARCHAR(512),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT
);

-- ============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SCHOLARLY SEARCH & TREE TRAVERSAL
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug);
CREATE INDEX IF NOT EXISTS idx_entities_author ON entities(author_id);
CREATE INDEX IF NOT EXISTS idx_entities_category ON entities(category_id);

CREATE INDEX IF NOT EXISTS idx_content_nodes_entity ON content_nodes(entity_id);
CREATE INDEX IF NOT EXISTS idx_content_nodes_parent ON content_nodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_content_nodes_sort ON content_nodes(entity_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_content_nodes_type ON content_nodes(type);

CREATE INDEX IF NOT EXISTS idx_media_files_entity ON media_files(entity_id);
CREATE INDEX IF NOT EXISTS idx_media_files_node ON media_files(node_id);
CREATE INDEX IF NOT EXISTS idx_media_files_checksum ON media_files(checksum_md5);

CREATE INDEX IF NOT EXISTS idx_footnotes_node ON footnotes(node_id);

-- ============================================================================
-- INITIAL CORE SEED DATA (بيانات التأسيس التراثية)
-- ============================================================================

-- Authors Seed
INSERT INTO authors (id, name, name_en, slug, death_year_hijri, death_year_gregorian, era, bio)
VALUES
('auth-1', 'ابن مالك الأندلسي', 'Ibn Malik al-Andalusi', 'ibn-malik', 672, 1274, 'العصر المملوكي الأول / الأندلس', 'محمد بن عبد الله بن مالك الأندلسي الجياني، إمام النحاة وصاحب الخلاصة المشهورة بالألفية.'),
('auth-2', 'الحافظ ابن حجر العسقلاني', 'Ibn Hajar al-Asqalani', 'ibn-hajar', 852, 1449, 'العصر المملوكي المتأخر', 'أحمد بن علي بن حجر العسقلاني، أمير المؤمنين في الحديث وصاحب فتح الباري ونخبة الفكر.'),
('auth-3', 'الجار الله الزمخشري', 'Al-Zamakhshari', 'al-zamakhshari', 538, 1144, 'العصر العباسي المتأخر', 'محمود بن عمر الزمخشري، إمام البلاغة والبيان وصاحب الكشاف وأساس البلاغة والمفصل.'),
('auth-4', 'أبو علي القالي', 'Abu Ali al-Qali', 'abu-ali-al-qali', 356, 967, 'العصر الأندلسي الذهبي', 'إسماعيل بن القاسم القالي، راوية الأدب وشيخ اللغويين بالأندلس، صاحب كتاب الأمالي.')
ON CONFLICT (id) DO NOTHING;

-- Categories Seed
INSERT INTO categories (id, name, name_en, slug, color, description)
VALUES
('cat-1', 'علوم اللغة والنحو', 'Grammar & Linguistics', 'grammar', '#10b981', 'أصول النحو والصرف وفقه اللغة العربية'),
('cat-2', 'علوم الحديث والمصطلح', 'Hadith Sciences', 'hadith', '#3b82f6', 'مصطلح الحديث والعلل ونقد الأسانيد'),
('cat-3', 'البلاغة والبيان', 'Rhetoric & Eloquence', 'rhetoric', '#8b5cf6', 'علوم المعاني والبيان والبديع ودلائل الإعجاز'),
('cat-4', 'الأدب والشعر العربي', 'Literature & Poetry', 'literature', '#ec4899', 'دواوين العرب ونوادر الأخبار والأمالي'),
('cat-5', 'أصول الفقه والقواعد', 'Jurisprudence & Usul', 'usul', '#f59e0b', 'القواعد الفقهية ومناهج الاستنباط')
ON CONFLICT (id) DO NOTHING;

-- Storage Sources Seed
INSERT INTO storage_sources (id, name, disk, base_path, scan_status, auto_sync, recursive, file_patterns, total_files_count, total_size_bytes)
VALUES
('src-1', 'مستودع الأصول الصوتية - دروس الألفية والشروح', 'local', '/storage/media/audio/durus_al-alfiyyah', 'synced', TRUE, TRUE, '*.mp3,*.wav,*.flac', 4, 93742000),
('src-2', 'خزانة المخطوطات الأندلسية - النسخ الأصلية (Facsimiles)', 'archive', '/storage/manuscripts/andalus_collection_ms42', 'synced', TRUE, TRUE, '*.jpg,*.png,*.tiff', 4, 56050000),
('src-3', 'المكتبة الرقمية - كتب البلاغة والنصوص المحققة', 'local', '/storage/books/asrar_al-balaghah', 'synced', TRUE, TRUE, '*.md,*.pdf,*.txt', 3, 246600),
('src-4', 'المستودع المرئي - محاضرات علم المخطوطات والتحقيق', 's3', '/storage/media/video/makhtoutat_masterclass', 'synced', TRUE, TRUE, '*.mp4,*.mkv', 2, 930000000)
ON CONFLICT (id) DO NOTHING;
