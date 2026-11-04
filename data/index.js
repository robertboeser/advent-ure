// Fügt alle Spieldaten zusammen.

import { config } from './config.js';
import { items } from './items.js';
import { memories } from './memories.js';
import { stations as ankunft } from './stations/a-ankunft.js';
import { stations as haus } from './stations/b-omas-haus.js';
import { stations as platzhalter } from './stations/zz-platzhalter.js';

export const stations = [...ankunft, ...haus, ...platzhalter];

export const gameData = { stations, items, config };

export { config, items, memories };
