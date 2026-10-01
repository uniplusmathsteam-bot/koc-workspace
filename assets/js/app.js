/*
 * UniPlus KOC Work Gallery
 *
 * Runs with no build step and no server: data arrives as classic <script>
 * files (data/roster.js, content/<subject>/<koc>/works.js) so opening
 * index.html straight from disk behaves the same as the hosted copy.
 */
window.KOC = (function () {
  'use strict';

  var subjects = [];
  var worksBySubjectKoc = {};   // "subject/koc" -> [work]
  var pendingFiles = [];
  var missingFiles = [];

  var STATUSES = {
    pending:  { label: 'Pending review', tone: 'amber', cls: 'pend' },
    approved: { label: 'Approved',       tone: 'green', cls: 'ok' },
    revise:   { label: 'Needs revision', tone: 'red',   cls: 'rev' }
  };

  var TYPES = {
    image:       { label: 'Image',       icon: '🖼️' },
    gallery:     { label: 'Gallery',     icon: '🗂️' },
    video:       { label: 'Video',       icon: '🎬' },
    interactive: { label: 'Interactive', icon: '🧩' },
    pdf:         { label: 'PDF',         icon: '📄' },
    link:        { label: 'Link',        icon: '🔗' }
  };

  var REVIEW_KEY = 'uniplus-koc-review-v1';
  var THEME_KEY = 'uniplus-koc-theme';
  var BOARD_KEY = 'uniplus-koc-board-v1';
  var AUTHOR_KEY = 'uniplus-koc-author';

  var basePosts = [];         // board posts already published to data/state.js
  var baseReviews = {};       // review decisions already published
  var draft = { posts: [], removed: [] };   // typed here, not published yet
  var composing = {};         // scope -> textarea contents, kept across re-renders
  var canSave = false;        // true when the local save server is running

  /* ---------------- data registration (called by data files) ---------------- */

  function roster(list) {
    subjects = list || [];
  }

  function manifest(paths) {
    pendingFiles = pendingFiles.concat(paths || []);
  }

  function board(posts) { basePosts = posts || []; }

  function reviews(map) { baseReviews = map || {}; }

  function works(subjectId, kocId, list) {
    worksBySubjectKoc[subjectId + '/' + kocId] = (list || []).map(function (w, i) {
      return normalise(w, subjectId, kocId, i);
    });
  }

  function normalise(w, subjectId, kocId, i) {
    var out = {};
    for (var k in w) if (Object.prototype.hasOwnProperty.call(w, k)) out[k] = w[k];
    out.subjectId = subjectId;
    out.kocId = kocId;
    out.type = TYPES[out.type] ? out.type : 'link';
    out.id = out.id || slug(out.title || 'work-' + (i + 1));
    out.status = STATUSES[out.status] ? out.status : 'pending';
    out.tags = out.tags || [];
    out.key = subjectId + '/' + kocId + '/' + out.id;
    return out;
  }

  /* ---------------- small helpers ---------------- */

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(id) { return document.getElementById(id); }

  function findSubject(id) {
    for (var i = 0; i < subjects.length; i++) if (subjects[i].id === id) return subjects[i];
    return null;
  }

  function findKoc(subject, id) {
    if (!subject) return null;
    for (var i = 0; i < subject.kocs.length; i++) if (subject.kocs[i].id === id) return subject.kocs[i];
    return null;
  }

  function allKocProfiles() {
    var byId = {}, out = [];
    subjects.forEach(function (s) {
      s.kocs.forEach(function (k) {
        var profile = byId[k.id];
        if (!profile) {
          profile = byId[k.id] = {
            id: k.id,
            name: k.name,
            icon: k.icon,
            leader: !!k.leader,
            memberships: []
          };
          out.push(profile);
        }
        profile.leader = profile.leader || !!k.leader;
        profile.memberships.push({ subject: s, koc: k });
      });
    });
    return out;
  }

  function findKocProfile(id) {
    var profiles = allKocProfiles();
    for (var i = 0; i < profiles.length; i++) if (profiles[i].id === id) return profiles[i];
    return null;
  }

  function worksOf(subjectId, kocId) {
    return worksBySubjectKoc[subjectId + '/' + kocId] || [];
  }

  function worksOfKoc(kocId) {
    var out = [];
    Object.keys(worksBySubjectKoc).forEach(function (key) {
      if (key.slice(key.lastIndexOf('/') + 1) === kocId) {
        out = out.concat(worksBySubjectKoc[key]);
      }
    });
    return out;
  }

  function worksOfSubject(subjectId) {
    var s = findSubject(subjectId), out = [];
    if (!s) return out;
    s.kocs.forEach(function (k) { out = out.concat(worksOf(subjectId, k.id)); });
    return out;
  }

  function allWorks() {
    var out = [];
    Object.keys(worksBySubjectKoc).forEach(function (key) {
      out = out.concat(worksBySubjectKoc[key]);
    });
    return out;
  }

  function taskSubject(work) {
    if (work.subject) return work.subject;
    var chapter = String(work.chapter || '').trim();
    var match = chapter.match(/^(.+?)(?:\s*[·|—]\s*|\s+(?:Ch(?:apter)?|Unit)\.?\s*\d)/i);
    if (match && match[1]) return match[1].trim();
    var source = findSubject(work.subjectId);
    return source ? source.name : 'General';
  }

  function taskSubjects(list) {
    var seen = {}, out = [];
    list.forEach(function (work) {
      var name = taskSubject(work);
      var key = name.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        out.push(name);
      }
    });
    return out;
  }

  function prettyDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function plural(n, one, many) {
    return n + ' ' + (n === 1 ? one : (many || one + 's'));
  }

  /* ---------------- review state ----------------
     Three layers, each overriding the one before: the status the KOC declared
     in their works file, the decisions already published to data/state.js, and
     whatever has been changed here but not saved yet. */

  var review = {};

  function loadReview() {
    try { review = JSON.parse(localStorage.getItem(REVIEW_KEY)) || {}; }
    catch (e) { review = {}; }
  }

  function saveReview() {
    try { localStorage.setItem(REVIEW_KEY, JSON.stringify(review)); } catch (e) { /* private mode */ }
  }

  function decision(work) {
    return review[work.key] || baseReviews[work.key] || null;
  }

  function statusOf(work) {
    var r = decision(work);
    return (r && r.status) || work.status;
  }

  function notesOf(work) {
    var r = decision(work);
    return (r && r.notes) || '';
  }

  function taskLinkOf(work) {
    var r = decision(work);
    if (r && Object.prototype.hasOwnProperty.call(r, 'taskUrl')) return r.taskUrl;
    return work.taskUrl || '';
  }

  function setReview(work, patch) {
    var r = {}, prev = decision(work) || {};
    for (var a in prev) r[a] = prev[a];
    for (var b in patch) r[b] = patch[b];
    r.at = new Date().toISOString();
    r.by = authorName() || 'unsigned';
    review[work.key] = r;
    saveReview();
  }

  function rollup(list) {
    var out = { total: list.length, pending: 0, approved: 0, revise: 0 };
    list.forEach(function (w) { out[statusOf(w)]++; });
    return out;
  }

  /* ---------------- communication board ---------------- */

  function authorName() {
    try { return localStorage.getItem(AUTHOR_KEY) || ''; } catch (e) { return ''; }
  }

  function setAuthorName(v) {
    try { localStorage.setItem(AUTHOR_KEY, v); } catch (e) { /* ignore */ }
  }

  function loadDraft() {
    try {
      var d = JSON.parse(localStorage.getItem(BOARD_KEY));
      if (d) draft = { posts: d.posts || [], removed: d.removed || [] };
    } catch (e) { /* ignore */ }
  }

  function saveDraft() {
    try { localStorage.setItem(BOARD_KEY, JSON.stringify(draft)); } catch (e) { /* ignore */ }
  }

  function isPublished(id) {
    for (var i = 0; i < basePosts.length; i++) if (basePosts[i].id === id) return true;
    return false;
  }

  // Published posts first, so a draft that has since been saved collapses into it.
  function mergedPosts() {
    var seen = {}, out = [];
    basePosts.concat(draft.posts).forEach(function (p) {
      if (seen[p.id] || draft.removed.indexOf(p.id) > -1) return;
      seen[p.id] = 1;
      out.push(p);
    });
    return out;
  }

  // Posts carry either a Z or a +08:00 timestamp, so compare real time, not text.
  function stamp(iso) {
    var t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  }

  function postsFor(scope) {
    return mergedPosts()
      .filter(function (p) { return p.scope === scope; })
      .sort(function (a, b) { return stamp(b.at) - stamp(a.at); });
  }

  function addPost(scope) {
    var text = (composing[scope] || '').trim();
    if (!text) return;
    if (!authorName()) {
      toast('Add your name first so the team knows who posted.', true);
      var who = document.querySelector('[data-board-author]');
      if (who) who.focus();
      return;
    }
    draft.posts.push({
      id: 'p-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      scope: scope,
      author: authorName(),
      at: new Date().toISOString(),
      body: text
    });
    composing[scope] = '';
    saveDraft();
    render();
  }

  function removePost(id) {
    var kept = draft.posts.filter(function (p) { return p.id !== id; });
    if (kept.length !== draft.posts.length) draft.posts = kept;
    if (isPublished(id) && draft.removed.indexOf(id) < 0) draft.removed.push(id);
    saveDraft();
    render();
  }

  /* Unsaved work = drafts not yet in data/state.js. Anything that has since been
     published stops counting, so the badge self-corrects after a save. */
  function unsaved() {
    var n = 0;
    draft.posts.forEach(function (p) { if (!isPublished(p.id)) n++; });
    draft.removed.forEach(function (id) { if (isPublished(id)) n++; });
    Object.keys(review).forEach(function (k) {
      var mine = review[k], live = baseReviews[k] || {};
      if ((mine.status || '') !== (live.status || '') ||
          (mine.notes || '') !== (live.notes || '') ||
          (mine.taskUrl || '') !== (live.taskUrl || '')) n++;
    });
    return n;
  }

  function stateFileText(posts, revs) {
    return '/*\n' +
      ' * Published dashboard state: communication board posts and review decisions.\n' +
      ' *\n' +
      ' * The dashboard writes this file when you press Save, so it is the one file\n' +
      ' * that carries board messages and approvals into the repo. Hand-editing is\n' +
      ' * fine as long as the shape stays the same.\n' +
      ' */\n' +
      'KOC.board(' + JSON.stringify(posts, null, 2) + ');\n\n' +
      'KOC.reviews(' + JSON.stringify(revs, null, 2) + ');\n';
  }

  function save() {
    var posts = mergedPosts().sort(function (a, b) { return stamp(a.at) - stamp(b.at); });
    var revs = {};
    Object.keys(baseReviews).forEach(function (k) { revs[k] = baseReviews[k]; });
    Object.keys(review).forEach(function (k) { revs[k] = review[k]; });

    if (!canSave) {
      download('state.js', stateFileText(posts, revs));
      toast('Downloaded state.js — put it in the data/ folder, replacing the old one. ' +
            'Run start-board.cmd instead and this button saves straight into the repo.', false, 11000);
      return;
    }

    fetch('api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ posts: posts, reviews: revs })
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || 'unknown error');
        basePosts = posts;
        baseReviews = revs;
        draft = { posts: [], removed: [] };
        review = {};
        saveDraft();
        saveReview();
        toast('Saved to data/state.js. Ask Cursor to upload when you want it on GitHub.');
        render();
      })
      .catch(function (e) { toast('Could not save: ' + e.message, true, 9000); });
  }

  function download(name, text) {
    var blob = new Blob([text], { type: 'text/javascript' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  var toastTimer;

  function toast(msg, bad, ms) {
    var t = el('toast');
    t.textContent = msg;
    t.className = 'toast' + (bad ? ' bad' : '');
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 6000);
  }

  function initials(name) {
    var parts = String(name).replace(/^(Ms|Mr|Dr)\.?\s+/i, '').split(/\s+/).filter(Boolean);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  var AVATARS = ['#3b6fd4', '#1f9d55', '#d97706', '#7c3aed', '#c2410c', '#0e7490', '#be185d'];

  function avatarColour(name) {
    var n = 0;
    for (var i = 0; i < name.length; i++) n = (n + name.charCodeAt(i)) % 997;
    return AVATARS[n % AVATARS.length];
  }

  function prettyStamp(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    });
  }

  function boardCard(scope, title, blurb) {
    var posts = postsFor(scope);

    var list = posts.length
      ? '<ul class="posts">' + posts.map(function (p) {
          var fresh = !isPublished(p.id);
          return '<li class="post">' +
            '<span class="avatar" style="background:' + avatarColour(p.author) + '">' + esc(initials(p.author)) + '</span>' +
            '<div class="post-main">' +
              '<div class="post-meta"><b>' + esc(p.author) + '</b>' +
                '<span>' + esc(prettyStamp(p.at)) + '</span>' +
                (fresh ? '<span class="tag amber">not saved yet</span>' : '') +
              '</div>' +
              '<div class="post-body">' + esc(p.body) + '</div>' +
            '</div>' +
            '<button class="post-del" data-board-del="' + esc(p.id) + '" title="Delete this message" aria-label="Delete">×</button>' +
          '</li>';
        }).join('') + '</ul>'
      : '<div class="posts-empty">No messages yet. Write the first one.</div>';

    return '<section class="board">' +
      '<div class="board-head">' +
        '<h2>📣 ' + esc(title) + '</h2>' +
        '<span class="hint">' + esc(blurb) + '</span>' +
        '<span class="board-count">' + plural(posts.length, 'message') + '</span>' +
      '</div>' +
      '<div class="compose">' +
        '<input class="who-input" data-board-author placeholder="Your name" value="' + esc(authorName()) + '">' +
        '<textarea data-board-input data-scope="' + esc(scope) + '" rows="2" ' +
          'placeholder="Write a message for the team…"></textarea>' +
        '<div class="compose-foot">' +
          '<span class="hint">Ctrl + Enter posts</span>' +
          '<button class="btn primary" data-board-post="' + esc(scope) + '">Post</button>' +
        '</div>' +
      '</div>' +
      list +
    '</section>';
  }

  // render() rebuilds the page, so put half-typed messages back in the box.
  function restoreComposing() {
    var box = document.querySelector('[data-board-input]');
    if (box) box.value = composing[box.getAttribute('data-scope')] || '';
  }

  /* ---------------- routing ---------------- */

  var route = { subject: null, koc: null, workSubject: null, work: null };
  var query = '';

  function parseHash() {
    var raw = (location.hash || '').replace(/^#\/?/, '');
    var parts = raw.split('/').filter(Boolean).map(decodeURIComponent);
    if (parts[0] === 'koc') {
      return {
        subject: null,
        koc: parts[1] || null,
        workSubject: parts[2] || null,
        work: parts[3] || null
      };
    }
    // Keep old #/subject/koc/work links working after the KOC-first redesign.
    return {
      subject: parts[0] || null,
      koc: parts[1] || null,
      workSubject: parts[0] || null,
      work: parts[2] || null
    };
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function onHashChange() {
    route = parseHash();
    render();
  }

  /* ---------------- rendering ---------------- */

  function render() {
    var koc = route.koc ? findKocProfile(route.koc) : null;

    renderCrumbs(koc);

    if (query) renderSearch();
    else if (koc) renderKoc(koc);
    else renderHome();

    restoreComposing();
    renderSaveButton();

    var work = null;
    if (koc && route.work) {
      worksOfKoc(koc.id).forEach(function (w) {
        if (w.id === route.work && (!route.workSubject || w.subjectId === route.workSubject)) work = w;
      });
    }
    if (work) openOverlay(work, findSubject(work.subjectId), koc);
    else closeOverlay(true);

    var stats = rollup(allWorks());
    el('footer-stats').textContent =
      plural(allKocProfiles().length, 'KOC') + ' · ' +
      plural(taskSubjects(allWorks()).length, 'task area') + ' · ' +
      plural(stats.total, 'submission');
  }

  function renderSaveButton() {
    var n = unsaved();
    var btn = el('publish');
    btn.textContent = n ? 'Save ' + plural(n, 'change') : 'All changes saved';
    btn.classList.toggle('primary', n > 0);
    btn.disabled = !n;
    btn.title = n
      ? (canSave ? 'Writes data/state.js in the repo' : 'Downloads data/state.js — run start-board.cmd to write it directly')
      : 'Board messages and Notion task links are all in data/state.js';
  }

  function renderCrumbs(koc) {
    var items = [{ label: '🏛️ KOC Work Gallery', hash: '#/' }];
    if (query) items.push({ label: '🔍 Search “' + query + '”', hash: null });
    else if (koc) items.push({ label: koc.icon + ' ' + koc.name, hash: '#/koc/' + koc.id });
    var html = items.map(function (it, i) {
      var last = i === items.length - 1;
      var inner = esc(it.label);
      var node = it.hash && !last
        ? '<a class="crumb" href="' + it.hash + '">' + inner + '</a>'
        : '<span class="crumb current">' + inner + '</span>';
      return (i ? '<span class="crumb-sep">/</span>' : '') + node;
    }).join('');
    el('crumbs').innerHTML = html;
  }

  function head(icon, title, desc, metaBits) {
    return '<div class="page-head">' +
      '<span class="page-icon">' + esc(icon) + '</span>' +
      '<h1 class="page-title">' + esc(title) + '</h1>' +
      (desc ? '<p class="page-desc">' + esc(desc) + '</p>' : '') +
      (metaBits && metaBits.length ? '<div class="meta-row">' + metaBits.join('<span class="crumb-sep">·</span>') + '</div>' : '') +
      '</div>';
  }

  function statusTag(status) {
    var s = STATUSES[status];
    return '<span class="tag ' + s.tone + '">' + s.label + '</span>';
  }

  function progressBar(r) {
    if (!r.total) return '';
    var ok = Math.round(r.approved / r.total * 100);
    var rev = Math.round(r.revise / r.total * 100);
    return '<div class="progress" title="' + r.approved + ' approved · ' + r.revise + ' to revise · ' + r.pending + ' pending">' +
      '<i class="ok" style="width:' + ok + '%"></i><i class="rev" style="width:' + rev + '%"></i></div>';
  }

  function fallbackCover(icon, label, accent) {
    return '<div class="cover-fallback" style="background:linear-gradient(135deg,' + accent + ',' +
      shade(accent, -22) + ')"><span>' + esc(icon) + '</span>' +
      (label ? '<span class="label">' + esc(label) + '</span>' : '') + '</div>';
  }

  function shade(hex, pct) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    if (!m) return hex;
    var v = [1, 2, 3].map(function (i) {
      var n = parseInt(m[i], 16) + Math.round(255 * pct / 100);
      return Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    });
    return '#' + v.join('');
  }

  /* ----- level 1: KOC name cards ----- */

  function renderHome() {
    var cards = allKocProfiles().map(function (k) {
      var list = worksOfKoc(k.id);
      var r = rollup(list);
      var latest = list.slice().sort(function (a, b) {
        return String(b.submitted || '').localeCompare(String(a.submitted || ''));
      })[0];
      var accent = k.memberships[0] ? k.memberships[0].subject.accent : '#3b6fd4';

      return '<button class="card" data-hash="#/koc/' + k.id + '">' +
        '<div class="cover">' + fallbackCover(k.icon, k.name, accent) +
          '<span class="count-pill">' + plural(r.total, 'work') + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-title"><span class="emoji">' + esc(k.icon) + '</span><span>' + esc(k.name) +
            (k.leader ? ' <span class="tag blue">KOC lead</span>' : '') + '</span></div>' +
          '<div class="card-sub">' + (latest ? 'Latest: ' + esc(latest.title) : 'No submissions yet') + '</div>' +
        '</div>' +
      '</button>';
    }).join('');

    var all = rollup(allWorks());
    el('view').innerHTML =
      head('🏛️', 'KOC Work Gallery', 'One card per KOC. Open a name to review everything they have claimed across all subject areas.', [
        '<span>' + plural(all.total, 'submission') + '</span>',
        '<span>Updated ' + prettyDate(latestDate()) + '</span>'
      ]) +
      monthChart() +
      '<div class="toolbar"><span class="section-label" style="margin:0">KOCs</span></div>' +
      '<div class="grid">' + cards + '</div>' +
      (missingFiles.length ? warnBox() : '');
  }

  function latestDate() {
    var best = '';
    allWorks().forEach(function (w) { if (w.submitted && w.submitted > best) best = w.submitted; });
    return best;
  }

  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function monthKey(iso) {
    return /^\d{4}-\d{2}/.test(iso || '') ? iso.slice(0, 7) : '';
  }

  function nextMonth(key) {
    var year = +key.slice(0, 4);
    var month = +key.slice(5, 7) + 1;
    if (month > 12) { month = 1; year += 1; }
    return year + '-' + String(month).padStart(2, '0');
  }

  var KOC_COLORS = [
    '#3b6fd4', '#1f9d55', '#d97706', '#c2414a', '#7c3aed',
    '#0e7490', '#b45309', '#4d7c0f', '#be185d', '#1d4ed8',
    '#0f766e', '#a16207', '#6d28d9', '#0369a1', '#9a3412'
  ];

  function kocLabel(kocId) {
    var profile = findKocProfile(kocId);
    return profile ? profile.name : (kocId || 'Unknown');
  }

  /* One bar per month, from the earliest submission through this month.
     Each bar is stacked by KOC name. Counts come from submitted dates. */
  function monthlySeries() {
    var counts = {};
    var seen = {};
    var min = '';
    var max = '';
    var undated = 0;
    allWorks().forEach(function (w) {
      var key = monthKey(w.submitted);
      if (!key) { undated += 1; return; }
      var id = w.kocId || 'unknown';
      if (!counts[key]) counts[key] = {};
      counts[key][id] = (counts[key][id] || 0) + 1;
      seen[id] = true;
      if (!min || key < min) min = key;
      if (!max || key > max) max = key;
    });
    var today = new Date();
    var now = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    if (now && (!max || now > max)) max = now;
    if (!min) min = max;
    if (!min) return { months: [], kocs: [], undated: undated };
    var kocs = Object.keys(seen).map(function (id) {
      return { id: id, name: kocLabel(id) };
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    var colorOf = {};
    kocs.forEach(function (k, i) { colorOf[k.id] = KOC_COLORS[i % KOC_COLORS.length]; });
    var months = [];
    var cursor = min;
    var guard = 0;
    while (cursor <= max && guard < 120) {
      var month = +cursor.slice(5, 7);
      var byKoc = counts[cursor] || {};
      var parts = kocs.map(function (k) {
        return { id: k.id, name: k.name, count: byKoc[k.id] || 0, color: colorOf[k.id] };
      }).filter(function (part) { return part.count > 0; });
      var total = 0;
      parts.forEach(function (part) { total += part.count; });
      months.push({
        key: cursor,
        name: MONTH_NAMES[month - 1],
        year: cursor.slice(0, 4),
        count: total,
        parts: parts
      });
      cursor = nextMonth(cursor);
      guard += 1;
    }
    return { months: months, kocs: kocs, colors: colorOf, undated: undated };
  }

  function monthChart() {
    var series = monthlySeries();
    var months = series.months;
    if (!months.length) return '';
    var peak = 1;
    months.forEach(function (m) { if (m.count > peak) peak = m.count; });
    var spoken = months.map(function (m) {
      var who = m.parts.map(function (part) {
        return part.name + ' ' + part.count;
      }).join(', ');
      return m.name + ' ' + m.year + ': ' + plural(m.count, 'work') + (who ? ' (' + who + ')' : '');
    }).join('. ');
    var cols = months.map(function (m) {
      var height = m.count ? Math.max(6, Math.round(m.count / peak * 100)) : 0;
      var segs = m.parts.map(function (part) {
        return '<i class="month-seg" style="flex:' + part.count + ';background:' + part.color +
          '" title="' + esc(part.name + ' · ' + m.name + ' ' + m.year + ' · ' + plural(part.count, 'work')) + '"></i>';
      }).join('');
      return '<div class="month-col' + (m.count ? '' : ' is-empty') + '">' +
        '<span class="month-count">' + m.count + '</span>' +
        '<div class="month-track"><div class="month-bar" style="height:' + height + '%">' + segs + '</div></div>' +
        '<span class="month-name">' + esc(m.name) + '<span class="yr">' + esc(m.year) + '</span></span>' +
      '</div>';
    }).join('');
    var legend = series.kocs.map(function (k) {
      return '<span class="month-key"><i class="month-swatch" style="background:' + series.colors[k.id] + '"></i>' +
        esc(k.name) + '</span>';
    }).join('');
    var note = 'Each block is one KOC, alphabetical from the bottom. Counted from submitted dates, so this updates when work is added.';
    if (series.undated) note += ' ' + plural(series.undated, 'work') + ' with no date ' + (series.undated === 1 ? 'is' : 'are') + ' left out.';
    return '<section class="month-chart" aria-label="Submissions by month and KOC. ' + esc(spoken) + '">' +
      '<div class="month-chart-head">' +
        '<h2>Submissions by month</h2>' +
        '<span class="hint">' + esc(note) + '</span>' +
      '</div>' +
      '<div class="month-bars">' + cols + '</div>' +
      (legend ? '<div class="month-legend">' + legend + '</div>' : '') +
    '</section>';
  }

  function warnBox() {
    return '<div class="empty" style="margin-top:28px"><strong>' +
      plural(missingFiles.length, 'works file') + ' could not be loaded</strong>' +
      missingFiles.map(function (f) { return '<code>' + esc(f) + '</code>'; }).join(' ') +
      '<div style="margin-top:6px">Listed in <code>data/manifest.js</code> but missing from disk.</div></div>';
  }

  /* ----- level 2: KOCs in a subject ----- */

  function renderSubject(s) {
    var cards = s.kocs.map(function (k) {
      var list = worksOf(s.id, k.id);
      var r = rollup(list);
      var latest = list.slice().sort(function (a, b) {
        return String(b.submitted || '').localeCompare(String(a.submitted || ''));
      })[0];
      var cover = latest && latest.cover
        ? '<img src="' + esc(latest.cover) + '" alt="" loading="lazy" onerror="KOC.coverFail(this)">'
        : fallbackCover(k.icon, k.name, s.accent);

      return '<button class="card" data-hash="#/' + s.id + '/' + k.id + '">' +
        '<div class="cover" data-accent="' + esc(s.accent) + '" data-icon="' + esc(k.icon) + '">' + cover +
          '<span class="count-pill">' + plural(r.total, 'work') + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-title"><span class="emoji">' + esc(k.icon) + '</span><span>' + esc(k.name) +
            (k.leader ? ' <span class="tag blue">KOC lead</span>' : '') + '</span></div>' +
          '<div class="card-sub">' + (latest ? 'Latest: ' + esc(latest.title) : 'No submissions yet') + '</div>' +
          '<div class="props">' +
            (r.pending ? '<span class="tag amber">' + r.pending + ' pending</span>' : '') +
            (r.approved ? '<span class="tag green">' + r.approved + ' approved</span>' : '') +
            (r.revise ? '<span class="tag red">' + r.revise + ' to revise</span>' : '') +
            (r.total ? '' : '<span class="tag">empty</span>') +
          '</div>' +
          progressBar(r) +
        '</div>' +
      '</button>';
    }).join('');

    var r = rollup(worksOfSubject(s.id));
    el('view').innerHTML =
      head(s.icon, s.name, 'KOC group for ' + s.name + '. Open a KOC to see everything they have submitted.', [
        '<span>MT: ' + esc(s.lead) + '</span>',
        '<span>' + esc(s.account) + '</span>',
        '<span>' + plural(r.total, 'submission') + '</span>'
      ]) +
      boardCard(s.id, s.name + ' board', 'For the ' + s.name + ' team and ' + s.lead + '.') +
      teamSummary(s) +
      '<div class="toolbar"><span class="section-label" style="margin:0">KOCs</span></div>' +
      '<div class="grid">' + cards + '</div>';
  }

  /* Team summary: one row per KOC — how much they have submitted, how much is
     signed off, and what is still on their plate. Anything not approved counts
     as in progress, whether it is waiting on review or sent back. */
  function teamSummary(s) {
    var totals = { total: 0, done: 0, open: 0 };

    var rows = s.kocs.map(function (k) {
      var list = worksOf(s.id, k.id);
      var r = rollup(list);
      var open = list.filter(function (w) { return statusOf(w) !== 'approved'; })
        .sort(function (a, b) { return String(b.submitted || '').localeCompare(String(a.submitted || '')); });

      totals.total += r.total;
      totals.done += r.approved;
      totals.open += open.length;

      var tasks = open.length
        ? open.slice(0, 3).map(function (w) {
            var st = statusOf(w);
            return '<span class="task ' + STATUSES[st].tone + '" data-hash="#/' + s.id + '/' + k.id + '/' + w.id +
              '" title="' + esc(STATUSES[st].label + ' · ' + prettyDate(w.submitted)) + '">' + esc(w.title) + '</span>';
          }).join('') +
          (open.length > 3 ? '<span class="task-note">+' + (open.length - 3) + ' more</span>' : '')
        : '<span class="task-note">' + (r.total ? 'all signed off' : 'nothing submitted yet') + '</span>';

      return '<tr class="row-link" data-hash="#/' + s.id + '/' + k.id + '">' +
        '<td><span class="who">' + esc(k.icon + ' ' + k.name) +
          (k.leader ? '<span class="tag blue">lead</span>' : '') + '</span></td>' +
        '<td class="num">' + num(r.total) + '</td>' +
        '<td class="num">' + num(r.approved) + '</td>' +
        '<td class="num">' + num(open.length) + '</td>' +
        '<td><div class="tasks">' + tasks + '</div></td>' +
      '</tr>';
    }).join('');

    return '<section class="summary">' +
      '<div class="summary-head">' +
        '<h2>Team summary</h2>' +
        '<span class="hint">In progress means not approved yet — either waiting on review or sent back for revision.</span>' +
      '</div>' +
      '<div class="summary-scroll"><table class="tbl">' +
        '<thead><tr><th>KOC</th><th class="num">Works</th><th class="num">Finished</th>' +
          '<th class="num">In progress</th><th>Current tasks</th></tr></thead>' +
        '<tbody>' + rows + '</tbody>' +
        '<tfoot><tr><td>' + plural(s.kocs.length, 'KOC') + '</td>' +
          '<td class="num">' + totals.total + '</td>' +
          '<td class="num">' + totals.done + '</td>' +
          '<td class="num">' + totals.open + '</td>' +
          '<td>' + (totals.open ? totals.open + ' waiting on you or on the KOC' : 'nothing outstanding') + '</td>' +
        '</tr></tfoot>' +
      '</table></div>' +
    '</section>';
  }

  function num(n) {
    return n ? String(n) : '<span class="zero">0</span>';
  }

  /* ----- level 3: one KOC's works ----- */

  function renderKoc(k) {
    var list = worksOfKoc(k.id);
    var r = rollup(list);

    var body = list.length
      ? '<div class="grid">' + list.map(function (w) {
          return workCard(w, findSubject(w.subjectId));
        }).join('') + '</div>'
      : '<div class="empty"><strong>No submissions yet</strong>' +
          'Work appears here once ' + esc(k.name) + ' adds a card to their <code>works.js</code> file.' +
        '</div>';

    el('view').innerHTML =
      head(k.icon, k.name, 'All work claimed by this KOC, regardless of subject.', [
        '<span>' + plural(r.total, 'submission') + '</span>'
      ]) + body;
  }

  function workCard(w, s) {
    var t = TYPES[w.type];
    var accent = s ? s.accent : '#3b6fd4';
    var cover = w.cover
      ? '<img src="' + esc(w.cover) + '" alt="" loading="lazy" onerror="KOC.coverFail(this)">'
      : fallbackCover(t.icon, t.label, accent);

    return '<button class="card" data-hash="#/koc/' + w.kocId + '/' + w.subjectId + '/' + w.id + '">' +
      '<div class="cover" data-accent="' + esc(accent) + '" data-icon="' + esc(t.icon) + '">' + cover +
        '<span class="type-badge">' + esc(t.icon + ' ' + t.label) + '</span>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="card-title"><span>' + esc(w.title) + '</span></div>' +
        '<div class="card-sub">' + esc([w.chapter, prettyDate(w.submitted)].filter(Boolean).join(' · ')) + '</div>' +
        '<div class="props"><span class="tag blue">Subject: ' + esc(taskSubject(w)) + '</span>' +
          w.tags.slice(0, 3).map(function (tg) { return '<span class="tag">' + esc(tg) + '</span>'; }).join('') +
        '</div>' +
      '</div>' +
    '</button>';
  }

  /* ----- global search ----- */

  function renderSearch() {
    var q = query.toLowerCase();
    var hits = allWorks().filter(function (w) {
      var s = findSubject(w.subjectId), k = findKocProfile(w.kocId);
      var hay = [w.title, w.chapter, w.notes, w.tags.join(' '), k && k.name,
        taskSubject(w), s && s.name, w.type].join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });

    var body = hits.length
      ? '<div class="grid">' + hits.map(function (w) {
          var s = findSubject(w.subjectId), k = findKocProfile(w.kocId);
          return workCard(w, s).replace('<div class="card-sub">',
            '<div class="card-sub">' + esc(k.name + ' · ' + taskSubject(w)) + ' — ');
        }).join('') + '</div>'
      : '<div class="empty"><strong>No matches</strong>Nothing found for “' + esc(query) + '”.</div>';

    el('view').innerHTML =
      head('🔍', 'Search', plural(hits.length, 'result') + ' for “' + query + '” across all teams.', []) + body;
  }

  /* ---------------- detail overlay ---------------- */

  var current = null;

  function openOverlay(w, s, k) {
    current = w;
    var t = TYPES[w.type];

    el('ov-icon').textContent = t.icon;
    el('ov-name').textContent = w.title;
    el('ov-sub').textContent = [k.name, taskSubject(w), w.chapter, prettyDate(w.submitted)].filter(Boolean).join(' · ');

    var open = el('ov-open');
    var target = w.src || w.url || (w.srcs && w.srcs[0]);
    if (target) { open.href = target; open.hidden = false; }
    else open.hidden = true;

    el('ov-stage').innerHTML = stageFor(w);

    el('ov-review-link').value = location.href;

    var taskUrl = taskLinkOf(w);
    el('ov-task-link').value = taskUrl;
    el('ov-task-open').href = taskUrl || '#';
    el('ov-task-open').hidden = !taskUrl;

    el('overlay').hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function stageFor(w) {
    switch (w.type) {
      case 'image':
        return '<img src="' + esc(w.src) + '" alt="' + esc(w.title) + '" onerror="KOC.stageFail(this)">';
      case 'gallery':
        return '<div class="gallery-strip">' + (w.srcs || []).map(function (src) {
          return '<img src="' + esc(src) + '" alt="" onerror="KOC.stageFail(this)" onclick="window.open(this.src)">';
        }).join('') + '</div>';
      case 'video':
        return '<video src="' + esc(w.src) + '" controls preload="metadata" onerror="KOC.stageFail(this)"' +
          (w.cover ? ' poster="' + esc(w.cover) + '"' : '') + '></video>';
      case 'interactive':
      case 'pdf':
        return '<iframe src="' + esc(w.src) + '" title="' + esc(w.title) + '"></iframe>';
      default:
        return '<div class="stage-msg"><span class="big">🔗</span>' +
          'External submission.<br><a class="btn" style="margin-top:12px" href="' + esc(w.url || '#') +
          '" target="_blank" rel="noopener">Open ' + esc(w.url || '') + '</a></div>';
    }
  }

  function closeOverlay(silent) {
    el('overlay').hidden = true;
    document.body.style.overflow = '';
    el('ov-stage').innerHTML = '';           // stop any playing video
    current = null;
    if (!silent && route.work) go('#/koc/' + route.koc);
  }

  function stageFail(node) {
    node.outerHTML = '<div class="stage-msg"><span class="big">📁</span><strong>File not in the repo yet</strong><br>' +
      esc(node.getAttribute('src')) + '<br><br>The card exists but the media file is missing — ' +
      'ask the KOC to commit it alongside their <code>works.js</code>.</div>';
  }

  function coverFail(img) {
    var cover = img.parentNode;
    img.parentNode.removeChild(img);
    cover.insertAdjacentHTML('afterbegin', fallbackCover(
      cover.getAttribute('data-icon') || '📁', 'no cover',
      cover.getAttribute('data-accent') || '#9b9a97'));
  }

  /* ---------------- export ---------------- */

  function exportReview() {
    var rows = [];
    allWorks().forEach(function (w) {
      var r = review[w.key];
      if (!r) return;
      var s = findSubject(w.subjectId), k = findKoc(s, w.kocId);
      rows.push({
        subject: s.name, koc: k.name, work: w.title,
        status: r.status || w.status, notes: r.notes || '', reviewedAt: r.at || ''
      });
    });
    if (!rows.length) { alert('No review decisions recorded yet.'); return; }

    var out = { exportedAt: new Date().toISOString(), reviewer: 'local', reviews: rows };
    var blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'koc-review-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* ---------------- theme ---------------- */

  function applyTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    var icon = document.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = mode === 'dark' ? 'Light' : 'Dark';
    try { localStorage.setItem(THEME_KEY, mode); } catch (e) { /* ignore */ }
  }

  /* ---------------- wiring ---------------- */

  function bind() {
    document.addEventListener('click', function (e) {
      var card = e.target.closest('[data-hash]');
      if (card) { go(card.getAttribute('data-hash')); return; }

      var status = e.target.closest('[data-status]');
      if (status && current) {
        setReview(current, { status: status.getAttribute('data-status') });
        render();     // route still points at this work, so the viewer reopens updated
        return;
      }

      var post = e.target.closest('[data-board-post]');
      if (post) { addPost(post.getAttribute('data-board-post')); return; }

      var del = e.target.closest('[data-board-del]');
      if (del) { removePost(del.getAttribute('data-board-del')); return; }

      if (e.target.closest('#publish')) { save(); return; }
      if (e.target.closest('[data-action="export"]')) { exportReview(); return; }
      if (e.target.closest('#ov-close')) { closeOverlay(); return; }
      if (e.target.closest('#ov-copy-review')) {
        var reviewLink = el('ov-review-link');
        reviewLink.select();
        reviewLink.setSelectionRange(0, reviewLink.value.length);
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(reviewLink.value)
            .then(function () { toast('Review link copied.'); })
            .catch(function () {
              document.execCommand('copy');
              toast('Review link copied.');
            });
        } else {
          document.execCommand('copy');
          toast('Review link copied.');
        }
        return;
      }
      if (e.target.closest('#theme-toggle')) {
        applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
        return;
      }
    });

    document.addEventListener('input', function (e) {
      if (e.target.matches('[data-board-input]')) {
        composing[e.target.getAttribute('data-scope')] = e.target.value;
      } else if (e.target.matches('[data-board-author]')) {
        setAuthorName(e.target.value.trim());
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.matches('[data-board-input]')) {
        e.preventDefault();
        addPost(e.target.getAttribute('data-scope'));
      }
    });

    el('ov-task-link').addEventListener('input', function () {
      if (!current) return;
      var value = this.value.trim();
      setReview(current, { taskUrl: value });
      el('ov-task-open').href = value || '#';
      el('ov-task-open').hidden = !value;
      renderSaveButton();
    });

    var searchTimer;
    el('search').addEventListener('input', function () {
      var v = this.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () { query = v; render(); }, 130);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (!el('overlay').hidden) closeOverlay();
        else if (query) { el('search').value = ''; query = ''; render(); }
      }
      if (e.key === '/' && document.activeElement !== el('search') &&
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        el('search').focus();
      }
    });

    window.addEventListener('hashchange', onHashChange);
  }

  function loadDataFiles(done) {
    var left = pendingFiles.length;
    if (!left) return done();
    pendingFiles.forEach(function (path) {
      var s = document.createElement('script');
      s.src = path;
      s.onload = function () { if (--left === 0) done(); };
      s.onerror = function () { missingFiles.push(path); if (--left === 0) done(); };
      document.head.appendChild(s);
    });
  }

  function start() {
    var saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) { /* ignore */ }
    applyTheme(saved || 'light');

    loadReview();
    loadDraft();
    bind();
    route = parseHash();
    loadDataFiles(function () {
      render();
      probeSaveServer(renderSaveButton);
    });
  }

  // Saving straight to disk only works behind the local server (start-board.cmd).
  function probeSaveServer(done) {
    if (location.protocol === 'file:' || !window.fetch) return done();
    fetch('api/ping')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { canSave = !!(j && j.ok); done(); })
      .catch(function () { done(); });
  }

  return {
    roster: roster, manifest: manifest, works: works, board: board, reviews: reviews,
    start: start, coverFail: coverFail, stageFail: stageFail
  };
})();
