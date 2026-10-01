# UniPlus KOC Work Gallery

A Notion-style gallery for reviewing KOC submissions. The front page has one name card per KOC, and each card opens everything that person has claimed across Maths, Chem, Physics, Bio and IS — pictures, videos and interactive tools.

No build step, no server, no dependencies. Open `index.html` in a browser and it works, whether that is a double-click from disk or a hosted URL.

## Two ways to open it

| | |
|---|---|
| **Just looking** | double-click `index.html` |
| **Posting or reviewing** | double-click `start-board.cmd`, then use http://localhost:8123 |

Both show exactly the same gallery. The difference is only where your changes can go: under `start-board.cmd` the **Save** button writes `data/state.js` in the repo directly, while opening the file on its own leaves the browser no way to write to disk, so Save downloads `state.js` for you to drop into `data/` yourself. Stop the server with `Ctrl+C` in its window.

## Reviewing work

| | |
|---|---|
| Navigate | Gallery → KOC → work |
| Search everything | type in the search box, or press `/` |
| Share a review | open a work and copy its **Review link** |
| Attach the task | paste its Notion URL into **Notion task link**, then Save |
| Close a work | `Esc` |

A KOC page keeps all of that person's work together even when the tasks cover several subjects. Each work page has its own direct review link and can store the matching Notion task URL.

## Communication boards

There is an all-team board on the front page. Type a name once and it is remembered. `Ctrl + Enter` posts.

Board messages and saved Notion task links live in `data/state.js`. Anything you have typed but not saved is marked **not saved yet** and counted in the **Save** button in the top bar.

## Saving and getting it onto GitHub

1. Press **Save** in the top bar. The count tells you how many changes are waiting.
2. Under `start-board.cmd` this writes `data/state.js` immediately. Otherwise it downloads `state.js` and you replace `data/state.js` with it.
3. Ask Cursor to upload, and it commits `data/state.js` and pushes.

Nothing is pushed automatically. Saving and uploading are separate steps on purpose, so you can review and tidy the wording before the team sees it.

## For KOCs — submitting work

You only ever touch **one folder**: `content/<subject>/<your-name>/`. Nobody else edits it, so your pushes cannot conflict with another team's.

1. Put your file in your folder, e.g. `content/bio-is/jeff/chapter-2-comics.png`.
2. Add a card to the top of the list in your `works.js`.
3. Commit and push both files.

```js
KOC.works('bio-is', 'jeff', [
  {
    id: 'chapter-2-comics',                                  // unique within your folder, url-safe
    title: 'Chapter 2 Comics',
    type: 'image',                                           // see the table below
    subject: 'Bio',                                          // subject of this task
    chapter: 'Bio Ch. 2',
    submitted: '2026-08-20',                                 // YYYY-MM-DD
    tags: ['Comics', 'IG post'],
    cover: 'content/bio-is/jeff/chapter-2-cover.png',        // optional thumbnail
    src: 'content/bio-is/jeff/chapter-2-comics.png',
    notes: 'What it is, who it is for, what is still unfinished.'
  }
  // …older cards below
]);
```

Paths are written from the repo root, not relative to your folder.

`subject` belongs to the individual task, not to the KOC. This is what lets one KOC claim work from several subjects while keeping one name card. For older cards without this field, the gallery infers the task subject from `chapter`, then falls back to the folder's roster group.

### Work types

| `type` | What shows in the viewer | Fields |
|---|---|---|
| `image` | full picture | `src` |
| `gallery` | grid of pictures, click to enlarge | `srcs: [...]` |
| `video` | player with controls | `src`, optional `cover` as poster |
| `interactive` | your HTML tool, embedded live | `src` pointing at an `.html` |
| `pdf` | embedded document | `src` |
| `link` | button out to an external tool | `url` |

Only `title` and `type` are strictly required — a card with a missing file still appears, and the viewer says the file is not committed yet, which is a useful way to flag work in progress.

### A new KOC joins

Two edits, both by the team lead: add the person to `data/roster.js`, and add one line to `data/manifest.js` pointing at their new `works.js`.

## Layout

```
index.html               the whole app shell
start-board.cmd          opens the gallery with saving switched on
assets/css/app.css       styling
assets/js/app.js         routing, gallery, viewer, boards, review state
tools/serve.mjs          tiny local server, the only thing that can write to disk
data/roster.js           KOC names and administrative groups (lead edits)
data/manifest.js         one line per KOC works file        (lead edits)
data/state.js            board messages + review decisions  (dashboard writes)
content/<subject>/<koc>/
    works.js             that KOC's cards                   (KOC edits)
    *.png *.mp4 *.html   that KOC's files                    (KOC edits)
```

`data/state.js` is the one file two people can collide on, since it holds everyone's board messages. It is small and plain, so a conflict is easy to resolve by hand — keep both sets of posts.

Data files are plain `<script>` files rather than JSON on purpose: browsers block `fetch()` of local JSON over `file://`, so JSON would have forced everyone to run a web server just to look at the gallery.

## Hosting notes for IT

Any static host works — GitHub Pages from the repo root needs no configuration. Points worth knowing:

- Paths are relative, so serving from a subdirectory is fine.
- Deep links work: `#/maths/hugo/balance-quest-inequalities` opens straight into that work.
- `tools/serve.mjs` is for local use only — do not run it as the public host. On a static host the boards stay readable, and Save falls back to downloading `state.js`.
- Interactive tools are embedded in an iframe, so a tool that breaks cannot break the gallery.
- Suggest a `CODEOWNERS` entry per KOC folder so each team's push only needs their own lead's approval.

## Sample content

Placeholder review assets (posters, the sample reel, and the demo interactive tools) have been removed. Cards in `content/` are real submissions. A KOC with nothing submitted yet has an empty list in their `works.js`.
