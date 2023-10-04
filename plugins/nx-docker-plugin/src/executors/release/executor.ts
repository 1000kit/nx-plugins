import { ReleaseExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';

export default async function runExecutor(options: ReleaseExecutorSchema, context: ExecutorContext) {
  
  const _prefix = `[${context.projectName}/${context.target.command}]`;
  console.info('%s executing docker release ...', _prefix);
  console.debug('%s options %s', _prefix, JSON.stringify(options, null, 2));

  return {
    success: true,
  };
}
