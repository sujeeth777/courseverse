# 🌍 Courseverse

**A global encyclopedia of courses and fields of study.**

> Here is a course. Here is what that course means, what you study in it, and what the major subjects are. Nothing more.

No career quiz. No personality test. No "you should choose this." No rankings. Just understanding the course.

## What's inside

- **226 courses & fields** — each with a plain-English explanation, the full "what do you study" subject list, main areas & specializations, degree/programme names, example countries and related fields.
- **The 11 broad fields** — the official backbone follows **UNESCO ISCED-F 2013**, the internationally agreed classification of education fields (00 Generic → 10 Services).
- **9 education levels** — the **ISCED 2011** ladder, from early childhood to doctoral.
- **9 qualification types** — certificates, diplomas, associate degrees, bachelor's, master's, professional degrees, doctorates — explained.
- **30 countries mapped** — same field, different names: B.Tech CSE (India), BSc (UK), BS (US), B.Sc. Informatik (Germany), Licence Informatique (France)…
- **Alias-aware search** — "CS" finds Computer Science, "InfoSec" finds Cybersecurity, "AI" finds Artificial Intelligence.
- **1,500+ programme names** — BSc, BTech, BEng, MBBS, LLB, PhD and their international equivalents, attached to every field.

## Pages

| Route | What it shows |
|---|---|
| `#/` | Hero + search, the 11 fields, featured courses, ISCED ladder |
| `#/browse` | All courses, filterable by field, searchable, paginated |
| `#/course/<slug>` | The full course page — what/why/subjects/degrees/aliases/countries/related |
| `#/fields`, `#/field/<slug>` | The 11-field universe and each field's contents |
| `#/degrees`, `#/degree/<slug>` | Qualification types explained |
| `#/levels`, `#/level/<code>` | The ISCED 2011 ladder |
| `#/countries`, `#/country/<name>` | Country layer |
| `#/search/<query>` | Full search results |
| `#/about` | The mission, data tiers and honest numbers |

## Run it

Pure static site — no build step, no dependencies, no backend.

```bash
# any static server works
python -m http.server 8123
# then open http://127.0.0.1:8123
```

Or just open `index.html` in a browser.

## Architecture

```
index.html            — shell (header, footer, fonts)
css/style.css         — design system (dark "cosmic atlas" theme)
js/data.js            — ISCED backbone: levels, qualifications, 11 fields, icons
js/courses-a.js…e.js  — the course encyclopedia (226 entries, A→E by field order)
js/app.js             — hash router, search engine, starfield, page renderers
```

### Data integrity

Every course entry follows the same shape:

```js
{ slug, name, field, aliases[], what, study[], specializations[],
  degrees: { bachelors[], masters[], doctoral[] },
  countries[], related[] }
```

All `field` codes, group references and `related` slugs are validated to resolve (see the integrity check in the commit history).

### Honest numbers

We don't claim "73,421 courses exist worldwide." There is no single global register of every programme title — universities create, rename, merge and discontinue programmes constantly. Courseverse builds a structured **ontology** (fields → specializations → subjects → programmes → qualifications → countries) grounded in UNESCO's classifications, with the real-world programme layer growing on top.

## License

MIT
