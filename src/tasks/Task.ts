import type { GetAllWindowsConfig } from './GetAllWindows.ts';
import type { IMQTTAdapter } from '../IMQTTAdapter.ts';
import type { CheckProcessConfig } from './CheckProcess.ts';
import type { GetByShellConfig } from './GetByShell.ts';
import type { SetOnlineConfig } from './SetOnline.ts';
import type { TimeControlConfig } from './TimeControl.ts';
import type { GetActiveWindowConfig } from './GetActiveWindow.ts';

export type TaskOptions = { client: IMQTTAdapter };

export type TaskType = 'CheckProcess' | 'GetNetwork' | 'SetOnline'
| 'TimeControl' | 'GetCpuUsage' | 'GetActiveWindow' | 'GetAllWindows' | 'OnOffControl';

export type TasksConfig = {
  CheckProcess: CheckProcessConfig,
  GetNetwork: GetByShellConfig,
  GetCpuUsage: GetByShellConfig,
  SetOnline: SetOnlineConfig,
  TimeControl: TimeControlConfig,
  GetAllWindows: GetAllWindowsConfig,
  GetActiveWindow: GetActiveWindowConfig,
};

export default abstract class Task {
  public name: TaskType;

  public enabled: boolean = true;

  public config: any;

  public logs: Array<string>;

  client: IMQTTAdapter;

  constructor(options: TaskOptions) {
    this.logs = [];
    this.client = options.client;
  }

  public abstract start():Promise<void>;

  public abstract end():Promise<void>;
}
