// Simple test to debug GTO logic
const GTO_RANGES = {
  'MP': {
    'raise': ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AQo', 'AJs', 'ATs', 'A9s', 'A8s', 'A7s', 'KQs', 'KQo', 'KJs', 'KTs', 'K9s', 'QJs', 'QTs', 'Q9s', 'JTs', 'J9s', 'T9s', '98s', '87s', '76s', '65s', '54s'],
    'call': ['55', '44', '33', '22', 'A6s', 'A5s', 'A4s', 'A3s', 'A2s', 'K8s', 'K7s', 'K6s', 'K5s', 'Q8s', 'Q7s', 'Q6s', 'J8s', 'J7s', 'T8s', 'T7s', '97s', '96s', '86s', '85s', '75s', '74s', '64s', '53s', '43s'],
    'fold': ['K4s', 'K3s', 'K2s', 'Q5s', 'Q4s', 'Q3s', 'Q2s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s', 'T6s', 'T5s', 'T4s', 'T3s', 'T2s', '95s', '94s', '93s', '92s', '84s', '83s', '82s', '73s', '72s', '63s', '62s', '52s', '42s', '32s']
  }
};

const POSITION_MAP = {
  'early': 'UTG',
  'middle': 'MP', 
  'late': 'CO',
  'button': 'BTN',
  'small_blind': 'SB',
  'big_blind': 'BB'
};

// Test 65s from middle position
const testHand = ['6♠', '5♠'];
const position = 'middle';
const potSize = 3; // SB + BB
const betSize = 0;
const bigBlind = 2;
const smallBlind = 1;

// Convert hand to notation
const card1 = testHand[0];
const card2 = testHand[1];
const rank1 = card1.replace(/[♠♥♦♣]/g, '');
const rank2 = card2.replace(/[♠♥♦♣]/g, '');
const isSuited = card1.match(/[♠♥♦♣]/)[0] === card2.match(/[♠♥♦♣]/)[0];

const rank1Str = rank1 === '10' ? 'T' : rank1;
const rank2Str = rank2 === '10' ? 'T' : rank2;

const ranks = [rank1Str, rank2Str].sort((a, b) => {
  const values = { 'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10, '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2 };
  return values[b] - values[a];
});

const handNotation = ranks[0] + ranks[1] + (isSuited ? 's' : 'o');

console.log('=== GTO TEST DEBUG ===');
console.log('Hand:', testHand);
console.log('Hand notation:', handNotation);
console.log('Position:', position);
console.log('Mapped position:', POSITION_MAP[position]);

const gtoPosition = POSITION_MAP[position] || 'MP';
const ranges = GTO_RANGES[gtoPosition];

console.log('GTO Position:', gtoPosition);
console.log('In raise range:', ranges.raise.includes(handNotation));
console.log('In call range:', ranges.call.includes(handNotation));
console.log('In fold range:', ranges.fold.includes(handNotation));

// Action context
const blindsOnly = smallBlind + bigBlind;
const limpPot = blindsOnly + bigBlind;
const isOpening = potSize <= (blindsOnly + 1);
const isFacingLimp = potSize > (blindsOnly + 1) && potSize <= (limpPot + 2);
const isFacingRaise = potSize > (limpPot + 2);

console.log('Pot size:', potSize);
console.log('Blinds only:', blindsOnly);
console.log('Limp pot:', limpPot);
console.log('Is opening:', isOpening);
console.log('Is facing limp:', isFacingLimp);
console.log('Is facing raise:', isFacingRaise);

// Determine action
let action = 'fold';
let confidence = 85;
let reasoning = '';

if (isOpening) {
  if (ranges.raise.includes(handNotation)) {
    action = 'raise';
    confidence = 90;
    reasoning = `GTO: ${handNotation} is in the opening raising range from ${gtoPosition} position.`;
  } else if (ranges.call.includes(handNotation)) {
    action = 'call';
    confidence = 75;
    reasoning = `GTO: ${handNotation} is in the opening calling range from ${gtoPosition} position.`;
  } else {
    action = 'fold';
    confidence = 85;
    reasoning = `GTO: ${handNotation} is not in the opening range from ${gtoPosition} position.`;
  }
}

console.log('=== RESULT ===');
console.log('Action:', action);
console.log('Confidence:', confidence);
console.log('Reasoning:', reasoning); 