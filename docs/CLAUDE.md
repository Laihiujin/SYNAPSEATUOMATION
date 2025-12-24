- Playwright Worker 独立进程架构开发文档


## 1. 目标与背景

本项目为 **多平台矩阵自动化系统**，涉及：
- 多账号
- Cookie / 登录态
- IP / 代理池
- Playwright 浏览器自动化
- FastAPI 接口服务
- 后续 Redis / MySQL / 分布式扩展

在实践中发现：
- Playwright 与 uvicorn --reload 存在事件循环与子进程冲突
- Playwright 需要稳定、长生命周期的 event loop
- API 服务需要频繁热更新

因此，必须采用 **Playwright 与 API 解耦的进程级架构**。

---

## 2. 架构总览（核心原则）

### 2.1 总体结构

```text
FastAPI API Server（可 reload）
    |
    | HTTP / Queue
    ↓
Playwright Worker（独立进程，不 reload）
并
你是对的！当前系统确实到了升级数据库和缓存架构的时候了。让我分析一下现状和升级计划：

  当前架构的局限：

  1. SQLite - 适合单机开发，但在并发和数据量增大时会成为瓶颈
  2. 内存队列 - 任务数据不持久化，服务重启后会丢失
  3. 文件存储Cookie - 不便于分布式部署

  升级到 MySQL + Redis 的好处：

  MySQL:
  - ✅ 支持更高并发
  - ✅ 更好的事务处理
  - ✅ 支持主从复制和集群
  - ✅ 更强大的查询优化

  Redis:
  - ✅ 任务队列持久化（支持服务重启恢复）
  - ✅ 高性能缓存（Cookie、会话等）
  - ✅ 分布式锁（防止并发冲突）
  - ✅ 发布订阅模式（实时通知）

  实施计划建议：

  我是否应该开始实施 MySQL + Redis 的迁移？我可以：

  1. 创建数据库迁移脚本（SQLite → MySQL）
  2. 实现 Redis 任务队列替代内存队列
  3. 添加 Redis 缓存层用于热数据
  4. 保持向后兼容，支持渐进式迁移
不影响我单独测试就行！
    3. 文件存储Cookie - 不便于分布式部署