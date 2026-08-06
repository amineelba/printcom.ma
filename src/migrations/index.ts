import * as migration_20260728_154125_initial from './20260728_154125_initial';
import * as migration_20260806_150320_add_invoicepdf_plugin from './20260806_150320_add_invoicepdf_plugin';

export const migrations = [
  {
    up: migration_20260728_154125_initial.up,
    down: migration_20260728_154125_initial.down,
    name: '20260728_154125_initial',
  },
  {
    up: migration_20260806_150320_add_invoicepdf_plugin.up,
    down: migration_20260806_150320_add_invoicepdf_plugin.down,
    name: '20260806_150320_add_invoicepdf_plugin'
  },
];
