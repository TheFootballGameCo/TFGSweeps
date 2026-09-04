// ---------------------------------------------------------------------------
// The Match Report — the weekly AI write-up shown under the leaderboard.
//
// HOW IT UPDATES: run the "tfg-match-report" skill in Cowork each week.
// It reads the latest report's `coversTo` date, gathers every result since
// (so missed weeks are automatically covered in one catch-up report), writes
// a new entry at the TOP of MATCH_REPORTS, and commits. Then push in GitHub
// Desktop. The `snapshot` block is bookkeeping for the skill, not the UI.
// ---------------------------------------------------------------------------

import type { PlayerName } from './sweepstake';

export interface PlayerReportEntry {
  player: PlayerName;
  /** Short punchy strapline, e.g. "Top of the pile". */
  heading: string;
  body: string;
}

export interface MatchReport {
  id: string;
  /** e.g. "Gameweeks 1–2" */
  label: string;
  publishedAt: string; // ISO date
  coversFrom: string; // ISO date
  coversTo: string; // ISO date
  /** The week's review: what happened, movers, scorer watch. */
  intro: string[];
  players: PlayerReportEntry[];
  /** Cumulative stats at time of writing — used by the skill for the next window. */
  snapshot: {
    clubRecords: Record<string, { w: number; d: number; l: number }>;
    scorerGoals: Record<PlayerName, number>;
    standings: Record<PlayerName, { points: number; position: number }>;
  };
}

/** Newest first. The UI shows the top entry expanded. */
export const MATCH_REPORTS: MatchReport[] = [
  {
    id: '2026-09-04',
    label: 'Gameweeks 1–2',
    publishedAt: '2026-09-04',
    coversFrom: '2026-08-21',
    coversTo: '2026-09-03',
    intro: [
      'Two gameweeks in and the sweepstake already has a villain, and it wears black and amber. Hull City, everyone\'s pick for a long hard winter, have won both games without conceding, including a 2-0 dismantling of Manchester United on opening night. Elsewhere Brighton put four past Villa, Chelsea and Brighton traded seven goals in a game of utter nonsense, and Spurs have played twice without troubling a single scoresheet.',
      'In the actual competition: Jamie tops the table on 19 points and it is not close. Simon clings to second largely thanks to his least glamorous clubs. Sam sits third with the best one-club highlight reel and the worst supporting cast, and Jack props up the table on goal difference, which will sting given two of his five clubs have been decent.',
      'Scorer watch: Haaland took one week off and then scored twice at Palace, so Jamie leads there too. Isak got off the mark at Anfield for Jack. Igor Thiago and Bryan Mbeumo are both on zero, though in fairness to Mbeumo, United have scored zero goals as a collective, so he is merely matching his surroundings.',
    ],
    players: [
      {
        player: 'Jamie',
        heading: 'Top of the pile, insufferable already',
        body: 'Five wins from nine games and 19 points. City have been ruthless, Chelsea won a 4-3 fever dream against Brighton, and even Bournemouth and Forest chipped in with draws. But let\'s be honest about what is carrying this: Hull City, six points from six, conquerors of Manchester United and Coventry. If the promoted club Jamie got lumbered with keeps this up, the other three should just post their £25 now. Haaland adding two at Palace is simply rude.',
      },
      {
        player: 'Simon',
        heading: 'Second, somehow',
        body: 'Eleven points, and every one of them earned by the sensible shoes of the portfolio: Everton, Leeds and Ipswich are unbeaten. Now the bad news. Manchester United and Tottenham have played three games between them, lost all three, and scored zero goals. United losing to Hull is the sweepstake\'s first proper humiliation, and Mbeumo cannot score goals his team refuses to create. Simon is second in the table while his two biggest clubs act like relegation candidates. That cannot last, one way or the other.',
      },
      {
        player: 'Sam',
        heading: 'One elite club, four passengers',
        body: 'Arsenal swatted Coventry 3-0 and look every bit the title favourites. Brentford have taken four points, and Brighton produced the result of the season so far in the 4-0 over Villa before handing it all back at Chelsea. Then there is the rest: Palace and Fulham have zero points between them. And a special word for the goalscorer pick, because Lewis-Potter, Janelt, Kayode and Schade have all scored for Brentford in the last fortnight. Igor Thiago has not. Sam picked the one Bee not buzzing.',
      },
      {
        player: 'Jack',
        heading: 'Bottom, and it took some doing',
        body: 'Level on points with Sam but last on goal difference, which is what happens when Villa lose 4-0 and Coventry ship four without scoring. Coventry and Villa: zero points, zero goals, minus eight between them. The rescue act came from the north east, Newcastle unbeaten and Sunderland winning ugly against Fulham. Liverpool have drawn twice, which is two points and also a mild concern. The one genuine bright spot: Isak is off the mark, so the admin is not completely humiliated. Yet.',
      },
    ],
    snapshot: {
      clubRecords: {
        '364': { w: 0, d: 2, l: 0 },
        '362': { w: 0, d: 0, l: 1 },
        '366': { w: 1, d: 0, l: 1 },
        '361': { w: 1, d: 1, l: 0 },
        '388': { w: 0, d: 0, l: 2 },
        '359': { w: 1, d: 0, l: 0 },
        '337': { w: 1, d: 1, l: 0 },
        '331': { w: 1, d: 0, l: 1 },
        '384': { w: 0, d: 0, l: 2 },
        '370': { w: 0, d: 0, l: 1 },
        '382': { w: 2, d: 0, l: 0 },
        '363': { w: 1, d: 0, l: 0 },
        '349': { w: 0, d: 1, l: 1 },
        '393': { w: 0, d: 1, l: 1 },
        '306': { w: 2, d: 0, l: 0 },
        '360': { w: 0, d: 0, l: 1 },
        '367': { w: 0, d: 0, l: 2 },
        '368': { w: 1, d: 1, l: 0 },
        '357': { w: 1, d: 1, l: 0 },
        '373': { w: 1, d: 0, l: 0 },
      },
      scorerGoals: { Jack: 1, Sam: 0, Jamie: 2, Simon: 0 },
      standings: {
        Jamie: { points: 19, position: 1 },
        Simon: { points: 11, position: 2 },
        Sam: { points: 10, position: 3 },
        Jack: { points: 10, position: 4 },
      },
    },
  },
];
