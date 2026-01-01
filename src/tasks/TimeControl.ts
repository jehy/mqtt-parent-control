import dayjs from 'dayjs';
import pTimeout from 'p-timeout';
import {Client} from 'ntp-time';

import Task from './Task.ts';
import isWin from '../lib/isWin.ts';
import execAsync from '../lib/execAsync.ts';

import type { TaskOptions, TaskType } from './Task.ts';

export type TimeControlConfig = {
  allowedTime: Array<{ start: number, end: number }>,
  topicShutdown: string,
  topicDelay: string,
  topicForceOff: string,
  onlineOnly: boolean,
  debug: boolean,
  ntpServers?: Array<string>
};

export default class TimeControl extends Task {
  public name:TaskType = 'TimeControl';

  public config: TimeControlConfig;

  public delay: boolean;

  public forceOff: boolean;

  public shutDownReason: string;

  public shouldShutdown: boolean;

  private time: number;

  constructor(config: any, options: TaskOptions) {
    super(options);
    this.config = config;

    if (!this.config.topicDelay) {
      this.enabled = false;
      this.logs.push('topicDelay topic not found');
    }
    if (!this.config.topicForceOff) {
      this.enabled = false;
      this.logs.push('topicForceOff topic not found');
    }
    if (!this.config.topicShutdown) {
      this.enabled = false;
      this.logs.push('topicShutdown topic not found');
    }
    if (!this.config.allowedTime) {
      this.enabled = false;
      this.logs.push('allowedTime not found');
    }
  }

  public shutdown(debug: boolean = false, reason:string = '') {
    if (debug) {
      console.log(`SHUTDOWN debug reason ${reason}`);
      return;
    }
    if (isWin) {
      execAsync('shutdown /s /t 3').catch((err) => {
        this.logs.push(err.message + err.stack);
      });
    } else {
      execAsync('shutdown now').catch((err) => {
        this.logs.push(err.message + err.stack);
      });
    }
  }

  public async waitForTopic(waitTopic: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.client.on('message', (topic, message) => {
        if (topic !== waitTopic) {
          return;
        }
        if (message.toString() === '1') {
          resolve(true);
          return;
        }
        resolve(false);
      });
    });
  }

  public async start(): Promise<void> {
    const res = Promise.all([
      pTimeout(this.waitForTopic(this.config.topicDelay), {milliseconds: 10_000, fallback: () => false}),
      pTimeout(this.waitForTopic(this.config.topicForceOff), {milliseconds: 10_000, fallback: () => false}),
      this.getCurrentHours(),
    ]);
    await pTimeout(Promise.all([
      this.client.subscribe(this.config.topicDelay),
      this.client.subscribe(this.config.topicForceOff),
    ]), {milliseconds: 10_000, fallback: () => [false, false]});
    [this.delay, this.forceOff, this.time] = await res;
  }

  public scheduleShutdown(reason: string) {
    this.logs.push(`shutdown: ${reason}`);
    console.log(`shutdown: ${reason}`);
    this.shutDownReason = reason;
    this.shouldShutdown = true;
  }

  private async getCurrentHours(){
    const resFromLocalTime = parseInt(dayjs().format('HH'), 10);
    if(!this.config.ntpServers?.length){
      return resFromLocalTime
    }
    const clients = this.config.ntpServers.map((url) => new Client(url, 123, { timeout: 5000 }));
    try{
      const date = await Promise.any(clients.map((client) => client.syncTime()));
      console.log(`NTP time: ${date.time}`);
      return parseInt(dayjs(date.time).format('HH'), 10);
    } catch(err){
      console.error(err);
      return resFromLocalTime
    }
  }

  public async end(): Promise<void> {
    if (this.forceOff) {
      this.scheduleShutdown('force mode');
    }
    console.log(`Current time ${this.time}`);
    const allowedTime = this.config.allowedTime as Array<{ start: number, end: number }>;
    const allowed = allowedTime.find((interval) => interval.start < this.time && this.time < interval.end);
    if (!allowed && !this.delay) {
      this.scheduleShutdown('not allowed time');
    }
    if (this.config.onlineOnly && !this.client.connected) {
      this.scheduleShutdown('shutdown: should work online only');
    }
    if (this.shouldShutdown) {
      setTimeout(() => this.shutdown(this.config.debug, this.shutDownReason), 1000);
      await this.client.publish(this.config.topicShutdown, '1');
    }
  }
}
