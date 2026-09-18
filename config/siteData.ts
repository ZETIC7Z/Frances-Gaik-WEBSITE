/**
 * VERIFIED SOURCE CONTENT — Dr. Fran Gaik (author & book biography site)
 * ---------------------------------------------------------------------------
 * Ingested from lifecoachdoc.net and verified retailer listings.
 * Last reviewed: 2026-09-12. Refresh with `npm run sync:content`.
 */

export const site = {
  name: 'Dr. Frances Gaik',
  fullName: 'Dr. Frances Gaik, PsyD, LCPC',
  role: 'Author • Researcher • Qigong Practitioner',
  location: 'Florida, USA',
  phone: '(630) 240-7511',
  phoneHref: 'tel:+16302407511',
  email: 'Ibitmog1@aol.com',
  emailAlt: 'Ibitmog1@aol.com',
  sourceSite: 'https://www.lifecoachdoc.net',
  syncedAt: '2026-09-12',
  bookCount: 2,
} as const;

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'Books', href: '/books' },
  { label: 'About', href: '/about' },
  { label: 'Reviews', href: '/reviews' },
  { label: 'Contact', href: '/contact' },
] as const;

export const practiceNav = [
  { label: 'Services', href: '/services' },
  { label: 'Depression & Qigong Treatment', href: '/depression-and-qigong-treatment' },
  { label: 'Hypnosis', href: '/hypnosis' },
  { label: 'Consent / Privacy', href: '/privacy' },
] as const;

export const hero = {
  eyebrow: 'Author • Researcher • Qigong Practitioner',
  titlePlainTop: 'Managing depression',
  titleGradient: 'with mind, body',
  titlePlainBottom: '& movement.',
  intro:
    'Dr. Frances Gaik writes at the intersection of clinical psychology, coaching, and Eastern mind–body practices. Her work brings research, reflection, and practical tools to readers exploring steadier ways forward.',
  primaryCta: { label: 'Get the Book', href: '/books' },
  secondaryCta: { label: 'About the Author', href: '/about' },
  chips: ['PsyD Clinical Psychology', '25+ Years Experience', 'Singing Dragon Author', 'Qigong Researcher'],
} as const;

export const stats = [
  { value: 25, suffix: '+', label: 'Years of clinical practice & research' },
  { value: 2, suffix: '', label: 'Published works' },
  { value: 5, suffix: '★', label: 'Source-listed reader rating' },
  { value: 12, suffix: '+', label: 'Retailers carrying the books worldwide' },
] as const;

/** Full biography text copied from the author's own site (welcome.html). */
export const about = {
  intro:
    'I am a Licensed Clinical Professional Counselor (LCPC) and hold degrees in Philosophy, Clinical Psychology and Paralegal Studies. I am also a Board Certified Professional Counselor, a Certified Personal Coach, and a Fellow in the Collaborative Law Institute of Illinois. I have also worked as an executive in the insurance industry for many years, as well as the legal system, focusing in family law.',
  credentials: [
    'Licensed Clinical Professional Counselor (LCPC)',
    'Degrees in Philosophy, Clinical Psychology and Paralegal Studies',
    'Board Certified Professional Counselor',
    'Certified Personal Coach',
    'Fellow in the Collaborative Law Institute of Illinois',
  ],
  experience: [
    'I have owned my own business, working in the insurance industry for over 25 years in the area of health administration, including marketing, underwriting and claims adjudication. I possess extensive experience in coaching, selection, training and management team development. I have also worked in the Cook County Family Court system. I am familiar with the pain of family disruption. I have been involved in major litigation and successfully accomplished what I set out to do. I am an effective Change Agent in both the restructure of corporate and personal dynamics and my experience in these areas has been critical in helping others to move beyond chaos and obstacles, avoid pitfalls and to achieve goals. I have worked successfully with both men and women on an individual basis as well as with relationship.',
    'I have done both professional and sport coaching, by managing objectives within an action plan and specific use of visualization. I am especially interested in Eastern techniques of meditation, qigong and Alternative and Complementary Energy Psychology. I have been trained in Holographic Memory Resolution and Reiki healing. I have also worked extensively with Dialectical Behavioral Therapy (DBT), Client-Centered, Interpersonal, and Rational Emotive Therapy, as well as the Gottman Marital Techniques and Strategies.',
    'I have worked in the hospital and community health setting as well as private practice.',
  ],
  philosophy:
    'My background is in the psychoanalytic and cognitive behavioral therapeutic (CBT) approaches and I practice with an existential focus – in the here and now. My strategy is to provide understanding of how the problem came to be, and focus on movement forward. It may be important to understand how and why you get stuck and get into patterns which work against you. Often, the insight alone is enough to break free of the cycle, but with coaching and guidance, it is more likely that you can use your strengths to meet a challenge and not repeat negative patterns. I do not believe in long-term therapy, and it is my goal to provide life skills and coping mechanisms for resolving difficulties on your own.',
  qigong:
    'My doctoral dissertation was written after my clinical research study applied the ancient practice of qigong with a group of severely depressed subjects. The research project was most successful and the subjects showed significant improvement after only a two-month period of daily qigong practice of 40 minutes. This study is now the subject of an exciting new book, “Managing Depression with Qigong.”',
} as const;

