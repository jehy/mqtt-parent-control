import GetByShell from './GetByShell';

import type { TaskOptions, TaskType } from './Task';

export type GetAllWindowsConfig = {
  topic: string,
  user: string,
};

export default class GetAllWindows extends GetByShell {
  public config: GetAllWindowsConfig;

  public name:TaskType = 'GetAllWindows';

  constructor(config: any, options: TaskOptions) {
    super(config, options);
    this.config = config;
    if (!this.config.user) {
      this.enabled = false;
      this.logs.push('user not found');
    }
    this.command = `su - ${config.user} -c  'DISPLAY=":0" wmctrl -l'`;
  }

  public async end(): Promise<void> {
    const result = (this.shellResult).stdout.trim()
      .split('\n')
      .map((el) => {
        const all = el.split(' ');
        return all.slice(3).join(' ');
      })
      .sort()
      .join(' ');
    if (this.client) {
      await this.client.publish(this.config.topic, result);
    }
  }
  //
}
