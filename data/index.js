// Fügt alle Spieldaten zusammen.

import { config } from './config.js';
import { items } from './items.js';
import { memories } from './memories.js';
import { stations as ankunft } from './stations/a-ankunft.js';
import { stations as haus } from './stations/b-omas-haus.js';
import { stations as dorf } from './stations/c-dorfplatz.js';
import { stations as kirche } from './stations/d-kirche.js';
import { stations as muehle } from './stations/e-muehle.js';
import { stations as wald } from './stations/f-wald.js';
import { stations as turm } from './stations/g-turm.js';
import { stations as enden } from './stations/x-enden.js';

export const stations = [...ankunft, ...haus, ...dorf, ...kirche, ...muehle, ...wald, ...turm, ...enden];

export const gameData = { stations, items, config };

export { config, items, memories };
