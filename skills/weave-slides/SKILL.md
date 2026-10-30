---
name: weave-slides
description: "Filters slide decks that read as AI-generated: slides that are documents, bullet walls, label titles, template layouts, filler icons and stock photos, darkened or stretched images, emoji, and invented charts. Use when writing, designing, or reviewing a presentation or pitch deck. Load with weave-core."
---

# weave-slides

> Agentic Weave: Rules for AI Coding Agents. Slides and presentation skill

> Part of the Agentic Weave system. Read together with `weave-core`. This skill filters decks that look generated: every slide the same template, every point a bullet, every image a stock photo under a dark overlay. It cites core rules by number and never renumbers them.

## How to use this skill

- Load together with `weave-core` for any deck: a pitch, a talk, a client report, a lecture, or a deck built in HTML, Google Slides, PowerPoint, or Keynote.
- Write the outline before the design. Decide the one point of each slide (R-49), then the layout that carries it.
- Every entry has the same shape: **Tell** / **Why** / **Fix**, with the governing core rule cited as R-XX.
- The Delivery Gate in `weave-core` remains the gate. The checklist at the end supplements it.
- Indonesian decks: load `weave-copywriting-id` for the wording, and keep one form of address (kamu or Anda) through the deck.

## Structure

### The Deck Is a Document

- **Tell:** full paragraphs on every slide, small type, the speaker could stay home and email the file.
- **Why:** the audience reads ahead of the speaker and stops listening. A deck that must also work as a handout fails at both jobs.
- **Fix:** put the argument in the speaker notes and leave the slide the one line or image that supports it. When a document is needed, write the document (load `weave-docs`) and send it after.
- **Rule:** R-49.

### Bullet Walls

- **Tell:** five to eight bullets per slide, each a sentence fragment, every slide the same shape.
- **Why:** a list hides which point matters. Repeating the same shape on every slide is the template showing through.
- **Fix:** one point per slide. When several items really belong together, show the relation they have (a sequence, a comparison, a table of real values) instead of a list.
- **Rule:** R-49, R-40.

### Label Titles

- **Tell:** slide titles such as "Introduction", "Overview", "Key Benefits", "Our Solution", "Conclusion", "Q&A".
- **Why:** a label names the section, not the point. The audience gets nothing from the title alone.
- **Fix:** write the title as the claim the slide proves: "Checkout drops 40% of mobile users at the address step" (with the real number, R-18). Agenda and closing slides are optional; cut them when they only list labels.
- **Rule:** R-31, C-3.

### Opening and Closing Ceremony

- **Tell:** "Thank you!" and "Any questions?" slides, a "Let's dive in" slide, a mission-statement slide nobody asked for.
- **Why:** ceremony slides spend the audience's attention on nothing and read as a template.
- **Fix:** open on the problem or the result. End on the decision or next step you need from the room, with a name and a date.
- **Rule:** R-02, R-36.

## Visuals

### Template Layout on Every Slide

- **Tell:** title top left, bullets left, image right, on every slide; the same three-card row for every set of three.
- **Why:** the layout was chosen before the content, so it fits none of it. The deck looks like every other generated deck.
- **Fix:** choose the layout per slide from what it must show: one number large, two options side by side, a sequence left to right. Keep one grid, one type scale, and one accent color across the deck so variety stays coherent. Load `weave-ui` for type and color choices.
- **Rule:** R-40.

### Filler Icons and Stock Photos

- **Tell:** a generic icon next to every bullet, handshake and lightbulb photos, smiling people at laptops, AI-generated people.
- **Why:** the image says nothing the words did not, and the audience recognizes stock on sight.
- **Fix:** use a real screenshot, product photo, chart, diagram, or a photo of the actual team or place. When nothing real exists, use no image and give the words more room.
- **Rule:** R-17, R-31.

### Darkened, Stretched, or Cropped Images

- **Tell:** a photo under a 50% black overlay so white text reads; an image stretched out of its aspect ratio; a screenshot cropped so its labels are cut off; low-resolution images scaled up.
- **Why:** the image was forced to fit a layout instead of the layout fitting the image. Dark overlays turn photos into mud on projectors.
- **Fix:** keep the aspect ratio, crop deliberately, and put text beside the photo or on a solid area rather than over it. Check text contrast against WCAG 2.1 SC 1.4.3 (4.5:1 for normal text, 3:1 for large text).
- **Rule:** R-42, C-4.

### Emoji as Decoration

- **Tell:** 🚀 in the title, ✅ as bullets, 💡 before every tip.
- **Why:** decorative emoji is the most recognizable generated-deck tell, and it renders differently on every platform.
- **Fix:** remove it. Use a word, a number, or the layout to show category.
- **Rule:** R-04.

## Data

### Invented or Decorative Charts

- **Tell:** a bar chart with round numbers and no source, a growth line with no axis, "87% of users agree" with no study behind it.
- **Why:** the chart decorates a claim the data never made. One invented number discredits the whole deck.
- **Fix:** chart only real data, label axes and units, put the source and date under the chart, and title it with the finding. With no data yet, write `[DATA NEEDED: ...]` instead of drawing a shape (R-38).
- **Rule:** R-18, R-38, C-5.

### Chart Junk

- **Tell:** 3D pie charts, gradients on bars, legends far from the lines they name, every series in a different saturated color.
- **Why:** decoration slows reading and hides the comparison that matters.
- **Fix:** flat marks, direct labels on the series, one highlight color for the point of the slide and gray for the rest.
- **Rule:** R-31.

## Speaker Notes

- Notes hold what the speaker says; the slide holds what the audience must see. Write notes in full sentences in the speaker's voice, not a copy of the slide.
- Mark anything still unconfirmed in the notes (R-38) so it is checked before the talk.
- Run the timing: read the notes aloud against the slot length. A guide of about one slide per minute is common advice, not a measured rule; adjust to the content (C-6).

## Checking the Deck

- Present it at the real size: on a projector or a shared screen at the resolution the audience will see. Text that reads on a laptop can fail on a projector (C-4).
- For HTML decks, run the `weave-ui` checks (keyboard navigation, reduced motion, contrast) and test the export to PDF if the deck will be sent.
- Read only the titles in order. They should tell the argument on their own.
- For an outline written in Markdown, `npx agentic-weave check outline.md` flags label titles (`label-title`), em dashes, and stock phrases.

## Slides Skill Checklist

Run these alongside the Delivery Gate in `weave-core`. Every line below must be true:

- [ ] Each slide makes one point, and its title states that point (R-49, R-31)
- [ ] No bullet walls; related items show their real relation (R-49)
- [ ] No ceremony slides that carry no content (R-02, R-36, C-3)
- [ ] Layouts were chosen per slide, inside one grid and type scale (R-40)
- [ ] Every image is real and says something; no filler icons or stock people (R-17)
- [ ] No darkened, stretched, or cut-off images; text meets contrast (R-42)
- [ ] No decorative emoji (R-04)
- [ ] Every chart uses real data with axes, units, source, and date (R-18, C-5)
- [ ] Speaker notes hold the argument; unconfirmed facts are marked (R-38)
- [ ] The deck was checked at the size the audience will see it (C-4)
