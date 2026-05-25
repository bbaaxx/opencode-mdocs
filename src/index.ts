import { createPlugin } from './plugin';

export default (async ({ client, project, directory }: { client: any; project: any; directory: string }) => {
  return createPlugin(directory);
}) satisfies any;
