import Task from './Task';

import type { TaskOptions, TaskType } from './Task';

export type SetOnlineConfig = {
  topic: string,
};
export default class SetOnline extends Task {
  public name:TaskType = 'SetOnline';

  public config: SetOnlineConfig;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
  }

  public async start():Promise<void> {
    if(this.client) {
      await this.client.publish(this.config.topic, '1');
    }
  }

  end(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
