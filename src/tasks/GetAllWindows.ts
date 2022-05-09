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
}
