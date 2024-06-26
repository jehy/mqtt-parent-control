import Task from './Task';
import execAsync from '../lib/execAsync';

import type { TaskOptions } from './Task';

export type GetByShellConfig = {
  topic: string,
};

export default class GetByShell extends Task {
  public config: GetByShellConfig;

  public command: string;

  public shellResult: { stdout: string; stderr: string; };

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    const res = await execAsync(this.command) as { stdout: string; stderr: string; } | undefined;
    if (!res) { // it can be undefined
      this.shellResult = { stdout: '', stderr: '' };
    } else {
      this.shellResult = res;
    }
  }

  public async end(): Promise<void> {
    const result = ((this.shellResult)?.stdout || '').trim();
    if (this.client) {
      await this.client.publish(this.config.topic, result);
    }
  }
}
