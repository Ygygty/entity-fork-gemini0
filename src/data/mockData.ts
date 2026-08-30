import {
  Author,
  Category,
  Topic,
  Tag,
  Book,
  Manuscript,
  AudioItem,
  VideoItem,
  ActivityLog,
} from '../types';

export const mockAuthors: Author[] = [
  {
    id: 'auth-1',
    name: 'عبد الرحمن بن خلدون',
    name_en: 'Ibn Khaldun',
    death_year_hijri: 808,
    death_year_gregorian: 1406,
    bio: 'مؤرخ وفيلسوف وعالم اجتماع عربي أندلسي، رائد علم الاجتماع ومؤسس فلسفة التاريخ.',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    entities_count: 5,
  },
  {
    id: 'auth-2',
    name: 'الإمام يحيى بن شرف النووي',
    name_en: 'Imam Al-Nawawi',
    death_year_hijri: 676,
    death_year_gregorian: 1277,
    bio: 'محدث وفقيه ولغوي شافعي، اشتهر بكتبه النافعة مثل رياض الصالحين والأربعين النووية والمنهاج.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    entities_count: 8,
  },
  {
    id: 'auth-3',
    name: 'القاضي عياض بن موسى اليحصبي',
    name_en: 'Al-Qadi Iyad',
    death_year_hijri: 544,
    death_year_gregorian: 1149,
    bio: 'إمام وحافظ وعالم بحديث رسول الله وفقه مالك، ومؤلف كتاب الشفا بتعريف حقوق المصطفى.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    entities_count: 4,
  },
  {
    id: 'auth-4',
    name: 'أبو الطيب المتنبي',
    name_en: 'Al-Mutanabbi',
    death_year_hijri: 354,
    death_year_gregorian: 965,
    bio: 'شاعر العصر العباسي الأكبر وأحد مفاخر الأدب العربي، صاحب الحكم السائرة والقصائد الخالدة.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    entities_count: 6,
  },
];

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'التاريخ وعلم الاجتماع',
    name_en: 'History & Sociology',
    description: 'المصادر التاريخية ودراسات العمران البشري وتراجم الأعلام',
    color: '#3b82f6',
    icon: 'Landmark',
    count: 14,
  },
  {
    id: 'cat-2',
    name: 'الحديث الشريف وعلومه',
    name_en: 'Hadith & Prophetic Tradition',
    description: 'كتب السنة وشروح الحديث النبوي وتخريج الآثار والمصطلحات',
    color: '#10b981',
    icon: 'BookOpen',
    count: 22,
  },
  {
    id: 'cat-3',
    name: 'المخطوطات والنوادر',
    name_en: 'Manuscripts & Rare Facsimiles',
    description: 'النسخ الخطية القديمة والمصورات الوثائقية النفيسة والتحقيقات',
    color: '#f59e0b',
    icon: 'Scroll',
    count: 18,
  },
  {
    id: 'cat-4',
    name: 'الأدب والشعر العربي',
    name_en: 'Literature & Classical Poetry',
    description: 'دواوين الشعراء، البلاغة العربية، النقد الأدبي وشروح المعلقات',
    color: '#ec4899',
    icon: 'Feather',
    count: 16,
  },
  {
    id: 'cat-5',
    name: 'المحاضرات والمسموعات',
    name_en: 'Audio Lectures & Recitations',
    description: 'التسجيلات الصوتية وشروح المتون العلمية والأصوات التراثية',
    color: '#8b5cf6',
    icon: 'Headphones',
    count: 31,
  },
];

export const mockTopics: Topic[] = [
  { id: 'top-1', name: 'علم العمران البشري', description: 'نظريات العصبية والدولة والعمران' },
  { id: 'top-2', name: 'الآداب والأخلاق', description: 'تهذيب النفس ومعاملات المسلم' },
  { id: 'top-3', name: 'علم تحقيق النصوص', description: 'قواعد مقابلة النسخ وضبط الهوامش' },
  { id: 'top-4', name: 'البحور الشعرية والعروض', description: 'أوزان الشعر العربي وتقطيعه' },
];

