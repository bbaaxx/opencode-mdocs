---
id: "v1-1-0-readiness"
title: "v1.1.0 Release Readiness"
category: "release"
created: "2026-05-31"
updated: "2026-05-31"
related_initiatives: ["prepare-v1-1-0-release"]
tags: ["release","v1.1.0","verification"]
lifecycle: "stable"
knowledge_type: "release-note"
confidence: "high"
source_initiatives: ["prepare-v1-1-0-release"]
---

# v1.1.0 Release Readiness

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
- `npm view opencode-mdocs version` returned `1.0.2`, so `1.1.0` is not published yet.

## Publish Checklist

1. Review and commit release prep changes.
2. Tag `v1.1.0` after commit.
3. Run `npm publish --access public`.
4. Push `main` and tags.
5. Create GitHub release from the changelog entry.