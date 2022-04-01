import { exec } from 'child_process';
import { promisify } from 'util';
import dayjs from 'dayjs';

import Task from './Task';

import type { TaskOptions, TaskType } from './Task';

const execAsync = promisify(exec);

export type TimeControlConfig = {
  allowedTime: Array<{ start: number, end: number }>,
  topicShutdown: string,
  topicDelay: string,
};

function shutdown() {
  /* if (true) {
    console.log('SHUTDOWN');
    return;
  } */
  execAsync('shutdown now').catch();
}

export default class TimeControl extends Task {
  public name:TaskType = 'TimeControl';

  public config: TimeControlConfig;

  public delay: Promise<boolean>;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;

    if (!this.config.topicDelay) {
      this.enabled = false;
      this.logs.push('topicDelay topic not found');
    }
    if (!this.config.topicShutdown) {
      this.enabled = false;
      this.logs.push('topicShutdown topic not found');
    }
    if (!this.config.allowedTime) {
      this.enabled = false;
      this.logs.push('allowedTime not found');
    }
  }

  public async start():Promise<void> {
    await this.client.subscribe(this.config.topicDelay);
    this.delay = new Promise((resolve, reject) => {
      setTimeout(() => reject(), 10000);
      this.client.on('message', (topic, message) => {
        if (topic === this.config.topicDelay && message.toString() === '1') {
          resolve(true);
          return;
        }
        resolve(false);
      });
    });
  }

  public async end(): Promise<void> {
    const time = parseInt(dayjs().format('HH'), 10);
    console.log(`Time ${time}`);
    const allowedTime = this.config.allowedTime as Array<{ start: number, end: number }>;
    const allowed = allowedTime.find((interval) => interval.start >= time && time <= interval.end);
    if (allowed) {
      return;
    }
    const delay = await this.delay;
    if (!delay) {
      await this.client.publish(this.config.topicShutdown, '1');
      setTimeout(() => shutdown(), 1000);
    }
  }
}
