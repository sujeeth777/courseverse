/* ============================================================
   COURSEVERSE — Core Data
   Backbone follows UNESCO ISCED 2011 (education levels) and
   ISCED-F 2013 (11 broad fields of education).
   ============================================================ */

window.CV = window.CV || {};

/* ---------- ISCED 2011 education levels ---------- */
CV.levels = [
  { code: "0", name: "Early childhood education", desc: "Initial structured learning before primary school — kindergarten, nursery and pre-primary programmes." },
  { code: "1", name: "Primary education", desc: "The foundation stage of formal education, typically ages 5–12, building basic literacy, numeracy and learning skills." },
  { code: "2", name: "Lower secondary education", desc: "The first stage of secondary education — typically middle school — completing basic general or vocational foundations." },
  { code: "3", name: "Upper secondary education", desc: "High school / higher secondary — general, vocational or technical programmes preparing for tertiary study or work." },
  { code: "4", name: "Post-secondary non-tertiary", desc: "Programmes beyond secondary level but not yet tertiary — vocational certificates, preparatory and trade qualifications." },
  { code: "5", name: "Short-cycle tertiary", desc: "Diplomas, associate degrees and advanced vocational programmes usually delivered by colleges and polytechnics." },
  { code: "6", name: "Bachelor's or equivalent", desc: "First-degree university education — BSc, BA, BTech, BEng, LLB, MBBS and their international equivalents." },
  { code: "7", name: "Master's or equivalent", desc: "Second-cycle degrees — MSc, MA, MTech, MEng, MBA, LLM and postgraduate diplomas at an equivalent level." },
  { code: "8", name: "Doctoral or equivalent", desc: "Advanced research qualifications — PhD, DPhil, DSc, doctorates and equivalent research awards." },
];

/* ---------- Qualification ladder ---------- */
CV.qualTypes = [
  { slug: "certificate", name: "Certificate", isced: "ISCED 2–4", duration: "3 months – 1 year", what: "A short award proving completion of a focused set of skills or knowledge, common in vocational, technical and professional training." },
  { slug: "diploma", name: "Diploma", isced: "ISCED 4–5", duration: "1–3 years", what: "A substantial vocational or technical award below degree level, delivered by polytechnics, colleges and institutes." },
  { slug: "advanced-diploma", name: "Advanced Diploma", isced: "ISCED 5", duration: "1–2 years", what: "A higher diploma that goes beyond a base diploma, often with specialisation or management content." },
  { slug: "associate-degree", name: "Associate Degree", isced: "ISCED 5", duration: "2 years", what: "A short-cycle tertiary degree — the classic US community-college award (AA/AS), also found as foundation degrees in other systems." },
  { slug: "bachelors", name: "Bachelor's Degree", isced: "ISCED 6", duration: "3–4 years (5–6 for some professional degrees)", what: "The first full university degree: BSc, BA, BCom, BTech, BEng, LLB, MBBS and equivalents. Structure and length vary by country." },
  { slug: "graduate-diploma", name: "Graduate Certificate / Diploma", isced: "ISCED 6–7", duration: "6 months – 2 years", what: "Post-bachelor awards shorter than a full master's — used for specialisation, conversion and professional updating." },
  { slug: "masters", name: "Master's Degree", isced: "ISCED 7", duration: "1–2 years", what: "Second-cycle degrees — MSc, MA, MBA, MEng, MTech, LLM — academic, professional or research oriented." },
  { slug: "professional", name: "Professional Degree", isced: "ISCED 6–7", duration: "4–6 years", what: "Qualifying degrees for regulated professions — medicine (MBBS/MD), law (LLB/JD), architecture, dentistry and veterinary medicine." },
  { slug: "doctorate", name: "Doctorate", isced: "ISCED 8", duration: "3–6 years", what: "The highest academic award — PhD, DPhil, DSc, DEng — granted for original research or advanced professional practice." },
];

