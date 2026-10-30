<!-- Detail for the weave-docs skill: ADRs and runbooks. Source: Michael Nygard, "Documenting Architecture Decisions" (2011), research 2026-10-30. -->

# Decision Records and Runbooks

## Architecture Decision Record

Nygard's format: Title, Status (proposed, accepted, deprecated, superseded), Context, Decision (active voice: "We will..."), Consequences (all of them: positive, negative, and neutral). Template: `assets/templates/ADR.md`.

An ADR earns its place when it records constraints the reader cannot see in the code: the client's budget, the team's skills, the hosting. Agency examples: Elementor or the block editor for client X; Statamic flat file or a database.

Tells: a generic context ("we need a scalable solution"), no rejected alternative, no negative consequence (R-48).

## Runbook

Not backed by a primary source in the research; this structure is a recommendation. Symptom (the exact error), impact, how to check (exact commands, with normal and broken output), fix (numbered, one command per step), how to verify recovery, escalation, and the date it was last tested. Template: `assets/templates/RUNBOOK.md`.

Tells: "check the logs" without a log path, "restart the service" without the command, no verification step.
