import GetByShell from './GetByShell';

import type { TaskType } from './Task';

export default class GetNetwork extends GetByShell {
  public name:TaskType = 'GetNetwork';

  public command: string = 'iwgetid -r';
}
