/**
 * Vocabulary data store — the names of things a 5-year-old sees around them,
 * grouped by category, each paired with an emoji that carries the meaning for
 * pre-readers. This is the shared "word bank" games can draw from (Say It!, Feed
 * the Monster, picture-word rounds, a future "name it" game) so a child learns
 * to name the real world: animals and fruits, but also a comb, an iPad and a
 * game controller.
 *
 * Conventions:
 * - `word` is uppercase and human-facing (spaces allowed, e.g. "ICE CREAM",
 *   "PS5 CONTROLLER"). For a keyboard-typing game, filter with {@link typeableWords}.
 * - Every item has exactly one emoji. Where no perfect emoji exists we pick the
 *   closest recognisable one (e.g. a tablet for IPAD).
 * - Categories are broad "things I see" buckets, not a strict taxonomy.
 */

/** A single vocabulary entry: the word to learn and a picture for its meaning. */
export interface VocabItem {
  /** Uppercase, human-facing name (spaces allowed). */
  word: string;
  /** Emoji that carries the meaning for a pre-reader. */
  emoji: string;
  /** Which category bucket it belongs to. */
  category: VocabCategoryId;
}

/** The category buckets, each shown to kids as an emoji + short label. */
export type VocabCategoryId =
  | 'animals'
  | 'birds'
  | 'sea-animals'
  | 'bugs'
  | 'fruits'
  | 'vegetables'
  | 'dinosaurs'
  | 'air-vehicles'
  | 'land-vehicles'
  | 'water-vehicles'
  | 'body'
  | 'clothes'
  | 'household'
  | 'kitchen'
  | 'food'
  | 'electronics'
  | 'school'
  | 'toys'
  | 'instruments'
  | 'nature'
  | 'weather'
  | 'places'
  | 'sports'
  | 'people';

export interface VocabCategory {
  id: VocabCategoryId;
  /** Short kid-facing label. */
  label: string;
  /** A representative emoji for the whole category. */
  emoji: string;
}

/** Turn `[word, emoji]` pairs into tagged {@link VocabItem}s (keeps the data terse). */
function cat(
  category: VocabCategoryId,
  pairs: readonly (readonly [string, string])[],
): VocabItem[] {
  return pairs.map(([word, emoji]) => ({ word, emoji, category }));
}

const ANIMALS = cat('animals', [
  ['DOG', '🐶'], ['CAT', '🐱'], ['COW', '🐮'], ['HORSE', '🐴'], ['PIG', '🐷'],
  ['SHEEP', '🐑'], ['GOAT', '🐐'], ['RABBIT', '🐰'], ['LION', '🦁'], ['TIGER', '🐯'],
  ['LEOPARD', '🐆'], ['ELEPHANT', '🐘'], ['GIRAFFE', '🦒'], ['ZEBRA', '🦓'], ['MONKEY', '🐵'],
  ['GORILLA', '🦍'], ['BEAR', '🐻'], ['PANDA', '🐼'], ['KOALA', '🐨'], ['FOX', '🦊'],
  ['WOLF', '🐺'], ['DEER', '🦌'], ['KANGAROO', '🦘'], ['CAMEL', '🐫'], ['HIPPO', '🦛'],
  ['RHINO', '🦏'], ['SLOTH', '🦥'], ['OTTER', '🦦'], ['HEDGEHOG', '🦔'], ['SQUIRREL', '🐿️'],
  ['MOUSE', '🐭'], ['HAMSTER', '🐹'], ['BAT', '🦇'], ['RACCOON', '🦝'], ['SKUNK', '🦨'],
]);

const BIRDS = cat('birds', [
  ['CHICKEN', '🐔'], ['ROOSTER', '🐓'], ['CHICK', '🐤'], ['DUCK', '🦆'], ['GOOSE', '🪿'],
  ['TURKEY', '🦃'], ['OWL', '🦉'], ['EAGLE', '🦅'], ['PARROT', '🦜'], ['PENGUIN', '🐧'],
  ['SWAN', '🦢'], ['FLAMINGO', '🦩'], ['PEACOCK', '🦚'], ['DOVE', '🕊️'],
]);

