# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2026-06-01

### Added

- **Wiki Stub Generation** — Added `WikiManager.stub()` with default and custom template support; `wiki.stub` and `wiki.update` commands for the mdocs tool; validation now reports broken `related_wiki` links as errors instead of warnings.
- **Bidirectional Wiki-Initiative Links** — Auto-generated `## Referenced By` sections in wiki entries listing all linking initiatives; `wiki.link` command for atomic bidirectional linking; `wiki.xref` command for wiki-to-wiki cross-references; `addRelatedInitiative()`, `getReferencedBy()`, and `addWikiCrossRef()` APIs.
- **INDEX Auto-Sync and Consistency** — `checkConsistency()` in both InitiativeManager and WikiManager detects missing files, orphan files, and stale indices; `mdocs_index_check` custom tool with `check` and `repair` modes; `.index-meta.json` timestamp tracking on every index regeneration.
- **Test Coverage** — Added 16 new tests for stub generation, bidirectional links, cross-references, and INDEX consistency (167 total tests).

### Changed

- Updated `mdocs-initiative` and `mdocs-workflow` skills with documentation for new features.

## [1.1.0] - 2026-05-31

### Added

- Added aggregate `mdocs` custom tool for initiative and wiki operations, including create/update/done/archive/delete/list, validation, and index sync commands.
- Added `mdocs_validate`, `mdocs_lookup`, and `mdocs_resume` tools for integrity checks, exact initiative resolution, and workflow handoff recovery.
- Expanded `mdocs_dispatch` context with search-ranked memory, recent audit events, blockers, handoff metadata, and related wiki context.
- Added wiki/initiative graph validation for broken references, missing backlinks, and completion-gate warnings.

### Changed

- Improved README tool documentation to reflect the full current custom tool surface.
- Included `CHANGELOG.md` in published package contents.
- Excluded compiled test files from release build artifacts.

### Fixed

- Wrapped custom tool results in object shapes expected by opencode custom tool contracts.
- Updated the integration smoke script to validate the current `plugin.tool` API.

## [1.0.2] - 2026-05-28

### Fixed

- Fixed absolute `/mdocs/` paths in skills and agent instructions that broke fresh-project installs; replaced with relative `./mdocs/` paths.
- All changes from 1.0.1 (opencode plugin compatibility): `tool` hook, `cfg.agent`, and compatibility tests.

## [1.0.1] - 2026-05-28

### Fixed

- Updated opencode plugin custom tools export from `tools` to `tool` so `mdocs_init`, `mdocs_status`, `mdocs_search`, `mdocs_dispatch`, and `mdocs_audit` appear in current opencode.
- Updated agent auto-registration from legacy `cfg.agents` array to current `cfg.agent['mdocs-orchestrator']` object shape.
- Added compatibility tests for current opencode plugin/config field names and default plugin export shape.

## [1.0.0] - 2026-05-28

### Added

- **Wiki Manager CRUD Operations** — Added read, update, delete, and findRelated methods to WikiManager for full wiki entry lifecycle management.
- **Initiative Priorities and Dependencies** — Added priority (critical/high/medium/low), dueDate, and dependsOn fields to initiatives. Added findBlocked, findOverdue, and listByPriority methods for project scheduling.
- **Full-Text Search** — Added SearchEngine class with inverted index implementation and `mdocs_search` custom tool for searching across initiatives and wiki by keyword.
- **Checkable Plan Items** — Plan items now support status tracking: pending (`- [ ]`), in-progress (`- [/]`), done (`- [x]`).
- **Audit Log and Event History** — Added AuditLog class with NDJSON format, query/summarize methods, automatic log rotation at 10MB (max 3 backups), and `mdocs_audit` custom tool.
- **mdocs_dispatch Custom Tool** — Assemble subagent context from an initiative and its related wiki entries, ready for Task tool handoffs.
- **mdocs_lint Custom Tool** — Lint initiatives and wiki entries for handoff readiness with scoring and issue reporting.
- **Auto-Register Agent and Skills** — Config hook automatically registers the bundled mdocs-orchestrator agent and appends the package's skills directory to the live config.
- **Workflow Tool Gates** — 9-step state machine enforces read/write/destructive bash permissions based on current workflow step.
- **Permission Hook Integration** — Auto-allows tools aligned with current workflow step, reducing permission fatigue.
- **Event Hook** — Records significant events (workflow.advance, initiative.create, wiki.create) to the active initiative's progress log.
- **Progress Tracking** — Every tool call during an active initiative is logged to that initiative's progress log with timestamps.
- **Test Suite** — Comprehensive test coverage with 88 tests across all managers, workflow engine, plugin hooks, search, linter, and audit log.
- **Local Development Setup** — `npm run setup:local` script creates a symlink for agent discovery during dogfooding.

### Changed

- **README** — Completely rewritten with accurate installation instructions, custom tool documentation, and architecture overview.
- **Agent Instructions** — Updated mdocs-orchestrator agent to reference `mdocs_dispatch` custom tool in the EXECUTE step.
- **Package Metadata** — Added repository URL, homepage, bugs URL, author, and expanded keywords in package.json.

### Fixed

- **Frontmatter Type Mismatch** — Fixed round-trip serialization between camelCase TypeScript fields and snake_case YAML frontmatter.
- **mdocs_status Tool Error** — Fixed custom tool registration API mismatch.
- **Local Agent Discovery** — Restored `.opencode/agents/` symlink mechanism to support both local development and consumer auto-registration.
- **Test-Run Portability** — Replaced hardcoded `/tmp/` path with `os.tmpdir()` for cross-platform compatibility.

## [0.1.0] - 2026-05-27

### Added

- Initial plugin structure with opencode hooks (config, tool.execute.before/after, event, permission.ask)
- MdocsManager for /mdocs directory initialization
- InitiativeManager for initiative CRUD and index generation
- WikiManager for wiki entry creation and category indices
- WorkflowEngine with 9-step state machine (IDLE → UNDERSTAND → DISCOVER → CONTEXT → PLAN → EXECUTE → VERIFY → REPORT → COMPLETE)
- SubagentAssembler for context assembly from initiatives and wiki entries
- mdocs_init and mdocs_status custom tools
- mdocs-orchestrator agent with workflow instructions
- mdocs-workflow and mdocs-initiative skills
- Bootstrap initiative that tracks plugin installation
- Self-referential design: plugin dogfoods its own system
