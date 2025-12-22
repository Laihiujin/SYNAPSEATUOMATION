const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function bundledResourcesDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "synapse-resources")
    : path.join(__dirname, "..", "resources");
}

function settingsPath() {
  return path.join(app.getPath("userData"), "settings.json");
}

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeSettings(patch) {
  const current = readSettings();
  const next = { ...current, ...patch };
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true });
  fs.writeFileSync(settingsPath(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

function guessProjectRoot() {
  // 打包后优先使用内置的 syn_backend
  const bundledBackend = path.join(bundledResourcesDir(), "syn_backend");
  if (fs.existsSync(bundledBackend)) {
    return path.dirname(bundledBackend);
  }

  // 开发模式：查找开发环境的 syn_backend
  const candidates = [
    path.resolve(__dirname, "..", ".."),
    process.cwd(),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "syn_backend"))) return candidate;
  }
  return "";
}

function buildEnv(projectRoot) {
  const env = { ...process.env };
  env.PYTHONUTF8 = env.PYTHONUTF8 || "1";
  env.PYTHONIOENCODING = env.PYTHONIOENCODING || "utf-8";

  // Playwright browsers path
  const bundledBrowsers = path.join(bundledResourcesDir(), "playwright-browsers");
  const fallbackBrowsers = path.join(projectRoot, ".playwright-browsers");
  env.PLAYWRIGHT_BROWSERS_PATH =
    env.PLAYWRIGHT_BROWSERS_PATH ||
    (fs.existsSync(bundledBrowsers) ? bundledBrowsers : fallbackBrowsers);

  // SQLite database paths (使用用户数据目录)
  const userDataPath = app.getPath("userData");
  const dbDir = path.join(userDataPath, "database");
  fs.mkdirSync(dbDir, { recursive: true });

  env.DATABASE_PATH = env.DATABASE_PATH || path.join(dbDir, "main.db");
  env.COOKIE_DB_PATH = env.COOKIE_DB_PATH || path.join(dbDir, "cookies.db");
  env.AI_LOGS_DB_PATH = env.AI_LOGS_DB_PATH || path.join(dbDir, "ai_logs.db");

  env.MANUS_API_BASE_URL = env.MANUS_API_BASE_URL || "http://localhost:7000/api/v1";
  env.ENABLE_OCR_RESCUE = env.ENABLE_OCR_RESCUE || "1";
  env.ENABLE_SELENIUM_RESCUE = env.ENABLE_SELENIUM_RESCUE || "1";
  env.ENABLE_SELENIUM_DEBUG = env.ENABLE_SELENIUM_DEBUG || "1";
  env.PLAYWRIGHT_AUTO_INSTALL = env.PLAYWRIGHT_AUTO_INSTALL || "1";
  return env;
}

function firstExisting(paths) {
  for (const p of paths) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function resolveRedisServer() {
  const dir = bundledResourcesDir();
  return firstExisting([
    path.join(dir, "redis", "redis-server.exe"),
    path.join(dir, "redis", "redis-server"),
  ]);
}

function resolvePythonCmd(userSetting) {
  // 1. 用户自定义设置
  if (userSetting && userSetting.trim()) {
    return userSetting.trim();
  }

  // 2. 检查内置 Python（如果有打包）
  const bundledPython = path.join(bundledResourcesDir(), "python", "python.exe");
  if (fs.existsSync(bundledPython)) {
    return bundledPython;
  }

  // 3. 使用系统 Python
  return "python";
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
  return p;
}

async function waitForPort(host, port, timeoutMs) {
  const net = require("net");
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ok = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket
        .once("error", () => resolve(false))
        .once("timeout", () => resolve(false))
        .connect(port, host, () => resolve(true))
        .once("connect", () => socket.end());
    });
    if (ok) return true;
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

function spawnService({ name, cmd, args, cwd, env, onLog }) {
  const child = spawn(cmd, args, {
    cwd,
    env,
    shell: process.platform === "win32",
    windowsHide: true,
  });

  child.stdout.on("data", (buf) => onLog(name, buf.toString("utf8")));
  child.stderr.on("data", (buf) => onLog(name, buf.toString("utf8")));
  child.on("exit", (code, signal) => {
    onLog(name, `\n[exit] code=${code ?? "null"} signal=${signal ?? "null"}\n`);
  });
  return child;
}