export type Review = {
  /**
   * Who is speaking. Only ever a name the cited source itself prints — where a
   * source publishes anonymously this is the descriptive label it uses
   * ("Amazon.com reader", "Kirkus Reviews"). No reviewer is invented.
   */
  reviewer: string;
  /** Role / standing as reported by the source. */
  reviewerRole?: string;
  source: string;
  platform: string;
  quote: string;
  rating?: string;
  ratingStars?: number;
  sourceUrl?: string;
  /** Which published work the review is about. */
  bookId: string;
};

export type Book = {
  id: string;
  title: string;
  subtitle?: string;
  cover: string;
  format: string;
  pages: string;
  isbn?: string;
  price: string;
  publisher: string;
  year?: string;
  rating?: string;
  ratingStars?: number;
  blurb: string;
  sample: string[];
  stores: { label: string; href: string; note?: string }[];
  reviews: Review[];
};

export const books: Book[] = [
  {
    id: 'managing-depression-with-qigong',
    title: 'Managing Depression with Qigong',
    subtitle: 'Rise from the darkness of depression and regain strength and motivation in life.',
    cover: '/images/book-mdwq.jpg',
    format: 'Paperback & Kindle',
    pages: '192 pp paperback',
    isbn: '978-1-84819-018-4',
    price: '$21.95 publisher list price',
    publisher: 'Singing Dragon',
    year: '2009',
    rating: '5 stars',
    ratingStars: 5,
    blurb:
      'Many people will suffer from depression at some time in their lives. New research shows that Qigong, a traditional Chinese practice, can be an effective treatment for depression and can provide a good alternative or supplement to medication in some cases. Frances Gaik explains the basics of what Qigong is and why it is effective for depression, and shows the reader how to make use of Qigong to rise from the darkness of depression and regain strength and motivation in life. Based on the same principles as Traditional Chinese Medicine, Qigong works by promoting the movement of health-giving energy along the meridians of the body. The author shows how the practical application of Qigong can radically improve health and wellbeing, and provides a treatment plan, including Qigong exercises.',
    sample: [
      'A complete treatment plan, including Qigong exercises and two sitting meditations.',
      'The story of the author’s clinical research study — significant improvement after a two-month period of daily practice.',
      'A full bibliography summarizing East-West research, written in simple layman’s terms.',
    ],
    // One Amazon listing per book — the print edition readers actually land on
    // at amazon.com — rather than a Kindle, .ca and marketplace entry for the
    // same title, which only made the list longer to read.
    stores: [
      { label: 'Amazon.com', href: 'https://www.amazon.com/Managing-Depression-Qigong-Fran-Gaik/dp/1848190182', note: 'Paperback' },
      { label: 'Singing Dragon', href: 'https://us.singingdragon.com/products/managing-depression-with-qigong', note: 'Publisher' },
      { label: 'Hachette UK', href: 'https://www.hachette.co.uk/titles/fran-gaik/managing-depression-with-qigong/9781848190184/', note: 'UK' },
      { label: 'Bookshop.org UK', href: 'https://uk.bookshop.org/p/books/managing-depression-with-qigong-fran-gaik/71912c22151cd04a', note: 'Indie stores' },
      { label: 'Walmart', href: 'https://www.walmart.com/ip/Managing-Depression-with-Qigong-9781848190184/1893844672', note: 'Marketplace' },
      { label: 'AbeBooks', href: 'https://www.abebooks.com/Managing-Depression-Qigong-Fran-Gaik-Jessica/31092988519/bd', note: 'New & used' },
      { label: 'eBay', href: 'https://www.ebay.com/itm/317846943731', note: 'New & used' },
      { label: 'Rakuten Kobo', href: 'https://it.kobo.com/us/es/ebook/managing-depression-with-qigong-1', note: 'eBook' },
      { label: 'Goodreads', href: 'https://www.goodreads.com/en/book/show/6793455-managing-depression-with-qigong', note: 'Rate & review' },
    ],
    // Only reviews that can be checked at their own venue are listed. Four
    // earlier entries were attributed to Amazon, epinions, Barnes & Noble and
    // Biblio readers while their "verify source" link pointed at the author's
    // own legacy books page — a link that verified nothing. They were removed
    // rather than re-labelled, because no venue URL exists for them.
    reviews: [],
  },
  {
    id: 'dialogues-from-beyond',
    title: 'Dialogues from Beyond',
    subtitle: 'A spiritual memoir exploring consciousness, compassion, and the soul’s journey.',
    // Served from this origin. The publisher's CDN copy was hot-linked before,
    // which put a third party between the visitor and the site's own shelf —
    // and took the whole books section down when that CDN refused a request.
    cover: '/images/book-dialogues-from-beyond.jpg',
    format: 'Paperback & Kindle',
    pages: '514 pp paperback',
    isbn: '979-8-89211-284-0',
    price: 'Retailer pricing',
    publisher: 'Dorrance Publishing Company',
    year: '2025',
    rating: '5 stars · 1 customer review',
    ratingStars: 5,
    blurb:
      'Dialogues from Beyond is a perspective on everyday living drawn from recorded deep-trance sessions and framed as conversations with a higher intelligence referred to as “the Source.” The book explores questions about reality, humanity, identity, relationships, reincarnation, illness, free will, compassion, and personal growth. Its extensive table of contents makes it possible to read one subject at a time and return to it as a reference.',
    sample: [
      'Messages recorded during deep-trance sessions across more than forty years.',
      'Topics including reincarnation, illness, suicide, karmic lessons, addiction, war, relationships, and the nature of the soul.',
      'A topic-led structure for reflection and reading in short sections.',
    ],
    stores: [
      { label: 'Amazon.com', href: 'https://www.amazon.com/dp/B0F7C4541V', note: 'Kindle edition' },
      { label: 'Dorrance Bookstore', href: 'https://bookstore.dorrancepublishing.com/products/dialogues-from-beyond', note: 'Paperback' },
      { label: 'Booktopia', href: 'https://www.booktopia.com.au/dialogues-from-beyond-dr-frances-gaik/ebook/9798892117821.html', note: 'eBook' },
    ],
    reviews: [
      {
        reviewer: 'EGS',
        reviewerRole: 'Dorrance Bookstore customer',
        bookId: 'dialogues-from-beyond',
        source: 'EGS — Dorrance Bookstore customer review',
        platform: 'Dorrance Bookstore',
        rating: '5 stars',
        ratingStars: 5,
        sourceUrl: 'https://bookstore.dorrancepublishing.com/products/dialogues-from-beyond',
        quote:
          'Interesting and thought provoking content. I really like the format because you can choose to read about a specific topic and use it like a reference book, reading a subject of interest to you. Easy to pick up and come back to at any time.',
      },
      {
        reviewer: 'Foreword Reviews',
        reviewerRole: 'Clarion review · “pine breaks”',
        bookId: 'dialogues-from-beyond',
        source: 'pine breaks — Foreword Reviews',
        platform: 'Foreword Reviews',
        rating: '2/5 Clarion rating',
        ratingStars: 2,
        sourceUrl: 'https://www.forewordreviews.com/reviews/dialogues-from-beyond/',
        quote:
          'A record of a decades-long spiritual search, Dialogues from Beyond records thoughts from a higher plane on a bevy of topics.',
      },
      {
        reviewer: 'Kirkus Reviews',
        reviewerRole: 'Trade review',
        bookId: 'dialogues-from-beyond',
        source: 'Kirkus Reviews',
        platform: 'Kirkus',
        sourceUrl: 'https://www.kirkusreviews.com/book-reviews/frances-gaik/dialogues-from-beyond/',
        quote: 'A ponderous but frequently perceptive document.',
      },
    ],
  },
];

