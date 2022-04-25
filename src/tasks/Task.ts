import type { IMQTTAdapter } from '../IMQTTAdapter';
import type { CheckProcessConfig } from './CheckProcess';
import type { GetByShellConfig } from './GetByShell';
import type { SetOnlineConfig } from './SetOnline';
import type { TimeControlConfig } from './TimeControl';

export type TaskOptions = { client: IMQTTAdapter };

export type TaskType = 'CheckProcess' | 'GetNetwork' | 'SetOnline' | 'TimeControl' | 'GetCpuUsage';

export type TasksConfig = {
  CheckProcess: CheckProcessConfig,
  GetNetwork: GetByShellConfig,
  GetCpuUsage: GetByShellConfig,
  SetOnline: SetOnlineConfig,
  TimeControl: TimeControlConfig,
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
