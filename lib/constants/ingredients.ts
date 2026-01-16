// Standard ingredient tags for recipe matching
// These are the base ingredients that recipes typically use

export const STANDARD_INGREDIENTS = {
  // Groenten
  vegetables: [
    'paprika',
    'ui',
    'knoflook',
    'tomaat',
    'wortel',
    'broccoli',
    'bloemkool',
    'spinazie',
    'sla',
    'komkommer',
    'courgette',
    'aubergine',
    'prei',
    'selderij',
    'champignons',
    'asperges',
    'spruitjes',
    'rode biet',
    'radijs',
    'maïs',
    'erwten',
    'sperziebonen',
    'witlof',
    'andijvie',
    'rucola',
  ],
  
  // Fruit
  fruits: [
    'appel',
    'banaan',
    'sinaasappel',
    'citroen',
    'limoen',
    'aardbei',
    'druiven',
    'meloen',
    'watermeloen',
    'perzik',
    'peer',
    'kiwi',
    'mango',
    'ananas',
    'avocado',
  ],
  
  // Vlees & Vis
  meats: [
    'kip',
    'kipfilet',
    'kippendij',
    'rundvlees',
    'varkensvlees',
    'varkenshaas',
    'gehakt',
    'spek',
    'worst',
    'ham',
    'zalm',
    'tonijn',
    'kabeljauw',
    'garnalen',
    'mosselen',
    'eieren',
  ],
  
  // Zuivel
  dairy: [
    'melk',
    'kaas',
    'yoghurt',
    'boter',
    'room',
    'zure room',
    'mozzarella',
    'parmezaan',
    'cheddar',
    'kwark',
  ],
  
  // Granen & Pasta
  grains: [
    'rijst',
    'pasta',
    'spaghetti',
    'penne',
    'brood',
    'volkorenbrood',
    'meel',
    'bloem',
    'quinoa',
    'couscous',
    'bulgur',
  ],
  
  // Kruiden & Specerijen
  herbs: [
    'zout',
    'peper',
    'basilicum',
    'oregano',
    'tijm',
    'rozemarijn',
    'peterselie',
    'koriander',
    'dille',
    'bieslook',
    'laurier',
    'paprikapoeder',
    'kerrie',
    'komijn',
    'kaneel',
    'nootmuskaat',
  ],
  
  // Overig
  other: [
    'olijfolie',
    'zonnebloemolie',
    'azijn',
    'sojasaus',
    'bouillon',
    'bouillonblokjes',
    'tomatenpuree',
    'gember',
    'kappertjes',
    'olijven',
    'noten',
    'amandelen',
    'walnoten',
  ],
} as const;

// Flatten all ingredients into a single array (remove duplicates)
export const ALL_INGREDIENTS = Array.from(
  new Set([
    ...STANDARD_INGREDIENTS.vegetables,
    ...STANDARD_INGREDIENTS.fruits,
    ...STANDARD_INGREDIENTS.meats,
    ...STANDARD_INGREDIENTS.dairy,
    ...STANDARD_INGREDIENTS.grains,
    ...STANDARD_INGREDIENTS.herbs,
    ...STANDARD_INGREDIENTS.other,
  ])
);

// Known brand names to remove from product names
export const BRAND_NAMES = [
  'jumbo',
  'ah',
  'albert heijn',
  'plus',
  'coop',
  'lidl',
  'aldi',
  'ekoplaza',
  'marqt',
  'vomar',
  'hoogvliet',
  'deka',
  'spar',
  'appie',
  'bio',
  'biologisch',
  'organic',
  'organic',
];

// Exclusion keywords for filtering products
export const EXCLUSION_KEYWORDS = [
  'pringles',
  'lays',
  'doritos',
  'chips',
  'crisps',
  'snack',
  'sauce',
  'dressing',
  'soda',
  'cola',
  'candy',
  'snoep',
  'koek',
  'biscuit',
  'chocolade',
  'reep',
  'frisdrank',
  'limonade',
];

// Open Food Facts category mappings
export const CATEGORY_MAPPINGS: Record<string, readonly string[]> = {
  'en:vegetables': STANDARD_INGREDIENTS.vegetables,
  'en:fruits': STANDARD_INGREDIENTS.fruits,
  'en:meats': STANDARD_INGREDIENTS.meats,
  'en:fish': ['zalm', 'tonijn', 'kabeljauw', 'garnalen', 'mosselen'] as const,
  'en:dairy': STANDARD_INGREDIENTS.dairy,
  'en:grains': STANDARD_INGREDIENTS.grains,
  'en:spices': STANDARD_INGREDIENTS.herbs,
  'en:herbs': STANDARD_INGREDIENTS.herbs,
};

// Exclusion categories
export const EXCLUSION_CATEGORIES = [
  'en:snacks',
  'en:chips',
  'en:sodas',
  'en:candies',
  'en:sauces',
  'en:dressings',
  'en:soft-drinks',
  'en:sweetened-beverages',
  'en:chocolate',
  'en:biscuits',
  'en:cookies',
];

// Inclusion categories (preferred)
export const INCLUSION_CATEGORIES = [
  'en:vegetables',
  'en:fruits',
  'en:meats',
  'en:fish',
  'en:dairy',
  'en:grains',
  'en:spices',
  'en:herbs',
  'en:eggs',
  'en:bread',
  'en:pasta',
  'en:rice',
];
