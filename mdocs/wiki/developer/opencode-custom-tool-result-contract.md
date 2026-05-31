---
id: opencode-custom-tool-result-contract
title: Opencode Custom Tool Result Contract
category: developer
created: 2026-05-31
updated: 2026-05-31
related_initiatives: [fix-mdocs-first-activation-hook-error]
tags: [opencode, plugin, custom-tools, tool-result, debugging]
lifecycle: stable
knowledge_type: fix-pattern
confidence: high
---

## Summary

Opencode custom tool `execute` functions must return a valid ToolResult: either a string or an object with an `output: string` field. Returning a raw JSON object can crash the UI/tool bridge with errors like:

```text
undefined is not an object (evaluating 'p.split')
```

## Symptom

The mdocs plugin registered and direct tool execution worked in tests, but the first agent attempt to use `mdocs_status` showed a popup error. The problem persisted in a fresh opencode session until tool results were wrapped in the expected shape.

## Fix Pattern

Keep internal APIs free to return structured objects, but wrap plugin-exported tool results for opencode runtime:

```ts
function toToolResult(value: any) {
  if (typeof value === 'string') return value;
  if (value && typeof value.output === 'string') return value;
  return {
    output: JSON.stringify(value, null, 2),
    metadata: value && typeof value === 'object' ? value : { value }
  };
}
```

Also provide explicit `args` schemas on custom tools so opencode can render and validate arguments consistently.

## Verification

- Regression test should call the plugin default export, invoke a custom tool, and assert `typeof result.output === 'string'`.
- User-level verification should restart opencode and make the affected custom tool the first mdocs tool call in a fresh session.