const SEA_ANIMALS = cat('sea-animals', [
  ['FISH', '🐟'], ['TROPICAL FISH', '🐠'], ['PUFFERFISH', '🐡'], ['SHARK', '🦈'], ['WHALE', '🐳'],
  ['DOLPHIN', '🐬'], ['OCTOPUS', '🐙'], ['SQUID', '🦑'], ['CRAB', '🦀'], ['LOBSTER', '🦞'],
  ['SHRIMP', '🦐'], ['SEAL', '🦭'], ['TURTLE', '🐢'], ['JELLYFISH', '🪼'], ['SHELL', '🐚'],
  ['CORAL', '🪸'],
]);

const BUGS = cat('bugs', [
  ['BEE', '🐝'], ['ANT', '🐜'], ['BUTTERFLY', '🦋'], ['LADYBUG', '🐞'], ['SPIDER', '🕷️'],
  ['CATERPILLAR', '🐛'], ['SNAIL', '🐌'], ['MOSQUITO', '🦟'], ['CRICKET', '🦗'], ['FLY', '🪰'],
  ['WORM', '🪱'], ['BEETLE', '🪲'], ['COCKROACH', '🪳'], ['SCORPION', '🦂'],
]);

const FRUITS = cat('fruits', [
  ['APPLE', '🍎'], ['GREEN APPLE', '🍏'], ['BANANA', '🍌'], ['GRAPES', '🍇'], ['ORANGE', '🍊'],
  ['STRAWBERRY', '🍓'], ['WATERMELON', '🍉'], ['PINEAPPLE', '🍍'], ['MANGO', '🥭'], ['PEACH', '🍑'],
  ['CHERRIES', '🍒'], ['LEMON', '🍋'], ['PEAR', '🍐'], ['KIWI', '🥝'], ['COCONUT', '🥥'],
  ['MELON', '🍈'], ['BLUEBERRIES', '🫐'], ['AVOCADO', '🥑'],
]);

const VEGETABLES = cat('vegetables', [
  ['CARROT', '🥕'], ['BROCCOLI', '🥦'], ['CORN', '🌽'], ['POTATO', '🥔'], ['TOMATO', '🍅'],
  ['CUCUMBER', '🥒'], ['ONION', '🧅'], ['GARLIC', '🧄'], ['PEPPER', '🫑'], ['CHILLI', '🌶️'],
  ['MUSHROOM', '🍄'], ['EGGPLANT', '🍆'], ['LETTUCE', '🥬'], ['PEAS', '🫛'], ['BEANS', '🫘'],
  ['GINGER', '🫚'], ['SWEET POTATO', '🍠'], ['PEANUT', '🥜'],
]);

const DINOSAURS = cat('dinosaurs', [
  ['DINOSAUR', '🦕'], ['T-REX', '🦖'], ['RAPTOR', '🦖'], ['TRICERATOPS', '🦕'],
  ['STEGOSAURUS', '🦕'], ['BRONTOSAURUS', '🦕'], ['PTERODACTYL', '🦖'], ['SPINOSAURUS', '🦖'],
]);

const AIR_VEHICLES = cat('air-vehicles', [
  ['PLANE', '✈️'], ['SMALL PLANE', '🛩️'], ['HELICOPTER', '🚁'], ['ROCKET', '🚀'],
  ['FLYING SAUCER', '🛸'], ['PARACHUTE', '🪂'], ['HOT AIR BALLOON', '🎈'], ['KITE', '🪁'],
  ['SATELLITE', '🛰️'],
]);

