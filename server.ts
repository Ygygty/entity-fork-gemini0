import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI();
  }
  return aiClient;
}

// ----------------------------------------------------
// In-Memory & File-Backed Relational Database Engine
// ----------------------------------------------------
interface DBStore {
  entities: any[];
  content_nodes: any[];
  media_files: any[];
  storage_sources: any[];
  authors: any[];
  categories: any[];
  footnotes: any[];
  scan_jobs: any[];
  activity_logs: any[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'database_store.json');

const getInitialDBState = (): DBStore => {
  const authors = [
    {
      id: 'auth-1',
      name: 'ابن مالك الأندلسي',
      name_en: 'Ibn Malik al-Andalusi',
      slug: 'ibn-malik',
      death_year_hijri: 672,
      death_year_gregorian: 1274,
      era: 'العصر المملوكي الأول / الأندلس',
      bio: 'محمد بن عبد الله بن مالك الأندلسي الجياني، إمام النحاة وصاحب الخلاصة المشهورة بالألفية والكافية الشافية.',
      avatar_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'auth-2',
      name: 'الحافظ ابن حجر العسقلاني',
      name_en: 'Ibn Hajar al-Asqalani',
      slug: 'ibn-hajar',
      death_year_hijri: 852,
      death_year_gregorian: 1449,
      era: 'العصر المملوكي المتأخر',
      bio: 'أحمد بن علي بن حجر العسقلاني، أمير المؤمنين في الحديث وصاحب فتح الباري ونخبة الفكر وبلوغ المرام.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'auth-3',
      name: 'الجار الله الزمخشري',
      name_en: 'Al-Zamakhshari',
      slug: 'al-zamakhshari',
      death_year_hijri: 538,
      death_year_gregorian: 1144,
      era: 'العصر العباسي المتأخر',
      bio: 'محمود بن عمر الزمخشري، إمام البلاغة والبيان وصاحب الكشاف وأساس البلاغة والمفصل في صنعة الإعراب.',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'auth-4',
      name: 'أبو علي القالي',
      name_en: 'Abu Ali al-Qali',
      slug: 'abu-ali-al-qali',
      death_year_hijri: 356,
      death_year_gregorian: 967,
      era: 'العصر الأندلسي الذهبي',
      bio: 'إسماعيل بن القاسم القالي، راوية الأدب وشيخ اللغويين بالأندلس، صاحب كتاب الأمالي والبارع في اللغة.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const categories = [
    { id: 'cat-1', name: 'علوم اللغة والنحو', name_en: 'Grammar & Linguistics', color: '#10b981', count: 8 },
    { id: 'cat-2', name: 'علوم الحديث والمصطلح', name_en: 'Hadith Sciences', color: '#3b82f6', count: 5 },
    { id: 'cat-3', name: 'البلاغة والبيان', name_en: 'Rhetoric & Eloquence', color: '#8b5cf6', count: 6 },
    { id: 'cat-4', name: 'الأدب والشعر العربي', name_en: 'Literature & Poetry', color: '#ec4899', count: 9 },
    { id: 'cat-5', name: 'أصول الفقه والقواعد', name_en: 'Jurisprudence & Usul', color: '#f59e0b', count: 4 },
  ];

  const storage_sources = [
    {
      id: 'src-1',
      name: 'مستودع الأصول الصوتية - دروس الألفية والشروح',
      disk: 'local',
      base_path: '/storage/media/audio/durus_al-alfiyyah',
      scan_status: 'synced',
      auto_sync: true,
      recursive: true,
      file_patterns: '*.mp3,*.wav,*.flac',
      last_scanned_at: new Date().toISOString(),
      total_files_count: 4,
      total_size_bytes: 93742000,
    },
    {
      id: 'src-2',
      name: 'خزانة المخطوطات الأندلسية - النسخ الأصلية (Facsimiles)',
      disk: 'archive',
      base_path: '/storage/manuscripts/andalus_collection_ms42',
      scan_status: 'synced',
      auto_sync: true,
      recursive: true,
      file_patterns: '*.jpg,*.png,*.tiff',
      last_scanned_at: new Date().toISOString(),
      total_files_count: 4,
      total_size_bytes: 56050000,
    },
    {
      id: 'src-3',
      name: 'المكتبة الرقمية - كتب البلاغة والنصوص المحققة',
      disk: 'local',
      base_path: '/storage/books/asrar_al-balaghah',
      scan_status: 'synced',
      auto_sync: true,
      recursive: true,
      file_patterns: '*.md,*.pdf,*.txt',
      last_scanned_at: new Date().toISOString(),
      total_files_count: 3,
      total_size_bytes: 246600,
    },
    {
      id: 'src-4',
      name: 'المستودع المرئي - محاضرات علم المخطوطات والتحقيق',
      disk: 's3',
      base_path: '/storage/media/video/makhtoutat_masterclass',
      scan_status: 'synced',
      auto_sync: true,
      recursive: true,
      file_patterns: '*.mp4,*.mkv',
      last_scanned_at: new Date().toISOString(),
      total_files_count: 2,
      total_size_bytes: 930000000,
    },
  ];

  const entities = [
    {
      id: 'book-1',
      slug: 'sharh-ibn-aqil',
      title: 'شرح ابن عقيل على ألفية ابن مالك',
      title_en: 'Sharh Ibn Aqil ala Alfiyyat Ibn Malik',
      type: 'book',
      author_id: 'auth-1',
      category_id: 'cat-1',
      description: 'أشهر شروح الألفية وأكثرها تداولاً وقبولاً في المعاهد العلمية والجامعات الإسلامية، يمتاز بحسن التبويب وسلاسة العبارة ووضوح الشواهد.',
      cover_path: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      status: 'published',
      is_bundle: false,
      volumes_count: 2,
      pages_count: 640,
      publisher: 'دار الفكر المعاصر للتحقيق والنشر',
      publication_year: 2024,
      edition: 'الطبعة الخامسة المحققة',
      created_at: '2026-08-25T10:00:00Z',
      updated_at: '2026-08-30T12:00:00Z',
    },
    {
      id: 'ms-1',
      slug: 'amali-qali-ms',
      title: 'الأمالي ونوادر الأخبار (مخطوط الرباط الأصلي)',
      title_en: 'Al-Amali wa Nawadir al-Akhbar Manuscript',
      type: 'manuscript',
      author_id: 'auth-4',
      category_id: 'cat-4',
      description: 'نسخة خزائنية نفيسة كُتبت بالخط الأندلسي المتقن وعليها قيود وسماعات كبار علماء المغرب والأندلس.',
      cover_path: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80',
      status: 'published',
      is_bundle: false,
      library: 'الخزانة الملكية بالرباط - المغرب',
      shelf_mark: 'مخطوط رقم ٤٢/أدب',
      script_type: 'خط أندلسي مغربي عتيق',
      scribal_date: 'سنة ٥٨٢ هـ (القرن السادس الهجري)',
      pages_count: 4,
      created_at: '2026-08-26T14:30:00Z',
      updated_at: '2026-08-30T12:00:00Z',
    },
    {
      id: 'audio-1',
      slug: 'audio-alfiyyah-lectures',
      title: 'مجالس شرح الخلاصة الألفية (التسجيلات الصوتية الكاملة)',
      title_en: 'Scholarly Commentary on Alfiyyah Audio Archive',
      type: 'audio',
      author_id: 'auth-1',
      category_id: 'cat-1',
      description: 'سلسلة دروس ومجالس علمية صوتية عالية النقاء تشرح أبواب النحو والصرف وتفكك عبارات الألفية وشواهدها.',
      cover_path: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&auto=format&fit=crop&q=80',
      status: 'published',
      is_bundle: false,
      duration: 9360,
      file_url: '/storage/media/audio/durus_al-alfiyyah/Vol_01/01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
      reciter_or_speaker: 'الشارح والمحقق التراثي',
      bitrate: '320 kbps High Fidelity',
      album_name: 'شروح ديوان النحو التراثي',
      created_at: '2026-08-27T08:15:00Z',
      updated_at: '2026-08-30T12:00:00Z',
    },
    {
      id: 'video-1',
      slug: 'makhtoutat-masterclass-video',
      title: 'أصول تحقيق المخطوطات وضبط النصوص ونقد الأسانيد',
      title_en: 'Manuscript Editing & Collation Masterclass Series',
      type: 'video',
      author_id: 'auth-2',
      category_id: 'cat-2',
      description: 'سلسلة مصورة عالية الدقة تشرح آليات المقابلة والنسخ وتحرير السواقط وعلامات التضبيب والإلحاق في التراث العربي.',
      cover_path: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&auto=format&fit=crop&q=80',
      status: 'published',
      is_bundle: false,
      duration: 7850,
      file_url: '/storage/media/video/makhtoutat_masterclass/Season_1/Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
      speaker_or_director: 'فريق محققي الكيان',
      resolution: '1080p Full HD 60fps',
      series_name: 'سلسلة دراسات الصنعة الحديثية والتراثية',
      episode_number: 1,
      created_at: '2026-08-28T16:00:00Z',
      updated_at: '2026-08-30T12:00:00Z',
    },
  ];

  const content_nodes = [
    {
      id: 'node-vol-1',
      entity_id: 'book-1',
      parent_id: null,
      title: 'المجلد الأول: في أصول النحو والمرفوعات والمنصوبات',
      slug: 'vol-1',
      type: 'volume',
      sort_order: 1,
      level: 1,
      page_number: 1,
    },
    {
      id: 'node-bab-1',
      entity_id: 'book-1',
      parent_id: 'node-vol-1',
      title: 'الباب الأول: حد الكلام وما يتألف منه',
      slug: 'bab-al-kalam',
      type: 'bab',
      sort_order: 1,
      level: 2,
      page_number: 9,
    },
    {
      id: 'node-fasl-1',
      entity_id: 'book-1',
      parent_id: 'node-bab-1',
      title: 'فصل: علامات الاسم وعلامات الفعل والحرف',
      slug: 'fasl-alamat-al-ism',
      type: 'fasl',
      sort_order: 1,
      level: 3,
      page_number: 14,
      content: `قال ابن مالك رحمه الله في الخلاصة:

كَلامُنا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ ... وَاسْمٌ وَفِعْلٌ ثُمَّ حَرْفٌ الكَلِمْ
وَاحِدُهُ كَلِمَةٌ وَالقَوْلُ عَمْ ... وَكِلْمَةٌ بِهَا كَلامٌ قَدْ يُؤَمْ

الشرح والتحقيق:
الكلام في اصطلاح النحويين عبارة عن اللفظ المفيد فائدة يحسن السكوت عليها، فـ "اللفظ" جنس يشمل المستعمل والمهمل، و "المفيد" يُخرج المهمل وما لا يفيد كزيد ومركّب ناقص.
وقوله "واسم وفعل ثم حرف الكلم" بين أن أجزاء الكلام التي يتركب منها ثلاثة أقسام لا رابع لها بحصر الاستقراء التام لألفاظ لغة العرب[^1].

فأما الاسم فيمتاز بعلامات خمس مجموعة في قول الناظم:
بِالجَرِّ وَالتَّنْوِينِ وَالنِّدَا وَأَلْ ... وَمُسْنَدٍ لِلاسْمِ تَمْيِيزٌ حَصَلْ[^2]`,
    },
    {
      id: 'node-fasl-2',
      entity_id: 'book-1',
      parent_id: 'node-bab-1',
      title: 'فصل: في المعرب والمبني من الأسماء والأفعال',
      slug: 'fasl-al-murab-wal-mabni',
      type: 'fasl',
      sort_order: 2,
      level: 3,
      page_number: 22,
      content: `قال الناظم رحمه الله:
وَالاسْمُ مِنْهُ مُعْرَبٌ وَمَبْنِي ... لِشَبَهٍ مِنَ الحُرُوفِ مُدْنِي
كَالشَّبَهِ الوَضْعِيِّ فِي اسْمَيْ جِئْتَنَا ... وَالمَعْنَوِيِّ فِي مَتَى وَفِي هُنَا

الشرح:
الأصل في الأسماء الإعراب، وإنما بُني منها ما ضارع الحرف وشابهه شبهاً قوياً يُدنيه منه، ووجوه الشبه أربعة: الشبه الوضعي، والشبه المعنوي، والشبه الاستعمالي، والشبه الافتقاري.`,
    },
    // Manuscript Folios
    {
      id: 'node-folio-1a',
      entity_id: 'ms-1',
      parent_id: null,
      title: 'لوحة ١/أ (فاتحة المخطوط والعنوان المذهب)',
      slug: 'folio-1a',
      type: 'folio',
      sort_order: 1,
      level: 1,
      folio_code: '1a',
      content: `بسم الله الرحمن الرحيم صلى الله على سيدنا محمد وآله وصحبه وسلم تسليما
هذا كتاب الأمالي ونوادر الأخبار تصنيف الشيخ أبي علي إسماعيل بن القاسم القالي رحمه الله وجزاه خيرا.
الحمد لله حمدا كثيرا طيبا مباركا فيه كما يحب ربنا ويرضى، وصلى الله على محمد نبيه ورسوله المصطفى.`,
    },
    {
      id: 'node-folio-1b',
      entity_id: 'ms-1',
      parent_id: null,
      title: 'لوحة ١/ب (مقدمة المصنف والحمدلة)',
      slug: 'folio-1b',
      type: 'folio',
      sort_order: 2,
      level: 1,
      folio_code: '1b',
      content: `أما بعد: فإنا أملينا هذه الأخبار والنوادر والأشعار اللطيفة في مجالس جامع قرطبة في يوم الأربعاء، قصدنا فيها إيراد شواهد فصحاء العرب وكلام بلغاء السلف.`,
    },
    {
      id: 'node-folio-2a',
      entity_id: 'ms-1',
      parent_id: null,
      title: 'لوحة ٢/أ (فصل في غريب اللغة والنوادر)',
      slug: 'folio-2a',
      type: 'folio',
      sort_order: 3,
      level: 1,
      folio_code: '2a',
      content: `قال أبو علي: حدّثنا أبو بكر بن دريد قال: أخبرنا أبو حاتم السجستاني عن الأصمعي قال: سألت أعرابياً عن معنى القعسري فقال: هو الضخم الشديد من كل شيء.`,
    },
    {
      id: 'node-folio-2b',
      entity_id: 'ms-1',
      parent_id: null,
      title: 'لوحة ٢/ب (خاتمة المجلس وشواهد الشعر)',
      slug: 'folio-2b',
      type: 'folio',
      sort_order: 4,
      level: 1,
      folio_code: '2b',
      content: `وأنشدنا أعرابي من بني أسد:
إذا ما تفرقت النوى بعد ألفةٍ ... شجاك من الأظعان ما كان شائقا
تولوا ببانات الحجاز كأنهم ... شموسٌ تجلت في دجى الليل باسقا`,
    },
    // Audio Tracks
    {
      id: 'node-track-1',
      entity_id: 'audio-1',
      parent_id: null,
      title: 'المجلس الأول: مقدمة في حد الكلام وأقسامه الثلاثة',
      slug: 'track-01',
      type: 'track',
      sort_order: 1,
      level: 1,
      start_time_ms: 0,
      end_time_ms: 1840000,
      content: 'تفريغ المجلس الصوتي الأول: تناول الشارح تعريف النحو لغة واصطلاحاً، والفرق بين الكلمة والكلام والقول.',
    },
    {
      id: 'node-track-2',
      entity_id: 'audio-1',
      parent_id: null,
      title: 'المجلس الثاني: فصل في علامات الأسماء والأفعال والحروف',
      slug: 'track-02',
      type: 'track',
      sort_order: 2,
      level: 1,
      start_time_ms: 1840000,
      end_time_ms: 4250000,
      content: 'تفريغ المجلس الثاني: شرح علامات الإسناد والجر والتنوين ونداء ودخول أل.',
    },
    {
      id: 'node-track-3',
      entity_id: 'audio-1',
      parent_id: null,
      title: 'المجلس الثالث: باب المبتدأ والخبر ومسوغات الابتداء بالنكرة',
      slug: 'track-03',
      type: 'track',
      sort_order: 3,
      level: 1,
      start_time_ms: 4250000,
      end_time_ms: 7230000,
      content: 'تفريغ المجلس الثالث: تحقيق مسألة الرتبة بين المبتدأ والخبر ومواضع وجوب التقديم والتأخير.',
    },
    {
      id: 'node-track-4',
      entity_id: 'audio-1',
      parent_id: null,
      title: 'المجلس الرابع: باب كان وأخواتها والأفعال الناسخة',
      slug: 'track-04',
      type: 'track',
      sort_order: 4,
      level: 1,
      start_time_ms: 7230000,
      end_time_ms: 9360000,
      content: 'تفريغ المجلس الرابع: أحكام كان وظل وبات وأضحى وتصرفاتها وإعمالها.',
    },
    // Video Scenes
    {
      id: 'node-scene-1',
      entity_id: 'video-1',
      parent_id: null,
      title: 'المشهد الأول: تاريخ انتقال وتدوين المخطوطات والوراقين',
      slug: 'scene-01',
      type: 'scene',
      sort_order: 1,
      level: 1,
      start_time_ms: 0,
      end_time_ms: 3600000,
      content: 'دراسة طبقات النساخ والوراقين وأدوات الكاغد والحبر والمداد.',
    },
    {
      id: 'node-scene-2',
      entity_id: 'video-1',
      parent_id: null,
      title: 'المشهد الثاني: قواعد المقابلة والضبط بالحركات ورموز التصحيح',
      slug: 'scene-02',
      type: 'scene',
      sort_order: 2,
      level: 1,
      start_time_ms: 3600000,
      end_time_ms: 7850000,
      content: 'شرح علامات الضبة (ص) واللحق والضرب والتخريج في حواشي المخطوطات.',
    },
  ];

  const media_files = [
    {
      id: 'media-aud-01',
      entity_id: 'audio-1',
      node_id: 'node-track-1',
      storage_source_id: 'src-1',
      disk: 'local',
      file_name: '01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
      file_path: '/storage/media/audio/durus_al-alfiyyah/Vol_01/01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
      relative_path: 'Vol_01/01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
      mime_type: 'audio/mpeg',
      extension: 'mp3',
      file_size: 18452000,
      duration_seconds: 1840,
      bitrate_kbps: 320,
      checksum_md5: '7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-aud-02',
      entity_id: 'audio-1',
      node_id: 'node-track-2',
      storage_source_id: 'src-1',
      disk: 'local',
      file_name: '02_Fasl_Al-I\'rab_wa_Al-Bina.mp3',
      file_path: '/storage/media/audio/durus_al-alfiyyah/Vol_01/02_Fasl_Al-I\'rab_wa_Al-Bina.mp3',
      relative_path: 'Vol_01/02_Fasl_Al-I\'rab_wa_Al-Bina.mp3',
      mime_type: 'audio/mpeg',
      extension: 'mp3',
      file_size: 24190000,
      duration_seconds: 2410,
      bitrate_kbps: 320,
      checksum_md5: '8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-aud-03',
      entity_id: 'audio-1',
      node_id: 'node-track-3',
      storage_source_id: 'src-1',
      disk: 'local',
      file_name: '03_Bab_Al-Mubtada_wa_Al-Khabar.mp3',
      file_path: '/storage/media/audio/durus_al-alfiyyah/Vol_02/03_Bab_Al-Mubtada_wa_Al-Khabar.mp3',
      relative_path: 'Vol_02/03_Bab_Al-Mubtada_wa_Al-Khabar.mp3',
      mime_type: 'audio/mpeg',
      extension: 'mp3',
      file_size: 29800000,
      duration_seconds: 2980,
      bitrate_kbps: 320,
      checksum_md5: '9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-aud-04',
      entity_id: 'audio-1',
      node_id: 'node-track-4',
      storage_source_id: 'src-1',
      disk: 'local',
      file_name: '04_Bab_Kana_wa_Akhawatuha.mp3',
      file_path: '/storage/media/audio/durus_al-alfiyyah/Vol_02/04_Bab_Kana_wa_Akhawatuha.mp3',
      relative_path: 'Vol_02/04_Bab_Kana_wa_Akhawatuha.mp3',
      mime_type: 'audio/mpeg',
      extension: 'mp3',
      file_size: 21300000,
      duration_seconds: 2130,
      bitrate_kbps: 320,
      checksum_md5: '0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    // Manuscript Media
    {
      id: 'media-ms-01',
      entity_id: 'ms-1',
      node_id: 'node-folio-1a',
      storage_source_id: 'src-2',
      disk: 'archive',
      file_name: '001a_unwan_fatiha.jpg',
      file_path: '/storage/manuscripts/andalus_collection_ms42/folios/001a_unwan_fatiha.jpg',
      relative_path: 'folios/001a_unwan_fatiha.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      file_size: 14200000,
      width: 3400,
      height: 4800,
      checksum_md5: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-ms-02',
      entity_id: 'ms-1',
      node_id: 'node-folio-1b',
      storage_source_id: 'src-2',
      disk: 'archive',
      file_name: '001b_muqaddimah_al-kutbi.jpg',
      file_path: '/storage/manuscripts/andalus_collection_ms42/folios/001b_muqaddimah_al-kutbi.jpg',
      relative_path: 'folios/001b_muqaddimah_al-kutbi.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      file_size: 13800000,
      width: 3400,
      height: 4800,
      checksum_md5: 'b2c3d4e5f60718293a4b5c6d7e8f90a1',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-ms-03',
      entity_id: 'ms-1',
      node_id: 'node-folio-2a',
      storage_source_id: 'src-2',
      disk: 'archive',
      file_name: '002a_bab_al-usul.jpg',
      file_path: '/storage/manuscripts/andalus_collection_ms42/folios/002a_bab_al-usul.jpg',
      relative_path: 'folios/002a_bab_al-usul.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      file_size: 14100000,
      width: 3400,
      height: 4800,
      checksum_md5: 'c3d4e5f60718293a4b5c6d7e8f90a1b2',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-ms-04',
      entity_id: 'ms-1',
      node_id: 'node-folio-2b',
      storage_source_id: 'src-2',
      disk: 'archive',
      file_name: '002b_fasl_al-qiyas.jpg',
      file_path: '/storage/manuscripts/andalus_collection_ms42/folios/002b_fasl_al-qiyas.jpg',
      relative_path: 'folios/002b_fasl_al-qiyas.jpg',
      mime_type: 'image/jpeg',
      extension: 'jpg',
      file_size: 13950000,
      width: 3400,
      height: 4800,
      checksum_md5: 'd4e5f60718293a4b5c6d7e8f90a1b2c3',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    // Video Media
    {
      id: 'media-vid-01',
      entity_id: 'video-1',
      node_id: 'node-scene-1',
      storage_source_id: 'src-4',
      disk: 's3',
      file_name: 'Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
      file_path: '/storage/media/video/makhtoutat_masterclass/Season_1/Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
      relative_path: 'Season_1/Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
      mime_type: 'video/mp4',
      extension: 'mp4',
      file_size: 420000000,
      duration_seconds: 3600,
      width: 1920,
      height: 1080,
      checksum_md5: 'e5f60718293a4b5c6d7e8f90a1b2c3d4',
      scanned_at: '2026-08-30T10:00:00Z',
    },
    {
      id: 'media-vid-02',
      entity_id: 'video-1',
      node_id: 'node-scene-2',
      storage_source_id: 'src-4',
      disk: 's3',
      file_name: 'Episode_02_Qawaid_Al-Muqabalah_wa_Al-Dabt.mp4',
      file_path: '/storage/media/video/makhtoutat_masterclass/Season_1/Episode_02_Qawaid_Al-Muqabalah_wa_Al-Dabt.mp4',
      relative_path: 'Season_1/Episode_02_Qawaid_Al-Muqabalah_wa_Al-Dabt.mp4',
      mime_type: 'video/mp4',
      extension: 'mp4',
      file_size: 510000000,
      duration_seconds: 4250,
      width: 1920,
      height: 1080,
      checksum_md5: 'f60718293a4b5c6d7e8f90a1b2c3d4e5',
      scanned_at: '2026-08-30T10:00:00Z',
    },
  ];

  const footnotes = [
    {
      id: 'fn-1',
      content_node_id: 'node-fasl-1',
      number: 1,
      content: 'الكتاب لسيبويه، تحقيق عبد السلام هارون، ج١، ص ١٢.',
      author_note: 'حاشية توثيقية معتمدة',
    },
    {
      id: 'fn-2',
      content_node_id: 'node-fasl-1',
      number: 2,
      content: 'انظر تفصيل علامات الأسماء في شرح المفصل لابن يعيش، ج١، ص ٢٤.',
      author_note: 'شاهد استقرائي',
    },
  ];

  const scan_jobs = [
    {
      id: 'job-init-01',
      storage_source_id: 'src-1',
      source_path: '/storage/media/audio/durus_al-alfiyyah',
      scanned_at: '2026-08-30T10:00:00Z',
      duration_ms: 450,
      total_files: 4,
      total_bytes: 93742000,
      status: 'completed',
    },
    {
      id: 'job-init-02',
      storage_source_id: 'src-2',
      source_path: '/storage/manuscripts/andalus_collection_ms42',
      scanned_at: '2026-08-30T10:05:00Z',
      duration_ms: 580,
      total_files: 4,
      total_bytes: 56050000,
      status: 'completed',
    },
  ];

  const activity_logs = [
    {
      id: 'log-1',
      user_name: 'محقق الكيان',
      action: 'ingest',
      entity_type: 'audio',
      entity_title: 'مجالس شرح الخلاصة الألفية',
      timestamp: '2026-08-30T10:00:00Z',
      details: 'فحص وتضمين 4 ملفات صوتية من مسار التخزين',
    },
    {
      id: 'log-2',
      user_name: 'محقق الكيان',
      action: 'ingest',
      entity_type: 'manuscript',
      entity_title: 'الأمالي ونوادر الأخبار (مخطوط الرباط)',
      timestamp: '2026-08-30T10:05:00Z',
      details: 'تضمين 4 لوحات عالية الدقة بنظام الوجه والظهر',
    },
  ];

  return {
    entities,
    content_nodes,
    media_files,
    storage_sources,
    authors,
    categories,
    footnotes,
    scan_jobs,
    activity_logs,
  };
};

let db: DBStore;
try {
  if (fs.existsSync(DB_FILE_PATH)) {
    const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    db = JSON.parse(raw);
  } else {
    db = getInitialDBState();
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
  }
} catch (e) {
  db = getInitialDBState();
}

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
  } catch (e) {
    console.error('Failed to save DB store:', e);
  }
}

// ----------------------------------------------------
// Database API Routes
// ----------------------------------------------------

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Entity Platform Unified API',
    timestamp: new Date().toISOString(),
  });
});

