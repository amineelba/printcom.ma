import * as migration_20260728_154125_initial from './20260728_154125_initial';
import * as migration_20260820_021258 from './20260820_021258';

export const migrations = [
  {
    up: migration_20260728_154125_initial.up,
    down: migration_20260728_154125_initial.down,
    name: '20260728_154125_initial',
  },
  {
    up: migration_20260820_021258.up,
    down: migration_20260820_021258.down,
    name: '20260820_021258'
  },
];
