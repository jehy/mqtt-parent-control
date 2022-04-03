// @ts-ignore
import { snapshot } from 'process-list';

import Task from './Task';

import type { TaskOptions, TaskType } from './Task';

export type CheckProcessConfig = {
  process: string,
  topic: string,
};

export default class CheckProcessTask extends Task {
  public name:TaskType = 'CheckProcess';

  public config: CheckProcessConfig;

  public tasks: Promise<Array<{ pid: string, name: string }>>;

  constructor(config: CheckProcessConfig, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.process) {
      this.enabled = false;
      this.logs.push('Process name not found');
    }
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    this.tasks = snapshot('pid', 'name');
  }

  public async end(): Promise<void> {
    const tasks = await this.tasks;
    const found = tasks.filter((el) => el.name.includes(this.config.process));
    await this.client.publish(this.config.topic, found.length ? '1' : '0');
  }
}
