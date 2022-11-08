import { parse } from 'csv-parse/sync';

import GetByShell from './GetByShell';
import isWin from '../lib/isWin';

import type { TaskOptions, TaskType } from './Task';
// const parse = require('csv-parse/lib/sync.js');

export type CheckProcessConfig = {
  process: string,
  topic: string,
  user: string,
};

export default class CheckProcess extends GetByShell {
  public name:TaskType = 'CheckProcess';

  public config: CheckProcessConfig;

  constructor(config: any, options: TaskOptions) {
    super(config, options);
    this.config = config;
    if (!this.config.topic) {
      this.enabled = false;
      this.logs.push('topic not found');
    }
    if (!this.config.process) {
      this.enabled = false;
      this.logs.push('Process name not found');
    }
    this.command = isWin ? `tasklist /fi "imagename eq ${this.config.process}" /v /nh /fo csv` : `ps aux | grep ${this.config.process}`;
  }

  public async end(): Promise<void> {
    const noResult = this.parseReply(this.shellResult.stdout.trim());
    await this.client.publish(this.config.topic, noResult ? '0' : '1');
  }

  public parseReply(data:string):boolean {
    if (isWin) {
      if (data.split(',').length < 5) {
        return true;
      }
      const records = parse(data, {
        // "Имя образа","PID","Имя сессии","№ сеанса","Память","Состояние","Пользователь","Время ЦП","Заголовок окна"
        // eslint-disable-next-line no-irregular-whitespace
        // "powershell.exe","12832","RDP-Tcp#5","1","77 760 КБ","Running","BIG-PC\jehy","0:00:01","Администратор: Windows PowerShell"
        columns: ['name', 'pid', 'sessionName', 'sessionNum', 'memory', 'state', 'user', 'cpuTime', 'title'],
        skip_empty_lines: true,
      }) as Array<{ title: string, user: string }>;
      return records
        .filter((rec) => rec && rec.user && rec.user.includes(this.config.user))
        .length === 0;// remove "no info" message
    }
    return data
      .split('\n')
      .filter((el) => !el.includes(`grep ${this.config.process}`))
      .length === 0;
  }
}
