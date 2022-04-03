import CheckProcess from './CheckProcess';

import type { TaskOptions } from './Task';

describe('checkProcess', () => {
  it('should find existing process', async () => {
    let result: string = 'initValue';
    const fakeClient = {
      publish: (_topic: string, taskResult: string) => {
        result = taskResult;
      },
    };
    const options: TaskOptions = { client: fakeClient } as TaskOptions;
    const task = new CheckProcess({ topic: 'dummy', process: 'node' }, options);
    await task.start();
    await task.end();
    expect(result).toEqual('1');
  });

  it('should not find non existing process', async () => {
    let result: string = 'initValue';
    const fakeClient = {
      publish: (_topic: string, taskResult: string) => {
        result = taskResult;
      },
    };
    const options: TaskOptions = { client: fakeClient } as TaskOptions;
    const task = new CheckProcess({ topic: 'dummy', process: 'somerandomstringhere' }, options);
    await task.start();
    await task.end();
    expect(result).toEqual('0');
  });
});
