import * as mqtt from 'async-mqtt';
// @ts-ignore
import configModule from 'config';
// @ts-ignore
import { promisify } from 'util';

import tasks from './tasks';

import type Task from './tasks/Task';
import type { TasksConfig, TaskType } from './tasks/Task';

type Config = {
  mqtt: {
    options: {
      clientId: string,
      username: string,
      password: string
    },
    url: string,
  }
  tasksConfig: TasksConfig,
  logTopic: string,
};

const config = configModule as unknown as Config;
const sleep = (time: number) => promisify(setTimeout)(time);

async function withFallBack(task: Task, fn: Function, logs: Array<string>) {
  try {
    await fn.apply(task);
    // @ts-ignore
  } catch (err: Error) {
    logs.push(`${task.name}: ${err.message} ${err.stack}`);
  }
}

async function run() {
  const { tasksConfig } = config;
  let logs:Array<string> = [];
  const client = mqtt.connect(config.mqtt.url, config.mqtt.options);
  const tasksObjects: Array<Task> = Object.entries(tasksConfig).map((el) => {
    const name: TaskType = el[0] as TaskType;
    const taskConfig: any = el[1];
    if (!tasks[name]) {
      logs.push(`Class for ${name} not found!`);
      return false;
    }
    const task = new tasks[name](taskConfig, { client });
    if (!task.enabled && task.logs) {
      logs = logs.concat(task.logs);
    }
    if (!task.enabled) {
      return false;
    }
    return task;
  }).filter((el) => el) as Array<Task>;
  console.log(`running ${tasksObjects.length} tasks`);

  const connection = new Promise((resolve) => {
    client.on('connect', () => {
      resolve(true);
    });
    client.on('error', (err) => {
      console.log('error', err);
      resolve(false);
    });
  });
  await Promise.race([connection, sleep(10000)]);
  await Promise.all(tasksObjects.map((task) => withFallBack(task, task.start, logs)));
  await Promise.all(tasksObjects.map((task) => withFallBack(task, task.end, logs)));
  logs = tasksObjects.reduce((res, task) => res.concat(task.logs), logs);
  if (logs.length) {
    console.log(logs);
    await client.publish(config.logTopic, logs.join('\n'));
  }
  await client.end();
}

run()
  .then(() => process.exit(0))
  .catch((err) => { console.log(err); process.exit(1); });
