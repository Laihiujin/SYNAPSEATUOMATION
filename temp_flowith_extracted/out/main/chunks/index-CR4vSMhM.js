"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const migrator = require("drizzle-orm/libsql/migrator"), electron = require("electron"), libsql = require("drizzle-orm/libsql"), client$1 = require("@libsql/client"), path = require("path"), fs = require("fs"), sqliteCore = require("drizzle-orm/sqlite-core"), drizzleOrm = require("drizzle-orm");
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
const fs__namespace = /* @__PURE__ */ _interopNamespaceDefault(fs);
const bookmarks = sqliteCore.sqliteTable(
  "bookmarks",
  {
    // 主键
    id: sqliteCore.text("id").primaryKey(),
    // 书签类型：'url' | 'folder'
    type: sqliteCore.text("type", { enum: ["url", "folder"] }).notNull(),
    // 标题
    title: sqliteCore.text("title").notNull(),
    // URL（仅 type='url' 时有值）
    url: sqliteCore.text("url"),
    // 图标 URL 或 base64
    favicon: sqliteCore.text("favicon"),
    // 父文件夹 ID（null 表示根级别）
    parentId: sqliteCore.text("parent_id"),
    // 在父文件夹中的排序位置
    index: sqliteCore.integer("index").notNull().default(0),
    // 创建时间
    createdAt: sqliteCore.integer("created_at", { mode: "timestamp" }).notNull().default(drizzleOrm.sql`(unixepoch())`),
    // 更新时间
    updatedAt: sqliteCore.integer("updated_at", { mode: "timestamp" }).notNull().default(drizzleOrm.sql`(unixepoch())`),
    // 来源浏览器（导入时记录）
    source: sqliteCore.text("source"),
    // 标签（JSON 数组）
    tags: sqliteCore.text("tags"),
    // 备注
    notes: sqliteCore.text("notes")
  },
  (table) => ({
    // 索引优化
    urlIdx: sqliteCore.index("bookmarks_url_idx").on(table.url),
    parentIdIdx: sqliteCore.index("bookmarks_parent_id_idx").on(table.parentId),
    typeIdx: sqliteCore.index("bookmarks_type_idx").on(table.type),
    titleIdx: sqliteCore.index("bookmarks_title_idx").on(table.title),
    createdAtIdx: sqliteCore.index("bookmarks_created_at_idx").on(table.createdAt)
  })
);
const history = sqliteCore.sqliteTable(
  "history",
  {
    // 主键
    id: sqliteCore.text("id").primaryKey(),
    // 页面 URL
    url: sqliteCore.text("url").notNull(),
    // 页面标题
    title: sqliteCore.text("title").notNull(),
    // 网站图标
    favicon: sqliteCore.text("favicon"),
    // 访问时间戳
    timestamp: sqliteCore.integer("timestamp", { mode: "timestamp" }).notNull().default(drizzleOrm.sql`(unixepoch())`),
    // 访问次数
    visitCount: sqliteCore.integer("visit_count").notNull().default(1),
    // 最后访问时间
    lastVisitTime: sqliteCore.integer("last_visit_time", { mode: "timestamp" }).notNull().default(drizzleOrm.sql`(unixepoch())`),
    // 页面过渡类型（如何到达这个页面）
    transition: sqliteCore.text("transition"),
    // 会话 ID（同一浏览会话的页面有相同的 sessionId）
    sessionId: sqliteCore.text("session_id"),
    // 域名（用于快速域名统计）
    domain: sqliteCore.text("domain")
  },
  (table) => ({
    // 索引优化
    urlIdx: sqliteCore.index("history_url_idx").on(table.url),
    timestampIdx: sqliteCore.index("history_timestamp_idx").on(table.timestamp),
    titleIdx: sqliteCore.index("history_title_idx").on(table.title),
    domainIdx: sqliteCore.index("history_domain_idx").on(table.domain),
    lastVisitIdx: sqliteCore.index("history_last_visit_idx").on(table.lastVisitTime),
    visitCountIdx: sqliteCore.index("history_visit_count_idx").on(table.visitCount)
  })
);
const downloads = sqliteCore.sqliteTable(
  "downloads",
  {
    // 主键
    id: sqliteCore.text("id").primaryKey(),
    // 下载 URL
    url: sqliteCore.text("url").notNull(),
    // 文件名
    filename: sqliteCore.text("filename").notNull(),
    // 保存路径
    savePath: sqliteCore.text("save_path").notNull(),
    // 文件大小（字节）
    fileSize: sqliteCore.integer("file_size").notNull().default(0),
    // 已下载字节数
    downloadedBytes: sqliteCore.integer("downloaded_bytes").notNull().default(0),
    // 下载状态：'progressing' | 'completed' | 'paused' | 'cancelled' | 'failed'
    state: sqliteCore.text("state").notNull(),
    // MIME 类型
    mimeType: sqliteCore.text("mime_type"),
    // 开始时间（Unix timestamp）
    startTime: sqliteCore.integer("start_time", { mode: "timestamp" }).notNull().default(drizzleOrm.sql`(unixepoch())`),
    // 结束时间（Unix timestamp）
    endTime: sqliteCore.integer("end_time", { mode: "timestamp" }),
    // 错误信息（仅在失败时）
    error: sqliteCore.text("error"),
    // 是否支持断点续传
    canResume: sqliteCore.integer("can_resume", { mode: "boolean" }).notNull().default(false)
  },
  (table) => ({
    // 索引优化
    stateIdx: sqliteCore.index("downloads_state_idx").on(table.state),
    startTimeIdx: sqliteCore.index("downloads_start_time_idx").on(table.startTime),
    filenameIdx: sqliteCore.index("downloads_filename_idx").on(table.filename)
  })
);
const schema = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, bookmarks, downloads, history }, Symbol.toStringTag, { value: "Module" }));
let dbInstance = null;
let libsqlClient = null;
function getDatabasePath() {
  const userDataPath = electron.app.getPath("userData");
  const dbPath = path__namespace.join(userDataPath, "database.db");
  const dbDir = path__namespace.dirname(dbPath);
  if (!fs__namespace.existsSync(dbDir)) {
    fs__namespace.mkdirSync(dbDir, { recursive: true });
  }
  return dbPath;
}
function initializeDatabase$1() {
  if (dbInstance) {
    console.log("[Database] Database already initialized");
    return dbInstance;
  }
  try {
    const dbPath = getDatabasePath();
    libsqlClient = client$1.createClient({
      url: `file:${dbPath}`
    });
    dbInstance = libsql.drizzle(libsqlClient, { schema });
    libsqlClient.executeMultiple(
      `
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA temp_store = MEMORY;
      PRAGMA mmap_size = 30000000000;
      PRAGMA page_size = 4096;
      PRAGMA cache_size = -64000;
    `
    ).catch((err) => {
      console.warn("[Database] PRAGMA optimization failed (may not be critical):", err);
    });
    return dbInstance;
  } catch (error) {
    console.error("[Database] Failed to initialize database:", error);
    throw error;
  }
}
function getDatabase() {
  if (!dbInstance) {
    return initializeDatabase$1();
  }
  return dbInstance;
}
function getLibsqlClient() {
  if (!libsqlClient) {
    initializeDatabase$1();
  }
  if (!libsqlClient) {
    throw new Error("Libsql client not initialized");
  }
  return libsqlClient;
}
async function closeDatabase() {
  try {
    if (libsqlClient) {
      console.log("[Database] Closing database connection...");
      await libsqlClient.close();
      libsqlClient = null;
      dbInstance = null;
      console.log("[Database] Database closed successfully");
    }
  } catch (error) {
    console.error("[Database] Error closing database:", error);
  }
}
const client = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({ __proto__: null, closeDatabase, getDatabase, getDatabasePath, getLibsqlClient, initializeDatabase: initializeDatabase$1 }, Symbol.toStringTag, { value: "Module" }));
class BookmarkRepository {
  db = getDatabase();
  /**
   * 获取所有书签（包括文件夹结构）
   */
  async getAll() {
    return await this.db.select().from(bookmarks).orderBy(drizzleOrm.asc(bookmarks.index));
  }
  /**
   * 根据父文件夹 ID 获取子项
   */
  async getByParentId(parentId) {
    if (parentId === null) {
      return await this.db.select().from(bookmarks).where(drizzleOrm.sql`${bookmarks.parentId} IS NULL`).orderBy(drizzleOrm.asc(bookmarks.index));
    }
    return await this.db.select().from(bookmarks).where(drizzleOrm.eq(bookmarks.parentId, parentId)).orderBy(drizzleOrm.asc(bookmarks.index));
  }
  /**
   * 根据 ID 获取单个书签
   */
  async getById(id) {
    const results = await this.db.select().from(bookmarks).where(drizzleOrm.eq(bookmarks.id, id)).limit(1);
    return results[0];
  }
  /**
   * 获取所有 URL 类型的书签（不包括文件夹）
   */
  async getAllUrls() {
    return await this.db.select().from(bookmarks).where(drizzleOrm.eq(bookmarks.type, "url")).orderBy(drizzleOrm.desc(bookmarks.createdAt));
  }
  /**
   * 搜索书签（按标题和 URL）
   */
  async search(keyword) {
    const searchPattern = `%${keyword}%`;
    return await this.db.select().from(bookmarks).where(
      drizzleOrm.or(
        drizzleOrm.like(bookmarks.title, searchPattern),
        drizzleOrm.like(bookmarks.url, searchPattern),
        drizzleOrm.like(bookmarks.notes, searchPattern)
      )
    ).orderBy(drizzleOrm.desc(bookmarks.createdAt)).limit(100);
  }
  /**
   * 根据 URL 查找书签（检查是否存在）
   */
  async findByUrl(url) {
    const results = await this.db.select().from(bookmarks).where(drizzleOrm.eq(bookmarks.url, url)).limit(1);
    return results[0];
  }
  /**
   * 添加书签
   */
  async add(bookmark) {
    const result = await this.db.insert(bookmarks).values(bookmark).returning();
    return result[0];
  }
  /**
   * 批量添加书签
   */
  async addMany(bookmarkList) {
    if (bookmarkList.length === 0) return [];
    return await this.db.insert(bookmarks).values(bookmarkList).returning();
  }
  /**
   * 更新书签
   */
  async update(id, updates) {
    const result = await this.db.update(bookmarks).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(drizzleOrm.eq(bookmarks.id, id)).returning();
    return result[0];
  }
  /**
   * 移动书签到新的父文件夹和位置
   */
  async move(id, targetParentId, newIndex) {
    try {
      const bookmark = await this.getById(id);
      if (!bookmark) return false;
      await this.db.update(bookmarks).set({
        parentId: targetParentId,
        index: newIndex,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(drizzleOrm.eq(bookmarks.id, id));
      return true;
    } catch (error) {
      console.error("[BookmarkRepository] Move failed:", error);
      return false;
    }
  }
  /**
   * 删除书签（包括其子项）
   */
  async delete(id) {
    try {
      const children = await this.getByParentId(id);
      for (const child of children) {
        await this.delete(child.id);
      }
      await this.db.delete(bookmarks).where(drizzleOrm.eq(bookmarks.id, id));
      return true;
    } catch (error) {
      console.error("[BookmarkRepository] Delete failed:", error);
      return false;
    }
  }
  /**
   * 批量删除书签
   */
  async deleteMany(ids) {
    let deletedCount = 0;
    for (const id of ids) {
      const success = await this.delete(id);
      if (success) deletedCount++;
    }
    return deletedCount;
  }
  /**
   * 清空所有书签
   */
  async deleteAll() {
    await this.db.delete(bookmarks);
  }
  /**
   * 获取书签统计信息
   */
  async getStats() {
    const total = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(bookmarks);
    const urls = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(bookmarks).where(drizzleOrm.eq(bookmarks.type, "url"));
    const folders = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(bookmarks).where(drizzleOrm.eq(bookmarks.type, "folder"));
    return {
      totalCount: Number(total[0].count),
      urlCount: Number(urls[0].count),
      folderCount: Number(folders[0].count)
    };
  }
  /**
   * 将数据库书签转换为共享类型（用于兼容旧代码）
   */
  convertToSharedBookmark(bookmark) {
    const shared = {
      id: bookmark.id,
      type: bookmark.type,
      title: bookmark.title,
      dateAdded: bookmark.createdAt.getTime()
    };
    if (bookmark.url) shared.url = bookmark.url;
    if (bookmark.parentId) shared.parentId = bookmark.parentId;
    return shared;
  }
  /**
   * 递归构建书签树结构
   */
  async buildTree(parentId = null) {
    const items = await this.getByParentId(parentId);
    const result = [];
    for (const item of items) {
      const shared = this.convertToSharedBookmark(item);
      if (item.type === "folder") {
        shared.children = await this.buildTree(item.id);
      }
      result.push(shared);
    }
    return result;
  }
}
const MAX_HISTORY_ENTRIES = 1e4;
class HistoryRepository {
  db = getDatabase();
  /**
   * 添加历史记录（如果 URL 已存在则更新）
   */
  async add(entry) {
    const existing = await this.findByUrl(entry.url);
    if (existing) {
      const updated = await this.db.update(history).set({
        title: entry.title,
        favicon: entry.favicon,
        timestamp: entry.timestamp || /* @__PURE__ */ new Date(),
        lastVisitTime: /* @__PURE__ */ new Date(),
        visitCount: existing.visitCount + 1
      }).where(drizzleOrm.eq(history.id, existing.id)).returning();
      return updated[0];
    }
    const newEntry = {
      ...entry,
      visitCount: 1,
      lastVisitTime: entry.timestamp || /* @__PURE__ */ new Date()
    };
    const inserted = await this.db.insert(history).values(newEntry).returning();
    await this.enforceLimit();
    return inserted[0];
  }
  /**
   * 强制执行条数限制（FIFO）
   */
  async enforceLimit() {
    const countResult = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history);
    const count = Number(countResult[0].count);
    if (count > MAX_HISTORY_ENTRIES) {
      const excess = count - MAX_HISTORY_ENTRIES;
      const oldestRecords = await this.db.select().from(history).orderBy(drizzleOrm.asc(history.timestamp)).limit(excess);
      for (const record of oldestRecords) {
        await this.db.delete(history).where(drizzleOrm.eq(history.id, record.id));
      }
      console.log(`[HistoryRepository] Removed ${excess} oldest records to maintain limit`);
    }
  }
  /**
   * 根据 URL 查找历史记录
   */
  async findByUrl(url) {
    const results = await this.db.select().from(history).where(drizzleOrm.eq(history.url, url)).limit(1);
    return results[0];
  }
  /**
   * 获取所有历史记录（按时间倒序）
   */
  async getAll(limit = 1e3) {
    return await this.db.select().from(history).orderBy(drizzleOrm.desc(history.timestamp)).limit(limit);
  }
  /**
   * 搜索历史记录
   */
  async search(keyword, limit = 100) {
    const searchPattern = `%${keyword}%`;
    return await this.db.select().from(history).where(drizzleOrm.or(drizzleOrm.like(history.title, searchPattern), drizzleOrm.like(history.url, searchPattern))).orderBy(drizzleOrm.desc(history.timestamp)).limit(limit);
  }
  /**
   * 按时间范围获取历史记录
   */
  async getByTimeRange(startTime, endTime) {
    return await this.db.select().from(history).where(drizzleOrm.between(history.timestamp, startTime, endTime)).orderBy(drizzleOrm.desc(history.timestamp));
  }
  /**
   * 根据域名获取历史记录
   */
  async getByDomain(domain, limit = 100) {
    return await this.db.select().from(history).where(drizzleOrm.eq(history.domain, domain)).orderBy(drizzleOrm.desc(history.timestamp)).limit(limit);
  }
  /**
   * 删除单个历史记录
   */
  async delete(id) {
    try {
      await this.db.delete(history).where(drizzleOrm.eq(history.id, id));
      return true;
    } catch (error) {
      console.error("[HistoryRepository] Delete failed:", error);
      return false;
    }
  }
  /**
   * 批量删除历史记录
   */
  async deleteMany(ids) {
    let deletedCount = 0;
    for (const id of ids) {
      const success = await this.delete(id);
      if (success) deletedCount++;
    }
    return deletedCount;
  }
  /**
   * 按 URL 删除历史记录
   */
  async deleteByUrl(url) {
    try {
      await this.db.delete(history).where(drizzleOrm.eq(history.url, url));
      return true;
    } catch (error) {
      console.error("[HistoryRepository] Delete by URL failed:", error);
      return false;
    }
  }
  /**
   * 按时间范围删除历史记录
   */
  async deleteByTimeRange(range) {
    try {
      let startTime;
      const endTime = /* @__PURE__ */ new Date();
      if (range === "all") {
        const countBefore = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history);
        await this.db.delete(history);
        return Number(countBefore[0].count);
      } else if (range === "today") {
        startTime = /* @__PURE__ */ new Date();
        startTime.setHours(0, 0, 0, 0);
      } else if (range === "yesterday") {
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        startTime = yesterday;
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        const toDelete2 = await this.db.select().from(history).where(drizzleOrm.between(history.timestamp, startTime, yesterdayEnd));
        for (const record of toDelete2) {
          await this.db.delete(history).where(drizzleOrm.eq(history.id, record.id));
        }
        return toDelete2.length;
      } else if (range === "last7days") {
        startTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3);
      } else if (range === "thisMonth") {
        startTime = /* @__PURE__ */ new Date();
        startTime.setDate(1);
        startTime.setHours(0, 0, 0, 0);
      } else if (range === "lastMonth") {
        const lastMonth = /* @__PURE__ */ new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setDate(1);
        lastMonth.setHours(0, 0, 0, 0);
        startTime = lastMonth;
        const lastMonthEnd = new Date(lastMonth);
        lastMonthEnd.setMonth(lastMonthEnd.getMonth() + 1);
        lastMonthEnd.setDate(0);
        lastMonthEnd.setHours(23, 59, 59, 999);
        const toDelete2 = await this.db.select().from(history).where(drizzleOrm.between(history.timestamp, startTime, lastMonthEnd));
        for (const record of toDelete2) {
          await this.db.delete(history).where(drizzleOrm.eq(history.id, record.id));
        }
        return toDelete2.length;
      } else if (typeof range === "object" && "start" in range) {
        startTime = new Date(range.start);
        const customEnd = new Date(range.end);
        const toDelete2 = await this.db.select().from(history).where(drizzleOrm.between(history.timestamp, startTime, customEnd));
        for (const record of toDelete2) {
          await this.db.delete(history).where(drizzleOrm.eq(history.id, record.id));
        }
        return toDelete2.length;
      } else {
        return 0;
      }
      const toDelete = await this.db.select().from(history).where(drizzleOrm.between(history.timestamp, startTime, endTime));
      for (const record of toDelete) {
        await this.db.delete(history).where(drizzleOrm.eq(history.id, record.id));
      }
      return toDelete.length;
    } catch (error) {
      console.error("[HistoryRepository] Delete by time range failed:", error);
      return 0;
    }
  }
  /**
   * 清空所有历史记录
   */
  async deleteAll() {
    await this.db.delete(history);
  }
  /**
   * 获取历史记录统计信息
   */
  async getStats() {
    const totalResult = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history);
    const total = Number(totalResult[0].count);
    const now = Date.now();
    const startOfToday = /* @__PURE__ */ new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const hasToday = (await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.gt(history.timestamp, startOfToday))).length > 0;
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const hasYesterday = (await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.between(history.timestamp, startOfYesterday, startOfToday))).length > 0;
    const startOfLast7Days = new Date(now - 7 * 24 * 60 * 60 * 1e3);
    const hasLast7Days = (await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.gt(history.timestamp, startOfLast7Days))).length > 0;
    const startOfThisMonth = /* @__PURE__ */ new Date();
    startOfThisMonth.setDate(1);
    startOfThisMonth.setHours(0, 0, 0, 0);
    const hasThisMonth = (await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.gt(history.timestamp, startOfThisMonth))).length > 0;
    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    const hasLastMonth = (await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.between(history.timestamp, startOfLastMonth, startOfThisMonth))).length > 0;
    return {
      total,
      hasToday,
      hasYesterday,
      hasLast7Days,
      hasThisMonth,
      hasLastMonth
    };
  }
  /**
   * 获取今天的访问统计
   */
  async getTodayStats() {
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const visitsResult = await this.db.select({ count: drizzleOrm.sql`count(*)` }).from(history).where(drizzleOrm.gt(history.timestamp, today));
    const uniqueUrlsResult = await this.db.select({ count: drizzleOrm.sql`count(distinct ${history.url})` }).from(history).where(drizzleOrm.gt(history.timestamp, today));
    return {
      visits: Number(visitsResult[0].count),
      uniqueUrls: Number(uniqueUrlsResult[0].count)
    };
  }
  /**
   * 将数据库历史记录转换为共享类型（用于兼容旧代码）
   */
  convertToSharedHistory(entry) {
    return {
      id: entry.id,
      url: entry.url,
      title: entry.title,
      timestamp: entry.timestamp.getTime(),
      visitCount: entry.visitCount
    };
  }
}
class DownloadRepository {
  db = getDatabase();
  /**
   * 将数据库记录转换为 DownloadItem
   */
  toDownloadItem(record) {
    return {
      id: record.id,
      url: record.url,
      filename: record.filename,
      savePath: record.savePath,
      fileSize: record.fileSize,
      downloadedBytes: record.downloadedBytes,
      state: record.state,
      mimeType: record.mimeType,
      startTime: record.startTime ? new Date(record.startTime).getTime() : Date.now(),
      endTime: record.endTime ? new Date(record.endTime).getTime() : null,
      error: record.error,
      canResume: record.canResume
    };
  }
  /**
   * 添加下载记录
   */
  async add(item) {
    const newRecord = {
      id: item.id,
      url: item.url,
      filename: item.filename,
      savePath: item.savePath,
      fileSize: item.fileSize,
      downloadedBytes: item.downloadedBytes,
      state: item.state,
      mimeType: item.mimeType,
      error: item.error,
      canResume: item.canResume
    };
    const inserted = await this.db.insert(downloads).values(newRecord).returning();
    return this.toDownloadItem(inserted[0]);
  }
  /**
   * 获取所有下载记录（按开始时间倒序）
   */
  async getAll() {
    const records = await this.db.select().from(downloads).orderBy(drizzleOrm.desc(downloads.startTime));
    return records.map((r) => this.toDownloadItem(r));
  }
  /**
   * 根据 ID 获取下载记录
   */
  async getById(id) {
    const records = await this.db.select().from(downloads).where(drizzleOrm.eq(downloads.id, id)).limit(1);
    return records.length > 0 ? this.toDownloadItem(records[0]) : null;
  }
  /**
   * 根据状态获取下载记录
   */
  async getByState(state) {
    const records = await this.db.select().from(downloads).where(drizzleOrm.eq(downloads.state, state)).orderBy(drizzleOrm.desc(downloads.startTime));
    return records.map((r) => this.toDownloadItem(r));
  }
  /**
   * 更新下载记录
   */
  async update(id, updates) {
    const updateData = {};
    if (updates.downloadedBytes !== void 0) {
      updateData.downloadedBytes = updates.downloadedBytes;
    }
    if (updates.fileSize !== void 0) {
      updateData.fileSize = updates.fileSize;
    }
    if (updates.state !== void 0) {
      updateData.state = updates.state;
    }
    if (updates.endTime !== void 0) {
      updateData.endTime = updates.endTime ? new Date(updates.endTime) : null;
    }
    if (updates.error !== void 0) {
      updateData.error = updates.error;
    }
    if (updates.canResume !== void 0) {
      updateData.canResume = updates.canResume;
    }
    const updated = await this.db.update(downloads).set(updateData).where(drizzleOrm.eq(downloads.id, id)).returning();
    return updated.length > 0 ? this.toDownloadItem(updated[0]) : null;
  }
  /**
   * 删除下载记录
   */
  async remove(id) {
    const result = await this.db.delete(downloads).where(drizzleOrm.eq(downloads.id, id));
    return result.changes > 0;
  }
  /**
   * 批量删除下载记录
   */
  async removeBatch(ids) {
    if (ids.length === 0) return 0;
    const result = await this.db.delete(downloads).where(drizzleOrm.inArray(downloads.id, ids));
    return result.changes;
  }
  /**
   * 清空所有下载记录
   */
  async clearAll() {
    const result = await this.db.delete(downloads);
    return result.changes;
  }
  /**
   * 获取下载统计信息
   */
  async getStats() {
    const records = await this.db.select().from(downloads);
    const stats = {
      total: records.length,
      progressing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    };
    records.forEach((record) => {
      switch (record.state) {
        case "progressing":
        case "paused":
          stats.progressing++;
          break;
        case "completed":
          stats.completed++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "cancelled":
          stats.cancelled++;
          break;
      }
    });
    return stats;
  }
  /**
   * 获取进行中的下载（包括暂停的）
   */
  async getProgressing() {
    const records = await this.db.select().from(downloads).where(
      drizzleOrm.sql`${downloads.state} IN ('progressing', 'paused')`
    ).orderBy(drizzleOrm.desc(downloads.startTime));
    return records.map((r) => this.toDownloadItem(r));
  }
}
let bookmarkRepository = null;
let historyRepository = null;
let downloadRepository = null;
async function initializeDatabase() {
  try {
    const db = initializeDatabase$1();
    const migrationsPath = path__namespace.join(__dirname, "migrations");
    if (fs__namespace.existsSync(migrationsPath)) {
      console.log(`[Database] Running migrations from: ${migrationsPath}`);
      await migrator.migrate(db, { migrationsFolder: migrationsPath });
      console.log("[Database] Migrations completed successfully");
    } else {
      await createTablesDirectly();
    }
    bookmarkRepository = new BookmarkRepository();
    historyRepository = new HistoryRepository();
    downloadRepository = new DownloadRepository();
  } catch (error) {
    console.error("[Database] Initialization failed:", error);
    throw error;
  }
}
async function createTablesDirectly() {
  const { getLibsqlClient: getLibsqlClient2 } = await Promise.resolve().then(() => client);
  const client$12 = getLibsqlClient2();
  await client$12.executeMultiple(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('url', 'folder')),
      title TEXT NOT NULL,
      url TEXT,
      favicon TEXT,
      parent_id TEXT,
      \`index\` INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      source TEXT,
      tags TEXT,
      notes TEXT
    );

    CREATE INDEX IF NOT EXISTS bookmarks_url_idx ON bookmarks(url);
    CREATE INDEX IF NOT EXISTS bookmarks_parent_id_idx ON bookmarks(parent_id);
    CREATE INDEX IF NOT EXISTS bookmarks_type_idx ON bookmarks(type);
    CREATE INDEX IF NOT EXISTS bookmarks_title_idx ON bookmarks(title);
    CREATE INDEX IF NOT EXISTS bookmarks_created_at_idx ON bookmarks(created_at);

    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      favicon TEXT,
      timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
      visit_count INTEGER NOT NULL DEFAULT 1,
      last_visit_time INTEGER NOT NULL DEFAULT (unixepoch()),
      transition TEXT,
      session_id TEXT,
      domain TEXT
    );

    CREATE INDEX IF NOT EXISTS history_url_idx ON history(url);
    CREATE INDEX IF NOT EXISTS history_timestamp_idx ON history(timestamp);
    CREATE INDEX IF NOT EXISTS history_title_idx ON history(title);
    CREATE INDEX IF NOT EXISTS history_domain_idx ON history(domain);
    CREATE INDEX IF NOT EXISTS history_last_visit_idx ON history(last_visit_time);
    CREATE INDEX IF NOT EXISTS history_visit_count_idx ON history(visit_count);

    CREATE TABLE IF NOT EXISTS downloads (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      filename TEXT NOT NULL,
      save_path TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      downloaded_bytes INTEGER NOT NULL DEFAULT 0,
      state TEXT NOT NULL,
      mime_type TEXT,
      start_time INTEGER NOT NULL DEFAULT (unixepoch()),
      end_time INTEGER,
      error TEXT,
      can_resume INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS downloads_state_idx ON downloads(state);
    CREATE INDEX IF NOT EXISTS downloads_start_time_idx ON downloads(start_time);
    CREATE INDEX IF NOT EXISTS downloads_filename_idx ON downloads(filename);
  `);
}
function getBookmarkRepository() {
  if (!bookmarkRepository) {
    bookmarkRepository = new BookmarkRepository();
  }
  return bookmarkRepository;
}
function getHistoryRepository() {
  if (!historyRepository) {
    historyRepository = new HistoryRepository();
  }
  return historyRepository;
}
function getDownloadRepository() {
  if (!downloadRepository) {
    downloadRepository = new DownloadRepository();
  }
  return downloadRepository;
}
async function closeDatabaseConnection() {
  await closeDatabase();
  bookmarkRepository = null;
  historyRepository = null;
  downloadRepository = null;
}
exports.closeDatabaseConnection = closeDatabaseConnection;
exports.getBookmarkRepository = getBookmarkRepository;
exports.getDatabase = getDatabase;
exports.getDatabasePath = getDatabasePath;
exports.getDownloadRepository = getDownloadRepository;
exports.getHistoryRepository = getHistoryRepository;
exports.initializeDatabase = initializeDatabase;
