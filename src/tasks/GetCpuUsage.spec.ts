import GetCpuUsage from './GetCpuUsage';

import type { TaskOptions } from './Task';

describe('GetCpuUsage', () => {
  it('should calculate CPU usage', async () => {
    let result: string = 'initValue';
    const fakeClient = {
      publish: (_topic: string, taskResult: string) => {
        result = taskResult;
      },
    };
    const options: TaskOptions = { client: fakeClient } as TaskOptions;
    const task = new GetCpuUsage({ topic: 'dummy' }, options);
    await task.start();
    await task.end();
    const number = parseInt(result, 10);
    expect(number).not.toBeNaN();
    expect(number).toBeGreaterThanOrEqual(0);
  });
});
