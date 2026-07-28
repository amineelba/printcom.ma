import * as migration_20260728_150650_initial from './20260728_150650_initial';

export const migrations = [
  {
    up: migration_20260728_150650_initial.up,
    down: migration_20260728_150650_initial.down,
    name: '20260728_150650_initial'
  },
];
