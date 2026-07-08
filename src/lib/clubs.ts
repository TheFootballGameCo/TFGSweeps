// Static Premier League club list (2025/26 season) with ESPN ids.
// Used as a fallback when the live table hasn't populated yet (e.g. before a
// new season kicks off) and as the base for demo mode.
import type { Club } from '../types';

const logo = (id: string) => `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;

export const FALLBACK_CLUBS: Club[] = [
  { id: '359', name: 'Arsenal', abbreviation: 'ARS', logo: logo('359') },
  { id: '362', name: 'Aston Villa', abbreviation: 'AVL', logo: logo('362') },
  { id: '349', name: 'Bournemouth', abbreviation: 'BOU', logo: logo('349') },
  { id: '337', name: 'Brentford', abbreviation: 'BRE', logo: logo('337') },
  { id: '331', name: 'Brighton', abbreviation: 'BHA', logo: logo('331') },
  { id: '379', name: 'Burnley', abbreviation: 'BUR', logo: logo('379') },
  { id: '363', name: 'Chelsea', abbreviation: 'CHE', logo: logo('363') },
  { id: '384', name: 'Crystal Palace', abbreviation: 'CRY', logo: logo('384') },
  { id: '368', name: 'Everton', abbreviation: 'EVE', logo: logo('368') },
  { id: '370', name: 'Fulham', abbreviation: 'FUL', logo: logo('370') },
  { id: '357', name: 'Leeds United', abbreviation: 'LEE', logo: logo('357') },
  { id: '364', name: 'Liverpool', abbreviation: 'LIV', logo: logo('364') },
  { id: '382', name: 'Man City', abbreviation: 'MNC', logo: logo('382') },
  { id: '360', name: 'Man United', abbreviation: 'MAN', logo: logo('360') },
  { id: '361', name: 'Newcastle', abbreviation: 'NEW', logo: logo('361') },
  { id: '393', name: 'Nottm Forest', abbreviation: 'NFO', logo: logo('393') },
  { id: '366', name: 'Sunderland', abbreviation: 'SUN', logo: logo('366') },
  { id: '367', name: 'Tottenham', abbreviation: 'TOT', logo: logo('367') },
  { id: '371', name: 'West Ham', abbreviation: 'WHU', logo: logo('371') },
  { id: '380', name: 'Wolves', abbreviation: 'WOL', logo: logo('380') },
];
