import { exec } from 'child_process';
import { promisify } from 'util';

import Task from './Task';

import type { TaskOptions } from './Task';
import type { PromiseWithChild } from 'child_process';

const execAsync = promisify(exec);

export type GetByShellConfig = {
  topic: string,
};

export default class GetByShell extends Task {
  public config: GetByShellConfig;

  public command: string;

  public shellResut: PromiseWithChild<{ stdout: string; stderr: string; }>;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    this.shellResut = execAsync(this.command);
  }

  public async end(): Promise<void> {
    const result = (await this.shellResut).stdout.trim();
    await this.client.publish(this.config.topic, result);
  }
}
