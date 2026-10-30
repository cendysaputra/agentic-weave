<!-- Detail for the weave-docs skill: READMEs. Sources: standard-readme spec, Write the Docs principles (research 2026-10-30). -->

# READMEs

## Library or package

standard-readme orders a library README as: title, short description, table of contents (optional under about 100 lines), install, usage, contributing, license; optional sections are security, background, API, and maintainers. Use it for open-source packages.

## Client project (agency)

A client site does not need the library skeleton. Its README answers five questions, in this order:

1. What this is: one sentence naming the site, the client, and the main stack.
2. How to run it locally, with the versions it was tested on and the date (`Tested with: PHP 8.3, WordPress 6.9, Node 22, 2026-10-30`).
3. How it deploys: where, by whom, which command or pipeline.
4. Where configuration lives: files and environment variable names, never their values.
5. What is non-standard: only what departs from the framework's defaults.

Then a contact line. Template: `assets/templates/README.project.md`.

## Skill or plugin README

One sentence on when it triggers, the files it contains, a real input and output, and its limits (what it does not handle and which skill does). Do not copy the skill's own instructions into the README.

## Badges

Keep a badge only when it shows live, true status (CI result, released version). A wall of badges on an internal repository is decoration.
