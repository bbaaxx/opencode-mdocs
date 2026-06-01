---
id: "prepare-v1-2-0-release"
title: "Prepare v1.2.0 Release"
status: "done"
created: "2026-06-01"
updated: "2026-06-01"
owner: ""
tags: ["release","v1.2.0"]
related_wiki: ["testing/new-features-playbook","release/v1-2-0-readiness"]
priority: "medium"
---

## Objective


## Plan
- [x] Review and audit all changes since v1.1.0 (3 commits: wiki stub, bidirectional links, INDEX sync)
- [x] Bump version to 1.2.0 in package.json and package-lock.json
- [x] Update CHANGELOG.md with v1.2.0 release notes
- [x] Address or document validation warnings (linked playbook to initiative; remaining warnings are historical/architectural docs from prior initiatives)
- [x] Verify all 167 tests pass and build succeeds (`npm test && npm run build`)
- [x] Run smoke tests and npm pack validation
- [x] Create git tag v1.2.0 and push to origin
- [x] Publish v1.2.0 to npm (OTP provided by user)
- [x] Create GitHub release with notes: https://github.com/bbaaxx/opencode-mdocs/releases/tag/v1.2.0
- [x] Update release wiki with v1.2.0 readiness summary

## Progress Log
- [2026-06-01T03:08:20.677Z] Created initiative via mdocs command
- [2026-06-01T03:15:00.000Z] Bumped version to 1.2.0 in package.json and package-lock.json
- [2026-06-01T03:15:00.000Z] Updated CHANGELOG.md with v1.2.0 release notes covering all three features
- [2026-06-01T03:15:00.000Z] Linked testing playbook to release initiative; documented remaining validation warnings as historical
- [2026-06-01T03:15:00.000Z] Verified: 167 tests pass, build succeeds, npm pack produces valid 58.1KB tarball
- [2026-06-01T03:15:00.000Z] Attempted npm publish — blocked by OTP requirement (2FA enabled on npm account)
- [2026-06-01T03:20:00.000Z] User provided OTP; npm publish succeeded: opencode-mdocs@1.2.0
- [2026-06-01T03:20:00.000Z] Created GitHub release: https://github.com/bbaaxx/opencode-mdocs/releases/tag/v1.2.0
- [2026-06-01T03:20:00.000Z] Created release wiki entry: release/v1-2-0-readiness
- [2026-06-01T03:20:00.000Z] Marked initiative done
- [2026-06-01T03:14:23.092Z] Marked done via mdocs command

## Artifacts
- `mdocs/initiatives/prepare-v1-2-0-release--2026-06-01.md` — this initiative