/* ---------- The 11 broad fields (ISCED-F 2013) ---------- */
CV.fields = [
  {
    code: "00", slug: "generic", name: "Generic Programmes",
    official: "Generic Programmes and Qualifications",
    hue: "#94a3b8", icon: "compass",
    tagline: "General, literacy, numeracy and personal development programmes",
    blurb: "Programmes that develop broad skills rather than a specific field — literacy, numeracy, personal development and general studies.",
    long: "Generic programmes cover education whose content is not easily classified under a single field: basic literacy and numeracy programmes, personal development, general studies and broad foundation qualifications that prepare learners for later specialisation.",
    groups: [
      { name: "General & Foundation", courses: ["general-studies", "liberal-arts", "foundation-year"] },
    ],
  },
  {
    code: "01", slug: "education", name: "Education",
    official: "Education",
    hue: "#fbbf24", icon: "book",
    tagline: "The science and practice of teaching and learning",
    blurb: "How people learn, how teaching works, and how education systems are built — from early childhood to university.",
    long: "Education as a field studies teaching, learning and the systems that support them. It spans the science of how people learn (educational psychology), the craft of teaching (pedagogy), the design of curricula, assessment, education policy and leadership — at every level from early childhood to higher education.",
    groups: [
      { name: "Foundations of Education", courses: ["education", "education-science"] },
      { name: "Teaching & Pedagogy", courses: ["early-childhood-education", "primary-education", "secondary-education", "special-education", "teacher-training"] },
      { name: "Specialist Branches", courses: ["educational-psychology", "educational-technology", "educational-leadership", "curriculum-studies", "educational-assessment", "physical-education", "adult-education"] },
      { name: "Subject Teacher Programmes", courses: ["mathematics-education", "science-education", "english-education", "history-education", "music-education", "art-education", "computer-science-education"] },
    ],
  },
  {
    code: "02", slug: "arts-humanities", name: "Arts & Humanities",
    official: "Arts and Humanities",
    hue: "#f472b6", icon: "palette",
    tagline: "Art, design, music, performance, language, history and thought",
    blurb: "Everything humans create and contemplate — visual arts, design, music, theatre, languages, literature, history and philosophy.",
    long: "The arts and humanities study human expression, culture, language and thought. On the arts side: fine arts, design, music and the performing arts. On the humanities side: philosophy, history, languages, linguistics, literature, archaeology and religious studies. Together they form one of the broadest fields in global education.",
    groups: [
      { name: "Arts", courses: ["fine-arts", "visual-arts", "painting", "sculpture", "photography", "illustration", "animation"] },
      { name: "Design", courses: ["graphic-design", "ux-design", "industrial-design", "fashion-design", "interior-design"] },
      { name: "Music & Performance", courses: ["music", "music-production", "theatre", "dance", "film-studies"] },
      { name: "Humanities", courses: ["philosophy", "history", "archaeology", "religious-studies", "classics"] },
      { name: "Languages & Literature", courses: ["linguistics", "english-literature", "translation-studies", "modern-languages"] },
    ],
  },
  {
    code: "03", slug: "social-sciences", name: "Social Sciences",
    official: "Social Sciences, Journalism and Information",
    hue: "#a78bfa", icon: "people",
    tagline: "Human behaviour, society, media and information",
    blurb: "The systematic study of people and society — psychology, sociology, economics, politics, media and information.",
    long: "The social sciences study human behaviour, societies and the flow of information. The field includes psychology, sociology, anthropology, economics, political science and international relations, geography and demography — together with journalism, media, communication and the information sciences (library and information science).",
    groups: [
      { name: "Core Social Sciences", courses: ["psychology", "sociology", "anthropology", "economics", "political-science", "international-relations", "geography-human", "criminology", "gender-studies"] },
      { name: "Media & Information", courses: ["journalism", "media-studies", "communication-studies", "public-relations", "library-information-science"] },
      { name: "Welfare & Applied", courses: ["social-work", "development-studies", "demography"] },
    ],
  },
  {
    code: "04", slug: "business-law", name: "Business & Law",
    official: "Business, Administration and Law",
    hue: "#34d399", icon: "briefcase",
    tagline: "Commerce, management, finance and legal systems",
    blurb: "How organisations run and societies govern — business, finance, marketing, management, public administration and law.",
    long: "Business, administration and law covers the world of organisations and rules: accounting, finance, banking, management, marketing, entrepreneurship, human resources, logistics and supply chains, public administration and taxation — plus the full span of legal education from LLB and JD to LLM and doctoral research.",
    groups: [
      { name: "Business & Management", courses: ["business-administration", "management", "international-business", "entrepreneurship", "project-management", "family-business"] },
      { name: "Finance & Accounting", courses: ["accounting", "finance", "banking", "investment-management", "actuarial-science", "risk-management", "financial-technology"] },
      { name: "Commerce Functions", courses: ["marketing", "human-resources", "operations-management", "supply-chain-management", "business-analytics"] },
      { name: "Public Administration", courses: ["public-administration", "taxation"] },
      { name: "Law", courses: ["law", "corporate-law", "criminal-law", "international-law", "constitutional-law"] },
    ],
  },
  {
    code: "05", slug: "natural-sciences", name: "Natural Sciences",
    official: "Natural Sciences, Mathematics and Statistics",
    hue: "#38bdf8", icon: "atom",
    tagline: "Mathematics, physics, chemistry, life and earth sciences",
    blurb: "The sciences that explain the natural universe — from quarks and cells to oceans, ecosystems and the cosmos.",
    long: "The natural sciences seek to explain the physical and living world. Mathematics and statistics provide the language; physics, chemistry and biology the core sciences; earth sciences, astronomy and environmental science extend the picture from the planet's core to the edge of the universe.",
    groups: [
      { name: "Mathematics & Statistics", courses: ["mathematics", "pure-mathematics", "applied-mathematics", "statistics", "operations-research"] },
      { name: "Physical Sciences", courses: ["physics", "chemistry", "astrophysics"] },
      { name: "Life Sciences", courses: ["biology", "biochemistry", "genetics", "microbiology", "neuroscience", "marine-biology", "biotechnology"] },
      { name: "Earth & Environmental Sciences", courses: ["environmental-science", "geology", "oceanography", "meteorology"] },
    ],
  },
  {
    code: "06", slug: "ict", name: "Computing & ICT",
    official: "Information and Communication Technologies",
    hue: "#22d3ee", icon: "code",
    tagline: "Computers, software, data, AI, security and networks",
    blurb: "The science of computation — software, data, artificial intelligence, cybersecurity, networks and every system built on them.",
    long: "Information and communication technologies study how information is computed, stored, secured, transmitted and used. At its core sit computer science and software engineering; around them orbit artificial intelligence, data science, cybersecurity, networking, cloud computing and dozens of modern specialisations.",
    groups: [
      { name: "Computing Foundations", courses: ["computer-science", "software-engineering", "information-technology", "information-systems", "computer-engineering"] },
      { name: "Artificial Intelligence", courses: ["artificial-intelligence", "machine-learning", "nlp", "computer-vision"] },
      { name: "Data", courses: ["data-science", "data-analytics", "data-engineering", "business-intelligence"] },
      { name: "Security", courses: ["cybersecurity", "digital-forensics", "ethical-hacking"] },
      { name: "Networks & Infrastructure", courses: ["computer-networking", "cloud-computing", "devops"] },
      { name: "Interactive & Applied Computing", courses: ["game-development", "web-development", "human-computer-interaction", "blockchain", "quantum-computing", "iot"] },
    ],
  },
  {
    code: "07", slug: "engineering", name: "Engineering",
    official: "Engineering, Manufacturing and Construction",
    hue: "#fb923c", icon: "gear",
    tagline: "Designing and building the physical and industrial world",
    blurb: "From machines and microchips to bridges and power grids — the disciplines that turn science into technology.",
    long: "Engineering applies mathematics and science to design, build and maintain systems — mechanical, electrical, civil, chemical and beyond. The field also covers manufacturing, materials, construction and architecture, plus specialised branches from aerospace and biomedical to nuclear and ocean engineering.",
    groups: [
      { name: "Core Engineering", courses: ["mechanical-engineering", "electrical-engineering", "civil-engineering", "chemical-engineering"] },
      { name: "Advanced & Specialised", courses: ["aerospace-engineering", "biomedical-engineering", "mechatronics", "robotics-engineering", "materials-engineering", "industrial-engineering"] },
      { name: "Energy & Environment", courses: ["environmental-engineering", "energy-engineering", "nuclear-engineering", "petroleum-engineering"] },
      { name: "Earth & Industry", courses: ["mining-engineering", "marine-engineering", "automotive-engineering", "manufacturing-engineering"] },
      { name: "Built Environment", courses: ["architecture", "urban-planning", "construction-management", "interior-architecture"] },
    ],
  },
  {
    code: "08", slug: "agriculture", name: "Agriculture & Veterinary",
    official: "Agriculture, Forestry, Fisheries and Veterinary",
    hue: "#a3e635", icon: "leaf",
    tagline: "Farming, food, animals, forests and fisheries",
    blurb: "The sciences that feed and clothe the world — crops, soils, animals, forests, fisheries and veterinary medicine.",
    long: "Agriculture, forestry, fisheries and veterinary studies the production of food, fibre and fuel, and the care of animals. It spans crop and soil science, horticulture, animal and dairy science, forestry and wildlife, fisheries and aquaculture, food science and technology, and veterinary medicine.",
    groups: [
      { name: "Agriculture & Crops", courses: ["agriculture", "agronomy", "horticulture", "plant-science", "soil-science", "crop-science"] },
      { name: "Animals & Veterinary", courses: ["veterinary-medicine", "animal-science", "dairy-science", "poultry-science", "animal-nutrition"] },
      { name: "Forestry, Fisheries & Wildlife", courses: ["forestry", "wildlife-science", "fisheries", "aquaculture"] },
      { name: "Food", courses: ["food-science", "food-technology"] },
    ],
  },
  {
    code: "09", slug: "health", name: "Health & Welfare",
    official: "Health and Welfare",
    hue: "#f87171", icon: "heart",
    tagline: "Medicine, nursing, pharmacy, allied health and welfare",
    blurb: "The caring professions — medicine, dentistry, nursing, pharmacy, therapy, public health and social welfare.",
    long: "Health and welfare is one of the largest fields in world education. It covers medicine and its specialities, dentistry, nursing and midwifery, pharmacy, the allied health professions (physiotherapy, occupational therapy, radiography, speech and hearing sciences, optometry), public health, nutrition and social welfare.",
    groups: [
      { name: "Medicine", courses: ["medicine", "surgery", "internal-medicine", "pediatrics", "psychiatry", "cardiology", "neurology-clinical", "radiology", "emergency-medicine"] },
      { name: "Dentistry", courses: ["dentistry", "orthodontics", "oral-surgery"] },
      { name: "Nursing & Midwifery", courses: ["nursing", "midwifery"] },
      { name: "Pharmacy", courses: ["pharmacy", "pharmacology", "pharmaceutical-sciences"] },
      { name: "Allied Health", courses: ["physiotherapy", "occupational-therapy", "medical-laboratory-science", "medical-imaging", "optometry", "speech-therapy", "audiology", "nutrition-dietetics"] },
      { name: "Public Health & Biomedicine", courses: ["public-health", "biomedical-science", "clinical-research", "genomics"] },
    ],
  },
  {
    code: "10", slug: "services", name: "Services",
    official: "Services",
    hue: "#e879f9", icon: "bell",
    tagline: "Hospitality, tourism, transport, sports and safety",
    blurb: "The huge service economy — hospitality, tourism, food, aviation, sport, beauty, security and public safety.",
    long: "Services is far larger than most people realise. It spans hospitality and hotel management, tourism and travel, culinary arts and food service, sports, fitness and recreation, personal services such as beauty and hairdressing, transport — aviation, maritime and logistics — plus security services, fire protection, occupational safety and military and police studies.",
    groups: [
      { name: "Hospitality, Tourism & Food", courses: ["hospitality-management", "tourism", "culinary-arts", "hotel-management", "event-management"] },
      { name: "Sports & Recreation", courses: ["sports-science", "physical-fitness", "recreation-management"] },
      { name: "Transport", courses: ["aviation", "maritime-studies", "transport-management"] },
      { name: "Personal Services", courses: ["beauty-and-wellness", "hairdressing", "personal-services"] },
      { name: "Safety & Security", courses: ["fire-protection", "occupational-safety", "police-studies", "military-studies", "public-safety"] },
    ],
  },
];