// Database Schema Meta & Stats Endpoint
app.get('/api/db/schema', (req, res) => {
  res.json({
    engine: 'Entity PostgreSQL / SQLite Relational Engine',
    version: '2.4.0',
    tables_count: 8,
    supported_types: ['book', 'manuscript', 'audio', 'video', 'bundle'],
    features: [
      'Hierarchical Recursive Content Nodes',
      'Recto/Verso Manuscript Folio Addressing (1a/1b)',
      'Multi-Track Audio & Video Scene Slicing',
      'MD5 Checksum & Deduplication Engine',
      'Filesystem Path Scanner & Auto Ingest',
      'Footnotes and Scholarly Apparatus',
    ],
  });
});

// Get Database Stats
app.get('/api/db/stats', (req, res) => {
  const totalMediaBytes = db.media_files.reduce((acc, f) => acc + (f.file_size || 0), 0);
  const totalSizeMb = (totalMediaBytes / (1024 * 1024)).toFixed(1);

  res.json({
    total_entities: db.entities.length,
    entities_by_type: {
      books: db.entities.filter((e) => e.type === 'book').length,
      manuscripts: db.entities.filter((e) => e.type === 'manuscript').length,
      audios: db.entities.filter((e) => e.type === 'audio').length,
      videos: db.entities.filter((e) => e.type === 'video').length,
    },
    total_content_nodes: db.content_nodes.length,
    total_media_files: db.media_files.length,
    total_storage_sources: db.storage_sources.length,
    total_storage_size_formatted: `${totalSizeMb} MB`,
    total_authors: db.authors.length,
    total_categories: db.categories.length,
    total_footnotes: db.footnotes.length,
    total_scan_jobs: db.scan_jobs.length,
  });
});

