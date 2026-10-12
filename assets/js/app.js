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

  /* 五行 X-axis style modules from 三維動態教學系統 V12. A work lists the
     element(s) it trains in its `elements` field. Accents match
     assets/wuxing/wuxing-summary.svg. */
  var ELEMENTS = {
    gold: {
      zh: '金', label: 'Gold', accent: '#c99a3b',
      role: '架構師 / 裁判',
      use: '建立標準、拆解難題、除錯',
      desc: '把複雜任務整理成學生可以跟隨的路徑，並像裁判一樣指出答案與過程是否符合標準。',
      weapons: 'SOP 手術刀（切分 Step 1, 2, 3）· 陷阱雷達（指出 Past Paper 扣分位）',
      when: '答案對但步驟缺失、跳步時（金 + 土）',
      caution: '全堂使用會太高壓，需搭配火／水調節。',
      gallery: '步驟框架、規則頁、附評分要點的長題目、有檢查點的實驗程序'
    },
    wood: {
      zh: '木', label: 'Wood', accent: '#4f9a5a',
      role: '園丁 / 導航員',
      use: '構建知識體系、激發聯想、舉一反三',
      desc: '讓一個核心概念長出分支，幫助學生看見新知識與既有經驗之間的路線。',
      weapons: '思維導圖（畫出知識樹）· 鷹架 Scaffolding（填空式筆記）',
      when: '眼神呆滯、缺乏關聯感，或全班掉入同一陷阱後重建概念時（火 + 木、水 + 木）',
      caution: '發散過度會離題，需用金來修剪。',
      gallery: '概念頁、筆記、可操作的模型與探究實驗'
    },
    water: {
      zh: '水', label: 'Water', accent: '#3f8cc0',
      role: '說書人 / 治療師',
      use: '處理情緒、建立共情、價值重塑',
      desc: '以情境和軼事把抽象知識變得可感受；先承接學生的挫敗，再引導其返回問題。',
      weapons: '故事掛鉤（用軼事軟化枯燥知識）· 情緒緩衝墊（先承接挫敗感）',
      when: '集體掉入陷阱、錯誤率飆升、挫折感過載時（水 + 木）',
      caution: '太溫柔會導致散漫，需用土來立規矩。',
      gallery: '漫畫、故事、講解腳本'
    },
    fire: {
      zh: '火', label: 'Fire', accent: '#e0603a',
      role: '表演者 / 啦啦隊',
      use: '搶奪注意力、點燃動機、打破沉悶',
      desc: '以節奏和視覺刺激重新聚焦全班，並把學生的微小勝利放大，形成正向增益。',
      weapons: '高頻互動（快問快答、Kahoot!）· 視覺衝擊（誇張語調、震撼演示）',
      when: '眼神呆滯、停留過長、認知疲勞時（火 + 木）',
      caution: '過度亢奮會只玩不學，需接土來靜心。',
      gallery: '遊戲、射擊、競賽與限時挑戰'
    },
    earth: {
      zh: '土', label: 'Earth', accent: '#a57645',
      role: '建築師 / 守護者',
      use: '鞏固基礎、建立習慣、提供安全感',
      desc: '以穩固步驟建立可持續的學習結構，用清晰界線和可預測節奏維持課堂秩序。',
      weapons: '刻意練習（同類題型反覆操練）· 錯題本（踏實積累）',
      when: '答題過快但錯誤率高、氣氛浮躁時（土 + 金）',
      caution: '太沉悶會厭學，需插播木／火來鬆土。',
      gallery: '閃卡、MC 操練題組、同類題反覆練習'
    }
  };
  var ELEMENT_ORDER = ['gold', 'wood', 'water', 'fire', 'earth'];

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
    out.elements = (out.elements || []).filter(function (e) { return ELEMENTS[e]; });
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
  var RANGE_KEY = 'koc-date-range';
  var ELEMENT_KEY = 'koc-element';
  var range = 'all';
  var element = 'all';

  function loadRange() {
    try { range = sessionStorage.getItem(RANGE_KEY) || 'all'; } catch (e) { range = 'all'; }
    if (['all', 'day', 'week', 'month'].indexOf(range) < 0) range = 'all';
    try { element = sessionStorage.getItem(ELEMENT_KEY) || 'all'; } catch (e) { element = 'all'; }
    if (element !== 'all' && !ELEMENTS[element]) element = 'all';
  }

  function setRange(next) {
    range = next;
    try { sessionStorage.setItem(RANGE_KEY, range); } catch (e) { /* ignore */ }
    render();
  }

  function setElement(next) {
    element = next;
    try { sessionStorage.setItem(ELEMENT_KEY, element); } catch (e) { /* ignore */ }
    render();
  }

  function hasElement(work, el) {
    return el === 'all' || work.elements.indexOf(el) > -1;
  }

  function parseSubmitted(value) {
    var match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
    if (!match) return null;
    return new Date(+match[1], +match[2] - 1, +match[3]);
  }

  function startOfWeek(date) {
    var day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var weekday = day.getDay();
    day.setDate(day.getDate() - (weekday === 0 ? 6 : weekday - 1));
    return day;
  }

  function inRange(work, mode, now) {
    if (mode === 'all') return true;
    var submitted = parseSubmitted(work.submitted);
    if (!submitted) return false;
    if (mode === 'day') {
      return submitted.getFullYear() === now.getFullYear() &&
        submitted.getMonth() === now.getMonth() &&
        submitted.getDate() === now.getDate();
    }
    if (mode === 'week') return startOfWeek(submitted).getTime() === startOfWeek(now).getTime();
    if (mode === 'month') {
      return submitted.getFullYear() === now.getFullYear() && submitted.getMonth() === now.getMonth();
    }
    return true;
  }

  function sortByDate(list) {
    return list.slice().sort(function (a, b) {
      return String(b.submitted || '').localeCompare(String(a.submitted || ''));
    });
  }

  function applyRange(list) {
    var now = new Date();
    return sortByDate(list.filter(function (work) {
      return inRange(work, range, now) && hasElement(work, element);
    }));
  }

  function rangeBar(list) {
    var now = new Date();
    var modes = [['all', 'All'], ['day', 'Day'], ['week', 'Week'], ['month', 'Month']];
    return '<div class="toolbar" role="toolbar" aria-label="Sort by date">' +
      '<span class="section-label" style="margin:0">Date</span>' +
      modes.map(function (mode) {
        var count = list.filter(function (work) {
          return inRange(work, mode[0], now) && hasElement(work, element);
        }).length;
        return '<button type="button" class="chip" data-range="' + mode[0] + '" aria-pressed="' +
          (range === mode[0] ? 'true' : 'false') + '">' + mode[1] + ' ' + count + '</button>';
      }).join('') +
      '<span class="hint">Newest first</span></div>' +
      elementBar(list);
  }

  function elementBar(list) {
    var now = new Date();
    var inDates = list.filter(function (work) { return inRange(work, range, now); });
    var chips = [['all', 'All']].concat(ELEMENT_ORDER.map(function (id) {
      return [id, ELEMENTS[id].zh + ' ' + ELEMENTS[id].label];
    }));
    return '<div class="toolbar" role="toolbar" aria-label="Filter by 五行 element">' +
      '<span class="section-label" style="margin:0">五行</span>' +
      chips.map(function (c) {
        var count = inDates.filter(function (work) { return hasElement(work, c[0]); }).length;
        var title = ELEMENTS[c[0]] ? ' title="' + esc(ELEMENTS[c[0]].role + ' · ' + ELEMENTS[c[0]].use) + '"' : '';
        return '<button type="button" class="chip" data-element="' + c[0] + '" aria-pressed="' +
          (element === c[0] ? 'true' : 'false') + '"' + title + '>' + esc(c[1]) + ' ' + count + '</button>';
      }).join('') +
      '</div>';
  }

  function emptyRange() {
    var copy = {
      day: 'Nothing submitted today.',
      week: 'Nothing submitted this week.',
      month: 'Nothing submitted this month.'
    };
    var picked = ELEMENTS[element];
    return '<div class="empty"><strong>No submissions in this range</strong>' +
      (copy[range] || 'Nothing matches this date range.') +
      (picked ? ' Filtered to ' + esc(picked.zh + ' ' + picked.label) + '.' : '') + '</div>';
  }


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
      : 'Board messages, approvals and Notion task links are all in data/state.js';
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

  // Anything short of approved reads as "Not approved"; the tooltip keeps the detail.
  function approvalTag(work) {
    var st = statusOf(work);
    return st === 'approved'
      ? '<span class="tag green approval" title="Approved">✓ Approved</span>'
      : '<span class="tag ' + STATUSES[st].tone + ' approval" title="' + esc(STATUSES[st].label) + '">Not approved</span>';
  }

  function elementTags(work) {
    return work.elements.map(function (id) {
      var e = ELEMENTS[id];
      return '<span class="tag el-' + id + '" title="' + esc(e.role + ' · ' + e.use) + '">' +
        esc(e.zh + ' ' + e.label) + '</span>';
    }).join('');
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
      var latest = sortByDate(list)[0];
      var accent = k.memberships[0] ? k.memberships[0].subject.accent : '#3b6fd4';

      return '<button class="card" data-hash="#/koc/' + k.id + '">' +
        '<div class="cover">' + fallbackCover(k.icon, k.name, accent) +
          '<span class="count-pill">' + plural(r.total, 'work') + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<div class="card-title"><span class="emoji">' + esc(k.icon) + '</span><span>' + esc(k.name) +
            (k.leader ? ' <span class="tag blue">KOC lead</span>' : '') + '</span></div>' +
          '<div class="card-sub">' + (latest ? 'Latest: ' + esc(latest.original ? latest.title + ' — ' + latest.original : latest.title) : 'No submissions yet') + '</div>' +
        '</div>' +
      '</button>';
    }).join('');

    var all = rollup(allWorks());
    el('view').innerHTML =
      head('🏛️', 'KOC Work Gallery', 'One card per KOC. Open a name to review everything they have claimed across all subject areas.', [
        '<span>' + plural(all.total, 'submission') + '</span>',
        '<span>Updated ' + prettyDate(latestDate()) + '</span>'
      ]) +
      wuxingSection() +
      kocChart() +
      '<div class="toolbar"><span class="section-label" style="margin:0">KOCs</span></div>' +
      '<div class="grid">' + cards + '</div>' +
      '<div class="section-label" id="submissions">Submissions</div>' +
      rangeBar(allWorks()) +
      submissionGrid(allWorks(), true) +
      (missingFiles.length ? warnBox() : '');
  }

  /* 五行 summary: the infographic plus one card per element, each jumping to
     that element's works below. */
  var WUXING_KEY = 'koc-wuxing-open';

  function wuxingOpen() {
    try { return localStorage.getItem(WUXING_KEY) !== 'no'; } catch (e) { return true; }
  }

  function toggleWuxing() {
    try { localStorage.setItem(WUXING_KEY, wuxingOpen() ? 'no' : 'yes'); } catch (e) { /* ignore */ }
    render();
  }

  function jumpToElement(id) {
    setElement(id);
    var target = el('submissions');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wuxingSection() {
    var open = wuxingOpen();
    var works = allWorks();

    var cards = ELEMENT_ORDER.map(function (id) {
      var e = ELEMENTS[id];
      var n = works.filter(function (w) { return hasElement(w, id); }).length;
      return '<article class="wx-card" style="--wx:' + e.accent + '">' +
        '<div class="wx-top">' +
          '<span class="wx-glyph">' + esc(e.zh) + '</span>' +
          '<div><div class="wx-name">' + esc(e.zh + ' ' + e.label) + '</div>' +
          '<div class="wx-role">' + esc(e.role) + '</div></div>' +
        '</div>' +
        '<p class="wx-desc">' + esc(e.desc) + '</p>' +
        '<dl class="wx-list">' +
          '<dt>功能</dt><dd>' + esc(e.use) + '</dd>' +
          '<dt>戰術武器</dt><dd>' + esc(e.weapons) + '</dd>' +
          '<dt>何時用</dt><dd>' + esc(e.when) + '</dd>' +
          '<dt>平衡提醒</dt><dd>' + esc(e.caution) + '</dd>' +
          '<dt>本館作品</dt><dd>' + esc(e.gallery) + '</dd>' +
        '</dl>' +
        '<div class="wx-actions">' +
          '<button type="button" class="chip" data-element-jump="' + id + '">' + plural(n, 'work') + ' →</button>' +
        '</div>' +
      '</article>';
    }).join('');

    return '<section class="wuxing' + (open ? '' : ' closed') + '">' +
      '<div class="wuxing-head">' +
        '<h2>五行 Teaching Elements</h2>' +
        '<span class="hint">X 軸 · 用什麼方式互動 — Uni+ 2.0 三維動態教學系統 V12</span>' +
        '<span class="spacer"></span>' +
        '<button type="button" class="btn" data-wuxing-toggle aria-expanded="' + open + '">' + (open ? 'Hide' : 'Show') + '</button>' +
      '</div>' +
      (open
        ? '<div class="wuxing-body">' +
            '<a class="wuxing-figure" href="assets/wuxing/wuxing-summary.svg" target="_blank" rel="noopener" title="Open full size">' +
              '<img src="assets/wuxing/wuxing-summary.svg" alt="五行戰術模組總結：金、木、水、火、土五種教學能量的角色、功能、戰術武器與平衡提醒，以及先嚴後寬的課堂節奏和動態應變矩陣">' +
            '</a>' +
            '<div class="wx-grid">' + cards + '</div>' +
            '<p class="wuxing-foot">五行不與 TLA 階段固定綁定，導師應按 AI 儀表板提示的學生即時狀態動態切換。' +
              '正向增益：微小勝利用火大聲宣告、用土固化為 SOP；錯誤的高級化先用水承接挫折，再用木提煉錯誤中的邏輯。</p>' +
          '</div>'
        : '') +
    '</section>';
  }

  function latestDate() {
    var best = '';
    allWorks().forEach(function (w) { if (w.submitted && w.submitted > best) best = w.submitted; });
    return best;
  }

  /* One bar per KOC who has submitted something, alphabetical.
     The count is their works, so a new card updates the chart. */
  function activeKocSeries() {
    var counts = {};
    allWorks().forEach(function (w) {
      var id = w.kocId || 'unknown';
      counts[id] = (counts[id] || 0) + 1;
    });
    return Object.keys(counts).filter(function (id) {
      return counts[id] > 0;
    }).map(function (id) {
      var profile = findKocProfile(id);
      return { id: id, name: profile ? profile.name : id, count: counts[id] };
    }).sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }

  function kocChart() {
    var kocs = activeKocSeries();
    if (!kocs.length) return '';
    var peak = 1;
    kocs.forEach(function (k) { if (k.count > peak) peak = k.count; });
    var spoken = kocs.map(function (k) {
      return k.name + ': ' + plural(k.count, 'work');
    }).join(', ');
    var cols = kocs.map(function (k) {
      var height = Math.max(6, Math.round(k.count / peak * 100));
      return '<div class="month-col">' +
        '<span class="month-count">' + k.count + '</span>' +
        '<div class="month-track"><div class="month-bar" style="height:' + height + '%" title="' +
          esc(k.name + ' · ' + plural(k.count, 'work')) + '"></div></div>' +
        '<span class="month-name">' + esc(k.name) + '</span>' +
      '</div>';
    }).join('');
    return '<section class="month-chart" aria-label="Submissions by active KOC. ' + esc(spoken) + '">' +
      '<div class="month-chart-head">' +
        '<h2>Submissions by KOC</h2>' +
        '<span class="hint">Active KOCs only, alphabetical. Updates when work is added.</span>' +
      '</div>' +
      '<div class="month-bars">' + cols + '</div>' +
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
      var latest = sortByDate(list)[0];
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
          '<div class="card-sub">' + (latest ? 'Latest: ' + esc(latest.original ? latest.title + ' — ' + latest.original : latest.title) : 'No submissions yet') + '</div>' +
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

  function submissionGrid(list, withName) {
    var shown = applyRange(list);
    if (!list.length) return '';
    if (!shown.length) return emptyRange();
    return '<div class="grid">' + shown.map(function (w) {
      var card = workCard(w, findSubject(w.subjectId));
      if (!withName) return card;
      var k = findKocProfile(w.kocId);
      return card.replace('<div class="card-sub">',
        '<div class="card-sub">' + esc((k ? k.name : w.kocId) + ' · '));
    }).join('') + '</div>';
  }

  function renderKoc(k) {
    var list = worksOfKoc(k.id);
    var r = rollup(list);
    var shown = applyRange(list);

    var body = !list.length
      ? '<div class="empty"><strong>No submissions yet</strong>' +
          'Work appears here once ' + esc(k.name) + ' adds a card to their <code>works.js</code> file.' +
        '</div>'
      : rangeBar(list) + (shown.length
          ? '<div class="grid">' + shown.map(function (w) {
              return workCard(w, findSubject(w.subjectId));
            }).join('') + '</div>'
          : emptyRange());

    el('view').innerHTML =
      head(k.icon, k.name, 'All work claimed by this KOC, regardless of subject. Sorted by date.', [
        '<span>' + plural(shown.length, 'submission') + '</span>'
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
        '<div class="card-title"><span class="title-text">' + esc(w.title) + '</span>' + approvalTag(w) + '</div>' +
        '<div class="card-sub">' + esc((w.original ? [w.original, prettyDate(w.submitted)] : [w.chapter, prettyDate(w.submitted)]).filter(Boolean).join(' · ')) + '</div>' +
        '<div class="props">' + elementTags(w) + '<span class="tag blue">Subject: ' + esc(taskSubject(w)) + '</span>' +
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
      var hay = [w.title, w.original, w.chapter, w.notes, w.tags.join(' '), k && k.name,
        taskSubject(w), s && s.name, w.type,
        w.elements.map(function (id) { return ELEMENTS[id].zh + ' ' + ELEMENTS[id].label; }).join(' ')
      ].join(' ').toLowerCase();
      return hay.indexOf(q) > -1;
    });

    var shown = applyRange(hits);
    var body = !hits.length
      ? '<div class="empty"><strong>No matches</strong>Nothing found for “' + esc(query) + '”.</div>'
      : rangeBar(hits) + (shown.length
          ? '<div class="grid">' + shown.map(function (w) {
              var s = findSubject(w.subjectId), k = findKocProfile(w.kocId);
              return workCard(w, s).replace('<div class="card-sub">',
                '<div class="card-sub">' + esc(k.name + ' · ' + taskSubject(w)) + ' — ');
            }).join('') + '</div>'
          : emptyRange());

    el('view').innerHTML =
      head('🔍', 'Search', plural(shown.length, 'result') + ' for “' + query + '” across all teams.', []) + body;
  }

  /* ---------------- detail overlay ---------------- */

  var current = null;

  function openOverlay(w, s, k) {
    current = w;
    var t = TYPES[w.type];

    el('ov-icon').textContent = t.icon;
    el('ov-name').textContent = w.original ? w.title + ' — ' + w.original : w.title;
    el('ov-sub').textContent = [k.name, taskSubject(w), w.chapter, prettyDate(w.submitted)].filter(Boolean).join(' · ');

    var open = el('ov-open');
    var target = w.src || w.url || (w.srcs && w.srcs[0]);
    if (target) { open.href = target; open.hidden = false; }
    else open.hidden = true;

    el('ov-stage').innerHTML = stageFor(w);

    el('ov-review-link').value = location.href;

    var approved = statusOf(w) === 'approved';
    el('ov-approve').setAttribute('aria-pressed', approved ? 'true' : 'false');
    el('ov-unapprove').setAttribute('aria-pressed', approved ? 'false' : 'true');

    el('ov-elements').innerHTML = w.elements.length
      ? w.elements.map(function (id) {
          var e = ELEMENTS[id];
          return '<div class="element-row"><span class="tag el-' + id + '">' + esc(e.zh + ' ' + e.label) + '</span>' +
            '<span class="element-role">' + esc(e.role) + '</span>' +
            '<div class="element-use">' + esc(e.use) + '</div>' +
            '<div class="side-hint">戰術武器：' + esc(e.weapons) + '</div>' +
            '<div class="side-hint">平衡提醒：' + esc(e.caution) + '</div></div>';
        }).join('')
      : '<div class="side-hint">Not tagged yet. Add <code>elements</code> to this card in <code>works.js</code>.</div>';

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
      var rangeBtn = e.target.closest('[data-range]');
      if (rangeBtn) { setRange(rangeBtn.getAttribute('data-range')); return; }

      var elementBtn = e.target.closest('[data-element]');
      if (elementBtn) { setElement(elementBtn.getAttribute('data-element')); return; }

      var jump = e.target.closest('[data-element-jump]');
      if (jump) { jumpToElement(jump.getAttribute('data-element-jump')); return; }

      if (e.target.closest('[data-wuxing-toggle]')) { toggleWuxing(); return; }

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
    loadRange();
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
