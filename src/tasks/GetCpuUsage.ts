import Task from './Task';
import { getCPULoadAVG } from '../lib/cpu';

import type { TaskOptions } from './Task';

export type GetCpuUsageConfig = {
  topic: string,
};

export default class GetCpuUsage extends Task {
  public config: GetCpuUsageConfig;

  public command: string;

  public cpuUsage: Promise<number>;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    this.cpuUsage = getCPULoadAVG(1000, 100);
  }

  public async end(): Promise<void> {
    const result = (await this.cpuUsage).toString(10);
    await this.client.publish(this.config.topic, result);
  }
}
