import * as mqtt from 'async-mqtt';
// @ts-ignore
import configModule from 'config';
import dayjs from 'dayjs';
// @ts-ignore
import { exec } from 'child_process';
import { promisify } from 'util';

type Config = {
  'options': {
    'clientId': string,
    'username': string,
    'password': string
  },
  'url': string,
  'topicOnline': string,
  'topicShutdown': string,
  'topicDelay': string,
  topicNetwork: string,
  net: string,
};

const config = configModule as unknown as Config;
const sleep = (time: number) => promisify(setTimeout)(time);
// @ts-ignore
const execAsync = promisify(exec);

async function checkNet(client: mqtt.AsyncClient) {
  const res = await execAsync('iwgetid -r');
  const net = res.stdout.trim();
  if (net && net !== config.net) {
    console.log(`New net ${net}`);
    await client.publish(config.topicNetwork, net);
  }
}

async function run() {
  const client = mqtt.connect(config.url, config.options);

  const time = parseInt(dayjs().format('HH'), 10);
  console.log(`Time ${time}`);
  const connection = new Promise((resolve) => {
    client.on('connect', () => {
      console.log('connected');
      client.publish(config.topicOnline, '1');
      checkNet(client);
      resolve(true);
    });
    client.on('error', (err) => {
      console.log('error', err);
      resolve(false);
    });
  });
  const connected = await Promise.race([connection, sleep(10000)]);
  const shouldDelay = new Promise(((resolve) => {
    if (!connected) {
      resolve(false);
      return;
    }
    client.subscribe(config.topicDelay);
    client.on('message', (topic, message) => {
      if (topic === config.topicDelay && message.toString() === '1') {
        resolve(true);
        return;
      }
      resolve(false);
    });
  }));
  const delay = await Promise.race([shouldDelay, sleep(10000)]);
  console.log(`delay: ${delay}`);
  if (delay) {
    await client.end();
    return;
  }
  const shutDownByTime = time < 7 || time > 22;
  const shutDown = shutDownByTime;
  if (shutDown) {
    try {
      if (connected) {
        await client.publish(config.topicShutdown, '1');
      }
    } catch (err) {
      console.log(err);
    }
    console.log('shutting down');
    await client.end();
    await execAsync('shutdown now');
  }
}

run()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
