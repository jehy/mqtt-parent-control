import GetByShell from './GetByShell.ts';
import isWin from '../lib/isWin.ts';

import type { TaskOptions, TaskType } from './Task.ts';

export default class GetNetwork extends GetByShell {
  public name:TaskType = 'GetNetwork';

  constructor(config: any, options: TaskOptions) {
    super(config, options);
    if (isWin) {
      this.command = 'netsh wlan show interfaces | Select-String \'\\sSSID\'';
    } else {
      this.command = 'iwgetid -r';
    }
  }
}
