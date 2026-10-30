<!-- Detail for the weave-docs skill: content guides for non-technical clients. Source: ISO 24495-1:2023 plain language (research 2026-10-30); the structure is a recommendation. -->

# Client Handoff Guides

ISO 24495-1 defines plain language by its reader: relevant, easy to find, easy to understand, and usable by the people it is for. A client's content team looks for tasks, not features.

- One task per section, named as the task: "Mengganti foto banner beranda", "Menambah produk".
- Button and menu labels written exactly as they appear on the client's screen, in the dashboard's language ("Klik **Publish**" when the dashboard is in English).
- A screenshot per step with the area marked, and the date it was taken.
- The WordPress, Elementor, or Statamic version the guide was written against. A dashboard changes between versions; an undated screenshot drifts silently (R-46).
- A "do not change" section: global templates, ACF fields, and pages the code depends on.
- Who to contact and what to send (URL, screenshot, time).
- A short glossary for any developer term that cannot be avoided.

Template: `assets/templates/HANDOFF.md`. Passwords never go in the guide; say where they were shared.
