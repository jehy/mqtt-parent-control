import { exec } from 'child_process';
import { promisify } from 'util';

import Task from './Task';

import type { PromiseWithChild } from 'child_process';
import type { TaskOptions, TaskType } from './Task';

export type CheckProcessConfig = {
  process: string,
  topic: string,
};
const execAsync = promisify(exec);

export default class CheckProcess extends Task {
  public name:TaskType = 'CheckProcess';

  public shellResult: PromiseWithChild<{ stdout: string; stderr: string; }>;

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
    this.shellResult = execAsync(`ps aux | grep ${this.config.process}`);
  }

  public async end(): Promise<void> {
    const result = (await this.shellResult).stdout.trim();
    await this.client.publish(this.config.topic, result ? '1' : '0');
  }
}
