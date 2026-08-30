import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const cwd = process.cwd();
const STORAGE_ROOT = path.resolve(cwd, 'storage');

console.log('====================================================');
console.log('  🏛️  ENTITY PLATFORM - LOCAL STORAGE & DB SETUP');
console.log('====================================================');
console.log(`[1/4] Ensuring storage directories at: ${STORAGE_ROOT}`);

const foldersToCreate = [
  'storage',
  'storage/books',
  'storage/books/asrar_al-balaghah',
  'storage/books/asrar_al-balaghah/Volume_1',
  'storage/books/asrar_al-balaghah/Volume_2',
  'storage/manuscripts',
  'storage/manuscripts/andalus_collection_ms42',
  'storage/manuscripts/andalus_collection_ms42/folios',
  'storage/media',
  'storage/media/audio',
  'storage/media/audio/durus_al-alfiyyah',
  'storage/media/audio/durus_al-alfiyyah/Vol_01',
  'storage/media/audio/durus_al-alfiyyah/Vol_02',
  'storage/media/video',
  'storage/media/video/makhtoutat_masterclass',
  'storage/media/video/makhtoutat_masterclass/Season_1',
  'storage/uploads',
];

foldersToCreate.forEach((f) => {
  const fullPath = path.resolve(cwd, f);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`  + Created directory: ${f}`);
  } else {
    console.log(`  ✓ Directory exists: ${f}`);
  }
});

console.log('\n[2/4] Populating physical sample books and manuscripts on disk...');

// 1. Sample Markdown Books
const bookFile1 = path.resolve(
  STORAGE_ROOT,
  'books/asrar_al-balaghah/Volume_1/01_Muqaddimah_Fi_Ilm_Al-Bayan.md'
);
if (!fs.existsSync(bookFile1)) {
  const content = `# المقدمة الجامعة في علوم البيان وفصاحة العرب

بسم الله الرحمن الرحيم، وبه نستعين

## فصل في فضل البيان وسر البلاغة
اعلم أن الكلام إنما شُرّف بحسن نظمه وبلاغة تركيبه، ومطابقته لمقتضى الحال مع فصاحة ألفاظه وسلاسة مخارجها.

قال الإمام أبو بكر عبد القاهر الجرجاني رحمه الله:
> "ليس النظم إلا توخي معاني النحو فيما بين الكلم، على حسب الأغراض التي يُصاغ لها الكلام."[^1]

### شروط الفصاحة في المفرد والمركب:
1. السلامة من تنافر الحروف (كقولهم: مستشزرات إلى العلا).
2. السلامة من الغرابة والوحشي من الألفاظ.
3. السلامة من التعقيد اللفظي والمعنوي.

[^1]: دلائل الإعجاز، تحقيق العلامة محمود محمد شاكر، ص ٤٥.
`;
  fs.writeFileSync(bookFile1, content, 'utf-8');
  console.log('  + Created Markdown Book: Volume_1/01_Muqaddimah_Fi_Ilm_Al-Bayan.md');
}

const bookFile2 = path.resolve(
  STORAGE_ROOT,
  'books/asrar_al-balaghah/Volume_1/02_Bab_Al-Tashbih_wa_Aqsamuh.md'
);
if (!fs.existsSync(bookFile2)) {
  const content = `# الباب الأول: في أركان التشبيه وأقسامه البلاغية

## حد التشبيه وأركانه الأربعة
التشبيه في لسان العرب: الدلالة على مشاركة أمرٍ لأمرٍ في معنىً بإحدى أدوات التشبيه ملفوظة أو مقدرة.

وأركانه أربعة:
1. **المشبه**: وهو الذات أو المعنى المراد إلحاقه بغيره.
2. **المشبه به**: وهو الأصل الذي يُلحق به المشبه لظهور الوصف فيه.
3. **وجه الشبه**: الوصف المشترك بين الطرفين.
4. **أداة التشبيه**: مثل الكاف، وكأنّ، ويماثل، ويشابه.

### شواهد التشبيه البليغ من ديوان العرب:
قول الشاعر الأندلسي:
*والريح تعبث بالغصون وقد جرى ... ذهبُ الأصيلِ على لجينِ الماءِ*[^2]

[^2]: ديوان ابن خفاجة الأندلسي، دار صادر بيروت، ص ١١٢.
`;
  fs.writeFileSync(bookFile2, content, 'utf-8');
  console.log('  + Created Markdown Book: Volume_1/02_Bab_Al-Tashbih_wa_Aqsamuh.md');
}

// 2. Sample SVG Facsimiles for Manuscript Folios
const folios = [
  { file: '001a_unwan_fatiha.jpg', title: 'فاتحة المخطوط والعنوان المذهب', code: '1a' },
  { file: '001b_muqaddimah_al-kutbi.jpg', title: 'مقدمة المصنف والحمدلة', code: '1b' },
  { file: '002a_bab_al-usul.jpg', title: 'بداية الأصل الأول في الدلالات', code: '2a' },
  { file: '002b_fasl_al-qiyas.jpg', title: 'فصل في شروط القياس والمناسبة', code: '2b' },
];

