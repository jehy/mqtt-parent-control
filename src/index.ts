import timers from 'timers/promises';
import mqtt from 'async-mqtt';
// @ts-ignore
import configModule from 'config';
import pTimeout from 'p-timeout';

import tasks from './tasks/index.ts';
import { DummyMqttClient } from './DummyMqttClient.ts';

import type { IMQTTAdapter } from './IMQTTAdapter.ts';
import type Task from './tasks/Task.ts';
import type { TasksConfig, TaskType } from './tasks/Task.ts';

type Config = {
  mqtt: Array<{
    options: {
      clientId: string,
      username: string,
      password: string
    },
    url: string,
  }>
  tasksConfig: TasksConfig,
  logTopic: string,
};

const config = configModule as unknown as Config;

async function withFallBack(task: Task, fn: Function, logs: Array<string>) {
  try {
    await pTimeout(fn.apply(task), {milliseconds: 30_000});
    // @ts-ignore
  } catch (err: Error) {
    logs.push(`${task.name}: ${err.message} ${err.stack}`);
  }
}

async function getClient(logs: Array<string>): Promise<IMQTTAdapter> {
  for (let n = 0; n < 3; n++) {
    for (let i = 0; i < config.mqtt.length; i++) {
      try {
        const client = await pTimeout(mqtt.connectAsync(config.mqtt[i].url, config.mqtt[i].options), {milliseconds: 10_000});
        return client as IMQTTAdapter;
      } catch (err) {
        logs.push(`MQTT connect failed on attempt ${n} to ${config.mqtt[i].url}`, (err as Error).toString());
      }
    }
  }
  logs.push('Using dummy mqqt client');
  return new DummyMqttClient();
}

async function run() {
  if(!config?.mqtt?.length) {
    console.log('No mqtt config found');
    return;
  }
  let logs:Array<string> = [];
  const client: IMQTTAdapter = await getClient(logs);
  const { tasksConfig } = config;
  const tasksObjects: Array<Task> = Object.entries(tasksConfig).map((el) => {
    const name: TaskType = el[0] as TaskType;
    const taskConfig: any = el[1];
    if (!tasks[name]) {
      logs.push(`Class for ${name} not found!`);
      return false;
    }
    const task = new tasks[name](taskConfig, { client });
    if (!task.enabled && task.logs) {
      logs = logs.concat(task.logs.map((log) => `${name}: ${log}`));
    }
    if (!task.enabled) {
      return false;
    }
    return task;
  }).filter((el) => el) as Array<Task>;
  console.log(`${new Date().toString()} running ${tasksObjects.length} tasks`);
  await Promise.all(tasksObjects.map((task) => withFallBack(task, task.start, logs)));
  console.log('ran start');
  await Promise.all(tasksObjects.map((task) => withFallBack(task, task.end, logs)));
  console.log('ran end');
  logs = tasksObjects.reduce((res, task) => res.concat(task.logs.map((log) => `${task.name}: ${log}`)), logs);
  if (logs.length) {
    console.log(`${new Date().toString()} ${logs.join('\n')}`);
    await client.publish(config.logTopic, logs.join('\n').substring(0, 255));
  }
  await client.end();
  await timers.setTimeout(2000); // wait for may-be-shutdown
}

pTimeout(run(), {milliseconds: 55_000})
  .then(() => process.exit(0))
  .catch((err) => { console.log(err); process.exit(1); });