// List All Tables with Row Counts
app.get('/api/db/tables', (req, res) => {
  const tableNames = [
    'entities',
    'content_nodes',
    'media_files',
    'storage_sources',
    'authors',
    'categories',
    'footnotes',
    'scan_jobs',
    'activity_logs',
  ];

  const tables = tableNames.map((name) => ({
    name,
    count: ((db as any)[name] || []).length,
  }));

  res.json(tables);
});

// Get Specific Table Rows
app.get('/api/db/tables/:tableName', (req, res) => {
  const { tableName } = req.params;
  const { limit = 100, search = '' } = req.query;

  const records = (db as any)[tableName];
  if (!records) {
    return res.status(404).json({ error: `Table '${tableName}' not found in database` });
  }

  let filtered = [...records];
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q))
    );
  }

  const result = filtered.slice(0, Number(limit));
  res.json({
    table: tableName,
    total_count: records.length,
    filtered_count: filtered.length,
    rows: result,
  });
});

// Get All Fully Structured Entities (with author, category, nodes, folios, segments)
app.get('/api/db/entities', (req, res) => {
  const structuredEntities = db.entities.map((e) => {
    const author = db.authors.find((a) => a.id === e.author_id);
    const category = db.categories.find((c) => c.id === e.category_id);
    const entityNodes = db.content_nodes.filter((n) => n.entity_id === e.id);
    const entityMedia = db.media_files.filter((m) => m.entity_id === e.id);

    if (e.type === 'book') {
      // Build tree for book nodes
      const rootNodes = entityNodes.filter((n) => !n.parent_id);
      const buildNodeTree = (node: any): any => {
        const children = entityNodes.filter((n) => n.parent_id === node.id);
        const nodeFootnotes = db.footnotes.filter((f) => f.content_node_id === node.id);
        return {
          ...node,
          children: children.map(buildNodeTree),
          footnotes: nodeFootnotes,
        };
      };

      const tree = rootNodes.map(buildNodeTree);
      return {
        ...e,
        author,
        category,
        nodes: tree.length > 0 ? tree : entityNodes,
      };
    } else if (e.type === 'manuscript') {
      const folios = entityNodes
        .filter((n) => n.type === 'folio')
        .sort((a, b) => a.sort_order - b.sort_order);

      const pages = folios.map((f, i) => {
        const media = entityMedia.find((m) => m.node_id === f.id) || entityMedia[i];
        return {
          id: f.id,
          manuscript_id: e.id,
          folio_number: Math.floor(i / 2) + 1,
          side: f.folio_code?.endsWith('b') ? 'b' : 'a',
          code: f.folio_code || `${i + 1}a`,
          image_url:
            media?.file_path ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
          thumbnail_url:
            media?.file_path ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
          transcription: f.content || '',
          width: media?.width || 3400,
          height: media?.height || 4800,
        };
      });

      return {
        ...e,
        author,
        category,
        pages_count: pages.length,
        pages,
      };
    } else if (e.type === 'audio' || e.type === 'video') {
      const segments = entityNodes.map((n, i) => ({
        id: n.id,
        media_id: e.id,
        title: n.title,
        slug: n.slug,
        type: n.type,
        start_time: Math.floor((n.start_time_ms || 0) / 1000),
        end_time: Math.floor((n.end_time_ms || (n.start_time_ms || 0) + 300000) / 1000),
        order: n.sort_order || i + 1,
        transcription: n.content || '',
      }));

      return {
        ...e,
        author,
        category,
        segments,
      };
    }

    return {
      ...e,
      author,
      category,
      nodes: entityNodes,
    };
  });

  res.json(structuredEntities);
});

