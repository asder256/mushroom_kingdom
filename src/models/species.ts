import type { Observation } from './types';

// Suggestions for recording observations, kept locally; owners can enter any name.
export const commonSpecies: Record<Observation['type'], { name: string; swedish: string }[]> = {
  mushroom: [
    { name: 'Chanterelle', swedish: 'Kantarell' },
    { name: 'Funnel chanterelle', swedish: 'Trattkantarell' },
    { name: 'Porcini', swedish: 'Karljohanssvamp' },
    { name: 'Hedgehog mushroom', swedish: 'Blek taggsvamp' },
    { name: 'Black trumpet', swedish: 'Svart trumpetsvamp' },
    { name: 'Oyster mushroom', swedish: 'Ostronmussling' },
    { name: 'Parasol mushroom', swedish: 'Stolt fjällskivling' },
    { name: 'Field mushroom', swedish: 'Ängschampinjon' },
    { name: 'Saffron milk cap', swedish: 'Läcker riska' },
  ],
  fish: [
    { name: 'Perch', swedish: 'Abborre' }, { name: 'Pike', swedish: 'Gädda' },
    { name: 'Zander', swedish: 'Gös' }, { name: 'Brown trout', swedish: 'Öring' },
    { name: 'Atlantic salmon', swedish: 'Lax' }, { name: 'Rainbow trout', swedish: 'Regnbåge' },
    { name: 'Arctic char', swedish: 'Röding' }, { name: 'Grayling', swedish: 'Harr' },
    { name: 'Bream', swedish: 'Braxen' }, { name: 'Roach', swedish: 'Mört' },
    { name: 'Tench', swedish: 'Sutare' }, { name: 'European eel', swedish: 'Ål' },
  ],
  plant: [], other: [],
};

// Common variants in saved-list notes. Canonical names match the editor choices.
export const speciesAliases: Record<string, string[]> = {
  Chanterelle: ['chanterelles', 'kantareller'],
  'Funnel chanterelle': ['funnel chanterelles', 'trattkantareller', 'trattisar'],
  Porcini: ['karljohan', 'karl johan', 'karl-johan', 'karljohanssvampar'],
  'Hedgehog mushroom': ['hedgehog mushrooms', 'bleka taggsvampar'],
  'Black trumpet': ['black trumpets', 'svarta trumpetsvampar'],
  'Oyster mushroom': ['oyster mushrooms', 'ostronmusslingar'],
  'Parasol mushroom': ['parasol mushrooms', 'stolta fjällskivlingar'],
  'Field mushroom': ['field mushrooms', 'ängschampinjoner'],
  'Saffron milk cap': ['saffron milk caps', 'läckra riskor'],
  Perch: ['abborrar'], Pike: ['gäddor'], Zander: ['gösar'],
  'Brown trout': ['öringar'], 'Atlantic salmon': ['laxar'],
  'Rainbow trout': ['regnbågar'], 'Arctic char': ['rödingar'],
  Grayling: ['harrar'], Bream: ['braxnar'], Roach: ['mörtar'],
  Tench: ['sutare'], 'European eel': ['ålar'],
};
