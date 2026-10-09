/*
 * Roster: the 4 subject teams and their KOCs.
 * Maintained by the team leads (MT), not by KOCs.
 * Source: KOC and Teaching Staff Structure (act.koc.01-05).
 */
KOC.roster([
  {
    id: 'maths',
    name: 'Maths',
    icon: '📐',
    accent: '#3b6fd4',
    account: 'act.koc.05',
    lead: 'Ms. Kinny',
    kocs: [
      { id: 'eric',   name: 'Eric',   icon: '🧮' },
      { id: 'hugo',   name: 'Hugo',   icon: '🧪' },
      { id: 'rachel', name: 'Rachel', icon: '📊' },
      { id: 'tracy',  name: 'Tracy',  icon: '📈' },
      { id: 'bobby',  name: 'Bobby',  icon: '🎯' }
    ]
  },
  {
    id: 'chem',
    name: 'Chem',
    icon: '⚗️',
    accent: '#d97706',
    account: 'act.koc.02 · act.koc.03',
    lead: 'Jeffery · Chris',
    kocs: [
      { id: 'keith',  name: 'Keith',  icon: '🔥' },
      { id: 'james',  name: 'James',  icon: '🧫', leader: true },
      { id: 'felix',  name: 'Felix',  icon: '💧' },
      { id: 'adrain', name: 'Adrain', icon: '🧴' },
      { id: 'duncan', name: 'Duncan', icon: '⚛️' }
    ]
  },
  {
    id: 'phy',
    name: 'Phy',
    icon: '🧭',
    accent: '#7c3aed',
    account: 'act.koc.04',
    lead: 'Chris',
    kocs: [
      { id: 'winnie', name: 'Winnie', icon: '🌀', leader: true },
      { id: 'jerry',  name: 'Jerry',  icon: '🔭' }
    ]
  },
  {
    id: 'bio-is',
    name: 'Bio + IS',
    icon: '🧬',
    accent: '#1f9d55',
    account: 'act.koc.01',
    lead: 'Jeffery',
    kocs: [
      { id: 'jeff',  name: 'Jeff',  icon: '🍃', leader: true },
      { id: 'issac', name: 'Issac', icon: '🦠' },
      { id: 'javin', name: 'Javin', icon: '🫀' }
    ]
  }
]);
