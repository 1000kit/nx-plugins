import { BuildExecutorSchema } from './schema';
import executor from './executor';
import type { ExecutorContext } from '@nx/devkit';

const options: BuildExecutorSchema = {};
const context: ExecutorContext = {root: ".", cwd: ".", isVerbose: true };

describe('Build Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context);
    expect(output.success).toBe(true);
  });
});
