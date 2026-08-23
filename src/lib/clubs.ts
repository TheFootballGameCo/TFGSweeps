// Static Premier League club list (2026/27 season) with ESPN ids.
// Used as a fallback when the live table can't be fetched, and as the club
// source for the sample season.
import type { Club } from '../types';

export const FALLBACK_CLUBS: Club[] = [
  { id: '359', name: 'Arsenal', abbreviation: 'ARS', logo: '' },
  { id: '362', name: 'Aston Villa', abbreviation: 'AVL', logo: '' },
  { id: '349', name: 'Bournemouth', abbreviation: 'BOU', logo: '' },
  { id: '337', name: 'Brentford', abbreviation: 'BRE', logo: '' },
  { id: '331', name: 'Brighton', abbreviation: 'BHA', logo: '' },
  { id: '363', name: 'Chelsea', abbreviation: 'CHE', logo: '' },
  { id: '388', name: 'Coventry City', abbreviation: 'COV', logo: '' },
  { id: '384', name: 'Crystal Palace', abbreviation: 'CRY', logo: '' },
  { id: '368', name: 'Everton', abbreviation: 'EVE', logo: '' },
  { id: '370', name: 'Fulham', abbreviation: 'FUL', logo: '' },
  { id: '306', name: 'Hull City', abbreviation: 'HUL', logo: '' },
  { id: '373', name: 'Ipswich Town', abbreviation: 'IPS', logo: '' },
  { id: '357', name: 'Leeds United', abbreviation: 'LEE', logo: '' },
  { id: '364', name: 'Liverpool', abbreviation: 'LIV', logo: '' },
  { id: '382', name: 'Man City', abbreviation: 'MNC', logo: '' },
  { id: '360', name: 'Man United', abbreviation: 'MAN', logo: '' },
  { id: '361', name: 'Newcastle', abbreviation: 'NEW', logo: '' },
  { id: '393', name: 'Nottm Forest', abbreviation: 'NFO', logo: '' },
  { id: '366', name: 'Sunderland', abbreviation: 'SUN', logo: '' },
  { id: '367', name: 'Tottenham', abbreviation: 'TOT', logo: '' },
];
