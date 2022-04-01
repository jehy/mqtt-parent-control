import GetByShell from './GetByShell';

import type { TaskType } from './Task';

export default class GetCpuUsage extends GetByShell {
  public name:TaskType = 'GetCpuUsage';

  public command: string = 'echo $[100-$(vmstat 1 2|tail -1|awk \'{print $15}\')]';
}
