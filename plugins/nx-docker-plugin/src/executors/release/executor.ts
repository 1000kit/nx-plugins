import { ReleaseExecutorSchema } from './schema';
import * as semver from 'semver';
import type { ExecutorContext } from '@nx/devkit';
import * as gitSemVerTags from 'git-semver-tags';
import { promisify } from 'util';
import { exec } from 'child_process';
import { getBooleanInput } from '@nx-tools/core';

export default async function runExecutor(options: ReleaseExecutorSchema, context: ExecutorContext) {
  
  const _prefix = `[${context.projectName}/${context.target.command}]`;
  console.info('%s executing docker release ...', _prefix);
  // console.debug('%s options %s', _prefix, JSON.stringify(options, null, 2));

  const projectName = context.projectName as string;
  const tagPrefix = `${projectName}-`;

  const tags: string[] = await gitSemVerTags({tagPrefix: tagPrefix });  
  const versions = tags.map((tag) => tag.substring(tagPrefix.length));

  const [releaseVersion, preReleaseVersion] = versions.sort(semver.rcompare);
  if (semver.prerelease(releaseVersion) != null) {
    console.error('%s last tag is not release tag: %s ...', _prefix, releaseVersion)
    return {
      success: false,
    }
  }

  console.log('%s create docker image version: %s from version %s ...',_prefix, releaseVersion, preReleaseVersion);


  const prefix = 'tkit_docker'
  const push = getBooleanInput('push', { prefix, fallback: `${options.push}` || 'false' });

  const imageRcVersion = `${options.image}:${preReleaseVersion}`;
  const imageVersion = `${options.image}:${releaseVersion}`;

  try {
    await cmd(_prefix, `docker pull ${imageRcVersion}`);
    await cmd(_prefix, `docker tag ${imageRcVersion} ${imageVersion}`);
    if (push) {
       await cmd(_prefix, `docker push ${imageVersion}`);
    } else {
      console.info('%s skip push docker image %s to OCI repository', _prefix, imageVersion);
    }

  } catch (err) {    
    console.error('%s err in: %s', _prefix, err);
    return { success: false }
  }

  return {
    success: true,
  };
}


async function cmd(_prefix: string, cmd: string) {
  console.log('%s executing : %s', _prefix, cmd);
  const { stdout, stderr } = await promisify(exec)(cmd)
  stdout && console.log('%s stdout: %s', _prefix, stdout)
  stderr && console.error('%s stderr: %s', _prefix, stderr)
}