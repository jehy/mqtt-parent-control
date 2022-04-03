import type { CheckProcessConfig } from './CheckProcess';
import type { GetByShellConfig } from './GetByShell';
import type { SetOnlineConfig } from './SetOnline';
import type { TimeControlConfig } from './TimeControl';
import type { AsyncMqttClient } from 'async-mqtt';

export type TaskOptions = { client: AsyncMqttClient };

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

  client: AsyncMqttClient;

  constructor(options: TaskOptions) {
    this.logs = [];
    this.client = options.client;
  }

  public abstract start():Promise<void>;

  public abstract end():Promise<void>;
}
