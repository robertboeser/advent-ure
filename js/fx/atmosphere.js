// Leitet aus einer Station die Stimmung für Schnee und Effekte ab.

const SNOW_BY_CLIMATE = {
  warm: 'none',
  mild: 'window',
  kalt: 'normal',
  eisig: 'heavy',
};

/** @returns {{density: string, golden: boolean, wind: number}} */
export function atmosphereFor(station) {
  const fx = station.fx ?? {};
  return {
    density: fx.snow ?? SNOW_BY_CLIMATE[station.climate] ?? 'normal',
    golden: Boolean(fx.golden),
    wind: fx.wind ?? (station.climate === 'eisig' ? 12 : 0),
  };
}

export const TITLE_ATMOSPHERE = { density: 'light', golden: false, wind: 0 };
