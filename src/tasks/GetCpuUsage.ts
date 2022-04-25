import Task from './Task';
import { getCPULoadAVG } from '../lib/cpu';

import type { TaskOptions, TaskType } from './Task';

export type GetCpuUsageConfig = {
  topic: string,
};

export default class GetCpuUsage extends Task {
  public config: GetCpuUsageConfig;

  public name:TaskType = 'GetCpuUsage';

  public command: string;

  public cpuUsage: number;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    this.cpuUsage = await getCPULoadAVG(1000, 100);
  }

  public async end(): Promise<void> {
    const result = (this.cpuUsage).toString(10);
    await this.client.publish(this.config.topic, result);
  }
}