const LAND_VEHICLES = cat('land-vehicles', [
  ['CAR', '🚗'], ['TAXI', '🚕'], ['BUS', '🚌'], ['TRUCK', '🚚'], ['BIG TRUCK', '🚛'],
  ['TRACTOR', '🚜'], ['RACE CAR', '🏎️'], ['MOTORBIKE', '🏍️'], ['BICYCLE', '🚲'], ['SCOOTER', '🛵'],
  ['KICK SCOOTER', '🛴'], ['POLICE CAR', '🚓'], ['AMBULANCE', '🚑'], ['FIRE TRUCK', '🚒'], ['TRAIN', '🚆'],
  ['TRAM', '🚊'], ['VAN', '🚐'], ['JEEP', '🚙'],
]);

const WATER_VEHICLES = cat('water-vehicles', [
  ['SAILBOAT', '⛵'], ['SHIP', '🚢'], ['SPEEDBOAT', '🚤'], ['FERRY', '⛴️'], ['CANOE', '🛶'],
  ['MOTORBOAT', '🛥️'], ['ANCHOR', '⚓'],
]);

const BODY = cat('body', [
  ['EYE', '👁️'], ['EYES', '👀'], ['EAR', '👂'], ['NOSE', '👃'], ['MOUTH', '👄'],
  ['TOOTH', '🦷'], ['TONGUE', '👅'], ['HAND', '✋'], ['FOOT', '🦶'], ['LEG', '🦵'],
  ['ARM', '💪'], ['BRAIN', '🧠'], ['HEART', '🫀'], ['LUNGS', '🫁'], ['BONE', '🦴'],
]);

const CLOTHES = cat('clothes', [
  ['TSHIRT', '👕'], ['JEANS', '👖'], ['DRESS', '👗'], ['SHOE', '👟'], ['BOOT', '🥾'],
  ['SANDAL', '🩴'], ['SOCKS', '🧦'], ['GLOVES', '🧤'], ['SCARF', '🧣'], ['COAT', '🧥'],
  ['HAT', '🎩'], ['CAP', '🧢'], ['CROWN', '👑'], ['SHORTS', '🩳'], ['SWIMSUIT', '🩱'],
  ['GLASSES', '👓'], ['SUNGLASSES', '🕶️'], ['RING', '💍'], ['WATCH', '⌚'], ['NECKTIE', '👔'],
  ['PURSE', '👛'], ['HANDBAG', '👜'], ['BACKPACK', '🎒'], ['UMBRELLA', '☂️'],
]);

const HOUSEHOLD = cat('household', [
  ['COMB', '🪮'], ['CHAIR', '🪑'], ['BED', '🛏️'], ['COUCH', '🛋️'], ['DOOR', '🚪'],
  ['WINDOW', '🪟'], ['MIRROR', '🪞'], ['LAMP', '💡'], ['CANDLE', '🕯️'], ['CLOCK', '🕐'],
  ['ALARM CLOCK', '⏰'], ['BROOM', '🧹'], ['BASKET', '🧺'], ['BUCKET', '🪣'], ['SOAP', '🧼'],
  ['SPONGE', '🧽'], ['TOOTHBRUSH', '🪥'], ['TOILET PAPER', '🧻'], ['TOILET', '🚽'], ['BATHTUB', '🛁'],
  ['SHOWER', '🚿'], ['KEY', '🔑'], ['LOCK', '🔒'], ['SCISSORS', '✂️'], ['THREAD', '🧵'],
  ['NEEDLE', '🪡'], ['PIN', '📌'], ['HAMMER', '🔨'], ['WRENCH', '🔧'], ['SCREWDRIVER', '🪛'],
  ['SAW', '🪚'], ['AXE', '🪓'], ['LADDER', '🪜'], ['MAGNET', '🧲'], ['FLASHLIGHT', '🔦'],
  ['BATTERY', '🔋'], ['PLUG', '🔌'], ['THERMOMETER', '🌡️'],
]);

const KITCHEN = cat('kitchen', [
  ['SPOON', '🥄'], ['FORK', '🍴'], ['KNIFE', '🔪'], ['PLATE', '🍽️'], ['CUP', '☕'],
  ['GLASS', '🥛'], ['BOTTLE', '🍼'], ['POT', '🍲'], ['FRYING PAN', '🍳'], ['TEAPOT', '🫖'],
  ['BOWL', '🥣'], ['SALT', '🧂'], ['JAR', '🫙'], ['CAN', '🥫'],
]);

