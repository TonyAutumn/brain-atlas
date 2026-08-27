(function () {
  "use strict";

  const regions = window.BRAIN_REGIONS;
  const systems = window.BRAIN_SYSTEMS;
  const topics = window.DEEP_DIVE_TOPICS || [];
  const byId = Object.fromEntries(regions.map((r) => [r.id, r]));
  const storageKey = "brain-atlas-lab-v1";
  function readSavedState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (_) {
      return {};
    }
  }
  const saved = readSavedState();
  const state = {
    selected: saved.lastRegion && byId[saved.lastRegion] ? saved.lastRegion : "frontal",
    view: saved.view || "lateral",
    filter: "all",
    learned: new Set(saved.learned || []),
    notes: saved.notes || {},
    labels: saved.labels !== false,
    mode: "explore",
    cardOrder: regions.map((r) => r.id),
    cardIndex: 0,
    quiz: null,
    best: saved.best || 0,
    topicSection: "pathway",
    topicNode: "sensors",
    topicQuiz: null
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        lastRegion: state.selected,
        view: state.view,
        learned: [...state.learned],
        notes: state.notes,
        labels: state.labels,
        best: state.best
      }));
    } catch (_) {
      // The learning interface remains usable when browser storage is disabled.
    }
  }

  function setMode(mode) {
    state.mode = mode;
    $$(".mode-tab").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
    $$(".mode-panel").forEach((p) => p.classList.remove("active"));
    $("#" + mode + "Mode").classList.add("active");
    if (mode === "cards") renderCard();
    if (mode === "topic") renderTopic();
  }

  function renderFilters() {
    $("#systemFilters").innerHTML = Object.entries(systems).map(([id, s]) =>
      `<button class="filter-chip ${id === state.filter ? "active" : ""}" data-filter="${id}">${s.name}</button>`
    ).join("");
    $$(".filter-chip").forEach((button) => button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderFilters();
      renderRegionList();
    }));
  }

  function matchRegion(region, term) {
    if (!term) return true;
    const haystack = [region.name, region.latin, region.summary, ...region.functions, region.experiment.name, region.experiment.question].join(" ").toLowerCase();
    return haystack.includes(term.toLowerCase());
  }

  function renderRegionList() {
    const term = $("#searchInput").value.trim();
    const visible = regions.filter((r) => (state.filter === "all" || r.system === state.filter) && matchRegion(r, term));
    $("#regionCount").textContent = visible.length;
    if (!visible.length) {
      $("#regionList").innerHTML = `<div class="empty-state"><strong>没有匹配结果</strong><span>试试“记忆”“恐惧”或“Stroop”</span></div>`;
      return;
    }
    const groups = ["cortex", "deep", "support"];
    $("#regionList").innerHTML = groups.map((system) => {
      const items = visible.filter((r) => r.system === system);
      if (!items.length) return "";
      return `<div class="region-group"><div class="group-label">${systems[system].name}</div>${items.map((r) => `
        <button class="region-item ${r.id === state.selected ? "active" : ""}" data-region-id="${r.id}">
          <i style="--region-color:${r.color}"></i>
          <span><strong>${r.name}</strong><small>${r.latin}</small></span>
          ${state.learned.has(r.id) ? '<b class="learned-check">✓</b>' : '<b class="item-arrow">›</b>'}
        </button>`).join("")}</div>`;
    }).join("");
    $$(".region-item").forEach((button) => button.addEventListener("click", () => selectRegion(button.dataset.regionId)));
  }

  function renderDetail() {
    const r = byId[state.selected];
    const isLearned = state.learned.has(r.id);
    $("#detailPanel").innerHTML = `
      <div class="detail-hero" style="--accent:${r.color}">
        <div class="detail-kicker"><span>${systems[r.system].name}结构</span><button class="learn-button ${isLearned ? "done" : ""}" id="learnButton">${isLearned ? "✓ 已掌握" : "标记掌握"}</button></div>
        <div class="region-title-row"><span class="region-index">${String(regions.indexOf(r) + 1).padStart(2, "0")}</span><div><h1>${r.name}</h1><p>${r.latin}</p></div></div>
        <p class="region-summary">${r.summary}</p>
      </div>
      <div class="detail-scroll">
        <section class="detail-section"><h3><span class="section-icon">◇</span> 核心功能</h3><ul class="function-list">${r.functions.map((f) => `<li>${f}</li>`).join("")}</ul></section>
        <section class="detail-section experiment-card"><div class="section-heading"><h3><span class="section-icon">⌁</span> 典型实验</h3><span class="type-tag">实验范式</span></div><h4>${r.experiment.name}</h4><dl><div><dt>研究问题</dt><dd>${r.experiment.question}</dd></div><div><dt>基本做法</dt><dd>${r.experiment.method}</dd></div><div><dt>怎么看结果</dt><dd>${r.experiment.signal}</dd></div></dl></section>
        <section class="detail-section memory-card"><div class="memory-head"><span>记忆技巧</span><b>易记版</b></div><h4>${r.memory.title}</h4><p>${r.memory.text}</p></section>
        <details class="pitfall"><summary>别把它记得太简单 <span>＋</span></summary><p>${r.pitfall}</p></details>
        ${r.id === "insula" ? '<button class="topic-entry" id="topicEntry"><span><b>进阶专题 01</b>内感受、身体自我与意识</span><i>进入专题 →</i></button>' : ""}
        <section class="detail-section notes-section"><h3><span class="section-icon">✎</span> 我的联想</h3><textarea id="regionNote" placeholder="写下你自己的例子、联想或疑问…">${escapeHtml(state.notes[r.id] || "")}</textarea><small>自动保存在这台设备上</small></section>
      </div>`;
    $("#learnButton").addEventListener("click", toggleLearned);
    $("#regionNote").addEventListener("input", (e) => { state.notes[r.id] = e.target.value; persist(); });
    const topicEntry = $("#topicEntry");
    if (topicEntry) topicEntry.addEventListener("click", () => setMode("topic"));
  }

  function escapeHtml(text) {
    return text.replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  }

  function updateMap() {
    $$(".brain-view").forEach((g) => g.classList.toggle("active", g.dataset.brainView === state.view));
    $$(".view-tab").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
    $$(".brain-region").forEach((shape) => {
      const r = byId[shape.dataset.region];
      if (r) shape.style.setProperty("--fill", r.color);
      shape.classList.toggle("selected", shape.dataset.region === state.selected);
      shape.setAttribute("tabindex", "0");
      shape.setAttribute("role", "button");
      shape.setAttribute("aria-label", r ? `${r.name}：${r.summary}` : "脑区");
    });
    $("#brainStage").classList.toggle("hide-labels", !state.labels);
    $("#labelToggle").setAttribute("aria-pressed", String(state.labels));
    $("#labelToggle").classList.toggle("active", state.labels);
  }

  function selectRegion(id) {
    const r = byId[id];
    if (!r) return;
    state.selected = id;
    state.view = r.view;
    persist();
    renderRegionList();
    renderDetail();
    updateMap();
  }

  function toggleLearned() {
    state.learned.has(state.selected) ? state.learned.delete(state.selected) : state.learned.add(state.selected);
    persist();
    renderRegionList();
    renderDetail();
    updateProgress();
  }

  function updateProgress() {
    const percent = Math.round(state.learned.size / regions.length * 100);
    $("#progressPercent").textContent = percent + "%";
    $("#progressRing").style.setProperty("--progress", percent * 3.6 + "deg");
  }

  function renderCard() {
    const r = byId[state.cardOrder[state.cardIndex]];
    $("#flashcard").classList.remove("flipped");
    $("#cardCounter").textContent = `${state.cardIndex + 1} / ${state.cardOrder.length}`;
    $("#cardFront").innerHTML = `<span class="card-system">${systems[r.system].name} · ${r.latin}</span><div class="card-region-dot" style="--card-color:${r.color}"></div><h2>${r.name}</h2><p>它的核心功能、典型实验和最佳记忆线索是什么？</p><span class="flip-prompt">点击翻面 <b>↻</b></span>`;
    $("#cardBack").innerHTML = `<span class="card-system">答案</span><h3>${r.summary}</h3><div class="card-answer-grid"><div><b>典型实验</b><span>${r.experiment.name}</span></div><div><b>记忆锚点</b><span>${r.memory.title}</span></div></div><p>${r.memory.text}</p><button class="mini-learn" data-card-learn="${r.id}">${state.learned.has(r.id) ? "✓ 已掌握" : "标记为掌握"}</button>`;
    $("[data-card-learn]").addEventListener("click", (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.cardLearn;
      state.learned.has(id) ? state.learned.delete(id) : state.learned.add(id);
      persist(); updateProgress(); renderCard(); renderRegionList();
    });
  }

  function moveCard(delta) {
    state.cardIndex = (state.cardIndex + delta + state.cardOrder.length) % state.cardOrder.length;
    renderCard();
  }

  const topicSections = {
    pathway: {name: "通路与模型", icon: "⌁"},
    experiments: {name: "典型实验", icon: "⚗"},
    papers: {name: "关键文献", icon: "▤"},
    frontiers: {name: "前沿问题", icon: "◌"},
    topicQuiz: {name: "专题测验", icon: "✓"}
  };

  function renderTopic() {
    const topic = topics[0];
    if (!topic) return;
    $("#topicSidebar").innerHTML = `
      <div class="topic-side-head"><span class="topic-number">专题 ${topic.number}</span><h2>${topic.title}</h2><p>${topic.subtitle}</p></div>
      <nav class="topic-nav" aria-label="专题章节">${Object.entries(topicSections).map(([id, item]) => `<button class="${state.topicSection === id ? "active" : ""}" data-topic-section="${id}"><i>${item.icon}</i><span>${item.name}</span><b>›</b></button>`).join("")}</nav>
      <div class="topic-side-foot"><span>${topic.level}</span><span>更新 ${topic.updated}</span><p>本专题内容可离线阅读；文献原文链接需要联网。</p></div>`;

    $$("[data-topic-section]").forEach((button) => button.addEventListener("click", () => {
      state.topicSection = button.dataset.topicSection;
      renderTopic();
    }));

    const main = $("#topicMain");
    const hero = topicHero(topic);
    if (state.topicSection === "pathway") main.innerHTML = hero + pathwayView(topic);
    if (state.topicSection === "experiments") main.innerHTML = hero + experimentsView(topic);
    if (state.topicSection === "papers") main.innerHTML = hero + papersView(topic);
    if (state.topicSection === "frontiers") main.innerHTML = hero + frontiersView(topic);
    if (state.topicSection === "topicQuiz") main.innerHTML = hero + topicQuizView(topic);
    bindTopicContent(topic);
  }

  function topicHero(topic) {
    return `<header class="topic-hero" style="--topic-accent:${topic.accent}">
      <div class="topic-hero-meta"><span>DEEP DIVE · ${topic.number}</span><span>${topic.level}</span></div>
      <h1>${topic.title}</h1><p>${topic.thesis}</p>
      <div class="objective-row">${topic.objectives.map((item) => `<span>${item}</span>`).join("")}</div>
    </header>`;
  }

  function pathwayView(topic) {
    const selected = topic.pathway.find((node) => node.id === state.topicNode) || topic.pathway[0];
    return `<div class="topic-body">
      <div class="topic-section-heading"><div><span class="eyebrow">PATHWAY</span><h2>信号如何变成“我的感受”</h2></div><p>点击每一站查看它在闭环中的角色。先记主干，再理解模型争议。</p></div>
      <div class="pathway-layout">
        <div class="pathway-map">${topic.pathway.map((node, index) => `${index ? '<span class="route-arrow">→</span>' : ""}<button class="route-node ${node.id === selected.id ? "active" : ""}" data-topic-node="${node.id}" style="--node-color:${node.color}"><b>${node.order}</b><span>${node.name}</span><small>${node.short}</small></button>`).join("")}</div>
        <article class="route-detail" style="--node-color:${selected.color}"><div class="route-detail-top"><span>${selected.order}</span><div><small>当前节点</small><h3>${selected.name}</h3></div></div><p class="route-examples">${selected.examples}</p><div class="route-facts"><div><b>核心作用</b><p>${selected.role}</p></div><div><b>不能过度简化</b><p>${selected.caution}</p></div></div></article>
      </div>
      <div class="topic-section-heading model-heading"><div><span class="eyebrow">THREE MODELS</span><h2>同一系统的三种理解方式</h2></div></div>
      <div class="model-grid">${topic.models.map((model, index) => `<article class="model-card"><div class="model-title"><span>0${index + 1}</span><div><small>${model.tag}</small><h3>${model.name}</h3></div></div><p class="model-claim">${model.claim}</p><dl><div><dt>最有用之处</dt><dd>${model.useful}</dd></div><div><dt>当前局限</dt><dd>${model.limit}</dd></div></dl></article>`).join("")}</div>
      <div class="study-anchor"><b>一句话记忆</b><span>后岛叶更像“身体状态图”，前岛叶—dACC 更像“结合情境后决定这意味着什么、该做什么”，但两者都嵌在全脑—全身闭环中。</span></div>
    </div>`;
  }

  function experimentsView(topic) {
    return `<div class="topic-body"><div class="topic-section-heading"><div><span class="eyebrow">EXPERIMENTS</span><h2>五个实验，五种证据强度</h2></div><p>重点区分行为相关、病损反例、直接记录、临床标志物和因果扰动。</p></div>
      <div class="experiment-stack">${topic.experiments.map((exp, index) => `<details class="deep-experiment" ${index === 0 ? "open" : ""}><summary><span class="experiment-no">${String(index + 1).padStart(2, "0")}</span><div><small>${exp.badge} · ${exp.year}</small><h3>${exp.name}</h3></div><i>＋</i></summary><div class="deep-experiment-body"><div class="experiment-question"><b>研究问题</b><p>${exp.question}</p></div><div class="experiment-method-grid"><div><b>设计</b><p>${exp.design}</p></div><div><b>指标与发现</b><p>${exp.readout}</p></div><div><b>允许的推断</b><p>${exp.inference}</p></div><div class="warning"><b>方法警告</b><p>${exp.warning}</p></div></div></div></details>`).join("")}</div>
      <div class="evidence-ladder"><span>相关成像</span><i>→</i><span>病损反例</span><i>→</i><span>颅内记录</span><i>→</i><span>因果干预</span><small>证据不是简单“越右越真”：不同方法回答不同问题，结论必须受样本与任务限制。</small></div>
    </div>`;
  }

  function papersView(topic) {
    return `<div class="topic-body"><div class="topic-section-heading"><div><span class="eyebrow">LITERATURE</span><h2>从奠基论文到 2025 前沿</h2></div><p>卡片中的“发现”和“意义”已压缩为学习版；点击标题可在联网时打开原文页面。</p></div>
      <div class="paper-timeline">${topic.papers.map((paper) => `<article class="paper-card"><div class="paper-year">${paper.year}</div><div class="paper-content"><div class="paper-tags"><span>${paper.kind}</span><b>${paper.strength}</b></div><a href="${paper.url}" target="_blank" rel="noopener noreferrer">${paper.title}<i>↗</i></a><small>${paper.authors} · ${paper.journal}</small><div class="paper-evidence"><p><b>发现</b>${paper.finding}</p><p><b>为什么重要</b>${paper.meaning}</p></div></div></article>`).join("")}</div>
      <div class="citation-note"><b>阅读顺序建议</b><p>先读 Critchley 2004 建立经典观点，再用 Khalsa 2009 看到反例；之后读 Park 2018 理解 HEP 与身体自我，最后用 Zhang 2025 和 Minenko 2025 更新网络观与测量观。</p></div>
    </div>`;
  }

  function frontiersView(topic) {
    return `<div class="topic-body"><div class="topic-section-heading"><div><span class="eyebrow">FRONTIERS</span><h2>现在真正值得追的问题</h2></div><p>前沿不是“已经证实的新知识”，而是证据正在聚集、仍可被推翻的问题。</p></div>
      <div class="frontier-grid">${topic.frontiers.map((item, index) => `<article class="frontier-card ${item.tone}"><div class="frontier-top"><span>${item.status}</span><b>0${index + 1}</b></div><h3>${item.title}</h3><p>${item.evidence}</p><div><small>开放问题</small><strong>${item.question}</strong></div></article>`).join("")}</div>
      <div class="research-bridge"><div><span class="eyebrow">与你现有方向的连接</span><h3>濒死体验、身体所有权与 NeuroAI</h3></div><p>这个专题可以直接连接三个研究方向：用 HEP/自主神经指标研究意识状态；用身体错觉检验自我模型；用预测编码或主动推断建立可计算的脑—身模型。关键是避免把“岛叶激活”直接解释成意识或身体脱离的原因。</p></div>
    </div>`;
  }

  function topicQuizView(topic) {
    if (!state.topicQuiz) return `<div class="topic-body"><div class="topic-quiz-intro"><span class="eyebrow">RETRIEVAL PRACTICE</span><h2>完成专题后再做这 6 题</h2><p>题目重点不是背名词，而是判断哪种证据支持哪种结论。</p><button class="primary-button" id="startTopicQuiz">开始专题测验 →</button></div></div>`;
    const quiz = state.topicQuiz;
    if (quiz.done) {
      const weak = quiz.answers.filter((a) => !a.correct).length;
      return `<div class="topic-body"><div class="topic-quiz-result"><div class="score-orbit" style="--score:${quiz.score / topic.quiz.length * 360}deg"><strong>${quiz.score}</strong><span>/ ${topic.quiz.length}</span></div><span class="eyebrow">专题 01 完成</span><h2>${quiz.score === topic.quiz.length ? "你已经能用证据说话" : "主干已经形成，再补强推断边界"}</h2><p>${weak ? `有 ${weak} 题需要回看。建议重新阅读“实验”和“前沿问题”中的方法警告。` : "全部答对。你已经能区分通路、任务指标、因果证据与临床标志物。"}</p><button class="primary-button" id="restartTopicQuiz">重新测验 ↻</button></div></div>`;
    }
    const q = topic.quiz[quiz.index];
    return `<div class="topic-body"><div class="topic-question"><div class="quiz-top"><span>专题题目 ${quiz.index + 1} / ${topic.quiz.length}</span><span>${quiz.score} 分</span></div><div class="quiz-progress"><i style="width:${quiz.index / topic.quiz.length * 100}%"></i></div><h2>${q.q}</h2><div class="answer-list">${q.options.map((option, i) => `<button class="answer-option" data-topic-answer="${i}"><b>${String.fromCharCode(65 + i)}</b><span>${option}</span></button>`).join("")}</div><div id="topicAnswerFeedback" class="answer-feedback hidden"></div></div></div>`;
  }

  function bindTopicContent(topic) {
    $$("[data-topic-node]").forEach((button) => button.addEventListener("click", () => { state.topicNode = button.dataset.topicNode; renderTopic(); }));
    const start = $("#startTopicQuiz");
    if (start) start.addEventListener("click", () => { state.topicQuiz = {index: 0, score: 0, answers: [], done: false}; renderTopic(); });
    const restart = $("#restartTopicQuiz");
    if (restart) restart.addEventListener("click", () => { state.topicQuiz = {index: 0, score: 0, answers: [], done: false}; renderTopic(); });
    $$("[data-topic-answer]").forEach((button) => button.addEventListener("click", () => answerTopicQuestion(topic, Number(button.dataset.topicAnswer))));
  }

  function answerTopicQuestion(topic, choice) {
    const quiz = state.topicQuiz;
    const q = topic.quiz[quiz.index];
    const correct = choice === q.answer;
    if (correct) quiz.score += 1;
    quiz.answers.push({correct});
    $$("[data-topic-answer]").forEach((button, index) => {
      button.disabled = true;
      if (index === q.answer) button.classList.add("correct");
      if (index === choice && !correct) button.classList.add("wrong");
    });
    const feedback = $("#topicAnswerFeedback");
    feedback.classList.remove("hidden");
    feedback.innerHTML = `<div><strong>${correct ? "判断正确" : "注意推断边界"}</strong><p>${q.why}</p></div><button class="primary-button" id="nextTopicQuestion">${quiz.index === topic.quiz.length - 1 ? "查看结果" : "下一题"} →</button>`;
    $("#nextTopicQuestion").addEventListener("click", () => {
      quiz.index += 1;
      if (quiz.index >= topic.quiz.length) quiz.done = true;
      renderTopic();
    });
  }

  function startQuiz() {
    const questions = shuffle(regions.map((r) => ({...r.quiz, region: r.name}))).slice(0, 8).map((q) => {
      const correct = q.options[q.answer];
      const shuffled = shuffle([...q.options]);
      return {...q, options: shuffled, answer: shuffled.indexOf(correct)};
    });
    state.quiz = {questions, index: 0, score: 0, answers: []};
    $("#quizIntro").classList.add("hidden");
    $("#quizResult").classList.add("hidden");
    $("#quizGame").classList.remove("hidden");
    renderQuestion();
  }

  function renderQuestion() {
    const quiz = state.quiz;
    const q = quiz.questions[quiz.index];
    const progress = quiz.index / quiz.questions.length * 100;
    $("#quizGame").innerHTML = `<div class="quiz-top"><span>问题 ${quiz.index + 1} / ${quiz.questions.length}</span><span>当前 ${quiz.score} 分</span></div><div class="quiz-progress"><i style="width:${progress}%"></i></div><span class="quiz-category">脑区与实验</span><h2>${q.q}</h2><div class="answer-list">${q.options.map((option, i) => `<button class="answer-option" data-answer="${i}"><b>${String.fromCharCode(65 + i)}</b><span>${option}</span></button>`).join("")}</div><div id="answerFeedback" class="answer-feedback hidden"></div>`;
    $$(".answer-option").forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.answer))));
  }

  function answerQuestion(choice) {
    const quiz = state.quiz;
    const q = quiz.questions[quiz.index];
    const correct = choice === q.answer;
    if (correct) quiz.score += 1;
    quiz.answers.push({region: q.region, correct});
    $$(".answer-option").forEach((button, i) => {
      button.disabled = true;
      if (i === q.answer) button.classList.add("correct");
      if (i === choice && !correct) button.classList.add("wrong");
    });
    const feedback = $("#answerFeedback");
    feedback.classList.remove("hidden");
    feedback.innerHTML = `<div><strong>${correct ? "答对了" : "再连一次"}</strong><p>${q.why}</p></div><button class="primary-button" id="nextQuestion">${quiz.index === quiz.questions.length - 1 ? "查看结果" : "下一题"} →</button>`;
    $("#nextQuestion").addEventListener("click", () => {
      quiz.index += 1;
      quiz.index < quiz.questions.length ? renderQuestion() : showQuizResult();
    });
  }

  function showQuizResult() {
    const quiz = state.quiz;
    const percent = Math.round(quiz.score / quiz.questions.length * 100);
    state.best = Math.max(state.best, quiz.score);
    persist();
    $("#quizGame").classList.add("hidden");
    const result = $("#quizResult");
    result.classList.remove("hidden");
    const missed = quiz.answers.filter((a) => !a.correct).map((a) => a.region);
    result.innerHTML = `<div class="score-orbit" style="--score:${percent * 3.6}deg"><strong>${quiz.score}</strong><span>/ ${quiz.questions.length}</span></div><span class="eyebrow">测验完成</span><h1>${percent >= 88 ? "脑区地图已经很清晰" : percent >= 63 ? "主干已经搭起来了" : "先建立几个牢固锚点"}</h1><p>${missed.length ? `建议回看：${[...new Set(missed)].join("、")}。` : "全部答对，可以开始加入更细的功能分区。"} 历史最佳 ${state.best} / 8。</p><div class="result-actions"><button class="primary-button" id="retryQuiz">再测一次 ↻</button><button class="ghost-button" id="backExplore">回到脑图</button></div>`;
    $("#retryQuiz").addEventListener("click", startQuiz);
    $("#backExplore").addEventListener("click", () => setMode("explore"));
  }

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function bindEvents() {
    $$(".mode-tab").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    $$(".view-tab").forEach((b) => b.addEventListener("click", () => { state.view = b.dataset.view; persist(); updateMap(); }));
    $("#labelToggle").addEventListener("click", () => { state.labels = !state.labels; persist(); updateMap(); });
    $("#searchInput").addEventListener("input", renderRegionList);
    $$(".brain-region").forEach((shape) => {
      shape.addEventListener("click", () => selectRegion(shape.dataset.region));
      shape.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectRegion(shape.dataset.region); } });
    });
    $$(".map-label").forEach((label) => label.addEventListener("click", () => selectRegion(label.dataset.labelFor)));
    $("#flashcard").addEventListener("click", () => $("#flashcard").classList.toggle("flipped"));
    $("#prevCard").addEventListener("click", () => moveCard(-1));
    $("#nextCard").addEventListener("click", () => moveCard(1));
    $("#shuffleCards").addEventListener("click", () => { state.cardOrder = shuffle([...state.cardOrder]); state.cardIndex = 0; renderCard(); });
    $("#startQuiz").addEventListener("click", startQuiz);
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") { e.preventDefault(); $("#searchInput").focus(); }
      if (state.mode === "cards" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        if (e.key === "ArrowLeft") moveCard(-1);
        if (e.key === "ArrowRight") moveCard(1);
        if (e.key.toLowerCase() === "f") $("#flashcard").classList.toggle("flipped");
      }
    });
  }

  function init() {
    renderFilters();
    renderRegionList();
    renderDetail();
    updateMap();
    updateProgress();
    renderCard();
    bindEvents();
    const notice = $("#runtimeNotice");
    if (notice) notice.remove();
    window.__BRAIN_ATLAS_READY__ = true;
  }

  init();
})();
