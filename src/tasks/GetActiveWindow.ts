import GetByShell from './GetByShell';

import type { TaskOptions, TaskType } from './Task';

export type GetActiveWindowConfig = {
  topic: string,
  user: string,
};

export default class GetActiveWindow extends GetByShell {
  public config: GetActiveWindowConfig;

  public name:TaskType = 'GetActiveWindow';

  constructor(config: any, options: TaskOptions) {
    super(config, options);
    this.config = config;
    if (!this.config.user) {
      this.enabled = false;
      this.logs.push('user not found');
    }
    this.command = `su - ${config.user} -c  'DISPLAY=":0" xdotool getwindowfocus getwindowname'`;
  }
}