folios.forEach((fo) => {
  const folioPath = path.resolve(
    STORAGE_ROOT,
    `manuscripts/andalus_collection_ms42/folios/${fo.file}`
  );
  if (!fs.existsSync(folioPath)) {
    // Generate a high-res SVG / placeholder manuscript canvas representation
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1700" viewBox="0 0 1200 1700">
      <defs>
        <radialGradient id="paper" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#fdf6e2"/>
          <stop offset="70%" stop-color="#f3e5c8"/>
          <stop offset="100%" stop-color="#d4b886"/>
        </radialGradient>
        <pattern id="lines" width="100" height="48" patternUnits="userSpaceOnUse">
          <line x1="0" y1="46" x2="100" y2="46" stroke="#c2a675" stroke-width="0.75" stroke-dasharray="3,3" opacity="0.35"/>
        </pattern>
      </defs>
      <rect width="1200" height="1700" fill="url(#paper)"/>
      <rect x="70" y="70" width="1060" height="1560" fill="none" stroke="#8b5a2b" stroke-width="3" opacity="0.6"/>
      <rect x="85" y="85" width="1030" height="1530" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.8"/>
      <rect x="110" y="140" width="980" height="1420" fill="url(#lines)"/>
      
      <!-- Folio Header -->
      <text x="600" y="130" font-family="serif" font-size="24" font-weight="bold" fill="#5c3a21" text-anchor="middle">لوحة ${fo.code} - ${fo.title}</text>
      <text x="600" y="190" font-family="serif" font-size="34" font-weight="bold" fill="#800000" text-anchor="middle">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</text>
      
      <!-- Decorative Box -->
      <rect x="180" y="220" width="840" height="70" fill="#fdf2d0" stroke="#d4af37" stroke-width="2"/>
      <text x="600" y="265" font-family="serif" font-size="28" font-weight="bold" fill="#1a472a" text-anchor="middle">الأمالي ونوادر الأخبار - نسخة الخزانة الأندلسية</text>

      <!-- Simulated Calligraphy lines -->
      <text x="1000" y="360" font-family="serif" font-size="22" fill="#2b1810" text-anchor="end">قال الشيخ أبو علي إسماعيل بن القاسم القالي رحمه الله تعالى ورضي عنه وأرضاه:</text>
      <text x="1000" y="420" font-family="serif" font-size="22" fill="#2b1810" text-anchor="end">الحمد لله الذي افتتح بالحمد كتابه، وجعل ذكره مفتاح كل خير وبركة وثوابه، والصلاة والسلام على نبينا محمد.</text>
      <text x="1000" y="480" font-family="serif" font-size="22" fill="#2b1810" text-anchor="end">هذا كتاب أمليناه من حفظنا في مجالس العلم بقرطبة حماها الله، في جوامع اللغة وشواهد النحو والبيان.</text>
      <text x="1000" y="540" font-family="serif" font-size="22" fill="#2b1810" text-anchor="end">وقد أودعنا فيه من نوادر الأشعار وغريب الأخبار ما تقر به أعين الأدباء وتنشط له همم المحققين النبلاء.</text>

      <!-- Watermark Seal -->
      <circle cx="250" cy="1400" r="85" fill="none" stroke="#a00" stroke-width="3" stroke-dasharray="6,4" opacity="0.6"/>
      <text x="250" y="1395" font-family="serif" font-size="16" fill="#a00" text-anchor="middle" opacity="0.8">وقف لله تعالى</text>
      <text x="250" y="1420" font-family="serif" font-size="14" fill="#a00" text-anchor="middle" opacity="0.8">الخزانة الملكية</text>

      <!-- Footer shelfmark -->
      <text x="600" y="1650" font-family="monospace" font-size="16" fill="#7a6245" text-anchor="middle">Shelfmark: MS-42/Adab • Royal Collection Rabat • Digital Facsimile</text>
    </svg>`;
    fs.writeFileSync(folioPath, svgContent, 'utf-8');
    console.log(`  + Created Facsimile File: folios/${fo.file}`);
  }
});

// 3. Sample Audio/Video Manifest & Placeholder Tracks
const audioDir = path.resolve(STORAGE_ROOT, 'media/audio/durus_al-alfiyyah/Vol_01');
const audioSamplePath = path.resolve(audioDir, '01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3');
if (!fs.existsSync(audioSamplePath)) {
  fs.writeFileSync(
    audioSamplePath,
    'ID3\x03\x00\x00\x00\x00\x00\x00ENTITY-AUDIO-HEADER-SIMULATED-SAMPLE-STREAM'
  );
  console.log('  + Created Audio Track: Vol_01/01_Bab_Al-Kalam_wa_Ma_Yataalaf_Minh.mp3');
}

console.log('\n[3/4] Checking database store persistence file...');
const dbStorePath = path.resolve(cwd, 'database_store.json');
if (fs.existsSync(dbStorePath)) {
  console.log(`  ✓ Found existing database store at: ${dbStorePath}`);
} else {
  console.log(`  * database_store.json will be automatically initialized by server.ts on boot.`);
}

console.log('\n[4/4] Setup complete! You are ready to run:');
console.log('  1. npm run dev          (Start local development server on http://localhost:3000)');
console.log('  2. docker compose up -d (Optional: run with PostgreSQL 16 container)');
console.log('====================================================\n');
