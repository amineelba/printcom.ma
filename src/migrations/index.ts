import * as migration_20260728_154125_initial from './20260728_154125_initial';
import * as migration_20260806_150320_add_invoicepdf_plugin from './20260806_150320_add_invoicepdf_plugin';
import * as migration_20260820_021258 from './20260820_021258';
import * as migration_20260820_163249_add_mcp_plugin from './20260820_163249_add_mcp_plugin';

export const migrations = [
  {
    up: migration_20260728_154125_initial.up,
    down: migration_20260728_154125_initial.down,
    name: '20260728_154125_initial',
  },
  {
    up: migration_20260806_150320_add_invoicepdf_plugin.up,
    down: migration_20260806_150320_add_invoicepdf_plugin.down,
    name: '20260806_150320_add_invoicepdf_plugin',
  },
  {
    up: migration_20260820_021258.up,
    down: migration_20260820_021258.down,
    name: '20260820_021258',
  },
  {
    up: migration_20260820_163249_add_mcp_plugin.up,
    down: migration_20260820_163249_add_mcp_plugin.down,
    name: '20260820_163249_add_mcp_plugin'
  },
];
