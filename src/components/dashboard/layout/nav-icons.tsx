import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { FoldersIcon } from '@phosphor-icons/react/dist/ssr/Folders';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PackageIcon } from '@phosphor-icons/react/dist/ssr/Package';
import { PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { TestTubeIcon } from '@phosphor-icons/react/dist/ssr/TestTube';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { EnvelopeSimple } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'folders':FoldersIcon,
  'gear-six': GearSixIcon,
  'package':PackageIcon,
  'plugs-connected': PlugsConnectedIcon,
  'test-tube':TestTubeIcon,
  'x-square': XSquare,
  'envelope-simple':EnvelopeSimple,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