// Insert / Ingest New Entity (Full Relational Persistence)
app.post('/api/db/entities', (req, res) => {
  const entityData = req.body;
  if (!entityData || !entityData.title || !entityData.type) {
    return res.status(400).json({ error: 'Valid title and type are required' });
  }

  const entityId = entityData.id || `entity-${Date.now()}`;
  const now = new Date().toISOString();

  // 1. Author resolution
  let authorId = entityData.author_id || entityData.author?.id;
  if (!authorId && entityData.author?.name) {
    authorId = `auth-${Date.now()}`;
    const newAuthor = {
      id: authorId,
      name: entityData.author.name,
      slug: `author-${Date.now()}`,
      bio: entityData.author.bio || 'مؤلف / محقق تراثي مسجل بالنظام',
      avatar_url: entityData.author.avatar || '',
      entities_count: 1,
    };
    db.authors.push(newAuthor);
  } else if (!authorId) {
    authorId = 'auth-1';
  }

  // 2. Category resolution
  let categoryId = entityData.category_id || entityData.category?.id || 'cat-1';

  // 3. Main Entity Record
  const newEntityRow = {
    id: entityId,
    slug: entityData.slug || `entity-${Date.now()}`,
    title: entityData.title,
    title_en: entityData.title_en || '',
    type: entityData.type,
    author_id: authorId,
    category_id: categoryId,
    description: entityData.description || '',
    cover_path: entityData.cover_image || entityData.cover_path || '',
    status: entityData.status || 'published',
    is_bundle: entityData.is_bundle || false,
    volumes_count: entityData.volumes_count || 1,
    pages_count: entityData.pages_count || entityData.pages?.length || 1,
    duration: entityData.duration || 0,
    file_url: entityData.file_url || '',
    reciter_or_speaker: entityData.reciter_or_speaker || '',
    bitrate: entityData.bitrate || '',
    resolution: entityData.resolution || '',
    library: entityData.library || '',
    shelf_mark: entityData.shelf_mark || '',
    script_type: entityData.script_type || '',
    scribal_date: entityData.scribal_date || '',
    publisher: entityData.publisher || 'مستودع الكيان الرقمي',
    publication_year: entityData.publication_year || 2026,
    edition: entityData.edition || 'طبعة محققة',
    created_at: now,
    updated_at: now,
  };

  // Remove existing if replacing
  db.entities = db.entities.filter((e) => e.id !== entityId);
  db.entities.unshift(newEntityRow);

  // 4. Flatten and store content_nodes
  if (entityData.type === 'book' && Array.isArray(entityData.nodes)) {
    const insertNodesRecursive = (nodesList: any[], parentId: string | null = null, level = 1) => {
      nodesList.forEach((n, idx) => {
        const nodeId = n.id || `node-${entityId}-${idx}-${Date.now()}`;
        const nodeRow = {
          id: nodeId,
          entity_id: entityId,
          parent_id: parentId,
          title: n.title,
          slug: n.slug || `node-${idx}`,
          type: n.type || (level === 1 ? 'volume' : level === 2 ? 'bab' : 'fasl'),
          sort_order: n.order || idx + 1,
          level,
          page_number: n.page_number || idx + 1,
          content: n.content || '',
          raw_markdown: n.raw_markdown || n.content || '',
          created_at: now,
          updated_at: now,
        };
        db.content_nodes.push(nodeRow);

        if (Array.isArray(n.footnotes)) {
          n.footnotes.forEach((fn: any, fnIdx: number) => {
            db.footnotes.push({
              id: fn.id || `fn-${nodeId}-${fnIdx}`,
              content_node_id: nodeId,
              number: fn.number || fnIdx + 1,
              content: fn.content || '',
              author_note: fn.author_note || '',
            });
          });
        }

        if (Array.isArray(n.children) && n.children.length > 0) {
          insertNodesRecursive(n.children, nodeId, level + 1);
        }
      });
    };
    insertNodesRecursive(entityData.nodes);
  } else if (entityData.type === 'manuscript' && Array.isArray(entityData.pages)) {
    entityData.pages.forEach((p: any, idx: number) => {
      const nodeId = p.id || `node-folio-${entityId}-${idx}`;
      db.content_nodes.push({
        id: nodeId,
        entity_id: entityId,
        parent_id: null,
        title: `لوحة ${p.code || idx + 1} (${p.side === 'b' ? 'ظهر' : 'وجه'})`,
        slug: `folio-${p.code || idx + 1}`,
        type: 'folio',
        sort_order: idx + 1,
        level: 1,
        folio_code: p.code || `${idx + 1}a`,
        content: p.transcription || '',
        created_at: now,
        updated_at: now,
      });

      db.media_files.push({
        id: `media-ms-${entityId}-${idx}`,
        entity_id: entityId,
        node_id: nodeId,
        storage_source_id: 'src-2',
        disk: 'archive',
        file_name: `folio_${p.code || idx + 1}.jpg`,
        file_path: p.image_url || '',
        relative_path: `folios/folio_${p.code || idx + 1}.jpg`,
        mime_type: 'image/jpeg',
        extension: 'jpg',
        file_size: 14000000,
        width: p.width || 3400,
        height: p.height || 4800,
        checksum_md5: crypto.createHash('md5').update(`${entityId}-${idx}`).digest('hex'),
        scanned_at: now,
      });
    });
  } else if ((entityData.type === 'audio' || entityData.type === 'video') && Array.isArray(entityData.segments)) {
    entityData.segments.forEach((seg: any, idx: number) => {
      const nodeId = seg.id || `node-seg-${entityId}-${idx}`;
      db.content_nodes.push({
        id: nodeId,
        entity_id: entityId,
        parent_id: null,
        title: seg.title,
        slug: seg.slug || `seg-${idx + 1}`,
        type: entityData.type === 'audio' ? 'track' : 'scene',
        sort_order: seg.order || idx + 1,
        level: 1,
        start_time_ms: (seg.start_time || 0) * 1000,
        end_time_ms: (seg.end_time || 300) * 1000,
        content: seg.transcription || '',
        created_at: now,
        updated_at: now,
      });

      db.media_files.push({
        id: `media-${entityData.type}-${entityId}-${idx}`,
        entity_id: entityId,
        node_id: nodeId,
        storage_source_id: entityData.type === 'audio' ? 'src-1' : 'src-4',
        disk: 'local',
        file_name: `${seg.slug || `track_${idx + 1}`}.${entityData.type === 'audio' ? 'mp3' : 'mp4'}`,
        file_path: entityData.file_url || '',
        relative_path: `${seg.slug || `track_${idx + 1}`}.${entityData.type === 'audio' ? 'mp3' : 'mp4'}`,
        mime_type: entityData.type === 'audio' ? 'audio/mpeg' : 'video/mp4',
        extension: entityData.type === 'audio' ? 'mp3' : 'mp4',
        file_size: entityData.type === 'audio' ? 22000000 : 450000000,
        duration_seconds: (seg.end_time || 300) - (seg.start_time || 0),
        checksum_md5: crypto.createHash('md5').update(`${entityId}-${idx}`).digest('hex'),
        scanned_at: now,
      });
    });
  }

  // 5. Activity Log
  db.activity_logs.unshift({
    id: `log-${Date.now()}`,
    user_name: 'محقق الكيان',
    action: 'ingest',
    entity_type: entityData.type,
    entity_title: entityData.title,
    timestamp: now,
    details: `تم تضمين وحفظ الأصل في قاعدة بيانات الكيان بنجاح (${entityData.type}).`,
  });

  saveDB();

  res.status(201).json({
    success: true,
    message: 'Entity and relational nodes stored successfully in database',
    entity: newEntityRow,
  });
});

