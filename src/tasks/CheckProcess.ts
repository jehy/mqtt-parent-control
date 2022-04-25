import { exec } from 'child_process';
import { promisify } from 'util';

import Task from './Task';

import type { TaskOptions, TaskType } from './Task';

export type CheckProcessConfig = {
  process: string,
  topic: string,
};
const execAsync = promisify(exec);

export default class CheckProcess extends Task {
  public name:TaskType = 'CheckProcess';

  public shellResult: { stdout: string; stderr: string; };

  public config: CheckProcessConfig;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
    if (!this.config.process) {
      this.enabled = false;
      this.logs.push('Process name not found');
    }
  }

  public async start():Promise<void> {
    this.shellResult = await execAsync(`ps aux | grep ${this.config.process}`);
  }

  public async end(): Promise<void> {
    const result = (this.shellResult).stdout
      .trim()
      .split('\n')
      .filter((el) => !el.includes(`grep ${this.config.process}`));
    if (this.client) {
      await this.client.publish(this.config.topic, result.length === 0 ? '0' : '1');
    }
  }
}
