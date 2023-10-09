import { ReleaseExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';
import * as gitSemVerTags from 'git-semver-tags';
import * as semver from 'semver';
import { promisify } from 'util';
import { exec } from 'child_process';
import { getBooleanInput } from '@nx-tools/core';

export default async function runExecutor(options: ReleaseExecutorSchema, context: ExecutorContext) {
  const _prefix = `[${context.projectName}/${context.target.command}]`;

  console.info('%s executing helm release ...', _prefix);
  // console.debug('%s options %s', _prefix, JSON.stringify(options, null, 2));
  
  const projectName = context.projectName as string;
  const tagPrefix = `${projectName}-`;

  const tags: string[] = await gitSemVerTags({tagPrefix: tagPrefix });  
  const versions = tags.map((tag) => tag.substring(tagPrefix.length));
  const chartName = options.chartName || context.projectName;

  let [releaseVersion, preReleaseVersion] = versions.sort(semver.rcompare);
  if (semver.prerelease(releaseVersion) != null) {
    console.error('%s last tag is not release tag: %s ...', _prefix, releaseVersion)
    return {
      success: false,
    }
  }

  console.log('%s create helm package version: %s from version %s ...',_prefix, releaseVersion, preReleaseVersion);

  const prefix = 'tkit_helm'
  const push = getBooleanInput('push', { prefix, fallback: `${options.push}` || 'false' });
  const pullHelm = `${options.registry}/${chartName}`

  try {
    await cmd(_prefix, `helm pull ${pullHelm} --version ${preReleaseVersion} --untar --untardir ${context.cwd}/target`);

    await cmd(_prefix, `helm package ${context.cwd}/target/${chartName} --version ${releaseVersion}`);

    const packageFile = context.cwd + '/' + chartName + '-' + releaseVersion + ".tgz";
    if (push) {
      await cmd(_prefix, `helm push ${packageFile} ${options.registry}`);
    } else {
      console.info('%s skip push release version of the helm chart file %s', _prefix, packageFile);
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