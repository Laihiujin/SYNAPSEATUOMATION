"use strict";
const electron = require("electron"), path = require("path"), index$2 = require("./index-vXB5mSwm.js"), fs = require("fs"), mainEventBus = require("./mainEventBus-D2ZkkKhI.js"), crypto = require("crypto"), index$1 = require("./index-Bf0u4cvK.js"), config = require("./supabaseManager-BAbRVJxx.js");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const path__namespace = /* @__PURE__ */ _interopNamespaceDefault(path);
const BUILTIN_PRESETS_EN = [
  {
    id: "FromOneHourVideoToCompleteGuide",
    name: "From 1hr Video to Complete Guide",
    isOfficial: true,
    instruction: `Summarize the content of the (FlowithOS YouTube link) video and provide me with a detailed introduction to the usage methods of FlowithOS.`,
    color: "red",
    files: []
  },
  {
    id: "AutomatedMarketResearch",
    name: "Automated Market Research",
    isOfficial: true,
    instruction: `Research and summarize the top 10 popular products on Product Hunt today, provide your insights, categorize the products appropriately, and compile them into a doc document.`,
    color: "yellow",
    files: []
  },
  {
    id: "TikTokLiveCommenter",
    name: "Generate TikTok Hype",
    isOfficial: true,
    subtitle: "500+ Engagements\n0 effort",
    coverImage: "https://os-assets.flowith.net/blank-page/tiktok-hype.webp",
    instruction: `Persona & Objective

Your persona is a master of internet culture, with a commentary style that is both witty and cutting-edge. Your objective is to engage with a popular TikTok livestream by posting insightful and humorous comments.

Execution Protocol

1. Launch and Navigate: Open the TikTok application. From the main page, navigate to the Live feed.
2. Target Selection: Enter an English-language livestream that has over 500 concurrent viewers.When you find a live broadcast room that meets your requirements, enter it immediately.
3. Locate Input Field: Identify the comment input field, where the placeholder text may display as "Type..." or something similar.
4. Posting Mechanism:
  - To the far right of the input field is the Send button. Clicking this will post your live chat message.
  - Alternatively, pressing the Enter key on the keyboard will also send the message.
  - After the first successful submission, maintain a consistent sending method to ensure all subsequent messages are delivered successfully.

Task: Live Commentary

Post engaging and humorous comments that are directly relevant to the content of the livestream.
Guidelines:
- Language: Use simple yet witty phrasing.
- Content Policy: No profanity, personal attacks, or discriminatory language.
- Humor Style: Employ exaggerated metaphors and contrasts to create comedic effect.
- Length: Each comment must not exceed 30 characters.
- Vocabulary: Incorporate contemporary internet slang and relevant memes.
- Contextual Awareness:
  - Adapt your tone to match the general sentiment and style of the live chat. Observe the comment section to learn the prevailing linguistic patterns.
  - Before posting, ensure your comment aligns with the current conversation. Ideally, contribute to an ongoing topic to make your engagement feel natural.
- Interaction: Maintain a friendly and positive demeanor. Do not push boundaries or be disruptive.
- Duration & Frequency: Continue this process for five minutes, aiming to send approximately 5 to 10 comments.`,
    color: "green",
    files: []
  },
  {
    id: "XContentEngine",
    name: "Run A 24/7 X Content Engine",
    isOfficial: true,
    subtitle: "Automated content System\n3x more profile visits",
    coverImage: "https://os-assets.flowith.net/blank-page/content-engine.webp",
    instruction: `Discovers top Hacker News stories, writes in your unique voice, and auto-posts to X. Driving 3X more profile visits and genuine community growth.

Step 1: Discover and Refine the Content
1. First, open your browser and go to the "Newest" page on Hacker News (https://news.ycombinator.com/best).
2. Find the post right at the top of the list, and click its title to open the article.
3. Read the article carefully to extract its core idea or most interesting insight.
4. While you're at it, copy and save the link to that specific Hacker News post to prepare for the next step.

Step 2: Emulate Style and Draft the Tweet
1. To make the tweet sound like it's coming from you, need to study your personal style.
2. Go to X.com/home, Click the profile icon below "For you" in the top left corner of the screen and visit your X (formerly Twitter) profile.
3. Analyze your bio, as well as the language, tone, structure, and focus of your past tweets to accurately grasp your typical writing habits.
4. Next, based on the insight from the previous step, I will draft a tweet that is no more than 280 characters.
5. The draft will include the Hacker News post link saved in Step 1 and will be revised to perfectly match your style.

Step 3: Review and Post the Tweet
1. Go to X.com and click the "Post" button or find the "What's happening?" input box.
2. Paste our finalized tweet content into it.
3. Before publishing, do one last check: reconfirm the text is clear, the tone is consistent, and make sure the source link from Hacker News is correctly included.
4. Once you've confirmed everything is correct, click the "Post" button to finish.`,
    color: "yellow",
    files: []
  },
  {
    id: "HolidayShoppingHelper",
    name: "Complete Holiday Haul 10x Faster",
    isOfficial: true,
    subtitle: "Slashed Hand-Picking Time\nby 80%",
    coverImage: "https://os-assets.flowith.net/blank-page/holiday-haul.webp",
    instruction: `Fills your cart with the perfect puppy gift set—saving you 2+ hours of manual browsing.

Please pick three gifts for a puppy within the budget of $100 on Amazon. Please ensure that all items are placed within the shopping cart.`,
    color: "green",
    files: []
  },
  {
    id: "YoutubeGrowthAutomation",
    name: "Automate 95% of Youtube Growth",
    isOfficial: true,
    subtitle: "10x faster in creation\nAuto Revenue Stream",
    coverImage: "https://os-assets.flowith.net/blank-page/youtube-growth.webp",
    instruction: `Automate your YouTube content creation and optimization process to accelerate channel growth.

Step 1: Content Research
1. Visit YouTube trending page and analyze top-performing videos in your niche
2. Identify key topics, styles, and engagement patterns
3. Note the common elements that drive views and engagement

Step 2: Content Planning
1. Based on the research, brainstorm 3-5 video ideas that align with trending topics
2. Create detailed outlines for each video including key talking points
3. Develop engaging titles and descriptions optimized for search

Step 3: Growth Optimization
1. Research relevant keywords and tags for each video concept
2. Create compelling thumbnail concepts that follow proven patterns
3. Plan the publishing schedule for maximum reach
4. Set up analytics tracking to measure performance

This automation helps you create a systematic content pipeline, reducing manual work while maximizing growth potential.`,
    color: "red",
    files: []
  }
];
const BUILTIN_PRESETS_JP = [
  {
    id: "jp-FlightPriceComparison",
    name: "航空券の価格比較",
    isOfficial: true,
    subtitle: "最安値チェック→瞬間予約",
    coverImage: "https://os-assets.flowith.net/blank-page/holiday-haul.webp",
    instruction: `東京からソウル（韓国）への最安値航空券を探してください。
出発日は12月22日〜24日、帰国日は1月5日〜7日の間でお願いします。
見つかった最も安い便の予約ページを開いてください。`,
    color: "blue",
    files: []
  },
  {
    id: "jp-CreateGoogleDoc",
    name: "Googleドキュメントを作成する",
    isOfficial: true,
    subtitle: "最新情報、即ドキュメント",
    coverImage: "https://os-assets.flowith.net/blank-page/content-engine.webp",
    instruction: `GoogleでAIに関する最新のニュースや記事を検索してください。信頼性の高い上位5件を選び、それぞれのタイトル・3〜5行の要約・出典URLを抽出してください。抽出した内容を日本語でGoogleドキュメントに追加し、整ったリスト形式でまとめてください。ドキュメントのタイトルは「AIリサーチ」としてください。`,
    color: "yellow",
    files: []
  },
  {
    id: "jp-XFollowAndLike",
    name: "Xでフォロー＆いいね",
    isOfficial: true,
    subtitle: "自動でフォローといいね。拡散力アップ。",
    coverImage: "https://os-assets.flowith.net/blank-page/tiktok-hype.webp",
    instruction: `Xを開き、「AI」を検索します。
検索結果からトップ10アカウントを見つけ、各アカウントのプロフィールに移動し、最新の投稿を確認して「いいね」を押します。
その後、「フォロー」をクリックします。`,
    color: "green",
    files: []
  },
  {
    id: "jp-AmazonGiftSuggestion",
    name: "Amazonギフト提案",
    isOfficial: true,
    subtitle: "好み解析 → 誕プレ提案 → カート追加",
    coverImage: "https://os-assets.flowith.net/blank-page/holiday-haul.webp",
    instruction: `28歳の彼女にぴったりの誕生日プレゼントを選んでください。
彼女はスキンケア会社で働いており、メイクやスキンケアが好きです。
予算は10,000〜15,000円です。
Amazonで商品を検索し、5〜10個のおすすめを提案してショッピングカートに追加してください。`,
    color: "red",
    files: []
  },
  {
    id: "jp-TabelogReservation",
    name: "食べログ予約",
    isOfficial: true,
    instruction: `https://tabelog.com/ にアクセスし、銀座駅にある1人予算8,000円以下で利用できるイタリアンレストランを検索してください。
11月10日19:00、2名で予約可能な店舗を探します。 予約を行う前に、おすすめの3店舗（店名・評価・価格帯・簡単な説明を含む）を一覧で提示してください。 私の確認を取ってから、予約を進めてください。`,
    color: "yellow",
    files: []
  },
  {
    id: "jp-XQuoteRepost",
    name: "Xで投稿を引用リポスト",
    isOfficial: true,
    instruction: `Xで「ちいかわ」に関する投稿を検索し、トレンド上位10件の中から1つを選んでください。
その投稿に、私の過去のホーム投稿のスタイルに合わせたコメントを追加し、引用リポストとして共有してください。
手順：「リポスト」→「引用」をクリックし、コメントを入力した後、「ポスト」をクリックして投稿を完了してください。`,
    color: "green",
    files: []
  }
];
const BUILTIN_PRESETS_KO = [
  {
    id: "ko-AcademicWriting",
    name: "학문 글쓰기",
    isOfficial: true,
    subtitle: "스마트 검색: 원하는 논문을 찾아 서론까지 완성.",
    coverImage: "https://os-assets.flowith.net/blank-page/content-engine.webp",
    instruction: `구글 학술검색에서 인공지능에 관련된, 2020년 이후 기재된 논문 5개를 찾고 공부해서 짧은 논문 서론을 작성해줘.`,
    color: "blue",
    files: []
  },
  {
    id: "ko-NaverRestaurantReservation",
    name: "네이버 식당 예약",
    isOfficial: true,
    subtitle: "원하는 시간과 인원에 맞춰 자동 식당 예약.",
    coverImage: "https://os-assets.flowith.net/blank-page/holiday-haul.webp",
    instruction: `네이버에서 명동에 리뷰 많은 식당에 11월12일 저녁 6시 2명 예약해줘.`,
    color: "yellow",
    files: []
  },
  {
    id: "ko-DermatologyReservation",
    name: "피부과 예약",
    isOfficial: true,
    subtitle: "이제 병원 서치도, 예약도 자동화로.",
    coverImage: "https://os-assets.flowith.net/blank-page/holiday-haul.webp",
    instruction: `네이버지도 에서 건대에 가장 리뷰수 많은 피부과 10월 31일 오후 예약할 수 있는 시간을 예약해줘`,
    color: "green",
    files: []
  },
  {
    id: "ko-UnreadEmailProcessing",
    name: "안읽음 메일 처리",
    isOfficial: true,
    subtitle: "정리되지 않은 메일을 알아서 처리해 시간을 절약.",
    coverImage: "https://os-assets.flowith.net/blank-page/youtube-growth.webp",
    instruction: `네이버 메일 가서 내가 안읽음 메일을 다 읽음으로 처리해줘`,
    color: "red",
    files: []
  },
  {
    id: "ko-FlightPriceComparison",
    name: "항공편 가격 비교 선택",
    isOfficial: true,
    instruction: `서울에서 오사카까지 가는 가장 저렴하고 시간이 가장 편리한 항공권을 찾아줘.
출발일은 12월 20일부터 12월 23일 사이야.
출국 날짜는 1월 3일~1월 5일 사이로 찾아줘.`,
    color: "blue",
    files: []
  },
  {
    id: "ko-PlaylistAutoPlay",
    name: "내가 원하는 플레이리스트",
    isOfficial: true,
    instruction: `공부할때 사람들이 가장 많이 듣는 플레이리스트를 찾아줘. 그리고 플레이해줘.`,
    color: "yellow",
    files: []
  }
];
const BUILTIN_PRESETS_MAP = {
  en: BUILTIN_PRESETS_EN,
  jp: BUILTIN_PRESETS_JP,
  ko: BUILTIN_PRESETS_KO
};
function getBuiltinPresets(locale) {
  if (!locale) return BUILTIN_PRESETS_EN;
  const normalizedLocale = locale.toLowerCase();
  if (BUILTIN_PRESETS_MAP[normalizedLocale]) {
    return BUILTIN_PRESETS_MAP[normalizedLocale];
  }
  const langCode = normalizedLocale.split("-")[0];
  if (BUILTIN_PRESETS_MAP[langCode]) {
    return BUILTIN_PRESETS_MAP[langCode];
  }
  return BUILTIN_PRESETS_EN;
}
async function fetchOfficialPresets() {
  try {
    const workerUrl = config.g();
    const url = `${workerUrl}/os/get-official-preset`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Preset API] Failed to fetch:", response.status, errorText);
      return null;
    }
    const data = await response.json();
    if (!data.presets || typeof data.presets !== "object") {
      console.error("[Preset API] Invalid response format");
      return null;
    }
    return data.presets;
  } catch (error) {
    console.error("[Preset API] Fetch exception:", error);
    return null;
  }
}
let cachedOfficialPresets = null;
let lastFetchTime = 0;
const CACHE_TTL = 60 * 60 * 1e3;
async function init() {
  const presets = await fetchOfficialPresets();
  if (presets) {
    cachedOfficialPresets = presets;
    lastFetchTime = Date.now();
  } else {
    console.warn("[AgentPresetService] Failed to fetch, will use local fallback");
  }
}
function extractLocalePresets(presetMap, locale) {
  const normalizedLocale = locale?.toLowerCase() || "en";
  const langCode = normalizedLocale.split("-")[0];
  return presetMap[normalizedLocale] || presetMap[langCode] || presetMap["en"] || [];
}
async function getOfficialPresets(locale) {
  const now2 = Date.now();
  const cacheAge = now2 - lastFetchTime;
  const isCacheValid = cachedOfficialPresets !== null && cacheAge < CACHE_TTL;
  if (isCacheValid) {
    return extractLocalePresets(cachedOfficialPresets, locale);
  }
  if (cachedOfficialPresets !== null) {
    fetchOfficialPresets().then((freshPresets) => {
      if (freshPresets) {
        cachedOfficialPresets = freshPresets;
        lastFetchTime = Date.now();
      }
    }).catch((err) => {
      console.error("[AgentPresetService] Background refresh failed:", err);
    });
    return extractLocalePresets(cachedOfficialPresets, locale);
  }
  return getBuiltinPresets(locale);
}
function getPresetsDir() {
  return index$1.getAppStorage().getPath("data", "agent-data", "presets");
}
function getPresetsJsonPath() {
  return path__namespace.join(getPresetsDir(), "presets.json");
}
async function ensureBaseDirs() {
  const storage = index$1.getAppStorage();
  await storage.fs.createDirectory("data", "agent-data/presets");
}
async function readAllPresets() {
  const storage = index$1.getAppStorage();
  await ensureBaseDirs();
  const jsonPath = getPresetsJsonPath();
  try {
    const rel = path__namespace.relative(storage.getPath("data"), jsonPath);
    return await storage.fs.readJSON("data", rel);
  } catch {
    return [];
  }
}
async function writeAllPresets(list) {
  const storage = index$1.getAppStorage();
  await ensureBaseDirs();
  const jsonPath = getPresetsJsonPath();
  const rel = path__namespace.relative(storage.getPath("data"), jsonPath);
  await storage.fs.writeJSON("data", rel, list, { indent: 2, overwrite: true });
}
const agentPresetService = {
  /**
   * Initialize official presets cache
   * Should be called on app startup
   */
  init,
  async list(locale) {
    const allPresets = await readAllPresets();
    const OFFICIAL_PRESETS = await getOfficialPresets(locale);
    const officialIds = new Set(OFFICIAL_PRESETS.map((bp) => bp.id));
    const userPresets = allPresets.filter((p) => !officialIds.has(p.id));
    return [...userPresets, ...OFFICIAL_PRESETS];
  },
  async create(data) {
    const id = crypto.randomUUID();
    await ensureBaseDirs();
    const preset = {
      id,
      name: data.name,
      instruction: data.instruction,
      color: data.color,
      isOfficial: false
      // User-created presets are never official
    };
    const allPresets = await readAllPresets();
    const allBuiltinIds = /* @__PURE__ */ new Set();
    for (const presets of [getBuiltinPresets("en"), getBuiltinPresets("jp"), getBuiltinPresets("ko")]) {
      presets.forEach((p) => allBuiltinIds.add(p.id));
    }
    const userPresets = allPresets.filter((p) => !allBuiltinIds.has(p.id));
    await writeAllPresets([preset, ...userPresets]);
    return preset;
  },
  async update(data) {
    const allBuiltinIds = /* @__PURE__ */ new Set();
    for (const presets of [getBuiltinPresets("en"), getBuiltinPresets("jp"), getBuiltinPresets("ko")]) {
      presets.forEach((p) => allBuiltinIds.add(p.id));
    }
    if (allBuiltinIds.has(data.id)) {
      throw new Error("Cannot update official preset");
    }
    await ensureBaseDirs();
    const allPresets = await readAllPresets();
    const userPresets = allPresets.filter((p) => !allBuiltinIds.has(p.id));
    const prev = userPresets.find((p) => p.id === data.id);
    if (!prev) throw new Error("Preset not found");
    const next = {
      id: prev.id,
      name: data.name,
      instruction: data.instruction,
      color: data.color,
      isOfficial: false
      // User presets are never official
    };
    const replaced = userPresets.map((p) => p.id === data.id ? next : p);
    await writeAllPresets(replaced);
    return next;
  },
  async remove(id) {
    const allBuiltinIds = /* @__PURE__ */ new Set();
    for (const presets of [getBuiltinPresets("en"), getBuiltinPresets("jp"), getBuiltinPresets("ko")]) {
      presets.forEach((p) => allBuiltinIds.add(p.id));
    }
    if (allBuiltinIds.has(id)) {
      throw new Error("Cannot remove official preset");
    }
    const allPresets = await readAllPresets();
    const userPresets = allPresets.filter((p) => !allBuiltinIds.has(p.id));
    const next = userPresets.filter((p) => p.id !== id);
    await writeAllPresets(next);
  }
};
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, agentPresetService }, Symbol.toStringTag, { value: "Module" }));
class ElectronDebuggerClient {
  constructor(dbg) {
    this.listeners = [];
    this.dbg = dbg;
  }
  static attach(dbg) {
    try {
      dbg.attach("1.3");
    } catch {
    }
    const client = new ElectronDebuggerClient(dbg);
    dbg.on("message", (_event, method, params) => {
      for (const l of client.listeners) {
        if (l.event === method) {
          try {
            l.handler(params);
          } catch {
          }
        }
      }
    });
    return client;
  }
  async send(method, params) {
    return await this.dbg.sendCommand(method, params);
  }
  on(event, handler) {
    this.listeners.push({ event, handler });
  }
}
const IGNORED_URL_PATTERNS = ["flowith://blank", "about:srcdoc", "about:blank"];
function shouldIgnoreUrl(url) {
  if (!url) return false;
  return IGNORED_URL_PATTERNS.some((pattern) => url.startsWith(pattern));
}
class RecordingSession {
  constructor(stateCapture, opts) {
    this.events = [];
    this.eventIndexMap = /* @__PURE__ */ new Map();
    this.timers = /* @__PURE__ */ new Map();
    this.stateCapture = stateCapture;
    this.postEventDelayMs = opts.postEventDelayMs;
    this.initialUrl = opts.initialUrl;
    this.viewport = opts.viewport;
    this.sessionId = `recording_${Date.now()}`;
    this.startedAt = Date.now();
    this.listeners = opts.listeners || {};
    this.addEvent({
      id: `event_${this.startedAt}_0`,
      timestamp: this.startedAt,
      action: { type: "session_start" }
    });
  }
  getRecordingId() {
    return this.sessionId;
  }
  addEvent(event) {
    const index2 = this.events.length;
    this.events.push(event);
    this.eventIndexMap.set(event.id, index2);
    if (this.listeners.onEvent) this.listeners.onEvent(event);
    this._scheduleStateCapture(event);
  }
  async stop(options) {
    const endTs = Date.now();
    this.addEvent({
      id: `event_${endTs}_end`,
      timestamp: endTs,
      action: { type: "session_end" }
    });
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
    this.eventIndexMap.clear();
    const cleanedEvents = this._mergeScrollEvents(this.events);
    const recording = {
      session: {
        id: this.sessionId,
        startTimestamp: this.startedAt,
        endTimestamp: endTs,
        url: this.initialUrl
      },
      narration: options?.transcript?.text ? {
        transcript: options.transcript.text,
        language: options.transcript.language || "en"
      } : void 0,
      viewport: this.viewport,
      audio: options?.audioBase64,
      events: cleanedEvents
    };
    return recording;
  }
  _mergeScrollEvents(events) {
    const result = [];
    let scrollBuffer = [];
    const SCROLL_SESSION_GAP = 3e3;
    for (const event of events) {
      if (event.action.type === "scroll") {
        if (scrollBuffer.length > 0) {
          const lastScroll = scrollBuffer[scrollBuffer.length - 1];
          const gap = event.timestamp - lastScroll.timestamp;
          if (gap > SCROLL_SESSION_GAP) {
            const merged = this._consolidateScrolls(scrollBuffer);
            if (merged) result.push(merged);
            scrollBuffer = [event];
          } else {
            scrollBuffer.push(event);
          }
        } else {
          scrollBuffer.push(event);
        }
      } else {
        if (scrollBuffer.length > 0) {
          const merged = this._consolidateScrolls(scrollBuffer);
          if (merged) result.push(merged);
          scrollBuffer = [];
        }
        result.push(event);
      }
    }
    if (scrollBuffer.length > 0) {
      const merged = this._consolidateScrolls(scrollBuffer);
      if (merged) result.push(merged);
    }
    return result;
  }
  _consolidateScrolls(scrolls) {
    if (scrolls.length === 0) return null;
    if (scrolls.length === 1) return scrolls[0];
    const first = scrolls[0];
    const last = scrolls[scrolls.length - 1];
    const firstScroll = first.action.scroll;
    const lastScroll = last.action.scroll;
    if (!firstScroll || !lastScroll) return first;
    const startX = firstScroll.x - (firstScroll.deltaX || 0);
    const startY = firstScroll.y - (firstScroll.deltaY || 0);
    const totalDeltaX = lastScroll.x - startX;
    const totalDeltaY = lastScroll.y - startY;
    if (Math.abs(totalDeltaX) < 30 && Math.abs(totalDeltaY) < 30) {
      return null;
    }
    return {
      id: first.id,
      timestamp: first.timestamp,
      action: {
        type: "scroll",
        scroll: {
          x: lastScroll.x,
          y: lastScroll.y,
          deltaX: totalDeltaX,
          deltaY: totalDeltaY,
          source: "scroll"
        }
      },
      target: first.target,
      state: last.state || first.state,
      narration: first.narration
    };
  }
  _scheduleStateCapture(event) {
    const timer = setTimeout(async () => {
      try {
        const state = await this.stateCapture.capture();
        const idx = this.eventIndexMap.get(event.id);
        if (idx !== void 0 && idx < this.events.length) {
          this.events[idx] = { ...this.events[idx], state };
          if (this.listeners.onStateCaptured)
            this.listeners.onStateCaptured({ eventId: event.id, state });
        }
      } catch {
      }
    }, this.postEventDelayMs);
    this.timers.set(event.id, timer);
  }
}
class StateCapture {
  constructor(cdp) {
    this.isNavigating = false;
    this.loadCompleteResolver = null;
    this.cdp = cdp;
    this._setupNavigationListener();
  }
  async capture(options) {
    if (this.isNavigating) {
      await this._waitForLoad();
    }
    const [titleRes, urlRes] = await Promise.all([
      this.cdp.send("Runtime.evaluate", {
        expression: "document.title",
        returnByValue: true
      }),
      this.cdp.send("Runtime.evaluate", {
        expression: "location.href",
        returnByValue: true
      })
    ]);
    const browserStateString = await this._getAXString();
    let screenshot;
    if (options?.captureScreenshot !== false) {
      try {
        const { data } = await this.cdp.send("Page.captureScreenshot", {
          format: "png"
        });
        screenshot = data;
      } catch {
        screenshot = void 0;
      }
    }
    const viewport = await this._getViewport();
    return {
      timestamp: Date.now(),
      page: {
        url: String(urlRes.result?.value || ""),
        title: String(titleRes.result?.value || "")
      },
      browserState: browserStateString ? { string: browserStateString } : void 0,
      screenshot,
      viewport
    };
  }
  async _getViewport() {
    const res = await this.cdp.send("Runtime.evaluate", {
      expression: "{scrollX: window.scrollX, scrollY: window.scrollY, innerWidth: window.innerWidth, innerHeight: window.innerHeight}",
      returnByValue: true
    });
    return res.result?.value;
  }
  async _getAXString() {
    try {
      const { nodes } = await this.cdp.send("Accessibility.getFullAXTree");
      const lines = [];
      for (const n of nodes) {
        const role = n.role?.value;
        if (!role || role === "generic") continue;
        const name = n.name?.value || "";
        lines.push(`[${role}] ${name}`);
      }
      return lines.join("\n");
    } catch {
      return void 0;
    }
  }
  _setupNavigationListener() {
    if ("on" in this.cdp && typeof this.cdp.on === "function") {
      const cdpWithEvents = this.cdp;
      cdpWithEvents.on?.("Page.frameStartedLoading", () => {
        this.isNavigating = true;
      });
      cdpWithEvents.on?.("Page.loadEventFired", () => {
        this.isNavigating = false;
        if (this.loadCompleteResolver) {
          this.loadCompleteResolver();
          this.loadCompleteResolver = null;
        }
      });
    }
  }
  async _waitForLoad() {
    return new Promise((resolve) => {
      this.loadCompleteResolver = resolve;
      setTimeout(() => {
        this.isNavigating = false;
        if (this.loadCompleteResolver) {
          this.loadCompleteResolver();
          this.loadCompleteResolver = null;
        }
      }, 3e3);
    });
  }
}
const pageRecorderSource = "/*\n * Minimal page recorder injected into the page context.\n * It collects core events and emits JSON via globalThis.teachEmit binding.\n */\n(function () {\n  const INIT_KEY = '__nxt_teach_recorder_initialized__'\n  if (globalThis[INIT_KEY]) return  // Prevent duplicate injection on same page\n  globalThis[INIT_KEY] = true\n\n  function emit(payload) {\n    try {\n      if (globalThis.teachEmit) {\n        globalThis.teachEmit(JSON.stringify(payload))\n      } else if (globalThis.console) {\n        console.log('teachEmit-missing', payload)\n      }\n    } catch (e) {\n      console.error('teachEmit failed', e)\n    }\n  }\n\n  function now() { return Date.now() }\n\n  function getBoundingBox(el) {\n    try {\n      const r = el.getBoundingClientRect()\n      return { x: r.x, y: r.y, width: r.width, height: r.height }\n    } catch { return undefined }\n  }\n\n  function buildSelectors(el) {\n    const sel = {}\n    try {\n      const aria = el.getAttribute('aria-label')\n      if (aria) sel.ariaLabel = aria\n      const dt = el.getAttribute('data-testid') || el.getAttribute('data-test-id')\n      if (dt) sel.dataTestId = dt\n      const role = el.getAttribute('role')\n\n      if (el.id) {\n        sel.css = `#${CSS.escape(el.id)}`\n      } else {\n        let css = el.tagName.toLowerCase()\n\n        // Add classes (following original implementation)\n        if (el.className && typeof el.className === 'string') {\n          const classes = el.className.trim().split(/\\s+/)\n            .filter(cls => cls.length > 0)\n            .map(cls => `.${CSS.escape(cls)}`)\n            .join('')\n          if (classes) css += classes\n        }\n\n        const name = el.getAttribute('name')\n        const type = el.getAttribute('type')\n        if (type) css += `[type=\"${CSS.escape(type)}\"]`\n        if (name) css += `[name=\"${CSS.escape(name)}\"]`\n\n        // Prepend role if exists\n        if (role) css = `[role=\"${role}\"] ${css}`\n\n        sel.css = css\n      }\n      // Simple XPath\n      const parts = []\n      let cur = el\n      while (cur && cur.nodeType === Node.ELEMENT_NODE) {\n        let index = 1\n        let sib = cur.previousElementSibling\n        while (sib) { if (sib.tagName === cur.tagName) index++; sib = sib.previousElementSibling }\n        parts.unshift(`${cur.tagName.toLowerCase()}${index > 1 ? `[${index}]` : ''}`)\n        cur = cur.parentElement\n      }\n      sel.xpath = `//${parts.join('/')}`\n      const t = el.textContent && el.textContent.trim()\n      if (t && t.length <= 100) sel.text = t\n    } catch {}\n    return sel\n  }\n\n  function elementContext(target) {\n    try {\n      if (!(target instanceof Element)) return undefined\n      const hasDisabled = target.hasAttribute('disabled')\n      const hasReadonly = target.hasAttribute('readonly')\n      return {\n        selectors: buildSelectors(target),\n        element: {\n          tagName: target.tagName.toLowerCase(),\n          type: target.getAttribute && target.getAttribute('type') || undefined,\n          text: target.textContent && target.textContent.trim() || undefined,\n          value: 'value' in target ? target.value : undefined,\n          placeholder: target.getAttribute && target.getAttribute('placeholder') || undefined,\n          id: target.id || undefined,\n          classes: target.classList && target.classList.length ? Array.from(target.classList) : undefined,\n          role: target.getAttribute && target.getAttribute('role') || undefined,\n          ariaLabel: target.getAttribute && target.getAttribute('aria-label') || undefined,\n          dataset: target.dataset && Object.keys(target.dataset).length ? { ...target.dataset } : undefined,\n          attributes: (() => {\n            const obj = {}\n            if (target.attributes) {\n              for (const a of target.attributes) obj[a.name] = a.value\n            }\n            return obj\n          })(),\n          boundingBox: getBoundingBox(target),\n          isVisible: !!(target.offsetWidth || target.offsetHeight || target.getClientRects().length),\n          isInteractive: !hasDisabled && !hasReadonly,\n          isDisabled: hasDisabled,\n          styles: getComputedStyle ? (() => {\n            try {\n              const cs = getComputedStyle(target)\n              return {\n                color: cs.color,\n                backgroundColor: cs.backgroundColor,\n                fontSize: cs.fontSize,\n                fontWeight: cs.fontWeight\n              }\n            } catch {\n              return undefined\n            }\n          })() : undefined\n        }\n      }\n    } catch { return undefined }\n  }\n\n  // ⏱️ 时间间隙检测（识别等待/加载/思考时间）\n  let lastEventTimestamp = now()\n  const SIGNIFICANT_GAP_MS = 3000 // 3秒以上的间隙视为有意义的等待\n\n  // 原子化捕获 + 统一过滤\n  function sendEvent(e) {\n    const url = String(location.href)\n    e.action.url = e.action.url || url\n\n    // 过滤内部页面（唯一过滤点）\n    const IGNORED = ['flowith://', 'about:srcdoc', 'about:blank', 'chrome://', 'file://']\n    if (IGNORED.some(p => url.startsWith(p))) return\n\n    // 检测停顿\n    if (e.action.type !== 'scroll') {\n      const t = now()\n      const gap = t - lastEventTimestamp\n      if (gap > SIGNIFICANT_GAP_MS && lastEventTimestamp > 0) {\n        emit({\n          id: `event_wait_${lastEventTimestamp}_${Math.random().toString(36).slice(2)}`,\n          timestamp: lastEventTimestamp + 100,\n          action: { type: 'wait', duration: gap, combo: ['user-pause'], url }\n        })\n      }\n      lastEventTimestamp = t\n    }\n\n    emit(e)\n  }\n\n  // No auto session_start - let RecordingSession constructor handle it\n  // This prevents duplicate session_start on navigation re-injection\n\n  // Pointer tracking to validate genuine clicks\n  let pointerDownTarget = null\n\n  // 🎨 画布轨迹记录系统\n  let canvasTrackingState = {\n    isTracking: false,\n    target: null,\n    startPoint: null,\n    path: [], // [{x, y, t}]\n    lastRecordedPoint: null,\n    recordThreshold: 5 // 像素阈值，避免记录过于密集的点\n  }\n\n  // 检测是否是画布元素或其子元素\n  function isCanvasContext(element) {\n    if (!element) return false\n\n    // 直接是 canvas 或 svg\n    if (element.tagName === 'CANVAS' || element.tagName === 'SVG') {\n      return true\n    }\n\n    // 检查父元素中是否有 canvas 或 svg\n    let parent = element.parentElement\n    while (parent) {\n      if (parent.tagName === 'CANVAS' || parent.tagName === 'SVG') {\n        return true\n      }\n      // 检查是否有绘图相关的 role 或 class\n      const role = parent.getAttribute('role')\n      const className = parent.className || ''\n      if (role === 'img' || role === 'graphics-document' ||\n          typeof className === 'string' && (\n            className.includes('canvas') ||\n            className.includes('drawing') ||\n            className.includes('whiteboard') ||\n            className.includes('artboard')\n          )) {\n        return true\n      }\n      parent = parent.parentElement\n    }\n\n    return false\n  }\n\n  // 计算两点距离\n  function distance(p1, p2) {\n    const dx = p1.x - p2.x\n    const dy = p1.y - p2.y\n    return Math.sqrt(dx * dx + dy * dy)\n  }\n\n  // 简化路径（Douglas-Peucker 算法的简化版）\n  function simplifyPath(points, tolerance = 2) {\n    if (points.length <= 2) return points\n\n    const simplified = [points[0]]\n    let lastAdded = points[0]\n\n    for (let i = 1; i < points.length - 1; i++) {\n      const point = points[i]\n      if (distance(lastAdded, point) >= tolerance) {\n        simplified.push(point)\n        lastAdded = point\n      }\n    }\n\n    // 总是添加最后一个点\n    simplified.push(points[points.length - 1])\n    return simplified\n  }\n\n  // 路径转 SVG path 格式\n  function pathToSVGString(points) {\n    if (points.length === 0) return ''\n    if (points.length === 1) return `M${points[0].x},${points[0].y}`\n\n    let path = `M${points[0].x},${points[0].y}`\n    for (let i = 1; i < points.length; i++) {\n      path += ` L${points[i].x},${points[i].y}`\n    }\n    return path\n  }\n\n  window.addEventListener('pointerdown', function (ev) {\n    if (!ev.isTrusted) return\n    pointerDownTarget = ev.target\n\n    // 🎨 检测是否在画布上开始操作\n    if (isCanvasContext(ev.target)) {\n      const rect = ev.target.getBoundingClientRect()\n      canvasTrackingState.isTracking = true\n      canvasTrackingState.target = ev.target\n      canvasTrackingState.startPoint = {\n        x: Math.round(ev.clientX - rect.left),\n        y: Math.round(ev.clientY - rect.top),\n        t: now()\n      }\n      canvasTrackingState.path = [canvasTrackingState.startPoint]\n      canvasTrackingState.lastRecordedPoint = canvasTrackingState.startPoint\n    }\n  }, true)\n\n  // 🎨 追踪鼠标移动轨迹（passive 优化性能）\n  window.addEventListener('pointermove', function (ev) {\n    if (!ev.isTrusted) return\n    if (!canvasTrackingState.isTracking) return\n\n    const rect = canvasTrackingState.target.getBoundingClientRect()\n    const currentPoint = {\n      x: Math.round(ev.clientX - rect.left),\n      y: Math.round(ev.clientY - rect.top),\n      t: now()\n    }\n\n    // 只记录超过阈值的点，避免轨迹过于密集\n    if (distance(canvasTrackingState.lastRecordedPoint, currentPoint) >= canvasTrackingState.recordThreshold) {\n      canvasTrackingState.path.push(currentPoint)\n      canvasTrackingState.lastRecordedPoint = currentPoint\n    }\n  }, { passive: true, capture: true })\n\n  // 🎨 结束轨迹记录\n  window.addEventListener('pointerup', function (ev) {\n    if (!ev.isTrusted) return\n\n    if (canvasTrackingState.isTracking) {\n      const rect = canvasTrackingState.target.getBoundingClientRect()\n      const endPoint = {\n        x: Math.round(ev.clientX - rect.left),\n        y: Math.round(ev.clientY - rect.top),\n        t: now()\n      }\n\n      // 确保终点被记录\n      if (distance(canvasTrackingState.lastRecordedPoint, endPoint) > 0) {\n        canvasTrackingState.path.push(endPoint)\n      }\n\n      // 简化路径\n      const simplifiedPath = simplifyPath(canvasTrackingState.path)\n\n      // 判断是点击还是拖动\n      const isSimpleClick = simplifiedPath.length <= 2 &&\n        distance(canvasTrackingState.startPoint, endPoint) < 5\n\n      if (!isSimpleClick && simplifiedPath.length >= 2) {\n        // 发送拖动/绘制事件\n        const svgPath = pathToSVGString(simplifiedPath)\n        const duration = endPoint.t - canvasTrackingState.startPoint.t\n\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: canvasTrackingState.startPoint.t,\n          action: {\n            type: 'drag',\n            mouse: {\n              button: ev.button,\n              x: ev.pageX,\n              y: ev.pageY\n            },\n            path: svgPath,\n            pathPoints: simplifiedPath.length,\n            duration: duration,\n            combo: ['canvas-gesture']\n          },\n          target: elementContext(canvasTrackingState.target)\n        })\n      }\n\n      // 重置状态\n      canvasTrackingState.isTracking = false\n      canvasTrackingState.target = null\n      canvasTrackingState.path = []\n      canvasTrackingState.startPoint = null\n      canvasTrackingState.lastRecordedPoint = null\n    }\n  }, true)\n\n  // 移除 wheel 监听器 - 'scroll' 事件已经足够，wheel 会导致重复和性能问题\n\n  window.addEventListener('click', function (ev) {\n    if (!ev.isTrusted) return\n\n    // Verify click target matches pointerdown (avoids drag-release false clicks)\n    if (pointerDownTarget && pointerDownTarget !== ev.target) {\n      pointerDownTarget = null\n      return\n    }\n    pointerDownTarget = null\n\n    const target = ev.target\n    const rect = target instanceof Element ? target.getBoundingClientRect() : null\n    const offsetX = rect ? Math.round(ev.clientX - rect.left) : undefined\n    const offsetY = rect ? Math.round(ev.clientY - rect.top) : undefined\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: {\n        type: 'click',\n        url: String(location.href),  // 原子化捕获：事件 + 上下文\n        mouse: { button: ev.button, x: ev.pageX, y: ev.pageY, offsetX, offsetY },\n        key: (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) ?\n          { key: '', altKey: ev.altKey, ctrlKey: ev.ctrlKey, metaKey: ev.metaKey, shiftKey: ev.shiftKey } : undefined\n      },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  window.addEventListener('dblclick', function (ev) {\n    if (!ev.isTrusted) return\n\n    const target = ev.target\n    const rect = target instanceof Element ? target.getBoundingClientRect() : null\n    const offsetX = rect ? Math.round(ev.clientX - rect.left) : undefined\n    const offsetY = rect ? Math.round(ev.clientY - rect.top) : undefined\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: {\n        type: 'dblclick',\n        url: String(location.href),\n        mouse: { button: ev.button, x: ev.pageX, y: ev.pageY, offsetX, offsetY }\n      },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  // Input debounce to avoid character-by-character events\n  let inputTimer = null\n  let lastInputTarget = null\n  const recentInputByTarget = new WeakMap()\n  window.addEventListener('input', function (ev) {\n    if (!ev.isTrusted) return\n\n    const t = ev.target\n    if (inputTimer) clearTimeout(inputTimer)\n    inputTimer = setTimeout(function () {\n      const val = t && 'value' in t ? String(t.value) : undefined\n      // Only send if target changed or this is first input\n      if (t !== lastInputTarget || !lastInputTarget) {\n        lastInputTarget = t\n        if (t instanceof Element) {\n          recentInputByTarget.set(t, { value: val || '', timestamp: now() })\n        }\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: now(),\n          action: { type: 'input', value: val },\n          target: elementContext(t)\n        })\n      } else if (t instanceof Element) {\n        recentInputByTarget.set(t, { value: val || '', timestamp: now() })\n      }\n    }, 300)\n  }, true)\n\n  window.addEventListener('change', function (ev) {\n    if (!ev.isTrusted) return\n\n    const t = ev.target\n\n    // Skip checkboxes and radios (handled by click events)\n    if (t && t.tagName === 'INPUT') {\n      const type = t.getAttribute('type')\n      if (type === 'checkbox' || type === 'radio') return\n    }\n\n    const val = t && 'value' in t ? String(t.value) : undefined\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: { type: 'change', value: val },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  // 🎯 复制粘贴操作监听（跨页面工作流的关键操作）\n  let lastCopiedText = null\n\n  window.addEventListener('copy', function (ev) {\n    if (!ev.isTrusted) return\n\n    try {\n      const selection = window.getSelection()\n      const copiedText = selection ? selection.toString().trim() : ''\n\n      if (copiedText.length > 0) {\n        lastCopiedText = copiedText\n\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: now(),\n          action: {\n            type: 'copy',\n            value: copiedText.slice(0, 500), // 限制长度\n            combo: ['copy']\n          },\n          target: elementContext(ev.target)\n        })\n      }\n    } catch (e) {\n      // 忽略错误\n    }\n  }, true)\n\n  window.addEventListener('paste', function (ev) {\n    if (!ev.isTrusted) return\n\n    try {\n      let pastedText = ''\n      if (ev.clipboardData) {\n        pastedText = ev.clipboardData.getData('text/plain').trim()\n      }\n\n      sendEvent({\n        id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n        timestamp: now(),\n        action: {\n          type: 'paste',\n          value: pastedText.slice(0, 500), // 限制长度\n          combo: ['paste']\n        },\n        target: elementContext(ev.target)\n      })\n    } catch (e) {\n      // 忽略错误\n    }\n  }, true)\n\n  window.addEventListener('cut', function (ev) {\n    if (!ev.isTrusted) return\n\n    try {\n      const selection = window.getSelection()\n      const cutText = selection ? selection.toString().trim() : ''\n\n      if (cutText.length > 0) {\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: now(),\n          action: {\n            type: 'cut',\n            value: cutText.slice(0, 500), // 限制长度\n            combo: ['cut']\n          },\n          target: elementContext(ev.target)\n        })\n      }\n    } catch (e) {\n      // 忽略错误\n    }\n  }, true)\n\n  // 📝 文本选择监听（理解用户关注的内容）\n  let selectionTimer = null\n  let lastSelection = ''\n\n  document.addEventListener('selectionchange', function () {\n    if (selectionTimer) clearTimeout(selectionTimer)\n\n    selectionTimer = setTimeout(function () {\n      try {\n        const selection = window.getSelection()\n        const selectedText = selection ? selection.toString().trim() : ''\n\n        // 只记录有意义的选择（> 3 字符，避免误触）\n        if (selectedText.length > 3 && selectedText !== lastSelection) {\n          lastSelection = selectedText\n\n          // 获取选择的范围信息\n          const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null\n          const container = range ? range.commonAncestorContainer : null\n          const targetElement = container && container.nodeType === Node.ELEMENT_NODE\n            ? container\n            : (container ? container.parentElement : null)\n\n          sendEvent({\n            id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n            timestamp: now(),\n            action: {\n              type: 'select',\n              value: selectedText.slice(0, 500), // 限制长度\n              combo: ['text-selection']\n            },\n            target: targetElement ? elementContext(targetElement) : undefined\n          })\n        } else if (selectedText.length === 0 && lastSelection.length > 0) {\n          // 取消选择\n          lastSelection = ''\n        }\n      } catch (e) {\n        // 忽略错误\n      }\n    }, 500) // 防抖，避免选择过程中的噪音\n  })\n\n  // 🖱️ 右键菜单监听（关键操作入口）\n  window.addEventListener('contextmenu', function (ev) {\n    if (!ev.isTrusted) return\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: {\n        type: 'contextmenu',\n        mouse: {\n          button: 2, // 右键\n          x: ev.pageX,\n          y: ev.pageY\n        }\n      },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  // 📁 文件选择监听（上传工作流）\n  window.addEventListener('change', function (ev) {\n    if (!ev.isTrusted) return\n    const target = ev.target\n\n    if (target && target.tagName === 'INPUT' && target.type === 'file') {\n      const files = target.files\n      if (files && files.length > 0) {\n        const fileInfo = []\n        for (let i = 0; i < Math.min(files.length, 5); i++) {\n          fileInfo.push({\n            name: files[i].name,\n            type: files[i].type,\n            size: files[i].size\n          })\n        }\n\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: now(),\n          action: {\n            type: 'file',\n            value: JSON.stringify(fileInfo),\n            combo: ['file-upload']\n          },\n          target: elementContext(target)\n        })\n      }\n    }\n  }, true)\n\n  // 🎯 简化版焦点切换（仅记录表单元素，减少噪音）\n  let lastFocusedElement = null\n\n  window.addEventListener('focus', function (ev) {\n    if (!ev.isTrusted) return\n    const target = ev.target\n\n    // 仅记录重要表单元素（排除 button 和普通可聚焦元素）\n    if (target && (\n      target.tagName === 'INPUT' ||\n      target.tagName === 'TEXTAREA' ||\n      target.tagName === 'SELECT'\n    )) {\n      // 避免重复记录同一元素\n      if (lastFocusedElement !== target) {\n        lastFocusedElement = target\n\n        sendEvent({\n          id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n          timestamp: now(),\n          action: {\n            type: 'focus',\n            combo: ['focus-enter']\n          },\n          target: elementContext(target)\n        })\n      }\n    }\n  }, true)\n\n  // 移除 blur 监听 - 从 focus 序列就能推断出切换逻辑\n\n  // 移除 hover 监听 - 实践中发现对自动化价值有限，且容易产生噪音\n  // 如果需要，可以从 click 前的鼠标移动推断\n\n  // 📦 拖放监听（文件上传、元素重排）\n  window.addEventListener('drop', function (ev) {\n    if (!ev.isTrusted) return\n\n    const files = ev.dataTransfer && ev.dataTransfer.files\n    const hasFiles = files && files.length > 0\n\n    if (hasFiles) {\n      const fileInfo = []\n      for (let i = 0; i < Math.min(files.length, 5); i++) {\n        fileInfo.push({\n          name: files[i].name,\n          type: files[i].type,\n          size: files[i].size\n        })\n      }\n\n      sendEvent({\n        id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n        timestamp: now(),\n        action: {\n          type: 'drop',\n          value: JSON.stringify(fileInfo),\n          combo: ['file-drop'],\n          mouse: {\n            button: 0,\n            x: ev.pageX,\n            y: ev.pageY\n          }\n        },\n        target: elementContext(ev.target)\n      })\n    } else {\n      // 元素拖放\n      sendEvent({\n        id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n        timestamp: now(),\n        action: {\n          type: 'drop',\n          combo: ['element-drop'],\n          mouse: {\n            button: 0,\n            x: ev.pageX,\n            y: ev.pageY\n          }\n        },\n        target: elementContext(ev.target)\n      })\n    }\n  }, true)\n\n  // 📋 表单提交监听\n  window.addEventListener('submit', function (ev) {\n    if (!ev.isTrusted) return\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: {\n        type: 'submit',\n        combo: ['form-submit']\n      },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  // ⌨️ 统一的键盘事件处理（快捷键 + 导航键）\n  const commonShortcuts = {\n    's': 'save',\n    'k': 'command-palette',\n    'f': 'search',\n    'n': 'new',\n    'p': 'print',\n    'z': 'undo',\n    '/' : 'search-shortcut'\n    // 移除 copy/paste/cut - 已由专门的事件处理\n    // 移除过多的快捷键，只保留最常用的\n  }\n\n  const specialKeys = ['Enter', 'Tab', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown']\n\n  window.addEventListener('keydown', function (ev) {\n    if (!ev.isTrusted) return\n\n    // 优先检测快捷键\n    const hasModifier = ev.metaKey || ev.ctrlKey\n    const key = ev.key.toLowerCase()\n\n    if (hasModifier && commonShortcuts[key]) {\n      const shortcutName = commonShortcuts[key]\n      const modifier = ev.metaKey ? 'cmd' : 'ctrl'\n\n      sendEvent({\n        id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n        timestamp: now(),\n        action: {\n          type: 'keydown',\n          key: {\n            key: ev.key,\n            code: ev.code,\n            altKey: ev.altKey,\n            ctrlKey: ev.ctrlKey,\n            metaKey: ev.metaKey,\n            shiftKey: ev.shiftKey\n          },\n          combo: ['shortcut', `${modifier}+${key}`, shortcutName]\n        },\n        target: elementContext(ev.target)\n      })\n      return // 已处理\n    }\n\n    // 其次检测导航键\n    if (!specialKeys.includes(ev.key)) return\n\n    let combo\n    if (ev.target instanceof Element) {\n      const recent = recentInputByTarget.get(ev.target)\n      if (recent && now() - recent.timestamp < 2000) {\n        combo = ['input', ev.key.toLowerCase()]\n      }\n    }\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: { type: 'keydown', key: { key: ev.key, code: ev.code, altKey: ev.altKey, ctrlKey: ev.ctrlKey, metaKey: ev.metaKey, shiftKey: ev.shiftKey }, combo },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  window.addEventListener('keyup', function (ev) {\n    if (!ev.isTrusted) return\n    // Only record keyup for Enter, Tab, Escape\n    if (!['Enter', 'Tab', 'Escape'].includes(ev.key)) return\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: { type: 'keyup', key: { key: ev.key, code: ev.code } },\n      target: elementContext(ev.target)\n    })\n  }, true)\n\n  // 🎯 极简滚动监听 + 后处理合并策略\n  ;(function() {\n    let debounceTimer = null\n    let scrollStart = null\n\n    window.addEventListener('scroll', function(ev) {\n      const t = ev.target\n\n      // 只记录文档滚动\n      if (t !== document && t !== document.documentElement && t !== document.body && t !== window) {\n        return\n      }\n\n      if (debounceTimer) {\n        clearTimeout(debounceTimer)\n      } else {\n        scrollStart = { x: window.scrollX, y: window.scrollY, time: now() }\n      }\n\n      // 500ms 防抖\n      debounceTimer = setTimeout(function() {\n        const deltaX = window.scrollX - scrollStart.x\n        const deltaY = window.scrollY - scrollStart.y\n\n        debounceTimer = null\n        const startTime = scrollStart.time\n        scrollStart = null\n\n        // 阈值过滤\n        if (Math.abs(deltaX) < 50 && Math.abs(deltaY) < 50) return\n\n        // 异步发送\n        requestAnimationFrame(function() {\n          sendEvent({\n            id: `event_${startTime}_${Math.random().toString(36).slice(2)}`,\n            timestamp: startTime,\n            action: {\n              type: 'scroll',\n              url: String(location.href),  // 显式添加 URL\n              scroll: {\n                x: window.scrollX,\n                y: window.scrollY,\n                deltaX: deltaX,\n                deltaY: deltaY,\n                source: 'scroll'\n              }\n            }\n          })\n        })\n      }, 500)\n    }, { passive: true, capture: true })\n  })()\n\n  // Navigation via hashchange only (popstate handled below with history detection)\n  window.addEventListener('hashchange', function () {\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: { type: 'navigate', url: String(location.href), combo: ['hash-change'] }\n    })\n  }, true)\n\n  // 🎭 轻量级 Modal/Dialog 检测（仅使用属性观察，性能友好）\n  // 只观察 aria-modal 属性变化，避免全 DOM 监听\n  if ('MutationObserver' in window) {\n    const observer = new MutationObserver(function (mutations) {\n      mutations.forEach(function (mutation) {\n        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-modal') {\n          const el = mutation.target\n          if (el.getAttribute('aria-modal') === 'true') {\n            sendEvent({\n              id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n              timestamp: now(),\n              action: {\n                type: 'wait',\n                duration: 0,\n                value: 'modal-open',\n                combo: ['page-state-change', 'modal-open']\n              }\n            })\n          }\n        }\n      })\n    })\n\n    // 仅观察 body 的属性变化（不递归子树）\n    observer.observe(document.body, {\n      attributes: true,\n      attributeFilter: ['aria-modal', 'role'], // 只关注这两个属性\n      subtree: false, // 不递归观察子元素\n      childList: false\n    })\n  }\n\n  // 移除页面可见性监听 - 标签页切换在单页工作流中不太relevant\n  // 时间间隙检测已经能捕捉用户离开的时间\n\n  // 🔙 浏览器历史导航（前进/后退）\n  let lastHistoryLength = window.history.length\n  window.addEventListener('popstate', function (ev) {\n    const currentLength = window.history.length\n    const isBack = currentLength < lastHistoryLength\n    const isForward = currentLength > lastHistoryLength\n\n    sendEvent({\n      id: `event_${now()}_${Math.random().toString(36).slice(2)}`,\n      timestamp: now(),\n      action: {\n        type: 'navigate',\n        url: String(location.href),\n        combo: isBack ? ['history-back'] : (isForward ? ['history-forward'] : ['history-navigate'])\n      }\n    })\n\n    lastHistoryLength = currentLength\n  })\n\n  // Session end on unload\n  window.addEventListener('beforeunload', function () {\n    sendEvent({ id: `event_${now()}_end`, timestamp: now(), action: { type: 'session_end' } })\n  }, true)\n})()\n";
class CDPRecorder {
  constructor(client, options) {
    this.session = null;
    this.injected = false;
    this.heartbeatInterval = null;
    this.boundListeners = [];
    this.client = client;
    this.options = options;
  }
  async start(initialUrl, listeners) {
    await this._ensureDomains();
    await this._inject();
    const stateCapture = new StateCapture(this.client);
    const viewport = await this._captureViewport();
    this.session = new RecordingSession(stateCapture, {
      postEventDelayMs: this.options.postEventDelayMs,
      initialUrl: initialUrl || await this._getUrl(),
      viewport,
      listeners
    });
    this._wireBinding();
    this._wireNavigationListener();
    this._startHeartbeat();
    return this.session;
  }
  // 🎯 跨 tab 支持：使用现有 session 继续录制
  async startWithSession(existingSession) {
    await this._ensureDomains();
    await this._inject();
    this.session = existingSession;
    this._wireBinding();
    this._wireNavigationListener();
    this._startHeartbeat();
  }
  async stop() {
    this._stopHeartbeat();
    this._clearListeners();
    this.session = null;
  }
  _clearListeners() {
    this.boundListeners = [];
  }
  _startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.client.send("Runtime.evaluate", {
          expression: "1+1",
          returnByValue: true
        });
      } catch {
        this._stopHeartbeat();
        if (this.session) ;
      }
    }, 5e3);
  }
  _stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  async _getUrl() {
    const res = await this.client.send("Runtime.evaluate", {
      expression: "location.href",
      returnByValue: true
    });
    return String(res.result?.value || "");
  }
  async _ensureDomains() {
    await this.client.send("Page.enable");
    await this.client.send("Runtime.enable");
    try {
      await this.client.send("Accessibility.enable");
    } catch {
    }
  }
  async _inject() {
    if (this.injected) return;
    await this.client.send("Runtime.addBinding", { name: "teachEmit" });
    const script = await this._loadInjectedScript();
    await this.client.send("Runtime.evaluate", {
      expression: script,
      contextId: void 0,
      awaitPromise: false
    });
    this.injected = true;
  }
  _wireBinding() {
    if (!("on" in this.client) || !this.client.on) return;
    const handler = (params) => {
      if (params?.name !== "teachEmit") return;
      try {
        const payload = JSON.parse(params.payload);
        if (this.session) this.session.addEvent(payload);
      } catch {
      }
    };
    this.client.on("Runtime.bindingCalled", handler);
    this.boundListeners.push({ event: "Runtime.bindingCalled", handler });
  }
  _wireNavigationListener() {
    if (!("on" in this.client) || !this.client.on) return;
    const handler = async (params) => {
      if (!this.session) return;
      const url = params?.frame?.url;
      if (!url) return;
      if (url.startsWith("flowith://blank")) {
        return;
      }
      const navEvent = {
        id: `event_nav_${Date.now()}`,
        timestamp: Date.now(),
        action: { type: "navigate", url }
      };
      this.session.addEvent(navEvent);
      setTimeout(async () => {
        try {
          this.injected = false;
          await this._inject();
        } catch {
        }
      }, 100);
    };
    this.client.on("Page.frameNavigated", handler);
    this.boundListeners.push({ event: "Page.frameNavigated", handler });
  }
  async _captureViewport() {
    try {
      const res = await this.client.send("Runtime.evaluate", {
        expression: `({
					width: window.innerWidth,
					height: window.innerHeight,
					deviceScaleFactor: window.devicePixelRatio,
					isMobile: /Mobi|Android/i.test(navigator.userAgent),
					hasTouch: 'ontouchstart' in window,
					isLandscape: window.innerWidth > window.innerHeight
				})`,
        returnByValue: true
      });
      return res.result?.value;
    } catch {
      return void 0;
    }
  }
  async _loadInjectedScript() {
    try {
      return String(pageRecorderSource);
    } catch {
      return '(() => { console.warn("teach-guidance: missing injected script"); })()';
    }
  }
}
class FileStorage {
  constructor(opts) {
    this.base = opts.basePath;
  }
  dir(p) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }
  async saveRecording(recording) {
    const id = recording.session.id;
    const recDir = path.join(this.base, "recordings");
    this.dir(recDir);
    fs.writeFileSync(
      path.join(recDir, `${id}.json`),
      JSON.stringify(recording, null, 2)
    );
    await this._upsertIndex(id, { recording: true });
    return id;
  }
  async saveWorkflow(recordingId, workflow) {
    const wfDir = path.join(this.base, "workflows");
    this.dir(wfDir);
    fs.writeFileSync(
      path.join(wfDir, `${recordingId}.json`),
      JSON.stringify(workflow, null, 2)
    );
    await this._upsertIndex(recordingId, {
      workflow: true,
      title: workflow.metadata.name,
      stepCount: workflow.steps.length
    });
  }
  getRecording(recordingId) {
    const p = path.join(this.base, "recordings", `${recordingId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  getWorkflow(recordingId) {
    const p = path.join(this.base, "workflows", `${recordingId}.json`);
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  list() {
    const idxP = path.join(this.base, "index.json");
    if (!fs.existsSync(idxP)) return [];
    const idx = JSON.parse(fs.readFileSync(idxP, "utf8"));
    return idx.items || [];
  }
  async _upsertIndex(id, data) {
    const idxP = path.join(this.base, "index.json");
    let idx = { items: [] };
    if (fs.existsSync(idxP)) idx = JSON.parse(fs.readFileSync(idxP, "utf8"));
    const i = idx.items.findIndex((x) => x.id === id);
    if (i === -1) idx.items.push({ id, ...data });
    else idx.items[i] = { ...idx.items[i], ...data };
    fs.writeFileSync(idxP, JSON.stringify(idx, null, 2));
  }
}
const DEFAULT_MAX_TOKENS = Number(process.env.TEACH_MODE_MAX_TOKENS ?? 16384);
const DEFAULT_TEMPERATURE = 0;
const SYSTEM_PROMPT = process.env.TEACH_MODE_SYSTEM_PROMPT ?? "You are an advanced workflow analyst. Read the prompt and respond with strict JSON only.";
class GeminiLLMProvider {
  langsmithConfig = index$2._();
  constructor() {
    console.log("[TeachMode][GeminiLLMProvider] Using unified model configuration (via getModel)");
  }
  async invoke(prompt, options) {
    const temperature = options?.temperature ?? DEFAULT_TEMPERATURE;
    const systemPrompt = options?.systemPrompt ?? SYSTEM_PROMPT;
    const attemptInvoke = async (maxTokens, attemptNumber) => {
      const model = await index$2.a0("fast");
      const isFirstAttempt = attemptNumber === 1;
      if (isFirstAttempt) {
        console.log(`[TeachMode][GeminiLLMProvider] Using ${model.model}, system=${systemPrompt.length}chars, user=${prompt.length}chars`);
      } else {
        console.log(`[TeachMode][GeminiLLMProvider] Retry ${attemptNumber} with ${maxTokens} tokens`);
      }
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ];
      const requestParams = {
        model: model.model,
        temperature,
        max_tokens: maxTokens,
        messages,
        stream: false
      };
      const shouldUseJson = options?.outputFormat === "json";
      if (shouldUseJson && model.config.provider !== "cerebras") {
        requestParams.response_format = { type: "json_object" };
      }
      const response = await model.client.chat.completions.create(requestParams);
      if ("choices" in response) {
        const choice = response.choices?.[0];
        const message = choice?.message;
        let content = message?.content?.trim() || "";
        const reasoningContent = message?.reasoning_content?.trim() || "";
        const finishReason = choice?.finish_reason;
        if (!content && reasoningContent && finishReason === "length") {
          throw new Error("TOKEN_LIMIT_EXCEEDED");
        }
        if (!content) {
          console.error("[TeachMode][GeminiLLMProvider] Empty response:", { finishReason, hasReasoning: !!reasoningContent });
          throw new Error("Empty response from API");
        }
        console.log(`[TeachMode][GeminiLLMProvider] ✓ Received ${content.length}chars${reasoningContent ? ` (reasoning: ${reasoningContent.length}chars)` : ""}`);
        return content;
      }
      throw new Error("[TeachMode][GeminiLLMProvider] Invalid response format");
    };
    const operation = async () => {
      const tokenMultipliers = [1, 1.5, 2, 3];
      for (let i = 0; i < tokenMultipliers.length; i++) {
        const maxTokens = Math.floor(DEFAULT_MAX_TOKENS * tokenMultipliers[i]);
        try {
          return await attemptInvoke(maxTokens, i + 1);
        } catch (error) {
          const isTokenError = error instanceof Error && error.message === "TOKEN_LIMIT_EXCEEDED";
          const isLastAttempt = i === tokenMultipliers.length - 1;
          if (isTokenError && !isLastAttempt) continue;
          if (isTokenError) throw new Error(`Response truncated after ${tokenMultipliers.length} attempts (${maxTokens} tokens). Simplify the workflow.`);
          throw error;
        }
      }
      throw new Error("Unexpected: retry loop completed");
    };
    try {
      return await index$2.$(operation, {
        name: "teach-mode:llm",
        runType: "llm",
        metadata: {
          feature: "teach-mode",
          provider: "unified-model-config"
        },
        inputs: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature
        },
        langsmithConfig: this.langsmithConfig
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[TeachMode][GeminiLLMProvider] invoke failed:", message);
      if (message.includes("User not authenticated")) {
        throw new Error("请先登录后再使用 Teach Mode 总结功能");
      }
      throw error instanceof Error ? error : new Error(message);
    }
  }
}
function getSkillGenerationSystemPrompt() {
  return `You are a Browser Agent Skill Learning Assistant. Your task is to analyze user operations and extract reusable operational knowledge.

# IDENTITY & MISSION

- Extract reusable, production-ready operational knowledge from user demonstrations
- Generate skills that Browser Agents can execute reliably
- Support two modes:
  * **New Skill**: Generate a complete skill file from scratch
  * **Merge Mode**: Integrate new workflow into existing skill file (you'll receive the existing file in user prompt)

# MODE-SPECIFIC INSTRUCTIONS

## 1. New Skill Mode
- You will receive only a new set of user operations.
- Generate a COMPLETE skill file that follows the OUTPUT FORMAT section below.

## 2. Merge Mode
- You will receive the existing skill file (as Markdown) and a new set of user operations.
- Generate the COMPLETE merged skill file that integrates the new operations.
- Update matcher_summary so it reflects ALL capabilities (old + new).
- Perform smart integration: merge or update overlapping workflows, add complementary ones, and reorder if it improves clarity.
- Place the new or updated workflow first, followed by the remaining workflows.
- Return the entire merged skill file, ready to be saved as-is.

# INTELLIGENT GENERALIZATION PRINCIPLE

Core Judgment Standard:
- **Fixed UI Controls** (button text, navigation labels, form field names) → Precise matching
- **Dynamic User Content** (article titles, search results, user data) → Generalized description

Analysis Method:
By observing the page elements, you need to identify:
1. What is the standard UI framework of the website (fixed elements)
2. What is the user-generated content area (variable elements)
3. Which elements have multiple instances with similar functions (extract common patterns)

Goal: Generate workflows that can precisely locate fixed elements while flexibly adapting to dynamic content.

# OUTPUT FORMAT (Markdown with YAML Frontmatter)

⚠️ CRITICAL: Skills MUST start with YAML frontmatter or agents cannot find them!

Generate content with this EXACT structure:

\`\`\`markdown
---
matcher_summary: '[60-120 char action-oriented description for agent matching]'
website: 'hostname.com'
last_verified: 'YYYY-MM-DD'
---

# [Website Name] Operations

## Task Workflow: [Workflow Name]

**Purpose**: [Brief description of the problem this workflow solves]
**Last Verified**: [YYYY-MM-DD]

**Prerequisites** (optional):
- [Generalized prerequisites, e.g., "requires login" not "requires john@example.com account"]

**Recipe**:
1. [Step 1 - natural language description]
   - Target: [Generalized element identification strategy with multiple matching methods]
   - Action: [Action description + generalized expected outcome pattern]
   - Timing: [Generalized wait condition, optional]

2. [Step 2]
   - Target: ...
   - Action: ...

**Error Handling**:
- [Generalized error handling strategies]

**Success Criteria**:
- [Generalized success indicators]

---

## Primitive Operations (optional)

If you identify reusable atomic operations (login, file upload), record them here:

### Operation: [Operation Name]

**Purpose**: [Description]
**Recipe**:
1. ...

**Error Handling**: ...
**Success Criteria**: ...
\`\`\`

# CRITICAL CONSTRAINTS

- **MUST** start with YAML frontmatter (---...---)
- **MUST** include matcher_summary (agents can't find skills without it!)
- matcher_summary: 60-120 chars, action-oriented, include website name
- Output pure Markdown (no JSON wrapper, no \`\`\`markdown blocks around entire output)
- Use generalized descriptions for dynamic content
- Use precise matching for fixed UI controls
- Make the workflow executable by reading it

# matcher_summary Examples (STUDY THESE)

CRITICAL: matcher_summary MUST be action-oriented, specific, and 60-120 characters long!

Good matcher_summaries (60-120 chars, clear action verbs, specific use case):
- "Search and navigate GitHub repositories. Use for finding code/projects on github.com" (85 chars)
- "Google search operations and result navigation. Use for web searches on google.com" (82 chars)
- "Create and edit spreadsheets with Google Sheets at docs.google.com/spreadsheets" (80 chars)
- "Publish videos on YouTube via YouTube Studio. Use for uploading content to youtube.com" (87 chars)
- "Submit and manage pull requests on GitHub. Use for code review workflows on github.com" (87 chars)
- "Create and edit documents with Google Docs. Use for collaborative writing on docs.google.com" (94 chars)

Bad matcher_summaries (learn from these mistakes):
- "GitHub" (too short, not action-oriented, no use case)
- "This skill helps you search on GitHub" (too verbose, not concise enough)
- "Web operations" (too generic, no website specified, no specific action)
- "Login and authentication on example.com" (too short - 41 chars, add use case)
- "Form operations on example.com. Use for submitting data" (too generic, what kind of form? what specific action?)

Formula for perfect matcher_summary:
[Specific Action Verb] + [Object/Feature] + [Context/Platform]. Use for [Specific Use Case] on [domain]

Examples applying the formula:
- Action: "Upload", Object: "videos", Context: "YouTube Studio", Use case: "content publishing", Domain: "youtube.com"
  → "Upload videos to YouTube via YouTube Studio. Use for content publishing on youtube.com"
- Action: "Search/filter", Object: "issues", Context: "GitHub", Use case: "bug tracking", Domain: "github.com"
  → "Search and filter GitHub issues. Use for bug tracking and project management on github.com"

# COMPLETE EXAMPLE (MUST FOLLOW THIS FORMAT)

\`\`\`markdown
---
matcher_summary: 'Submit issues on GitHub. Use for creating bug reports/feature requests on github.com'
website: 'github.com'
last_verified: '2025-01-06'
---

# GitHub Operations

## Task Workflow: Submit GitHub Issue

**Purpose**: Create and submit a new issue in a GitHub repository
**Last Verified**: 2025-01-28

**Prerequisites**:
- Must be logged into GitHub
- Must have access to the target repository

**Recipe**:
1. Navigate to Issues tab
   - Target: Link or button with text "Issues" in the repository navigation bar
   - Action: Click → Navigate to issues list page

2. Initiate new issue creation
   - Target: Button with text "New issue" (typically green, top-right area)
   - Action: Click → Open issue creation form

3. Fill in issue title
   - Target: Input field with placeholder "Title" or aria-label containing "title"
   - Action: Type the issue title

4. Fill in issue description
   - Target: Textarea with placeholder "Leave a comment" or similar
   - Action: Type the issue description (supports Markdown)

5. Submit the issue
   - Target: Button with text "Submit new issue" (green, bottom of form)
   - Action: Click → Create issue and navigate to issue page

**Error Handling**:
- If "New issue" button not found, scroll down or check repository permissions
- If form validation fails, check for required field indicators

**Success Criteria**:
- URL changes to /issues/[number]
- Page displays the created issue with title and description
- Success message appears briefly`;
}
function generalizeUrl(url) {
  try {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const newParams = new URLSearchParams();
    params.forEach((_value, key) => {
      newParams.set(key, `{{${key}}}`);
    });
    urlObj.search = newParams.toString();
    return urlObj.toString().replace(/%7B/g, "{").replace(/%7D/g, "}");
  } catch {
    return url;
  }
}
function generalizeValue(value, element) {
  if (!value) return value;
  if (element?.type === "password") return "{{password}}";
  if (element?.type === "email" || value.includes("@")) return "{{email}}";
  const nameAttr = element?.attributes?.name || element?.id || "";
  const usernamePatterns = ["username", "user", "login", "account"];
  if (nameAttr && usernamePatterns.some((p) => nameAttr.toLowerCase().includes(p))) {
    return "{{username}}";
  }
  return value;
}
function buildSmartSelectors(el) {
  const selectors = [];
  if (el.dataset?.testid) {
    selectors.push(`[data-testid="${el.dataset.testid}"]`);
    if (el.text) selectors.push(`text="${el.text.slice(0, 30)}"`);
    return selectors;
  }
  if (el.id) {
    selectors.push(`#${el.id}`);
    if (el.text) selectors.push(`text="${el.text.slice(0, 30)}"`);
    else if (el.role) selectors.push(`role="${el.role}"`);
    return selectors;
  }
  if (el.text) selectors.push(`text="${el.text.slice(0, 40)}"`);
  if (el.role) selectors.push(`role="${el.role}"`);
  if (selectors.length >= 2) {
    if (el.classes) {
      const importantClasses = el.classes.filter(
        (c) => c.includes("primary") || c.includes("cta") || c.includes("submit") || c.includes("btn-")
      );
      if (importantClasses.length > 0) {
        selectors.push(`.${importantClasses[0]}`);
      }
    }
    if (el.tagName) selectors.push(`<${el.tagName}>`);
    return selectors;
  }
  if (el.ariaLabel) selectors.push(`aria="${el.ariaLabel}"`);
  if (el.placeholder) selectors.push(`placeholder="${el.placeholder}"`);
  if (el.tagName) selectors.push(`<${el.tagName}>`);
  if (el.type) selectors.push(`type="${el.type}"`);
  if (selectors.length === 0 && el.classes) {
    const importantClasses = el.classes.filter(
      (c) => c.includes("button") || c.includes("btn") || c.includes("link") || c.includes("input")
    );
    if (importantClasses.length > 0) {
      selectors.push(`.${importantClasses[0]}`);
    }
  }
  return selectors.length > 0 ? selectors : ["<unknown>"];
}
function buildSkillGenerationPrompt(events, hostname, _options) {
  const lines = [];
  const urls = /* @__PURE__ */ new Set();
  events.forEach((e) => {
    const url = e.state?.page?.url || e.action.url;
    if (url) urls.add(generalizeUrl(url));
  });
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  lines.push(`Hostname: ${hostname}`);
  lines.push(`Total Events: ${events.length}`);
  lines.push(`URLs: ${Array.from(urls).join(", ")}`);
  lines.push(`Time Range: ${new Date(events[0]?.timestamp || Date.now()).toISOString()} → ${new Date(events[events.length - 1]?.timestamp || Date.now()).toISOString()}`);
  lines.push(`Today's Date: ${today} (use this for last_verified field)`);
  if (_options?.goal) {
    lines.push("");
    lines.push(`## User's Goal`);
    lines.push(_options.goal);
    lines.push("");
    lines.push("Note: Use this goal to better understand the user's intent when generating the workflow. The steps should align with achieving this goal.");
  }
  if (_options?.existingSkillContent) {
    lines.push(`
---

## MERGE MODE

**Existing Skill File:**
\`\`\`markdown
${_options.existingSkillContent}
\`\`\`
`);
    lines.push("");
    lines.push("## NEW USER OPERATIONS TO INTEGRATE");
  } else {
    lines.push("## USER OPERATIONS TO ANALYZE");
  }
  lines.push("");
  const startTime = events[0]?.timestamp || Date.now();
  let currentUrl = "";
  for (const [_index, event] of events.entries()) {
    if (event.action.type === "session_start" || event.action.type === "session_end") {
      continue;
    }
    const time = ((event.timestamp - startTime) / 1e3).toFixed(1);
    const url = event.action.url || event.state?.page?.url;
    if (!url) {
      console.warn(`[Skill Prompt] Skipping event ${event.action.type} without URL`);
      continue;
    }
    if (url !== currentUrl) {
      lines.push("");
      lines.push(`## PAGE: ${generalizeUrl(url)}`);
      if (event.state?.page?.title) lines.push(`Title: ${event.state.page.title}`);
      if (event.state?.viewport) {
        lines.push(`Viewport: ${event.state.viewport.innerWidth}×${event.state.viewport.innerHeight}, Scroll: (${event.state.viewport.scrollX}, ${event.state.viewport.scrollY})`);
      }
      lines.push("");
      currentUrl = url;
    }
    const parts = [`[${time}s] ${event.action.type}`];
    if (event.action.combo && event.action.combo.length > 0) {
      const semantics = event.action.combo.filter((c) => !["user-pause"].includes(c));
      if (semantics.length > 0) {
        parts.push(`(${semantics.join(", ")})`);
      }
    }
    if (event.target?.element) {
      const selectors = buildSmartSelectors(event.target.element);
      const selectorStr = selectors.join(", ");
      if (event.target.element.isDisabled) {
        parts.push(`on [${selectorStr}] (disabled)`);
      } else {
        parts.push(`on [${selectorStr}]`);
      }
    }
    if (event.action.value) {
      const generalizedValue = generalizeValue(event.action.value, event.target?.element);
      parts.push(`with "${generalizedValue?.slice(0, 60) || event.action.value.slice(0, 60)}"`);
    }
    if (event.action.path && event.action.pathPoints) {
      parts.push(`[gesture: ${event.action.pathPoints} points, ${event.action.duration}ms]`);
    }
    if (event.action.scroll) {
      const deltaY = Math.abs(event.action.scroll.deltaY || 0);
      if (deltaY > 500) {
        const direction = (event.action.scroll.deltaY || 0) > 0 ? "↓" : "↑";
        parts.push(`${direction} ${Math.round(deltaY)}px`);
      }
    }
    lines.push(parts.join(" "));
    if (event.narration) {
      lines.push(`  💬 "${event.narration}"`);
    }
  }
  return {
    systemPrompt: getSkillGenerationSystemPrompt(),
    userPrompt: lines.join("\n")
  };
}
function getPresetGenerationSystemPrompt() {
  return `You are a Workflow Description Generator. Your task is to create generalized, executable workflow descriptions for Browser Agents while preserving valuable user preferences.

# MISSION

Generate a workflow with TWO layers:

1. **Steps** (generalized, reusable actions)
   - Atomic, executable actions
   - Universal terminology
   - Applicable to similar scenarios

2. **Preferences** (user's specific context, optional)
   - Websites they used (if meaningful for the workflow)
   - Brief context about their specific usage (if relevant)

# STEP DESIGN PRINCIPLES

**Atomicity**: Each step = one clear action
- ✓ "Navigate to the content source website"
- ✗ "Navigate to website and search" (two actions)

**Generalization**: Use universal terms in steps
- ✓ "Search for target article based on given topic"
- ✗ "Search for 'React Hooks Tutorial'" (too specific)

**Conditionality**: Include decision points explicitly
- ✓ "If login is required, complete the login process"

**Verification**: Add validation after critical operations
- ✓ "Verify content is saved correctly with proper formatting"

# PREFERENCES (OPTIONAL)

Only include preferences if they provide meaningful context:

**Websites**: If the workflow is site-specific
- Example: ["medium.com", "notion.so"]

**Context**: Brief description of user's specific usage pattern (1-2 sentences)
- Example: "User typically selects article introduction and main points, then pastes into 'Learning Notes' with original formatting"

# OUTPUT FORMAT

Return ONLY valid JSON:

{
  "name": "Concise workflow name (3-8 words)",
  "steps": [
    "Generalized atomic steps here..."
  ],
  "preferences": {
    "websites": ["example.com"],  // optional
    "context": "Brief usage context"  // optional
  }
}

# EXAMPLE

{
  "name": "Content Transfer Workflow",
  "steps": [
    "Navigate to the content source website",
    "Search for target article based on given topic or author",
    "If login is required, complete the login process",
    "Open the target article",
    "Select and copy relevant content sections",
    "Navigate to the note-taking application",
    "Locate the destination notebook or page",
    "Paste content into appropriate position",
    "Verify content is saved correctly with proper formatting"
  ],
  "preferences": {
    "websites": ["medium.com", "notion.so"],
    "context": "User typically saves article introductions and key sections to 'Learning Notes' in Notion"
  }
}

# CRITICAL CONSTRAINTS

- Output pure JSON only (no \`\`\`json wrapper)
- Steps use universal terminology (no specific values)
- Preferences are optional - only include if meaningful
- Each step MUST be atomic
- Include "If..." conditionals for decision points`;
}
function buildPresetGenerationPrompt(recording, _options) {
  const lines = [];
  const hostnames = /* @__PURE__ */ new Set();
  recording.events.forEach((e) => {
    const url = e.state?.page?.url || e.action.url;
    if (url) {
      try {
        hostnames.add(new URL(url).hostname);
      } catch {
      }
    }
  });
  const duration = ((recording.session.endTimestamp || Date.now()) - recording.session.startTimestamp) / 1e3;
  lines.push(`Duration: ${duration.toFixed(1)}s`);
  lines.push(`Events: ${recording.events.length}`);
  lines.push(`Websites: ${Array.from(hostnames).join(", ")}`);
  if (_options?.goal) {
    lines.push("");
    lines.push(`## User's Goal`);
    lines.push(_options.goal);
    lines.push("");
    lines.push("Note: Use this goal as the primary context for naming and describing the workflow. The workflow name and steps should directly reflect this goal.");
  }
  lines.push("");
  lines.push("---");
  lines.push("");
  const startTime = recording.session.startTimestamp;
  let lastUrl = "";
  for (const event of recording.events) {
    if (event.action.type === "session_start" || event.action.type === "session_end") {
      continue;
    }
    const url = event.action.url || event.state?.page?.url;
    if (!url) {
      console.warn(`[Preset Prompt] Skipping event ${event.action.type} without URL`);
      continue;
    }
    const time = ((event.timestamp - startTime) / 1e3).toFixed(1);
    if (url !== lastUrl) {
      lines.push("");
      lines.push(`## ${generalizeUrl(url)}`);
      if (event.state?.page?.title) lines.push(`   ${event.state.page.title}`);
      lines.push("");
      lastUrl = url;
    }
    const MEANINGFUL = ["click", "dblclick", "input", "change", "submit", "copy", "paste", "select", "drag", "drop", "file"];
    if (MEANINGFUL.includes(event.action.type)) {
      const target = event.target?.element?.text || event.target?.element?.ariaLabel || event.target?.element?.placeholder;
      const value = event.action.value;
      const generalizedValue = generalizeValue(value, event.target?.element);
      const parts = [`[${time}s]`, event.action.type];
      if (event.action.combo && event.action.combo.length > 0) {
        const semantics = event.action.combo.filter((c) => !["user-pause"].includes(c));
        if (semantics.length > 0) {
          parts.push(`(${semantics.join(", ")})`);
        }
      }
      if (target) parts.push(`"${target.slice(0, 40)}"`);
      if (generalizedValue || value) {
        parts.push(`→ "${(generalizedValue || value).slice(0, 40)}"`);
      }
      lines.push(parts.join(" "));
      if (event.narration) {
        lines.push(`  💬 "${event.narration}"`);
      }
    }
    if (event.action.type === "scroll" && event.action.scroll) {
      const deltaY = Math.abs(event.action.scroll.deltaY || 0);
      if (deltaY > 500) {
        const direction = (event.action.scroll.deltaY || 0) > 0 ? "↓" : "↑";
        lines.push(`[${time}s] scroll ${direction} ${Math.round(deltaY)}px`);
      }
    }
  }
  lines.push("");
  return {
    systemPrompt: getPresetGenerationSystemPrompt(),
    userPrompt: lines.join("\n")
  };
}
const RECORDING_OPTIONS = {
  captureScreenshots: true,
  debounceMs: 200,
  postEventDelayMs: 120
};
function now() {
  return Date.now();
}
function safeCloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
class TeachModeService {
  static instance = null;
  static getInstance() {
    if (!TeachModeService.instance) {
      TeachModeService.instance = new TeachModeService();
    }
    return TeachModeService.instance;
  }
  state = { status: "idle" };
  recorder = null;
  session = null;
  status = "idle";
  storage = null;
  lastEventEmit = 0;
  initialUrl;
  tabController;
  paused = false;
  // 🎯 实时滚动合并
  scrollMergeTimer = null;
  scrollBuffer = [];
  lastScrollSummary = null;
  lastScrollUrl = null;
  // 跟踪滚动所属的页面
  constructor() {
    this.tabController = index$2.J.createController("system");
    mainEventBus.m.on("tabs:removed", ({ tabId }) => {
      if (this.state.activeTabId && tabId === this.state.activeTabId) {
        void this.detachFromClosedTab(tabId);
      }
    });
    mainEventBus.m.on("tabs:currentChanged", ({ previousTabId, currentTabId }) => {
      if (this.status === "recording" && currentTabId) {
        void this.switchRecordingTab(previousTabId, currentTabId);
      }
    });
    mainEventBus.m.on("tabs:added", (tabInfo) => {
      if (this.status === "recording" && !this.recorder && !this.session) {
        console.log("[TeachModeService] New tab detected, attaching recorder");
        void this.attachToTab(tabInfo.id);
      }
    });
  }
  getState() {
    return safeCloneState(this.state);
  }
  async start(goal) {
    if (this.status === "processing") {
      throw new Error("Teach mode is currently generating guidance");
    }
    if (this.status === "recording") {
      return this.getState();
    }
    const activeTab = this.tabController.currentTab;
    if (!activeTab) {
      console.log("[TeachModeService] Starting recording without active tab (waiting for tab creation)");
      this.status = "recording";
      this.state = {
        status: "recording",
        recordingId: `recording_${Date.now()}`,
        activeTabId: void 0,
        activeTabUrl: void 0,
        startedAt: now(),
        eventCount: 0,
        lastEventType: void 0,
        events: [],
        progress: void 0,
        error: void 0,
        goal: goal || void 0
      };
      this.emitState();
      return this.getState();
    }
    const sanitizedInitialUrl = shouldIgnoreUrl(activeTab.url) ? void 0 : activeTab.url;
    this.initialUrl = sanitizedInitialUrl;
    const view = activeTab.getView();
    const debuggerClient = ElectronDebuggerClient.attach(view.webContents.debugger);
    const recorder = new CDPRecorder(debuggerClient, RECORDING_OPTIONS);
    let session = null;
    const updateFromEvent = (event) => {
      if (this.paused) {
        return;
      }
      const nowTs = now();
      if (event.action.type === "scroll") {
        this.handleScrollEvent(event);
        return;
      }
      this.flushScrollBuffer();
      this.lastScrollSummary = null;
      this.lastScrollUrl = null;
      const events = this.state.events ? [...this.state.events] : [];
      const summary = this.toEventSummary(event);
      events.unshift(summary);
      if (events.length > 100) events.length = 100;
      const eventUrlCandidate = (typeof event.action.url === "string" && event.action.url.length > 0 ? event.action.url : event.state?.page?.url) || null;
      const baselineUrl = this.state.activeTabUrl ?? this.initialUrl;
      const activeUrl = eventUrlCandidate && !shouldIgnoreUrl(eventUrlCandidate) ? eventUrlCandidate : baselineUrl;
      if (!this.initialUrl && activeUrl && !shouldIgnoreUrl(activeUrl)) {
        this.initialUrl = activeUrl;
      }
      const nextState = {
        ...this.state,
        eventCount: (this.state.eventCount || 0) + 1,
        lastEventType: event.action.type,
        events,
        activeTabUrl: activeUrl
      };
      this.state = nextState;
      if (nowTs - this.lastEventEmit > 300) {
        this.lastEventEmit = nowTs;
        this.emitState();
      }
    };
    try {
      session = await recorder.start(activeTab.url, {
        onEvent: updateFromEvent
      });
      this.recorder = recorder;
      this.session = session;
      this.status = "recording";
      this.state = {
        status: "recording",
        recordingId: session.getRecordingId(),
        activeTabId: activeTab.id,
        activeTabUrl: sanitizedInitialUrl,
        startedAt: now(),
        eventCount: 0,
        lastEventType: void 0,
        events: [],
        progress: void 0,
        error: void 0,
        goal: goal || void 0
      };
      this.emitState();
      return this.getState();
    } catch (error) {
      console.error("[TeachModeService] Failed to start recording:", error);
      await this.safeStopRecorder(recorder, session);
      this.recorder = null;
      this.session = null;
      this.status = "idle";
      this.setError(error instanceof Error ? error.message : String(error));
      return this.getState();
    }
  }
  async finish(options) {
    if (this.status !== "recording") {
      return this.getState();
    }
    if (!this.session) {
      console.warn("[TeachModeService] No recording session found, cannot finish");
      this.status = "idle";
      this.state = {
        status: "error",
        error: "No events recorded. Please open a webpage and perform actions before finishing.",
        eventCount: 0,
        summary: void 0,
        events: []
      };
      this.emitState();
      return this.getState();
    }
    this.flushScrollBuffer();
    const session = this.session;
    const recorder = this.recorder;
    this.status = "processing";
    this.state = {
      ...this.state,
      status: "processing",
      progress: { stage: "finalizing", message: "Finalizing recording..." },
      error: void 0
    };
    this.emitState();
    try {
      const recording = await session.stop();
      await recorder?.stop();
      this.recorder = null;
      this.session = null;
      this.lastEventEmit = 0;
      const sanitizedRecording = this.sanitizeRecording(recording);
      const storage = this.getStorage();
      await storage.saveRecording(sanitizedRecording);
      const hostnameMap = this.groupEventsByHostname(sanitizedRecording.events);
      const hostnamesToGenerate = options?.skillHostnames || [];
      const shouldGeneratePreset = options?.shouldGeneratePreset === true;
      const filteredHostnameMap = /* @__PURE__ */ new Map();
      for (const hostname of hostnamesToGenerate) {
        if (hostnameMap.has(hostname)) {
          filteredHostnameMap.set(hostname, hostnameMap.get(hostname));
        } else {
          console.warn(`[TeachMode] Selected hostname "${hostname}" not found in recording`);
        }
      }
      console.log(`[TeachMode] Generating ${filteredHostnameMap.size} skills${shouldGeneratePreset ? " + preset" : ""} from [${Array.from(filteredHostnameMap.keys()).join(", ")}]`);
      this.setProgress({
        stage: "generation",
        message: "Generating skills and preset...",
        current: 0,
        total: filteredHostnameMap.size + (shouldGeneratePreset ? 1 : 0)
      });
      const MAX_CONCURRENT_LLM_REQUESTS = 3;
      const skillResults = await this.generateSkillsWithConcurrencyLimit(
        Array.from(filteredHostnameMap.entries()),
        MAX_CONCURRENT_LLM_REQUESTS
      );
      const presetResult = shouldGeneratePreset ? await this.generatePreset(sanitizedRecording) : null;
      const [persistedSkills, persistedPreset] = await Promise.all([
        skillResults.length > 0 ? this.persistSkills(skillResults) : Promise.resolve([]),
        presetResult ? this.persistPreset(presetResult) : Promise.resolve(null)
      ]);
      console.log(`[TeachMode] ✅ Completed: ${persistedSkills.length} skills${persistedPreset ? " + preset" : ""}`);
      this.initialUrl = void 0;
      const sanitizedEventCount = sanitizedRecording.events.length;
      const workflowName = presetResult?.name || this.state.goal || "Workflow";
      const workflowOverview = presetResult?.steps.join(" → ") || "User workflow";
      const summary = {
        recordingId: sanitizedRecording.session.id,
        workflowName,
        workflowPurpose: workflowName,
        overview: workflowOverview,
        goal: this.state.goal || workflowName,
        description: workflowOverview,
        createdAt: Date.now(),
        durationMs: sanitizedRecording.session.endTimestamp ? sanitizedRecording.session.endTimestamp - sanitizedRecording.session.startTimestamp : 0,
        eventCount: sanitizedEventCount,
        stepCount: 0,
        initialUrl: this.initialUrl,
        skillId: persistedSkills[0]?.skillId || "",
        skillName: persistedSkills[0]?.skillName || "",
        skillDisplayName: persistedSkills[0]?.hostname || "",
        skillPath: persistedSkills[0] ? path__namespace.join(index$2.a1("skills"), persistedSkills[0].skillName) : void 0,
        recordingPath: this.getStoragePaths(sanitizedRecording.session.id).recordingPath,
        workflowPath: void 0,
        transcriptIncluded: false,
        userPreferences: void 0,
        interactions: void 0,
        skillsGenerated: persistedSkills.map((s) => ({
          hostname: s.hostname,
          skillId: s.skillId,
          skillName: s.skillName,
          skillPath: path__namespace.join(index$2.a1("skills"), s.skillName)
        })),
        presetGenerated: persistedPreset && presetResult ? {
          id: persistedPreset.id,
          name: persistedPreset.name,
          instruction: persistedPreset.instruction,
          steps: presetResult.steps,
          preferences: presetResult.preferences,
          color: persistedPreset.color
        } : void 0
      };
      this.state = {
        status: "completed",
        recordingId: sanitizedRecording.session.id,
        activeTabId: void 0,
        activeTabUrl: void 0,
        startedAt: void 0,
        eventCount: sanitizedEventCount,
        lastEventType: void 0,
        events: this.state.events,
        progress: void 0,
        summary,
        error: void 0,
        goal: this.state.goal
      };
      this.status = "idle";
      this.emitState();
      return this.getState();
    } catch (error) {
      console.error("[TeachModeService] Failed to finalize teach mode session:", error);
      await this.safeStopRecorder(this.recorder, this.session);
      this.recorder = null;
      this.session = null;
      this.status = "idle";
      this.setError(error instanceof Error ? error.message : String(error));
      return this.getState();
    }
  }
  async cancel(reason) {
    if (this.status === "recording") {
      await this.safeStopRecorder(this.recorder, this.session);
      this.recorder = null;
      this.session = null;
      this.status = "idle";
      this.initialUrl = void 0;
      if (this.scrollMergeTimer) {
        clearTimeout(this.scrollMergeTimer);
        this.scrollMergeTimer = null;
      }
      this.scrollBuffer = [];
      this.lastScrollSummary = null;
      this.lastScrollUrl = null;
      this.state = {
        status: "idle",
        summary: this.state.summary,
        events: [],
        eventCount: 0,
        error: reason ? `Recording cancelled: ${reason}` : void 0
      };
      this.emitState();
    } else if (reason && this.status === "processing") {
      this.state = {
        ...this.state,
        error: reason
      };
      this.emitState();
    }
    return this.getState();
  }
  reset() {
    if (this.status === "recording") {
      throw new Error("Cannot reset while recording is active");
    }
    this.recorder = null;
    this.session = null;
    this.status = "idle";
    this.initialUrl = void 0;
    this.paused = false;
    if (this.scrollMergeTimer) {
      clearTimeout(this.scrollMergeTimer);
      this.scrollMergeTimer = null;
    }
    this.scrollBuffer = [];
    this.lastScrollSummary = null;
    this.lastScrollUrl = null;
    this.state = {
      status: "idle",
      summary: this.state.summary,
      events: void 0,
      eventCount: void 0
    };
    this.emitState();
    return this.getState();
  }
  pause() {
    if (this.status !== "recording") {
      return this.getState();
    }
    this.paused = true;
    this.state = {
      ...this.state,
      paused: true
    };
    this.emitState();
    return this.getState();
  }
  resume() {
    if (this.status !== "recording") {
      return this.getState();
    }
    this.paused = false;
    this.state = {
      ...this.state,
      paused: false
    };
    this.emitState();
    return this.getState();
  }
  emitState() {
    mainEventBus.m.emit("teachMode:stateChanged", this.getState());
  }
  setProgress(progress) {
    this.state = {
      ...this.state,
      progress
    };
    this.emitState();
  }
  setError(message) {
    this.state = {
      status: "error",
      error: message,
      eventCount: this.state.eventCount,
      summary: this.state.summary,
      events: this.state.events,
      recordingId: this.state.recordingId
    };
    this.emitState();
  }
  async switchRecordingTab(_previousTabId, currentTabId) {
    const newTab = this.tabController.getTab(currentTabId);
    if (!newTab) return;
    if (!this.session) {
      await this.attachToTab(currentTabId);
      return;
    }
    if (!this.recorder) {
      await this.reattachRecorderToTab(currentTabId, this.session);
      return;
    }
    try {
      if (newTab.url && !shouldIgnoreUrl(newTab.url)) {
        const switchEvent = {
          id: `event_${Date.now()}_tab_switch`,
          timestamp: Date.now(),
          action: {
            type: "navigate",
            url: newTab.url,
            combo: ["tab-switch"]
          }
        };
        this.session.addEvent(switchEvent);
      }
      await this.recorder.stop();
      await this.reattachRecorderToTab(currentTabId, this.session);
      console.log(`[TeachMode] Switched recording to tab ${currentTabId}`);
    } catch (error) {
      console.error("[TeachMode] Failed to switch recording tab:", error);
    }
  }
  /**
   * 从已关闭的 tab 分离 recorder（保持 teach mode 活跃）
   */
  async detachFromClosedTab(tabId) {
    console.log(`[TeachModeService] Tab ${tabId} closed, detaching recorder but keeping teach mode active`);
    if (this.recorder) {
      try {
        await this.recorder.stop();
      } catch (error) {
        console.error("[TeachModeService] Error stopping recorder:", error);
      }
      this.recorder = null;
    }
    this.state = {
      ...this.state,
      activeTabId: void 0
      // 保持 activeTabUrl 不变，以便在 UI 中显示最后的 URL
    };
    this.emitState();
    console.log("[TeachModeService] Recorder detached, waiting for next tab to attach");
  }
  /**
   * 重新附加 recorder 到指定 tab（使用现有 session）
   */
  async reattachRecorderToTab(tabId, session) {
    const tab = this.tabController.getTab(tabId);
    if (!tab) {
      console.warn(`[TeachModeService] Tab ${tabId} not found`);
      return;
    }
    try {
      const view = tab.getView();
      const debuggerClient = ElectronDebuggerClient.attach(view.webContents.debugger);
      const recorder = new CDPRecorder(debuggerClient, RECORDING_OPTIONS);
      await recorder.startWithSession(session);
      this.recorder = recorder;
      this.state = {
        ...this.state,
        activeTabId: tabId,
        activeTabUrl: shouldIgnoreUrl(tab.url) ? this.state.activeTabUrl : tab.url
      };
      this.emitState();
      console.log(`[TeachModeService] Recorder reattached to tab ${tabId}`);
    } catch (error) {
      console.error("[TeachModeService] Failed to reattach recorder to tab:", error);
    }
  }
  /**
   * 附加 recorder 到指定 tab（用于无 tab 启动场景）
   */
  async attachToTab(tabId) {
    const tab = this.tabController.getTab(tabId);
    if (!tab) {
      console.warn(`[TeachModeService] Tab ${tabId} not found`);
      return;
    }
    const sanitizedInitialUrl = shouldIgnoreUrl(tab.url) ? void 0 : tab.url;
    this.initialUrl = sanitizedInitialUrl;
    const view = tab.getView();
    const debuggerClient = ElectronDebuggerClient.attach(view.webContents.debugger);
    const recorder = new CDPRecorder(debuggerClient, RECORDING_OPTIONS);
    let session = null;
    const updateFromEvent = (event) => {
      if (this.paused) {
        return;
      }
      const nowTs = now();
      if (event.action.type === "scroll") {
        this.handleScrollEvent(event);
        return;
      }
      this.flushScrollBuffer();
      this.lastScrollSummary = null;
      this.lastScrollUrl = null;
      const events = this.state.events ? [...this.state.events] : [];
      const summary = this.toEventSummary(event);
      events.unshift(summary);
      if (events.length > 100) events.length = 100;
      const eventUrlCandidate = (typeof event.action.url === "string" && event.action.url.length > 0 ? event.action.url : event.state?.page?.url) || null;
      const baselineUrl = this.state.activeTabUrl ?? this.initialUrl;
      const activeUrl = eventUrlCandidate && !shouldIgnoreUrl(eventUrlCandidate) ? eventUrlCandidate : baselineUrl;
      if (!this.initialUrl && activeUrl && !shouldIgnoreUrl(activeUrl)) {
        this.initialUrl = activeUrl;
      }
      const nextState = {
        ...this.state,
        eventCount: (this.state.eventCount || 0) + 1,
        lastEventType: event.action.type,
        events,
        activeTabUrl: activeUrl
      };
      this.state = nextState;
      if (nowTs - this.lastEventEmit > 300) {
        this.lastEventEmit = nowTs;
        this.emitState();
      }
    };
    try {
      session = await recorder.start(tab.url, {
        onEvent: updateFromEvent
      });
      this.recorder = recorder;
      this.session = session;
      this.state = {
        ...this.state,
        status: "recording",
        recordingId: session.getRecordingId(),
        activeTabId: tab.id,
        activeTabUrl: sanitizedInitialUrl,
        eventCount: 0,
        events: []
      };
      this.emitState();
      console.log(`[TeachModeService] Recorder attached to tab ${tabId}`);
    } catch (error) {
      console.error("[TeachModeService] Failed to attach recorder to tab:", error);
      await this.safeStopRecorder(recorder, session);
      this.recorder = null;
      this.session = null;
    }
  }
  async safeStopRecorder(recorder, session) {
    try {
      await session?.stop();
    } catch {
    }
    try {
      await recorder?.stop();
    } catch {
    }
  }
  getStorage() {
    if (!this.storage) {
      const basePath = path__namespace.join(electron.app.getPath("userData"), "teach-mode");
      this.storage = new FileStorage({ basePath });
    }
    return this.storage;
  }
  getStoragePaths(recordingId) {
    const basePath = path__namespace.join(electron.app.getPath("userData"), "teach-mode");
    return {
      recordingPath: path__namespace.join(basePath, "recordings", `${recordingId}.json`),
      workflowPath: path__namespace.join(basePath, "workflows", `${recordingId}.json`)
    };
  }
  sanitizeRecording(recording) {
    const filteredEvents = recording.events.filter((ev) => {
      const candidateUrl = ev.action.url || ev.state?.page?.url;
      return !shouldIgnoreUrl(candidateUrl);
    });
    return {
      ...recording,
      events: filteredEvents
    };
  }
  handleScrollEvent(event) {
    this.scrollBuffer.push(event);
    if (this.scrollMergeTimer) {
      clearTimeout(this.scrollMergeTimer);
    }
    this.scrollMergeTimer = setTimeout(() => {
      this.flushScrollBuffer();
    }, 1e3);
  }
  flushScrollBuffer() {
    if (this.scrollBuffer.length === 0) return;
    const mergedEvent = this.mergeScrollEvents(this.scrollBuffer);
    this.scrollBuffer = [];
    if (this.scrollMergeTimer) {
      clearTimeout(this.scrollMergeTimer);
      this.scrollMergeTimer = null;
    }
    if (!mergedEvent) return;
    const currentScrollUrl = mergedEvent.action.url || mergedEvent.state?.page?.url;
    if (this.lastScrollUrl && currentScrollUrl && this.lastScrollUrl !== currentScrollUrl) {
      console.log(`[TeachMode] Page changed during scroll (${this.lastScrollUrl} → ${currentScrollUrl}), creating new scroll event`);
      this.lastScrollSummary = null;
    }
    if (currentScrollUrl) {
      this.lastScrollUrl = currentScrollUrl;
    }
    const events = this.state.events || [];
    if (this.lastScrollSummary) {
      mergedEvent.id = this.lastScrollSummary.id;
    }
    const summary = this.toEventSummary(mergedEvent);
    let needsUpdate = false;
    if (this.lastScrollSummary) {
      const index2 = events.findIndex((e) => e.id === this.lastScrollSummary.id);
      if (index2 !== -1) {
        const oldValue = events[index2].value;
        const newValue = summary.value;
        if (oldValue !== newValue) {
          events[index2] = summary;
          this.lastScrollSummary = summary;
          needsUpdate = true;
        }
      } else {
        events.unshift(summary);
        if (events.length > 100) events.length = 100;
        this.lastScrollSummary = summary;
        needsUpdate = true;
      }
    } else {
      events.unshift(summary);
      if (events.length > 100) events.length = 100;
      this.lastScrollSummary = summary;
      needsUpdate = true;
    }
    if (needsUpdate) {
      this.state = {
        ...this.state,
        events: events.slice()
        // 浅拷贝触发响应式更新
      };
      this.emitState();
    }
  }
  mergeScrollEvents(scrolls) {
    if (scrolls.length === 0) return null;
    if (scrolls.length === 1) return scrolls[0];
    const first = scrolls[0];
    const last = scrolls[scrolls.length - 1];
    const firstScroll = first.action.scroll;
    const lastScroll = last.action.scroll;
    if (!firstScroll || !lastScroll) return first;
    const startX = firstScroll.x - (firstScroll.deltaX || 0);
    const startY = firstScroll.y - (firstScroll.deltaY || 0);
    const totalDeltaX = lastScroll.x - startX;
    const totalDeltaY = lastScroll.y - startY;
    if (Math.abs(totalDeltaX) < 30 && Math.abs(totalDeltaY) < 30) {
      return null;
    }
    return {
      id: first.id,
      timestamp: first.timestamp,
      action: {
        type: "scroll",
        url: first.action.url || last.action.url,
        // 保留 URL
        scroll: {
          x: lastScroll.x,
          y: lastScroll.y,
          deltaX: totalDeltaX,
          deltaY: totalDeltaY,
          source: "scroll"
        }
      },
      target: first.target,
      state: last.state || first.state
    };
  }
  toEventSummary(event) {
    let targetText;
    if (event.action.type !== "scroll" && event.action.type !== "navigate") {
      targetText = (event.target?.element?.text || "").trim().replace(/\s+/g, " ").slice(0, 120) || event.target?.element?.placeholder || event.target?.selectors?.ariaLabel || event.target?.element?.tagName;
    }
    let value = event.action.value?.trim()?.slice(0, 120);
    if (!value && event.action.scroll) {
      const { deltaX = 0, deltaY = 0, x = 0, y = 0 } = event.action.scroll;
      value = `Δ(${deltaX}, ${deltaY}) → (${x}, ${y})`;
    }
    const url = event.action.url || event.state?.page?.url;
    return { id: event.id, type: event.action.type, target: targetText, value, url, timestamp: event.timestamp, combo: event.action.combo };
  }
  // 按 hostname 分组，过滤 navigate-only
  groupEventsByHostname(events) {
    const hostnameMap = /* @__PURE__ */ new Map();
    for (const event of events) {
      const url = event.action.url || event.state?.page?.url;
      if (!url) continue;
      try {
        const hostname = new URL(url).hostname;
        if (!hostname) continue;
        if (!hostnameMap.has(hostname)) hostnameMap.set(hostname, []);
        hostnameMap.get(hostname).push(event);
      } catch {
      }
    }
    for (const [hostname, events2] of hostnameMap.entries()) {
      if (events2.length === 1 && events2[0].action.type === "navigate") {
        hostnameMap.delete(hostname);
      }
    }
    console.log(`[TeachMode] Grouped ${events.length} events into ${hostnameMap.size} hostnames: [${Array.from(hostnameMap.keys()).join(", ")}]`);
    return hostnameMap;
  }
  /**
   * 🎯 并发控制：分批生成 skills，避免同时发起过多 LLM 请求
   */
  async generateSkillsWithConcurrencyLimit(hostnameEntries, maxConcurrent) {
    const results = [];
    let completedCount = 0;
    for (let i = 0; i < hostnameEntries.length; i += maxConcurrent) {
      const batch = hostnameEntries.slice(i, i + maxConcurrent);
      console.log(`[TeachMode] Processing skill batch ${Math.floor(i / maxConcurrent) + 1}/${Math.ceil(hostnameEntries.length / maxConcurrent)} (${batch.length} skills)`);
      const batchResults = await Promise.all(
        batch.map(
          ([hostname, events]) => this.generateSkillForHostname(hostname, events).then((result) => {
            completedCount++;
            this.setProgress({
              stage: "generation",
              message: `Generating skills... (${completedCount}/${hostnameEntries.length})`,
              current: completedCount,
              total: hostnameEntries.length
            });
            return result ? { ...result, events } : null;
          })
        )
      );
      results.push(...batchResults.filter((r) => r !== null));
    }
    return results;
  }
  /**
   * 为单个hostname生成skill markdown
   */
  async generateSkillForHostname(hostname, events) {
    try {
      console.log(`[TeachMode] Generating skill for ${hostname} (${events.length} events)`);
      const skillFileName = `${hostname.replace(/\./g, "-")}.md`;
      const skillId = `skills__user__${skillFileName}`;
      const existingSkill = await index$2.K.read(skillId);
      let existingSkillContent;
      const hadExistingSkill = !!existingSkill;
      if (existingSkill) {
        console.log(`[TeachMode] Merging with existing skill for ${hostname}`);
        existingSkillContent = existingSkill.content;
      }
      const { systemPrompt, userPrompt } = buildSkillGenerationPrompt(events, hostname, {
        includeFullPageContext: true,
        emphasizeGeneralization: true,
        goal: this.state.goal,
        existingSkillContent
      });
      const llm = new GeminiLLMProvider();
      const markdownContent = await llm.invoke(userPrompt, {
        systemPrompt,
        temperature: 0.1,
        outputFormat: "markdown"
      });
      return { hostname, content: markdownContent, hadExistingSkill };
    } catch (error) {
      console.error(`[TeachMode] Failed to generate skill for ${hostname}:`, error);
      return null;
    }
  }
  /**
   * 生成preset JSON（LLM输出原子化步骤）
   */
  async generatePreset(recording) {
    const { systemPrompt, userPrompt } = buildPresetGenerationPrompt(recording, {
      goal: this.state.goal
    });
    const llm = new GeminiLLMProvider();
    const jsonResponse = await llm.invoke(userPrompt, {
      systemPrompt,
      temperature: 0.3,
      outputFormat: "json"
    });
    const parsed = JSON.parse(jsonResponse);
    return { ...parsed, color: "blue" };
  }
  /**
   * 持久化Skills（追加模式写入skill文件）
   */
  // 清理 LLM 输出（移除代码块包裹）
  cleanLLMOutput(content) {
    let cleaned = content.trim();
    if (cleaned.startsWith("```markdown\n") || cleaned.startsWith("```md\n")) {
      cleaned = cleaned.replace(/^```(markdown|md)\n/, "").replace(/\n```$/, "");
    }
    if (cleaned.startsWith("```\n") && cleaned.endsWith("\n```")) {
      cleaned = cleaned.slice(4, -4);
    }
    return cleaned.trim();
  }
  // 提取/移除 frontmatter
  extractFrontmatter(content) {
    const trimmed = content.trim();
    if (!trimmed.startsWith("---\n")) {
      return { frontmatter: null, body: content };
    }
    const endIndex = trimmed.indexOf("\n---\n", 4);
    if (endIndex === -1) {
      return { frontmatter: null, body: content };
    }
    return {
      frontmatter: trimmed.substring(0, endIndex + 5),
      // 包括结束的 ---
      body: trimmed.substring(endIndex + 5).trim()
    };
  }
  // 解析 YAML frontmatter 中的 matcher_summary
  parseMatcherSummary(frontmatter) {
    if (!frontmatter) return null;
    const lines = frontmatter.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^matcher_summary:\s*['"](.+)['"]/);
      if (match) {
        return match[1];
      }
    }
    return null;
  }
  // 🎯 智能生成 matcher_summary（蒸馏版：精准识别 + 最小判断）
  generateMatcherSummary(hostname, events) {
    const p = {
      login: false,
      search: false,
      form: false,
      copy: false,
      paste: false,
      file: false,
      navigate: 0,
      click: 0,
      input: 0
    };
    for (const e of events) {
      const { type } = e.action;
      if (type === "click") p.click++;
      else if (type === "input") {
        p.input++;
        const el = e.target?.element;
        if (el?.type === "password" || el?.attributes?.name?.toLowerCase().includes("password")) p.login = true;
        if (el?.placeholder?.toLowerCase().includes("search") || el?.ariaLabel?.toLowerCase().includes("search")) p.search = true;
      } else if (type === "navigate") p.navigate++;
      else if (type === "copy") p.copy = true;
      else if (type === "paste") p.paste = true;
      else if (type === "file" || type === "drop") p.file = true;
      if (e.action.combo?.includes("form-submit")) p.form = true;
    }
    const total = p.click + p.input;
    const hasNav = p.navigate > 2;
    if (p.copy && hasNav && p.paste) return `Transfer content between pages on ${hostname}. Use for cross-page data migration workflows`;
    if (p.search && p.copy) return `Search and extract data from ${hostname}. Use for finding and copying information`;
    if (p.file && (p.form || p.input > 3)) return `Upload and process files on ${hostname}. Use for file submission workflows`;
    if (p.login && total > 8) return `Authenticated operations on ${hostname}. Use for tasks requiring login and interaction`;
    if (p.login) return `Login and authentication on ${hostname}. Use for secure access workflows`;
    if (p.search && p.click > 3) return `Search and navigate content on ${hostname}. Use for finding and accessing information`;
    if (p.search) return `Search operations on ${hostname}. Use for finding content`;
    if (p.copy && p.click > 3) return `Navigate and extract data from ${hostname}. Use for browsing and copying information`;
    if (p.copy) return `Extract content from ${hostname}. Use for copying information`;
    if (p.form || p.input > 3 && p.click > 2) return `Form operations on ${hostname}. Use for data entry and submission`;
    if (total > 10) return `Complex multi-step operations on ${hostname}. Use for advanced workflows`;
    if (hasNav) return `Navigate and interact with ${hostname}. Use for multi-page workflows`;
    if (total > 3) return `Interactive operations on ${hostname}. Use for multi-step tasks`;
    return `Basic operations on ${hostname}. Use for simple interactions with this site`;
  }
  // 验证并修复 Skill 格式（兜底机制：LLM 失败时使用）
  validateAndFixSkill(hostname, content, events) {
    const cleaned = this.cleanLLMOutput(content);
    const { frontmatter, body } = this.extractFrontmatter(cleaned);
    if (frontmatter) {
      console.log(`[TeachMode] ✅ Skill for ${hostname} has valid frontmatter`);
      return cleaned;
    }
    console.warn(`[TeachMode] ⚠️ Skill for ${hostname} missing frontmatter, falling back to heuristic generation`);
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const matcherSummary = this.generateMatcherSummary(hostname, events);
    const generatedFrontmatter = `---
matcher_summary: '${matcherSummary}'
website: '${hostname}'
last_verified: '${today}'
---

`;
    return generatedFrontmatter + body;
  }
  async persistSkills(skills) {
    const results = [];
    for (const skill of skills) {
      const { hostname, content, events = [], hadExistingSkill = false } = skill;
      const skillFileName = `${hostname.replace(/\./g, "-")}.md`;
      const skillId = `skills__user__${skillFileName}`;
      try {
        const validatedContent = this.validateAndFixSkill(hostname, content, events);
        const existing = await index$2.K.read(skillId);
        const existsNow = !!existing;
        if (hadExistingSkill !== existsNow) {
          if (!hadExistingSkill && existsNow) {
            console.warn(`[TeachMode] Race condition: ${hostname} was new, now exists`);
            const backup = await this.saveSkillBackup(hostname, validatedContent);
            if (backup) results.push(backup);
            continue;
          } else if (hadExistingSkill && !existsNow) {
            console.warn(`[TeachMode] Race condition: ${hostname} existed, now deleted - creating new file`);
          }
        }
        if (existsNow) {
          await index$2.K.update(skillId, validatedContent);
          console.log(`[TeachMode] ✓ Updated ${skillFileName}`);
        } else {
          const skillItem = await index$2.K.create("skills");
          const renamed = await index$2.K.rename(skillItem.id, skillFileName.replace(".md", ""));
          if (renamed) {
            await index$2.K.update(skillId, validatedContent);
            console.log(`[TeachMode] ✓ Created ${skillFileName}`);
          } else {
            console.error(`[TeachMode] Failed to rename ${skillFileName}`);
            continue;
          }
        }
        results.push({ hostname, skillId, skillName: skillFileName });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[TeachMode] ❌ Failed to persist skill for ${hostname}: ${errorMessage}`);
      }
    }
    return results;
  }
  /**
   * 保存 skill 到备份文件（竞态条件处理）
   */
  async saveSkillBackup(hostname, content) {
    const backupFileName = `${hostname.replace(/\./g, "-")}-teachmode-backup-${Date.now()}.md`;
    const backupSkillId = `skills__user__${backupFileName}`;
    console.warn(`[TeachMode] Saving to backup: ${backupFileName}`);
    try {
      const backupItem = await index$2.K.create("skills");
      const renamed = await index$2.K.rename(backupItem.id, backupFileName.replace(".md", ""));
      if (renamed) {
        await index$2.K.update(backupSkillId, content);
        return { hostname, skillId: backupSkillId, skillName: backupFileName };
      }
    } catch (error) {
      console.error(`[TeachMode] Backup failed:`, error);
    }
    return null;
  }
  /**
   * 持久化Preset（将steps数组和preferences转换为instruction字符串）
   */
  async persistPreset(preset) {
    const parts = [];
    parts.push("# Steps");
    parts.push("");
    parts.push(preset.steps.map((step, idx) => `${idx + 1}. ${step}`).join("\n"));
    const { websites, context } = preset.preferences;
    if (websites?.length || context) {
      parts.push("");
      parts.push("# Context");
      parts.push("");
      const contextParts = [];
      if (websites?.length) {
        contextParts.push(`Websites: ${websites.join(", ")}`);
      }
      if (context) {
        contextParts.push(context);
      }
      parts.push(contextParts.join(". "));
    }
    const instruction = parts.join("\n");
    return await agentPresetService.create({
      name: preset.name,
      instruction,
      color: preset.color
    });
  }
}
const teachModeService = TeachModeService.getInstance();
const TeachModeService$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, TeachModeService, teachModeService }, Symbol.toStringTag, { value: "Module" }));
exports.T = TeachModeService$1;
exports.a = agentPresetService;
exports.i = index;
exports.t = teachModeService;