export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'محقق علمياً', slug: 'peer-reviewed' },
  { id: 'tag-2', name: 'نسخة فريدة', slug: 'unique-manuscript' },
  { id: 'tag-3', name: 'شامل الهوامش', slug: 'with-footnotes' },
  { id: 'tag-4', name: 'تسجيل نادر', slug: 'rare-recording' },
  { id: 'tag-5', name: 'بحر الطويل', slug: 'taweel-meter' },
];

export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: 'مقدمة ابن خلدون',
    title_en: 'Muqaddimah Ibn Khaldun',
    slug: 'muqaddimah-ibn-khaldun',
    type: 'book',
    description: 'المقدمة الشهيرة في التاريخ وفلسفة العمران البشري وقوانين تطور الدول والقبائل.',
    author: mockAuthors[0],
    author_id: 'auth-1',
    category: mockCategories[0],
    category_id: 'cat-1',
    volumes_count: 2,
    pages_count: 640,
    publisher: 'دار ابن كثير للنشر والتحقيق',
    publication_year: 2021,
    edition: 'الطبعة النقدية الرابعة',
    status: 'published',
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-08-28T14:30:00Z',
    cover_image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    nodes: [
      {
        id: 'node-1',
        entity_id: 'book-1',
        title: 'المجلد الأول: في طبيعة العمران البشري',
        slug: 'volume-1',
        type: 'volume',
        order: 1,
        content: 'يتناول هذا المجلد أصول علم الاجتماع وقوانين التطور القبلي والعصبية.',
        children: [
          {
            id: 'node-1-1',
            entity_id: 'book-1',
            parent_id: 'node-1',
            title: 'الباب الأول: في العمران البشري على الجملة وأصنافه',
            slug: 'bab-1',
            type: 'bab',
            order: 1,
            content: 'اعلم أن الاجتماع الإنساني ضروري، ويعبر الحكماء عن هذا بقولهم: الإنسان مدني بالطبع.',
            children: [
              {
                id: 'node-1-1-1',
                entity_id: 'book-1',
                parent_id: 'node-1-1',
                title: 'الفصل الأول: في أن الاجتماع الإنساني ضروري',
                slug: 'fasl-1-necessity-of-society',
                type: 'fasl',
                order: 1,
                content: `
<h3>الفصل الأول: في أن الاجتماع الإنساني ضروري</h3>
<p class="leading-relaxed">اعلم أن الاجتماع الإنساني ضروري، ويُعبّر الحكماء عن هذا بقولهم: <span class="text-amber-400 font-semibold">«الإنسان مدنيٌّ بالطبع»</span> أي لا بد له من الاجتماع الذي هو المدنية في اصطلاحهم، وهو معنى العمران.</p>

<p class="leading-relaxed">وبيان ذلك أن الله سبحانه خلق الإنسان وركّبه على صورة لا يصح حياتها وبقاؤها إلا بالغذاء، وهداه إلى التماسه بفطرته وبما رُكّب فيه من القدرة على تحصيله. إلا أن قدرة الواحد من البشر قاصرة عن تحصيل حاجته من ذلك الغذاء؛ فإن أدنى ما يُفرض منه هو قوت يوم من الحنطة مثلاً، فلا يحصل إلا بعلاج كثير من الطحن والعجن والطبخ، وكل واحد من هذه الأعمال يحتاج إلى مواعين وآلات لا تتم إلا بصنائع متعددة من حدّاد ونجّار وخزّاف<span class="footnote-ref" data-footnote-id="fn-1">[١]</span>.</p>

<div class="my-4 p-4 rounded-xl bg-stone-800/80 border border-stone-700">
  <p class="text-emerald-400 font-quran text-xl text-center leading-loose">
    ﴿ يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا ۚ إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ ﴾
    <span class="ayah-num">١٣</span>
  </p>
  <p class="text-xs text-stone-400 text-center mt-1">[سورة الحجرات: الآية ١٣]</p>
</div>

<div class="poetry-bayt">
  <div class="poetry-shatr">وَما المَرءُ إِلّا بِإِخوانِهِ</div>
  <div class="text-amber-500 font-bold px-2">❖</div>
  <div class="poetry-shatr">كَما يَقبِضُ الكَفَّ بِالمِعصَمِ</div>
</div>

<p class="leading-relaxed">فلما كان الواحد من البشر لا يستقل بتحصيل حاجته من الغذاء، ولا بد له من الاستعانة بأبناء جنسه، صار الاجتماع ضرورياً للنوع الإنساني، وإلا لم يكمل وجودهم وما أراده الله من استعمار العالم بهم واستخلافه إياهم<span class="footnote-ref" data-footnote-id="fn-2">[٢]</span>.</p>
                `,
                footnotes: [
                  {
                    id: 'fn-1',
                    number: 1,
                    content: 'انظر: أرسطو، السياسة، الكتاب الأول، فصل ٢؛ والفارابي في آراء أهل المدينة الفاضلة، ص ٧٧.',
                    author_note: 'حاشية المحقق د. عبد الرحمن الشريف',
                  },
                  {
                    id: 'fn-2',
                    number: 2,
                    content: 'استعمار الأرض: أي عمارتها وبناؤها كما في قوله تعالى: ﴿ هُوَ أَنشَأَكُم مِّنَ الْأَرْضِ وَاسْتَعْمَرَكُمْ فِيهَا ﴾ [هود: ٦١].',
                  },
                ],
              },
              {
                id: 'node-1-1-2',
                entity_id: 'book-1',
                parent_id: 'node-1-1',
                title: 'الفصل الثاني: في فضل العمران البدوي وأنه أصل للحضري',
                slug: 'fasl-2-badia-origin',
                type: 'fasl',
                order: 2,
                content: `
<h3>الفصل الثاني: في فضل العمران البدوي وأنه أصل للحضري</h3>
<p class="leading-relaxed">اعلم أن اختلاف الأجيال في أحوالهم إنما هو باختلاف نِحلتهم من المعاش، فإن اجتماعهم إنما هو للتعاون على تحصيله والابتداء بما هو ضروري منه وبسيط قبل الحاجي والكمالي.</p>
<p class="leading-relaxed">فمنهم من يستفتح المعاش بالزراعة من الحراثة والغرس، ومنهم من ينتحل الحيوان من الغنم والبقر والمعز والنحل والدود، وهؤلاء القائمون على الزراعة والحيوان تدعوهم الضرورة إلى البدو لاتساع الفجاج والمزارع والمراعي.</p>
                `,
                footnotes: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'book-2',
    title: 'رياض الصالحين من كلام سيد المرسلين',
    title_en: 'Riyad as-Salihin',
    slug: 'riyad-as-salihin',
    type: 'book',
    description: 'عمدة كتب الأخلاق والآداب النبوية مصنفة ومبوبة بالأحاديث الصحيحة والحسان.',
    author: mockAuthors[1],
    author_id: 'auth-2',
    category: mockCategories[1],
    category_id: 'cat-2',
    volumes_count: 1,
    pages_count: 480,
    publisher: 'دار المنهاج للنشر والتوزيع',
    publication_year: 2023,
    edition: 'طبعة محققة على ست نسخ خطية',
    status: 'published',
    created_at: '2026-02-10T12:00:00Z',
    updated_at: '2026-08-25T11:20:00Z',
    cover_image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    nodes: [
      {
        id: 'node-2-1',
        entity_id: 'book-2',
        title: 'كتاب الإخلاص وإحضار النية',
        slug: 'kitab-al-ikhlas',
        type: 'volume',
        order: 1,
        content: 'في وجوب إخلاص النية في جميع الأعمال والأقوال الباطنة والظاهرة.',
        children: [
          {
            id: 'node-2-1-1',
            entity_id: 'book-2',
            parent_id: 'node-2-1',
            title: 'باب الإخلاص وإحضار النية في جميع الأعمال',
            slug: 'bab-ikhlas',
            type: 'bab',
            order: 1,
            content: `
<h3>باب الإخلاص وإحضار النية في جميع الأعمال والأقوال والأحوال البارزة والخفية</h3>
<p class="leading-relaxed">قال الله تعالى: <span class="font-quran text-emerald-400">﴿ وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ حُنَفَاءَ وَيُقِيمُوا الصَّلَاةَ وَيُؤْتُوا الزَّكَاةَ ۚ وَذَٰلِكَ دِينُ الْقَيِّمَةِ ﴾</span> [البينة: ٥].</p>

<p class="leading-relaxed font-serif text-lg bg-stone-800/60 p-4 rounded-lg border-r-4 border-amber-500 my-3">
وعن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه قال: سمعت رسول الله ﷺ يقول:
<strong>«إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوْ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ»</strong>.
</p>
<p class="text-xs text-stone-400">رواه إماما المحدثين أبو عبد الله محمد بن إسماعيل بن إبراهيم بن المغيرة بن بردزبة البخاري الجعفي، وأبو الحسين مسلم بن الحجاج بن مسلم القشيري النيسابوري رضي الله عنهما في صحيحيهما اللذين هما أصح الكتب المصنفة.</p>
            `,
          },
        ],
      },
    ],
  },
];

export const mockManuscripts: Manuscript[] = [
  {
    id: 'manu-1',
    title: 'مخطوط الشفا بتعريف حقوق المصطفى',
    title_en: 'Facsimile of Kitab Ash-Shifa',
    slug: 'ash-shifa-manuscript',
    type: 'manuscript',
    description: 'نسخة خطية نادرة كُتبت بخط مغربي أندلسي فاخر مع تشجيرات ذهبية بالمداد المغربي الأصيل.',
    author: mockAuthors[2],
    author_id: 'auth-3',
    category: mockCategories[2],
    category_id: 'cat-3',
    library: 'المكتبة الوطنية بالرباط - المغرب',
    shelf_mark: 'مخطوط رقم ٥٢١٤ / ق',
    script_type: 'خط مغربي مبسوط بالمداد الملون والذهب',
    scribal_date: 'سنة ٧١٢ هـ (القرن الرابع عشر الميلادي)',
    pages_count: 14,
    status: 'published',
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-08-29T16:00:00Z',
    cover_image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
    pages: [
      {
        id: 'page-1',
        manuscript_id: 'manu-1',
        folio_number: 1,
        side: 'a',
        code: '1a',
        image_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop&q=90',
        thumbnail_url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&auto=format&fit=crop&q=75',
        transcription: 'بسم الله الرحمن الرحيم صلى الله على سيدنا محمد وآله وسلم تسليما. الحمد لله المتفرد باسمه الأسمى المختص بالملك الأعز الأحمى، الذي لا يدرك في علاه كنه صفاته ولا يبلغ كنه ذاته.',
        notes: 'طرة الورقة الأولى مزخرفة بإطار ذهبي مذهب مائل للزرقة، وعليها قيد تملك لأبي الحسن علي بن يوسف المريني.',
      },
      {
        id: 'page-2',
        manuscript_id: 'manu-1',
        folio_number: 1,
        side: 'b',
        code: '1b',
        image_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1200&auto=format&fit=crop&q=90',
        thumbnail_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=200&auto=format&fit=crop&q=75',
        transcription: 'أما بعد وفقنا الله وإياك لمرضاته وأسعدنا وإياك بالتقرب منه والتزلف إلى ساحة قدسه، فإنك سألتني أكرمك الله أن أجمع لك جوامع مما يجب لنبينا صلى الله عليه وسلم من التعظيم والإجلال.',
        notes: 'السطر الخامس به تصحيح في الحاشية اليمنى بقلم الناسخ نفسه وعلامة صح (صحّ).',
      },
      {
        id: 'page-3',
        manuscript_id: 'manu-1',
        folio_number: 2,
        side: 'a',
        code: '2a',
        image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1200&auto=format&fit=crop&q=90',
        thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=75',
        transcription: 'القسم الأول: في تعظيم العلي الأعلى لقدر النبي المصطفى قولا وفعلا. الباب الأول: في ثناء الله تعالى عليه وإظهار عظيم قدره لديه.',
        notes: 'عنوان الباب مكتوب بماء الذهب وبالخط الكوفي المورق الأندلسي.',
      },
      {
        id: 'page-4',
        manuscript_id: 'manu-1',
        folio_number: 2,
        side: 'b',
        code: '2b',
        image_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&auto=format&fit=crop&q=90',
        thumbnail_url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=200&auto=format&fit=crop&q=75',
        transcription: 'فصل في قسمه تعالى بحياته وتصديقه في رسالته ومقامه. قال الله تعالى في محكم التنزيل: ﴿ لَعَمْرُكَ إِنَّهُمْ لَفِي سَكْرَتِهِمْ يَعْمَهُونَ ﴾ أجمع أهل التفسير أنه لم يقسم بحياة أحد غير نبينا.',
        notes: 'تعليق في الحاشية السفلية ينقل قول ابن عباس رضي الله عنهما في تفسير الآية.',
      },
    ],
  },
];

export const mockAudios: AudioItem[] = [
  {
    id: 'audio-1',
    title: 'شرح معلقة امرئ القيس - المجلس الأول',
    title_en: 'Commentary on Muallaqah of Imru al-Qays - Session 1',
    slug: 'audio-imru-al-qays-1',
    type: 'audio',
    description: 'تسجيل صوتي عالي النقاء لتحليل أبيات معلقة امرئ القيس وبلاغتها وإعراب شواهدها الشعرية.',
    author: mockAuthors[3],
    author_id: 'auth-4',
    category: mockCategories[4],
    category_id: 'cat-5',
    file_url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg', // Sample test audio stream
    duration: 360,
    reciter_or_speaker: 'أ.د. عبد الله البشري',
    bitrate: '320 kbps',
    album_name: 'سلسلة دراسات ديوان العرب',
    status: 'published',
    created_at: '2026-04-10T14:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
    cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    segments: [
      {
        id: 'seg-1',
        media_id: 'audio-1',
        title: 'المقدمة والافتتاحية',
        slug: 'intro',
        type: 'track',
        start_time: 0,
        end_time: 45,
        order: 1,
        transcription: 'الحمد لله والصلاة والسلام على رسول الله، نبدأ بعون الله تعالى مدارسة المعلقة الأولى لأمير شعراء الجاهلية امرئ القيس الكندي.',
        notes: 'المقدمة التعريفية بسيرة الشاعر وبيئته في كندة ونجد.',
      },
      {
        id: 'seg-2',
        media_id: 'audio-1',
        title: 'الوقوف على الأطلال (قفا نبك)',
        slug: 'qifa-nabki',
        type: 'segment',
        start_time: 45,
        end_time: 180,
        order: 2,
        transcription: 'قِفا نَبكِ مِن ذِكرى حَبيبٍ وَمَنزِلِ ... بِسِقطِ اللِوى بَينَ الدَخولِ فَحَومَلِ. شرح سقط اللوى ومواضع الدخول وحومل وفنون الاستيقاف.',
        notes: 'البحر: الطويل (فعولن مفاعيلن فعولن مفاعلن).',
      },
      {
        id: 'seg-3',
        media_id: 'audio-1',
        title: 'وصف الليل البهيم وفرسه',
        slug: 'night-and-horse',
        type: 'segment',
        start_time: 180,
        end_time: 360,
        order: 3,
        transcription: 'وَلَيلٍ كَمَوجِ البَحرِ أَرخى سُدولَهُ ... عَلَيَّ بِأَنواعِ الهُمومِ لِيَبتَلي. تفصيل في استعارات الليل وأوصاف الفرس مكر مفر مقبل مدبر معا.',
        notes: 'شواهد بلاغية على التشبيه المركب والاستعارة المكنية.',
      },
    ],
  },
];

export const mockVideos: VideoItem[] = [
  {
    id: 'video-1',
    title: 'رحلة في صناعة المخطوط العربي والترميم الرقمي',
    title_en: 'The Craft of Arabic Manuscripts & Digital Restoration',
    slug: 'arabic-manuscripts-craft',
    type: 'video',
    description: 'فيلم وثائقي يستعرض تاريخ صناعة الورق والكاغد والأحبار التراثية وطرق المعالجة الطيفية للمخطوطات التالفة.',
    category: mockCategories[2],
    category_id: 'cat-3',
    file_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration: 600,
    speaker_or_director: 'مركز التوثيق والتراث الرقمي',
    resolution: '4K Ultra HD',
    series_name: 'كنوز التراث المكتوب',
    episode_number: 1,
    status: 'published',
    created_at: '2026-05-12T11:00:00Z',
    updated_at: '2026-08-25T15:00:00Z',
    cover_image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&auto=format&fit=crop&q=80',
    segments: [
      {
        id: 'scene-1',
        media_id: 'video-1',
        title: 'المشهد الأول: أسرار الكاغد وصناعة الورق',
        slug: 'scene-1-paper',
        type: 'scene',
        start_time: 0,
        end_time: 180,
        order: 1,
        transcription: 'كيف انتقلت صناعة الورق من سمرقند وبغداد إلى دمشق وفاس وقرطبة، والمواد الخام المستعملة كالقنب والكتان.',
      },
      {
        id: 'scene-2',
        media_id: 'video-1',
        title: 'المشهد الثاني: تركيب الأحبار الزاجية والكربونية',
        slug: 'scene-2-ink',
        type: 'scene',
        start_time: 180,
        end_time: 390,
        order: 2,
        transcription: 'معادلات استخراج العفص وقشور الرمان والصمغ العربي وثبات السواد عبر القرون.',
      },
      {
        id: 'scene-3',
        media_id: 'video-1',
        title: 'المشهد الثالث: التصوير الطيفي والرقمنة الفائقة',
        slug: 'scene-3-multispectral',
        type: 'scene',
        start_time: 390,
        end_time: 600,
        order: 3,
        transcription: 'استخدام الأشعة تحت الحمراء وفوق البنفسجية لقراءة النصوص الممحوة (البالمبسست) وترميمها رقمياً.',
      },
    ],
  },
];

export const mockActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    user_name: 'زيد السعيد',
    action: 'update',
    entity_type: 'manuscript',
    entity_title: 'مخطوط الشفا بتعريف حقوق المصطفى',
    timestamp: 'منذ ١٥ دقيقة',
    details: 'تم تحديث التفريغ النصي للورقة ٢أ وضبط علامات الترقيم',
  },
  {
    id: 'act-2',
    user_name: 'د. فاطمة الزهراء',
    action: 'ingest',
    entity_type: 'book',
    entity_title: 'مقدمة ابن خلدون',
    timestamp: 'منذ ساعتين',
    details: 'تمت مزامنة فصول المجلد الأول آلياً وتوليد الشجرة الهرمية',
  },
  {
    id: 'act-3',
    user_name: 'م. أحمد خالد',
    action: 'create',
    entity_type: 'audio',
    entity_title: 'شرح معلقة امرئ القيس - المجلس الأول',
    timestamp: 'منذ ٥ ساعات',
    details: 'تم تقسيم المسار الصوتي إلى ٣ مقاطع متزامنة نصياً',
  },
  {
    id: 'act-4',
    user_name: 'النظام الآلي',
    action: 'export',
    entity_type: 'book',
    entity_title: 'رياض الصالحين من كلام سيد المرسلين',
    timestamp: 'يوم أمس',
    details: 'تم تصدير نسخة PDF محققة مع الفهارس وهوامش الأحاديث',
  },
];
