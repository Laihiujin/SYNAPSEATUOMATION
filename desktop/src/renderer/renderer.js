function $(id) {
  return document.getElementById(id);
}

const logEl = $("log");
const projectRootEl = $("projectRoot");
const pythonCmdEl = $("pythonCmd");
const startRedisEl = $("startRedis");
const redisPortEl = $("redisPort");

function appendLog(source, message) {
  const prefix = source ? `[${source}] ` : "";
  logEl.textContent += `${prefix}${message}`;
  logEl.scrollTop = logEl.scrollHeight;
}

function setChip(el, isRunning) {
  el.classList.remove("ok", "bad");
  if (isRunning === true) {
    el.classList.add("ok");
  } else if (isRunning === false) {
    el.classList.add("bad");
  }
}

async function refreshStatus() {
  const st = await window.synapse.serviceStatus();
  const chipRedis = $("chip-redis");
  const chipWorker = $("chip-worker");
  const chipBackend = $("chip-backend");
  chipRedis.textContent = `Redis: ${st.redis ? "running" : "stopped"}`;
  chipWorker.textContent = `Worker: ${st.worker ? "running" : "stopped"}`;
  chipBackend.textContent = `Backend: ${st.backend ? "running" : "stopped"}`;
  setChip(chipRedis, st.redis);
  setChip(chipWorker, st.worker);
  setChip(chipBackend, st.backend);
}

async function boot() {
  const s = await window.synapse.settingsGet();
  projectRootEl.value = s.projectRoot || "";
  pythonCmdEl.value = s.pythonCmd || "python";
  startRedisEl.checked = !!s.startRedis;
  redisPortEl.value = String(s.redisPort ?? 6379);

  window.synapse.onLog(({ source, message }) => {
    appendLog(source, message);
  });

  $("open-ui").addEventListener("click", () => window.synapse.open("http://127.0.0.1:3000"));
  $("open-docs").addEventListener("click", () => window.synapse.open("http://127.0.0.1:7000/api/docs"));

  $("start-all").addEventListener("click", async () => {
    const projectRoot = projectRootEl.value.trim();
    const pythonCmd = pythonCmdEl.value.trim() || "python";
    const startRedis = !!startRedisEl.checked;
    const redisPort = Number(redisPortEl.value || 6379);

    await window.synapse.settingsSet({
      projectRoot,
      pythonCmd,
      startRedis,
      redisPort,
    });

    appendLog(
      "app",
      `\n[start] projectRoot=${projectRoot} python=${pythonCmd} redis=${startRedis}\n`
    );
    const res = await window.synapse.startAll({
      projectRoot,
      pythonCmd,
      startRedis,
      redisPort,
    });
    if (!res.ok) appendLog("app", `[error] ${res.error}\n`);
    await refreshStatus();
  });

  $("stop-worker").addEventListener("click", async () => {
    await window.synapse.stop("worker");
    await refreshStatus();
  });
  $("stop-backend").addEventListener("click", async () => {
    await window.synapse.stop("backend");
    await refreshStatus();
  });
  $("stop-redis").addEventListener("click", async () => {
    await window.synapse.stop("redis");
    await refreshStatus();
  });

  await refreshStatus();
  setInterval(refreshStatus, 1500);
}

boot().catch((e) => {
  appendLog("app", `[fatal] ${String(e)}\n`);
});