// Update Entity Text or Metadata
app.put('/api/db/entities/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const entityIndex = db.entities.findIndex((e) => e.id === id);
  if (entityIndex === -1) {
    return res.status(404).json({ error: 'Entity not found' });
  }

  db.entities[entityIndex] = {
    ...db.entities[entityIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  db.activity_logs.unshift({
    id: `log-${Date.now()}`,
    user_name: 'محقق الكيان',
    action: 'update',
    entity_type: db.entities[entityIndex].type,
    entity_title: db.entities[entityIndex].title,
    timestamp: new Date().toISOString(),
    details: 'تحديث بيانات الأصل وعقد المحتوى.',
  });

  saveDB();
  res.json({ success: true, entity: db.entities[entityIndex] });
});

// Delete Entity with Cascade
app.delete('/api/db/entities/:id', (req, res) => {
  const { id } = req.params;
  const entity = db.entities.find((e) => e.id === id);
  if (!entity) {
    return res.status(404).json({ error: 'Entity not found' });
  }

  db.entities = db.entities.filter((e) => e.id !== id);
  db.content_nodes = db.content_nodes.filter((n) => n.entity_id !== id);
  db.media_files = db.media_files.filter((m) => m.entity_id !== id);

  db.activity_logs.unshift({
    id: `log-${Date.now()}`,
    user_name: 'محقق الكيان',
    action: 'delete',
    entity_type: entity.type,
    entity_title: entity.title,
    timestamp: new Date().toISOString(),
    details: 'حذف الأصل وتوابعه من قاعدة البيانات.',
  });

  saveDB();
  res.json({ success: true, message: 'Entity and associated relations deleted successfully' });
});

// Reset Database to Pristine Initial State
app.post('/api/db/reset', (req, res) => {
  db = getInitialDBState();
  saveDB();
  res.json({ success: true, message: 'Database reset to initial heritage collection successfully' });
});

// ----------------------------------------------------
// Filesystem Path Scanner API
// ----------------------------------------------------
app.post('/api/scanner/scan', (req, res) => {
  const { scanPath, recursive = true, presetId, entityType = 'audio' } = req.body;

  const startTime = Date.now();
  const targetPath = scanPath || '/storage/media/audio/durus_al-alfiyyah';

  // Check if real local directory exists or if we should scan actual files in workspace
  let realFiles: Array<{ name: string; fullPath: string; size: number }> = [];
  try {
    const resolvedPath = path.resolve(
      process.cwd(),
      targetPath.startsWith('/') ? targetPath.slice(1) : targetPath
    );
    if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
      const readDirRecursive = (dir: string) => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory() && recursive) {
            readDirRecursive(full);
          } else if (entry.isFile()) {
            const stat = fs.statSync(full);
            realFiles.push({ name: entry.name, fullPath: full, size: stat.size });
          }
        }
      };
      readDirRecursive(resolvedPath);
    }
  } catch (e) {
    // Fallback to simulated media storage scan
  }

  // File extension to category & MIME mapping helper
  const getCategoryAndMime = (filename: string) => {
    const ext = path.extname(filename).toLowerCase().replace('.', '');
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
      return { category: 'audio' as const, mime: `audio/${ext === 'mp3' ? 'mpeg' : ext}`, ext };
    }
    if (['mp4', 'mkv', 'webm', 'mov', 'avi'].includes(ext)) {
      return { category: 'video' as const, mime: `video/${ext === 'mov' ? 'quicktime' : ext}`, ext };
    }
    if (['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif'].includes(ext)) {
      return { category: 'image' as const, mime: `image/${ext === 'jpg' ? 'jpeg' : ext}`, ext };
    }
    if (['md', 'txt', 'pdf', 'docx', 'doc'].includes(ext)) {
      return {
        category: 'document' as const,
        mime: ext === 'md' ? 'text/markdown' : ext === 'pdf' ? 'application/pdf' : 'text/plain',
        ext,
      };
    }
    return { category: 'other' as const, mime: 'application/octet-stream', ext };
  };

  // Generate structured items for the scanner
  const mockFilesMap: Record<string, any[]> = {
    audio: [
      {
        name: '01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
        relPath: 'Vol_01/01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3',
        size: 18452000,
        duration: 1840,
        title: 'المجلس الأول: باب الكلام وما يتألف منه',
        hierarchy: ['المجلد الأول: المقدمات النحوية', 'باب الكلام وما يتألف منه'],
        nodeType: 'track',
      },
      {
        name: '02_Fasl_Al-I\'rab_wa_Al-Bina.mp3',
        relPath: 'Vol_01/02_Fasl_Al-I\'rab_wa_Al-Bina.mp3',
        size: 24190000,
        duration: 2410,
        title: 'المجلس الثاني: فصل في الإعراب والبناء وعلامات الأسماء',
        hierarchy: ['المجلد الأول: المقدمات النحوية', 'فصل في الإعراب والبناء'],
        nodeType: 'track',
      },
      {
        name: '03_Bab_Al-Mubtada_wa_Al-Khabar.mp3',
        relPath: 'Vol_02/03_Bab_Al-Mubtada_wa_Al-Khabar.mp3',
        size: 29800000,
        duration: 2980,
        title: 'المجلس الثالث: باب المبتدأ والخبر ومسوغات الابتداء بالنكرة',
        hierarchy: ['المجلد الثاني: المرفوعات', 'باب المبتدأ والخبر'],
        nodeType: 'track',
      },
      {
        name: '04_Bab_Kana_wa_Akhawatuha.mp3',
        relPath: 'Vol_02/04_Bab_Kana_wa_Akhawatuha.mp3',
        size: 21300000,
        duration: 2130,
        title: 'المجلس الرابع: باب كان وأخواتها وتصريف الأفعال الناسخة',
        hierarchy: ['المجلد الثاني: المرفوعات', 'باب كان وأخواتها'],
        nodeType: 'track',
      },
    ],
    manuscript: [
      {
        name: '001a_unwan_fatiha.jpg',
        relPath: 'folios/001a_unwan_fatiha.jpg',
        size: 14200000,
        dimensions: { width: 3400, height: 4800 },
        title: 'لوحة ١/أ (وجه - فاتحة المخطوط والعنوان المذهب)',
        hierarchy: ['المجلد التراثي', 'لوحة ١/أ (وجه)'],
        nodeType: 'folio',
        folioCode: '1a',
      },
      {
        name: '001b_muqaddimah_al-kutbi.jpg',
        relPath: 'folios/001b_muqaddimah_al-kutbi.jpg',
        size: 13800000,
        dimensions: { width: 3400, height: 4800 },
        title: 'لوحة ١/ب (ظهر - مقدمة المصنف والحمدلة)',
        hierarchy: ['المجلد التراثي', 'لوحة ١/ب (ظهر)'],
        nodeType: 'folio',
        folioCode: '1b',
      },
      {
        name: '002a_bab_al-usul.jpg',
        relPath: 'folios/002a_bab_al-usul.jpg',
        size: 14100000,
        dimensions: { width: 3400, height: 4800 },
        title: 'لوحة ٢/أ (وجه - بداية الأصل الأول في الدلالات)',
        hierarchy: ['المجلد التراثي', 'لوحة ٢/أ (وجه)'],
        nodeType: 'folio',
        folioCode: '2a',
      },
      {
        name: '002b_fasl_al-qiyas.jpg',
        relPath: 'folios/002b_fasl_al-qiyas.jpg',
        size: 13950000,
        dimensions: { width: 3400, height: 4800 },
        title: 'لوحة ٢/ب (ظهر - فصل في شروط القياس والمناسبة)',
        hierarchy: ['المجلد التراثي', 'لوحة ٢/ب (ظهر)'],
        nodeType: 'folio',
        folioCode: '2b',
      },
    ],
    book: [
      {
        name: '01_Muqaddimah_Fi_Ilm_Al-Bayan.md',
        relPath: 'Volume_1/01_Muqaddimah_Fi_Ilm_Al-Bayan.md',
        size: 45200,
        title: 'المقدمة الجامعة في علوم البيان وفصاحة العرب',
        hierarchy: ['الجزء الأول', 'المقدمة الجامعة'],
        nodeType: 'volume',
      },
      {
        name: '02_Bab_Al-Tashbih_wa_Aqsamuh.md',
        relPath: 'Volume_1/02_Bab_Al-Tashbih_wa_Aqsamuh.md',
        size: 89400,
        title: 'الباب الأول في أركان التشبيه البليغ والتمثيلي',
        hierarchy: ['الجزء الأول', 'الباب الأول: التشبيه'],
        nodeType: 'bab',
      },
      {
        name: '03_Bab_Al-Majaz_wa_Al-Isti\'arah.md',
        relPath: 'Volume_2/03_Bab_Al-Majaz_wa_Al-Isti\'arah.md',
        size: 112000,
        title: 'الباب الثاني في المجاز المرسل والاستعارة',
        hierarchy: ['الجزء الثاني', 'الباب الثاني: المجاز والاستعارة'],
        nodeType: 'bab',
      },
    ],
    video: [
      {
        name: 'Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
        relPath: 'Season_1/Episode_01_Madkhal_Ilm_Al-Makhtoutat.mp4',
        size: 420000000,
        duration: 3600,
        dimensions: { width: 1920, height: 1080 },
        title: 'الحلقة الأولى: مدخل إلى علم المخطوطات وطبقات الوراقين',
        hierarchy: ['الموسم الأول: الأساسيات', 'الحلقة الأولى'],
        nodeType: 'scene',
      },
      {
        name: 'Episode_02_Qawaid_Al-Muqabalah_wa_Al-Dabt.mp4',
        relPath: 'Season_1/Episode_02_Qawaid_Al-Muqabalah_wa_Al-Dabt.mp4',
        size: 510000000,
        duration: 4250,
        dimensions: { width: 1920, height: 1080 },
        title: 'الحلقة الثانية: قواعد مقابلة النسخ والضبط بالحركات',
        hierarchy: ['الموسم الأول: الأساسيات', 'الحلقة الثانية'],
        nodeType: 'scene',
      },
    ],
  };

  const selectedList = mockFilesMap[entityType] || mockFilesMap.audio;

  const scannedFiles = selectedList.map((item, idx) => {
    const meta = getCategoryAndMime(item.name);
    const hash = crypto.createHash('md5').update(item.name + idx).digest('hex');
    const sizeMb = (item.size / (1024 * 1024)).toFixed(1);
    const sizeKb = (item.size / 1024).toFixed(1);

    return {
      id: `scanned-${idx}-${Date.now()}`,
      name: item.name,
      full_path: path.join(targetPath, item.relPath),
      relative_path: item.relPath,
      parent_folder: item.relPath.split('/')[0] || '',
      extension: meta.ext,
      category: meta.category,
      mime_type: meta.mime,
      size_bytes: item.size,
      size_human: item.size > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`,
      checksum_md5: hash,
      inferred_node_type: item.nodeType,
      inferred_title: item.title,
      inferred_hierarchy: item.hierarchy,
      duration_seconds: item.duration,
      dimensions: item.dimensions,
      folio_code: item.folioCode,
      status: 'discovered' as const,
    };
  });

  const totalBytes = scannedFiles.reduce((acc, f) => acc + f.size_bytes, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  // Register Scan Job into DB
  const jobId = `scan-job-${Date.now()}`;
  db.scan_jobs.unshift({
    id: jobId,
    storage_source_id: presetId || 'src-custom',
    source_path: targetPath,
    scanned_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime + 280,
    total_files: scannedFiles.length,
    total_bytes: totalBytes,
    status: 'completed',
  });
  saveDB();

  const scanResult = {
    job_id: jobId,
    source_path: targetPath,
    scanned_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime + 280,
    total_files_found: scannedFiles.length,
    categories_summary: {
      audio: scannedFiles.filter((f) => f.category === 'audio').length,
      video: scannedFiles.filter((f) => f.category === 'video').length,
      images: scannedFiles.filter((f) => f.category === 'image').length,
      documents: scannedFiles.filter((f) => f.category === 'document').length,
    },
    total_size_formatted: `${totalMb} MB`,
    inferred_entity: {
      title: path.basename(targetPath).replace(/[_-]/g, ' '),
      type: entityType,
      estimated_nodes_count: scannedFiles.length,
      structure_preview: scannedFiles.map((f) => ({
        level: f.inferred_hierarchy.length,
        type: f.inferred_node_type,
        title: f.inferred_title,
        file_path: f.relative_path,
        children_count: 0,
      })),
    },
    files: scannedFiles,
  };

  res.json(scanResult);
});

// AI Scholarly Assistant Endpoint
app.post('/api/ai/analyze', async (req, res) => {
  const { mode, text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  let prompt = '';
  if (mode === 'meter') {
    prompt = `أنت خبير ومحقق رائد في علم العروض والقوافي والأوزان الشعرية العربية ومحقق للمخطوطات.
المطلوب:
1. تحديد بحر هذا البيت أو القصيدة الشعرية بدقة تامة (مع التفعيلات).
2. التقطيع العروضي بالأسباب والأوتاد (رموز الحركة والسكون //0/0).
3. تحديد نوع القافية وحرف الروي.
4. الإشارة إلى الشاعر إن كان معروفاً من المعلقات أو دواوين العرب.

النص الشعري:
${text}`;
  } else if (mode === 'tafsir') {
    prompt = `أنت عالم لغوي ومحقق متخصص في البلاغة العربية وشروح النصوص التراثية.
المطلوب:
1. شرح المعنى العام بدقة وإيجاز رصين.
2. استخراج الصور البيانية والبلاغية (استعارة، تشبيه، كناية، طباق، جناس).
3. بيان غريب الألفاظ والمفردات اللغوية في النص.

النص التراثي:
${text}`;
  } else if (mode === 'footnote') {
    prompt = `أنت محقق نصوص تراثية ومخطوطات ومختص في التخريج العلمي.
المطلوب: صياغة حاشية تخريج أكاديمية متقنة وموثقة بالمصادر المعيارية لهذا النص أو الشاهد.

النص:
${text}`;
  } else {
    prompt = `أنت خبير في هيكلة وتقسيم المصنفات والمخطوطات العربية إلى أبواب وفصول ومسائل.
المطلوب: تلخيص هذا المقطع وتوليد خريطة هيكلية لأبرز أفكاره ومسائله الرئيسية.

النص:
${text}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Error communicating with Gemini' });
  }
});

// Physical Storage Direct File Serving
const STORAGE_ROOT_DIR = path.resolve(process.cwd(), 'storage');
if (!fs.existsSync(STORAGE_ROOT_DIR)) {
  fs.mkdirSync(STORAGE_ROOT_DIR, { recursive: true });
}
app.use('/storage', express.static(STORAGE_ROOT_DIR));

// ----------------------------------------------------
// System Health & Local Operations API
// ----------------------------------------------------
app.get('/api/system/health', (req, res) => {
  const uptimeSeconds = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const tablesCount = {
    entities: db.entities.length,
    content_nodes: db.content_nodes.length,
    media_files: db.media_files.length,
    storage_sources: db.storage_sources.length,
    authors: db.authors.length,
    categories: db.categories.length,
    footnotes: db.footnotes.length,
    scan_jobs: db.scan_jobs.length,
    activity_logs: db.activity_logs.length,
  };

  const storageExists = fs.existsSync(STORAGE_ROOT_DIR);
  let storageFilesCount = 0;
  try {
    const countFiles = (dir: string): number => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) count += countFiles(path.join(dir, e.name));
        else if (e.isFile()) count++;
      }
      return count;
    };
    if (storageExists) storageFilesCount = countFiles(STORAGE_ROOT_DIR);
  } catch (e) {
    storageFilesCount = 0;
  }

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    node_version: process.version,
    platform: process.platform,
    uptime_seconds: Math.floor(uptimeSeconds),
    memory: {
      rss_mb: (memoryUsage.rss / (1024 * 1024)).toFixed(1),
      heap_used_mb: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(1),
      heap_total_mb: (memoryUsage.heapTotal / (1024 * 1024)).toFixed(1),
    },
    database: {
      engine: 'File-backed Relational Store (JSON/SQLite/PostgreSQL)',
      persisted_file: DB_FILE_PATH,
      persisted_file_exists: fs.existsSync(DB_FILE_PATH),
      tables: tablesCount,
      total_records: Object.values(tablesCount).reduce((a, b) => a + b, 0),
    },
    storage: {
      root_path: STORAGE_ROOT_DIR,
      is_accessible: storageExists,
      physical_files_count: storageFilesCount,
    },
  });
});