const FOOD = cat('food', [
  ['BREAD', '🍞'], ['BAGUETTE', '🥖'], ['CROISSANT', '🥐'], ['EGG', '🥚'], ['CHEESE', '🧀'],
  ['CAKE', '🍰'], ['BIRTHDAY CAKE', '🎂'], ['CUPCAKE', '🧁'], ['COOKIE', '🍪'], ['PIE', '🥧'],
  ['PIZZA', '🍕'], ['BURGER', '🍔'], ['HOTDOG', '🌭'], ['FRIES', '🍟'], ['SANDWICH', '🥪'],
  ['TACO', '🌮'], ['ICE CREAM', '🍦'], ['DONUT', '🍩'], ['CANDY', '🍬'], ['CHOCOLATE', '🍫'],
  ['LOLLIPOP', '🍭'], ['POPCORN', '🍿'], ['PANCAKES', '🥞'], ['WAFFLE', '🧇'], ['NOODLES', '🍜'],
  ['SPAGHETTI', '🍝'], ['RICE', '🍚'], ['SOUP', '🍲'], ['HONEY', '🍯'], ['MILK', '🥛'],
  ['JUICE', '🧃'], ['WATER', '💧'], ['TEA', '🍵'], ['PRETZEL', '🥨'], ['SUSHI', '🍣'],
  ['DUMPLING', '🥟'],
]);

const ELECTRONICS = cat('electronics', [
  ['PHONE', '📱'], ['IPAD', '📱'], ['LAPTOP', '💻'], ['COMPUTER', '🖥️'], ['KEYBOARD', '⌨️'],
  ['MOUSE', '🖱️'], ['PRINTER', '🖨️'], ['TV', '📺'], ['CAMERA', '📷'], ['VIDEO CAMERA', '📹'],
  ['HEADPHONES', '🎧'], ['RADIO', '📻'], ['PS5 CONTROLLER', '🎮'], ['JOYSTICK', '🕹️'], ['SPEAKER', '🔊'],
  ['MICROPHONE', '🎤'], ['SMARTWATCH', '⌚'], ['CALCULATOR', '🧮'], ['CD', '💿'], ['FLOPPY DISK', '💾'],
  ['CHARGER', '🔌'], ['PROJECTOR', '📽️'], ['SATELLITE DISH', '📡'],
]);

const SCHOOL = cat('school', [
  ['PENCIL', '✏️'], ['PEN', '🖊️'], ['FOUNTAIN PEN', '🖋️'], ['CRAYON', '🖍️'], ['PAINTBRUSH', '🖌️'],
  ['BOOK', '📖'], ['BOOKS', '📚'], ['NOTEBOOK', '📓'], ['NOTE', '📝'], ['RULER', '📏'],
  ['TRIANGLE RULER', '📐'], ['PAPER', '📄'], ['SCROLL', '📜'], ['PAPERCLIP', '📎'], ['BACKPACK', '🎒'],
  ['GLOBE', '🌍'], ['ABACUS', '🧮'], ['CALENDAR', '📅'], ['CLIPBOARD', '📋'], ['PALETTE', '🎨'],
  ['GRADUATION CAP', '🎓'],
]);

const TOYS = cat('toys', [
  ['BALL', '⚽'], ['TEDDY BEAR', '🧸'], ['BALLOON', '🎈'], ['KITE', '🪁'], ['BLOCKS', '🧱'],
  ['PUZZLE', '🧩'], ['DICE', '🎲'], ['YOYO', '🪀'], ['DOLL', '🪆'], ['ROBOT', '🤖'],
  ['TOY CAR', '🚗'], ['RUBBER DUCK', '🦆'], ['SLIDE', '🛝'], ['FRISBEE', '🥏'],
]);

