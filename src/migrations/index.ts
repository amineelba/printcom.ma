import * as migration_20260728_154125_initial from './20260728_154125_initial';

export const migrations = [
  {
    up: migration_20260728_154125_initial.up,
    down: migration_20260728_154125_initial.down,
    name: '20260728_154125_initial'
  },
];
