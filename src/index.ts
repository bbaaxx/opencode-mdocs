import { createPlugin } from './plugin';

export default (async ({ client, project, directory }) => {
  return createPlugin(directory);
}) satisfies any;
