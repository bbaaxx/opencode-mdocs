---
id: "v1-1-0-readiness"
title: "v1.1.0 Release"
category: "release"
created: "2026-05-31"
updated: "2026-05-31"
related_initiatives: ["prepare-v1-1-0-release","prepare-v1-2-0-release"]
tags: ["release","v1.1.0","verification"]
lifecycle: "stable"
knowledge_type: "release-note"
confidence: "high"
source_initiatives: ["prepare-v1-1-0-release"]
---

# v1.1.0 Release

## Status

Published and released on 2026-05-31.

- npm: https://www.npmjs.com/package/opencode-mdocs/v/1.1.0
- GitHub release: https://github.com/bbaaxx/opencode-mdocs/releases/tag/v1.1.0
- Git tag: `v1.1.0`
- Release commit: `02f6913 chore(release): prepare v1.1.0`

## Prepared Artifacts

- `package.json` and `package-lock.json` bumped to `1.1.0`.
- `CHANGELOG.md` includes the `1.1.0` release notes.
- `README.md` documents the complete custom tool surface, including aggregate `mdocs` commands.
- `test-run.js` validates the current `plugin.tool` API and lists registered tools.
- `tsconfig.json` excludes `src/__tests__` from release builds; `npm run build` cleans `dist` before compiling.
- `package.json` includes `CHANGELOG.md` in published files.

## Verification Commands Passed

- `git diff --check`
- `npm test` — 145 tests passed.
- `npm run build`
- `node test-run.js`
- `npm pack --dry-run` — package contains 42 files, without compiled test files.
- Built plugin `mdocs_validate` returned `valid: true` with zero initiative/wiki/graph errors.
- `npm view opencode-mdocs version` returned `1.1.0` after publish.

## Publish Checklist

1. Review and commit release prep changes. ✅
2. Tag `v1.1.0` after commit. ✅
3. Run `npm publish --access public`. ✅
4. Push `main` and tags. ✅
5. Create GitHub release from the changelog entry. ✅
