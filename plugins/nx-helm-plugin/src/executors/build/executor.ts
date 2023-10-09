import { BuildExecutorSchema } from './schema';
import type { ExecutorContext } from '@nx/devkit';
import { promisify } from 'util';
import { exec } from 'child_process';
import * as fs from 'fs';
import { parse, stringify } from 'yaml';
import merge from 'lodash.merge';
import { getBooleanInput } from '@nx-tools/core';

export default async function runExecutor(options: BuildExecutorSchema, context: ExecutorContext) {
  
  const _prefix = `[${context.projectName}/${context.target.command}]`;

  console.info('%s executing helm package for version %s ...', _prefix, options.version);
  console.debug('%s options %s', _prefix, JSON.stringify(options, null, 2));

  const projSourceDir = context.projectsConfigurations.projects[context.projectName].sourceRoot;

  const chartName = options.chartName || context.projectName;
  const helmDir = projSourceDir + '/' + options.dir;

  const prefix = 'tkit_helm'
  const push = getBooleanInput('push', { prefix, fallback: `${options.push}` || 'false' });

  console.info('%s helm directory: %s', _prefix, helmDir)


  if (options.patchChartYaml) {
    patchYamlFile(_prefix, helmDir + '/Chart.yaml', options.patchChartYaml);
  }  
  
  if (options.patchValuesYaml) {
    patchYamlFile(_prefix, helmDir + '/values.yaml', options.patchValuesYaml);
  }
  
  try {
    await cmd(_prefix, `helm dependency update ${context.cwd}/${helmDir}`);

    await cmd(_prefix, `helm package ${context.cwd}/${helmDir} --version ${options.version}`);

    const packageFile = context.cwd + '/' + chartName + '-' + options.version + ".tgz";
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

function patchYamlFile(_prefix: string, file: string, data: any) {
  console.info('%s update file %s', _prefix, file)
  let content = fs.readFileSync(file, 'utf8');
  let yaml = parse(content);  
  yaml = merge(yaml, data);
  content = stringify(yaml);
  fs.writeFileSync(file, content, {encoding:'utf8',flag:'w'})
}

async function cmd(_prefix: string, cmd: string) {
  console.log('%s executing : %s', _prefix, cmd);
  const { stdout, stderr } = await promisify(exec)(cmd)
  stdout && console.log('%s stdout: %s', _prefix, stdout)
  stderr && console.error('%s stderr: %s', _prefix, stderr)
}