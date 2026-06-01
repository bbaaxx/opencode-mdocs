---
id: prepare-v1-release
title: Prepare v1 Release
status: done
created: 2026-05-27
updated: 2026-05-27
owner: system
tags: [release, v1, milestone, quality]
related_wiki: ["architecture/implementation-plan"]
---

## Objective
Prepare the opencode-mdocs plugin for its v1.0.0 release by resolving all remaining bugs, documentation gaps, and quality issues identified in the readiness audit.

## Context
- Current version: 0.1.0
- All feature initiatives are complete (14 total)
- A readiness audit identified 12 gaps and improvement opportunities
- The plugin needs polish before v1: bug fixes, documentation cleanup, and release hygiene
- Package.json version needs bump to 1.0.0

## Plan
- [x] Fix remaining bugs from readiness audit
  - [x] Fix test-run script path portability (use `os.tmpdir()`)
  - [x] Verify all hook behaviors are consistent
- [x] Documentation and quality
  - [x] Review and update README for accuracy (installation, custom tools, architecture)
  - [x] Add CHANGELOG.md with all v0.1.0 → v1.0.0 changes
  - [x] Verify package.json metadata (repository URL, author, keywords)
  - [x] Add LICENSE file (MIT)
- [x] Release hygiene
  - [x] Bump version in package.json to 1.0.0
  - [x] Ensure `files` array in package.json includes all necessary artifacts
  - [x] Verify build output (dist/) is clean and complete
  - [x] Add `.npmignore` if needed
  - [x] Tag release in git
- [x] Publish to npm (recommended over GitHub Packages)
  - [x] Verify package with `npm pack --dry-run`
  - [x] Publish: `npm publish --access public`
  - [x] Verify package on https://www.npmjs.com/package/opencode-mdocs
- [x] Final verification
  - [x] Run full test suite (all 88 tests must pass)
  - [x] Run linter on all initiatives and wiki (all scores ≥ 4)
  - [x] Run test-run.js script successfully
  - [x] Confirm all initiatives are marked `done`
- [x] Post-release
  - [x] Create GitHub release with changelog
  - [x] Update any downstream docs

## Acceptance Criteria
- Package version is 1.0.0
- All 88 tests passing
- All initiatives score ≥ 4 in linter
- No open initiatives remain
- README is accurate and complete
- CHANGELOG.md documents all changes
- Plugin installs and runs without manual setup (auto-registration works)
- Clean git history with meaningful commit messages

## Progress Log
- [2026-05-27] Created initiative file with comprehensive v1 release plan
- [2026-05-27] Referenced readiness audit findings (12 identified gaps)
- [2026-05-27] Defined acceptance criteria and verification steps
- [2026-05-27] Linter score: 5/5
- [2026-05-28] Fixed test-run.js portability with os.tmpdir()
- [2026-05-28] Added CHANGELOG.md and LICENSE (MIT)
- [2026-05-28] Bumped version to 1.0.0 in package.json
- [2026-05-28] All 88 tests passing, linter scores ≥ 4.5
- [2026-05-28] Published v1.0.0 to npm: https://www.npmjs.com/package/opencode-mdocs
- [2026-05-28] Tagged v1.0.0 in git and created GitHub release
- [2026-05-28] All initiatives marked done — v1 release complete

## Artifacts
- `mdocs/initiatives/prepare-v1-release--2026-05-27.md` — this initiative