/** Press & reviewer quotes reproduced from the cited publisher/author sources. */
export const pressReviews: Review[] = [
  {
    reviewer: 'Patrick Killough',
    reviewerRole: 'Counsellor, US Senior Foreign Service (1983–1991)',
    bookId: 'managing-depression-with-qigong',
    source: 'Patrick Killough — Counsellor, US Senior Foreign Service (1983–1991)',
    platform: 'Singing Dragon',
    sourceUrl: 'https://us.singingdragon.com/products/managing-depression-with-qigong',
    quote:
      'In a lucid, dispassionate, folksy way, Dr. Gaik tells an important story. She describes the research efforts both of herself and earlier and contemporary pioneers in America, China and Japan first to rethink Western medicine in Eastern thought forms and then assimilate it. Her aim: to make you and me healthier through an affordable combination of deep breathing, meditation, counselling and moderate exercise, with an exit strategy from a limited time given over to non-addictive therapy… Her book is an easy, informative, delightful read.',
  },
  {
    reviewer: 'Booknews.com',
    reviewerRole: 'Review publication',
    bookId: 'managing-depression-with-qigong',
    source: 'Booknews.com',
    platform: 'Booknews',
    sourceUrl: 'https://us.singingdragon.com/products/managing-depression-with-qigong',
    quote:
      'Gaik ably describes western and Chinese notions of depression and the treatment of stress and includes a chapter summarizing the research project on Qigong’s effects on depression that formed her dissertation. An appendix contains qigong exercises, including two sitting meditations, as well as a full bibliography.',
  },
  {
    reviewer: 'Jed Shlackman',
    reviewerRole: 'Licensed Mental Health Counselor & Certified Hypnotherapist, Miami',
    bookId: 'managing-depression-with-qigong',
    source: 'Jed Shlackman, Licensed Mental Health Counselor & Certified Hypnotherapist, Miami',
    platform: 'Singing Dragon',
    sourceUrl: 'https://us.singingdragon.com/products/managing-depression-with-qigong',
    quote:
      'Relatively short, simple to understand, and practical… This book is quite informative and offers information and guidance about ways of addressing depression that are not often considered in other sources… With growing evidence for benefits of mind-body and energetic therapies in treating psychiatric conditions, it is great to see this information shared in books for the public.',
  },
  {
    reviewer: 'ICNM Journal',
    reviewerRole: 'Journal review',
    bookId: 'managing-depression-with-qigong',
    source: 'ICNM Journal',
    platform: 'ICNM',
    sourceUrl: 'https://us.singingdragon.com/products/managing-depression-with-qigong',
    quote:
      'Many people will suffer from depression at some time in their lives. New research shows that Qigong, a traditional Chinese practice, can be an effective treatment for depression or can supplement or be an alternative to medication in some cases. Author Frances Gaik explains the basics of what Qigong is and why it helps people with depression.',
  },
  {
    reviewer: 'Atkins Diet and Depression',
    reviewerRole: 'Blog review',
    bookId: 'managing-depression-with-qigong',
    source: 'Reviewed on the blog “Atkins Diet and Depression”',
    platform: 'Atkins Diet and Depression',
    sourceUrl: 'https://us.singingdragon.com/products/managing-depression-with-qigong',
    quote:
      'A very well researched book on the “what” and “why” of qigong, rather than on the “how.” Gaik describes what qigong is and offers many studies and examples of why qigong can be used to treat depression successfully… If you want an academic study of why to practice, get this book.',
  },
];