async function waitForHttpOk(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return true;
    } catch {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

let mainWindow = null;
const processes = {
  backend: null,
  worker: null,
  redis: null,
  mysql: null,
  celery: null,
  frontend: null,
};

function emitLog(source, message) {
  if (!mainWindow) return;
  mainWindow.webContents.send("log", { source, message });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0b0b0b",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 启动时先显示加载页面
  win.loadFile(path.join(__dirname, "renderer", "loading.html"));
  return win;
}

app.whenReady().then(() => {
  mainWindow = createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  for (const child of Object.values(processes)) {
    try {
      child?.kill("SIGTERM");
    } catch {
      // ignore
    }
  }
});

ipcMain.handle("settings:get", () => {
  const s = readSettings();
  return {
    projectRoot: s.projectRoot || guessProjectRoot(),
    pythonCmd: s.pythonCmd || "python",
    startRedis: s.startRedis ?? true,
    startMysql: s.startMysql ?? false,
    redisPort: s.redisPort || 6379,
    mysqlPort: s.mysqlPort || 3306,
    mysqlDatabase: s.mysqlDatabase || "synapse",
    mysqlUser: s.mysqlUser || "root",
    mysqlPassword: s.mysqlPassword || "",
  };
});

ipcMain.handle("settings:set", (_evt, patch) => {
  return writeSettings(patch);
});

ipcMain.handle("service:status", () => {
  return {
    backend: !!processes.backend && !processes.backend.killed,
    worker: !!processes.worker && !processes.worker.killed,
    redis: !!processes.redis && !processes.redis.killed,
    mysql: !!processes.mysql && !processes.mysql.killed,
    celery: !!processes.celery && !processes.celery.killed,
    frontend: !!processes.frontend && !processes.frontend.killed,
  };
});

ipcMain.handle("service:stop", (_evt, which) => {
  const child = processes[which];
  if (!child) return { ok: true };
  try {
    child.kill("SIGTERM");
  } catch (e) {
    return { ok: false, error: String(e) };
  } finally {
    processes[which] = null;
  }
  return { ok: true };
});

ipcMain.handle("service:startAll", async (_evt, opts) => {
  const projectRoot = (opts?.projectRoot || "").trim();
  const pythonCmd = resolvePythonCmd(opts?.pythonCmd);
  const startRedis = !!opts?.startRedis;
  const startMysql = !!opts?.startMysql;
  const redisPort = Number(opts?.redisPort || 6379);
  const mysqlPort = Number(opts?.mysqlPort || 3306);
  const mysqlDatabase = String(opts?.mysqlDatabase || "synapse");
  const mysqlUser = String(opts?.mysqlUser || "root");
  const mysqlPassword = String(opts?.mysqlPassword || "");

  if (!projectRoot) return { ok: false, error: "Project Root 不能为空" };
  if (!fs.existsSync(path.join(projectRoot, "syn_backend"))) {
    return { ok: false, error: "Project Root 下未找到 syn_backend/" };
  }

  const backendDir = path.join(projectRoot, "syn_backend");
  const frontendDir = path.join(projectRoot, "syn_frontend_react");
  const env = buildEnv(projectRoot);

  if (startRedis && !processes.redis) {
    const redis = resolveRedisServer();
    if (!redis) {
      emitLog("redis", "[warn] 未找到内置 redis-server，已跳过（见 desktop/resources/README.md）\n");
    } else {
      const dataDir = ensureDir(path.join(app.getPath("userData"), "redis-data"));
      env.REDIS_URL = env.REDIS_URL || `redis://127.0.0.1:${redisPort}/0`;
      processes.redis = spawnService({
        name: "redis",
        cmd: redis,
        args: ["--bind", "127.0.0.1", "--port", String(redisPort), "--dir", dataDir],
        cwd: path.dirname(redis),
        env,
        onLog: emitLog,
      });
      await waitForPort("127.0.0.1", redisPort, 8000);
    }
  }

  if (startMysql && !processes.mysql) {
    const mysqld = resolveMysqlServer();
    if (!mysqld) {
      emitLog("mysql", "[warn] 未找到内置 mysqld/mariadbd，已跳过（见 desktop/resources/README.md）\n");
    } else {
      const baseDir = path.resolve(path.dirname(mysqld), "..");
      const dataDir = ensureDir(path.join(app.getPath("userData"), "mysql-data"));
      const hasSystemTables = fs.existsSync(path.join(dataDir, "mysql"));
      const charset = "utf8mb4";

      if (!hasSystemTables) {
        emitLog("mysql", `[info] 初始化数据目录: ${dataDir}\n`);
        try {
          const init = spawnService({
            name: "mysql",
            cmd: mysqld,
            args: ["--initialize-insecure", `--basedir=${baseDir}`, `--datadir=${dataDir}`],
            cwd: path.dirname(mysqld),
            env,
            onLog: emitLog,
          });
          await new Promise((r) => init.on("exit", r));
        } catch (e) {
          emitLog("mysql", `[warn] 初始化失败（可忽略/手动初始化）：${String(e)}\n`);
        }
      }

      env.DATABASE_URL =
        env.DATABASE_URL ||
        `mysql+pymysql://${encodeURIComponent(mysqlUser)}:${encodeURIComponent(mysqlPassword)}@127.0.0.1:${mysqlPort}/${encodeURIComponent(mysqlDatabase)}?charset=${charset}`;

      processes.mysql = spawnService({
        name: "mysql",
        cmd: mysqld,
        args: [
          `--basedir=${baseDir}`,
          `--datadir=${dataDir}`,
          "--bind-address=127.0.0.1",
          `--port=${mysqlPort}`,
          "--mysqlx=0",
        ],
        cwd: path.dirname(mysqld),
        env,
        onLog: emitLog,
      });

      await waitForPort("127.0.0.1", mysqlPort, 15000);
    }
  }

  if (!processes.worker) {
    processes.worker = spawnService({
      name: "worker",
      cmd: pythonCmd,
      args: ["playwright_worker/worker.py"],
      cwd: backendDir,
      env,
      onLog: emitLog,
    });
  }

  await waitForHttpOk("http://127.0.0.1:7001/health", 30000);

  // 启动 Celery Worker（如果 Redis 已启动或配置了 REDIS_URL）
  if (!processes.celery && (processes.redis || env.REDIS_URL)) {
    emitLog("celery", "[info] 启动 Celery Worker...\n");

    // 设置 Celery 环境变量
    const celeryEnv = { ...env };
    if (!celeryEnv.CELERY_BROKER_URL && !celeryEnv.REDIS_URL) {
      celeryEnv.REDIS_URL = `redis://127.0.0.1:${redisPort}/0`;
    }

    processes.celery = spawnService({
      name: "celery",
      cmd: pythonCmd,
      args: [
        "-m",
        "celery",
        "-A",
        "fastapi_app.tasks.celery_app",
        "worker",
        "--loglevel=info",
        "--pool=solo",  // Windows 兼容模式
      ],
      cwd: backendDir,
      env: celeryEnv,
      onLog: emitLog,
    });

    // 给 Celery Worker 一些启动时间
    await new Promise((r) => setTimeout(r, 2000));
    emitLog("celery", "[info] Celery Worker 已启动\n");
  }

  if (!processes.backend) {
    processes.backend = spawnService({
      name: "backend",
      cmd: pythonCmd,
      args: ["fastapi_app/run.py"],
      cwd: backendDir,
      env,
      onLog: emitLog,
    });
  }

  // 启动前端 Next.js 服务
  if (!processes.frontend && fs.existsSync(frontendDir)) {
    emitLog("frontend", "[info] 启动 Next.js 前端服务...\n");

    // 检查是否需要安装依赖
    const nodeModulesPath = path.join(frontendDir, "node_modules");
    if (!fs.existsSync(nodeModulesPath)) {
      emitLog("frontend", "[info] 检测到未安装依赖，正在安装 npm packages...\n");
      const npmInstall = spawnService({
        name: "frontend",
        cmd: process.platform === "win32" ? "npm.cmd" : "npm",
        args: ["install"],
        cwd: frontendDir,
        env,
        onLog: emitLog,
      });
      await new Promise((r) => npmInstall.on("exit", r));
    }

    processes.frontend = spawnService({
      name: "frontend",
      cmd: process.platform === "win32" ? "npm.cmd" : "npm",
      args: ["run", "dev"],
      cwd: frontendDir,
      env: { ...env, PORT: "3000" },
      onLog: emitLog,
    });

    // 等待前端启动
    await waitForHttpOk("http://127.0.0.1:3000", 60000);

    // 加载前端页面到 Electron 窗口
    if (mainWindow) {
      mainWindow.loadURL("http://127.0.0.1:3000");
      emitLog("frontend", "[info] 前端已加载到 Electron 窗口\n");
    }
  }

  return { ok: true };
});

ipcMain.handle("ui:open", async (_evt, url) => {
  try {
    await shell.openExternal(url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});
