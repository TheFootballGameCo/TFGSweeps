// ---------------------------------------------------------------------------
// THE sweepstake config — the one file to edit.
// Private league: Jack, Sam, Jamie & Simon. 2026/27 Premier League season.
// Teams and scorers were drawn outside the app; they live here, baked in.
// ---------------------------------------------------------------------------

export const PLAYERS = ['Jack', 'Sam', 'Jamie', 'Simon'] as const;
export type PlayerName = (typeof PLAYERS)[number];

/**
 * The draw: ESPN club id -> owner.
 * Jack:  Liverpool, Aston Villa, Sunderland, Newcastle, Coventry
 * Sam:   Arsenal, Brentford, Brighton, Crystal Palace, Fulham
 * Jamie: Man City, Chelsea, Bournemouth, Nottm Forest, Hull
 * Simon: Man United, Tottenham, Everton, Leeds, Ipswich
 */
export const OWNERSHIP: Record<string, PlayerName> = {
  // Jack
  '364': 'Jack', // Liverpool
  '362': 'Jack', // Aston Villa
  '366': 'Jack', // Sunderland
  '361': 'Jack', // Newcastle United
  '388': 'Jack', // Coventry City
  // Sam
  '359': 'Sam', // Arsenal
  '337': 'Sam', // Brentford
  '331': 'Sam', // Brighton
  '384': 'Sam', // Crystal Palace
  '370': 'Sam', // Fulham
  // Jamie
  '382': 'Jamie', // Man City
  '363': 'Jamie', // Chelsea
  '349': 'Jamie', // Bournemouth
  '393': 'Jamie', // Nottm Forest
  '306': 'Jamie', // Hull City
  // Simon
  '360': 'Simon', // Man United
  '367': 'Simon', // Tottenham
  '368': 'Simon', // Everton
  '357': 'Simon', // Leeds United
  '373': 'Simon', // Ipswich Town
};

/**
 * Goalscorer picks — WITH the one-change-per-season rule.
 *
 * Each player's array is their pick HISTORY (oldest first). To use a change,
 * append a new entry with `from` set to the date it takes effect:
 *
 *   Jack: [
 *     { name: 'Alexander Isak', aliases: ['isak'] },
 *     { name: 'Mohamed Salah', aliases: ['salah'], from: '2027-01-15' },
 *   ],
 *
 * Scoring: a pick earns points only for goals scored while it's active —
 * from its `from` date (or season start) until the next pick's `from` date.
 * Max one change each; after that the pick is final.
 */
export interface ScorerPickEntry {
  /** Display name. */
  name: string;
  /** Lower-cased substrings matched against ESPN's scorer names. */
  aliases: string[];
  /** ISO date (YYYY-MM-DD) the pick takes effect. Omit on the original pick. */
  from?: string;
}

export const SCORER_PICKS: Record<PlayerName, ScorerPickEntry[]> = {
  Jack: [{ name: 'Alexander Isak', aliases: ['isak'] }],
  Sam: [{ name: 'Igor Thiago', aliases: ['igor thiago', 'thiago'] }],
  Jamie: [{ name: 'Erling Haaland', aliases: ['haaland'] }],
  Simon: [{ name: 'Bryan Mbeumo', aliases: ['mbeumo'] }],
};

/** Max scorer changes per player per season. */
export const MAX_SCORER_CHANGES = 1;

/** The pot: £25 each, winner takes the lot. */
export const PRIZE = {
  currency: '£',
  stakePerPlayer: 25,
  pot: 100,
  label: 'Winner takes all',
} as const;

/** The scorer-change rule, shown on the Teams page. */
export const SCORER_RULE = [
  'Each player may change their nominated goalscorer once per season.',
  'From the moment of the change you earn points for goals by your new player and stop earning for the old one (goals already banked stay banked).',
  'You can switch to any player currently in one of your own clubs’ squads.',
  'No conditions — injury or transfer are natural times, but any reason is fine.',
  'Once your single change is used, your new goalscorer is locked for the rest of the season.',
] as const;
