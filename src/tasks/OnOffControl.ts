import pTimeout from 'p-timeout';

import Task from './Task';
import execAsync from '../lib/execAsync';

import type { TaskOptions, TaskType } from './Task';

export type OnOffControlConfig = {
  topic: string,
  on: string,
  off: string,
};

export default class OnOffControl extends Task {
  public name:TaskType = 'OnOffControl';

  public config: OnOffControlConfig;

  public state: boolean;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;

    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
    if (!this.config.on) {
      this.enabled = false;
      this.logs.push('on command not found');
    }
    if (!this.config.off) {
      this.enabled = false;
      this.logs.push('off command not found');
    }
  }

  public async waitForTopic(waitTopic: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.on('message', (topic, message) => {
        if (topic !== waitTopic) {
          return;
        }
        if (message.toString() === '1') {
          resolve(true);
          return;
        }
        resolve(false);
      });
    });
  }

  public async start(): Promise<void> {
    const res = await pTimeout(this.waitForTopic(this.config.topic), 10_000, () => null);
    if (res === null) {
      this.logs.push('Failed to get state');
      return;
    }
    this.state = res;
  }

  public async end(): Promise<void> {
    if (this.state) {
      await execAsync(this.config.on).catch((err) => {
        this.logs.push(err.message + err.stack);
      });
    } else {
      await execAsync(this.config.off).catch((err) => {
        this.logs.push(err.message + err.stack);
      });
    }
  }
}