/** Every review with the book it belongs to, newest book first, for the review wall. */
export const allReviews: Review[] = [
  ...books.flatMap((book) => book.reviews),
  ...pressReviews,
];

/** Reviews for one book (its own plus attributed press coverage). */
export function reviewsForBook(bookId: string): Review[] {
  return allReviews.filter((r) => r.bookId === bookId);
}

/** The published work a review belongs to, so cards can show the right cover. */
export function bookForReview(review: Review) {
  return books.find((b) => b.id === review.bookId);
}

export const contact = {
  heading: 'Contact the Author',
  lead: 'To reach Dr. Gaik — for Qigong seminars, book questions, or professional inquiries — you can email to obtain a time to call.',
  note: 'Office located in Florida.',
  phones: [{ label: 'Phone', value: '(630) 240-7511', href: 'tel:+16302407511' }],
  emails: [
    { label: 'Email', value: 'Ibitmog1@aol.com', href: 'mailto:Ibitmog1@aol.com' },
  ],
} as const;

export const privacy = {
  heading: 'Consent Form / Privacy Policy',
  intro:
    'All information that is obtained is completely confidential and is subject to the HIPAA provisions. Under the Health Insurance Portability and Accountability Act of 1996 (HIPAA), your health information is protected and completely confidential. This Act gives you specific rights to understand and control how the information is used.',
  paragraphs: [
    'This Notice of Privacy Practices describes how the information may be used to disclose your protected information for other purposes that are permitted or required by law. It also describes your rights to access and control your protected health information.',
    'Your protected health information may be used and disclosed for the purpose of providing health care services, to pay your bills or to support the operation of the practice, and in accordance with the law. Dates of service and billing through credit card companies are standard practice. Health information may be provided to a referring psychiatrist only if you allow. An appropriate consent form is required.',
    'Protected health information will be used as needed to obtain payment on your behalf for the health services if you are submitting your bills for payment to an insurance company, if you allow.',
    'As Dr. Gaik is a mandated reporter, you need to be aware that your protected health information may be used without your authorization as required by law in the event of abuse or neglect, intent to harm yourself or another.',
    'You have the right to inspect your protected health information. Under Federal law, however, you may not inspect or copy the following records: psychotherapy notes, information compiled in reasonable anticipation of, or use in, a civil, criminal or administrative action or proceeding, and protected health information that is subject to law that prohibits access to protected health information.',
    'You have a right to request a restriction of your protected health information. This means you may ask me not to use or disclose any part of your protected health information for the purposes of treatment, payment or health care operations. You may request that no statements be sent if you desire.',
  ],
  hipaaContact: {
    org: 'The US Department of Health & Human Services, Office of Civil Rights',
    address: '200 Independence Avenue S.W., Washington, D.C. 20201',
    phone: '(202) 619-0257',
    tollFree: '(877) 696-6775',
  },
} as const;

