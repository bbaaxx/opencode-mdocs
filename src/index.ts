import { createPlugin } from './plugin';

function toToolResult(value: any) {
  if (typeof value === 'string') return value;
  if (value && typeof value.output === 'string') return value;
  return {
    output: JSON.stringify(value, null, 2),
    metadata: value && typeof value === 'object' ? value : { value }
  };
}

function wrapToolResults(plugin: any) {
  if (!plugin?.tool) return plugin;
  for (const definition of Object.values(plugin.tool) as any[]) {
    if (!definition || typeof definition.execute !== 'function') continue;
    const execute = definition.execute.bind(definition);
    definition.execute = async (...args: any[]) => toToolResult(await execute(...args));
  }
  return plugin;
}

export default (async ({ client, project, directory }: { client: any; project: any; directory: string }) => {
  return wrapToolResults(createPlugin(directory));
}) satisfies any;
