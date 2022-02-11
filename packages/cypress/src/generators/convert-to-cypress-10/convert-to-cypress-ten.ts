import {
  formatFiles,
  installPackagesTask,
  Tree,
  updateJson,
} from '@nrwl/devkit';
import { forEachExecutorOptions } from '@nrwl/workspace/src/utilities/executor-options-utils';
import { CypressExecutorOptions } from '../../executors/cypress/cypress.impl';
import { updateProject } from './conversion.util';
import { cypressVersion } from '../../utils/versions';
import { CypressConvertOptions } from './schema';

async function normalizeOptions(options: CypressConvertOptions) {
  if (options.project && options.all) {
    throw new Error(
      'Cannot specify both --project and --all. They are mutually exclusive'
    );
  }

  if (!options.project && !options.all) {
    throw new Error(
      'Missing project to convert. Specify --project OR --all to convert all e2e projects'
    );
  }

  return options;
}

export async function convertCypressProject(
  tree: Tree,
  options: CypressConvertOptions
) {
  options = await normalizeOptions(options);

  if (options.all) {
    forEachExecutorOptions(
      tree,
      '@nrwl/cypress:cypress',
      (currentValue: CypressExecutorOptions, project) => {
        updateProject(tree, {
          ...options,
          project,
        });
      }
    );
  } else {
    updateProject(tree, options);
  }

  updateJson(tree, 'package.json', (json) => {
    json.devDependencies['cypress'] = cypressVersion;
    return json;
  });

  return () => {
    formatFiles(tree);
    installPackagesTask(tree);
  };
}

export default convertCypressProject;