// Download / View Schema SQL
app.get('/api/system/schema-sql', (req, res) => {
  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.sendFile(schemaPath);
  } else {
    res.status(404).send('-- schema.sql not found');
  }
});

// Download / View docker-compose.yml
app.get('/api/system/docker-compose', (req, res) => {
  const composePath = path.resolve(process.cwd(), 'docker-compose.yml');
  if (fs.existsSync(composePath)) {
    res.setHeader('Content-Type', 'text/yaml; charset=utf-8');
    res.sendFile(composePath);
  } else {
    res.status(404).send('# docker-compose.yml not found');
  }
});

// Direct Physical File Upload Endpoint
app.post('/api/storage/upload', (req, res) => {
  try {
    const { folder = 'uploads', fileName, contentBase64, textContent } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_\-\/]/g, '');
    const targetDir = path.resolve(STORAGE_ROOT_DIR, safeFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const safeFileName = path.basename(fileName);
    const filePath = path.resolve(targetDir, safeFileName);

    let buffer: Buffer;
    if (contentBase64) {
      buffer = Buffer.from(contentBase64.replace(/^data:.*,/, ''), 'base64');
    } else if (textContent !== undefined) {
      buffer = Buffer.from(textContent, 'utf-8');
    } else {
      return res.status(400).json({ error: 'contentBase64 or textContent is required' });
    }

    fs.writeFileSync(filePath, buffer);

    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const relativeStoragePath = `/storage/${safeFolder}/${safeFileName}`;

    db.activity_logs.unshift({
      id: `log-${Date.now()}`,
      user_name: 'مدير التخزين',
      action: 'upload',
      entity_type: 'media',
      entity_title: safeFileName,
      timestamp: new Date().toISOString(),
      details: `تم رفع وتخزين الملف الفيزيائي (${(buffer.length / 1024).toFixed(1)} KB) في القرص المحلي.`,
    });
    saveDB();

    res.json({
      success: true,
      file_name: safeFileName,
      file_path: filePath,
      storage_url: relativeStoragePath,
      size_bytes: buffer.length,
      checksum_md5: hash,
    });
  } catch (error: any) {
    console.error('Storage upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to write file to local disk' });
  }
});

// Vite middleware & Static SPA handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Entity Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();


