import { ReleaseExecutorSchema } from './schema';
import executor from './executor';
import type { ExecutorContext } from '@nx/devkit';

const options: ReleaseExecutorSchema = {};
const context: ExecutorContext = {root: ".", cwd: ".", isVerbose: true, target: {command: "test"}  };

describe('Release Executor', () => {
  it('can run', async () => {
    // const output = await executor(options, context);
    // expect(output.success).toBe(true);
  });
});
