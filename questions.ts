/* The question bank. This is the shape to copy when adding a question:
   both languages for the stem, every option and the solution, one integer
   correctAnswer (0–3). Saved questions from the admin form are appended from
   localStorage at runtime — see src/lib/questions.ts. */
export type Exam = 'NEET' | 'JEE Mains'
export type Bilingual = { en: string; hi: string }
export type Difficulty = 'Easy' | 'Medium' | 'Hard'
export type QuestionType = 'PYQ' | 'Practice'

export type Question = {
  id: number
  exam: Exam
  subject: string
  chapter: string
  year: number | null
  shift?: string | null
  type: QuestionType
  difficulty: Difficulty
  question: Bilingual
  options: { en: string[]; hi: string[] }
  correctAnswer: number
  /* An optional figure for the stem. The owner pastes a URL from the admin form;
     questions added in the database carry it too. */
  image?: string
  solution: Bilingual
}

/* The question bank. One object per question; copy any of these to add one. */
export const questions: Question[] = [
  {
    id: 1,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Biological Classification',
    year: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'Which of the following statements about dinoflagellates are correct?\n\nStatement 1: They are mainly found in marine water and are photosynthetic.\nStatement 2: Stiff cellulose plates are present on the outer surface of their cell membrane.\nStatement 3: All dinoflagellates have two flagella, of which one lies longitudinally and the other transversely.\nStatement 4: They release red waves (red tide).',
      hi: 'डायनोफ्लेजलेट के बारे में कौन-से कथन सत्य हैं?\n\nकथन 1: ये मुख्यतः खारे जल में पाये जाते हैं एवं प्रकाश संश्लेषी हैं।\nकथन 2: इनकी कोशिका झिल्ली के बाह्य सतह पर सैल्युलोज की कड़ी पट्टिकाएँ पाई जाती हैं।\nकथन 3: सभी डायनोफ्लेजलेट में दो कशाभ होते हैं, जिनमें से एक लम्बवत और दूसरा अनुप्रस्थ रूप में उपस्थित होता है।\nकथन 4: ये लाल तरंग (लाल ज्वार) को छोड़ते हैं।',
    },
    options: {
      en: ['1, 2', '1, 4', '1, 3', 'All of the above'],
      hi: ['1, 2', '1, 4', '1, 3', 'उपरोक्त सभी'],
    },
    correctAnswer: 1,
    solution: {
      en: 'Only statements 1 and 4 are correct.\n\nStatement 2 is wrong because the stiff cellulose plates are on the outer surface of the cell wall, not the cell membrane.\nStatement 3 is wrong because most (not all) dinoflagellates have two flagella.\n\nHence the correct option is B (1, 4).',
      hi: 'केवल कथन 1 और 4 सही हैं।\n\nकथन 2 गलत है क्योंकि सैल्युलोज की कड़ी पट्टिकाएँ कोशिका भित्ति की बाहरी सतह पर होती हैं, कोशिका झिल्ली पर नहीं।\nकथन 3 गलत है क्योंकि अधिकांश (सभी नहीं) डायनोफ्लेजलेट में दो कशाभ होते हैं।\n\nअतः सही विकल्प B (1, 4) है।',
    },
  },
  {
    id: 2,
    exam: 'NEET',
    subject: 'Physics',
    chapter: 'Units and Measurements',
    year: 2022,
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'Which of the following is a dimensionless quantity?',
      hi: 'निम्नलिखित में से कौन-सी राशि विमाहीन है?',
    },
    options: {
      en: ['Strain', 'Stress', 'Young\u2019s modulus', 'Surface tension'],
      hi: ['विकृति', 'प्रतिबल', 'यंग गुणांक', 'पृष्ठ तनाव'],
    },
    correctAnswer: 0,
    solution: {
      en: 'Strain is a ratio of two lengths, so its dimensions cancel: M⁰L⁰T⁰. Stress has the dimensions of pressure (ML⁻¹T⁻²), Young\u2019s modulus the same, and surface tension is MT⁻².',
      hi: 'विकृति दो लंबाइयों का अनुपात है, इसलिए इसकी विमाएँ कट जाती हैं: M⁰L⁰T⁰. प्रतिबल और यंग गुणांक की विमाएँ दाब जैसी (ML⁻¹T⁻²) हैं और पृष्ठ तनाव की MT⁻² है।',
    },
  },
  {
    id: 3,
    exam: 'NEET',
    subject: 'Physics',
    chapter: 'Current Electricity',
    year: 2021,
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'Two resistors of 6 Ω and 3 Ω are connected in parallel across a 6 V battery. What is the total current drawn from the battery?',
      hi: '6 Ω और 3 Ω के दो प्रतिरोधक 6 V की बैटरी के सिरों के बीच समांतर क्रम में जुड़े हैं। बैटरी से ली गई कुल धारा क्या है?',
    },
    options: {
      en: ['1 A', '2 A', '3 A', '0.5 A'],
      hi: ['1 A', '2 A', '3 A', '0.5 A'],
    },
    correctAnswer: 2,
    solution: {
      en: 'For parallel resistors 1/R = 1/6 + 1/3 = 1/2, so R = 2 Ω. Total current I = V/R = 6/2 = 3 A.',
      hi: 'समांतर संयोजन में 1/R = 1/6 + 1/3 = 1/2, अतः R = 2 Ω. कुल धारा I = V/R = 6/2 = 3 A.',
    },
  },
  {
    id: 4,
    exam: 'NEET',
    subject: 'Physics',
    chapter: 'Work, Energy and Power',
    year: null,
    type: 'Practice',
    difficulty: 'Hard',
    question: {
      en: 'A block of mass m is released from rest at the top of a smooth incline of height h. How much work is done by the normal force during the slide to the bottom?',
      hi: 'द्रव्यमान m का एक गुटका h ऊँचाई के चिकने नत तल के शीर्ष से विराम से छोड़ा जाता है। नीचे तक फिसलने के दौरान अभिलंब बल द्वारा किया गया कार्य कितना है?',
    },
    options: {
      en: ['mgh', 'mgh/2', 'Zero', 'Depends on the angle of incline'],
      hi: ['mgh', 'mgh/2', 'शून्य', 'नत तल के कोण पर निर्भर'],
    },
    correctAnswer: 2,
    solution: {
      en: 'The normal force is always perpendicular to the displacement, so the angle between them is 90° and W = Fs cos 90° = 0. The whole job is done by gravity, giving kinetic energy mgh at the bottom.',
      hi: 'अभिलंब बल सदैव विस्थापन के लंबवत होता है, अतः उनके बीच कोण 90° है और W = Fs cos 90° = 0. पूरा कार्य गुरुत्व करता है, नीचे गतिज ऊर्जा mgh होती है।',
    },
  },
  {
    id: 5,
    exam: 'NEET',
    subject: 'Physics',
    chapter: 'Ray Optics',
    year: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'The refractive index of water is 4/3. What is the speed of light in water? (c = 3 × 10⁸ m/s)',
      hi: 'पानी का अपवर्तनांक 4/3 है। पानी में प्रकाश का वेग क्या है? (c = 3 × 10⁸ m/s)',
    },
    options: {
      en: ['2.25 × 10⁸ m/s', '4 × 10⁸ m/s', '1.5 × 10⁸ m/s', '3 × 10⁸ m/s'],
      hi: ['2.25 × 10⁸ m/s', '4 × 10⁸ m/s', '1.5 × 10⁸ m/s', '3 × 10⁸ m/s'],
    },
    correctAnswer: 0,
    solution: {
      en: 'n = c/v, so v = c/n = (3 × 10⁸) ÷ (4/3) = 2.25 × 10⁸ m/s.',
      hi: 'n = c/v, अतः v = c/n = (3 × 10⁸) ÷ (4/3) = 2.25 × 10⁸ m/s.',
    },
  },

  /* ── NEET · Chemistry ───────────────────────────────────────────── */
  {
    id: 6,
    exam: 'NEET',
    subject: 'Chemistry',
    chapter: 'Chemical Bonding',
    year: 2023,
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'Which of the following molecules has a linear shape?',
      hi: 'निम्नलिखित में से किस अणु की आकृति रेखीय है?',
    },
    options: {
      en: ['H₂O', 'NH₃', 'CO₂', 'CH₄'],
      hi: ['H₂O', 'NH₃', 'CO₂', 'CH₄'],
    },
    correctAnswer: 2,
    solution: {
      en: 'CO₂ is sp hybridised with no lone pair on carbon, so its two C=O bonds sit at 180° and the molecule is linear. H₂O is bent (104.5°), NH₃ pyramidal and CH₄ tetrahedral.',
      hi: 'CO₂ में कार्बन sp संकरित है और कोई एकाकी इलेक्ट्रॉन युग्म नहीं है, अतः दोनों C=O बंध 180° पर हैं और अणु रेखीय है। H₂O मुड़ा हुआ (104.5°), NH₃ पिरामिडी और CH₄ चतुष्फलकीय है।',
    },
  },
  {
    id: 7,
    exam: 'NEET',
    subject: 'Chemistry',
    chapter: 'Mole Concept',
    year: 2022,
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'How many moles of oxygen atoms are present in 1 mole of H₂SO₄?',
      hi: 'H₂SO₄ के 1 मोल में ऑक्सीजन परमाणुओं के कितने मोल होते हैं?',
    },
    options: {
      en: ['1', '2', '3', '4'],
      hi: ['1', '2', '3', '4'],
    },
    correctAnswer: 3,
    solution: {
      en: 'The formula H₂SO₄ holds four oxygen atoms per molecule, so one mole of the acid holds four moles of oxygen atoms — about 4 × 6.022 × 10²³ atoms.',
      hi: 'सूत्र H₂SO₄ में प्रति अणु चार ऑक्सीजन परमाणु हैं, अतः अम्ल के एक मोल में ऑक्सीजन परमाणुओं के चार मोल — लगभग 4 × 6.022 × 10²³ परमाणु — होते हैं।',
    },
  },
  {
    id: 8,
    exam: 'NEET',
    subject: 'Chemistry',
    chapter: 'Thermodynamics',
    year: 2021,
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'For a process carried out at constant pressure, the heat exchanged at equilibrium is equal to the change in:',
      hi: 'स्थिर दाब पर संपन्न प्रक्रिया के लिए, साम्य पर हुआ ऊष्मा विनिमय किसके परिवर्तन के बराबर होता है?',
    },
    options: {
      en: ['Internal energy (ΔU)', 'Enthalpy (ΔH)', 'Entropy (ΔS)', 'Gibbs free energy (ΔG)'],
      hi: ['आंतरिक ऊर्जा (ΔU)', 'एन्थैल्पी (ΔH)', 'एन्ट्रॉपी (ΔS)', 'गिब्स मुक्त ऊर्जा (ΔG)'],
    },
    correctAnswer: 1,
    solution: {
      en: 'At constant pressure q_p = ΔU + PΔV = ΔH. The heat given out or taken in is the change in enthalpy; ΔU is the equal quantity only when the volume is constant.',
      hi: 'स्थिर दाब पर q_p = ΔU + PΔV = ΔH. दी गई या ली गई ऊष्मा एन्थैल्पी का परिवर्तन है; ΔU केवल स्थिर आयतन पर उसके बराबर होता है।',
    },
  },
  {
    id: 9,
    exam: 'NEET',
    subject: 'Chemistry',
    chapter: 'Organic Chemistry: Isomerism',
    year: null,
    type: 'Practice',
    difficulty: 'Hard',
    question: {
      en: 'Butane (C₄H₁₀) has two structural isomers. How many of its isomers show chain isomerism only?',
      hi: 'ब्यूटेन (C₄H₁₀) के दो संरचनात्मक समावयवी हैं। इनमें से कितने केवल शृंखला समावयवता दर्शाते हैं?',
    },
    options: {
      en: ['One', 'Two', 'Three', 'None'],
      hi: ['एक', 'दो', 'तीन', 'कोई नहीं'],
    },
    correctAnswer: 1,
    solution: {
      en: 'n-Butane and isobutane differ only in the arrangement of the carbon chain — both are C₄H₁₀ — so both are chain isomers of each other. There are no position or functional isomers at four carbons.',
      hi: 'n-ब्यूटेन और आइसोब्यूटेन में केवल कार्बन शृंखला की व्यवस्था भिन्न है — दोनों C₄H₁₀ हैं — अतः दोनों एक-दूसरे के शृंखला समावयवी हैं। चार कार्बन पर स्थिति या क्रियात्मक समावयवी नहीं होते।',
    },
  },
  {
    id: 10,
    exam: 'NEET',
    subject: 'Chemistry',
    chapter: 'Periodic Table',
    year: null,
    type: 'Practice',
    difficulty: 'Easy',
    question: {
      en: 'Across a period from left to right, how does the atomic radius change?',
      hi: 'किसी आवर्त में बाएँ से दाएँ जाने पर परमाणु त्रिज्या कैसे बदलती है?',
    },
    options: {
      en: ['It increases', 'It decreases', 'It stays constant', 'It first increases, then decreases'],
      hi: ['बढ़ती है', 'घटती है', 'स्थिर रहती है', 'पहले बढ़ती, फिर घटती है'],
    },
    correctAnswer: 1,
    solution: {
      en: 'Each step to the right adds a proton without adding a shell, so the nuclear charge pulls the same outer electrons in harder and the radius falls across the period.',
      hi: 'दाएँ ओर प्रत्येक कदम में एक प्रोटॉन बढ़ता है पर नया कोश नहीं, अतः नाभिकीय आवेश उन्हीं बाहरी इलेक्ट्रॉनों को अधिक टानता है और त्रिज्या आवर्त में घटती जाती है।',
    },
  },

  /* ── NEET · Biology ─────────────────────────────────────────────── */
  {
    id: 11,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Cell: The Unit of Life',
    year: 2023,
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'Which cell organelle is known as the powerhouse of the cell?',
      hi: 'किस कोशिका अंगक को कोशिका का ऊर्जा गृह कहा जाता है?',
    },
    options: {
      en: ['Ribosome', 'Mitochondrion', 'Golgi apparatus', 'Lysosome'],
      hi: ['राइबोसोम', 'माइटोकॉन्ड्रिया', 'गॉल्जी उपकरण', 'लाइसोसोम'],
    },
    correctAnswer: 1,
    solution: {
      en: 'Mitochondria carry out oxidative phosphorylation, converting the chemical energy of food into ATP — the cell\u2019s usable energy currency — so they are called the powerhouse of the cell.',
      hi: 'माइटोकॉन्ड्रिया ऑक्सीडेटिव फॉस्फोरिलीकरण द्वारा भोजन की रासायनिक ऊर्जा को ATP में बदलते हैं — ATP कोशिका की प्रयोग-योग्य ऊर्जा मुद्रा है — इसीलिए इन्हें ऊर्जा गृह कहते हैं।',
    },
  },
  {
    id: 12,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Genetics and Evolution',
    year: 2022,
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'A cross between a plant heterozygous for tallness (Tt) and a dwarf plant (tt) gives progeny in which ratio of tall to dwarf?',
      hi: 'लंबेपन के लिए विषमयुग्मजी पौधे (Tt) और बौने पौधे (tt) के बीच संकरण से संतानों में लंबे : बौने का अनुपात क्या होगा?',
    },
    options: {
      en: ['3 : 1', '1 : 1', '1 : 3', 'All tall'],
      hi: ['3 : 1', '1 : 1', '1 : 3', 'सभी लंबे'],
    },
    correctAnswer: 1,
    solution: {
      en: 'This is a test cross. Tt × tt gives gametes T, t from the first parent and t, t from the second: offspring are Tt and tt in equal numbers, so tall : dwarf = 1 : 1.',
      hi: 'यह परीक्षण संकरण है। Tt × tt में पहले जनक से युग्मक T, t और दूसरे से t, t मिलते हैं: संतान Tt और tt बराबर संख्या में होती है, अतः लंबे : बौने = 1 : 1.',
    },
  },
  {
    id: 13,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Plant Physiology: Photosynthesis',
    year: 2021,
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'Where does the Calvin cycle take place in a chloroplast?',
      hi: 'क्लोरोप्लास्ट में केल्विन चक्र कहाँ होता है?',
    },
    options: {
      en: ['Stroma', 'Thylakoid membrane', 'Intermembrane space', 'Outer membrane'],
      hi: ['स्ट्रोमा', 'थाइलेकॉइड झिल्ली', 'अंतराझिल्लीय स्थान', 'बाहरी झिल्ली'],
    },
    correctAnswer: 0,
    solution: {
      en: 'The light reactions run on the thylakoid membranes; the Calvin cycle, which fixes CO₂ using the ATP and NADPH they make, runs in the stroma.',
      hi: 'प्रकाश अभिक्रियाएँ थाइलेकॉइड झिल्लियों पर होती हैं; केल्विन चक्र, जो उनके बनाए ATP और NADPH से CO₂ का स्थिरीकरण करता है, स्ट्रोमा में होता है।',
    },
  },
  {
    id: 14,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Human Physiology: Digestion',
    year: null,
    type: 'Practice',
    difficulty: 'Easy',
    question: {
      en: 'Which enzyme present in saliva begins the digestion of starch?',
      hi: 'लार में उपस्थित कौन-सा एंजाइम स्टार्च का पाचन आरंभ करता है?',
    },
    options: {
      en: ['Pepsin', 'Trypsin', 'Salivary amylase', 'Lipase'],
      hi: ['पेप्सिन', 'ट्रिप्सिन', 'लार एमाइलेज', 'लाइपेज'],
    },
    correctAnswer: 2,
    solution: {
      en: 'Salivary amylase (ptyalin) hydrolyses starch into maltose in the slightly alkaline mouth at pH 6.8. Pepsin and trypsin act on proteins, lipase on fats.',
      hi: 'लार एमाइलेज (टायलिन) हल्के क्षारीय मुख में pH 6.8 पर स्टार्च को माल्टोस में जल-अपघटित करता है। पेप्सिन और ट्रिप्सिन प्रोटीन पर तथा लाइपेज वसा पर कार्य करते हैं।',
    },
  },
  {
    id: 15,
    exam: 'NEET',
    subject: 'Biology',
    chapter: 'Ecology',
    year: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'In a food chain, roughly what percentage of the energy at one trophic level is transferred to the next?',
      hi: 'किसी खाद्य श्रृंखला में एक पोषी स्तर की ऊर्जा का लगभग कितना प्रतिशत अगले स्तर तक पहुँचता है?',
    },
    options: {
      en: ['90 %', '50 %', '10 %', '1 %'],
      hi: ['90 %', '50 %', '10 %', '1 %'],
    },
    correctAnswer: 2,
    solution: {
      en: 'Lindeman\u2019s ten per cent law: only about 10 % of the energy passes to the next trophic level, the rest being lost as heat and in respiration — which is why food chains are short.',
      hi: 'लिंडेमैन का दस प्रतिशत नियम: लगभग 10 % ऊर्जा ही अगले पोषी स्तर पर जाती है, शेष ऊष्मा और श्वसन में नष्ट होती है — इसीलिए खाद्य श्रृंखलाएँ छोटी होती हैं।',
    },
  },

  /* ── JEE Mains · Physics ────────────────────────────────────────── */
  {
    id: 16,
    exam: 'JEE Mains',
    subject: 'Physics',
    chapter: 'Electrostatics',
    year: 2024,
    shift: 'Shift 1',
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'Two point charges of +2 μC and −2 μC are 0.1 m apart. What is the magnitude of the force between them? (k = 9 × 10⁹ N m²/C²)',
      hi: '+2 μC और −2 μC के दो बिंदु आवेश 0.1 m की दूरी पर हैं। उनके बीच बल का परिमाण क्या है? (k = 9 × 10⁹ N m²/C²)',
    },
    options: {
      en: ['3.6 N', '36 N', '0.36 N', '360 N'],
      hi: ['3.6 N', '36 N', '0.36 N', '360 N'],
    },
    correctAnswer: 0,
    solution: {
      en: 'F = k|q₁q₂|/r² = 9 × 10⁹ × (2 × 10⁻⁶ × 2 × 10⁻⁶) / (0.1)² = 9 × 10⁹ × 4 × 10⁻¹² / 10⁻² = 3.6 N. Opposite charges attract.',
      hi: 'F = k|q₁q₂|/r² = 9 × 10⁹ × (2 × 10⁻⁶ × 2 × 10⁻⁶) / (0.1)² = 9 × 10⁹ × 4 × 10⁻¹² / 10⁻² = 3.6 N. विपरीत आवेश आकर्षित होते हैं।',
    },
  },
  {
    id: 17,
    exam: 'JEE Mains',
    subject: 'Physics',
    chapter: 'Rotational Motion',
    year: 2023,
    shift: 'Shift 2',
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'What is the moment of inertia of a solid sphere of mass M and radius R about an axis through its centre?',
      hi: 'द्रव्यमान M और त्रिज्या R के ठोस गोले का केंद्र से गुजरने वाले अक्ष के परितः जड़त्व आघूर्ण क्या है?',
    },
    options: {
      en: ['(2/5)MR²', '(2/3)MR²', '(1/2)MR²', 'MR²'],
      hi: ['(2/5)MR²', '(2/3)MR²', '(1/2)MR²', 'MR²'],
    },
    correctAnswer: 0,
    solution: {
      en: 'A uniform solid sphere has I = (2/5)MR² about a diameter. A hollow sphere is (2/3)MR², a solid disc (1/2)MR², and a thin ring MR².',
      hi: 'एकसमान ठोस गोले का व्यास के परितः I = (2/5)MR² होता है। खोखले गोले का (2/3)MR², ठोस चकती का (1/2)MR² और पतली वलय का MR² होता है।',
    },
  },
  {
    id: 18,
    exam: 'JEE Mains',
    subject: 'Physics',
    chapter: 'Oscillations',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Hard',
    question: {
      en: 'The time period of a simple pendulum is T on the Earth. What is its time period on a planet where g is four times that on Earth?',
      hi: 'पृथ्वी पर एक सरल लोलक का आवर्तकाल T है। ऐसे ग्रह पर, जहाँ g पृथ्वी का चार गुना है, इसका आवर्तकाल क्या होगा?',
    },
    options: {
      en: ['4T', '2T', 'T/2', 'T/4'],
      hi: ['4T', '2T', 'T/2', 'T/4'],
    },
    correctAnswer: 2,
    solution: {
      en: 'T = 2π√(L/g), so T ∝ 1/√g. Quadrupling g halves the period: T\u2032 = T/√4 = T/2.',
      hi: 'T = 2π√(L/g), अतः T ∝ 1/√g. g चार गुना करने पर आवर्तकाल आधा हो जाता है: T\u2032 = T/√4 = T/2.',
    },
  },
  {
    id: 19,
    exam: 'JEE Mains',
    subject: 'Physics',
    chapter: 'Thermodynamics',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'An ideal gas expands isothermally at temperature T from volume V to 2V. The work done by the gas is:',
      hi: 'एक आदर्श गैस ताप T पर समतापीय रूप से आयतन V से 2V तक प्रसारित होती है। गैस द्वारा किया गया कार्य है:',
    },
    options: {
      en: ['nRT ln 2', 'nRT', '2nRT', 'Zero'],
      hi: ['nRT ln 2', 'nRT', '2nRT', 'शून्य'],
    },
    correctAnswer: 0,
    solution: {
      en: 'For an isothermal reversible expansion W = nRT ln(V₂/V₁) = nRT ln 2. Temperature is constant, so ΔU = 0 and the gas absorbs heat equal to this work.',
      hi: 'समतापीय उत्क्रमणीय प्रसार में W = nRT ln(V₂/V₁) = nRT ln 2. ताप स्थिर है, अतः ΔU = 0 और गैस इस कार्य के बराबर ऊष्मा अवशोषित करती है।',
    },
  },
  {
    id: 20,
    exam: 'JEE Mains',
    subject: 'Physics',
    chapter: 'Modern Physics',
    year: 2022,
    shift: 'Shift 1',
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'What is the energy of a photon of wavelength 620 nm? (hc = 1240 eV·nm)',
      hi: '620 nm तरंगदैर्घ्य के फोटॉन की ऊर्जा क्या है? (hc = 1240 eV·nm)',
    },
    options: {
      en: ['1.0 eV', '2.0 eV', '3.1 eV', '4.0 eV'],
      hi: ['1.0 eV', '2.0 eV', '3.1 eV', '4.0 eV'],
    },
    correctAnswer: 1,
    solution: {
      en: 'E = hc/λ = 1240/620 = 2.0 eV. The shortcut works because hc is about 1240 eV·nm, which saves converting to joules.',
      hi: 'E = hc/λ = 1240/620 = 2.0 eV. यह संक्षिप्त विधि इसलिए काम करती है कि hc लगभग 1240 eV·nm है, जिससे जूल में बदलने की आवश्यकता नहीं पड़ती।',
    },
  },

  /* ── JEE Mains · Chemistry ──────────────────────────────────────── */
  {
    id: 21,
    exam: 'JEE Mains',
    subject: 'Chemistry',
    chapter: 'Chemical Equilibrium',
    year: 2024,
    shift: 'Shift 2',
    type: 'PYQ',
    difficulty: 'Medium',
    question: {
      en: 'For the reaction N₂ + 3H₂ ⇌ 2NH₃, what is the relation between Kp and Kc?',
      hi: 'अभिक्रिया N₂ + 3H₂ ⇌ 2NH₃ के लिए Kp और Kc में क्या संबंध है?',
    },
    options: {
      en: ['Kp = Kc (RT)⁻²', 'Kp = Kc (RT)²', 'Kp = Kc (RT)⁻⁴', 'Kp = Kc'],
      hi: ['Kp = Kc (RT)⁻²', 'Kp = Kc (RT)²', 'Kp = Kc (RT)⁻⁴', 'Kp = Kc'],
    },
    correctAnswer: 0,
    solution: {
      en: 'Kp = Kc (RT)^Δn, where Δn = moles of gaseous products − moles of gaseous reactants = 2 − 4 = −2. So Kp = Kc (RT)⁻².',
      hi: 'Kp = Kc (RT)^Δn, जहाँ Δn = गैसीय उत्पादों के मोल − गैसीय अभिकारकों के मोल = 2 − 4 = −2. अतः Kp = Kc (RT)⁻².',
    },
  },
  {
    id: 22,
    exam: 'JEE Mains',
    subject: 'Chemistry',
    chapter: 'Solutions',
    year: 2023,
    shift: 'Shift 1',
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'The pH of a 0.001 M solution of HCl is:',
      hi: 'HCl के 0.001 M विलयन का pH है:',
    },
    options: {
      en: ['1', '2', '3', '11'],
      hi: ['1', '2', '3', '11'],
    },
    correctAnswer: 2,
    solution: {
      en: 'HCl is a strong acid, so [H⁺] = 0.001 = 10⁻³ M and pH = −log(10⁻³) = 3.',
      hi: 'HCl प्रबल अम्ल है, अतः [H⁺] = 0.001 = 10⁻³ M और pH = −log(10⁻³) = 3.',
    },
  },
  {
    id: 23,
    exam: 'JEE Mains',
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Hard',
    question: {
      en: 'The standard electrode potential of Zn²⁺/Zn is −0.76 V and of Cu²⁺/Cu is +0.34 V. What is the EMF of the Daniell cell?',
      hi: 'Zn²⁺/Zn का मानक इलेक्ट्रोड विभव −0.76 V और Cu²⁺/Cu का +0.34 V है। डेनियल सेल का विद्युत वाहक बल क्या है?',
    },
    options: {
      en: ['0.42 V', '1.10 V', '−1.10 V', '0.34 V'],
      hi: ['0.42 V', '1.10 V', '−1.10 V', '0.34 V'],
    },
    correctAnswer: 1,
    solution: {
      en: 'E°cell = E°cathode − E°anode = 0.34 − (−0.76) = 1.10 V. Zinc is oxidised at the anode, copper deposited at the cathode.',
      hi: 'E°cell = E°कैथोड − E°एनोड = 0.34 − (−0.76) = 1.10 V. एनोड पर ज़िंक ऑक्सीकृत होता है, कैथोड पर कॉपर जमा होता है।',
    },
  },
  {
    id: 24,
    exam: 'JEE Mains',
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'What is the oxidation state of cobalt in [Co(NH₃)₆]Cl₃?',
      hi: '[Co(NH₃)₆]Cl₃ में कोबाल्ट की ऑक्सीकरण अवस्था क्या है?',
    },
    options: {
      en: ['+2', '+3', '+6', '0'],
      hi: ['+2', '+3', '+6', '0'],
    },
    correctAnswer: 1,
    solution: {
      en: 'NH₃ is neutral and the three chloride ions carry −3, so the complex ion must be +3: x + 0 = +3, giving x = +3.',
      hi: 'NH₃ उदासीन है और तीन क्लोराइड आयन −3 लेकर आते हैं, अतः संकुल आयन +3 होना चाहिए: x + 0 = +3, अतः x = +3.',
    },
  },
  {
    id: 25,
    exam: 'JEE Mains',
    subject: 'Chemistry',
    chapter: 'Hydrocarbons',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Easy',
    question: {
      en: 'Additions to an unsymmetrical alkene follow Markovnikov\u2019s rule. When propene reacts with HBr, the major product is:',
      hi: 'असममित ऐल्कीन में योग मार्कोनिकॉफ के नियम का पालन करता है। प्रोपीन की HBr से अभिक्रिया में मुख्य उत्पाद है:',
    },
    options: {
      en: ['1-bromopropane', '2-bromopropane', 'Propan-2-ol', '1,2-dibromopropane'],
      hi: ['1-ब्रोमोप्रोपेन', '2-ब्रोमोप्रोपेन', 'प्रोपेन-2-ओल', '1,2-डाइब्रोमोप्रोपेन'],
    },
    correctAnswer: 1,
    solution: {
      en: 'The proton adds to the carbon carrying more hydrogens, building the more stable secondary carbocation, and Br⁻ then attaches to that carbon — giving 2-bromopropane.',
      hi: 'प्रोटॉन उस कार्बन पर जुड़ता है जिसमें अधिक हाइड्रोजन हैं और अधिक स्थायी द्वितीयक कार्बोधनायन बनता है; फिर Br⁻ उसी कार्बन पर जुड़ता है — उत्पाद 2-ब्रोमोप्रोपेन।',
    },
  },

  /* ── JEE Mains · Mathematics ────────────────────────────────────── */
  {
    id: 26,
    exam: 'JEE Mains',
    subject: 'Mathematics',
    chapter: 'Quadratic Equations',
    year: 2024,
    shift: 'Shift 1',
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'The sum of the roots of the equation 2x² − 6x + 4 = 0 is:',
      hi: 'समीकरण 2x² − 6x + 4 = 0 के मूलों का योग है:',
    },
    options: {
      en: ['−3', '3', '2', '−2'],
      hi: ['−3', '3', '2', '−2'],
    },
    correctAnswer: 1,
    solution: {
      en: 'For ax² + bx + c = 0 the sum of roots is −b/a = −(−6)/2 = 3. Check: the roots are 1 and 2, and 1 + 2 = 3.',
      hi: 'ax² + bx + c = 0 के लिए मूलों का योग −b/a = −(−6)/2 = 3 है। जाँच: मूल 1 और 2 हैं, और 1 + 2 = 3.',
    },
  },
  {
    id: 27,
    exam: 'JEE Mains',
    subject: 'Mathematics',
    chapter: 'Differentiation',
    year: 2023,
    shift: 'Shift 2',
    type: 'PYQ',
    difficulty: 'Easy',
    question: {
      en: 'If y = sin x, what is dy/dx at x = π/2?',
      hi: 'यदि y = sin x है, तो x = π/2 पर dy/dx क्या है?',
    },
    options: {
      en: ['0', '1', '−1', 'π/2'],
      hi: ['0', '1', '−1', 'π/2'],
    },
    correctAnswer: 0,
    solution: {
      en: 'dy/dx = cos x. At x = π/2, cos(π/2) = 0, so the sine curve is flat at its peak.',
      hi: 'dy/dx = cos x. x = π/2 पर cos(π/2) = 0, अतः शीर्ष पर ज्या वक्र समतल है।',
    },
  },
  {
    id: 28,
    exam: 'JEE Mains',
    subject: 'Mathematics',
    chapter: 'Probability',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Medium',
    question: {
      en: 'Two fair dice are thrown together. What is the probability that the sum of the numbers is 9?',
      hi: 'दो निष्पक्ष पासे एक साथ फेंके जाते हैं। संख्याओं का योग 9 होने की प्रायिकता क्या है?',
    },
    options: {
      en: ['1/9', '1/12', '1/6', '1/18'],
      hi: ['1/9', '1/12', '1/6', '1/18'],
    },
    correctAnswer: 0,
    solution: {
      en: 'Sums of 9 come from (3,6), (4,5), (5,4), (6,3) — four favourable outcomes out of 36, so P = 4/36 = 1/9.',
      hi: 'योग 9 देने वाले युग्म (3,6), (4,5), (5,4), (6,3) — 36 में से चार अनुकूल परिणाम हैं, अतः P = 4/36 = 1/9.',
    },
  },
  {
    id: 29,
    exam: 'JEE Mains',
    subject: 'Mathematics',
    chapter: 'Integration',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Hard',
    question: {
      en: 'What is ∫₀^π sin x dx?',
      hi: '∫₀^π sin x dx का मान क्या है?',
    },
    options: {
      en: ['0', '1', '2', 'π'],
      hi: ['0', '1', '2', 'π'],
    },
    correctAnswer: 2,
    solution: {
      en: '∫ sin x dx = −cos x. Evaluating from 0 to π: (−cos π) − (−cos 0) = (1) − (−1) = 2. The area under one arch of the sine curve is 2.',
      hi: '∫ sin x dx = −cos x. 0 से π तक: (−cos π) − (−cos 0) = (1) − (−1) = 2. ज्या वक्र के एक चाप के नीचे का क्षेत्रफल 2 है।',
    },
  },
  {
    id: 30,
    exam: 'JEE Mains',
    subject: 'Mathematics',
    chapter: 'Sets and Relations',
    year: null,
    shift: null,
    type: 'Practice',
    difficulty: 'Easy',
    question: {
      en: 'If set A has 3 elements and set B has 4 elements, how many elements does A × B have?',
      hi: 'यदि समुच्चय A में 3 अवयव और समुच्चय B में 4 अवयव हैं, तो A × B में कितने अवयव होंगे?',
    },
    options: {
      en: ['7', '12', '64', '81'],
      hi: ['7', '12', '64', '81'],
    },
    correctAnswer: 1,
    solution: {
      en: 'The Cartesian product pairs every element of A with every element of B, so |A × B| = 3 × 4 = 12.',
      hi: 'कार्तीय गुणन A के प्रत्येक अवयव को B के प्रत्येक अवयव से जोड़ता है, अतः |A × B| = 3 × 4 = 12.',
    },
  },
]
export const QUESTIONS = questions
