---
id: "v1-2-0-readiness"
title: "v1.2.0 Release Readiness"
category: "release"
created: "2026-06-01"
updated: "2026-06-01"
related_initiatives: []
tags: ["release","v1.2.0"]
---

## Verification Summary

- **167 tests pass** (11 suites)
- **Build clean** (`npm run build` completes without errors)
- **Package valid** (58.1KB tarball, 42 files)
- **Version bumped** to 1.2.0 in package.json and package-lock.json
- **CHANGELOG updated** with v1.2.0 release notes

## Features in this Release

1. **Wiki Stub Generation** — `WikiManager.stub()`, `wiki.stub` command, custom templates, broken link validation
2. **Bidirectional Wiki-Initiative Links** — Auto `## Referenced By` sections, `wiki.link`, `wiki.xref`, cross-reference APIs
3. **INDEX Auto-Sync** — `checkConsistency()`, `mdocs_index_check` tool, `.index-meta.json` tracking

## Publish Status

- [x] Git tag `v1.2.0` created and pushed
- [x] npm: `opencode-mdocs@1.2.0` published
- [x] GitHub release: https://github.com/bbaaxx/opencode-mdocs/releases/tag/v1.2.0
- [x] Release initiative marked done

## Related

- **Initiative**: `prepare-v1-2-0-release`
- **Testing Playbook**: `testing/new-features-playbook`