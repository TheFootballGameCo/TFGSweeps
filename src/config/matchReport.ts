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
  /** e.g. "Gameweek 2" */
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
    id: '2026-09-04-gw2',
    label: 'Gameweek 2',
    publishedAt: '2026-09-04',
    coversFrom: '2026-08-26',
    coversTo: '2026-09-03',
    intro: [
      'Gameweek 2 belonged to one man, and unfortunately for the group chat it was Jamie. City put four past Palace at Selhurst Park, Chelsea and Brighton played out a 4-3 that no defender should be shown, Hull won again, and by Sunday night Jamie had banked thirteen points in a single week. That is not a gameweek, that is a heist.',
      'The table turned upside down accordingly. Jamie goes third to first on 19. Sam, top after the opening weekend, collected exactly one point from five clubs and slides to third. Simon treads water in second with two draws and a Spurs performance best described as a no-show. Jack stays bottom but actually had the second best week of anyone, eight points, which tells you everything about how the first weekend went.',
      'Scorer watch: Haaland ended his one-week silence with two at Palace, Isak got off the mark in the Forest draw, and the only other scoring of note involved goalkeepers and own goals. Donnarumma putting through his own net gifted Palace their consolation, and João Pedro managed to score for Chelsea and for Brighton in the same match. Igor Thiago and Bryan Mbeumo remain on zero.',
    ],
    players: [
      {
        player: 'Jamie',
        heading: 'Thirteen points and counting',
        body: 'The week of the season so far. City dismantled Palace 4-1, Chelsea finally started their campaign and immediately won a 4-3 lunacy against Brighton, Hull made it two clean-sheet wins from two at Coventry, and even the draws pulled their weight, Forest nicking a point at Anfield of all places. Add a Haaland brace and Jamie went from mid-table to top by five clear points. If Hull turn out to be good, the other three are playing for second.',
      },
      {
        player: 'Simon',
        heading: 'Second place, hiding behind the sofa',
        body: 'Two points from the week, both draws, both from the dependable end of the portfolio in Everton and Leeds. The other end is becoming a problem. Spurs lost 2-0 at home to Newcastle and have now finished two games without a shot worth remembering, and United and Ipswich did not even play, their game still to be rearranged. Mbeumo cannot score for a team that is not on the pitch. Second place, but held together with tape.',
      },
      {
        player: 'Sam',
        heading: 'From top to third in five easy losses',
        body: 'One point. That is the week. Brighton led the charge downhill by turning a four-goal opening weekend into a 4-3 defeat at Chelsea, Palace were battered 4-1 by City, Fulham lost their opener at Sunderland, and Brentford at least salvaged a draw at Leeds. Arsenal did not play, which was somehow the best result of Sam’s week. Meanwhile Kevin Schade joined the list of Brentford scorers who are not Igor Thiago. The pick is now four goals behind the club he plays for.',
      },
      {
        player: 'Jack',
        heading: 'Eight points and still bottom',
        body: 'The best week Jack could realistically have had, and the table barely noticed. Newcastle went to Spurs and won 2-0, Sunderland ground out a 1-0 over Fulham, Liverpool drew again, this time 2-2 with Forest, and Isak finally scored. The problem children remain the same: Coventry lost 1-0 at home to Hull and are still pointless and goalless, and Villa spent the week doing nothing about their minus four. Bottom on goal difference, one point off second. Fine margins, terrible optics.',
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
  {
    id: '2026-08-26-gw1',
    label: 'Gameweek 1',
    publishedAt: '2026-08-26',
    coversFrom: '2026-08-21',
    coversTo: '2026-08-25',
    intro: [
      'The sweepstake is up and running, and opening weekend wasted no time embarrassing people. Hull City beat Manchester United 2-0 on the very first night, Brighton put four past a shellshocked Villa, and Brentford swatted Spurs 3-0. Chelsea against Fulham was postponed, so Sam and Jamie each start a game light.',
      'First table of the season: Sam and Simon are level on nine points, with Sam top on goal difference thanks to Arsenal, Brentford and Brighton all winning without conceding. Jamie sits third on six, propped up by City and, remarkably, Hull. Jack brings up the rear with two points from five clubs and not a single win, both points coming from the Newcastle and Liverpool 2-2 at St James’ Park, a result that at least only wounded him internally.',
      'Scorer watch: nothing. Not one of the four picks scored. Haaland watched Guehi and Gvardiol do the scoring for City, Isak’s afternoon ended all square, and Mbeumo had the distinct disadvantage of playing for a United side that lost to Hull. A clean slate all round, which is the politest available description.',
    ],
    players: [
      {
        player: 'Sam',
        heading: 'Top of the first table',
        body: 'Three wins from four and top spot on goal difference. Arsenal rolled Coventry 3-0, Brentford embarrassed Spurs, and Brighton produced the weekend’s statement result, 4-0 over Villa with Hinshelwood scoring twice. The blemish was Palace losing 2-0 at Everton, and the Fulham postponement means a game in hand. The only cloud: four Brentford players got on the scoresheet across the weekend’s action and none of them were Igor Thiago.',
      },
      {
        player: 'Simon',
        heading: 'Nine points, one humiliation',
        body: 'Everton, Leeds and Ipswich all won, which is the sensible-portfolio dream start. But nobody is talking about that, because Manchester United lost 2-0 to newly promoted Hull on the opening Friday and Spurs followed it up by losing 3-0 at Brentford. Six points’ worth of big clubs produced nothing, zero goals between them, and Mbeumo touched the ball roughly as often as Simon did. Second on goal difference, first in embarrassment.',
      },
      {
        player: 'Jamie',
        heading: 'Carried by the club nobody wanted',
        body: 'Six points, and here is the fun part: half of them came from Hull City. The promoted side everyone had pencilled in for 20th beat Manchester United 2-0 without breaking sweat, and City did the expected against Bournemouth even if it needed defenders to score it, Guehi and Gvardiol of all people. Forest and Bournemouth both lost, Chelsea did not play. Haaland blanked, which Jamie will be assured is temporary.',
      },
      {
        player: 'Jack',
        heading: 'Two points, no wins, deep breaths',
        body: 'Five clubs, zero wins. Villa were dismantled 4-0 at Brighton, Coventry were beaten comfortably at Arsenal, and Sunderland let a lead slip to lose 2-1 at Ipswich. The two points came from Newcastle 2-2 Liverpool, the one fixture where Jack could not lose and, equally, could not win. Isak drew a blank on top. It is one gameweek, the sample size is tiny, and every one of these sentences will be needed for comfort if this continues.',
      },
    ],
    snapshot: {
      clubRecords: {
        '364': { w: 0, d: 1, l: 0 },
        '362': { w: 0, d: 0, l: 1 },
        '366': { w: 0, d: 0, l: 1 },
        '361': { w: 0, d: 1, l: 0 },
        '388': { w: 0, d: 0, l: 1 },
        '359': { w: 1, d: 0, l: 0 },
        '337': { w: 1, d: 0, l: 0 },
        '331': { w: 1, d: 0, l: 0 },
        '384': { w: 0, d: 0, l: 1 },
        '370': { w: 0, d: 0, l: 0 },
        '382': { w: 1, d: 0, l: 0 },
        '363': { w: 0, d: 0, l: 0 },
        '349': { w: 0, d: 0, l: 1 },
        '393': { w: 0, d: 0, l: 1 },
        '306': { w: 1, d: 0, l: 0 },
        '360': { w: 0, d: 0, l: 1 },
        '367': { w: 0, d: 0, l: 1 },
        '368': { w: 1, d: 0, l: 0 },
        '357': { w: 1, d: 0, l: 0 },
        '373': { w: 1, d: 0, l: 0 },
      },
      scorerGoals: { Jack: 0, Sam: 0, Jamie: 0, Simon: 0 },
      standings: {
        Sam: { points: 9, position: 1 },
        Simon: { points: 9, position: 2 },
        Jamie: { points: 6, position: 3 },
        Jack: { points: 2, position: 4 },
      },
    },
  },
];