/* ---------- Countries (with flags) ---------- */
CV.flags = {
  "India": "🇮🇳", "United States": "🇺🇸", "United Kingdom": "🇬🇧", "Canada": "🇨🇦",
  "Australia": "🇦🇺", "Germany": "🇩🇪", "France": "🇫🇷", "Netherlands": "🇳🇱",
  "Singapore": "🇸🇬", "Japan": "🇯🇵", "South Korea": "🇰🇷", "China": "🇨🇳",
  "Brazil": "🇧🇷", "South Africa": "🇿🇦", "UAE": "🇦🇪", "New Zealand": "🇳🇿",
  "Ireland": "🇮🇪", "Sweden": "🇸🇪", "Switzerland": "🇨🇭", "Italy": "🇮🇹",
  "Spain": "🇪🇸", "Mexico": "🇲🇽", "Nigeria": "🇳🇬", "Egypt": "🇪🇬",
  "Saudi Arabia": "🇸🇦", "Malaysia": "🇲🇾", "Kenya": "🇰🇪", "Norway": "🇳🇴",
};
CV.flag = (c) => CV.flags[c] || "🌍";

/* ---------- Helpers used by the course files ---------- */
/* Programme-name generator: P(["BSc","BTech"], "Computer Science")
   -> ["BSc Computer Science", "BTech Computer Science"] */
CV.P = (abbrs, subject) => abbrs.map((a) => a + " " + subject);

/* Common country lists */
CV.WORLD12 = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Netherlands", "Singapore", "Japan", "Brazil", "South Africa"];

/* ---------- Icon library (inline SVG, stroke style) ---------- */
CV.ICONS = {
  compass:  '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  book:     '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  palette:  '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  people:   '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  briefcase:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  atom:     '<circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z"/>',
  code:     '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  leaf:     '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  heart:    '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  bell:     '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  search:   '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  arrow:    '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  grad:     '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>',
  globe:    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  layers:   '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  award:    '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  cap:      '<path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
};
