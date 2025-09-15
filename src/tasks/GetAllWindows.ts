import { parse } from 'csv-parse/sync';

import GetByShell from './GetByShell.ts';
import isWinPlatform from '../lib/isWin.ts';

import type { TaskOptions, TaskType } from './Task.ts';

export type GetAllWindowsConfig = {
  topic: string,
  user: string,
};

const winExtraTitles = ['Task', 'Host', 'Windows Push Notifications',
  'Platform', 'Начальный экран', 'OleMainThread', 'N/A', 'Н/Д',
  'CrossDeviceResumeWindow', 'OLEChannelWnd', 'Quick Settings', 'Search', 'Поиск', 'Пуск'];

export default class GetAllWindows extends GetByShell {
  public config: GetAllWindowsConfig;

  public name: TaskType = 'GetAllWindows';

  constructor(config: GetAllWindowsConfig, options: TaskOptions) {
    super(config, options);
    this.config = config;
    if (!this.config.user) {
      this.enabled = false;
      this.logs.push('user not found');
    }
    if (isWinPlatform) {
      this.command = 'tasklist  /v /nh /fo csv';
    } else {
      this.command = `su - ${config.user} -c  'DISPLAY=":0" wmctrl -l'`;
    }
  }

  public async end(): Promise<void> {
    const result = this.parseReply(this.shellResult.stdout.trim(), isWinPlatform);
    if (this.client) {
      await this.client.publish(this.config.topic, result);
    }
  }

  public parseReply(data: string, isWinPlatform: boolean): string {
    if (isWinPlatform) {
      if (data.split(',').length < 5) {
        return '';
      }
      const records = parse(data, {
        // "Имя образа","PID","Имя сессии","№ сеанса","Память","Состояние","Пользователь","Время ЦП","Заголовок окна"
        // eslint-disable-next-line no-irregular-whitespace
        // "powershell.exe","12832","RDP-Tcp#5","1","77 760 КБ","Running","BIG-PC\jehy","0:00:01","Администратор: Windows PowerShell"
        columns: ['name', 'pid', 'sessionName', 'sessionNum', 'memory', 'state', 'user', 'cpuTime', 'title'],
        skip_empty_lines: true,
      }) as Array<{ title: string, user: string }>;
      return records
        .filter((rec) => rec
          && rec.title && !winExtraTitles.find((el) => rec.title.includes(el))
          && rec.user.includes(this.config.user))
        .map((rec) => rec.title).sort().join(' | ');
    }
    return data.split('\n')
      .map((el) => {
        const all = el.split(' ');
        return all.slice(3).join(' ');
      })
      .sort()
      .join(' ')
      .substring(0, 255);
  }
}