const INSTRUMENTS = cat('instruments', [
  ['DRUM', '🥁'], ['GUITAR', '🎸'], ['PIANO', '🎹'], ['TRUMPET', '🎺'], ['VIOLIN', '🎻'],
  ['SAXOPHONE', '🎷'], ['MARACAS', '🪇'], ['ACCORDION', '🪗'], ['BANJO', '🪕'], ['FLUTE', '🪈'],
  ['BELL', '🔔'], ['MICROPHONE', '🎤'],
]);

const NATURE = cat('nature', [
  ['TREE', '🌳'], ['PINE TREE', '🌲'], ['PALM TREE', '🌴'], ['FLOWER', '🌸'], ['ROSE', '🌹'],
  ['SUNFLOWER', '🌻'], ['TULIP', '🌷'], ['CACTUS', '🌵'], ['CLOVER', '🍀'], ['LEAF', '🍃'],
  ['MAPLE LEAF', '🍁'], ['SEEDLING', '🌱'], ['SUN', '☀️'], ['MOON', '🌙'], ['STAR', '⭐'],
  ['CLOUD', '☁️'], ['RAINBOW', '🌈'], ['SNOWFLAKE', '❄️'], ['FIRE', '🔥'], ['MOUNTAIN', '⛰️'],
  ['VOLCANO', '🌋'], ['ROCK', '🪨'], ['WOOD', '🪵'], ['EARTH', '🌍'], ['WAVE', '🌊'],
  ['SNOWMAN', '⛄'],
]);

const WEATHER = cat('weather', [
  ['SUNNY', '☀️'], ['PARTLY CLOUDY', '⛅'], ['CLOUDY', '☁️'], ['RAINY', '🌧️'], ['STORMY', '⛈️'],
  ['SNOWY', '🌨️'], ['WINDY', '🌬️'], ['TORNADO', '🌪️'], ['FOGGY', '🌫️'], ['RAINBOW', '🌈'],
  ['LIGHTNING', '⚡'], ['UMBRELLA', '☔'],
]);

const PLACES = cat('places', [
  ['HOUSE', '🏠'], ['SCHOOL', '🏫'], ['OFFICE', '🏢'], ['HOSPITAL', '🏥'], ['BANK', '🏦'],
  ['HOTEL', '🏨'], ['STORE', '🏪'], ['FACTORY', '🏭'], ['CASTLE', '🏰'], ['CHURCH', '⛪'],
  ['TENT', '⛺'], ['STADIUM', '🏟️'], ['BRIDGE', '🌉'], ['FOUNTAIN', '⛲'], ['FERRIS WHEEL', '🎡'],
  ['ROLLER COASTER', '🎢'], ['CIRCUS', '🎪'],
]);

const SPORTS = cat('sports', [
  ['SOCCER', '⚽'], ['BASKETBALL', '🏀'], ['FOOTBALL', '🏈'], ['BASEBALL', '⚾'], ['TENNIS', '🎾'],
  ['VOLLEYBALL', '🏐'], ['RUGBY', '🏉'], ['BOWLING', '🎳'], ['GOLF', '⛳'], ['PING PONG', '🏓'],
  ['BADMINTON', '🏸'], ['HOCKEY', '🏒'], ['CRICKET', '🏏'], ['BOXING', '🥊'], ['SKATING', '⛸️'],
  ['SKIING', '🎿'], ['DARTS', '🎯'], ['FISHING', '🎣'], ['TROPHY', '🏆'], ['MEDAL', '🏅'],
]);

const PEOPLE = cat('people', [
  ['BABY', '👶'], ['CHILD', '🧒'], ['BOY', '👦'], ['GIRL', '👧'], ['MAN', '👨'],
  ['WOMAN', '👩'], ['GRANDPA', '👴'], ['GRANDMA', '👵'], ['POLICE', '👮'], ['BUILDER', '👷'],
  ['GUARD', '💂'], ['DOCTOR', '🧑‍⚕️'], ['FARMER', '🧑‍🌾'], ['COOK', '🧑‍🍳'], ['FIREFIGHTER', '🧑‍🚒'],
  ['PILOT', '🧑‍✈️'], ['ASTRONAUT', '🧑‍🚀'], ['TEACHER', '🧑‍🏫'], ['KING', '🤴'], ['QUEEN', '👸'],
  ['SUPERHERO', '🦸'], ['SANTA', '🎅'],
]);

