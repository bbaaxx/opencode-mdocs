---
id: "prepare-v1-2-0-release"
title: "Prepare v1.2.0 Release"
status: "active"
created: "2026-06-01"
updated: "2026-06-01"
owner: ""
tags: ["release","v1.2.0"]
related_wiki: ["testing/new-features-playbook"]
---

## Context

This release bundles three completed initiatives that significantly improve the wiki workflow:

1. **Wiki Stub Generation** (`add-wiki-stub-generation`) — `WikiManager.stub()` auto-creates wiki entries with default templates; `wiki.stub` and `wiki.update` commands added to the mdocs tool; validation now reports broken `related_wiki` links as errors.
2. **Bidirectional Wiki-Initiative Links** (`add-wiki-bidirectional-links`) — Auto-generated `## Referenced By` sections in wiki entries; `wiki.link` for initiative↔wiki bidirectional linking; `wiki.xref` for wiki-to-wiki cross-references; `addRelatedInitiative()`, `getReferencedBy()`, and `addWikiCrossRef()` APIs.
3. **INDEX Auto-Sync and Consistency** (`add-index-sync-and-consistency`) — `checkConsistency()` in both managers detects missing files, orphans, and staleness; `mdocs_index_check` custom tool with `check`/`repair` modes; `.index-meta.json` timestamp tracking.

Current state: All 167 tests pass, 3 commits pushed to main since v1.1.0.

## Plan

- [x] Review and audit all changes since v1.1.0 (3 commits: wiki stub, bidirectional links, INDEX sync)
- [x] Bump version to 1.2.0 in package.json and package-lock.json
- [x] Update CHANGELOG.md with v1.2.0 release notes
- [x] Address or document validation warnings (linked playbook to initiative; remaining warnings are historical/architectural docs from prior initiatives)
- [x] Verify all 167 tests pass and build succeeds (`npm test && npm run build`)
- [x] Run smoke tests and npm pack validation
- [x] Create git tag v1.2.0 and push to origin
- [ ] Publish v1.2.0 to npm (requires OTP - 2FA enabled)
- [ ] Create GitHub release with notes
- [ ] Update release wiki with v1.2.0 readiness summary

## Blockers

- **npm OTP required** — The npm account has 2FA enabled. Publishing requires a one-time password from the user's authenticator app. Steps:
  1. Visit the URL shown in the npm error output
  2. Authenticate with your npm account
  3. Run `npm publish` again with the OTP: `npm publish --otp <code>`

## Acceptance Criteria

- `package.json` version is `1.2.0`
- `CHANGELOG.md` has a `[1.2.0]` section documenting all three features
- All 167 tests pass
- `npm run build` completes without errors
- `npm pack` produces a valid tarball with expected files
- Git tag `v1.2.0` exists on the release commit
- npm registry shows `opencode-mdocs@1.2.0`

## Progress Log
- [2026-06-01T03:08:20.677Z] Created initiative via mdocs command
- [2026-06-01T03:15:00.000Z] Bumped version to 1.2.0 in package.json and package-lock.json
- [2026-06-01T03:15:00.000Z] Updated CHANGELOG.md with v1.2.0 release notes covering all three features
- [2026-06-01T03:15:00.000Z] Linked testing playbook to release initiative; documented remaining validation warnings as historical
- [2026-06-01T03:15:00.000Z] Verified: 167 tests pass, build succeeds, npm pack produces valid 58.1KB tarball
n- [2026-06-01T03:15:00.000Z] Created and pushed git tag `v1.2.0` to origin
- [2026-06-01T03:15:00.000Z] Attempted npm publish — blocked by OTP requirement (2FA enabled on npm account)

## Artifacts
- `mdocs/initiatives/prepare-v1-2-0-release--2026-06-01.md` — this initiative