export const practice = {
  services: [
    {
      title: 'Life Coaching',
      body: 'Personal coaching is for someone who may be frustrated with some aspect of life, but not sure how to move through it. This could be related to a career path, personal relationship, litigation, or a health issue. A life coach is like a buoy in a sea of turmoil. Dr. Gaik offers motivation, objective guidance, planning, and accountability so you can work with your strengths and move toward greater balance, enjoyment, and purpose.',
    },
    {
      title: 'Collaborative Divorce Coaching',
      body: 'Collaborative divorce can help couples separate in a more peaceful and cooperative way. A certified collaborative divorce coach establishes a support structure during a painful transition and a period of complex change, while protecting privacy and making room for personal growth.',
    },
    {
      title: 'Business & Performance Coaching',
      body: 'Organizational change, career decisions, competition, and performance pressure can affect both work and personal relationships. Objective coaching, imagery, relaxation, and cognitive-behavioral skills can build confidence, attention, and problem-solving toward a chosen result.',
    },
    {
      title: 'Assessment',
      body: 'A variety of assessment tools can help clarify the problem: career interests and values, depression and anxiety, personality or character traits, conflict patterns, lifestyle, and early recollections that may reveal beliefs affecting the present.',
    },
    {
      title: 'Counseling',
      body: 'For people seeking personal growth or help with persistent struggles, a more intensive approach may include assessment, a treatment plan, and practical strategies for greater ego strength, coping skills, and quality of life. The goal is stewardship, not dependency.',
    },
    {
      title: 'Relationship Counseling & Group Programs',
      body: 'Relationship counseling focuses on taking ownership of personal contributions and building marital strategies that express hope rather than surrender. Group programs provide a safe, facilitated setting for people who share a common goal, from a business team to a support group.',
    },
  ],
  qigong: {
    title: 'Qigong as a Complementary Approach to Depression Care',
    intro: 'Qigong (chee-gong) is a meditative movement practice related to Tai Chi and rooted in Traditional Chinese Medicine. Dr. Gaik’s doctoral dissertation followed a clinical research study exploring daily Qigong practice with people experiencing severe depression.',
    paragraphs: [
      'The study described on the original site reported meaningful improvement after a two-month period of daily practice for approximately 40 minutes. Managing Depression with Qigong translates that work into accessible language and a practical treatment plan.',
      'Qigong may support a broader care plan by combining gentle movement, breath, attention, and meditation. It is presented here as a complementary option and is not intended to replace prescribed medication, psychotherapy, or an evaluation by a qualified health professional.',
      'If depression includes thoughts of self-harm or an immediate safety concern, contact emergency services or a crisis resource now. A book or movement practice is not a substitute for urgent care.',
    ],
    points: [
      'Gentle movement, breathing, and focused attention',
      'A structured daily practice that can support consistency',
      'Two sitting meditations and exercises described in the book',
      'An East–West research perspective written for general readers',
    ],
  },
  hypnosis: {
    title: 'Hypnosis',
    intro: 'Hypnosis is a temporary state of focused attention in which relaxation and imagery can help the mind become quieter and more receptive to a chosen goal. It is a well-researched intervention that may be useful in some areas of physical and emotional distress.',
    paragraphs: [
      'You cannot be made to do anything you do not want to do with hypnosis. You are not asleep or unconscious; you remain aware and in control with the help of a trained facilitator. Stage and television portrayals are not a reliable picture of therapeutic hypnosis.',
      'As a member of the American Society of Clinical Hypnosis and a Doctor of Psychology, Dr. Gaik has used the technique with individuals as one tool within a wider plan of care.',
    ],
    uses: [
      'Smoking cessation',
      'Performance enhancement',
      'Weight management',
      'Stress reduction and ego strengthening',
      'Pain control and childbirth preparation',
      'Phobias, anxiety, panic attacks, and agoraphobia',
      'Surgery preparation and healing support',
      'Irritable bowel syndrome and other mind–body concerns',
    ],
  },
} as const;

/**
 * Where the copy on this site came from. The author's own legacy pages are the
 * origin of the biography and practice text; every review, by contrast, links to
 * the page it was published on, so no review points back here.
 */
export const sources = [
  { label: 'Welcome', url: 'https://www.lifecoachdoc.net/welcome.html' },
  { label: 'Singing Dragon — Managing Depression with Qigong', url: 'https://us.singingdragon.com/products/managing-depression-with-qigong' },
  { label: 'Amazon — Dialogues from Beyond', url: 'https://www.amazon.com/dp/B0F7C4541V' },
  { label: 'Dorrance — Dialogues from Beyond', url: 'https://bookstore.dorrancepublishing.com/products/dialogues-from-beyond' },
  { label: 'Foreword Reviews — Dialogues from Beyond', url: 'https://www.forewordreviews.com/reviews/dialogues-from-beyond/' },
  { label: 'Kirkus Reviews — Dialogues from Beyond', url: 'https://www.kirkusreviews.com/book-reviews/frances-gaik/dialogues-from-beyond/' },
] as const;
