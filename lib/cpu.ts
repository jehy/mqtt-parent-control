// taken from https://gist.github.com/GaetanoPiazzolla/c40e1ebb9f709d091208e89baf9f4e00

// Create function to get CPU information
import os from 'os';

function cpuAverage() {
  // Initialise sum of idle and time of cores and fetch CPU info
  let totalIdle:number = 0;
  let totalTick : number = 0;
  const cpus = os.cpus();

  // Loop through CPU cores
  for (let i = 0, len = cpus.length; i < len; i++) {
    // Select CPU core
    const cpu = cpus[i];

    // Total up the time in the cores tick
    const timesForType = Object.values(cpu.times);
    for (let type = 0; type < timesForType.length; type++) {
      totalTick += timesForType[type];
    }

    // Total up the idle time of the core
    totalIdle += cpu.times.idle;
  }

  // Return the average Idle and Tick times
  return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
}

// function to calculate average of array
function arrAvg(arr:Array<number>) {
  if (arr && arr.length >= 1) {
    const sumArr = arr.reduce((a, b) => a + b, 0);
    return sumArr / arr.length;
  }
  return 0;
}

// load average for the past 1000 milliseconds calculated every 100
export function getCPULoadAVG(avgTime = 1000, delay = 100):Promise<number> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line no-bitwise
    const n = ~~(avgTime / delay);
    if (n <= 1) {
      reject(new Error('Error: interval to small'));
    }

    let i = 0;
    const samples:Array<number> = [];
    const avg1 = cpuAverage();

    const interval = setInterval(() => {
      // console.debug('CPU Interval: ', i);

      if (i >= n) {
        clearInterval(interval);
        // eslint-disable-next-line no-bitwise
        resolve(~~((arrAvg(samples) * 100)));
      }

      const avg2 = cpuAverage();
      const totalDiff = avg2.total - avg1.total;
      const idleDiff = avg2.idle - avg1.idle;

      samples[i] = (1 - idleDiff / totalDiff);

      i++;
    }, delay);
  });
}