/** Category buckets in the order they should be shown to kids. */
export const VOCAB_CATEGORIES: readonly VocabCategory[] = [
  { id: 'animals', label: 'Animals', emoji: '🦁' },
  { id: 'birds', label: 'Birds', emoji: '🦜' },
  { id: 'sea-animals', label: 'Sea Animals', emoji: '🐳' },
  { id: 'bugs', label: 'Bugs', emoji: '🐝' },
  { id: 'fruits', label: 'Fruits', emoji: '🍎' },
  { id: 'vegetables', label: 'Vegetables', emoji: '🥕' },
  { id: 'dinosaurs', label: 'Dinosaurs', emoji: '🦕' },
  { id: 'air-vehicles', label: 'Things That Fly', emoji: '✈️' },
  { id: 'land-vehicles', label: 'Things That Drive', emoji: '🚗' },
  { id: 'water-vehicles', label: 'Things That Float', emoji: '⛵' },
  { id: 'body', label: 'My Body', emoji: '👀' },
  { id: 'clothes', label: 'Clothes', emoji: '👕' },
  { id: 'household', label: 'Around the House', emoji: '🪮' },
  { id: 'kitchen', label: 'In the Kitchen', emoji: '🍴' },
  { id: 'food', label: 'Yummy Food', emoji: '🍕' },
  { id: 'electronics', label: 'Gadgets', emoji: '📱' },
  { id: 'school', label: 'School Things', emoji: '✏️' },
  { id: 'toys', label: 'Toys', emoji: '🧸' },
  { id: 'instruments', label: 'Music', emoji: '🎸' },
  { id: 'nature', label: 'Outside', emoji: '🌳' },
  { id: 'weather', label: 'Weather', emoji: '🌈' },
  { id: 'places', label: 'Places', emoji: '🏠' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'people', label: 'People', emoji: '👨‍👩‍👧' },
];

/** Every vocabulary item, grouped by category (declaration order preserved). */
export const VOCAB_BY_CATEGORY: Record<VocabCategoryId, readonly VocabItem[]> = {
  animals: ANIMALS,
  birds: BIRDS,
  'sea-animals': SEA_ANIMALS,
  bugs: BUGS,
  fruits: FRUITS,
  vegetables: VEGETABLES,
  dinosaurs: DINOSAURS,
  'air-vehicles': AIR_VEHICLES,
  'land-vehicles': LAND_VEHICLES,
  'water-vehicles': WATER_VEHICLES,
  body: BODY,
  clothes: CLOTHES,
  household: HOUSEHOLD,
  kitchen: KITCHEN,
  food: FOOD,
  electronics: ELECTRONICS,
  school: SCHOOL,
  toys: TOYS,
  instruments: INSTRUMENTS,
  nature: NATURE,
  weather: WEATHER,
  places: PLACES,
  sports: SPORTS,
  people: PEOPLE,
};

/** One flat list of every vocabulary item across all categories. */
export const VOCAB: readonly VocabItem[] = VOCAB_CATEGORIES.flatMap(
  (c) => VOCAB_BY_CATEGORY[c.id],
);

/** All items in a category (empty array for an unknown id). */
export function vocabByCategory(id: VocabCategoryId): readonly VocabItem[] {
  return VOCAB_BY_CATEGORY[id] ?? [];
}

/**
 * Items whose word is a single run of A–Z letters (no spaces, digits or
 * punctuation) — safe for a keyboard-typing game where every character is one
 * keypress. Drops multi-word names like "ICE CREAM" and "PS5 CONTROLLER".
 */
export function typeableWords(items: readonly VocabItem[] = VOCAB): VocabItem[] {
  return items.filter((it) => /^[A-Z]+$/.test(it.word));
}
