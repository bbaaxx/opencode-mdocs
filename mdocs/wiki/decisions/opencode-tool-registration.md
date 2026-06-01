---
id: opencode-tool-registration
title: Opencode Plugin Tool Registration API
category: decisions
created: 2026-05-27
updated: 2026-06-01
related_initiatives: [fix-mdocs-status-error, fix-frontmatter-type-mismatch]
tags: [plugin, api, tools, opencode]
lifecycle: stable
knowledge_type: fix-pattern
confidence: high
source_initiatives: [fix-mdocs-status-error]
supersedes: []
---

## Problem
Custom tools in opencode plugins must be registered with the correct key and method name. Using incorrect names results in runtime errors like:

```
pA.execute is not a function. (In 'pA.execute(hA,Q)', 'pA.execute' is undefined)
```

## Correct API

Opencode expects custom tools under the **`tools`** (plural) key, with each tool having an **`execute`** method:

```typescript
return {
  // ... hooks ...
  
  tools: {
    my_tool_name: {
      description: "What this tool does",
      execute: async (args: any) => {
        // Tool implementation
        return { result: "success" };
      }
    }
  }
};
```

## Common Mistakes

| Wrong | Right |
|-------|-------|
| `tool: { ... }` (singular) | `tools: { ... }` (plural) |
| `handler: async () => {}` | `execute: async () => {}` |

## Reference

This pattern is consistent with opencode's internal tool registration where the framework calls `.execute()` on registered tool objects. Using `handler` or the singular `tool` key causes the tool to be either unreachable or non-executable.

## Decision

All custom tools in opencode-mdocs must follow the `tools` + `execute` convention. This is now enforced by the plugin architecture and documented here for future reference.
